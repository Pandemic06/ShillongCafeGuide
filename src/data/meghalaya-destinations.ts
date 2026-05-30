export type DestinationType =
  | "cafe"
  | "waterfall"
  | "scenic"
  | "cultural"
  | "adventure"
  | "restaurant"
  | "hidden_gem"
  | "market"
  | "stay";

export interface Destination {
  id: string;
  name: string;
  type: DestinationType;
  region: string;
  coordinates: { lat: number; lng: number };
  description: string;
  tagline: string;
  highlights: string[];
  bestTime?: string;
  entryFee?: string;
  duration?: string;
  image?: string;
}

export const MEGHALAYA_DESTINATIONS: Destination[] = [
  // ── SHILLONG ─────────────────────────────────────────────
  {
    id: "wards-lake",
    name: "Ward's Lake",
    type: "scenic",
    region: "Shillong",
    coordinates: { lat: 25.5706, lng: 91.8866 },
    description:
      "A serene colonial-era horseshoe lake in the heart of Shillong, surrounded by manicured gardens and willow trees. Paddle boats drift across still green water while the surrounding Khasi Hills frame every photograph.",
    tagline: "The Colonial Heart of the Hill Station",
    highlights: ["Paddle Boating", "Evening Promenade", "Colonial Gardens", "Photography"],
    bestTime: "October – March",
    entryFee: "₹10",
    duration: "1–2 hours",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "shillong-peak",
    name: "Shillong Peak",
    type: "scenic",
    region: "Shillong",
    coordinates: { lat: 25.5354, lng: 91.9060 },
    description:
      "The highest point in Meghalaya at 1,965 m, offering a 360° panorama of the entire Khasi Hills and distant plains of Bangladesh on a clear day. The air is thin, the silence profound.",
    tagline: "Standing Above the Clouds",
    highlights: ["Panoramic Vista", "Air Force Area Permit Required", "Sunrise Photography", "Cloud Sea"],
    bestTime: "November – February",
    entryFee: "₹20 + permit",
    duration: "Half day",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "elephant-falls",
    name: "Elephant Falls",
    type: "waterfall",
    region: "Shillong",
    coordinates: { lat: 25.5371, lng: 91.8731 },
    description:
      "A triple-tiered waterfall named after an elephant-shaped rock that once stood at its base. The three cascades reveal themselves dramatically as you descend terraced stone steps through the misty forest.",
    tagline: "Three Veils of Khasi Water",
    highlights: ["Triple Tier Cascade", "Forest Trail", "Photography", "Picnic Spot"],
    bestTime: "July – October (monsoon peak)",
    entryFee: "₹20",
    duration: "1–2 hours",
    image: "https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "don-bosco-museum",
    name: "Don Bosco Museum",
    type: "cultural",
    region: "Shillong",
    coordinates: { lat: 25.5698, lng: 91.8837 },
    description:
      "Northeast India's most comprehensive museum of indigenous cultures, spread across seven floors inside a striking modern building. Over 8,000 artifacts document the living traditions of 200+ Northeast tribes.",
    tagline: "Eight Floors of Northeast Soul",
    highlights: ["7-Floor Indigenous Gallery", "Rooftop Skywalk", "Tribal Costumes", "Oral History Archive"],
    bestTime: "Year round",
    entryFee: "₹100",
    duration: "3–4 hours",
    image: "https://images.unsplash.com/photo-1582037928769-181f2644ecb7?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "police-bazaar",
    name: "Police Bazaar",
    type: "market",
    region: "Shillong",
    coordinates: { lat: 25.5760, lng: 91.8820 },
    description:
      "The beating commercial heart of Shillong — a chaotic, electric street market where Khasi textiles, fresh produce, street food, and music shops exist in joyful proximity. The city's best people-watching.",
    tagline: "The Market at the Heart of the Hills",
    highlights: ["Khasi Handicrafts", "Street Food", "Live Music Shops", "Evening Buzz"],
    bestTime: "Year round (evenings most lively)",
    duration: "2–3 hours",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "umiam-lake",
    name: "Umiam Lake",
    type: "scenic",
    region: "Shillong",
    coordinates: { lat: 25.6526, lng: 91.9027 },
    description:
      "A vast man-made reservoir 15 km north of Shillong, ringed by pine-forested hills and reflecting the sky in its turquoise waters. Water sports, kayaking, and bungee make it Shillong's adventure gateway.",
    tagline: "The Blue Eye of the Hills",
    highlights: ["Kayaking", "Boating", "Water Sports", "Pine Forest Walks", "Bungee Jumping"],
    bestTime: "October – April",
    entryFee: "Free (activities extra)",
    duration: "Half–full day",
    image: "https://images.unsplash.com/photo-1439853949212-36589f288346?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "laitlum-canyons",
    name: "Laitlum Canyons",
    type: "scenic",
    region: "Shillong",
    coordinates: { lat: 25.4908, lng: 91.9833 },
    description:
      "Meghalaya's Grand Canyon — a dramatic clifftop revelation of deep green valleys, plunging gorges, and cloud rivers far below. One of the most breathtaking viewpoints in all of Northeast India.",
    tagline: "End of the Hills, Edge of the World",
    highlights: ["Canyon Viewpoint", "Photography", "Village Trek", "Sunrise/Sunset"],
    bestTime: "October – March",
    duration: "Half day",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "mawphlang-sacred-grove",
    name: "Mawphlang Sacred Forest",
    type: "adventure",
    region: "Shillong",
    coordinates: { lat: 25.4598, lng: 91.8012 },
    description:
      "An ancient sacred forest preserved by the Khasi tradition of 'Lawkyntang' — nothing may be removed from these woods. The result is a primeval forest where 200-year-old trees form cathedral canopies over rare orchids and medicinal plants.",
    tagline: "Ancient Forest Where Nothing Is Taken",
    highlights: ["Sacred Grove Walk", "Rare Orchids", "Guided Khasi Cultural Tour", "Medicinal Plants"],
    bestTime: "October – April",
    entryFee: "₹50 + guide fee",
    duration: "2–3 hours",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1200",
  },

  // ── CHERRAPUNJI ──────────────────────────────────────────
  {
    id: "nohkalikai-falls",
    name: "Nohkalikai Falls",
    type: "waterfall",
    region: "Cherrapunji",
    coordinates: { lat: 25.2484, lng: 91.6815 },
    description:
      "India's tallest plunge waterfall at 340 m, named after the tragic legend of Ka Likai. The falls plunge dramatically into a vivid green pool in the gorge below — most spectacular during monsoon when the sheer volume is overwhelming.",
    tagline: "India's Tallest Plunge Waterfall",
    highlights: ["340m Plunge Fall", "Viewpoint Cliff Walk", "Monsoon Peak Experience", "Tragic Legend"],
    bestTime: "July – September (monsoon)",
    entryFee: "₹20",
    duration: "2–3 hours",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "seven-sisters-falls",
    name: "Seven Sisters Falls",
    type: "waterfall",
    region: "Cherrapunji",
    coordinates: { lat: 25.3025, lng: 91.6879 },
    description:
      "Seven parallel streams cascading down a single cliff face — a sight uniquely visible only during monsoon. The falls appear and disappear with the rainfall, making each visit a different experience.",
    tagline: "Seven Streams That Speak After Rain",
    highlights: ["Seven Parallel Cascades", "Monsoon-Only Peak", "Cliff Viewpoint", "Bangladesh Valley View"],
    bestTime: "July – September",
    entryFee: "Free",
    duration: "1–2 hours",
    image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "mawsmai-cave",
    name: "Mawsmai Cave",
    type: "adventure",
    region: "Cherrapunji",
    coordinates: { lat: 25.2804, lng: 91.7051 },
    description:
      "A 150-meter illuminated limestone cave with cathedral chambers, stalactites, and passages narrow enough to turn you sideways. One of the most accessible cave experiences in Northeast India.",
    tagline: "The Cathedral Beneath the Limestone",
    highlights: ["Stalactite Chambers", "Illuminated Path", "150m Cave Walk", "Limestone Formations"],
    bestTime: "October – May",
    entryFee: "₹30",
    duration: "45 minutes",
    image: "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "double-decker-bridge",
    name: "Double Decker Living Root Bridge",
    type: "adventure",
    region: "Cherrapunji",
    coordinates: { lat: 25.2498, lng: 91.7247 },
    description:
      "A marvel of Khasi bio-engineering — two living bridges stacked atop each other, grown over centuries from the aerial roots of rubber fig trees across a forest stream. A 3,500-step trek through breathtaking jungle to reach it.",
    tagline: "Grown Over 500 Years of Patience",
    highlights: ["Living Root Bridge", "3,500 Steps Trek", "Jungle Walk", "Natural Pool"],
    bestTime: "October – April",
    duration: "Full day",
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "wei-sawdong-falls",
    name: "Wei Sawdong Falls",
    type: "waterfall",
    region: "Cherrapunji",
    coordinates: { lat: 25.3150, lng: 91.6950 },
    description:
      "A lesser-known three-tiered waterfall near Cherrapunji, accessible via a short but steep jungle trail. The reward is a natural pool at the base, entirely surrounded by rock and forest — perfect for a hidden swim.",
    tagline: "Cherrapunji's Best-Kept Cascade Secret",
    highlights: ["Three-Tier Cascade", "Natural Swimming Pool", "Jungle Trail", "Hidden Gem"],
    bestTime: "July – October",
    duration: "3–4 hours",
    image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&q=80&w=1200",
  },

  // ── DAWKI ─────────────────────────────────────────────────
  {
    id: "dawki-river",
    name: "Dawki — Umngot River",
    type: "hidden_gem",
    region: "Dawki",
    coordinates: { lat: 25.1919, lng: 92.0261 },
    description:
      "The Umngot River at Dawki is so crystal-clear that boats appear to float on air above the riverbed. The Bangladesh border runs through this river, and the turquoise water is arguably Meghalaya's most photogenic sight.",
    tagline: "Where Boats Float on Liquid Glass",
    highlights: ["Crystal Clear River", "Boat Rides", "Indo-Bangladesh Border", "Underwater Photography"],
    bestTime: "October – March (pre-monsoon clearest)",
    duration: "Half–full day",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1200",
  },

  // ── MAWLYNNONG ───────────────────────────────────────────
  {
    id: "mawlynnong-village",
    name: "Mawlynnong Village",
    type: "cultural",
    region: "Dawki",
    coordinates: { lat: 25.2002, lng: 92.0421 },
    description:
      "Asia's Cleanest Village — a spotless Khasi community where community-maintained gardens, bamboo waste bins, and a strict cleanliness ethos have created a village that shames most cities. The living root bridge nearby is walkable.",
    tagline: "Asia's Cleanest Village",
    highlights: ["Community Gardens", "Living Root Bridge Walk", "Khasi Village Life", "Sky Walk"],
    bestTime: "October – April",
    duration: "Half day",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=1200",
  },

  // ── JOWAI ─────────────────────────────────────────────────
  {
    id: "thadlaskein-lake",
    name: "Thadlaskein Lake",
    type: "scenic",
    region: "Jowai",
    coordinates: { lat: 25.4459, lng: 92.2011 },
    description:
      "A sacred Jaintia lake surrounded by gentle hills, where the community performs traditional rituals. The lake has a serene, melancholy beauty — particularly in mist — and the surrounding forest walk is genuinely rewarding.",
    tagline: "Sacred Waters of the Jaintia Kingdom",
    highlights: ["Sacred Lake", "Forest Walk", "Jaintia Cultural Site", "Mist Photography"],
    bestTime: "October – March",
    duration: "2–3 hours",
    image: "https://images.unsplash.com/photo-1439853949212-36589f288346?auto=format&fit=crop&q=80&w=1200",
  },

  // ── HIDDEN GEMS ──────────────────────────────────────────
  {
    id: "krang-suri-falls",
    name: "Krang Suri Falls",
    type: "waterfall",
    region: "Jowai",
    coordinates: { lat: 25.1890, lng: 92.4800 },
    description:
      "Possibly Meghalaya's most beautiful waterfall — a brilliant blue-green swimming hole fed by a multi-tiered cascade, hidden in a jungle clearing near Amlarem. The water color is otherworldly.",
    tagline: "The Blue Jungle Pool at the End of the Trail",
    highlights: ["Turquoise Swimming Hole", "Multi-tier Falls", "Jungle Trail", "Rock Jumping"],
    bestTime: "October – April",
    duration: "Half day",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "nartiang-monoliths",
    name: "Nartiang Monoliths",
    type: "hidden_gem",
    region: "Jowai",
    coordinates: { lat: 25.5086, lng: 92.3434 },
    description:
      "The largest collection of monoliths in Asia — a field of ancient standing stones raised by Jaintia kings, some towering over 8 meters, arranged in mysterious configurations on the edge of Nartiang village.",
    tagline: "Ancient Stones Standing Since the Kings",
    highlights: ["Asia's Largest Monolith Field", "Jaintia Kingdom History", "Stone Forest", "Off the Beaten Path"],
    bestTime: "October – March",
    duration: "1–2 hours",
    image: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: "mawryngkneng-hills",
    name: "Mawryngkneng Hills",
    type: "hidden_gem",
    region: "Shillong",
    coordinates: { lat: 25.5120, lng: 91.9570 },
    description:
      "Meghalaya's secret rolling highlands — open meadows at elevation with sweeping valley views and almost no tourists. The hour-long drive from Shillong winds through pine villages and passes rhododendron forests in bloom.",
    tagline: "Meghalaya's Undiscovered Highland Meadows",
    highlights: ["Meadow Walk", "Valley Views", "Zero Crowds", "Pine Village Drive"],
    bestTime: "March – May (rhododendron bloom)",
    duration: "Half day",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200",
  },
];

export const DESTINATION_CATEGORIES = [
  { key: "all", label: "All Destinations", emoji: "🗺️" },
  { key: "cafe", label: "Cafés", emoji: "☕" },
  { key: "waterfall", label: "Waterfalls", emoji: "💧" },
  { key: "scenic", label: "Scenic Spots", emoji: "⛰️" },
  { key: "adventure", label: "Adventure", emoji: "🧗" },
  { key: "cultural", label: "Cultural Sites", emoji: "🏛️" },
  { key: "hidden_gem", label: "Hidden Gems", emoji: "💎" },
  { key: "market", label: "Markets", emoji: "🛍️" },
  { key: "restaurant", label: "Restaurants", emoji: "🍽️" },
] as const;

export const TYPE_COLORS: Record<DestinationType | "all", string> = {
  all: "#7c2d12",
  cafe: "#b45309",
  waterfall: "#0369a1",
  scenic: "#059669",
  adventure: "#7c3aed",
  cultural: "#be123c",
  hidden_gem: "#0891b2",
  market: "#d97706",
  restaurant: "#dc2626",
  stay: "#92400e",
};
