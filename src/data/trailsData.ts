// Trails data definition and documentation for Shillong Cafe Map
// PLUG IN YOUR ACTUAL TRAIL DATA HERE BELOW BY MODIFYING THE "TRAILS" ARRAY

export interface TrailStop {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  placeNameQuery: string; // Query used to search Google Places API
  description: string;
  // Dynamic fields populated via live Google Places SDK query
  place_id?: string;
  address?: string;
  rating?: number | string;
  photoUrl?: string;
  openingHours?: string;
  isOpenNow?: boolean;
}

export interface Trail {
  id: string;
  name: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  type: "urban walk" | "nature" | "cafe crawl";
  stops: TrailStop[];
  distanceFallback: string; // fallback value (e.g., "1.8 km")
  durationFallback: string; // fallback value (e.g., "35 mins")
}

export const TRAILS: Trail[] = [
  {
    id: "laitumkhrah-cafe-crawl",
    name: "Laitumkhrah Retro Café Crawl",
    description: "Amble through Shillong's academic heartbeat, stopping by iconic retro coffee cellars, acoustic lounges, and local Khasi bakehouses.",
    difficulty: "Easy",
    type: "cafe crawl",
    distanceFallback: "2.1 km",
    durationFallback: "25 mins",
    stops: [
      {
        id: "stop-cafe-shillong",
        name: "Café Shillong",
        coordinates: { lat: 25.5694, lng: 91.8988 },
        placeNameQuery: "Cafe Shillong Laitumkhrah",
        description: "The grandfather of Shillong's musical and coffee culture. Famous for local organic roasts and live guitar tunes."
      },
      {
        id: "stop-dylans-cafe",
        name: "Dylan's Café",
        coordinates: { lat: 25.5615, lng: 91.9023 },
        placeNameQuery: "Dylan's Cafe Risa Colony Shillong",
        description: "A gorgeous retro tribute to Bob Dylan, featuring wall-to-wall vinyl painting tiles, great milkshakes, and mountain drafts."
      },
      {
        id: "stop-rynsan-cafe",
        name: "Rynsan Café",
        coordinates: { lat: 25.5681, lng: 91.8905 },
        placeNameQuery: "Rynsan Cafe Shillong",
        description: "An artisanal culinary experience blending modern bakery with authentic indigenous Khasi ingredients."
      }
    ]
  },
  {
    id: "upper-shillong-pine-trail",
    name: "Upper Shillong Pine & Falls Hike",
    description: "Discover misty pine ridges, dynamic forest pathways, and the sacred cascading waters of Elephant Falls in Upper Shillong.",
    difficulty: "Medium",
    type: "nature",
    distanceFallback: "8.5 km",
    durationFallback: "1 hr 45 mins",
    stops: [
      {
        id: "stop-elephant-falls",
        name: "Elephant Falls Viewpoint",
        coordinates: { lat: 25.5398, lng: 91.8601 },
        placeNameQuery: "Elephant Falls Shillong Meghalaya",
        description: "A historic three-tier cascade surrounded by dense green ferns. Named by British guides after an elephant-shaped rock."
      },
      {
        id: "stop-shillong-peak",
        name: "Shillong Peak Heights",
        coordinates: { lat: 25.5292, lng: 91.8795 },
        placeNameQuery: "Shillong Peak Meghalaya",
        description: "The highest mountain point in Shillong, offering panoramic ridge lookouts over the city and distant plains of Bangladesh."
      }
    ]
  },
  {
    id: "ward-lake-heritage-walk",
    name: "Wards Lake & Cathedral Stroll",
    description: "An elegant urban walk winding past colonial-era flower gardens, serene forest paths, and historic visual landmarks.",
    difficulty: "Easy",
    type: "urban walk",
    distanceFallback: "1.5 km",
    durationFallback: "20 mins",
    stops: [
      {
        id: "stop-wards-lake",
        name: "Ward's Lake Garden",
        coordinates: { lat: 25.5760, lng: 91.8885 },
        placeNameQuery: "Ward's Lake Shillong",
        description: "A horseshoe-shaped colonial reservoir bordered by pristine cobblestone pathways and elegant weeping willow overhangs."
      },
      {
        id: "stop-cathedral-mary",
        name: "Cathedral of Mary Help of Christians",
        coordinates: { lat: 25.5684, lng: 91.9038 },
        placeNameQuery: "Cathedral of Mary Help of Christians Shillong",
        description: "A majestic high-gothic cathedral built by German Salesian guides, resting atop olive pine hilltops."
      },
      {
        id: "stop-pb-crossroads",
        name: "Police Bazar Commercial Centre",
        coordinates: { lat: 25.5788, lng: 91.8920 },
        placeNameQuery: "Police Bazar Shillong Meghalaya",
        description: "Shillong's buzzing downtown circle. Great for street-side Jadoh stalls, traditional bamboo baskets, and local markets."
      }
    ]
  },
  {
    id: "cherry-blossom-pine-woods",
    name: "Nongthymmai Forest Canopy Drive",
    description: "A beautiful exploration showcasing Himalayan cherry blossom tracks, local college pine woods, and hidden valleys.",
    difficulty: "Hard", // For longer distance
    type: "nature",
    distanceFallback: "12.4 km",
    durationFallback: "2 hrs 10 mins",
    stops: [
      {
        id: "stop-[#1]",
        name: "Nongrim Hills Pine Ring",
        coordinates: { lat: 25.5712, lng: 91.9122 },
        placeNameQuery: "Nongrim Hills Shillong",
        description: "A scenic high-ground residential neighborhood with wonderful lookouts of the eastern ridges."
      },
      {
        id: "stop-[#2]",
        name: "Laitkor Pine Ridge",
        coordinates: { lat: 25.5348, lng: 91.9215 },
        placeNameQuery: "Laitkor Shillong Meghalaya",
        description: "A tranquil highland woodland belt with endless lines of whispering mountain pine trees."
      }
    ]
  }
];

export const DIFFICULTY_OPTIONS = ["all", "Easy", "Medium", "Hard"];
export const TYPE_OPTIONS = ["all", "urban walk", "nature", "cafe crawl"];
