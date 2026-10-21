/**
 * Replaces placeholder contact details with real ones from Google Places.
 *
 * Targets cafés with a fake phone number, plus cafés with no phone that have a
 * Google place_id. For each:
 *   - place_id that Google accepts AND whose Google name matches ours → one
 *     Details call (phone, website, rating, review count).
 *   - invalid/fake "ChIJ…" place_id → Find Place by name + address with the
 *     same confidence rules as fetch-opening-hours.ts, then Details.
 *   - "place-calc-…" place_id (never matched on Google) → no lookup.
 * Fake values (placeholder phone, bare instagram.com website, 12/25 review
 * counts) are removed when Google has nothing better. Real values are kept.
 *
 * Run: npx tsx scripts/fetch-contact-details.ts [report.json]
 * Stops before spending more than MAX_COST_USD (legacy per-call list prices).
 */

import fs from "fs";
import path from "path";
import { findPlace, namesMatch, distanceKm, type Cafe as BaseCafe } from "./fetch-opening-hours";

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY;
const DB_PATH = path.join(process.cwd(), "src", "cafes_db.json");
const REPORT_PATH = process.argv[2];
const FAKE_PHONES = new Set(["+91 364 123 4567", "+91 98765 43210"]);
const FAKE_WEBSITES = new Set(["https://instagram.com/", "https://instagram.com"]);
const FAKE_REVIEW_COUNTS = new Set([12, 25]);
const MAX_COST_USD = Number(process.env.MAX_COST_USD ?? 2.5);
const COST = { findPlace: 0.017, details: 0.025 }; // Details: basic + contact + atmosphere
const MAX_DISTANCE_KM = 3;

type Cafe = BaseCafe & { phone_number?: string; website?: string; rating?: number; user_ratings_total?: number };
type Details = { name: string; international_phone_number?: string; website?: string; rating?: number; user_ratings_total?: number };
type Outcome = { id: string; name: string; result: "updated" | "fakes removed" | "skipped"; how: string; phone?: string; website?: string; rating?: string };

let spent = 0;
function charge(amount: number) {
  if (spent + amount > MAX_COST_USD) {
    throw new Error(`COST_CAP: next call would pass $${MAX_COST_USD}`);
  }
  spent += amount;
}

