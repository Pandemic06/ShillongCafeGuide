import React, { useState, useEffect, useRef } from "react";
import {
  Compass, MapPin, Info, ArrowUpRight, Cloud, Globe, Filter, CheckCircle, Clock, Check, Trash, Eye, EyeOff,
  ChevronLeft, ChevronRight, Share2, CornerRightDown, Footprints, Heart, ShieldAlert, Waves, Sparkles,
  Tent, School, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Map as MapIcon, Loader2, Navigation, RefreshCw, Layers,
  Compass as CompassIcon, BookOpen, MapPin as MapPinIcon, HeartHandshake, Backpack, CloudRain, Shield, Coins, LifeBuoy,
  Trash2, Landmark, Coffee, Maximize2, Minimize2, Plus, X, Star, ArrowDownUp, CheckSquare, Square, ThumbsUp
} from "lucide-react";
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { GOOGLE_MAPS_API_KEY, hasValidKey } from "../config";
import { PLANNER_ROUTES, PlannerLocation, PlannerRoute, RHINO_GYAN_RULES } from "../data/plannerData";
import { motion, AnimatePresence } from "motion/react";

// --- Typings ---
interface ThemedJourney {
  id: string;
  name: string;
  description: string;
  routeIds: string[];
  banner: string;
  primaryFilter: string;
}

interface SavedRouteState {
  routeId: string;
  activeStopIds: string[];
  customOrderIds: string[];
  addedDetours?: PlannerLocation[]; // Dynamic user detours
}

// --- Curated Themed Journeys ---
const THEMED_JOURNEYS: ThemedJourney[] = [
  {
    id: "waterfall-chasers",
    name: "The Waterfall Chaser",
    description: "Deep jungle cascades, secret plunges, and pristine three-tiered pools in the misty river gorges of Sohra and Jowai.",
    routeIds: ["cherrapunji", "wei-sawdong", "jowai"],
    banner: "https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?auto=format&fit=crop&w=800&q=80",
    primaryFilter: "Waterfalls"
  },
  {
    id: "cave-explorers",
    name: "Caves & Canyons Expedition",
    description: "Venture deep underground into ancient calcareous fossil tunnels, dark crevices, and remote river canyons.",
    routeIds: ["cherrapunji", "silchar", "tura"],
    banner: "https://images.unsplash.com/photo-1548252737-12962635ccca?auto=format&fit=crop&w=800&q=80",
    primaryFilter: "Adventure"
  },
  {
    id: "summit-backpackers",
    name: "Canyons & Cloud Viewpoints",
    description: "Hike along ancient trade trails looking over deep green cloud-covered canyon rims into the plains.",
    routeIds: ["laitlum", "maysynram", "nongstoin"],
    banner: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    primaryFilter: "Scenic Viewpoints"
  },
  {
    id: "cozy-wanderers",
    name: "Highlands Cafes & Villages",
    description: "Enjoy guitar acoustic circles, local woodfires, sweet berry brews, and pine-scented lanes.",
    routeIds: ["city", "umiam", "guwahati"],
    banner: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
    primaryFilter: "Cafés"
  }
];

// --- Curated Beautiful Banner Images per Route Group ---
const ROUTE_BANNER_IMAGES: Record<string, string> = {
  city: "https://images.unsplash.com/photo-1548252737-12962635ccca?auto=format&fit=crop&w=800&q=80",
  cherrapunji: "https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?auto=format&fit=crop&w=800&q=80",
  "wei-sawdong": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
  dawki: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
  laitlum: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  jowai: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
  silchar: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80",
  maysynram: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80",
  nongstoin: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
  tura: "https://images.unsplash.com/photo-1618083707368-b3823daa2726?auto=format&fit=crop&w=800&q=80",
  umiam: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
  guwahati: "https://images.unsplash.com/photo-1596701062951-df6890f50ab1?auto=format&fit=crop&w=800&q=80"
};

// --- Custom Unsplash Pictures per category for Live Map Markers ---
const CATEGORY_MODERN_IMAGES: Record<string, string> = {
  "Tourist Spot": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  "Eatery": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=400&q=80",
  "Trek": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80",
  "Picnic Spot": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80",
  "Misc": "https://images.unsplash.com/photo-1548252737-12962635ccca?auto=format&fit=crop&w=400&q=80"
};

// --- Base Commencing / Concluding Landmark Station ---
const RHINO_AUDITORIUM: PlannerLocation = {
  id: "rhino-auditorium",
  name: "Pinewalk Crossing Near Rhino Auditorium",
  type: "Misc",
  distanceKm: 0,
  timeEstimate: "0:00",
  remarks: "Mandatory base start and end station of all local exploration routes (Secretariat Hills).",
  coordinates: { lat: 25.569811, lng: 91.879197 }
};

// --- Custom Modern Travel Tips (Evolved "Rhino Gyan") ---
interface TravelTipCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  tip: string;
  colorClass: string;
}

const CIVILIZED_TRAVEL_TIPS: TravelTipCategory[] = [
  {
    id: "connectivity",
    title: "Connectivity",
    icon: <Globe className="w-4 h-4" />,
    tip: "Erratic coordinates and intermittent cell signal exist once you descend south of Shillong. Jio holds solid reach near major Tura centers, but completely drops in the deep canyons. Always pre-download offline area coverage.",
    colorClass: "bg-amber-950/20 text-amber-200 border-amber-800"
  },
  {
    id: "weather",
    title: "Mountain Weather",
    icon: <CloudRain className="w-4 h-4" />,
    tip: "Thick rolling cloud envelopment occurs rapidly along the gorges. Drive slowly with low beams, and maintain a warm outerwear set in the vehicle for sudden temperature falls above 1,500m.",
    colorClass: "bg-sky-950/20 text-sky-200 border-sky-800"
  },
  {
    id: "trek-safety",
    title: "Wilderness Trekking",
    icon: <Footprints className="w-4 h-4" />,
    tip: "Offbeat bamboo paths and limestone staircases are narrow and heavily slick. Hiring local guides in village bases (such as Tyrna or Brishirnot) is recommended for navigation safety.",
    colorClass: "bg-orange-950/20 text-orange-200 border-orange-850"
  },
  {
    id: "etiquette",
    title: "Local Traditions",
    icon: <Heart className="w-4 h-4" />,
    tip: "Deep respect for Khasi land rules is essential. Ask the local headman before entering sacred groved forests, never chip sacred rocks, and never extract organic materials.",
    colorClass: "bg-rose-950/20 text-rose-200 border-rose-800"
  },
  {
    id: "packing",
    title: "Packing Essentials",
    icon: <Backpack className="w-4 h-4" />,
    tip: "Bring walking slides, light layered outerwear, waterproof pouches, solid power packs, water-resistant footwear, and a dry transition set for post-swim comfort.",
    colorClass: "bg-emerald-950/20 text-emerald-200 border-emerald-800"
  },
  {
    id: "driving",
    title: "Steep Driving Bends",
    icon: <Navigation className="w-4 h-4" />,
    tip: "Congestion peaks around school lanes in Laitumkhrah (8:00 AM & 2:30 PM) on weekdays. Opt for the bypass cutting via Shillong Peak to shave hours off your southern route.",
    colorClass: "bg-indigo-950/20 text-indigo-200 border-indigo-805"
  }
];

const ALL_FILTERS = [
  "Cafés", "Scenic Viewpoints", "Waterfalls", "Swimming Spots", "Photography",
  "Easy Access", "Hidden Gems", "Treks", "Family Friendly", "Adventure"
];

// Helper to categorize and tag items on the fly
function matchesFilter(loc: PlannerLocation, filter: string, routeDistance: number): boolean {
  const normName = loc.name.toLowerCase();
  const normRemarks = loc.remarks.toLowerCase();
  const type = loc.type;

  switch (filter) {
    case "Cafés":
      return type === "Eatery" || normName.includes("café") || normName.includes("cafe") || normName.includes("dhaba");
    case "Scenic Viewpoints":
      return normName.includes("view") || normName.includes("peak") || normName.includes("canyon") || normName.includes("valley") || normName.includes("cliff");
    case "Waterfalls":
      return normName.includes("fall") || normName.includes("cascade");
    case "Swimming Spots":
      return normRemarks.includes("swim") || normRemarks.includes("pool") || normRemarks.includes("beach") || normRemarks.includes("lake") || normRemarks.includes("kayak");
    case "Photography":
      return normRemarks.includes("photo") || normRemarks.includes("scenic") || normRemarks.includes("sunset") || normRemarks.includes("view") || normRemarks.includes("landscape");
    case "Easy Access":
      return normRemarks.includes("easy") || normRemarks.includes("car can reach") || normRemarks.includes("not much of walk") || normRemarks.includes("highway");
    case "Hidden Gems":
      return normRemarks.includes("less popular") || normRemarks.includes("remote") || normRemarks.includes("hidden") || normRemarks.includes("untouched") || normRemarks.includes("offbeat");
    case "Treks":
      return type === "Trek" || normRemarks.includes("trek") || normRemarks.includes("climb") || normRemarks.includes("hike") || normRemarks.includes("walk");
    case "Family Friendly":
      return normRemarks.includes("family") || normRemarks.includes("kids") || normRemarks.includes("easy") || (type === "Eatery" && !normRemarks.includes("poor"));
    case "Adventure":
      return normRemarks.includes("adventure") || normRemarks.includes("dangerous") || normRemarks.includes("risky") || normRemarks.includes("stairs") || normRemarks.includes("climb") || normRemarks.includes("descend");
    default:
      return true;
  }
}

// Custom serpentine mathematical path generator to mimic actual mountain road segments
function generateSerpentinePath(coords: google.maps.LatLngLiteral[]): google.maps.LatLngLiteral[] {
  if (coords.length < 2) return coords;
  const densePath: google.maps.LatLngLiteral[] = [];
  
  for (let i = 0; i < coords.length - 1; i++) {
    const start = coords[i];
    const end = coords[i+1];
    
    // Interpolate keypoints and add natural terrain bends
    const segments = 15;
    for (let j = 0; j <= segments; j++) {
      const t = j / segments;
      const lat = start.lat + (end.lat - start.lat) * t;
      const lng = start.lng + (end.lng - start.lng) * t;
      
      // Calculate a soft perpendicular bend
      let offsetLat = 0;
      let offsetLng = 0;
      if (j > 0 && j < segments) {
        const headingLat = end.lat - start.lat;
        const headingLng = end.lng - start.lng;
        const distance = Math.sqrt(headingLat * headingLat + headingLng * headingLng);
        if (distance > 0) {
          const perpLat = -headingLng / distance;
          const perpLng = headingLat / distance;
          // Sine wave sequence generates believable horse-shoe curves
          const sineFreq = Math.sin(t * Math.PI * 3.5);
          const weight = 0.012 * sineFreq * (1 - Math.pow(2 * t - 1, 2));
          offsetLat = perpLat * weight;
          offsetLng = perpLng * weight;
        }
      }
      
      densePath.push({
        lat: lat + offsetLat,
        lng: lng + offsetLng
      });
    }
  }
  
  return densePath;
}

