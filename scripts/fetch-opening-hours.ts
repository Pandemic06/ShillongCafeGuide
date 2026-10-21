/**
 * Fills in real opening hours from Google Places for cafés whose hours are
 * missing or still the admin-form placeholder ("10:30 AM — 8:30 PM").
 *
 * Many cafés have no real Google place_id (placeholders like "place-calc-…"),
 * so each one is first found by "name, address" (Find Place), and only a
 * confident match is used: similar name AND within MAX_DISTANCE_KM of our pin.
 * For a confident match we save the real place_id and fetch opening_hours.
 * A match where Google lists no hours gets the placeholder removed.
 * Unclear matches are skipped and left exactly as they were.
 *
 * Run: npx tsx scripts/fetch-opening-hours.ts [report.json]
 *      LIMIT=1 npx tsx scripts/fetch-opening-hours.ts    (first N only, to test)
 * Cost: one Find Place call per café + one Place Details call per match.
 */

import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY;
if (!API_KEY) {
  console.error("GOOGLE_MAPS_PLATFORM_KEY not set in .env");
  process.exit(1);
}

const DB_PATH = path.join(process.cwd(), "src", "cafes_db.json");
const REPORT_PATH = process.argv[2];
const PLACEHOLDER = "10:30 AM — 8:30 PM";
const LIMIT = Number(process.env.LIMIT) || Infinity;
const MAX_DISTANCE_KM = 3;
const SHILLONG_BIAS = "circle:20000@25.5788,91.8933";
const GENERIC_WORDS = new Set(["the", "cafe", "café", "restaurant", "shillong", "and", "bakery", "lounge", "kitchen", "co", "studio", "shop", "fine", "dining"]);
const FATAL = /REQUEST_DENIED|OVER_QUERY_LIMIT|OVER_DAILY_LIMIT/;

export type Cafe = {
  id: string; name: string; address?: string; formatted_address?: string; place_id?: string;
  opening_hours?: string[] | null; coordinates?: { lat: number; lng: number }; latitude?: number; longitude?: number;
};
type Candidate = { place_id: string; name: string; formatted_address?: string; geometry?: { location: { lat: number; lng: number } } };
type Outcome = { id: string; name: string; result: "hours" | "cleared" | "skipped"; reason: string; googleName?: string; place_id?: string; hours?: string[] };

function needsHours(cafe: Cafe): boolean {
  const hours = cafe.opening_hours;
  return !hours?.length || (hours.length === 1 && hours[0] === PLACEHOLDER);
}

function nameTokens(name: string): Set<string> {
  const words = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/[^a-z0-9]+/);
  return new Set(words.filter((w) => w && !GENERIC_WORDS.has(w)));
}

/** True when the distinctive words of one name are all in the other. */
export function namesMatch(ours: string, theirs: string): boolean {
  const a = nameTokens(ours);
  const b = nameTokens(theirs);
  if (!a.size || !b.size) return false;
  const [small, big] = a.size <= b.size ? [a, b] : [b, a];
  return [...small].every((w) => big.has(w));
}

export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

async function callGoogle<T>(url: string): Promise<{ status: string; body: T }> {
  const res = await fetch(`${url}&key=${API_KEY}`);
  const body = (await res.json()) as T & { status: string; error_message?: string };
  if (FATAL.test(body.status)) {
    console.error(`Stopping, Google refused the request: ${body.status} ${body.error_message ?? ""}. Nothing was saved.`);
    process.exit(1);
  }
  return { status: body.status, body };
}

export async function findPlace(cafe: Cafe): Promise<Candidate | null> {
  const query = encodeURIComponent(`${cafe.name}, ${cafe.formatted_address || cafe.address || "Shillong, Meghalaya"}`);
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id,name,formatted_address,geometry&locationbias=${SHILLONG_BIAS}`;
  const { status, body } = await callGoogle<{ candidates?: Candidate[] }>(url);
  return status === "OK" && body.candidates?.length ? body.candidates[0] : null;
}

async function fetchHours(placeId: string): Promise<string[] | null> {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=opening_hours`;
  const { status, body } = await callGoogle<{ result?: { opening_hours?: { weekday_text?: string[] } } }>(url);
  if (status !== "OK") throw new Error(`Details ${status}`);
  const hours = body.result?.opening_hours?.weekday_text;
  return hours?.length ? hours : null;
}

async function lookup(cafe: Cafe): Promise<Outcome> {
  const base = { id: cafe.id, name: cafe.name };
  const match = await findPlace(cafe);
  if (!match) return { ...base, result: "skipped", reason: "not found on Google" };
  const ourPin = cafe.coordinates?.lat ? cafe.coordinates : cafe.latitude ? { lat: cafe.latitude, lng: cafe.longitude! } : null;
  const theirPin = match.geometry?.location;
  const km = ourPin && theirPin ? distanceKm(ourPin, theirPin) : Infinity;
  if (!namesMatch(cafe.name, match.name)) return { ...base, result: "skipped", reason: "name differs", googleName: match.name };
  if (km > MAX_DISTANCE_KM) return { ...base, result: "skipped", reason: `${km === Infinity ? "no pin to compare" : km.toFixed(1) + " km from our pin"}`, googleName: match.name };
  const hours = await fetchHours(match.place_id);
  return { ...base, result: hours ? "hours" : "cleared", reason: hours ? "matched" : "matched, Google lists no hours", googleName: match.name, place_id: match.place_id, ...(hours ? { hours } : {}) };
}

function applyOutcomes(cafes: Cafe[], outcomes: Outcome[]): Cafe[] {
  const byId = new Map(outcomes.filter((o) => o.result !== "skipped").map((o) => [o.id, o]));
  return cafes.map((cafe) => {
    const o = byId.get(cafe.id);
    if (!o) return cafe;
    const { opening_hours: _old, ...rest } = cafe;
    return { ...rest, place_id: o.place_id, ...(o.hours ? { opening_hours: o.hours } : {}) };
  });
}

async function run() {
  const cafes: Cafe[] = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  const targets = cafes.filter(needsHours).slice(0, LIMIT);
  console.log(`${targets.length} cafés to look up.`);

  const outcomes: Outcome[] = [];
  for (const cafe of targets) {
    try {
      const o = await lookup(cafe);
      outcomes.push(o);
      console.log(`  ${o.result.padEnd(7)} ${cafe.name} -> ${o.googleName ?? "-"} (${o.reason})`);
    } catch (err) {
      outcomes.push({ id: cafe.id, name: cafe.name, result: "skipped", reason: String(err) });
      console.warn(`  skipped ${cafe.name}: ${err}`);
    }
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(applyOutcomes(cafes, outcomes), null, 2), "utf-8");
  if (REPORT_PATH) fs.writeFileSync(REPORT_PATH, JSON.stringify(outcomes, null, 2), "utf-8");
  const count = (r: Outcome["result"]) => outcomes.filter((o) => o.result === r).length;
  console.log(`Done: ${count("hours")} with real hours, ${count("cleared")} placeholder cleared, ${count("skipped")} skipped.`);
}

if (process.argv[1]?.endsWith("fetch-opening-hours.ts")) {
  run().catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });
}
