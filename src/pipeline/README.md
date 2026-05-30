# Shillong Cafe Data Collection Architecture

## Multi-Source Aggregation & Recursive Discovery Engine

To become the definitive, high-confidence atlas of Shillong's local food ecosystem, the platform utilizes a sophisticated recursive ingestion pipeline. This goes far beyond standard Google Maps scrapes to find **undocumented, highly-local, aesthetic, and informal** venues.

### 1. Multi-Source Discovery Pipeline
* **Map + Business Sources**: Google Places API, Apple Maps, Bing Maps.
* **Food Platforms**: Zomato, Swiggy, Magicpin, TripAdvisor, EazyDiner.
* **Social Pulse**: 
  * Location tags & check-ins on Instagram and Facebook.
  * Hashtag monitoring: `#ShillongCafe`, `#ShillongFood`, `#ShillongEats`.
* **Content Extraction (NLP)**: YouTube vlog transcripts, Reddit threads (`r/Shillong`), tourism blogs, and local recommendation articles.

### 2. Recursive Discovery Workflow
We don't just query APIs—we expand graphs. 
1. **Seed Discovery**: Find a known business (e.g., *Dylan's Cafe*).
2. **Entity Extraction**: Scrape social reviews and listicles mentioning it.
3. **Graph Expansion**: Look at *other* places users also tagged in those posts.
4. **Targeted Search**: Feed new entities back into the pipeline to extract their specific coordinates.

### 3. Deduplication & Intelligence Engine
A critical rule is avoiding duplicates:
* Deals with aliases naturally (e.g., "Cafe Shillong", "Café Shillong", "Cafe Shillong Heritage" -> **merged**).
* Uses Levenshtein Distance & Geo-spatial proximity checks (merging elements within 50 meters if names fuzzily match).
* Confidence Scoring (`verification_confidence`): Real venues appear across multiple signals (e.g., Swiggy + Insta + Maps = 95/100). Low-score places are flagged for manual review.

### 4. Cultural & SEO Enrichment
* **Labeling**: Uses LLMs to infer `ambience_tags` (e.g. "student-friendly", "cozy"), `features` (e.g. "rooftop"), and `khasi_food_available` tags from raw description data.
* **Kong Labet Output**: Beautifully sassy/poetic taglines.
* **Output to Map**: Transforms JSON into SEO-ready semantic views on the frontend.