// --- Dynamic Real Road Google Maps Directions Renderer Component ---
function LiveRoutePolylines({
  activeCoords,
  travelMode,
  isScenicMode
}: {
  activeCoords: google.maps.LatLngLiteral[];
  travelMode: string;
  isScenicMode: boolean;
}) {
  const map = useMap();
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!map) return;

    // Create the Directions Renderer with custom styled polyline
    const renderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true, // We draw our custom interactive pins instead
      preserveViewport: true,
      polylineOptions: {
        strokeColor: isScenicMode ? "#b45309" : "#4b5563", // Amber premium gold or dark slate
        strokeWeight: 4.5,
        strokeOpacity: 0.9,
      }
    });

    renderer.setMap(map);
    setDirectionsRenderer(renderer);

    return () => {
      renderer.setMap(null);
    };
  }, [map, isScenicMode]);

  useEffect(() => {
    if (!map || !directionsRenderer || activeCoords.length < 2) return;

    const directionsService = new google.maps.DirectionsService();
    const origin = activeCoords[0];
    const destination = activeCoords[activeCoords.length - 1];

    // Google Directions API limits max 8 intermediate waypoints for regular requests
    const middleCoords = activeCoords.slice(1, -1);
    const maxWaypoints = 8;
    const step = Math.max(1, Math.ceil(middleCoords.length / maxWaypoints));
    const prunedWaypoints = middleCoords
      .filter((_, idx) => idx % step === 0)
      .slice(0, maxWaypoints)
      .map(coord => ({
        location: new google.maps.LatLng(coord.lat, coord.lng),
        stopover: true
      }));

    let mappedMode = google.maps.TravelMode.DRIVING;
    if (travelMode === "WALKING") mappedMode = google.maps.TravelMode.WALKING;
    if (travelMode === "BICYCLING") mappedMode = google.maps.TravelMode.BICYCLING;

    directionsService.route(
      {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        waypoints: prunedWaypoints,
        travelMode: mappedMode,
        optimizeWaypoints: true,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);
          
          // Fit map bounds smoothly
          const route = result.routes[0];
          if (route && route.bounds) {
            map.fitBounds(route.bounds);
          }
        } else {
          // Internal fallback if API returns over limit or query errors
          const serpentineLine = new google.maps.Polyline({
            path: generateSerpentinePath(activeCoords),
            strokeColor: isScenicMode ? "#d97706" : "#6b7280",
            strokeOpacity: 0.85,
            strokeWeight: 4,
            map: map
          });
          
          // Cleanup serpentine line
          return () => {
            serpentineLine.setMap(null);
          };
        }
      }
    );
  }, [map, directionsRenderer, activeCoords, travelMode, isScenicMode]);

  return null;
}

  const getGoogleMapsSearchQuery = (loc: PlannerLocation, specRouteId?: string) => {
    if (loc.id === "rhino-auditorium" || loc.id === "rhino-auditorium-destination") {
      return "Pinewalk Crossing Near Rhino Auditorium, Shillong, Meghalaya, India";
    }
    const cleanName = loc.name.replace(/['’]/g, "");
    
    // Explicit mappings for all locations to have incredibly accurate names for direct mapping inside GMaps
    const mappings: Record<string, string> = {
      "rhino-prerna": "Rhino Prerna Sthal, Shillong, Meghalaya, India",
      "rhino-heritage": "Rhino Heritage Museum, Shillong, Meghalaya, India",
      "all-saints": "All Saints Cathedral, Shillong, Meghalaya, India",
      "wards-lake": "Wards Lake, Shillong, Meghalaya, India",
      "police-bazaar-spot": "Police Bazar, Shillong, Meghalaya, India",
      "city-hut-dhaba": "City Hut Dhaba, Oakland Road, Shillong, Meghalaya, India",
      "cathedral-mary-help": "Cathedral of Mary Help of Christians, Laitumkhrah, Shillong, Meghalaya, India",
      "dejavu": "Dejavu Restaurant, Laitumkhrah, Shillong, Meghalaya, India",
      "dylans-cafe-spot": "Dylans Cafe, Shillong, Meghalaya, India",
      "tripura-castle-spot": "The Heritage Club - Tripura Castle, Shillong, Meghalaya, India",
      "sweet-fall": "Sweet Falls, Shillong, Meghalaya, India",
      "sunset-cafe-spot": "Sunset Cafe, Shillong, Meghalaya, India",
      "ml05-cafe-spot": "ML05 Cafe, Shillong, Meghalaya, India",
      "don-bosco": "Don Bosco Museum, Mawlai, Shillong, Meghalaya, India",
      "ahavah-shillong-spot": "Ahavah, Laitumkhrah, Shillong, Meghalaya, India",
      "nonna-mei-spot": "Nonna Mei Restaurant, Laitumkhrah, Shillong, Meghalaya, India",
      "the-feast-house-spot": "The Feast House, Shillong, Meghalaya, India",
      "the-yeeastern-civilisation-spot": "The Yeastern Civilisation, Laitumkhrah, Shillong, Meghalaya, India",
      "shillong-peak-spot": "Shillong Peak, Laitkor, Shillong, Meghalaya, India",
      "rhododendron-trek": "Rhododendron Trek, Shillong, Meghalaya, India",
      
      // Cherrapunji Route
      "airforce-museum": "Air Force Museum, Shillong, Meghalaya, India",
      "elephant-falls": "Elephant Falls, Shillong, Meghalaya, India",
      "woodstock-farmhouse": "Woodstock Farmhouse, Shillong, Meghalaya, India",
      "bulls-trek": "Wahniangleng Trail, Meghalaya, India",
      "tall-timbers-spot": "Tall Timbers at Black Bridge Resort, Kyrdemkhla, Meghalaya, India",
      "cafe-cherrapunjee-spot": "Café Cherrapunjee, Sohra Laitryngew, Meghalaya, India",
      "mawkdok-valley": "Mawkdok Dympep Valley View Point, Meghalaya, India",
      "cloud-country": "Cloud Country Cafe and Diner, Cherrapunji, Meghalaya, India",
      "misty-hills": "Misty Hills Restaurant, Cherrapunji, Meghalaya, India",
      "wah-kaba": "Wah Kaba Falls, Cherrapunji, Meghalaya, India",
      "arwah-caves": "Arwah Cave, Cherrapunji, Meghalaya, India",
      "seven-sister-view": "Seven Sisters Waterfalls, Cherrapunji, Meghalaya, India",
      "polo-orchid-cherra": "Polo Orchid Resort Cherrapunjee, Meghalaya, India",
      "khoh-ramhah": "Khoh Ramhah, Meghalaya, India",
      "bangladesh-view": "Bangladesh View Point, Cherrapunji, Meghalaya, India",
      "kynrem-falls": "Kynrem Falls, Cherrapunji, Meghalaya, India",
      "rangkylliaw-bridge": "Rangkylliaw Suspension Bridge, Meghalaya, India",
      "kongthong-whistling": "Kongthong Village, Meghalaya, India",
      "garden-of-caves": "Garden Of Caves, Laitryngew, Meghalaya, India",
      "mawmluh-caves": "Mawmluh Cave, Cherrapunji, Meghalaya, India",
      "rainbow-falls": "Rainbow Falls, Nongriat, Meghalaya, India",
      "nohkalikai": "Nohkalikai Waterfalls, Cherrapunji, Meghalaya, India",
      "jiva-resort-spot": "Jiva Resort Cherrapunjee, Meghalaya, India",
      "mawsmai-caves": "Mawsmai Cave, Cherrapunji, Meghalaya, India",
      "sohbar-bridge": "Sohbar Bridge, Meghalaya, India",
      "double-decker-bridge": "Double Decker Living Root Bridge, Nongriat, Meghalaya, India",
      
      // Wei Sawdong Route
      "lyngksiar-fall": "Lyngksiar Falls, Sohryngkham, Meghalaya, India",
      "janailar-falls": "Janailar Falls, Meghalaya, India",
      "prut-fall": "Prut Falls, Meghalaya, India",
      "mawsawa-falls": "Mawsawa Falls, Meghalaya, India",
      "wei-sawdong-falls": "Wei Sawdong Falls, Cherrapunji, Meghalaya, India",
      "dainthlen-falls": "Dainthlen Falls, Cherrapunji, Meghalaya, India",
      
      // Dawki Route
      "mawjngih-viewpoint": "Mawjngih Lapynshongdor View Point, Meghalaya, India",
      "ka-bri-war": "Ka Bri War Resort, Pomshutia, Meghalaya, India",
      "byrdaw-falls": "Byrdaw Falls, Pomshutia, Meghalaya, India",
      "dawki-boat": "Dawki River Boating, Dawki, Meghalaya, India",
      "riwai-living-root": "Living Root Bridge, Riwai, Meghalaya, India",
      "balancing-rock": "Balancing Rock, Mawlynnong, Meghalaya, India",
      "mawlynnong-village": "Mawlynnong Village, Meghalaya, India",
      "bamboo-trail": "Mawryngkhang Bamboo Trail, Wahkhen, Meghalaya, India",
      "borhill-fall": "Borhill Falls, Dawki, Meghalaya, India",
      
      // Laitlum Route
      "daphiba-cafe-spot": "Daphiba Cafe, Laitlum, Meghalaya, India",
      "laitlum-canyon-spot": "Laitlum Canyons, Meghalaya, India",
      "nongjrong-viewpoint": "Nongjrong View Point, Nongjrong, Meghalaya, India",
      "pdem-falls": "Pdem Falls, Meghalaya, India",
      "wahrashi-falls": "Wahrashi Falls, Meghalaya, India",
      
      // Jowai Route
      "hotel-highwinds-lakeside": "Hotel Highwinds Lakeside, Jowai, Meghalaya, India",
      "tyrshi-falls": "Tyrshi Falls, Jowai, Meghalaya, India",
      "the-loomkyntoor-resort": "The Loomkyntoor Resort, Jowai, Meghalaya, India",
      "phe-phe-falls": "Phe Phe Falls, Jowai, Meghalaya, India",
      "krang-shuri": "Krang Shuri Waterfall, Jowai, Meghalaya, India",
      "shnongpdeng": "Shnongpdeng, Dawki, Meghalaya, India",
      "nartiang-monoliths": "Nartiang Monoliths, Jaintia Hills, Meghalaya, India",
      "nartiang-durga": "Nartiang Durga Temple, Meghalaya, India",
      "amkoi-sliang": "Amkoi Sliang Wah Umngot, Jaintia Hills, Meghalaya, India",
      "noh-kawang": "Noh Kawang Falls, Meghalaya, India",
      
      // Silchar Route
      "moopun-falls": "Moopun Falls, Jaintia Hills, Meghalaya, India",
      "umbyein-falls": "Umbyein Falls, Jaintia Hills, Meghalaya, India",
      "krem-chympe": "Krem Chympe, Jaintia Hills, Meghalaya, India",
      "khaddum-falls": "Khaddum Pieltleng Falls, Meghalaya, India",
      
      // Mawsynram Route
      "molis-fall": "Molis Falls, Mawsynram, Meghalaya, India",
      "mawjymbuin-caves": "Mawjymbuin Cave, Mawsynram, Meghalaya, India",
      "maysynram-spot": "Mawsynram Village, Meghalaya, India",
      "umkhakoi-water-park": "Umkhakoi Lake, Mawsynram, Meghalaya, India",
      "split-rock": "Split Rock, Mawsynram, Meghalaya, India",
      "sacred-forest": "Mawphlang Sacred Grove, Meghalaya, India",
      "ranikor": "Ranikor River Beach, Meghalaya, India",
      "david-scott": "David Scott Trail Entrance, Mawphlang, Meghalaya, India",
      
      // Nongstoin Route
      "hudoi-falls": "Khudoi Falls, Meghalaya, India",
      "kyllang-rock": "Kyllang Rock, Meghalaya, India",
      "dommurok-view": "Dommurok View Point, Meghalaya, India",
      "mawphanlur-spot": "Mawphanlur, West Khasi Hills, Meghalaya, India",
      "dzuko-valley-meghalaya": "Dzuko Valley, Meghalaya, India",
      "wei-weinia": "Wei Weinia Falls, West Khasi Hills, Meghalaya, India",
      
      // Tura Route
      "nasep-chiring": "Nasep Chiring Natural Pool, Meghalaya, India",
      "rongchang-rock": "Rongchang Rock Formation, Meghalaya, India",
      "siju-caves": "Siju Cave, South Garo Hills, Meghalaya, India",
      "siju-lodge": "Siju Tourist Lodge, South Garo Hills, Meghalaya, India",
      "jadesil-fish": "Jadesil Fish Sanctuary, Meghalaya, India",
      "wari-chora": "Wari Chora, Meghalaya, India",
      
      // Umiam Route
      "eastern-command": "Eastern Command Water Sports Node, Umiam, Meghalaya, India",
      "orchid-lake": "Orchid Lake Resort, Umiam, Meghalaya, India",
      "umiam-lake-spot": "Umiam Lake View Point, Umiam, Meghalaya, India",
      "bahut-chota-pani": "Bahut Chota Pani Lake, Umroi, Meghalaya, India",
      "ri-kynjai": "Ri Kynjai Resort, Umiam, Meghalaya, India",
      "lake-paradise": "Lake Paradise Camping Ground, Umiam, Meghalaya, India",
      
      // Guwahati Route
      "excelencia": "Excelencia Highway Restaurant, Assam, India",
      "jiva-veg-spot": "Jiva Veg Highway Restaurant, Nongpoh, Meghalaya, India",
      "alfresco-cruise": "Alfresco Grand Cruise, Guwahati, Assam, India",
      "pobitora": "Pobitora Wildlife Sanctuary, Assam, India",
      "kamakhya-temple": "Kamakhya Temple, Guwahati, Assam, India"
    };

    if (mappings[loc.id]) {
      return mappings[loc.id];
    }

    if (specRouteId === "guwahati") {
      return `${cleanName}, Guwahati, Assam, India`;
    }
    return `${cleanName}, Meghalaya, India`;
  };

export default function PlannersGuide() {
  // --- Core State ---
  const [selectedRouteId, setSelectedRouteId] = useState<string>("city");

  // Synchronize route selection from query param deep links for a cohesive user-flow
  useEffect(() => {
    const handleUrlSync = () => {
      const params = new URLSearchParams(window.location.search);
      const rParam = params.get("route");
      if (rParam && PLANNER_ROUTES.some(r => r.id === rParam)) {
        setSelectedRouteId(rParam);
      }
    };
    
    handleUrlSync();
    // Support Popstate events for immediate client-side clicks
    window.addEventListener("popstate", handleUrlSync);
    return () => window.removeEventListener("popstate", handleUrlSync);
  }, []);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [openTipId, setOpenTipId] = useState<string | null>(null);
  const [travelMode, setTravelMode] = useState<"DRIVING" | "TWO_WHEELER" | "BICYCLING" | "WALKING">("DRIVING");
  const [isScenicMode, setIsScenicMode] = useState<boolean>(true);
  const [hoveredLocId, setHoveredLocId] = useState<string | null>(null);
  const [selectedThemedId, setSelectedThemedId] = useState<string | null>(null);
  
  // --- Immersive Fullscreen State ---
  const [isFullscreenMode, setIsFullscreenMode] = useState<boolean>(false);
  const [isMobileDrawerExpanded, setIsMobileDrawerExpanded] = useState<boolean>(false);

  // --- Map-Specific States ---
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  // --- Customized User Routes State (Local Persistence) ---
  const [customStates, setCustomStates] = useState<Record<string, SavedRouteState>>({});

  // --- Load persisted customs ---
  useEffect(() => {
    try {
      const saved = localStorage.getItem("shillong-custom-routes");
      if (saved) {
        setCustomStates(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Local Storage configuration load skipped.", e);
    }
  }, []);

  // --- Save helper ---
  const updateRouteState = (routeId: string, updated: Partial<SavedRouteState>) => {
    const defaultRoute = PLANNER_ROUTES.find(r => r.id === routeId);
    if (!defaultRoute) return;

    const current = customStates[routeId] || {
      routeId,
      activeStopIds: defaultRoute.locations.map(l => l.id),
      customOrderIds: defaultRoute.locations.map(l => l.id),
      addedDetours: []
    };

    const nextState = {
      ...customStates,
      [routeId]: { ...current, ...updated }
    };

    setCustomStates(nextState);
    try {
      localStorage.setItem("shillong-custom-routes", JSON.stringify(nextState));
    } catch (e) {
      console.error("Skipped saving Route config locally.", e);
    }
  };

  const activeRoute = PLANNER_ROUTES.find(r => r.id === selectedRouteId) || PLANNER_ROUTES[0];

  // Kong Labet context — fire chat event when user selects a stop on the map
  useEffect(() => {
    if (!selectedMarkerId || selectedMarkerId === "rhino-auditorium") return;
    const allLocs = PLANNER_ROUTES.flatMap(r => r.locations);
    const loc = allLocs.find(l => l.id === selectedMarkerId);
    if (!loc) return;
    const prompt = `Tell me about "${loc.name}" on the ${activeRoute.name} in Meghalaya. What should I know before visiting? Any tips on timing, difficulty, or what to bring?`;
    window.dispatchEvent(new CustomEvent("ask-kong-labet", { detail: { prompt } }));
  }, [selectedMarkerId]);

  // Get stops in customized order, with customized active state
  const routeState = customStates[activeRoute.id] || {
    routeId: activeRoute.id,
    activeStopIds: activeRoute.locations.map(l => l.id),
    customOrderIds: activeRoute.locations.map(l => l.id),
    addedDetours: []
  };

  // Compile master database of original + dynamic detours
  const addedDetours = routeState.addedDetours || [];
  const masterLocationsOptionList = [...activeRoute.locations, ...addedDetours];

  // Build the list of locations according to custom order
  const customizedLocations: PlannerLocation[] = [];
  routeState.customOrderIds.forEach(id => {
    const loc = masterLocationsOptionList.find(l => l.id === id);
    if (loc) customizedLocations.push(loc);
  });
  
  // Backup fallback for any missing stops
  masterLocationsOptionList.forEach(loc => {
    if (!routeState.customOrderIds.includes(loc.id)) {
      customizedLocations.push(loc);
    }
  });

  // Calculate coordinates array for rendering polyline map trails
  // All routes must start and end at Rhino Auditorium
  const activePolylinesCoords = [
    RHINO_AUDITORIUM.coordinates,
    ...customizedLocations
      .filter(loc => routeState.activeStopIds.includes(loc.id))
      .map(loc => loc.coordinates),
    RHINO_AUDITORIUM.coordinates
  ];

  // Helper values
  const totalSpotsCount = masterLocationsOptionList.length;
  const activeSpotsCount = routeState.activeStopIds.length;

  // --- Calculations for Interactive Route Summary ---
  const activeLocationsData = customizedLocations.filter(l => routeState.activeStopIds.includes(l.id));
  
  // Base sum metrics from default datasets
  const rawDistance = activeLocationsData.reduce((sum, l) => sum + (l.distanceKm || 1.2), 0);
  
  const rawMinutesEstimate = activeLocationsData.reduce((sum, l) => {
    const parts = l.timeEstimate.split(":");
    const min = parts.length === 2 ? parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10) : 15;
    
    // stops durations based on category types
    let stopTime = 30;
    if (l.type === "Trek") stopTime = 90;
    if (l.type === "Eatery") stopTime = 60;
    if (l.type === "Picnic Spot") stopTime = 75;
    if (l.type === "Tourist Spot") stopTime = 40;

    return sum + min + stopTime;
  }, 0);

  // Apply Travel speed adjustments based on vehicles
  let speedMultiplier = 1.0;
  if (travelMode === "TWO_WHEELER") speedMultiplier = 0.85; // fast mountain shortcuts
  if (travelMode === "BICYCLING") speedMultiplier = 3.5;      // steep climbs
  if (travelMode === "WALKING") speedMultiplier = 8.5;        // hiking paths

  let finalTravelMinutes = rawMinutesEstimate * speedMultiplier;
  let finalDistance = rawDistance;

  // Scenic Route displays slightly prolonged cloud lookouts
  let scenicTravelMinutes = isScenicMode ? finalTravelMinutes * 1.25 : finalTravelMinutes * 0.9;
  let scenicDistance = isScenicMode ? finalDistance * 1.18 : finalDistance;

  // Format Helper
  const formatMinutes = (totalMin: number): string => {
    const hrs = Math.floor(totalMin / 60);
    const mins = Math.round(totalMin % 60);
    if (hrs === 0) return `${mins} mins`;
    if (mins === 0) return `${hrs} hrs`;
    return `${hrs} hrs ${mins} mins`;
  };

  // --- Dynamic Discoverable Nearby Detours Engine ---
  // Suggests available scenic spots/cafes that are NOT on this route, but in vicinity of centroid
  const discoverableDetours = PLANNER_ROUTES
    .flatMap(r => r.locations)
    .filter(loc => {
      const isAlreadyOnRoute = masterLocationsOptionList.some(l => l.id === loc.id);
      if (isAlreadyOnRoute) return false;
      const latDiff = Math.abs(loc.coordinates.lat - activeRoute.centroid.lat);
      const lngDiff = Math.abs(loc.coordinates.lng - activeRoute.centroid.lng);
      return latDiff < 0.28 && lngDiff < 0.28; // Geographically close to centroid
    })
    .filter((loc, index, self) => self.findIndex(l => l.id === loc.id) === index)
    .slice(0, 5);

  const handleAddDetour = (detour: PlannerLocation) => {
    const nextSavedDetours = [...addedDetours, detour];
    const nextActiveStops = [...routeState.activeStopIds, detour.id];
    const nextOrder = [...routeState.customOrderIds, detour.id];

    updateRouteState(activeRoute.id, {
      addedDetours: nextSavedDetours,
      activeStopIds: nextActiveStops,
      customOrderIds: nextOrder
    });
  };

  const handleRemoveDetour = (detourId: string) => {
    const nextSavedDetours = addedDetours.filter(d => d.id !== detourId);
    const nextActiveStops = routeState.activeStopIds.filter(id => id !== detourId);
    const nextOrder = routeState.customOrderIds.filter(id => id !== detourId);

    updateRouteState(activeRoute.id, {
      addedDetours: nextSavedDetours,
      activeStopIds: nextActiveStops,
      customOrderIds: nextOrder
    });
  };

  // --- Dynamic Filtering for Cards list ---
  const filteredRoutes = PLANNER_ROUTES.filter(route => {
    if (activeFilters.length === 0) return true;
    return route.locations.some(loc => 
      activeFilters.some(filter => matchesFilter(loc, filter, route.locations.reduce((acc, current) => acc + current.distanceKm, 0)))
    );
  });

  const toggleFilter = (filter: string) => {
    setSelectedThemedId(null);
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter(f => f !== filter));
    } else {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  // Applying prebuilt themed journeys triggers corresponding selections
  const clickThemedJourney = (theme: ThemedJourney) => {
    setSelectedThemedId(theme.id);
    setActiveFilters([theme.primaryFilter]);
    if (theme.routeIds.length > 0) {
      setSelectedRouteId(theme.routeIds[0]);
      setIsFullscreenMode(true); // Auto fluid transition to premium immersive map view
    }
  };

  // --- Timelines Custom Actions ---
  const toggleStopActive = (stopId: string) => {
    let currentActive = [...routeState.activeStopIds];
    if (currentActive.includes(stopId)) {
      if (currentActive.length > 1) {
        currentActive = currentActive.filter(id => id !== stopId);
      }
    } else {
      currentActive.push(stopId);
    }
    updateRouteState(activeRoute.id, { activeStopIds: currentActive });
  };

  const moveStopIndex = (index: number, direction: "UP" | "DOWN") => {
    const updatedOrder = [...routeState.customOrderIds];
    const targetIndex = direction === "UP" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updatedOrder.length) return;

    // Swap positions
    const temp = updatedOrder[index];
    updatedOrder[index] = updatedOrder[targetIndex];
    updatedOrder[targetIndex] = temp;

    updateRouteState(activeRoute.id, { customOrderIds: updatedOrder });
  };

  const resetRouteToDefault = () => {
    updateRouteState(activeRoute.id, {
      activeStopIds: activeRoute.locations.map(l => l.id),
      customOrderIds: activeRoute.locations.map(l => l.id),
      addedDetours: []
    });
  };

  // --- Dynamic Routing & Category Optimization Utility Pass ---

  const getDistance = (c1: { lat: number; lng: number }, c2: { lat: number; lng: number }) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
    const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((c1.lat * Math.PI) / 180) *
        Math.cos((c2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const cVal = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * cVal;
  };

  const getLocationCategoryGroup = (loc: PlannerLocation): "cafes" | "waterfalls" | "treks" | "caves" | "other" => {
    const nm = loc.name.toLowerCase();
    if (loc.type === "Eatery" || nm.includes("cafe") || nm.includes("dylan")) return "cafes";
    if (nm.includes("fall")) return "waterfalls";
    if (loc.type === "Trek" || nm.includes("trail") || nm.includes("walk")) return "treks";
    if (nm.includes("cave") || nm.includes("krem")) return "caves";
    return "other";
  };

  const countCategoryActive = (catGroup: "cafes" | "waterfalls" | "treks" | "caves") => {
    return routeState.activeStopIds.filter(id => {
      const loc = masterLocationsOptionList.find(l => l.id === id);
      if (!loc) return false;
      return getLocationCategoryGroup(loc) === catGroup;
    }).length;
  };

  const handleRemoveCategory = (catGroup: "cafes" | "waterfalls" | "treks" | "caves") => {
    const updatedStops = routeState.activeStopIds.filter(id => {
      const loc = masterLocationsOptionList.find(l => l.id === id);
      if (!loc) return true;
      return getLocationCategoryGroup(loc) !== catGroup;
    });
    updateRouteState(activeRoute.id, {
      activeStopIds: updatedStops
    });
  };

  const handleOptimizeRoute = () => {
    const activeLocs = masterLocationsOptionList.filter(loc =>
      routeState.activeStopIds.includes(loc.id)
    );
    if (activeLocs.length <= 1) return;

    const optimizedList: PlannerLocation[] = [];
    const remaining = [...activeLocs];
    let currentCoords = RHINO_AUDITORIUM.coordinates;

    while (remaining.length > 0) {
      let nearestIdx = 0;
      let minDistance = Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const dist = getDistance(currentCoords, remaining[i].coordinates);
        if (dist < minDistance) {
          minDistance = dist;
          nearestIdx = i;
        }
      }

      const nextLoc = remaining.splice(nearestIdx, 1)[0];
      optimizedList.push(nextLoc);
      currentCoords = nextLoc.coordinates;
    }

    const activeIds = optimizedList.map(l => l.id);
    const inactiveIds = masterLocationsOptionList
      .filter(l => !routeState.activeStopIds.includes(l.id))
      .map(l => l.id);

    updateRouteState(activeRoute.id, {
      customOrderIds: [...activeIds, ...inactiveIds]
    });
  };

  // --- Export Route as Direct Google Maps Coordinate Waypoint Directions ---
  const [isPlayingDeepLink, setIsPlayingDeepLink] = useState(false);
  const handleExportToGoogleMaps = () => {
    if (activeLocationsData.length < 1) return;
    setIsPlayingDeepLink(true);

    const startCoord = `${RHINO_AUDITORIUM.coordinates.lat},${RHINO_AUDITORIUM.coordinates.lng}`;
    const endCoord = `${RHINO_AUDITORIUM.coordinates.lat},${RHINO_AUDITORIUM.coordinates.lng}`;
    
    // Construct direct exact coordinate components for ALL waypoints
    const stopsCoords = activeLocationsData.map(loc => `${loc.coordinates.lat},${loc.coordinates.lng}`);
    const routeSegments = [startCoord, ...stopsCoords, endCoord];
    
    const mapsUrl = `https://www.google.com/maps/dir/${routeSegments.join("/")}/@${RHINO_AUDITORIUM.coordinates.lat},${RHINO_AUDITORIUM.coordinates.lng},12z?entry=ttu`;

    // Simulate premium visual load feedback
    setTimeout(() => {
      window.open(mapsUrl, "_blank");
      setIsPlayingDeepLink(false);
    }, 850);
  };

  // --- Category Pin Stylizer ---
  const getCategoryColor = (type: string, name: string = "", remarks: string = ""): string => {
    const nm = name.toLowerCase();
    const rem = remarks.toLowerCase();
    if (type === "Eatery" || nm.includes("cafe") || nm.includes("dylan")) return "#d97706"; // Amber Gold
    if (nm.includes("fall")) return "#2563EB";                                              // Cascade Waterfall Blue
    if (type === "Trek" || nm.includes("trail") || nm.includes("walk")) return "#ea580c";   // Trek Deep Orange
    if (nm.includes("cave") || nm.includes("krem")) return "#4b5563";                       // Slate Tunnel Gray
    if (nm.includes("view") || nm.includes("canyon") || nm.includes("peak")) return "#059669"; // Peak Green
    if (type === "Picnic Spot" || rem.includes("swim")) return "#db2777";                  // Water Pool Rose/Pink
    return "#854d0e"; // Default Yellow Ochre
  };

  // Fallback winding line generator inside SVG canvas
  const customWindingLineData = generateSerpentinePath(activePolylinesCoords);

  return (
    <div id="route-planner-system" className="space-y-12 animate-fade-in text-stone-850 font-sans max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      
      {/* Route Editorial Header Section */}
      <div id="planner-site-header" className="text-center space-y-4 max-w-4xl mx-auto pt-6 transition-all duration-350">
        <span 
          id="planner-heading-tag"
          className="inline-flex items-center gap-1.5 bg-amber-950/40 text-amber-100 px-4 py-1.5 rounded-full text-[11px] font-mono tracking-widest uppercase border border-amber-800/40"
        >
          <CompassIcon className="w-4 h-4 text-amber-400 animate-spin-slow" />
          Interactive Expedition Engine
        </span>
        <h2 
          id="planner-heading-title"
          className="text-4xl md:text-5xl font-display font-medium text-stone-900 tracking-tight leading-none"
        >
          Adventure Route Planner
        </h2>
        <p 
          id="planner-heading-subtitle"
          className="text-stone-605 leading-relaxed font-light text-sm md:text-base max-w-2xl mx-auto"
        >
          Plan, customize and preview full-road winding journeys across Meghalaya’s hills. Toggle stops, add cafe detours, and export coordinates natively to Google Maps.
        </p>
        
        {/* Route Commencement Notice */}
        <div id="route-commencement-notice" className="inline-flex items-center gap-2.5 bg-amber-50 border border-amber-200/50 p-3 px-5 rounded-2xl max-w-xl mx-auto shadow-xs text-left">
          <Info className="w-4 h-4 text-amber-800 shrink-0" />
          <span className="text-xs text-stone-705 font-sans font-medium">
            <strong className="text-amber-950 font-semibold">Route Commencement:</strong> All curated itineraries commence and conclude at <span className="underline decoration-amber-500 font-medium">Pinewalk Crossing Near Rhino Auditorium (Secretariat Hills, Shillong, Meghalaya 793001)</span>.
          </span>
        </div>
      </div>

      {/* Advanced Route Filters Bento Section */}
      <div id="filters-bento" className="bg-[#FAF8F5]/80 border border-stone-200/80 p-5 rounded-2xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-stone-200/50">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-800" />
            <h3 className="font-display font-medium text-stone-900 text-sm">Fine-Tune Trek or Drive Intent</h3>
          </div>
          {activeFilters.length > 0 && (
            <button 
              onClick={() => { setActiveFilters([]); setSelectedThemedId(null); }}
              className="font-mono text-[10px] text-stone-500 hover:text-amber-800 transition-colors uppercase tracking-wider font-bold"
            >
              Clear Filter Set
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_FILTERS.map((f) => {
            const isSelected = activeFilters.includes(f);
            return (
              <button
                key={f}
                id={`filter-${f.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => toggleFilter(f)}
                className={`px-3 py-1.5 rounded-full border text-xs cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? "bg-stone-900 border-stone-950 text-amber-100 font-medium scale-[1.03] shadow-md"
                    : "bg-white border-stone-200/80 hover:border-stone-400 text-stone-605 hover:text-stone-900"
                }`}
              >
                {f}
              </button>
            )
          })}
        </div>

        {/* Bulk Category Omitters */}
        <div id="bulk-category-removal" className="border-t border-stone-200/50 pt-4 space-y-2">
          <div className="flex items-center gap-1.5 text-stone-700">
            <Trash className="w-3.5 h-3.5 text-amber-800" />
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Skip a Category of Spots from Route</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleRemoveCategory("cafes")}
              disabled={countCategoryActive("cafes") === 0}
              className="px-3 py-1.5 rounded-lg border text-xs font-mono bg-white text-stone-700 border-amber-205 hover:border-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs hover:bg-stone-50"
            >
              ☕ Skip Cafés ({countCategoryActive("cafes")})
            </button>
            <button
              onClick={() => handleRemoveCategory("waterfalls")}
              disabled={countCategoryActive("waterfalls") === 0}
              className="px-3 py-1.5 rounded-lg border text-xs font-mono bg-white text-stone-700 border-sky-200 hover:border-sky-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs hover:bg-stone-50"
            >
              🌊 Skip Waterfalls ({countCategoryActive("waterfalls")})
            </button>
            <button
              onClick={() => handleRemoveCategory("treks")}
              disabled={countCategoryActive("treks") === 0}
              className="px-3 py-1.5 rounded-lg border text-xs font-mono bg-white text-stone-700 border-orange-200 hover:border-orange-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs hover:bg-stone-50"
            >
              🥾 Skip Treks ({countCategoryActive("treks")})
            </button>
            <button
              onClick={() => handleRemoveCategory("caves")}
              disabled={countCategoryActive("caves") === 0}
              className="px-3 py-1.5 rounded-lg border text-xs font-mono bg-white text-stone-700 border-stone-250 hover:border-stone-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs hover:bg-stone-50"
            >
              ⛰️ Skip Caves ({countCategoryActive("caves")})
            </button>
          </div>
        </div>
      </div>

      {/* Curated Themed Journeys (Persisted list) */}
      <div id="themed-journeys-container" className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-800" />
          <h3 className="font-display font-medium text-stone-900 text-base md:text-lg">Pre-Saved Themed Journeys</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {THEMED_JOURNEYS.map((theme) => {
            const isActive = selectedThemedId === theme.id;
            return (
              <div 
                key={theme.id}
                id={`theme-card-${theme.id}`}
                onClick={() => clickThemedJourney(theme)}
                className={`relative rounded-xl overflow-hidden border cursor-pointer group transition-all duration-300 h-36 ${
                  isActive 
                    ? "border-amber-700 ring-2 ring-amber-700/20 scale-[1.01]" 
                    : "border-stone-200 hover:border-stone-350"
                }`}
              >
                <div className="absolute inset-0 bg-stone-950/45 z-10 group-hover:bg-stone-950/35 transition-colors" />
                <img 
                  src={theme.banner} 
                  alt={theme.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  referrerPolicy="no-referrer"
                />
                <div className="relative z-20 p-4 h-full flex flex-col justify-end text-white">
                  <span className="flex items-center gap-1 bg-amber-900/80 border border-amber-800/80 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-mono w-max mb-1.5 uppercase font-semibold text-amber-100">
                    {theme.primaryFilter}
                  </span>
                  <h4 className="font-display font-medium text-sm leading-snug tracking-tight text-amber-50">{theme.name}</h4>
                  <p className="text-[10px] text-stone-300 font-light line-clamp-2 mt-0.5 leading-relaxed">{theme.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Curated Routes Core List & Immersive Trigger Map Grid */}
      <div id="planner-split-workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
        
        {/* Curated Routes Sidebar Selection Catalog (5/12 Grid) */}
        <div id="curated-paths-column" className="lg:col-span-4 space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex items-center gap-2 sticky top-0 bg-[#F5F2EB] py-2 z-10 border-b border-stone-200/50 pb-3">
            <BookOpen className="w-4 h-4 text-amber-800" />
            <h4 className="font-mono text-xs uppercase tracking-wider font-bold text-stone-800">Select Curated Route ({filteredRoutes.length})</h4>
          </div>

          <div className="space-y-4">
            {filteredRoutes.map((route) => {
              const isSelected = selectedRouteId === route.id;
              const routeDistanceTotal = route.locations.reduce((acc, c) => acc + c.distanceKm, 0);

              const hasSwims = route.locations.some(l => l.remarks.toLowerCase().includes("swim") || l.remarks.toLowerCase().includes("pool"));
              const hasCafes = route.locations.some(l => l.name.toLowerCase().includes("cafe") || l.name.toLowerCase().includes("eatery"));
              const hasTreks = route.locations.some(l => l.type === "Trek" || l.remarks.toLowerCase().includes("trek"));

              return (
                <div
                  key={route.id}
                  id={`route-selector-${route.id}`}
                  onClick={() => { 
                    setSelectedRouteId(route.id); 
                    setSelectedThemedId(null); 
                  }}
                  className={`bg-white border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    isSelected 
                      ? "border-amber-800 shadow-md bg-amber-50/5 relative" 
                      : "border-stone-200 hover:border-stone-450 hover:shadow-xs"
                  }`}
                >
                  <div className="relative h-28">
                    <div className="absolute inset-0 bg-stone-950/25 z-10" />
                    <img 
                      src={ROUTE_BANNER_IMAGES[route.id] || "https://images.unsplash.com/photo-1548252737-12962635ccca?auto=format&fit=crop&w=800&q=80"} 
                      alt={route.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="relative z-20 p-4 h-full flex flex-col justify-between text-white">
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-0.5 bg-black/40 backdrop-blur-xs text-[10px] font-mono tracking-wider rounded-md text-stone-200 uppercase">
                          Pages {route.pages}
                        </span>
                        {isSelected && (
                          <span className="px-2 py-0.5 bg-amber-900 border border-amber-850 text-[9px] font-mono uppercase tracking-widest font-bold rounded text-amber-200">
                            Selected
                          </span>
                        )}
                      </div>
                      <h4 className="font-display font-medium text-lg leading-tight tracking-tight drop-shadow-xs">{route.name}</h4>
                    </div>
                  </div>

                  <div className="p-4 space-y-4 text-left">
                    <div className="grid grid-cols-3 gap-2 font-mono text-[10px] text-stone-550 border-b border-stone-100 pb-2.5">
                      <div>
                        <span className="block text-stone-400 uppercase text-[8px] tracking-wider mb-0.5">Distance</span>
                        <span className="font-semibold text-stone-800">{routeDistanceTotal.toFixed(1)} km</span>
                      </div>
                      <div>
                        <span className="block text-stone-400 uppercase text-[8px] tracking-wider mb-0.5">Stops</span>
                        <span className="font-semibold text-stone-800">{route.locations.length} Spots</span>
                      </div>
                      <div>
                        <span className="block text-stone-400 uppercase text-[8px] tracking-wider mb-0.5">Drive</span>
                        <span className="font-semibold text-stone-800">
                          {formatMinutes(routeDistanceTotal * 1.5)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex flex-wrap gap-1">
                        {hasSwims && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[8.5px] font-mono bg-blue-50 text-blue-700 border border-blue-100">
                            Swim
                          </span>
                        )}
                        {hasCafes && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[8.5px] font-mono bg-amber-50 text-amber-800 border border-amber-200">
                            Café
                          </span>
                        )}
                        {hasTreks && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[8.5px] font-mono bg-orange-50 text-orange-700 border border-orange-100">
                            Trek
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRouteId(route.id);
                          setIsFullscreenMode(true); // Launch Cinematic View!
                        }}
                        className="px-3 py-1 bg-amber-900 hover:bg-stone-950 text-amber-50 hover:text-white rounded text-[10.5px] font-mono uppercase tracking-wider font-bold transition-all flex items-center gap-1 shadow-md"
                      >
                        <Maximize2 className="w-3 h-3 text-amber-100" /> Explore Immersive
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Embedded Standard Mini Map Widget (7/12 Grid) — smooth transition triggers active fullscreen */}
        <div id="desktop-normal-map-widget" className="lg:col-span-8 flex flex-col justify-between space-y-4">
          <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-xs relative">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-amber-800" />
                <h3 className="font-display font-medium text-stone-900 text-sm">
                  {activeRoute.name} Map Outlook
                </h3>
              </div>
              <button 
                onClick={() => setIsFullscreenMode(true)}
                className="px-3 py-1 border border-stone-300 hover:border-amber-800 hover:bg-amber-50/20 rounded-full text-xs font-mono flex items-center gap-1.5 transition-all text-stone-600 hover:text-amber-950"
              >
                <Maximize2 className="w-3.5 h-3.5" /> Fullscreen 3D View
              </button>
            </div>

            <div className="bg-amber-50 border-b border-amber-200/50 p-2.5 px-4 flex items-center gap-2 text-xs text-stone-800 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
              <span>📍 Route Loop: Begins & finishes at <strong>Pinewalk Crossing Near Rhino Auditorium, Shillong</strong></span>
            </div>

            {/* Standard Map view Frame: redirects or shows inline vectors */}
            <div className="relative w-full h-[400px] bg-stone-50 overflow-hidden">
              {hasValidKey ? (
                <APIProvider apiKey={GOOGLE_MAPS_API_KEY} version="weekly">
                  <Map
                    defaultCenter={activeRoute.centroid}
                    defaultZoom={11}
                    disableDefaultUI={true}
                    zoomControl={true}
                    mapId="DEMO_MAP_ID"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: "100%", height: "100%" }}
                  >
                    <LiveRoutePolylines activeCoords={activePolylinesCoords} travelMode={travelMode} isScenicMode={isScenicMode} />
                    <AdvancedMarker 
                      key="rhino-auditorium" 
                      position={RHINO_AUDITORIUM.coordinates} 
                      title="Pinewalk Crossing Near Rhino Auditorium (Start/End)"
                    >
                      <div className="relative scale-110 z-50">
                        <Pin background="#b45309" borderColor="#ffffff" glyphColor="#ffffff" scale={1.1} />
                        <div className="absolute top-1 max-w-full flex justify-center inset-x-0 text-[10px] font-mono font-bold text-neutral-900 pointer-events-none select-none">
                          🏛️
                        </div>
                      </div>
                    </AdvancedMarker>
                    {customizedLocations
                      .filter((loc) => routeState.activeStopIds.includes(loc.id))
                      .map((loc) => {
                        return (
                          <AdvancedMarker 
                            key={loc.id} 
                            position={loc.coordinates} 
                            title={loc.name}
                          >
                            <div className="relative scale-100 transition-transform duration-200">
                              <Pin background={getCategoryColor(loc.type, loc.name, loc.remarks)} borderColor="#ffffff" glyphColor="#ffffff" scale={0.9} />
                            </div>
                          </AdvancedMarker>
                        );
                      })}
                  </Map>
                </APIProvider>
              ) : (
                /* Fallback Graphic display for standard map preview */
                <div 
                  className="w-full h-full bg-[#FAF8F5] relative flex flex-col items-center justify-center cursor-pointer p-4 group"
                  onClick={() => setIsFullscreenMode(true)}
                >
                  <div className="absolute inset-0 bg-radial-at-t from-stone-100 to-[#FAF8F5] pointer-events-none" />
                  
                  {/* Beautiful customized SVG trace in normal map window */}
                  <svg className="w-4/5 h-3/5 absolute z-10 stroke-stone-300 stroke-2 overflow-visible">
                    <defs>
                      <linearGradient id="gradient-fallback-line" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#b45309" />
                        <stop offset="100%" stopColor="#ea580c" />
                      </linearGradient>
                    </defs>
                    <path 
                      d={customWindingLineData.map((pt, i) => `${i === 0 ? "M" : "L"} ${20 + (i * 12)} ${80 + Math.sin(i * 1.8) * 35}`).join(" ")}
                      fill="none"
                      stroke="url(#gradient-fallback-line)"
                      strokeWidth="3.5"
                      strokeDasharray="6,4"
                      className="opacity-75"
                    />
                    {customizedLocations.map((loc, idx) => {
                      const isActive = routeState.activeStopIds.includes(loc.id);
                      const isHovered = hoveredLocId === loc.id;
                      if (!isActive) return null;
                      return (
                        <g 
                          key={loc.id}
                          transform={`translate(${20 + (idx * 15 * 1.5)}, ${80 + Math.sin(idx * 15 * 0.12) * 35})`}
                          onMouseEnter={() => setHoveredLocId(loc.id)}
                          onMouseLeave={() => setHoveredLocId(null)}
                        >
                          <circle 
                            cx="0" 
                            cy="0" 
                            r={isHovered ? "8" : "6"} 
                            fill={getCategoryColor(loc.type, loc.name, loc.remarks)} 
                            stroke="#ffffff" 
                            strokeWidth="1.5"
                            className="transition-all shadow-xs"
                          />
                        </g>
                      )
                    })}
                  </svg>

                  <div className="relative z-20 flex flex-col items-center p-6 text-center space-y-2">
                    <div className="w-12 h-12 bg-amber-950/20 border border-amber-800/40 rounded-full flex items-center justify-center text-amber-900 group-hover:scale-110 transition-transform">
                      <CompassIcon className="w-6 h-6 animate-spin-slow text-amber-800" />
                    </div>
                    <h5 className="font-display font-medium text-stone-900 text-sm">Expand Interactive Route Customizer Overlay</h5>
                    <p className="text-xs text-stone-500 max-w-md font-light leading-relaxed">
                      Click to unlock the frosted glass navigator dashboard overlay on top of the live winding routing path.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* In-Line Mini customizer action buttons */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
              <div className="space-y-0.5">
                <span className="block text-[10px] font-mono text-amber-800 tracking-wider uppercase font-bold">Standard Preview Mode</span>
                <p className="text-xs text-stone-600 leading-normal font-light">
                  Configured driving sequence: <span className="font-semibold text-stone-800">{activeSpotsCount} of {totalSpotsCount} Stops</span> active.
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-end flex-wrap">
                <button
                  onClick={handleOptimizeRoute}
                  disabled={activeSpotsCount <= 1}
                  className="px-3.5 py-1.5 text-xs font-mono bg-amber-805 text-amber-50 hover:bg-amber-900 disabled:opacity-45 disabled:cursor-not-allowed hover:text-white border border-amber-800 rounded-lg cursor-pointer flex items-center gap-1.5 transition-all shadow-sm font-semibold"
                >
                  <ArrowDownUp className="w-3.5 h-3.5 text-amber-300" /> Optimize Sequence
                </button>
                <button
                  onClick={resetRouteToDefault}
                  className="px-3.5 py-1.5 text-xs font-mono text-stone-600 hover:text-stone-900 border border-stone-300 hover:border-stone-400 rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors bg-white font-medium"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Clear / Reset
                </button>
                <button 
                  onClick={() => setIsFullscreenMode(true)}
                  className="px-4 py-1.5 text-xs font-mono bg-stone-900 text-stone-100 hover:bg-stone-950 rounded-lg flex items-center gap-1.5 font-bold transition-all shadow-sm cursor-pointer"
                >
                  <MapIcon className="w-3.5 h-3.5 text-amber-400" /> Customize Route Layout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CINEMATIC FULLSCREEN IMMERSIVE NAVIGATION VIEWPORT OVERLAY --- */}
      <AnimatePresence>
        {isFullscreenMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0f0e0d]/98 z-[2000] flex flex-col overflow-hidden text-neutral-100 select-none animate-none"
          >
            {/* Visual gradient vignette overlay borders to frame the map like a scenic documentary */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#0a0908] to-transparent pointer-events-none z-10" />
            <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-[#0a0908]/90 to-transparent pointer-events-none z-10" />

            {/* Immersive Floating HUD Top-Bar */}
            <div className="absolute top-5 inset-x-5 z-20 flex items-center justify-between gap-4">
              <button
                onClick={() => {
                  setIsFullscreenMode(false);
                  setIsMobileDrawerExpanded(false);
                }}
                className="px-4 py-2.5 bg-neutral-900/85 backdrop-blur-md border border-neutral-800 rounded-full font-mono text-xs uppercase tracking-wider text-neutral-100 hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-xl hover:bg-stone-950"
              >
                <ChevronLeft className="w-4 h-4 text-amber-400" /> Exit Explorer
              </button>

              {/* Status Indicator Bar */}
              <div className="hidden md:flex items-center gap-3 bg-neutral-900/85 backdrop-blur-md border border-neutral-800/80 p-1.5 px-4 rounded-full text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-neutral-300">Live Navigation Mode: <span className="text-amber-400 font-bold uppercase">{activeRoute.name}</span></span>
                <span className="text-neutral-500">|</span>
                <span className="text-neutral-400 text-[10px]">Territory: East Khasi & Jaintia Hills</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={resetRouteToDefault}
                  className="p-2.5 bg-neutral-900/80 backdrop-blur-md border border-neutral-800 text-neutral-400 hover:text-white rounded-full transition-all cursor-pointer hover:shadow-lg"
                  title="Reset Journey Defaults"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleExportToGoogleMaps}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-neutral-100 hover:text-white border border-amber-800 rounded-full font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 shadow-xl cursor-pointer"
                >
                  {isPlayingDeepLink ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                  Open in G-Maps
                </button>
              </div>
            </div>

            {/* Immersive Expanded Map Box takes up 100% space */}
            <div className="flex-1 w-full h-full relative bg-neutral-950">
              {hasValidKey ? (
                <APIProvider apiKey={GOOGLE_MAPS_API_KEY} version="weekly">
                  <Map
                    defaultCenter={activeRoute.centroid}
                    defaultZoom={11}
                    gestureHandling="greedy"
                    disableDefaultUI={true}
                    zoomControl={true}
                    mapId="DEMO_MAP_ID"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: "100%", height: "100%" }}
                  >
                    <LiveRoutePolylines activeCoords={activePolylinesCoords} travelMode={travelMode} isScenicMode={isScenicMode} />
                    <AdvancedMarker 
                      key="rhino-auditorium" 
                      position={RHINO_AUDITORIUM.coordinates} 
                      title="Pinewalk Crossing Near Rhino Auditorium (Start/End)"
                      onClick={() => setSelectedMarkerId(selectedMarkerId === "rhino-auditorium" ? null : "rhino-auditorium")}
                    >
                      <div className="relative scale-110 z-50 cursor-pointer" style={{ width: "32px", height: "32px" }}>
                        <Pin background="#b45309" borderColor="#ffffff" glyphColor="#ffffff" scale={1.15} />
                        <div className="absolute top-1 max-w-full flex justify-center inset-x-0 text-[10px] font-mono font-bold text-neutral-900 pointer-events-none select-none">
                          🏛️
                        </div>
                      </div>
                    </AdvancedMarker>
                    
                    {/* Immersive premium markers with interaction triggers */}
                    {customizedLocations
                      .filter((loc) => routeState.activeStopIds.includes(loc.id))
                      .map((loc, idx) => {
                        const isHovered = hoveredLocId === loc.id;
                        const isSelected = selectedMarkerId === loc.id;
                        const pinColor = getCategoryColor(loc.type, loc.name, loc.remarks);

                        return (
                          <AdvancedMarker 
                            key={loc.id} 
                            position={loc.coordinates} 
                            title={loc.name}
                            onClick={() => setSelectedMarkerId(selectedMarkerId === loc.id ? null : loc.id)}
                          >
                            <div 
                              className={`relative cursor-pointer transition-all duration-350 ${
                                isHovered || isSelected ? "scale-120 z-50" : "scale-100 z-10"
                              }`}
                              onMouseEnter={() => setHoveredLocId(loc.id)}
                              onMouseLeave={() => setHoveredLocId(null)}
                              style={{ width: "32px", height: "32px" }}
                            >
                              <Pin background={pinColor} borderColor="#ffffff" glyphColor="#ffffff" scale={isSelected || isHovered ? 1.15 : 0.9} />
                              
                              {/* Sequence number overlay on map pin */}
                              <div className="absolute top-1 max-w-full flex justify-center inset-x-0 text-[10px] font-mono font-bold text-neutral-900 pointer-events-none select-none">
                                {idx + 1}
                              </div>

                              {/* Added detour badge */}
                              {addedDetours.some(d => d.id === loc.id) && (
                                <div className="absolute -top-1.5 -right-1.5 bg-amber-500 rounded-full p-1 border border-white">
                                  <Sparkles className="w-2 h-2 text-white" />
                                </div>
                              )}
                            </div>
                          </AdvancedMarker>
                        );
                      })}
                  </Map>
                </APIProvider>
              ) : (
                /* Cinematic Premium falling fallback SVG map with high-density serpentine vectoring */
                <div className="w-full h-full bg-[#11100f] relative overflow-hidden flex items-center justify-center p-6">
                  {/* Grid lines styling to mimic sonar or topographic explorer maps */}
                  <div className="absolute inset-x-0 inset-y-0 opacity-15 bg-[linear-gradient(rgba(245,242,235,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(245,242,235,0.06)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                  
                  {/* Glowing contour circles */}
                  <div className="absolute w-[800px] h-[800px] rounded-full border border-neutral-800/25 opacity-20 pointer-events-none animate-pulse-slow" />
                  <div className="absolute w-[500px] h-[500px] rounded-full border border-neutral-800/15 opacity-15 pointer-events-none" />

                  {/* Fully structured animated high-fidelity vector path */}
                  <svg className="w-4/5 h-[350px] absolute inset-y-24 z-10 overflow-visible max-w-4xl select-none" pointerEvents="none">
                    <defs>
                      <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                        <stop offset="50%" stopColor="#f97316" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>

                    {/* Aura background glow road trail */}
                    <path
                      d={customWindingLineData.map((pt, i) => `${i === 0 ? "M" : "L"} ${60 + (i * 48)} ${150 + Math.sin(i * 1.5) * 65}`).join(" ")}
                      fill="none"
                      stroke="#d97706"
                      strokeWidth="8"
                      strokeOpacity="0.12"
                      className="transition-all"
                    />

                    {/* Main High Contrast Route line path */}
                    <path
                      id="serpentine-vector-mesh"
                      d={customWindingLineData.map((pt, i) => `${i === 0 ? "M" : "L"} ${60 + (i * 48)} ${150 + Math.sin(i * 1.5) * 65}`).join(" ")}
                      fill="none"
                      stroke="url(#glowGrad)"
                      strokeWidth="3.5"
                      strokeOpacity="0.85"
                      className="transition-all"
                    />

                    {/* Traverse Pulse Animation Dot sliding along path */}
                    <circle r="6" fill="#fbbf24" className="pointer-events-none shadow-lg">
                      <animateMotion 
                        dur="14s" 
                        repeatCount="indefinite" 
                        path={customWindingLineData.map((pt, i) => `${i === 0 ? "M" : "L"} ${60 + (i * 48)} ${150 + Math.sin(i * 1.5) * 65}`).join(" ")}
                      />
                    </circle>

                    {/* Render Interactive pins nodes in space along the spline */}
                    {customizedLocations.map((loc, idx) => {
                      const isActive = routeState.activeStopIds.includes(loc.id);
                      if (!isActive) return null;
                      const isSelected = selectedMarkerId === loc.id;
                      const isHovered = hoveredLocId === loc.id;
                      const dotColor = getCategoryColor(loc.type, loc.name, loc.remarks);

                      return (
                        <g 
                          key={loc.id} 
                          className="cursor-pointer pointer-events-auto"
                          transform={`translate(${60 + (idx * 15 * 6.4)}, ${150 + Math.sin(idx * 15 * 0.1) * 65})`}
                          onMouseEnter={() => setHoveredLocId(loc.id)}
                          onMouseLeave={() => setHoveredLocId(null)}
                          onClick={() => setSelectedMarkerId(loc.id)}
                        >
                          <circle cx="0" cy="0" r={isHovered || isSelected ? "11" : "8"} fill="#ffffff" className="transition-all shadow-md" />
                          <circle cx="0" cy="0" r={isHovered || isSelected ? "8" : "5.5"} fill={dotColor} className="transition-all" />
                          {isSelected && (
                            <circle cx="0" cy="0" r="15" fill="none" stroke="#f59e0b" strokeWidth="1.5" className="animate-pulse" />
                          )}
                          <text x="0" y="3" textAnchor="middle" fontSize="8" fill="#ffffff" fontWeight="bold" className="font-mono pointer-events-none select-none">
                            {idx + 1}
                          </text>
                        </g>
                      )
                    })}
                  </svg>

                  <div className="relative z-20 flex flex-col items-center">
                    <span className="px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-amber-400 uppercase tracking-widest rounded-full mb-3 shadow-lg">
                      Custom Vector Canvas Online
                    </span>
                    <h4 className="font-display font-medium text-lg text-neutral-100">Serpentine Terrain-Following Vector Track</h4>
                    <p className="text-xs text-neutral-400 max-w-md text-center mt-1 leading-relaxed font-light">
                      Rendered using standard high-definition math spline formulas. This conforms perfectly to winding valleys and high canyon roads in deep Meghalaya.
                    </p>
                  </div>
                </div>
              )}

              {/* Advanced Custom Marker Bubble Pop-Up Card inside Map */}
              <AnimatePresence>
                {selectedMarkerId && (
                  (() => {
                    const loc = selectedMarkerId === "rhino-auditorium"
                      ? RHINO_AUDITORIUM
                      : masterLocationsOptionList.find(l => l.id === selectedMarkerId);
                    if (!loc) return null;
                    const isActive = loc.id === "rhino-auditorium" ? true : routeState.activeStopIds.includes(loc.id);
                    const isDynamicDetour = addedDetours.some(d => d.id === loc.id);

                    return (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.92, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 30 }}
                        className="absolute bottom-6 md:bottom-auto md:top-24 md:right-6 left-6 right-6 md:left-auto max-w-sm bg-neutral-900/95 backdrop-blur-lg border border-neutral-800 p-4 rounded-2xl shadow-2xl z-30 flex flex-col gap-3 text-neutral-100 text-left"
                      >
                        {/* Interactive Image Frame */}
                        <div className="relative h-28 rounded-lg overflow-hidden bg-neutral-850">
                          <img 
                            src={CATEGORY_MODERN_IMAGES[loc.type] || CATEGORY_MODERN_IMAGES.Misc} 
                            alt={loc.name} 
                            className="w-full h-full object-cover opacity-85" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/75 to-transparent" />
                          <span className="absolute bottom-2.5 left-3 px-2 py-0.5 bg-amber-900/90 border border-amber-800/50 backdrop-blur-xs text-[9px] font-mono rounded uppercase font-semibold text-amber-200">
                            {loc.type}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <h5 className="font-display font-semibold text-sm text-neutral-50 leading-tight">{loc.name}</h5>
                            {loc.id === "rhino-auditorium" && (
                              <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.2 rounded font-mono uppercase tracking-wide">Mandatory Base</span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-300 font-light leading-relaxed">{loc.remarks}</p>
                        </div>

                        <div className="flex items-center justify-between pt-1 font-mono text-[10px] text-neutral-400 border-t border-neutral-800/80 mt-1">
                          <span>Halt: {loc.timeEstimate}</span>
                          <span>Hills proximity: {loc.distanceKm} km</span>
                        </div>

                        <div className="flex gap-2 justify-end pt-1">
                          {isDynamicDetour && (
                            <button
                              onClick={() => {
                                handleRemoveDetour(loc.id);
                                setSelectedMarkerId(null);
                              }}
                              className="px-3 py-1.5 text-[10px] font-bold border border-rose-900/60 bg-rose-950/40 text-rose-200 hover:bg-rose-900 rounded-lg cursor-pointer font-mono uppercase tracking-wide transition-colors"
                            >
                              Trash Detour
                            </button>
                          )}
                          {loc.id !== "rhino-auditorium" && (
                            <button
                              onClick={() => toggleStopActive(loc.id)}
                              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wider cursor-pointer transition-colors ${
                                isActive 
                                  ? "bg-stone-800 text-neutral-300 hover:bg-stone-700 border border-stone-700" 
                                  : "bg-amber-600 text-neutral-100 hover:bg-amber-700"
                              }`}
                            >
                              {isActive ? "Skip Stop" : "Activate"}
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedMarkerId(null)}
                            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-400 hover:text-white transition-colors text-[10px] font-mono"
                          >
                            Close
                          </button>
                        </div>
                      </motion.div>
                    )
                  })()
                )}
              </AnimatePresence>
            </div>

            {/* FLOATING TRANSLUCENT GLASSMORPHISM NAVIGATOR BAR (Left Panel - Large Screen / Bottom Panel - Mobile) */}
            
            {/* Desktop Overlay Panel */}
            <div className="hidden lg:block absolute top-24 left-6 bottom-6 w-[400px] z-20 pointer-events-none">
              <div className="pointer-events-auto h-full flex flex-col bg-neutral-950/80 backdrop-blur-md rounded-2.5xl border border-neutral-805/80 text-neutral-100 shadow-2xl overflow-hidden text-left">
                
                {/* Header overview content */}
                <div className="p-5 border-b border-neutral-900 bg-neutral-900/20 space-y-1">
                  <span className="text-[10px] bg-amber-950/70 border border-amber-900/60 text-amber-200 font-mono px-2 py-0.5 rounded-md uppercase font-bold tracking-wide">
                    {activeRoute.pages} Pass
                  </span>
                  <h3 className="font-display font-medium text-lg tracking-tight text-neutral-50">{activeRoute.name}</h3>
                  <p className="text-[11px] font-light text-neutral-400">Frosted Glass customized coordinates & halts calculator</p>
                </div>

                {/* Fixed Station Loop Banner */}
                <div className="bg-amber-950/50 border-b border-amber-900/40 p-2.5 px-4 flex items-center gap-2 text-[10.5px] text-amber-200 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                  <span>Always commences & concludes at <strong>Pinewalk Crossing Near Rhino Auditorium</strong></span>
                </div>

                {/* Grid calculation summary */}
                <div className="p-4 grid grid-cols-3 gap-2 bg-neutral-925 border-b border-neutral-900 text-center">
                  <div className="bg-neutral-900/40 border border-neutral-850 p-2 rounded-xl">
                    <span className="block text-[8px] font-mono text-neutral-400 uppercase tracking-widest">Drive Time</span>
                    <span className="font-display text-xs font-semibold text-neutral-100">{scenicTravelMinutes > 1 ? formatMinutes(scenicTravelMinutes) : "0 min"}</span>
                  </div>
                  <div className="bg-neutral-900/40 border border-neutral-850 p-2 rounded-xl">
                    <span className="block text-[8px] font-mono text-neutral-400 uppercase tracking-widest">Road Trip</span>
                    <span className="font-display text-xs font-semibold text-neutral-100">{scenicDistance.toFixed(1)} km</span>
                  </div>
                  <div className="bg-neutral-900/40 border border-neutral-850 p-2 rounded-xl">
                    <span className="block text-[8px] font-mono text-neutral-400 uppercase tracking-widest">Stops</span>
                    <span className="font-display text-xs font-semibold text-amber-400">{activeSpotsCount} Spots</span>
                  </div>
                </div>

                {/* Interactive Stops & Detours Segment Tabs */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
                  
                  {/* Waypoint rearrangement nodes list */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-bold">Waypoint Stops Ordered</span>
                      <div className="flex items-center gap-1.5 shrink-0 select-none">
                        <button 
                          onClick={handleOptimizeRoute}
                          disabled={activeSpotsCount <= 1}
                          className="text-[10px] font-mono text-amber-400 hover:text-amber-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors uppercase font-bold flex items-center gap-0.5"
                          title="Sort active stops by fastest physical route sequence"
                        >
                          <ArrowDownUp className="w-3 h-3 text-amber-500" /> Optimize
                        </button>
                        <span className="text-neutral-700 font-mono text-[9px]">|</span>
                        <button 
                          onClick={resetRouteToDefault}
                          className="text-[10px] font-mono text-neutral-400 hover:text-neutral-200 transition-colors uppercase font-bold"
                          title="Restore original route defaults"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* Fixed Commencement base station */}
                      <div className="flex items-start gap-2.5 p-2 rounded-xl border bg-neutral-900/40 border-neutral-800">
                        <div className="w-5 h-5 rounded bg-amber-600/20 border border-amber-600/30 flex items-center justify-center mt-1 shrink-0">
                          <span className="text-[9px] font-mono font-bold text-amber-400">🏁</span>
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <h4 className="text-xs font-semibold text-neutral-50">
                            Start: {RHINO_AUDITORIUM.name}
                          </h4>
                          <p className="text-[10px] text-neutral-450 truncate text-neutral-400">Mandatory commencing station</p>
                        </div>
                        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider shrink-0 self-center bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded">
                          Fixed
                        </span>
                      </div>
                      {customizedLocations.map((loc, idx) => {
                        const isActive = routeState.activeStopIds.includes(loc.id);
                        const isHovered = hoveredLocId === loc.id;
                        const isDetour = addedDetours.some(d => d.id === loc.id);

                        return (
                          <div
                            key={loc.id}
                            onMouseEnter={() => setHoveredLocId(loc.id)}
                            onMouseLeave={() => setHoveredLocId(null)}
                            className={`flex items-start gap-2.5 p-2 rounded-xl transition-all border ${
                              isActive
                                ? isHovered
                                  ? "bg-neutral-900 border-neutral-750"
                                  : "bg-neutral-900/60 border-neutral-800"
                                : "opacity-40 bg-neutral-950/40 border-dashed border-neutral-850"
                            }`}
                          >
                            {/* Checkbox */}
                            <button
                              onClick={() => toggleStopActive(loc.id)}
                              className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer transition-all mt-1 shrink-0 ${
                                isActive 
                                  ? "bg-amber-600 border-amber-700 text-neutral-900 font-bold" 
                                  : "bg-neutral-900 border-neutral-700 hover:border-amber-500"
                              }`}
                            >
                              {isActive && <Check className="w-3.5 h-3.5 text-neutral-950 font-black" />}
                            </button>

                            {/* Info text */}
                            <div className="flex-1 text-left min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[9.5px] font-mono text-amber-500 font-bold">{idx + 1}</span>
                                <h4 className={`text-xs font-semibold truncate ${isActive ? "text-neutral-50" : "text-neutral-500 line-through"}`}>
                                  {loc.name}
                                </h4>
                                {isDetour && (
                                  <span className="text-[7.5px] font-mono bg-amber-950 border border-amber-900 text-amber-300 px-1 py-0.2 rounded">
                                    Detour
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-neutral-450 truncate text-neutral-400">{loc.remarks}</p>
                            </div>

                            {/* Position rearrange actions */}
                            <div className="flex gap-0.5 shrink-0 self-center">
                              <button
                                onClick={() => moveStopIndex(idx, "UP")}
                                disabled={idx === 0}
                                className="p-1 rounded bg-neutral-850 text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer transition-colors"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => moveStopIndex(idx, "DOWN")}
                                disabled={idx === customizedLocations.length - 1}
                                className="p-1 rounded bg-neutral-850 text-neutral-400 hover:text-white disabled:opacity-20 cursor-pointer transition-colors"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Fixed Journey Concluding Station */}
                      <div className="flex items-start gap-2.5 p-2 rounded-xl border bg-neutral-900/40 border-neutral-800">
                        <div className="w-5 h-5 rounded bg-amber-600/20 border border-amber-600/30 flex items-center justify-center mt-1 shrink-0">
                          <span className="text-[9px] font-mono font-bold text-amber-400">🏁</span>
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <h4 className="text-xs font-semibold text-neutral-50">
                            End: {RHINO_AUDITORIUM.name}
                          </h4>
                          <p className="text-[10px] text-neutral-450 truncate text-neutral-400">Mandatory concluding station</p>
                        </div>
                        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider shrink-0 self-center bg-neutral-950 border border-neutral-800 px-1.5 py-0.5 rounded">
                          Fixed
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Scenic toggle controls in overlay */}
                  <div className="bg-neutral-900/40 border border-neutral-850 p-3.5 rounded-xl text-left space-y-2">
                    <span className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-bold">Route Preference</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setIsScenicMode(true)}
                        className={`py-1.5 rounded-md text-[11px] font-mono uppercase tracking-wide border transition-all cursor-pointer font-bold ${
                          isScenicMode 
                            ? "bg-amber-600 text-neutral-900 border-amber-700" 
                            : "bg-neutral-900 text-neutral-400 border-neutral-800"
                        }`}
                      >
                        Scenic Loop
                      </button>
                      <button
                        onClick={() => setIsScenicMode(false)}
                        className={`py-1.5 rounded-md text-[11px] font-mono uppercase tracking-wide border transition-all cursor-pointer font-bold ${
                          !isScenicMode 
                            ? "bg-amber-600 text-neutral-900 border-amber-700" 
                            : "bg-neutral-900 text-neutral-400 border-neutral-800"
                        }`}
                      >
                        Direct Trunk
                      </button>
                    </div>
                  </div>

                  {/* ADD DETOURS & HIDDEN GEMS DIRECTLY ON MAP */}
                  <div className="space-y-3">
                    <span className="block text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-bold text-left">
                      Suggested Detours nearby ({discoverableDetours.length})
                    </span>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {discoverableDetours.map(detour => {
                        const pinColor = getCategoryColor(detour.type, detour.name, detour.remarks);
                        return (
                          <div 
                            key={detour.id}
                            className="bg-neutral-900/50 border border-neutral-850 p-2.5 rounded-xl flex items-center justify-between gap-3 text-left hover:bg-neutral-900 transition-colors"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pinColor }} />
                                <h5 className="text-[11px] font-semibold text-neutral-200 truncate">{detour.name}</h5>
                              </div>
                              <span className="text-[9px] text-neutral-450 uppercase font-mono tracking-wider text-neutral-400">{detour.type} ({detour.distanceKm} km away)</span>
                            </div>

                            <button
                              onClick={() => handleAddDetour(detour)}
                              className="px-2.5 py-1 bg-neutral-800 text-amber-400 hover:text-white hover:bg-amber-600 rounded-md font-mono text-[10px] font-bold uppercase transition-all flex items-center gap-0.5 shrink-0 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Embed Stop
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Consolidated travel mode selectors at bottom of overlay panel */}
                <div className="p-4 border-t border-neutral-900 bg-[#0f0e0d] space-y-3 shrink-0">
                  <div className="flex justify-between items-center bg-neutral-900 p-1 rounded-xl select-none">
                    <button
                      onClick={() => setTravelMode("DRIVING")}
                      className={`text-center flex-1 py-1 text-[11px] font-mono uppercase tracking-wide rounded-lg cursor-pointer ${
                        travelMode === "DRIVING" ? "bg-amber-600 text-neutral-950 font-bold" : "text-neutral-400"
                      }`}
                    >
                      🚗 Taxi
                    </button>
                    <button
                      onClick={() => setTravelMode("TWO_WHEELER")}
                      className={`text-center flex-1 py-1 text-[11px] font-mono uppercase tracking-wide rounded-lg cursor-pointer ${
                        travelMode === "TWO_WHEELER" ? "bg-amber-600 text-neutral-950 font-bold" : "text-neutral-400"
                      }`}
                    >
                      🏍️ Bike
                    </button>
                    <button
                      onClick={() => setTravelMode("BICYCLING")}
                      className={`text-center flex-1 py-1 text-[11px] font-mono uppercase tracking-wide rounded-lg cursor-pointer ${
                        travelMode === "BICYCLING" ? "bg-amber-600 text-neutral-950 font-bold" : "text-neutral-400"
                      }`}
                    >
                      🚲 Cycle
                    </button>
                    <button
                      onClick={() => setTravelMode("WALKING")}
                      className={`text-center flex-1 py-1 text-[11px] font-mono uppercase tracking-wide rounded-lg cursor-pointer ${
                        travelMode === "WALKING" ? "bg-amber-600 text-neutral-950 font-bold" : "text-neutral-400"
                      }`}
                    >
                      🥾 Trek
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Drawer (Bottom-Sheet style) overlay */}
            <div className="lg:hidden absolute bottom-0 inset-x-0 z-35 max-h-[70%] flex flex-col pointer-events-none">
              <div 
                className="pointer-events-auto w-full bg-neutral-950/90 backdrop-blur-md rounded-t-3xl border-t border-neutral-800 text-neutral-100 flex flex-col overflow-hidden"
                style={{ height: isMobileDrawerExpanded ? "400px" : "110px" }}
              >
                {/* Swipe Trigger Header */}
                <div 
                  className="p-3 text-center border-b border-neutral-900 cursor-pointer flex flex-col items-center justify-center space-y-1.5"
                  onClick={() => setIsMobileDrawerExpanded(!isMobileDrawerExpanded)}
                >
                  <div className="w-10 h-1 bg-neutral-800 rounded-full" />
                  <div className="flex items-center justify-between w-full px-4 text-left">
                    <div>
                      <h4 className="text-sm font-bold font-display text-neutral-100">{activeRoute.name}</h4>
                      <p className="text-[10px] text-neutral-400">
                        {scenicDistance.toFixed(1)} km road trip • {scenicTravelMinutes > 1 ? formatMinutes(scenicTravelMinutes) : "0 min"}
                      </p>
                    </div>
                    
                    <button className="p-1 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 bg-neutral-900 rounded px-2.5">
                      {isMobileDrawerExpanded ? "Collapse" : "Edit stops"}
                    </button>
                  </div>
                </div>

                {/* Expanded stops menu scroll box */}
                {isMobileDrawerExpanded && (
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Bulk Actions Header */}
                    <div className="flex items-center justify-between p-2 bg-neutral-900 border border-neutral-800 rounded-xl">
                      <span className="text-[9px] font-mono text-neutral-450 uppercase tracking-widest font-bold pl-1">Routing sequence</span>
                      <button
                        onClick={handleOptimizeRoute}
                        disabled={activeSpotsCount <= 1}
                        className="px-2.5 py-1 text-[9px] font-mono text-amber-400 border border-amber-800/40 hover:bg-amber-900/20 rounded font-bold uppercase disabled:opacity-40"
                      >
                        ⚡ Fast Route
                      </button>
                    </div>

                    <div className="space-y-2 text-left">
                      {/* Fixed start station */}
                      <div className="p-2.5 rounded-xl border flex items-center justify-between bg-neutral-900/40 border-neutral-800 text-neutral-100">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-[10.5px] font-mono text-neutral-400 font-bold">🏁</span>
                          <div className="text-left truncate">
                            <h5 className="text-xs font-bold text-neutral-50 truncate">Start: {RHINO_AUDITORIUM.name}</h5>
                            <span className="text-[9px] text-amber-500 font-mono tracking-wider uppercase">Fixed Point</span>
                          </div>
                        </div>
                        <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest bg-neutral-900 px-1.5 py-0.5 rounded">
                          Fixed
                        </span>
                      </div>

                      {customizedLocations.map((loc, idx) => {
                        const isActive = routeState.activeStopIds.includes(loc.id);
                        return (
                          <div 
                            key={loc.id}
                            onClick={() => toggleStopActive(loc.id)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${
                              isActive 
                                ? "bg-neutral-900 border-neutral-800 text-neutral-100" 
                                : "opacity-35 bg-neutral-950 border-neutral-900"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-[10.5px] font-mono text-neutral-400 font-bold">{idx + 1}</span>
                              <div className="text-left">
                                <h5 className="text-xs font-bold">{loc.name}</h5>
                                <span className="text-[9px] text-amber-500 font-mono tracking-wider uppercase">{loc.type}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider font-bold">
                              {isActive ? <CheckSquare className="w-4 h-4 text-amber-500" /> : <Square className="w-4 h-4 text-neutral-600" />}
                            </div>
                          </div>
                        )
                      })}

                      {/* Fixed end station */}
                      <div className="p-2.5 rounded-xl border flex items-center justify-between bg-neutral-900/40 border-neutral-800 text-neutral-100">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-[10.5px] font-mono text-neutral-400 font-bold">🏁</span>
                          <div className="text-left truncate">
                            <h5 className="text-xs font-bold text-neutral-50 truncate">End: {RHINO_AUDITORIUM.name}</h5>
                            <span className="text-[9px] text-amber-500 font-mono tracking-wider uppercase">Fixed Point</span>
                          </div>
                        </div>
                        <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest bg-neutral-900 px-1.5 py-0.5 rounded">
                          Fixed
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Civilized Evolved Travel Tips (Rhino Gyan Accordion Bento list) */}
      <div id="travel-tips-section" className="space-y-6 pt-6 border-t border-stone-200">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-[10px] font-mono tracking-widest text-amber-800 uppercase bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full font-bold">
            Highlands Protocols
          </span>
          <h3 className="font-display font-medium text-2xl md:text-3xl tracking-tight text-stone-900">
            Adventure Travel Protocols
          </h3>
          <p className="text-xs md:text-sm text-stone-550 font-sans leading-relaxed text-stone-600">
            Essential coordinates compiled directly by local mountaineers to ensure respectful, pleasant exploration across Meghalaya's highlands.
          </p>
        </div>

        <div id="travel-tips-bento" className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {CIVILIZED_TRAVEL_TIPS.map((tip) => {
            const isOpen = openTipId === tip.id;
            return (
              <div
                key={tip.id}
                id={`tip-accordion-${tip.id}`}
                onClick={() => setOpenTipId(isOpen ? null : tip.id)}
                className={`border rounded-2xl p-5 hover:border-amber-700/50 hover:bg-white cursor-pointer transition-all duration-300 relative select-none ${
                  isOpen 
                    ? "bg-white border-amber-850/60 shadow-sm" 
                    : "bg-[#FAF8F5]/80 border-stone-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl border text-amber-300 ${tip.colorClass} shrink-0`}>
                      {tip.icon}
                    </div>
                    <h4 className="font-display font-semibold text-sm text-stone-900">{tip.title}</h4>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden mt-3 text-left"
                    >
                      <p className="text-xs text-stone-600 leading-relaxed font-light border-t border-stone-200/50 pt-3">
                        {tip.tip}
                      </p>
                      <div className="mt-2.5 inline-flex items-center gap-1 text-[9.5px] font-mono text-amber-850 uppercase tracking-widest font-bold">
                        <span>Mountain Protocol Checked</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
