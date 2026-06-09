# SEO Changes — ShillongCafeGuide

> Last updated: 2026-06-09  
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

## Next Steps (Not in this commit)

- [ ] Add `generateStaticParams` to pre-render all 49 café pages at build time (SSG)
- [ ] Implement `generateMetadata` in each café route for dynamic per-page title/description
- [ ] Add per-café `Restaurant` / `CafeOrCoffeeShop` JSON-LD on individual café pages
- [ ] Add `CollectionPage` + `ItemList` schema on neighborhood walk pages
- [ ] Add `TouristTrip` schema on route/adventure pages
- [ ] Submit updated sitemap to Google Search Console
- [ ] Set `trailingSlash: false` consistently in Vite/server config to eliminate redirect loops