async function getDetails(placeId: string): Promise<Details | null> {
  charge(COST.details);
  const fields = "name,international_phone_number,website,rating,user_ratings_total";
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=${fields}&key=${API_KEY}`;
  const body = (await (await fetch(url)).json()) as { status: string; error_message?: string; result?: Details };
  if (/REQUEST_DENIED|OVER_QUERY_LIMIT|OVER_DAILY_LIMIT/.test(body.status)) {
    throw new Error(`FATAL: ${body.status} ${body.error_message ?? ""}`);
  }
  if (body.status === "INVALID_REQUEST" || body.status === "NOT_FOUND") spent -= COST.details; // rejected calls aren't billed
  return body.status === "OK" && body.result ? body.result : null;
}

async function confidentSearch(cafe: Cafe): Promise<string | null> {
  charge(COST.findPlace);
  const match = await findPlace(cafe);
  if (!match || !namesMatch(cafe.name, match.name)) return null;
  const ourPin = cafe.coordinates?.lat ? cafe.coordinates : cafe.latitude ? { lat: cafe.latitude, lng: cafe.longitude! } : null;
  const theirPin = match.geometry?.location;
  if (!ourPin || !theirPin || distanceKm(ourPin, theirPin) > MAX_DISTANCE_KM) return null;
  return match.place_id;
}

/** Like withoutFakes, and also drops the rating: with no Google match it did not come from Google. */
function withoutUnverified(cafe: Cafe): Cafe {
  const { rating: _unverified, ...rest } = withoutFakes(cafe);
  return rest;
}

/** Removes known placeholder values; leaves real ones untouched. */
function withoutFakes(cafe: Cafe): Cafe {
  const { phone_number, website, user_ratings_total, ...rest } = cafe;
  return {
    ...rest,
    ...(phone_number && !FAKE_PHONES.has(phone_number) ? { phone_number } : {}),
    ...(website && !FAKE_WEBSITES.has(website) ? { website } : {}),
    ...(user_ratings_total && !FAKE_REVIEW_COUNTS.has(user_ratings_total) ? { user_ratings_total } : {}),
  };
}

function withGoogleDetails(cafe: Cafe, placeId: string, d: Details): Cafe {
  const clean = withoutFakes(cafe);
  return {
    ...clean,
    place_id: placeId,
    ...(d.international_phone_number ? { phone_number: d.international_phone_number } : {}),
    ...(d.website ? { website: d.website } : {}),
    ...(d.rating && d.user_ratings_total ? { rating: d.rating, user_ratings_total: d.user_ratings_total } : {}),
  };
}

async function resolve(cafe: Cafe): Promise<{ cafe: Cafe; outcome: Outcome }> {
  const base = { id: cafe.id, name: cafe.name };
  const placeId = cafe.place_id ?? "";
  if (!placeId || placeId.startsWith("place-calc-")) {
    return { cafe: withoutUnverified(cafe), outcome: { ...base, result: "fakes removed", how: "never matched on Google, no lookup" } };
  }
  let id = placeId;
  let details = await getDetails(id);
  let how = "saved Google ID";
  if (!details || !namesMatch(cafe.name, details.name)) {
    const found = await confidentSearch(cafe);
    if (!found) return { cafe: withoutUnverified(cafe), outcome: { ...base, result: "fakes removed", how: "no confident Google match" } };
    id = found;
    details = await getDetails(id);
    how = "name + address search";
    if (!details) return { cafe: withoutUnverified(cafe), outcome: { ...base, result: "fakes removed", how: "Google details unavailable" } };
  }
  const updated = withGoogleDetails(cafe, id, details);
  return {
    cafe: updated,
    outcome: { ...base, result: "updated", how, phone: updated.phone_number, website: updated.website, rating: updated.rating ? `${updated.rating} (${updated.user_ratings_total})` : undefined },
  };
}

function isTarget(cafe: Cafe): boolean {
  if (cafe.phone_number && FAKE_PHONES.has(cafe.phone_number)) return true;
  return !cafe.phone_number && !!cafe.place_id && !cafe.place_id.startsWith("place-calc-");
}

async function run() {
  const cafes: Cafe[] = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  const targets = new Set(cafes.filter(isTarget).map((c) => c.id));
  console.log(`${targets.size} cafés to fix (cost cap $${MAX_COST_USD}).`);

  const outcomes: Outcome[] = [];
  const updated: Cafe[] = [];
  for (const cafe of cafes) {
    if (!targets.has(cafe.id)) { updated.push(cafe); continue; }
    try {
      const r = await resolve(cafe);
      updated.push(r.cafe);
      outcomes.push(r.outcome);
      console.log(`  ${r.outcome.result.padEnd(13)} ${cafe.name} (${r.outcome.how}) ${r.outcome.phone ?? ""}`);
    } catch (err) {
      if (String(err).includes("FATAL")) {
        console.error(`Stopping, Google refused the request: ${err}. Nothing was saved.`);
        process.exit(1);
      }
      if (String(err).includes("COST_CAP")) {
        console.warn(`Cost cap reached; ${cafe.name} and the rest left unchanged.`);
        updated.push(...cafes.slice(cafes.indexOf(cafe)));
        break;
      }
      updated.push(cafe);
      outcomes.push({ id: cafe.id, name: cafe.name, result: "skipped", how: String(err) });
    }
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(updated, null, 2), "utf-8");
  if (REPORT_PATH) fs.writeFileSync(REPORT_PATH, JSON.stringify(outcomes, null, 2), "utf-8");
  const count = (r: Outcome["result"]) => outcomes.filter((o) => o.result === r).length;
  console.log(`Done: ${count("updated")} updated from Google, ${count("fakes removed")} fakes removed only, ${count("skipped")} skipped. Estimated cost $${spent.toFixed(2)}.`);
}

run().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
