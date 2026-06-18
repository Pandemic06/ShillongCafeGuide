import { Cafe } from "../types";

export interface EnrichedVenueResult {
  isValid: boolean;
  validationMessage: string;
  confidenceScore: number;
  confidenceReasons: string[];
  enrichedData: Partial<Cafe>;
}

export class KongLabetEngine {
  private ai: any;

  constructor(aiClient: any) {
    this.ai = aiClient;
  }

  /**
   * Run the full autonomous research, validation, differentiation, content generation,
   * anti-duplication, and confidence scoring pipeline for a single venue.
   */
  async runAutonomousEnrichment(
    cafe: Partial<Cafe> & { name: string; neighborhood: string },
    existingCafes: Cafe[]
  ): Promise<EnrichedVenueResult> {
    if (!this.ai) {
      throw new Error("Gemini AI client is not initialized in Kong Labet Engine.");
    }

    console.log(`[Kong Labet Engine] Researching venue: "${cafe.name}" in "${cafe.neighborhood}"...`);

    // Filter existing cafes in the same district/neighborhood to use as context for differentiation
    const districtCafes = existingCafes.filter(
      (c) => c.neighborhood?.toLowerCase() === cafe.neighborhood?.toLowerCase() && c.id !== cafe.id
    );

    const existingNames = existingCafes.map((c) => c.name);

    const serializedDistrictCafes = districtCafes
      .map((c) => {
        return `- Name: "${c.name}" | Theme: "${c.theme || ""}" | Tagline: "${c.tagline || ""}" | Description: "${c.introduction || ""}" | Specialties: "${(c.mustTry || []).map((m) => m.name).join(", ")}"`;
      })
      .join("\n");

    const prompt = `
Research the venue "${cafe.name}" located in the "${cafe.neighborhood}" neighborhood of Shillong, Meghalaya.
Use the Google Search tool to gather real, current data about this venue, including reviews, social media pages (like Instagram/Facebook), food blog mentions, and local directories.

### Pipeline Stage Instructions:
1. **Fact Extraction**: Gather verified details: address, hours, cuisine, price range, target crowd, ambience, signature dishes/drinks, landmarks, and distinguishing traits. Do not invent details.
2. **Fact Validation**: Compare the verified address and geolocation signals from research. Does the address or physical location match "${cafe.neighborhood}" neighborhood? If it belongs to a different area (e.g. Police Bazaar instead of Laitumkhrah), flag this conflict. If content has repetitive details, treat it as a failure signal.
3. **Neighborhood Differentiation Engine**: We already have the following venues in the "${cafe.neighborhood}" neighborhood:
${serializedDistrictCafes || "None yet."}
Ensure "${cafe.name}" sounds completely distinct from these. Force differentiation by focusing on its specific food specialty, unique seating layout, mood, time of day suitability, or landmark proximity. Do not let it sound generic.
4. **Anti-Duplication & Quality Controls**: Block repetitive intros, repetitive adjective patterns, or copied descriptions. Avoid generic AI fluff such as "cozy place," "perfect spot," "great ambiance," or "must visit" unless supported by a concrete, verified fact (e.g. "has a wood-fired fireplace built in 1920").
5. **Content Generation**: Generate page-ready assets:
   - Unique SEO title (max 60 chars)
   - Unique SEO meta description (max 160 chars)
   - One-line venue hook (tagline)
   - Detailed editorial summary (introduction, 2-3 paragraphs in Shillong-realism style)
   - highlights (3-5 bullet points)
   - best-for use cases (whyVisit)
   - practical information
   - signature dishes or drinks (mustTry)
   - neighborhood context
   - internal-link suggestions to other cafes in Shillong. Available target cafes for linking: [${existingNames.slice(0, 30).join(", ")}]
   - Auntie Kong Labet tagline, note, and micro observations in her signature dry, deadpan, comforting Shillong voice.
6. **Confidence Scoring**: Rate confidence (0.0 to 1.0) based on source strength, factual consistency, and text originality. If under 0.8, flag it as review required.

### Key Operating Principle Directive:
“Antigravity, you must rebuild Kong Labet so that Kong Labet creates and maintains its own venue knowledge base through web research, structured fact extraction, validation, and differentiated content generation, without relying on manual venue data entry.”

Return output in STRICT JSON format (enclosed in a \`\`\`json block) with this structure:
{
  "isValid": boolean, // false if location conflicts are found or facts are highly inconsistent
  "validationMessage": string, // brief reason if invalid or verification notes
  "confidenceScore": number, // 0.0 to 1.0
  "confidenceReasons": string[], // reasons for this score
  "enrichedData": {
    "name": string,
    "address": string,
    "hours": string,
    "price_per_person": number,
    "tagline": string, // one-line venue hook
    "introduction": string, // editorial summary
    "whyVisit": string, // best-for use cases
    "vibeTags": string[], // 3-6 distinct tags
    "mustTry": [
      { "name": string, "description": string, "price": string }
    ],
    "seo_title": string,
    "seo_description": string,
    "highlights": string[],
    "practical_information": string,
    "neighborhood_context": string,
    "internal_link_suggestions": string[],
    "kong_labet_tagline": string, // short witty auntie tagline
    "kong_labet_note": string, // practical auntie advisory note
    "kong_labet_observations": string[] // 2-3 dry micro observations
  }
}
`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.4,
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "";
      const parsed = JSON.parse(text) as EnrichedVenueResult;
      
      console.log(`[Kong Labet Engine] Research finished. Confidence Score: ${parsed.confidenceScore}, Validated: ${parsed.isValid}`);
      return parsed;
    } catch (err: any) {
      console.error(`[Kong Labet Engine] Failed to enrich "${cafe.name}":`, err);
      return {
        isValid: false,
        validationMessage: `Pipeline extraction failed with error: ${err.message || err}`,
        confidenceScore: 0.1,
        confidenceReasons: ["Failed execution of Gemini AI model pipeline."],
        enrichedData: {},
      };
    }
  }

  /**
   * Run venue discovery: crawl the web to find cafes, restaurants, bars, or Khasi food experiences
   * in Shillong or Meghalaya that do not exist in the current database.
   */
  async discoverVenues(existingNames: string[]): Promise<{ name: string; neighborhood: string }[]> {
    if (!this.ai) {
      throw new Error("Gemini AI client is not initialized in Kong Labet Engine.");
    }

    console.log(`[Kong Labet Engine] Initiating web discovery for new food venues in Shillong...`);

    const prompt = `
Find 3 or 4 real, currently operating cafes, restaurants, bakeries, bars, or traditional Khasi food spots in Shillong or Meghalaya, India.
The discovered venues MUST NOT be present in this list: [${existingNames.join(", ")}].
Search for actual places mentioned in recent news, reviews, Google Maps listings, or social pages.

### Key Operating Principle Directive:
“Antigravity, you must rebuild Kong Labet so that Kong Labet creates and maintains its own venue knowledge base through web research, structured fact extraction, validation, and differentiated content generation, without relying on manual venue data entry.”

Return output in STRICT JSON format (enclosed in a \`\`\`json block):
[
  {
    "name": string, // Real name of the venue
    "neighborhood": "Laitumkhrah" | "Police Bazaar" | "Golf Links" | "Boyce Road" | "Nongkynrih" | "Kench's Trace" | "Dhankheti" | "Mawroh" | "Nongrim Hills" | "Oakland" | "Cleve Colony" | "MG Road" | "Mawlai" | "Nongthymmai" | "Newlands" | "Upper Shillong" | "Rilbong" | "Lachumiere" | "Tripura Castle" | "GS Road" | "Laban" | "Shillong Peak Area" | "Umpling" | "Nongmynsong" | "Cantonment" | "Malki" | "Shillong" | "Garikhana" // Most appropriate neighborhood tag
  }
]
`;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "";
      const parsed = JSON.parse(text) as { name: string; neighborhood: string }[];
      console.log(`[Kong Labet Engine] Discovery found ${parsed.length} candidate venues.`);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.error("[Kong Labet Engine] Discovery error:", err);
      return [];
    }
  }
}
