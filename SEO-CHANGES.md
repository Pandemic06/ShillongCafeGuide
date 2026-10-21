# SEO Changes — ShillongCafeGuide

> Last updated: 2026-06-19  
> Branch: `SCM-Combination-Build`

---

## Summary of Changes

This commit applies the priority technical SEO fixes identified in the full audit report for **shillongcafemap.in**.

---

## 1. `public/sitemap.xml` — Critical Fix

| Issue | Fix Applied |
|---|---|
| **Wrong XML namespace** (`http://www.sitemap.org/...`) | Corrected to official `https://www.sitemaps.org/schemas/sitemap/0.9` |
| Missing `<lastmod>` on all URLs | Added `2026-06-09` to every URL entry |
| District walk pages had low priority (0.7) | Raised to 0.8 — high local search intent pages |
| Top café pages had same priority (0.6) as generic pages | Rynsan, Ahavah, Dylans, Trattoria raised to 0.8 — flagship listings |
| Added `xmlns:xhtml` namespace | Enables future hreflang support |

---

## 2. `public/robots.txt` — Enhanced

| Issue | Fix Applied |
|---|---|
| No crawl rules for API routes | Added `Disallow: /api/` |
| No crawl rules for raw JSON config files | Added `Disallow: /*.json$` |
| Googlebot image crawling not explicitly allowed | Added `User-agent: Googlebot` + `Allow: /cafe-photos/` |
| No crawl-delay for aggressive bots | Added `Crawl-delay: 10` for YandexBot |
| No comments / documentation | Added inline comments for maintainability |

---

## 3. `index.html` — Major SEO Upgrades

### Meta Tags
- **Title tag**: Added "Best" keyword prefix — targets higher-intent query `best cafes in Shillong`
- **Meta description**: Rewritten to include action word "Discover", locality signals (Laitumkhrah, Police Bazaar), and dish names
- **Meta keywords**: Expanded from 10 to 13 terms, added `cafes near Wards Lake`, `hidden cafes Shillong`, `aesthetic cafes Shillong`
- **Robots meta**: Added `max-snippet:-1, max-video-preview:-1` for full Google rich snippet eligibility
- **OG image height**: Corrected from 800px to 630px (standard 1.91:1 ratio for rich previews)
- **OG image:type**: Added `image/jpeg` for explicit type declaration
- **OG image:alt**: Updated to keyword-rich description including `Ka Duitara`
- **Twitter image:alt**: Added matching alt text
- **Twitter:site**: Added `@ShillongCafeMap` handle

### Geo Tags (New)
```html
<meta name="geo.region" content="IN-ML" />
<meta name="geo.placename" content="Shillong, Meghalaya, India" />
<meta name="geo.position" content="25.5788;91.8933" />
<meta name="ICBM" content="25.5788, 91.8933" />
```
Geo tags strengthen local search signals and help map-based indexing.

### Performance (New)
```html
<link rel="preconnect" href="https://unpkg.com" crossorigin />
<link rel="preconnect" href="https://www.googletagmanager.com" crossorigin />
<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
```
Preconnect hints reduce render-blocking latency — improves LCP Core Web Vital.

### JSON-LD Schema Upgrades

| Schema Type | Change |
|---|---|
| `WebSite` | Added `alternateName`, fixed `urlTemplate` to use proper `EntryPoint` type |
| `Organization` | Added `knowsAbout` array with Khasi cuisine entities, added Instagram `sameAs`, upgraded `logo` to `ImageObject` with dimensions |
| `WebPage` (New) | Added full `WebPage` entity with `BreadcrumbList` — enables breadcrumb rich results |
| `ItemList` (New) | Added `ItemList` for top 10 cafés — enables carousel rich results in Google Search |

### `<noscript>` Block Upgrade
- Added keyword-rich `<h1>` and `<p>` with dish names and route names
- Added static HTML `<nav>` with `<a>` links to 10 café pages — ensures Googlebot can crawl café pages even without JS execution

