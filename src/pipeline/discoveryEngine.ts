import { Cafe } from "../types";

/**
 * Shell Architecture for Multi-Source Aggregation Pipeline
 * 
 * This engine maps out the logical structure for discovering, aggregating, 
 * deduplicating, and scoring places across multiple data sources.
 */

export interface RawDiscoveryData {
  source: 'google' | 'instagram' | 'swiggy' | 'zomato' | 'facebook' | 'reddit' | 'vlog';
  extracted_name: string;
  mentions: string[];
  coordinates?: { lat: number; lng: number };
  address_snippet?: string;
  tags?: string[];
  url?: string;
  confidence_signal: number; // 1-10 depending on source reliability
}

export class DiscoveryEngine {
  private foundVenues: Map<string, Partial<Cafe>> = new Map();

  /**
   * Recursive Discovery:
   * Finds venues, extracts "related" places from sources (like Instagram tags or Maps "similar places"),
   * and feeds them back into the pipeline.
   */
  async runRecursiveDiscovery(seedSources: string[]) {
    console.log(`[Discovery] Starting recursive crawler on ${seedSources.length} seed points...`);
    // 1. Fetch raw data from multi-channel APIs/Scrapers
    // 2. Pass through NLP Entity Extraction
    // 3. Cluster and Merge
  }

  /**
   * Deduplication & Merging Logic
   */
  private mergeEntity(raw: RawDiscoveryData) {
    const normalizedName = raw.extracted_name.toLowerCase().replace(/(cafe|restaurant|shillong)/g, '').trim();
    
    // Fuzzy matching + Spatial Boundaries
    let merged = false;
    for (const [id, venue] of this.foundVenues.entries()) {
       const isNameSimilar = this.fuzzyMatch(normalizedName, (venue.name || '').toLowerCase());
       const isGeoClose = this.checkProximity(raw.coordinates, venue.coordinates);
       
       if (isNameSimilar || isGeoClose) {
         // It's a match. Enrich the existing entry.
         this.enrichExistingVenue(id, raw);
         merged = true;
         break;
       }
    }

    if (!merged) {
      // Create new candidate
      const newId = normalizedName.replace(/\W+/g, '-');
      this.foundVenues.set(newId, {
        id: newId,
        name: raw.extracted_name,
        aliases: [raw.extracted_name],
        discovery_sources: [raw.source],
        verification_confidence: raw.confidence_signal * 10,
        // ...
      });
    }
  }

  private fuzzyMatch(a: string, b: string): boolean {
     // Levenshtein distance implementation
     return a === b || a.includes(b) || b.includes(a);
  }

  private checkProximity(coord1?: {lat: number, lng: number}, coord2?: {lat: number, lng: number}): boolean {
    if (!coord1 || !coord2) return false;
    // Spatial boundary logic (< 50 meters)
    const dist = Math.sqrt(Math.pow(coord1.lat - coord2.lat, 2) + Math.pow(coord1.lng - coord2.lng, 2));
    return dist < 0.0005; // rough degree approx
  }

  private enrichExistingVenue(id: string, raw: RawDiscoveryData) {
    const venue = this.foundVenues.get(id);
    if (!venue) return;

    if (venue.aliases && !venue.aliases.includes(raw.extracted_name)) {
      venue.aliases.push(raw.extracted_name);
    }
    
    if (venue.discovery_sources && !venue.discovery_sources.includes(raw.source)) {
      venue.discovery_sources.push(raw.source);
    }

    // Boost confidence score
    if (typeof venue.verification_confidence === 'number') {
      venue.verification_confidence += raw.confidence_signal * 5;
    }
  }
}
