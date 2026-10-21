/**
 * cafeSchema.ts
 * Builds a Schema.org CafeOrCoffeeShop JSON-LD object from a Cafe record.
 * Used by CafeDetailModal (and future dedicated cafe pages) to inject
 * per-café structured data so Google can show rich results (opening hours,
 * map pins) in SERPs.
 *
 * Usage:
 *   import { buildCafeSchema } from '../utils/cafeSchema';
 *   const schema = buildCafeSchema(cafe);
 *   // then pass to <SEO schema={schema} />
 */

import type { Cafe } from '../types';
import { toInternationalPhone } from './phone';

const BASE_URL = 'https://shillongcafemap.in';

/** Converts a Cafe's neighborhood string into a URL-safe slug fragment */
function neighborhoodSlug(neighborhood: string): string {
  return neighborhood.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/**
 * Builds the full Schema.org JSON-LD object for a single café.
 * Returns a plain object — the caller is responsible for serialising
 * it into a <script type="application/ld+json"> tag (SEO.tsx handles this).
 */
export function buildCafeSchema(cafe: Cafe): Record<string, unknown> {
  const cafeUrl = `${BASE_URL}/cafe/${cafe.id}`;

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

  // No aggregateRating: our ratings are copied from Google Maps, and Google's
  // review-snippet policy only allows ratings collected on this site.

  // ── Opening hours ────────────────────────────────────────────────────────
  const openingHoursSpecification = buildOpeningHours(cafe.opening_hours);

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
  // Note: @context is omitted here — SEO.tsx wraps the schema in a top-level
  // { "@context": "...", "@graph": [...] } so nesting it would be redundant.
  const cafeEntity: Record<string, unknown> = {
    '@type': 'CafeOrCoffeeShop',
    '@id': cafeUrl,
    name: cafe.name,
    description: cafe.introduction || cafe.tagline,
    url: cafeUrl,
    ...(cafe.website ? { sameAs: cafe.website } : {}),
    ...(cafe.google_maps_url ? { hasMap: cafe.google_maps_url } : {}),
    address,
    ...(geo ? { geo } : {}),
    ...(openingHoursSpecification
      ? { openingHoursSpecification }
      : {}),
    ...(images.length ? { image: images.length === 1 ? images[0] : images } : {}),
    ...(cafe.phone_number ? { telephone: toInternationalPhone(cafe.phone_number) } : {}),
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

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** "9:30 AM" / "12:00" (+ fallback AM/PM) → "09:30"; null when unreadable. */
function to24h(time: string, fallbackPeriod?: string): string | null {
  const m = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return null;
  const period = (m[3] || fallbackPeriod || '').toUpperCase();
  if (!period) return null;
  let hour = Number(m[1]) % 12;
  if (period === 'PM') hour += 12;
  return `${String(hour).padStart(2, '0')}:${m[2]}`;
}

/**
 * Converts Google's weekday_text (["Monday: 9:00 AM – 9:00 PM", …]) into
 * Schema.org OpeningHoursSpecification objects. Returns undefined if any line
 * can't be read, so Google never gets guessed hours.
 */
export function buildOpeningHours(lines?: string[] | null): Record<string, unknown>[] | undefined {
  if (!lines?.length) return undefined;
  const specs: Record<string, unknown>[] = [];
  for (const raw of lines) {
    const line = raw.replace(/[   ]/g, ' ');
    const sep = line.indexOf(':');
    const day = line.slice(0, sep).trim();
    const rest = line.slice(sep + 1).trim();
    if (sep < 0 || !DAYS.includes(day)) return undefined;
    if (/^closed$/i.test(rest)) continue;
    if (/^open 24 hours$/i.test(rest)) {
      specs.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: `https://schema.org/${day}`, opens: '00:00', closes: '23:59' });
      continue;
    }
    for (const range of rest.split(',')) {
      const [start, end] = range.split(/\s*[–—-]\s*/);
      const endPeriod = end?.match(/(AM|PM)/i)?.[1];
      const closes = end ? to24h(end) : null;
      const opens = start ? to24h(start, endPeriod) : null;
      if (!opens || !closes) return undefined;
      specs.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: `https://schema.org/${day}`, opens, closes });
    }
  }
  return specs.length ? specs : undefined;
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