---

## Phase 1 — Per-Café Schema (Completed 2026-06-09)

- [x] `src/utils/cafeSchema.ts` — builds `CafeOrCoffeeShop` + `GeoCoordinates` + `AggregateRating` + `PostalAddress` JSON-LD for every café
- [x] `src/components/CafeDetailModal.tsx` — injects per-café SEO: dynamic `<title>`, `<meta description>`, canonical URL, OG/Twitter tags, BreadcrumbList, and `CafeOrCoffeeShop` schema via `SEO.tsx`
- [x] `src/components/SEO.tsx` — upserts all `<head>` tags from a React effect; wraps schemas in `{ "@context": "...", "@graph": [...] }`
- [x] Fix: removed redundant `@context` from `cafeEntity` in `buildCafeSchema` (2026-06-19 — outer @graph wrapper already supplies it)

## Phase 2 — Walks Page Schema (Completed 2026-06-19)

- [x] `src/App.tsx` `getDynamicSchema()` — added `walks` case returning `CollectionPage` + `ItemList` schema
  - `CollectionPage` at `https://shillongcafemap.in/?tab=walks`
  - `ItemList` with one `ListItem` per neighborhood (Laitumkhrah, Police Bazaar, Golf Links)
  - Each item is a `TouristAttraction` with `name`, `description`, `image`, `PostalAddress`, `containedInPlace` hierarchy
  - Uses `NEIGHBORHOODS` array already imported in App.tsx — zero new dependencies

## Phase 3 — Route Planner Schema (Completed 2026-06-19)

- [x] `src/App.tsx` `getDynamicSchema()` — added `planners` case returning `CollectionPage` + `ItemList` of `TouristTrip` schemas
  - `CollectionPage` at `https://shillongcafemap.in/?tab=planners`
  - `ItemList` with one `TouristTrip` per route (12 routes total)
  - Each `TouristTrip` has `name`, `url`, `provider` (Shillong Café Map), `geo` (centroid coords), and `itinerary` array of `TouristAttraction` stops
  - Added `import { PLANNER_ROUTES } from "./data/plannerData"` to App.tsx

## Phase 4 — SEO Audit Fixes (Completed 2026-10-21)

- [x] Removed `aggregateRating` from café schema (ratings are copied from Google Maps; Google only allows on-site ratings). Visible rating stays, labelled as Google Maps; no more fake "4.5 / 120+" fallback.
- [x] Each section (`/?tab=cafes|cuisine|walks|planners|guides|about|trending`) is pre-rendered to `dist/public/tab/<tab>.html` with its own title/description/canonical; `server.ts` serves it for `/?tab=<id>`. Route Planner got its own `PAGE_SEO.planners` entry (replacing the non-existent `discover` tab).
- [x] Sitemap: `?tab=discover` → `?tab=planners`, removed 3 `&district=` duplicates, added `?tab=trending` (99 URLs).
- [x] Café modal no longer overwritten by App's schema (which used `shillongcafemap.com` and fake geo/phone/review-count fallbacks); `.com` → `.in` everywhere; `/logo.png` now exists.
- [x] Unknown paths outside `/`, `/cafe/*`, `/admin*` return a real 404 page (`public/404.html`). Unknown `/cafe/<id>` still returns 200 (CMS cafés live in Firestore).
- [x] Café share previews use the real cached photo (47 cafés) and correct alt text; robots.txt now repeats Disallow rules in the Googlebot/Bingbot groups.

## Remaining Next Steps

- [ ] 36 cafés have the placeholder `opening_hours: ["10:30 AM — 8:30 PM"]` (CMS default); verify or clear them. `openingHoursSpecification` also expects structured objects, not strings.

- [ ] Submit updated sitemap to Google Search Console (manual — requires GSC access)
- [ ] Set `trailingSlash: false` consistently in Vite/server config to eliminate redirect loops
