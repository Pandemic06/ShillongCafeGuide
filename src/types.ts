/**
 * Shared Type Definitions for Shillong Cafe Map
 */

export interface MenuItem {
  name: string;
  description: string;
  price?: string;
  image?: string;
}

export interface Review {
  id: string;
  cafeId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  isLocalGuide?: boolean;
  userId?: string;
}

export interface Cafe {
  id: string;
  name: string;
  tagline: string;
  theme: string;
  introduction: string;
  whyVisit: string;
  hours: string;
  address: string;
  neighborhood: "Laitumkhrah" | "Police Bazaar" | "Golf Links" | "Boyce Road" | "Nongkynrih" | "Kench's Trace" | "Dhankheti" | "Mawroh" | "Nongrim Hills" | "Oakland" | "Cleve Colony" | "MG Road" | "Mawlai" | "Nongthymmai";
  // Normalization audit metadata (Part 7)
  neighborhood_verified?: boolean;
  neighborhood_source?: "manual" | "address-inferred" | "google" | "legacy";
  rooftop_verified?: boolean;
  last_normalized_at?: string;
  images: {
    hero: string;
    card: string;
    interior?: string;
    details?: string;
  };
  quote?: string;
  quoteAuthor?: string;
  mustTry: MenuItem[];
  gallery: string[];
  vibeTags: string[];
  hasLiveMusic?: boolean;
  hasKhasiMusic?: boolean;
  coordinates?: { lat: number; lng: number };
  editorial_featured?: boolean;
  
  // Google Maps Platform Enriched Fields
  place_id?: string;
  formatted_address?: string;
  latitude?: string | number;
  longitude?: string | number;
  google_maps_url?: string;
  website?: string;
  phone_number?: string;
  rating?: number | string;
  user_ratings_total?: number | string;
  types?: string[];
  opening_hours?: string[];
  photos?: string[];
  khasi_food_available?: boolean;
  tags?: string[];
  match_confidence?: number;
  verification_status?: "verified" | "unverified";
  kong_labet_tagline?: string;
  kong_labet_note?: string;
  kong_labet_observations?: string[];

  // Taxonomy & Content Governance
  primary_category?: string;
  secondary_tags?: string[];
  theme_fit_score?: number;
  theme_fit_confidence?: number;
  evidence_notes?: string;
  evidence_type?: string;
  source_urls?: string[];
  reviewer_decision?: "Verified fit" | "Mixed fit" | "Needs review";
  review_status?: "Verified fit" | "Mixed fit" | "Needs review";
  last_reviewed_date?: string;
  manual_override_reason?: string;
  auto_suggested_categories?: { name: string; score: number; reason: string }[];
  borderline_mixed_fit_flag?: boolean;
  publish_eligibility_status?: "approved" | "pending" | "rejected";

  // Category-specific parameters
  // Khasi cuisine
  serves_khasi_food?: boolean;
  khasi_dishes_count?: number;
  khasi_dish_1?: string;
  khasi_dish_2?: string;
  local_cuisine_confidence?: number;
  signature_local_dish_present?: boolean;
  menu_proof_available?: boolean;

  // Live music
  hosts_live_music?: boolean;
  music_frequency?: "weekly" | "weekends" | "monthly" | "rare";
  music_type?: "acoustic" | "band" | "DJ" | "open mic";
  music_proof_available?: boolean;

  // Work-friendly
  wi_fi_available?: boolean;
  plug_points_available?: boolean;
  quiet_daytime?: boolean;
  seating_stability_score?: number; // 1-5
  work_friendly_score?: number; // 1-5

  // Cozy cafés
  ambience_warmth_score?: number; // 1-5
  seating_intimacy_score?: number; // 1-5
  lighting_mood_score?: number; // 1-5
  lingering_suitability?: boolean;

  // Scenic cafés
  scenic_view_type?: "valley" | "city" | "pine" | "rooftop" | "garden";
  view_prominence_score?: number; // 1-5
  outdoor_seating?: boolean;

  // Budget eats
  price_per_person?: number;
  average_spend_for_two?: number;
  cheapest_main_item?: number;
  student_budget_fit?: boolean;
  price_display?: string;
  menu_url?: string;
  menu_pdf_lunch?: string;
  menu_pdf_dinner?: string;
}

export interface NeighborhoodInfo {
  id: string;
  name: string;
  title: string;
  tagline?: string;
  description: string;
  image: string;
  vitals: {
    vibe: string;
    bestTime: string;
    accentUrl?: string; // image for listing
  };
  itinerary: {
    title: string;
    description: string;
    steps: {
      time: string;
      title: string;
      description: string;
    }[];
  };
}

// --- Editorial story content blocks (Part 5 long-form support) ---
export type StoryBlock =
  | { type: "paragraph"; text: string; dropCap?: boolean }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "pullquote"; text: string; attribution?: string }
  | { type: "image"; url: string; caption?: string; layout?: "inline" | "wide" | "full" }
  | { type: "gallery"; images: { url: string; caption?: string }[] }
  | { type: "divider" };

export interface GuideArticle {
  id: string;
  title: string;
  excerpt: string;
  /** Legacy markdown-ish content. Used when body_blocks is absent. */
  content: string;
  /** Rich long-form content. When present, renders via block renderer instead of content. */
  body_blocks?: StoryBlock[];
  category: "reviews" | "khasi-food" | "area-guides" | "itineraries" | "culture";
  image: string;
  author: string;
  date: string;
  /** Hand-set fallback. If body_blocks present, calculated read time is shown instead. */
  readTime: string;
  featured?: boolean;
  // Editorial workflow metadata
  status?: "draft" | "scheduled" | "published";
  scheduled_publish_at?: string;
  tags?: string[];
}

export interface FoodDish {
  id: string;
  name: string;
  philosophy: string;
  description: string;
  profile: string;
  pairing: string;
  image: string;
  matchCafes: string[];
}
