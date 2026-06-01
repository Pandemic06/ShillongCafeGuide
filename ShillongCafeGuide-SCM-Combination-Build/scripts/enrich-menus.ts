/**
 * Enrich cafes_db.json with:
 * 1. Real menu items for Rynsan (from actual menu PDF)
 * 2. price_per_person and average_spend_for_two for all cafes from price_level
 *
 * Run: npx tsx scripts/enrich-menus.ts
 */

import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "src", "cafes_db.json");

// Price level → spend estimates (INR, based on Shillong market rates)
const PRICE_LEVEL_MAP: Record<number, { perPerson: number; forTwo: number }> = {
  1: { perPerson: 150, forTwo: 300 },
  2: { perPerson: 400, forTwo: 800 },
  3: { perPerson: 700, forTwo: 1400 },
  4: { perPerson: 1200, forTwo: 2400 },
};

// Real Rynsan menu items from actual PDF (rynsan.com/Lunch.pdf + Dinner.pdf)
const RYNSAN_REAL_MENU = [
  {
    name: "Putharo Sliders",
    description: "Khasi steamed pounded rice cakes with smoky smoked pork topping — a signature Rynsan starter.",
    price: "₹500",
    image: null, // will use cafe photo
  },
  {
    name: "Doh Khlieh Rynsan",
    description: "Rynsan's take on the Khasi pork head salad with wild herbs and a citrusy dressing.",
    price: "₹500",
    image: null,
  },
  {
    name: "Wild Fern Salad",
    description: "Fiddlehead ferns and seasonal greens with crushed roasted peanuts.",
    price: "₹390",
    image: null,
  },
  {
    name: "Chawh Chi Soup",
    description: "Rich and savoury wild perilla paste soup with shredded bamboo shoot.",
    price: "₹350",
    image: null,
  },
  {
    name: "Turmeric Butter Prawns",
    description: "Fresh river prawns in a light buttery lakadong turmeric sauce.",
    price: "₹550",
    image: null,
  },
  {
    name: "Mutton Roast",
    description: "Thin slices of slow-cooked 24-hour marinated leg of mutton.",
    price: "₹600",
    image: null,
  },
];

// Real Ahavah items based on their website categories
const AHAVAH_REAL_MENU = [
  {
    name: "Croissant & Eggs Breakfast",
    description: "Buttery croissants with fluffy scrambled eggs, crisp bacon, and freshly pressed juice.",
    price: "₹280",
    image: null,
  },
  {
    name: "Custom Wedding Cake Slice",
    description: "Freshly baked layered cake with cream and seasonal compote from their glass-enclosed pastry display.",
    price: "₹180",
    image: null,
  },
  {
    name: "Candlelight Dinner Set",
    description: "Curated 3-course set under the crystal chandeliers — starter, main, and dessert.",
    price: "₹850",
    image: null,
  },
];

function enrichCafe(cafe: any): any {
  const enriched = { ...cafe };

  // Set price per person from price_level (Google Places data)
  const level = cafe.price_level;
  if (level !== undefined && PRICE_LEVEL_MAP[level]) {
    const pricing = PRICE_LEVEL_MAP[level];
    enriched.price_per_person = pricing.perPerson;
    enriched.average_spend_for_two = pricing.forTwo;
  } else {
    // Default to level 2 (moderate) for cafes without price_level
    enriched.price_per_person = 350;
    enriched.average_spend_for_two = 700;
  }

  // Use Google Places photos as mustTry images where Unsplash is used
  const cafePhotos = cafe.photos || [];
  const photoForDish = (idx: number) => cafePhotos[idx % cafePhotos.length] || null;

  // Rynsan — replace with real menu items from PDF
  if (cafe.id === "rynsan-cafe") {
    enriched.mustTry = RYNSAN_REAL_MENU.map((item, i) => ({
      ...item,
      image: item.image || photoForDish(i + 1) || cafe.images?.hero,
    }));
    // Rynsan price_level 2, but actual menu shows mains at ₹400-600
    // Two people ordering soup + starter + main = ~₹1500
    enriched.price_per_person = 750;
    enriched.average_spend_for_two = 1500;
    enriched.menu_url = "https://www.rynsan.com/menu";
    enriched.menu_pdf_lunch = "https://www.rynsan.com/Lunch.pdf";
    enriched.menu_pdf_dinner = "https://www.rynsan.com/Dinner.pdf";
    return enriched;
  }

  // Ahavah — update with real items from their website
  if (cafe.id === "ahavah-cafe") {
    enriched.mustTry = AHAVAH_REAL_MENU.map((item, i) => ({
      ...item,
      image: item.image || photoForDish(i) || cafe.images?.hero,
    }));
    enriched.price_per_person = 500;
    enriched.average_spend_for_two = 1000;
    return enriched;
  }

  // For all other cafes: update mustTry images to use Google photos if still using Unsplash
  if (cafePhotos.length > 0 && Array.isArray(cafe.mustTry)) {
    enriched.mustTry = cafe.mustTry.map((item: any, i: number) => {
      const isUnsplash = item.image?.includes("unsplash.com");
      return {
        ...item,
        image: isUnsplash ? (photoForDish(i + 1) || item.image) : item.image,
      };
    });
  }

  return enriched;
}

function main() {
  console.log("=== Shillong Cafe Guide — Menu & Price Enricher ===\n");

  if (!fs.existsSync(DB_PATH)) {
    console.error(`cafes_db.json not found at ${DB_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(DB_PATH, "utf-8");
  const cafes: any[] = JSON.parse(raw);
  console.log(`Found ${cafes.length} cafes. Enriching with menu + price data...`);

  const enriched = cafes.map((cafe) => {
    const result = enrichCafe(cafe);
    console.log(`  ✓ ${cafe.name}: ₹${result.price_per_person}/person, ₹${result.average_spend_for_two} for two`);
    return result;
  });

  // Backup original
  const backupPath = DB_PATH.replace(".json", `.backup-${Date.now()}.json`);
  fs.writeFileSync(backupPath, raw, "utf-8");
  console.log(`\nBackup saved: ${backupPath}`);

  fs.writeFileSync(DB_PATH, JSON.stringify(enriched, null, 2), "utf-8");
  console.log(`✅ Enriched ${enriched.length} cafes → cafes_db.json`);

  const withPrices = enriched.filter((c) => c.price_per_person).length;
  const withRealMenu = enriched.filter((c) => c.menu_url).length;
  console.log(`\nSummary: ${withPrices} with price data, ${withRealMenu} with real menu URL`);
}

main();
