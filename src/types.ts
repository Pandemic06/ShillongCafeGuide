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
  neighborhood: "Laitumkhrah" | "Police Bazaar" | "Golf Links" | "Boyce Road" | "Nongkynrih" | "Kench's Trace" | "Dhankheti";
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
  coordinates?: { lat: number; lng: number };
  
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
  average_spend_for_two?: number;
  cheapest_main_item?: number;
  student_budget_fit?: boolean;
}

export interface NeighborhoodInfo {
  id: string;
  name: string;
  title: string;
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

export interface GuideArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: "reviews" | "khasi-food" | "area-guides" | "itineraries" | "culture";
  image: string;
  author: string;
  date: string;
  readTime: string;
  featured?: boolean;
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
