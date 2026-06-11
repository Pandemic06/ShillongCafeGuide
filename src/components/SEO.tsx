import { useEffect } from "react";

/**
 * Lightweight SEO sync without react-helmet — keeps SPA <head> in sync with
 * the currently visible tab/section. Updates:
 *   - document.title
 *   - meta[name=description]
 *   - <link rel=canonical>
 *   - og:title, og:description, og:url, twitter:title, twitter:description
 *   - one dynamic <script id=seo-jsonld> JSON-LD block (BreadcrumbList +
 *     page-specific schema)
 *
 * Designed for an SPA on a single static index.html. Server-side rendering
 * would be better for Googlebot, but Google has rendered JS pages reliably
 * for years and the static <head> in index.html still provides the baseline
 * crawl signal.
 */

type SEOProps = {
  /** Final <title>. We append the brand suffix if absent. */
  title: string;
  /** Plain-language sentence, 140–160 chars. */
  description: string;
  /** Canonical absolute URL — usually https://shillongcafemap.in/?tab=... */
  canonical?: string;
  /** Hero image for OG/Twitter cards. */
  image?: string;
  /** Optional list of schema objects to inject as JSON-LD. */
  schema?: Record<string, unknown> | Record<string, unknown>[];
  /** BreadcrumbList items, [{name, url}, ...] including current page. */
  breadcrumbs?: { name: string; url: string }[];
};

const SITE = "https://shillongcafemap.in";
const BRAND = "Shillong Café Map";
const DEFAULT_IMAGE = `${SITE}/cafe-photos/rynsan-cafe/hero-0.jpg`;

function upsertMeta(attr: "name" | "property", key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJsonLd(id: string, payload: object) {
  let el = document.head.querySelector<HTMLScriptElement>(`script#${id}`);
  if (!el) {
    el = document.createElement("script");
    el.setAttribute("type", "application/ld+json");
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(payload);
}

export default function SEO({ title, description, canonical, image, schema, breadcrumbs }: SEOProps) {
  useEffect(() => {
    const fullTitle = title.includes(BRAND) ? title : `${title} | ${BRAND}`;
    const url = canonical || SITE;
    const img = image || DEFAULT_IMAGE;

    document.title = fullTitle;
    upsertMeta("name", "description", description);
    upsertLink("canonical", url);

    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:image", img);

    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", img);

    // BreadcrumbList + page-specific schema combined under one @graph
    const graph: any[] = [];
    if (breadcrumbs?.length) {
      graph.push({
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: b.name,
          item: b.url,
        })),
      });
    }
    if (schema) {
      const arr = Array.isArray(schema) ? schema : [schema];
      graph.push(...arr);
    }
    if (graph.length) {
      upsertJsonLd("seo-jsonld", { "@context": "https://schema.org", "@graph": graph });
    }
  }, [title, description, canonical, image, JSON.stringify(schema), JSON.stringify(breadcrumbs)]);

  return null;
}

// ── Page-level metadata presets (one per visible tab) ─────────────────────
export const PAGE_SEO = {
  explore: {
    title: "Best Cafés, Khasi Food & Walks in Shillong",
    description:
      "An editorial guide to the best cafés in Shillong, Khasi food like Jadoh and Dohneiiong, walkable districts (Laitumkhrah, Police Bazaar, Golf Links) and curated Meghalaya road-trip routes.",
    canonical: `${SITE}/`,
  },
  discover: {
    title: "Shillong & Meghalaya Route Planner — Plan Your Adventure",
    description:
      "Plan curated road-trip routes across Meghalaya from Shillong: city loop, Cherrapunji, Dawki, Jowai, Laitlum Canyons and more. Drop stops on the map, see real distances and times.",
    canonical: `${SITE}/?tab=discover`,
  },
  cafes: {
    title: "All Cafés in Shillong — Curated List & Map",
    description:
      "Browse 49 hand-picked cafés across Shillong with photos, ratings, prices and live map. Filter by neighborhood, vibe, live music, rooftop, Khasi cuisine, and budget.",
    canonical: `${SITE}/?tab=cafes`,
  },
  cuisine: {
    title: "Khasi Food in Shillong — Jadoh, Dohneiiong, Tungrymbai",
    description:
      "A guide to traditional Khasi cuisine in Shillong: Jadoh red-rice pork pilaf, Dohneiiong black-sesame pork, Tungrymbai fermented soybean, Dohkhlieh pork salad, and where to eat each.",
    canonical: `${SITE}/?tab=cuisine`,
  },
  walks: {
    title: "Shillong Neighborhood Walks — Laitumkhrah, Police Bazaar, Golf Links",
    description:
      "Walking itineraries through Shillong's signature districts: Laitumkhrah student lanes, Police Bazaar market core, and Golf Links pine-shaded slopes with café and viewpoint stops.",
    canonical: `${SITE}/?tab=walks`,
  },
  guides: {
    title: "Shillong Editorial — Stories, Reviews & Culture",
    description:
      "Long-read editorial about Shillong café culture, monsoon coffee rituals, secret hill roasters, district stories and the people behind the city's hearths.",
    canonical: `${SITE}/?tab=guides`,
  },
  about: {
    title: "About Shillong Café Map",
    description:
      "About the Shillong Café Map: an editorial guide to cafés, Khasi food, neighborhoods and travel routes across Meghalaya — written and curated locally.",
    canonical: `${SITE}/?tab=about`,
  },
  trending: {
    title: "Sohra (Cherrapunji) — Trending Destination in Meghalaya",
    description:
      "Complete guide to Sohra (Cherrapunji): Nohkalikai Falls, Double Decker Living Root Bridge, Seven Sisters Falls, Mawsmai Cave, local cafés, curated day-trip routes and travel tips from Shillong.",
    canonical: `${SITE}/?tab=trending`,
  },
} as const;
