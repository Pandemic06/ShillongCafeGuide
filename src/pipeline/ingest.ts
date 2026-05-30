/**
 * Mock Ingestion Engine Script
 * Demonstrates the deduplication, enrichment, and output generation workflow.
 * 
 * Usage:
 * npm init -y
 * npm i @google/genai dotenv
 * npx tsx src/pipeline/ingest.ts
 */

import { isFuzzyMatch } from '../utils'; // Reuse our application logic

type RawInput = { name: string, lat: number, lng: number, bio: string };

const incomingRawData: RawInput[] = [
  { name: "Mood Swings", lat: 25.5714, lng: 91.8956, bio: "Indie aesthetic spot in Laitumkhrah. Great coffee." },
  { name: "Mood Swings Cafe", lat: 25.5715, lng: 91.8955, bio: "Best music and vibes." }, // Duplicate
  { name: "Trattoria", lat: 25.5730, lng: 91.8841, bio: "Authentic Khasi Police Bazar. Get the Jadoh and Dohneiiong." }
];

export async function processPipeline() {
  const processed: any[] = [];

  for (const raw of incomingRawData) {
    // 1. Deduplication using geo-spatial and fuzzy matching
    let isDuplicate = false;
    for (const existing of processed) {
      const geoDistance = Math.sqrt(Math.pow(existing.lat - raw.lat, 2) + Math.pow(existing.lng - raw.lng, 2));
      const similarName = isFuzzyMatch(raw.name, existing.name);
      if (geoDistance < 0.005 && similarName) {
        isDuplicate = true;
        // Merge attributes realistically
        existing.bio += " " + raw.bio;
        break;
      }
    }

    if (!isDuplicate) {
      processed.push({ ...raw });
    }
  }

  // 2. Cultural Enrichment (Mocking LLM processing)
  for (const place of processed) {
    console.log(`[Enriching] ${place.name}...`);
    
    // Simple regex enrichment logic for demonstration
    place.khasi_food_available = /khasi|jadoh|dohneiiong/i.test(place.bio);
    if (place.khasi_food_available) {
      place.ambience_tags = ["Traditional", "Local Favorite"];
      place.kong_labet_tagline = "Real meat, real fire, real Khasi soul.";
    } else {
      place.ambience_tags = ["Indie", "Aesthetic", "Student-friendly"];
      place.kong_labet_tagline = "Where the mood swings higher than the altitude.";
    }

    place.seo_description = `Discover ${place.name} in Shillong. ${place.bio}`;
  }

  return processed;
}

// processPipeline().then(console.log);
