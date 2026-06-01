/**
 * Reusable Google Places Integration and Image Fallback Utilities
 * Shillong Cafe Map - Premium Editorial Version
 */

import { GOOGLE_MAPS_API_KEY, hasValidKey } from "../config";

interface ImageCacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 Hours Cache

// A list of majestic high-fidelity Meghalaya scenic landscape backup photos from Unsplash
const MEGHALAYA_SCENIC_IMAGES = [
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200", // Pine forest hills
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1200", // Misty pine path
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=1200", // Lush valley green mist
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200", // Cozy wood interior with mist outside
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200", // Elegant cafe table by glass windows
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1200"  // Steaming cups in warm lights
];

// Helper to load cache
function getCachedData<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: ImageCacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp < CACHE_EXPIRY_MS) {
      return entry.data;
    }
    // Clean expired cache
    localStorage.removeItem(key);
  } catch (err) {
    console.warn("Places cache parsing error:", err);
  }
  return null;
}

// Helper to save cache
function setCachedData<T>(key: string, data: T): void {
  try {
    const entry: ImageCacheEntry<T> = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (err) {
    console.warn("Places cache writing error:", err);
  }
}

/**
 * Searches for a Google Place ID based on business name and area/neighborhood.
 * Synchronizes with user coordinates when verified.
 */
export async function resolvePlaceId(name: string, neighborhood?: string): Promise<string | null> {
  const cacheKey = `shillong_places_id_${encodeURIComponent(name.toLowerCase())}`;
  const cached = getCachedData<string>(cacheKey);
  if (cached) return cached;

  try {
    const areaParam = neighborhood ? `&area_or_neighborhood=${encodeURIComponent(neighborhood)}` : "";
    const response = await fetch(`/api/places/retrieve?business_name=${encodeURIComponent(name)}${areaParam}`);
    if (!response.ok) throw new Error("HTTP " + response.status);
    const result = await response.json();
    
    if (result.accepted_place && result.accepted_place.place_id) {
      const pid = result.accepted_place.place_id;
      setCachedData(cacheKey, pid);
      return pid;
    } else if (result.candidate_results && result.candidate_results.length > 0) {
      // Pick best score candidate
      const pid = result.candidate_results[0].place_id;
      setCachedData(cacheKey, pid);
      return pid;
    }
  } catch (err) {
    console.error(`Failed to resolve place ID for ${name}:`, err);
  }

  return null;
}

/**
 * Fetches and categorizes place photos from Google Places.
 * Connects to the local CORS backend proxy for image assets.
 */
export async function getPlacePhotos(cafeId: string, placeId?: string, cafeName?: string): Promise<string[]> {
  const cacheKey = `shillong_places_photos_${cafeId}`;
  const cached = getCachedData<string[]>(cacheKey);
  if (cached) return cached;

  try {
    if (!placeId && cafeName) {
      placeId = await resolvePlaceId(cafeName) || undefined;
    }

    if (placeId || cafeName) {
      const businessName = cafeName || cafeId;
      const response = await fetch(`/api/places/retrieve?business_name=${encodeURIComponent(businessName)}`);
      if (response.ok) {
        const result = await response.json();
        const collectedUrls: string[] = [];
        
        if (result.featured_image && result.featured_image.photo_url) {
          collectedUrls.push(result.featured_image.photo_url);
        }
        
        if (Array.isArray(result.gallery_images)) {
          result.gallery_images.forEach((img: any) => {
            if (img.photo_url) collectedUrls.push(img.photo_url);
          });
        }

        if (Array.isArray(result.menu_images)) {
          result.menu_images.forEach((img: any) => {
            if (img.photo_url) collectedUrls.push(img.photo_url);
          });
        }

        if (collectedUrls.length > 0) {
          setCachedData(cacheKey, collectedUrls);
          return collectedUrls;
        }
      }
    }
  } catch (err) {
    console.error(`Failed to fetch place photos for ${cafeId}:`, err);
  }

  return [];
}

/**
 * Returns the single best scenic/editorial image following the strict fallback hierarchy:
 * 1. Google Places photo
 * 2. Existing curated CDN image (if provided)
 * 3. Default Meghalaya scenic backup
 */
export async function fetchBestScenicImage(cafeName: string, fallbackUrl?: string, cafeId?: string): Promise<string> {
  const cid = cafeId || cafeName.toLowerCase().replace(/\s+/g, "-");
  
  // Try retrieving Google Places photo
  try {
    const photos = await getPlacePhotos(cid, undefined, cafeName);
    if (photos && photos.length > 0) {
      return photos[0];
    }
  } catch (err) {
    console.warn("Failed to retrieve Google Places photo during fallback flow:", err);
  }

  // Fallback 2: Curated CDN image
  if (fallbackUrl && fallbackUrl.trim() !== "" && !fallbackUrl.includes("placeholder")) {
    return fallbackUrl;
  }

  // Fallback 3: Deterministic Meghalaya beautiful Unsplash landscape
  const stringHash = cafeName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pickedScenic = MEGHALAYA_SCENIC_IMAGES[stringHash % MEGHALAYA_SCENIC_IMAGES.length];
  return pickedScenic;
}
