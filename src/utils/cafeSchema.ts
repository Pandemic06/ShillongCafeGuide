/**
 * cafeSchema.ts
 * Builds a Schema.org CafeOrCoffeeShop JSON-LD object from a Cafe record.
 * Used by CafeDetailModal (and future dedicated cafe pages) to inject
 * per-café structured data so Google can show rich results (star ratings,
 * opening hours, map pins) in SERPs.
 *
 * Usage:
 *   import { buildCafeSchema } from '../utils/cafeSchema';
 *   const schema = buildCafeSchema(cafe);
 *   // then pass to <SEO schema={schema} />
 */

import type { Cafe } from '../types';

const BASE_URL = 'https://shillongcafemap.in';

/** Converts a Cafe's neighborhood string into a URL-safe slug fragment */
function neighborhoodSlug(neighborhood: string): string {
  return neighborhood.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/** Derives a consistent URL slug from a cafe name (fallback: cafe.id) */
function cafeSlug(cafe: Cafe): string {
  return cafe.name
    .toLowerCase()
    .replace(/[''']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Builds the full Schema.org JSON-LD object for a single café.
 * Returns a plain object — the caller is responsible for serialising
 * it into a <script type="application/ld+json"> tag (SEO.tsx handles this).
 */
export function buildCafeSchema(cafe: Cafe): Record<string, unknown> {
  const slug = cafeSlug(cafe);
  const cafeUrl = `${BASE_URL}/cafe/${slug}`;

  // ── Geo coordinates ─────────────────────────────────────────────────────
  const lat = cafe.coordinates?.lat ?? cafe.latitude;
  const lng = cafe.coordinates?.lng ?? cafe.longitude;
  const geo =
    lat && lng
      ? {
          '@type': 'GeoCoordinates',
          latitude: Number(lat),
          longitude: Number(lng),
        }
      : undefined;

  // ── Address ──────────────────────────────────────────────────────────────
  const address = {
    '@type': 'PostalAddress',
    streetAddress: cafe.formatted_address ?? cafe.address,
    addressLocality: cafe.neighborhood,
    addressRegion: 'Meghalaya',
    addressCountry: 'IN',
  };

  // ── Aggregate rating ─────────────────────────────────────────────────────
  const ratingValue = cafe.rating ? Number(cafe.rating) : undefined;
  const ratingCount = cafe.user_ratings_total
    ? Number(cafe.user_ratings_total)
    : undefined;
  const aggregateRating =
    ratingValue && ratingValue > 0
      ? {
          '@type': 'AggregateRating',
          ratingValue,
          bestRating: 5,
          worstRating: 1,
          ...(ratingCount ? { ratingCount } : {}),
        }
      : undefined;

  // ── Opening hours ────────────────────────────────────────────────────────
  // opening_hours is string[] from Google e.g. ["Monday: 9:00 AM – 9:00 PM", …]
  const openingHoursSpecification = cafe.opening_hours?.length
    ? cafe.opening_hours
    : cafe.hours
    ? [cafe.hours]
    : undefined;

  // ── Images ───────────────────────────────────────────────────────────────
  const images: string[] = [];
  if (cafe.images?.hero) images.push(cafe.images.hero);
  if (cafe.images?.interior) images.push(cafe.images.interior);
  if (cafe.photos?.length) images.push(...cafe.photos.slice(0, 3));

  // ── Menu ─────────────────────────────────────────────────────────────────
  const menuUrl =
    cafe.menu_url ??
    cafe.menu_pdf_lunch ??
    cafe.google_maps_url ??
    undefined;

  // ── Breadcrumb list ──────────────────────────────────────────────────────
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `${cafe.neighborhood} Cafés`,
        item: `${BASE_URL}/area/${neighborhoodSlug(cafe.neighborhood)}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: cafe.name,
        item: cafeUrl,
      },
    ],
  };

  // ── Main entity ──────────────────────────────────────────────────────────
  const cafeEntity: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    '@id': cafeUrl,
    name: cafe.name,
    description: cafe.introduction || cafe.tagline,
    url: cafeUrl,
    ...(cafe.website ? { sameAs: cafe.website } : {}),
    ...(cafe.google_maps_url ? { hasMap: cafe.google_maps_url } : {}),
    address,
    ...(geo ? { geo } : {}),
    ...(aggregateRating ? { aggregateRating } : {}),
    ...(openingHoursSpecification
      ? { openingHoursSpecification }
      : {}),
    ...(images.length ? { image: images.length === 1 ? images[0] : images } : {}),
    ...(cafe.phone_number ? { telephone: cafe.phone_number } : {}),
    ...(menuUrl ? { hasMenu: menuUrl } : {}),
    servesCuisine: buildCuisineList(cafe),
    priceRange: buildPriceRange(cafe),
    breadcrumb,
    isAccessibleForFree: false,
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, UPI',
  };

  return cafeEntity;
}

/** Derives a cuisine list from cafe tags and flags */
function buildCuisineList(cafe: Cafe): string[] {
  const cuisines: string[] = ['Indian', 'North East Indian'];
  if (cafe.serves_khasi_food || cafe.khasi_food_available) {
    cuisines.push('Khasi');
  }
  if (cafe.vibeTags?.some((t) => t.toLowerCase().includes('bakery'))) {
    cuisines.push('Bakery');
  }
  if (cafe.vibeTags?.some((t) => t.toLowerCase().includes('continental'))) {
    cuisines.push('Continental');
  }
  return [...new Set(cuisines)];
}

/** Maps price_per_person to Schema.org priceRange (₹ symbols) */
function buildPriceRange(cafe: Cafe): string {
  if (cafe.price_display) return cafe.price_display;
  const ppp = cafe.price_per_person ?? cafe.average_spend_for_two;
  if (!ppp) return '₹₹';
  if (ppp < 200) return '₹';
  if (ppp < 500) return '₹₹';
  if (ppp < 1000) return '₹₹₹';
  return '₹₹₹₹';
}
