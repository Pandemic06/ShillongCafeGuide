/**
 * Enrich cafes_db.json with real Google Places data:
 * - Verified coordinates
 * - Real photos (up to 5 per cafe)
 * - Rating, review count, price level
 * - Opening hours, phone, website, formatted address
 *
 * Run: npx tsx scripts/enrich-cafes.ts
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

interface PlaceSearchResult {
  place_id: string;
  name: string;
  geometry: { location: { lat: number; lng: number } };
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  photos?: { photo_reference: string; height: number; width: number }[];
}

interface PlaceDetails {
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: { weekday_text: string[] };
  url?: string;
  photos?: { photo_reference: string }[];
  price_level?: number;
  rating?: number;
  user_ratings_total?: number;
  geometry?: { location: { lat: number; lng: number } };
  formatted_address?: string;
}

function getPhotoUrl(photoRef: string, maxWidth = 1200): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoRef}&key=${API_KEY}`;
}

function priceLevelToString(level?: number): string {
  if (level === undefined) return "₹₹";
  const map: Record<number, string> = { 0: "Free", 1: "₹", 2: "₹₹", 3: "₹₹₹", 4: "₹₹₹₹" };
  return map[level] || "₹₹";
}

async function findPlace(cafeName: string, address: string): Promise<PlaceSearchResult | null> {
  const query = encodeURIComponent(`${cafeName} cafe ${address} Shillong Meghalaya`);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json() as { results: PlaceSearchResult[]; status: string };

  if (data.status !== "OK" || !data.results.length) {
    console.warn(`  ⚠ No result for: ${cafeName}`);
    return null;
  }
  return data.results[0];
}

async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  const fields = [
    "formatted_phone_number",
    "website",
    "opening_hours",
    "url",
    "photos",
    "price_level",
    "rating",
    "user_ratings_total",
    "geometry",
    "formatted_address",
  ].join(",");

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json() as { result: PlaceDetails; status: string };

  if (data.status !== "OK") {
    console.warn(`  ⚠ Details failed for place_id: ${placeId}`);
    return null;
  }
  return data.result;
}

async function enrichCafe(cafe: any): Promise<any> {
  console.log(`\nEnriching: ${cafe.name}`);

  const searchResult = await findPlace(cafe.name, cafe.address || "");
  if (!searchResult) return cafe;

  const details = await getPlaceDetails(searchResult.place_id);
  if (!details) return cafe;

  // Build photo URLs — first 5, varied sizes for hero/card/gallery
  const allPhotos = details.photos || searchResult.photos || [];
  const photoUrls = allPhotos.slice(0, 6).map((p, i) =>
    getPhotoUrl(p.photo_reference, i === 0 ? 1200 : 800)
  );

  const enriched = {
    ...cafe,
    // Coordinates from Google (authoritative)
    coordinates: {
      lat: details.geometry?.location.lat ?? searchResult.geometry.location.lat,
      lng: details.geometry?.location.lng ?? searchResult.geometry.location.lng,
    },
    latitude: details.geometry?.location.lat ?? searchResult.geometry.location.lat,
    longitude: details.geometry?.location.lng ?? searchResult.geometry.location.lng,
    // Address
    formatted_address: details.formatted_address || searchResult.formatted_address,
    // Contact
    phone_number: details.formatted_phone_number || cafe.phone_number,
    website: details.website || cafe.website,
    google_maps_url: details.url || cafe.google_maps_url,
    // Ratings
    rating: details.rating ?? searchResult.rating ?? cafe.rating,
    user_ratings_total: details.user_ratings_total ?? searchResult.user_ratings_total ?? cafe.user_ratings_total,
    // Price
    price_level: details.price_level ?? searchResult.price_level,
    price_display: priceLevelToString(details.price_level ?? searchResult.price_level),
    // Hours
    opening_hours: details.opening_hours?.weekday_text || cafe.opening_hours,
    // Places ID
    place_id: searchResult.place_id,
    verification_status: "verified" as const,
    // Photos — replace placeholder Unsplash with real Google photos
    ...(photoUrls.length > 0 && {
      images: {
        hero: photoUrls[0] || cafe.images?.hero,
        card: photoUrls[1] || photoUrls[0] || cafe.images?.card,
        interior: photoUrls[2] || cafe.images?.interior,
        details: photoUrls[3] || cafe.images?.details,
      },
      photos: photoUrls,
      gallery: photoUrls.slice(1),
    }),
  };

  console.log(`  ✓ lat=${enriched.coordinates.lat.toFixed(4)}, lng=${enriched.coordinates.lng.toFixed(4)}`);
  console.log(`  ✓ rating=${enriched.rating}, photos=${photoUrls.length}, price=${enriched.price_display}`);
  if (enriched.phone_number) console.log(`  ✓ phone=${enriched.phone_number}`);
  if (enriched.opening_hours?.length) console.log(`  ✓ hours fetched (${enriched.opening_hours.length} days)`);

  return enriched;
}

async function main() {
  console.log("=== Shillong Cafe Guide — Google Places Enricher ===\n");

  if (!fs.existsSync(DB_PATH)) {
    console.error(`cafes_db.json not found at ${DB_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(DB_PATH, "utf-8");
  const cafes: any[] = JSON.parse(raw);

  console.log(`Found ${cafes.length} cafes. Enriching via Google Places API...`);

  const enriched: any[] = [];
  for (const cafe of cafes) {
    // Rate limit: Places API allows ~10 QPS, add small delay
    await new Promise((r) => setTimeout(r, 300));
    const result = await enrichCafe(cafe);
    enriched.push(result);
  }

  // Backup original
  const backupPath = DB_PATH.replace(".json", `.backup-${Date.now()}.json`);
  fs.writeFileSync(backupPath, raw, "utf-8");
  console.log(`\nBackup saved: ${backupPath}`);

  fs.writeFileSync(DB_PATH, JSON.stringify(enriched, null, 2), "utf-8");
  console.log(`✅ Enriched ${enriched.length} cafes → cafes_db.json`);

  // Summary
  const verified = enriched.filter((c) => c.verification_status === "verified").length;
  const withPhotos = enriched.filter((c) => c.photos?.length > 0).length;
  console.log(`\nSummary: ${verified} verified, ${withPhotos} with real photos`);
}

main().catch(console.error);
