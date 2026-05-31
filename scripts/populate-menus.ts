/**
 * Populate cafe mustTry arrays using Gemini, mark output as AI-suggested.
 * Images are picked from already-cached cafe photos (public/cafe-photos/{id}/photo-*).
 *
 * Usage:
 *   npx tsx scripts/populate-menus.ts                # dry run, prints what it would generate
 *   npx tsx scripts/populate-menus.ts --apply        # write to cafes_db.json
 *   npx tsx scripts/populate-menus.ts --apply --min 4  # only top up cafes with <4 items
 */
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const APPLY = process.argv.includes("--apply");
const minIdx = process.argv.indexOf("--min");
const MIN = minIdx > -1 ? Number(process.argv[minIdx + 1]) : 4;
const TARGET = MIN; // items each cafe should end up with

const DB_PATH = path.join(process.cwd(), "src", "cafes_db.json");
const PHOTOS_ROOT = path.join(process.cwd(), "public", "cafe-photos");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY not set");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey });

interface MustItem {
  name: string;
  description: string;
  price: string;
  image: string | null;
  ai_suggested?: boolean;
}

function pickLocalPhoto(cafeId: string, idx: number): string | null {
  const dir = path.join(PHOTOS_ROOT, cafeId);
  if (!fs.existsSync(dir)) return null;
  const photos = fs.readdirSync(dir).filter((f) => f.startsWith("photo-") && f.endsWith(".jpg"));
  if (!photos.length) return null;
  const pick = photos[idx % photos.length];
  return `/cafe-photos/${cafeId}/${pick}`;
}

async function suggestForCafe(cafe: any, need: number): Promise<MustItem[]> {
  const existing = (cafe.mustTry || []).map((m: any) => m.name).join(", ") || "none";
  const prompt = `You are a Shillong, Meghalaya, India food researcher. Suggest exactly ${need} signature menu items for this cafe/restaurant.

Cafe: ${cafe.name}
Neighborhood: ${cafe.neighborhood}
Theme: ${cafe.theme}
Vibe tags: ${(cafe.vibeTags || []).join(", ")}
Khasi food available: ${cafe.khasi_food_available ? "yes" : "no"}
Already-listed items (DO NOT repeat): ${existing}

For each item, provide a realistic dish/drink that matches the cafe's theme and neighborhood context. Use authentic local pricing in INR (typical café items ₹120–₹450, mains ₹250–₹600, premium ₹500–₹900).

Return ONLY a JSON array, no prose, no markdown fences. Schema:
[
  { "name": "string", "description": "1 sentence, max 25 words", "price": "₹XXX" }
]`;

  const res = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { temperature: 0.7 },
  });
  const text = (res.text || "").trim().replace(/^```json\s*|\s*```$/g, "");
  try {
    const items = JSON.parse(text) as { name: string; description: string; price: string }[];
    return items.slice(0, need).map((it, i) => ({
      name: it.name,
      description: it.description,
      price: it.price,
      image: pickLocalPhoto(cafe.id, (cafe.mustTry?.length || 0) + i),
      ai_suggested: true,
    }));
  } catch (e) {
    console.warn(`  ✗ parse failed for ${cafe.id}:`, text.slice(0, 200));
    return [];
  }
}

async function main() {
  console.log(`=== Populate Menus (${APPLY ? "APPLY" : "DRY RUN"}) — target ${TARGET} items per cafe ===\n`);
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  const cafes = JSON.parse(raw);
  let touched = 0;
  let added = 0;

  for (const cafe of cafes) {
    const have = (cafe.mustTry || []).length;
    if (have >= TARGET) continue;
    const need = TARGET - have;
    process.stdout.write(`${cafe.id} (${have}→${TARGET}): `);
    const items = await suggestForCafe(cafe, need);
    if (!items.length) {
      console.log("skipped");
      continue;
    }
    console.log(items.map((i) => i.name).join(" | "));
    cafe.mustTry = [...(cafe.mustTry || []), ...items];
    touched++;
    added += items.length;
    // Throttle gentle to keep under 60 req/min on free tier
    await new Promise((r) => setTimeout(r, 800));
  }

  console.log(`\nSummary: ${touched} cafes updated, ${added} items added`);
  if (!APPLY) {
    console.log("Dry run. Rerun with --apply to write.");
    return;
  }
  const backup = DB_PATH.replace(".json", `.backup-menus-${Date.now()}.json`);
  fs.writeFileSync(backup, raw, "utf-8");
  console.log(`Backup: ${backup}`);
  fs.writeFileSync(DB_PATH, JSON.stringify(cafes, null, 2), "utf-8");
  console.log(`Wrote ${DB_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
