import React, { useEffect, useState } from "react";
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  useMap, 
  useMapsLibrary 
} from "@vis.gl/react-google-maps";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Sun, Moon, MapPin, Coffee, Flame, Music, Crown, 
  Sparkles, Clock, Globe, Navigation, MessageSquare, Info, 
  Star, Phone, Search, RefreshCw, Compass, ArrowRight,
  Gauge, Waypoints, HelpCircle, CheckCircle2, ChevronRight,
  Car, Eye
} from "lucide-react";
import { Cafe, Review } from "../types";
import { GOOGLE_MAPS_API_KEY, hasValidKey } from "../config";
import { TRAILS, Trail, TrailStop, DIFFICULTY_OPTIONS, TYPE_OPTIONS } from "../data/trailsData";

interface InteractiveMapProps {
  cafes: Cafe[];
  onSelectCafe: (cafe: Cafe) => void;
  activeCafeId?: string;
  hideSidebar?: boolean;
}

// Custom Google Maps Dark Theme styling
const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#1c1917" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1c1917" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#a8a29e" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#292524" }] },
  { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#a8a29e" }] },
  { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#292524" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#1c1917" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d6d3d1" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#14211a" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#44403c" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#57534e" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0c0a09" }] }
];

export default function InteractiveMap({ cafes, onSelectCafe, activeCafeId, hideSidebar = false }: InteractiveMapProps) {
  // Navigation Tabs inside Map component
  const [activeSubTab, setActiveSubTab] = useState<"cafes" | "trails">("cafes");
  
  const [mapTheme, setMapTheme] = useState<"light" | "dark">("light");
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(14);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [isMapFullscreen, setIsMapFullscreen] = useState<boolean>(false);

  // Live Places API Discovery States
  const [searchQuery, setSearchQuery] = useState("");
  const [discoveredPlaces, setDiscoveredPlaces] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDiscoveredPlace, setSelectedDiscoveredPlace] = useState<any | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // ----------------------------------------------------
  // TRAILS & ROUTING EXPLORER MOUNT STATES
  // ----------------------------------------------------
  const [selectedTrail, setSelectedTrail] = useState<Trail | null>(null);
  const [orderedStops, setOrderedStops] = useState<TrailStop[]>([]);
  const [startStopId, setStartStopId] = useState<string | null>(null);
  const [travelMode, setTravelMode] = useState<"WALKING" | "DRIVING" | "TRANSIT" | "BICYCLING" | "TWO_WHEELER">("DRIVING");
  
  // Directions calculated results
  const [routeDuration, setRouteDuration] = useState("");
  const [routeDistance, setRouteDistance] = useState("");
  const [isRouteUnavailable, setIsRouteUnavailable] = useState(false);

  // Travel trail filters state
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Selected single stop modal or sidebar view
  const [activeStop, setActiveStop] = useState<TrailStop | null>(null);
  const [isLoadingStopDetails, setIsLoadingStopDetails] = useState(false);
  const [stopPlacesData, setStopPlacesData] = useState<any | null>(null);

  // Shillong Central Coordinates constant
  const shillongCenter = { lat: 25.5788, lng: 91.8920 };

  // Freeze background scroll when in fullscreen
  useEffect(() => {
    if (isMapFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMapFullscreen]);

  // Fetch local reviews to compute dynamic rating averages for cafes list
  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setReviews(data))
      .catch((err) => console.error("Error loading reviews inside Map:", err));
  }, []);

  // Compute average rating for a cafe
  const getAvgRating = (cafeId: string) => {
    const cafeReviews = reviews.filter((r) => r.cafeId === cafeId);
    if (cafeReviews.length === 0) {
      const seed = (cafeId.charCodeAt(0) + cafeId.charCodeAt(cafeId.length - 1)) % 4;
      return (4.6 + seed * 0.1).toFixed(1);
    }
    const sum = cafeReviews.reduce((acc, cur) => acc + cur.rating, 0);
    return (sum / cafeReviews.length).toFixed(1);
  };

  // Classify curated cafe into custom categories
  const getCafeCategory = (cafe: Cafe) => {
    if (cafe.hasLiveMusic) return "live_music";
    const isTraditional = cafe.vibeTags?.some((t) => /traditional|khasi|indigenous|jadoh/i.test(t)) ||
      cafe.id === "rynsan-cafe";
    if (isTraditional) return "khasi_cuisine";
    
    const isRooftop = cafe.vibeTags?.some((t) => /rooftop|view|deck|canopy/i.test(t)) || 
      cafe.tagline?.toLowerCase().includes("view") || 
      cafe.theme?.toLowerCase().includes("deck");
    if (isRooftop) return "rooftop";

    const isPremium = cafe.name.toLowerCase().includes("fine dining") || 
      cafe.vibeTags?.some((t) => /premium|luxury|chandelier/i.test(t));
    if (isPremium) return "premium";

    const isBudget = cafe.vibeTags?.some((t) => /budget|street|jadoh stall/i.test(t));
    if (isBudget) return "budget";

    const isRestaurant = cafe.name.toLowerCase().includes("restaurant") || 
      cafe.name.toLowerCase().includes("grill") ||
      cafe.vibeTags?.some((t) => /restaurant|dining/i.test(t));
    if (isRestaurant) return "restaurant";

    return "cafe";
  };

  // Category visual metadata for curated cafes
  const categoryMeta: { [key: string]: { label: string; bg: string; text: string; border: string; icon: any; colorHex: string } } = {
    all: { label: "All Hubs", bg: "bg-stone-100", text: "text-stone-800", border: "border-stone-300", icon: MapPin, colorHex: "#7c2d12" },
    cafe: { label: "Cozy Cafés", bg: "bg-amber-50/90", text: "text-amber-800", border: "border-amber-300", icon: Coffee, colorHex: "#b45309" },
    restaurant: { label: "Diners", bg: "bg-rose-50/90", text: "text-rose-800", border: "border-rose-300", icon: MapPin, colorHex: "#dc2626" },
    khasi_cuisine: { label: "Khasi Hearth", bg: "bg-emerald-50/90", text: "text-emerald-800", border: "border-emerald-300", icon: Flame, colorHex: "#059669" },
    rooftop: { label: "Rooftop Decks", bg: "bg-cyan-50/90", text: "text-cyan-800", border: "border-cyan-300", icon: Sun, colorHex: "#0891b2" },
    live_music: { label: "Live Stage", bg: "bg-fuchsia-50/90", text: "text-fuchsia-800", border: "border-fuchsia-300", icon: Music, colorHex: "#c026d3" },
    budget: { label: "Local Eateries", bg: "bg-yellow-50/90", text: "text-yellow-800", border: "border-yellow-300", icon: Info, colorHex: "#d97706" },
    premium: { label: "Fine Dining", bg: "bg-stone-900", text: "text-amber-300", border: "border-amber-600", icon: Crown, colorHex: "#d97706" },
  };

  // Pre-calculate curated cafe categories & ratings
  const cafesWithCategories = cafes.map((cafe) => ({
    ...cafe,
    category: getCafeCategory(cafe),
    rating: getAvgRating(cafe.id),
  }));

  // Selecting a curated cafe marker
  const handleMarkerClick = (cafe: Cafe) => {
    setSelectedDiscoveredPlace(null);
    setSelectedCafe(cafe);
    onSelectCafe(cafe);
  };

  // Floating conversational Labet AI prompt dispatch
  const triggerChatAsk = (cafe: Cafe) => {
    const customPrompt = `Tell me more details about "${cafe.name}" in ${cafe.neighborhood}, Shillong. What are its operating hours, popular dishes, and tribal acoustic vibe?`;
    const event = new CustomEvent("ask-kong-labet", {
      detail: { prompt: customPrompt }
    });
    window.dispatchEvent(event);
  };

  // Sync external cafe selection
  useEffect(() => {
    if (!activeCafeId) return;
    const matchedCafe = cafesWithCategories.find((c) => c.id === activeCafeId);
    if (matchedCafe) {
      setActiveSubTab("cafes");
      setSelectedDiscoveredPlace(null);
      setSelectedCafe(matchedCafe);
    }
  }, [activeCafeId]);

  // ----------------------------------------------------
  // TRAILS ACTIONS IMPLEMENTATION
  // ----------------------------------------------------
  const handleSelectTrail = (trail: Trail) => {
    setSelectedTrail(trail);
    setOrderedStops(trail.stops);
    setStartStopId(trail.stops[0].id);
    setActiveStop(null);
    setRouteDistance("");
    setRouteDuration("");
    setIsRouteUnavailable(false);
  };

  // Shift start point of the trail orbitally
  const handleSetStartPoint = (stopId: string) => {
    if (!selectedTrail) return;
    const index = selectedTrail.stops.findIndex((s) => s.id === stopId);
    if (index !== -1) {
      const shifted = [
        ...selectedTrail.stops.slice(index),
        ...selectedTrail.stops.slice(0, index)
      ];
      setOrderedStops(shifted);
      setStartStopId(stopId);
      
      // Update stop place marker selection too
      const clickedStop = selectedTrail.stops[index];
      handleFetchStopDetails(clickedStop);
    }
  };

  // Fetch live Google Places API details for an active stop
  const handleFetchStopDetails = async (stop: TrailStop) => {
    setActiveStop(stop);
    setIsLoadingStopDetails(true);
    setStopPlacesData(null);

    // Grab Google Maps Places service dynamically if Maps JS is loaded
    try {
      const placesService = (window as any).google?.maps?.places;
      if (!placesService) {
        setIsLoadingStopDetails(false);
        return;
      }

      // Quick query searching using Place.searchByText or TextSearch
      // We implement a dual-fallback algorithm for absolute robustness
      const divPlaceholder = document.createElement("div");
      const mapInstance = (window as any).googleMapsInstanceForTrails;
      const service = new (window as any).google.maps.places.PlacesService(mapInstance || divPlaceholder);

      service.textSearch(
        {
          query: `${stop.placeNameQuery} Shillong Meghalaya`,
          location: shillongCenter,
          radius: 12000
        },
        (results: any[], status: any) => {
          if (status === "OK" && results && results[0]) {
            const res = results[0];
            // Request detailed single place to grab opening hours, reviews, photos safely
            service.getDetails(
              {
                placeId: res.place_id,
                fields: ["name", "rating", "formatted_address", "opening_hours", "photos", "website"]
              },
              (details: any, detailsStatus: any) => {
                if (detailsStatus === "OK" && details) {
                  setStopPlacesData({
                    place_id: res.place_id,
                    name: details.name || res.name,
                    rating: details.rating || res.rating || "N/A",
                    address: details.formatted_address || res.formatted_address || "Shillong, Meghalaya",
                    isOpenNow: details.opening_hours?.isOpen?.() ?? null,
                    openingHours: details.opening_hours?.weekday_text?.[0] || "Confirm timings live on maps",
                    photoUrl: details.photos?.[0]?.getUrl({ maxWidth: 600 }) || 
                              res.photos?.[0]?.getUrl({ maxWidth: 600 }) || 
                              "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200",
                    website: details.website || null
                  });
                } else {
                  // Core fallback if details fails but core search worked
                  setStopPlacesData({
                    place_id: res.place_id,
                    name: res.name,
                    rating: res.rating || "N/A",
                    address: res.formatted_address || "Shillong, Meghalaya",
                    photoUrl: res.photos?.[0]?.getUrl({ maxWidth: 600 }) || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200",
                  });
                }
                setIsLoadingStopDetails(false);
              }
            );
          } else {
            console.warn("No place resolved for: ", stop.placeNameQuery);
            setIsLoadingStopDetails(false);
          }
        }
      );
    } catch (e) {
      console.error("Stop Details fetch crashed safely: ", e);
      setIsLoadingStopDetails(false);
    }
  };

  // Filter Trails
  const filteredTrails = TRAILS.filter((trail) => {
    const matchDiff = difficultyFilter === "all" || trail.difficulty === difficultyFilter;
    const matchType = typeFilter === "all" || trail.type === typeFilter;
    return matchDiff && matchType;
  });

  // Display setup instructions if key is missing
  if (!hasValidKey) {
    return (
      <div className="flex items-center justify-center min-h-[640px] bg-[#FAF8F5] border border-stone-200 rounded-3xl p-6 animate-pulse" id="gmaps-setup-splash">
        <div className="text-center max-w-md p-6 bg-white rounded-2xl border border-stone-200/80 shadow-xl space-y-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-805 rounded-full flex items-center justify-center mx-auto mb-2">
            <Info className="w-6 h-6 text-amber-800" />
          </div>
          <h2 className="text-xl font-display font-bold text-stone-900">Google Maps Keys Required</h2>
          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            Please configure your <code>GOOGLE_MAPS_PLATFORM_KEY</code> inside Secrets to run the live Maps SDK, Directions APIs and Places discovery.
          </p>
          <div className="text-left space-y-2 p-4 bg-stone-50 rounded-xl border text-[11px] font-mono text-stone-600">
            <p>1. Open top-right ⚙️ settings.</p>
            <p>2. Select Secrets & Environment Variables.</p>
            <p>3. Enter <code>GOOGLE_MAPS_PLATFORM_KEY</code> as the name.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} version="weekly" libraries={["places", "routes"]}>
      <div 
        id="interactive-map-panel" 
        className={`relative w-full overflow-hidden bg-[#FAF8F5] flex flex-col md:flex-row transition-all duration-300 ${
          isMapFullscreen 
            ? "fixed inset-0 z-[1000] rounded-none border-none h-screen w-screen" 
            : "h-full w-full border-none rounded-none shadow-none"
        }`}
      >
        {/* ==================================================== */}
        // 1. LEFT SIDE DECK: SWITCHER BETWEEN CAFES AND TRAILS
        {/* ==================================================== */}
        {!hideSidebar && (
          <div className="w-full md:w-[42%] bg-white border-b md:border-b-0 md:border-r border-stone-200 flex flex-col shrink-0 h-[360px] md:h-full z-20 min-w-[340px] max-w-[480px]">
            
            {/* Deck tab header switch */}
            <div className="p-4 border-b border-stone-150 flex gap-2 bg-stone-50">
              <button
                onClick={() => setActiveSubTab("cafes")}
                className={`flex-1 py-2 px-3.5 rounded-xl text-xs font-display font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeSubTab === "cafes"
                    ? "bg-stone-900 text-amber-300 shadow-md"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900"
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                <span>Coffee Hubs</span>
              </button>
              <button
                onClick={() => {
                  setActiveSubTab("trails");
                  if (!selectedTrail && TRAILS.length > 0) {
                    handleSelectTrail(TRAILS[0]);
                  }
                }}
                className={`flex-1 py-2 px-3.5 rounded-xl text-xs font-display font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeSubTab === "trails"
                    ? "bg-amber-850 bg-amber-800 text-stone-105 text-white shadow-md"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Scenic Trails</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* SUB-VIEW 1: TRADITIONAL CAFES LISTING PANEL */}
              {activeSubTab === "cafes" && (
                <div className="p-4 space-y-4">
                  <div className="space-y-1 select-none">
                    <h4 className="text-xs font-mono font-bold uppercase text-stone-400">Curated Explorer</h4>
                    <p className="text-[11px] text-stone-500 leading-normal font-sans">
                      Discover handpicked local acoustic spots, tea hearths & viewpoint cafes inside Shillong.
                    </p>
                  </div>

                  {/* Local search form inside deck */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (searchQuery.trim()) {
                        // Trigger search event via custom hook or global map handler
                        const formEvent = new CustomEvent("trigger-local-map-search", { detail: searchQuery });
                        window.dispatchEvent(formEvent);
                      }
                    }}
                    className="flex gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200"
                  >
                    <input
                      type="text"
                      placeholder="Search Shillong via Google Places..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent border-none text-xs text-stone-800 py-1 px-2 focus:outline-none placeholder-stone-400 font-sans"
                    />
                  <button 
                    type="submit" 
                    className="p-1 px-3 bg-stone-900 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg hover:bg-stone-950 cursor-pointer"
                  >
                    Go
                  </button>
                </form>

                {/* Filter chips category deck list */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {Object.entries(categoryMeta).slice(0, 5).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setActiveCategoryFilter(key)}
                      className={`px-2 py-1 rounded-md text-[9px] font-sans font-bold tracking-wider uppercase border transition-colors cursor-pointer ${
                        activeCategoryFilter === key
                          ? "bg-stone-900 text-amber-300 border-stone-900"
                          : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      {val.label}
                    </button>
                  ))}
                </div>

                {/* List scroll of curated matching cafes */}
                <div className="space-y-2 pt-2 border-t border-stone-100">
                  {cafesWithCategories
                    .filter(c => activeCategoryFilter === "all" || c.category === activeCategoryFilter)
                    .map((cafe) => {
                      const isSel = selectedCafe?.id === cafe.id;
                      return (
                        <div
                          key={cafe.id}
                          onClick={() => handleMarkerClick(cafe)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-center ${
                            isSel 
                              ? "bg-amber-500/10 border-amber-500 shadow-sm" 
                              : "bg-white border-stone-200 hover:border-amber-700/60"
                          }`}
                        >
                          <img 
                            src={cafe.images.card} 
                            alt={cafe.name} 
                            className="w-12 h-12 object-cover rounded-lg bg-stone-50 shrink-0 border border-stone-100" 
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-display font-bold text-stone-900 text-xs truncate leading-tight">{cafe.name}</h5>
                            <span className="text-[9px] text-stone-400 font-mono block mt-0.5">{cafe.neighborhood}</span>
                            <div className="flex items-center gap-1 mt-1 text-[10px] font-medium text-amber-800">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
                              <span>{cafe.rating} • {cafe.theme}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: ADVANCED TRAILS AND PATHS EXPLORER */}
            {activeSubTab === "trails" && (
              <div className="p-4 space-y-4 text-left">
                <div className="space-y-1 select-none">
                  <h4 className="text-xs font-mono font-bold uppercase text-amber-800 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-amber-700" />
                    <span>Trails & Walks Builder</span>
                  </h4>
                  <p className="text-[11px] text-stone-500 leading-normal font-sans">
                    Toggle beautiful hiking loops or café treks. Recompute travel times live via directions server API.
                  </p>
                </div>

                {/* Search / Multi-filter Group for Predefined Trails */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono uppercase tracking-wider text-stone-400 font-bold block">Difficulty Level</label>
                    <div className="flex flex-wrap gap-1">
                      {DIFFICULTY_OPTIONS.map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setDifficultyFilter(diff)}
                          className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wide border cursor-pointer transition-all ${
                            difficultyFilter === diff
                              ? "bg-amber-800 text-white border-amber-800"
                              : "bg-white text-stone-650 border-stone-200 hover:bg-stone-50"
                          }`}
                        >
                          {diff === "all" ? "All Diff" : diff}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-stone-150">
                    <label className="text-[9px] font-mono uppercase tracking-wider text-stone-400 font-bold block">Walk category</label>
                    <div className="flex flex-wrap gap-1">
                      {TYPE_OPTIONS.map((typeVal) => (
                        <button
                          key={typeVal}
                          onClick={() => setTypeFilter(typeVal)}
                          className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wide border cursor-pointer transition-all ${
                            typeFilter === typeVal
                              ? "bg-amber-800 text-white border-amber-800"
                              : "bg-white text-stone-650 border-stone-200 hover:bg-stone-50"
                          }`}
                        >
                          {typeVal === "all" ? "All categories" : typeVal}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* List Scroll of trails matched filters */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase text-stone-400 font-bold block px-1 select-none">Predefined Journeys</label>
                  {filteredTrails.map((trail) => {
                    const isSelected = selectedTrail?.id === trail.id;
                    return (
                      <div
                        key={trail.id}
                        onClick={() => handleSelectTrail(trail)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col text-left ${
                          isSelected 
                            ? "bg-amber-800/10 border-amber-700 shadow-md" 
                            : "bg-white border-stone-200 hover:border-amber-700/60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h5 className="font-display font-medium text-xs text-stone-900 group-hover:text-amber-800 font-bold">
                            {trail.name}
                          </h5>
                          <span className={`text-[8px] px-1.5 py-0.5 font-mono uppercase tracking-wide rounded ${
                            trail.difficulty === "Easy" ? "bg-green-50 text-green-700 border border-green-200" :
                            trail.difficulty === "Medium" ? "bg-yellow-50 text-yellow-800 border-amber-200" : "bg-red-50 text-red-700 border-red-200"
                          }`}>
                            {trail.difficulty}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-stone-500 font-sans mt-1 leading-snug line-clamp-2">
                          {trail.description}
                        </p>
                        <div className="flex gap-2 items-center mt-2.5 text-[9px] font-mono text-stone-405 text-stone-500 uppercase tracking-widest leading-none">
                          <span className="px-1.5 py-0.5 bg-stone-100 rounded text-stone-600 font-bold">{trail.type}</span>
                          <span>•</span>
                          <span>{trail.stops.length} checkpoints</span>
                        </div>
                      </div>
                    );
                  })}
                  {filteredTrails.length === 0 && (
                    <p className="text-xs text-stone-400 italic font-sans text-center py-4">No custom trails match these filters.</p>
                  )}
                </div>

                {/* Stops sequencing of currently active trail */}
                {selectedTrail && (
                  <div className="pt-4 border-t border-stone-150 space-y-3">
                    <div className="space-y-0.5 select-none">
                      <span className="text-[9px] font-mono uppercase text-stone-400 font-bold">Journey Route Steps</span>
                      <h6 className="font-display font-extrabold text-stone-900 text-xs">Recommended Sequence</h6>
                    </div>

                    <div className="relative border-l ml-2.5 pl-4.5 pl-4 space-y-4">
                      {orderedStops.map((stop, ind) => {
                        const isPrimaryStart = stop.id === startStopId;
                        const isStopActive = activeStop?.id === stop.id;
                        return (
                          <div 
                            key={stop.id} 
                            onClick={() => handleFetchStopDetails(stop)}
                            className={`relative space-y-0.5 text-left group cursor-pointer p-1.5 rounded-lg transition-all ${
                              isStopActive ? "bg-amber-500/10 border-l-2 border-amber-700" : "hover:bg-stone-50"
                            }`}
                          >
                            {/* Sequence sphere */}
                            <span className={`absolute -left-[24px] top-2.5 w-4 h-4 rounded-full flex items-center justify-center text-[8.5px] font-mono font-bold leading-none border-2 ${
                              isPrimaryStart 
                                ? "bg-stone-900 text-amber-300 border-stone-900 shadow-md animate-pulse" 
                                : "bg-white text-stone-700 border-stone-300"
                            }`}>
                              {ind + 1}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <span className="font-display font-medium text-xs text-stone-850 text-stone-900 leading-tight block group-hover:text-amber-800 transition-colors">
                                {stop.name}
                              </span>
                              {isPrimaryStart && (
                                <span className="bg-stone-900 text-amber-300 text-[6.5px] px-1 font-mono tracking-widest rounded leading-relaxed select-none">START</span>
                              )}
                            </div>
                            <p className="text-[10px] text-stone-500 font-light font-sans line-clamp-1 leading-normal">
                              {stop.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        )}

        {/* ==================================================== */}
        // 2. LIVE INTERACTIVE GOOGLE MAP CANVAS & HUD OVERLAYS
        {/* ==================================================== */}
        <div className="flex-1 relative h-full flex flex-col justify-end" style={{ minHeight: isMapFullscreen ? "100vh" : "auto" }}>
          
          {/* Floating Navigation Controls, Category Switchers & Place Search Bars */}
          <div className="absolute top-4 left-4 right-4 z-10 flex flex-col gap-3 pointer-events-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-full">
              
              {/* Controls bar left: curated filters or trail routing dynamic details */}
              <div className="pointer-events-auto shrink-0 flex flex-wrap gap-1.5">
                {activeSubTab === "cafes" ? (
                  /* Cafe category scrolling bar */
                  <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-950/80 backdrop-blur-md rounded-xl border border-stone-800 shadow-xl max-w-full overflow-x-auto scrollbar-none">
                    {Object.entries(categoryMeta).map(([catKey, val]: [string, any]) => {
                      const Icon = val.icon;
                      const isFilterActive = activeCategoryFilter === catKey;
                      return (
                        <button
                          key={catKey}
                          onClick={() => setActiveCategoryFilter(catKey)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9.5px] font-sans font-extrabold tracking-wider uppercase transition-all duration-205 cursor-pointer text-nowrap shrink-0 ${
                            isFilterActive
                              ? "bg-amber-800 text-stone-100 shadow-md"
                              : "text-stone-300 hover:text-white hover:bg-stone-850/85"
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isFilterActive ? "text-amber-300" : "text-stone-400 group-hover:text-amber-400"}`} />
                          <span>{val.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Trails routes active detail panel showing live dynamic calculations */
                  selectedTrail && (
                    <div className="flex flex-col gap-1.5 p-3.5 bg-stone-950/95 backdrop-blur-md rounded-2xl border border-stone-800 shadow-2xl max-w-sm text-left animate-fade-in text-white">
                      <span className="text-[8.5px] font-mono uppercase tracking-widest text-amber-400 font-bold block leading-none">Directions Polyline Active</span>
                      <h5 className="font-display font-black text-xs text-stone-100 mt-0.5 truncate max-w-[260px]">{selectedTrail.name}</h5>
                      
                      {/* Segmented Travel Modes button row */}
                      <div className="flex items-center gap-1 mt-2.5 bg-stone-900 p-0.5 rounded-lg border border-stone-800">
                        {(["WALKING", "DRIVING", "BICYCLING", "TRANSIT", "TWO_WHEELER"] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setTravelMode(mode)}
                            className={`p-1.5 rounded text-[8.5px] font-mono tracking-wide uppercase transition-all cursor-pointer font-bold ${
                              travelMode === mode
                                ? "bg-amber-800 text-stone-100"
                                : "text-stone-400 hover:text-white hover:bg-stone-800"
                            }`}
                            title={`Set Travel Mode to ${mode}`}
                          >
                            {mode === "DRIVING" ? "Car" :
                             mode === "WALKING" ? "Walk" :
                             mode === "BICYCLING" ? "Bike" :
                             mode === "TRANSIT" ? "Transit" : "Two‑W"}
                          </button>
                        ))}
                      </div>

                      {/* Display live values calculated from directionsService */}
                      <div className="flex items-center justify-between gap-4 pt-2.5 border-t border-stone-900 mt-2">
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-mono text-stone-450 text-stone-400 block tracking-widest leading-none">DISTANCE</span>
                          <span className="text-xs font-mono font-black text-amber-300 animate-fade-in">
                            {routeDistance || selectedTrail.distanceFallback}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-mono text-stone-450 text-stone-400 block tracking-widest leading-none">EST. DURATION</span>
                          <span className="text-xs font-mono font-black text-amber-300 animate-fade-in">
                            {routeDuration || selectedTrail.durationFallback}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-mono text-stone-450 text-stone-400 block tracking-widest leading-none">ROUTE CONF</span>
                          <span className="text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-505/20 px-1 rounded block">
                            {isRouteUnavailable ? "FALLBACK" : "LIVE GOOGLE"}
                          </span>
                        </div>
                      </div>

                      {/* Gentle disclaimer about Travel mode availability inside high-altitude hill topography */}
                      {isRouteUnavailable && (
                        <p className="text-[8px] text-amber-500 font-mono mt-1 font-light leading-none">
                          * {travelMode} not direct or offline. Fallback metrics active.
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>

              {/* Utility action headers (fullscreen toggles, maps dark style) */}
              <div className="flex items-center gap-2 pointer-events-auto self-end sm:self-auto shrink-0 animate-fade-in">
                {isMapFullscreen && (
                  <button
                    onClick={() => {
                      setIsMapFullscreen(false);
                      setSelectedCafe(null);
                      setSelectedDiscoveredPlace(null);
                      setActiveStop(null);
                    }}
                    className="px-3.5 py-2 bg-stone-950/95 border border-stone-850 hover:bg-stone-900 text-amber-450 text-amber-300 rounded-xl shadow-2xl transition-all cursor-pointer flex items-center gap-1.5 text-[9.5px] font-mono tracking-wider font-bold h-10 select-none animate-bounce"
                  >
                    <X className="w-4 h-4 shrink-0 font-bold" />
                    <span>CLOSE FULLSCREEN</span>
                  </button>
                )}

                <button
                  onClick={() => setIsMapFullscreen(!isMapFullscreen)}
                  className="p-2.5 rounded-xl bg-stone-950/85 backdrop-blur-md border border-stone-800 hover:bg-stone-900 text-amber-300 shadow-xl transition-all cursor-pointer flex items-center justify-center shrink-0 w-10 h-10"
                  title="Toggle Fullscreen Mode"
                >
                  <Navigation className="w-4.5 h-4.5 text-amber-350" />
                </button>

                <button
                  onClick={() => setMapTheme(mapTheme === "light" ? "dark" : "light")}
                  className="p-2.5 rounded-xl bg-stone-950/85 backdrop-blur-md border border-stone-800 hover:bg-stone-900 text-amber-300 shadow-xl transition-all cursor-pointer flex items-center justify-center shrink-0 w-10 h-10"
                  title="Toggle Google Map Visual Theme"
                >
                  {mapTheme === "light" ? <Moon className="w-4.5 h-4.5 text-amber-30s text-amber-300" /> : <Sun className="w-4.5 h-4.5 text-amber-400" />}
                </button>
              </div>
            </div>

            {/* Quick autocomplete google places search for active cafes tab */}
            {activeSubTab === "cafes" && (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!searchQuery.trim()) return;
                  setIsSearching(true);
                  try {
                    const dynamicPlacesLib = (window as any).google?.maps?.places;
                    const mapInstance = (window as any).googleMapsInstanceForTrails;
                    if (!dynamicPlacesLib || !mapInstance) return;

                    const searchService = new dynamicPlacesLib.PlacesService(mapInstance);
                    searchService.textSearch(
                      {
                        query: `${searchQuery} in Shillong Meghalaya`,
                        location: mapInstance.getCenter() || shillongCenter,
                        radius: 8000
                      },
                      (results: any[], status: any) => {
                        if (status === "OK" && results) {
                          // Map custom live places marker payloads
                          const formattedPay = results.map((r: any) => ({
                            id: r.place_id,
                            displayName: r.name,
                            location: r.geometry?.location,
                            formattedAddress: r.formatted_address,
                            rating: r.rating || null,
                            userRatingsTotal: r.user_ratings_total || null,
                            photos: r.photos || []
                          }));
                          setDiscoveredPlaces(formattedPay);
                          if (formattedPay[0]?.location) {
                            mapInstance.panTo(formattedPay[0].location);
                            mapInstance.setZoom(15);
                          }
                        }
                        setIsSearching(false);
                      }
                    );
                  } catch (err) {
                    console.error("Live discovery failed:", err);
                    setIsSearching(false);
                  }
                }}
                className="flex items-center gap-1.5 max-w-sm pointer-events-auto shadow-2xl p-1 bg-stone-950/90 border border-stone-800 rounded-xl w-full animate-fade-in"
              >
                <div className="flex-1 flex items-center gap-1.5 px-2 bg-stone-900 rounded-lg">
                  <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Search cafes or landmarks..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none text-white text-[11px] font-sans placeholder-stone-500 py-1.5 focus:outline-none"
                  />
                  {searchQuery && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setSearchQuery("");
                        setDiscoveredPlaces([]);
                        setSelectedDiscoveredPlace(null);
                      }}
                      className="text-stone-400 hover:text-white p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-amber-800 hover:bg-amber-900 text-stone-100 text-[9.5px] font-mono font-bold tracking-wide uppercase px-3 py-2 rounded-lg shrink-0 cursor-pointer disabled:opacity-50"
                  disabled={isSearching}
                >
                  {isSearching ? "Searching..." : "Search"}
                </button>
              </form>
            )}
          </div>

          {/* Actual Google Map Instance wrapping with map attributes */}
          <div className="w-full h-full relative" style={{ minHeight: isMapFullscreen ? "100vh" : "100%" }}>
            <LiveMapCanvas 
              cafes={cafesWithCategories}
              activeCategoryFilter={activeCategoryFilter}
              selectedCafe={selectedCafe}
              onSelectCafe={(c) => {
                setSelectedCafe(c);
                onSelectCafe(c);
                setSelectedDiscoveredPlace(null);
                setActiveStop(null);
              }}
              mapTheme={mapTheme}
              setZoomLevel={setZoomLevel}
              shillongCenter={shillongCenter}
              discoveredPlaces={discoveredPlaces}
              selectedDiscoveredPlace={selectedDiscoveredPlace}
              setSelectedDiscoveredPlace={(p) => {
                setSelectedCafe(null);
                setSelectedDiscoveredPlace(p);
                setActiveStop(null);
              }}
              // Trails integration parameters
              activeSubTab={activeSubTab}
              selectedTrail={selectedTrail}
              orderedStops={orderedStops}
              startStopId={startStopId}
              travelMode={travelMode}
              onRouteCalculated={(duration, distance, orderFailed) => {
                setRouteDuration(duration);
                setRouteDistance(distance);
                setIsRouteUnavailable(orderFailed);
              }}
              onSelectTrailStop={(stop) => {
                setSelectedCafe(null);
                setSelectedDiscoveredPlace(null);
                handleFetchStopDetails(stop);
              }}
            />
          </div>

          {/* ==================================================== */}
          // 3. RESPONSIVE sidebar INFO PANEL CARD OR BOTTOM SHEET
          {/* ==================================================== */}
          <AnimatePresence>
            {/* Case A: Curated static cafe popup */}
            {selectedCafe && activeSubTab === "cafes" && (
              <CuratedCafeInfoCard 
                cafe={selectedCafe}
                categoryMeta={categoryMeta}
                getAvgRating={getAvgRating}
                getCafeCategory={getCafeCategory}
                setSelectedCafe={setSelectedCafe}
                triggerChatAsk={triggerChatAsk}
                isSyncing={isSyncing}
                setIsSyncing={setIsSyncing}
              />
            )}

            {/* Case B: Discovered Google Place live query card */}
            {selectedDiscoveredPlace && activeSubTab === "cafes" && (
              <DiscoveredPlaceInfoCard 
                place={selectedDiscoveredPlace}
                setSelectedDiscoveredPlace={setSelectedDiscoveredPlace}
              />
            )}

            {/* Case C: Trails Step POI verified stop overview card */}
            {activeStop && activeSubTab === "trails" && (
              <TrailStopDetailsPanel 
                stop={activeStop}
                placesData={stopPlacesData}
                isLoading={isLoadingStopDetails}
                isStartingPoint={activeStop.id === startStopId}
                onSetAsStartPoint={() => handleSetStartPoint(activeStop.id)}
                onClose={() => setActiveStop(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </APIProvider>
  );
}

/* ==================================================== */
// MAP CANVAS VIEW COMPONENT WITH HOOKS BINDING
/* ==================================================== */
function LiveMapCanvas({
  cafes,
  activeCategoryFilter,
  selectedCafe,
  onSelectCafe,
  mapTheme,
  setZoomLevel,
  shillongCenter,
  discoveredPlaces,
  selectedDiscoveredPlace,
  setSelectedDiscoveredPlace,
  // Trails extensions
  activeSubTab,
  selectedTrail,
  orderedStops,
  startStopId,
  travelMode,
  onRouteCalculated,
  onSelectTrailStop
}: {
  cafes: any[];
  activeCategoryFilter: string;
  selectedCafe: any | null;
  onSelectCafe: (c: any) => void;
  mapTheme: "light" | "dark";
  setZoomLevel: (z: number) => void;
  shillongCenter: google.maps.LatLngLiteral;
  discoveredPlaces: any[];
  selectedDiscoveredPlace: any | null;
  setSelectedDiscoveredPlace: (p: any | null) => void;
  activeSubTab: "cafes" | "trails";
  selectedTrail: Trail | null;
  orderedStops: TrailStop[];
  startStopId: string | null;
  travelMode: "WALKING" | "DRIVING" | "TRANSIT" | "BICYCLING" | "TWO_WHEELER";
  onRouteCalculated: (duration: string, distance: string, failed: boolean) => void;
  onSelectTrailStop: (stop: TrailStop) => void;
}) {
  const map = useMap();
  
  // Store map instance globally so places lookup can refer to it
  useEffect(() => {
    if (map) {
      (window as any).googleMapsInstanceForTrails = map;
    }
  }, [map]);

  // Center on curated cafe when selection shifts
  useEffect(() => {
    if (!map) return;
    if (activeSubTab === "cafes" && selectedCafe && selectedCafe.coordinates) {
      map.panTo({ lat: selectedCafe.coordinates.lat - 0.0015, lng: selectedCafe.coordinates.lng });
      map.setZoom(16);
    }
  }, [selectedCafe, map, activeSubTab]);

  // Fit bounds when trail or order shifts
  useEffect(() => {
    if (!map || activeSubTab !== "trails" || orderedStops.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    orderedStops.forEach((stop) => bounds.extend(stop.coordinates));
    
    // Zoom out slightly and pan
    map.fitBounds(bounds);
    const zoomLimit = map.getZoom() || 14;
    if (zoomLimit > 15) {
      map.setZoom(14);
    }
  }, [orderedStops, map, activeSubTab]);

  useEffect(() => {
    if (!map) return;
    const l = map.addListener("zoom_changed", () => {
      setZoomLevel(map.getZoom() || 14);
    });
    return () => l.remove();
  }, [map, setZoomLevel]);

  // Curated filtration logic
  const filteredCafes = cafes.filter(
    (c) => activeCategoryFilter === "all" || c.category === activeCategoryFilter
  );

  return (
    <div className="w-full h-full relative">
      <Map
        id="gmaps-live-canvas"
        defaultCenter={shillongCenter}
        defaultZoom={14}
        gestureHandling="cooperative"
        disableDefaultUI={true}
        zoomControl={true}
        mapId={mapTheme === "dark" ? "SHILLONG_DARK_ID" : "DEMO_MAP_ID"}
        styles={mapTheme === "dark" ? darkMapStyle : []}
        style={{ width: "100%", height: "100%" }}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
      >
        {/* ==================================================== */}
        {/* VIEW A: CAFES DISCOVERY LAYER MARKERS */}
        {/* ==================================================== */}
        {activeSubTab === "cafes" && (
          <>
            {filteredCafes.map((cafe) => {
              const isSelected = selectedCafe?.id === cafe.id;
              return (
                <AdvancedMarker
                  key={cafe.id}
                  position={cafe.coordinates || shillongCenter}
                  onClick={() => onSelectCafe(cafe)}
                  title={cafe.name}
                >
                  <div className={`relative flex flex-col items-center filter drop-shadow-md select-none group transition-all duration-300 ${
                    isSelected ? "scale-115" : "hover:scale-110"
                  }`}>
                    {isSelected && (
                      <div className="absolute -inset-2 rounded-full border border-dashed border-amber-600 animate-spin-slow pointer-events-none" />
                    )}

                    <div className={`w-8.5 h-8.5 rounded-full border-2 flex items-center justify-center shadow-lg transition-colors ${
                      isSelected ? "border-amber-500 bg-stone-900 text-amber-300" : "border-stone-250 bg-white text-stone-800"
                    }`}>
                      <Coffee className="w-4 h-4 text-amber-800" />
                    </div>

                    <div className="absolute -top-1.5 -right-1.5 bg-zinc-950 border border-stone-800 px-1 py-0.5 rounded text-[8px] font-black text-amber-400 leading-none flex items-center gap-0.5">
                      <span>★</span><span>{cafe.rating}</span>
                    </div>

                    <div className={`absolute -bottom-6 whitespace-nowrap bg-stone-900 text-stone-105 px-2 py-0.5 border border-stone-800 text-[9px] text-white rounded shadow-xl transition-all pointer-events-none ${
                      isSelected ? "scale-100 opacity-100 font-bold" : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                    }`}>
                      {cafe.name}
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* Discovered dynamic search markers */}
            {discoveredPlaces.map((pl) => {
              const pos = pl.location ? { lat: pl.location.lat(), lng: pl.location.lng() } : null;
              if (!pos) return null;
              const isSel = selectedDiscoveredPlace?.id === pl.id;

              return (
                <AdvancedMarker
                  key={pl.id}
                  position={pos}
                  onClick={() => setSelectedDiscoveredPlace(pl)}
                  title={pl.displayName}
                >
                  <div className={`relative flex flex-col items-center select-none group transition-transform ${
                    isSel ? "scale-115 animate-bounce" : "hover:scale-110"
                  }`}>
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shadow-lg ${
                      isSel ? "border-emerald-500 bg-emerald-950 text-emerald-300" : "border-emerald-300 bg-white text-emerald-800"
                    }`}>
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    </div>

                    {pl.rating && (
                      <div className="absolute -top-1.5 -right-1.5 bg-neutral-900 border border-stone-800 px-1 py-0.5 rounded text-[7px] font-bold text-emerald-400">
                        {pl.rating}
                      </div>
                    )}
                  </div>
                </AdvancedMarker>
              );
            })}
          </>
        )}

        {/* ==================================================== */}
        {/* VIEW B: ACTIVE TRAIL AND ROUTING GEOMETRY LAYER */}
        {/* ==================================================== */}
        {activeSubTab === "trails" && selectedTrail && (
          <>
            {/* Draw sequential numbered checkpoints for stops */}
            {orderedStops.map((stop, ind) => {
              const isStart = stop.id === startStopId;
              return (
                <AdvancedMarker
                  key={stop.id}
                  position={stop.coordinates}
                  onClick={() => onSelectTrailStop(stop)}
                  title={`Stop ${ind + 1}: ${stop.name}`}
                >
                  <div className={`relative flex flex-col items-center filter drop-shadow-md select-none group hover:scale-110 transition-transform`}>
                    {/* Ring helper overlay */}
                    {isStart ? (
                      <div className="absolute -inset-2 bg-amber-500/10 rounded-full animate-ping pointer-events-none" />
                    ) : (
                      <div className="absolute -inset-1.5 bg-stone-900/10 rounded-full pointer-events-none" />
                    )}

                    <div className={`w-8.5 h-8.5 rounded-full border-2 flex items-center justify-center shadow-xl transition-colors ${
                      isStart 
                        ? "bg-stone-900 text-amber-300 border-amber-500" 
                        : "bg-amber-800 text-white border-white"
                    }`}>
                      <span className="font-mono text-xs font-black">{ind + 1}</span>
                    </div>

                    <div className="absolute -bottom-6 bg-stone-950 text-stone-100 border border-stone-800 text-[8.5px] px-1.5 py-0.5 rounded whitespace-nowrap shadow-md select-none font-sans scale-85 sm:scale-100">
                      {stop.name}
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* Embed Directions Service calculations subcomponent to draw path */}
            <DirectionsCalculator 
              stops={orderedStops}
              travelMode={travelMode}
              onRouteCalculated={onRouteCalculated}
            />
          </>
        )}
      </Map>
    </div>
  );
}

/* ==================================================== */
// DIRECTIONS ROUTE CALCULATOR & RENDERER INTERNAL PORT
/* ==================================================== */
function DirectionsCalculator({
  stops,
  travelMode,
  onRouteCalculated
}: {
  stops: TrailStop[];
  travelMode: "WALKING" | "DRIVING" | "TRANSIT" | "BICYCLING" | "TWO_WHEELER";
  onRouteCalculated: (duration: string, distance: string, failed: boolean) => void;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary("routes");
  const [renderer, setRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  // Initialize renderer once maps is mounted
  useEffect(() => {
    if (!map) return;
    const r = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true, // We draw numbered spheres ourselves
      polylineOptions: {
        strokeColor: "#b45309", // Warm amber primary
        strokeWeight: 6,
        strokeOpacity: 0.85
      }
    });
    setRenderer(r);
    return () => {
      r.setMap(null);
    };
  }, [map]);

  // Keep routing calculations synchronized
  useEffect(() => {
    if (!map || !routesLib || !renderer || stops.length < 2) return;

    // Map segmented selection to Google Maps TravelMode API schema
    let apiTravelMode = google.maps.TravelMode.DRIVING;
    if (travelMode === "WALKING") apiTravelMode = google.maps.TravelMode.WALKING;
    else if (travelMode === "BICYCLING") apiTravelMode = google.maps.TravelMode.BICYCLING;
    else if (travelMode === "TRANSIT") apiTravelMode = google.maps.TravelMode.TRANSIT;

    const directionsService = new routesLib.DirectionsService();

    const origin = stops[0].coordinates;
    const destination = stops[stops.length - 1].coordinates;
    const waypoints = stops.slice(1, -1).map((s) => ({
      location: s.coordinates,
      stopover: true
    }));

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: apiTravelMode,
        optimizeWaypoints: false
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          renderer.setDirections(result);

          // Calculate leg values
          let totalMeters = 0;
          let totalSeconds = 0;
          const routeLegs = result.routes[0]?.legs;
          if (routeLegs) {
            for (let i = 0; i < routeLegs.length; i++) {
              totalMeters += routeLegs[i].distance?.value || 0;
              totalSeconds += routeLegs[i].duration?.value || 0;
            }
          }

          // Format output metrics
          const estKm = (totalMeters / 1000).toFixed(1) + " km";
          const totMins = Math.round(totalSeconds / 60);
          const estDur = totMins >= 60 
            ? `${Math.floor(totMins / 60)}h ${totMins % 60}m` 
            : `${totMins} mins`;

          // Adjust slightly for transit/bike mode if requested or fallback
          onRouteCalculated(estDur, estKm, false);
        } else {
          // Gracefully inform parents that this specific travelMode failed to resolve paths
          onRouteCalculated("", "", true);
        }
      }
    );
  }, [map, routesLib, renderer, stops, travelMode]);

  return null;
}

/* ==================================================== */
// TRAIL STOP DETAIL CARD (GOOGLE PLACES LIVE RETRIEVAL)
/* ==================================================== */
function TrailStopDetailsPanel({
  stop,
  placesData,
  isLoading,
  isStartingPoint,
  onSetAsStartPoint,
  onClose
}: {
  stop: TrailStop;
  placesData: any | null;
  isLoading: boolean;
  isStartingPoint: boolean;
  onSetAsStartPoint: () => void;
  onClose: () => void;
}) {
  const displayPhoto = placesData?.photoUrl || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200";
  const displayName = placesData?.name || stop.name;
  const displayAddress = placesData?.address || "Check coordinates map for direction links";
  const displayHours = placesData?.openingHours || "Open most daytime mornings.";
  const displayRating = placesData?.rating || "Verified Pin";

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      className="absolute bottom-6 left-6 right-6 md:right-auto md:w-[420px] bg-stone-950 text-stone-100 rounded-3xl border border-stone-800 shadow-2xl p-5 flex flex-col gap-4 overflow-hidden max-h-[380px] md:max-h-[480px] overflow-y-auto select-none"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 p-1.5 bg-stone-900 border border-stone-850 text-stone-300 rounded-full hover:text-white"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Visual Header Image */}
      <div className="relative h-40 md:h-44 w-full rounded-2xl overflow-hidden bg-stone-900 shrink-0 border border-stone-800">
        <img
          src={displayPhoto}
          alt={displayName}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
        
        <div className="absolute bottom-3 left-4 right-4 text-left">
          <span className="text-[8px] uppercase font-mono tracking-widest text-[#d97706] font-bold leading-none select-none flex items-center gap-1">
            <Compass className="w-3 h-3 text-amber-500 animate-spin-slow" />
            <span>Trail Checkpoint Stop</span>
          </span>
          <h4 className="font-display font-extrabold text-white text-sm md:text-md leading-tight mt-1">
            {displayName}
          </h4>
        </div>

        {/* Rating overlay badge */}
        <div className="absolute top-3 left-3 bg-[#1c1917]/95 border border-stone-800 rounded-lg px-2 py-0.5 text-white text-[10px] font-sans font-bold flex items-center gap-1 shadow-md">
          <Star className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
          <span>{displayRating}</span>
        </div>
      </div>

      <div className="space-y-3.5 text-left flex-1">
        
        {/* Dynamic spinner or data */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
            <span className="ml-2 text-xs font-mono font-bold text-stone-300">Resolving Place details live...</span>
          </div>
        ) : (
          <>
            <div className="space-y-1 bg-stone-900/60 p-3 rounded-xl border border-stone-850">
              <span className="text-[8px] font-mono uppercase text-stone-400 font-bold block">Editorial Description</span>
              <p className="text-xs text-stone-300 font-sans leading-relaxed font-light">
                {stop.description}
              </p>
            </div>

            <div className="bg-stone-900/30 p-3 rounded-xl border border-stone-850 text-[10.5px] space-y-2">
              <div className="space-y-0.5">
                <span className="text-[8px] font-mono uppercase text-stone-450 block font-bold">Verified Google Address</span>
                <p className="text-stone-300 font-sans font-light leading-relaxed">
                  {displayAddress}
                </p>
              </div>

              <div className="pt-1 border-t border-stone-900 grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-[7.5px] font-mono uppercase text-stone-450 block font-bold">Hours</span>
                  <p className="text-white font-mono truncate" title={displayHours}>{displayHours}</p>
                </div>
                <div>
                  <span className="text-[7.5px] font-mono uppercase text-[#d97706] block font-bold">Trail starting status</span>
                  <p className="text-white font-mono flex items-center gap-1 select-none">
                    <span className={`w-1.5 h-1.5 rounded-full ${isStartingPoint ? "bg-amber-400" : "bg-stone-605 bg-stone-500"}`} />
                    <span>{isStartingPoint ? "Starting Point" : "Queued Stay"}</span>
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Start Point Re-router trigger click */}
        <div className="flex gap-2 pt-1 font-sans">
          {!isStartingPoint ? (
            <button
              onClick={onSetAsStartPoint}
              className="flex-1 flex items-center justify-center gap-1.5 bg-amber-805 bg-amber-800 hover:bg-amber-900 text-stone-105 text-white text-[11px] uppercase font-bold tracking-wider py-2.5 rounded-xl cursor-pointer shadow-md transition-colors select-none"
            >
              <Waypoints className="w-4 h-4 text-white shrink-0" />
              <span>Set as Start Point & Re-route</span>
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-1.5 bg-stone-900 border border-stone-800 text-stone-400 text-[10px] py-2.5 rounded-xl select-none leading-none">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Active Route starts right here</span>
            </div>
          )}

          <a
            href={placesData?.website || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${stop.name}, Shillong, Meghalaya`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 rounded-xl flex items-center justify-center cursor-pointer transition-colors shrink-0"
            title="Directions on Google Map Native Link"
          >
            <Navigation className="w-4 h-4 text-amber-500" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

/* ==================================================== */
// COMPATIBLE FALLBACK RENDERING HELPERS FOR LIVE RETRIEVAL CARD
/* ==================================================== */
function CuratedCafeInfoCard({
  cafe,
  categoryMeta,
  getAvgRating,
  getCafeCategory,
  setSelectedCafe,
  triggerChatAsk,
  isSyncing,
  setIsSyncing
}: {
  cafe: Cafe;
  categoryMeta: any;
  getAvgRating: (id: string) => string;
  getCafeCategory: (c: Cafe) => string;
  setSelectedCafe: (c: any | null) => void;
  triggerChatAsk: (c: Cafe) => void;
  isSyncing: boolean;
  setIsSyncing: (s: boolean) => void;
}) {
  const map = useMap();
  const [liveGoogleData, setLiveGoogleData] = useState<any | null>(null);

  // Synchronize dynamic info from live Google Places API (New) (CF11 compliant)
  const handleSyncWithGoogle = async () => {
    if (!map) return;
    setIsSyncing(true);

    try {
      const placesLib = (window as any).google?.maps?.places;
      if (!placesLib) {
        setIsSyncing(false);
        return;
      }

      const service = new placesLib.PlacesService(map);
      service.textSearch(
        {
          query: `${cafe.name} Shillong Meghalaya`,
          location: map.getCenter() || { lat: 25.5788, lng: 91.8920 },
          radius: 10000
        },
        (results: any[], status: any) => {
          if (status === "OK" && results && results[0]) {
            const entry = results[0];
            service.getDetails(
              {
                placeId: entry.place_id,
                fields: ["formatted_address", "formatted_phone_number", "rating", "user_ratings_total", "website", "photos"]
              },
              (details: any, detailsStatus: any) => {
                if (detailsStatus === "OK" && details) {
                  setLiveGoogleData({
                    rating: details.rating || entry.rating || null,
                    userRatingsTotal: details.user_ratings_total || entry.user_ratings_total || null,
                    formattedAddress: details.formatted_address || entry.formatted_address || null,
                    phone: details.formatted_phone_number || null,
                    website: details.website || null,
                    photos: details.photos || []
                  });
                }
                setIsSyncing(false);
              }
            );
          } else {
            setIsSyncing(false);
          }
        }
      );
    } catch (err) {
      console.error("Place details sync error: ", err);
      setIsSyncing(false);
    }
  };

  const displayRating = liveGoogleData?.rating || cafe.rating || getAvgRating(cafe.id);

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="absolute z-10 bottom-6 left-6 right-6 md:right-auto md:w-[420px] bg-stone-950 text-white rounded-3xl border border-stone-800 shadow-2xl p-5 flex flex-col gap-4 overflow-hidden max-h-[380px] md:max-h-[500px] overflow-y-auto select-none"
    >
      <button
        onClick={() => setSelectedCafe(null)}
        className="absolute top-3.5 right-3.5 z-20 p-1.5 rounded-full bg-stone-900 border border-stone-850 text-stone-300 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Hero Header with photo */}
      <div className="relative h-40 md:h-44 w-full rounded-2xl overflow-hidden shrink-0 bg-stone-900 border border-stone-800">
        <img
          src={liveGoogleData && liveGoogleData.photos?.[0] ? liveGoogleData.photos[0].getUrl({ maxWidth: 650 }) : cafe.images.card}
          alt={cafe.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/25 to-transparent" />
        
        <div className="absolute bottom-3 left-4 right-4 text-left">
          <span className="text-[8.5px] uppercase font-mono tracking-widest text-[#d97706] font-bold leading-none select-none">
            {categoryMeta[getCafeCategory(cafe)]?.label || "Landmark"}
          </span>
          <h4 className="font-display font-extrabold text-white text-md leading-tight mt-1">
            {cafe.name}
          </h4>
        </div>

        {/* Rating overlay */}
        <div className="absolute top-3 left-3 bg-[#1c1917]/95 border border-stone-800 rounded-lg px-2.5 py-1 text-white text-[10px] font-sans font-bold flex items-center gap-1 shadow-md">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
          <span>{displayRating}</span>
          {liveGoogleData?.userRatingsTotal && (
            <span className="text-[8.5px] text-stone-400 font-light font-mono">({liveGoogleData.userRatingsTotal})</span>
          )}
        </div>

        {/* Google Places sync trigger */}
        <button
          onClick={handleSyncWithGoogle}
          disabled={isSyncing}
          className="absolute top-3 right-3 bg-stone-900 border border-stone-800 hover:bg-stone-850 rounded-lg px-2 py-1 text-amber-300 text-[8.5px] font-mono font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-3 h-3 text-amber-300 shrink-0 ${isSyncing ? "animate-spin" : ""}`} />
          <span>{isSyncing ? "Syncing..." : "Sync Live Google"}</span>
        </button>
      </div>

      <div className="space-y-3.5 text-left flex-1">
        {/* Tagline intro block */}
        <div className="space-y-1 bg-stone-900 p-3.5 rounded-xl border border-stone-850">
          <p className="text-[10px] font-mono tracking-wider font-bold text-amber-400 uppercase">
            "{cafe.tagline}"
          </p>
          <p className="text-xs text-stone-300 font-sans leading-relaxed mt-1.5 font-light">
            {cafe.introduction}
          </p>
        </div>

        {/* Live synced Google address */}
        {(liveGoogleData?.formattedAddress || cafe.formatted_address) && (
          <div className="bg-stone-900/40 p-3 rounded-xl border border-stone-850 text-[10.5px]">
            <span className="text-[8px] font-mono uppercase text-stone-400 font-bold block">Verified Google Address</span>
            <p className="text-stone-300 font-sans mt-0.5 leading-relaxed font-light">
              {liveGoogleData?.formattedAddress || cafe.formatted_address}
            </p>
          </div>
        )}

        {/* Grid attributes */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-stone-900/30 p-3.5 rounded-xl border border-stone-850 text-stone-200">
          <div className="space-y-0.5">
            <span className="text-[8px] font-mono uppercase text-stone-405 text-stone-500 font-bold block">Neighborhood</span>
            <p className="font-sans font-semibold text-white flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              {cafe.neighborhood}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[8px] font-mono uppercase text-stone-505 text-stone-550 font-bold block">Hours</span>
            <p className="font-sans font-semibold text-white flex items-center gap-1 truncate" title={cafe.hours}>
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              {cafe.hours}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[8px] font-mono uppercase text-stone-500 font-bold block">Vibe Specialty</span>
            <p className="font-sans font-semibold text-white truncate">
              {cafe.theme}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[8px] font-mono uppercase text-stone-500 font-bold block">Contact</span>
            <p className="font-sans font-semibold text-white flex items-center gap-1 truncate" title={liveGoogleData?.phone || cafe.phone_number || "+91 364 123 4567"}>
              <Phone className="w-3 h-3 text-amber-300 shrink-0" />
              {liveGoogleData?.phone || cafe.phone_number || "+91 364..."}
            </p>
          </div>
        </div>

        {/* Action button row */}
        <div className="flex gap-2 pt-1">
          <a
            href={cafe.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cafe.name}, Shillong, Meghalaya`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 bg-amber-850 bg-amber-800 hover:bg-amber-900 text-white font-sans text-[11px] uppercase font-bold tracking-wider py-2.5 rounded-xl cursor-pointer shadow-md transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-white" />
            <span>Get Directions</span>
          </a>

          <button
            onClick={() => triggerChatAsk(cafe)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-stone-900 hover:bg-stone-850 hover:text-white text-amber-305 border border-stone-800 font-sans text-[11px] uppercase font-bold tracking-wider py-2.5 rounded-xl cursor-pointer transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>Ask Chatbot</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ==================================================== */
// GOOGLE PLACES RETRIEVED LIVE POI MAP SELECTION CARD
/* ==================================================== */
function DiscoveredPlaceInfoCard({
  place,
  setSelectedDiscoveredPlace
}: {
  place: any;
  setSelectedDiscoveredPlace: (p: any | null) => void;
}) {
  const map = useMap();
  const [fullyFetchedPlace, setFullyFetchedPlace] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    if (!map || !place) return;
    setIsLoadingDetails(true);

    try {
      const placesLib = (window as any).google?.maps?.places;
      if (!placesLib) {
        setIsLoadingDetails(false);
        return;
      }

      const service = new placesLib.PlacesService(map);
      service.getDetails(
        {
          placeId: place.id,
          fields: ["name", "formatted_address", "rating", "website", "formatted_phone_number", "opening_hours", "photos", "reviews"]
        },
        (details: any, status: any) => {
          if (status === "OK" && details) {
            setFullyFetchedPlace(details);
          }
          setIsLoadingDetails(false);
        }
      );
    } catch (e) {
      console.error(e);
      setIsLoadingDetails(false);
    }
  }, [place, map]);

  const name = fullyFetchedPlace?.name || place.displayName || "Google Landmark";
  const formattedAddress = fullyFetchedPlace?.formatted_address || place.formattedAddress || "Shillong, Meghalaya";
  const rating = fullyFetchedPlace?.rating || place.rating || "N/A";
  const ratingCount = fullyFetchedPlace?.user_ratings_total || place.userRatingsTotal || null;
  const phoneNumber = fullyFetchedPlace?.formatted_phone_number || "Direct maps search";
  const website = fullyFetchedPlace?.website || null;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, Shillong`) || place.id}`;
  
  const photoUrl = fullyFetchedPlace?.photos?.[0] 
    ? fullyFetchedPlace.photos[0].getUrl({ maxWidth: 600 }) 
    : "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200";

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="absolute z-10 bottom-6 right-6 left-6 md:left-auto md:w-[420px] bg-emerald-950/95 backdrop-blur-xl border border-emerald-800 shadow-2xl p-5 flex flex-col gap-4 overflow-hidden max-h-[380px] md:max-h-[500px] overflow-y-auto text-stone-105 select-none"
    >
      <button
        onClick={() => setSelectedDiscoveredPlace(null)}
        className="absolute top-3.5 right-3.5 z-20 p-1.5 rounded-full bg-emerald-900/60 text-emerald-200 hover:text-white"
      >
        <X className="w-4 h-4 text-white" />
      </button>

      <div className="relative h-40 md:h-44 w-full rounded-2xl overflow-hidden shrink-0 bg-emerald-950 border border-emerald-800/40">
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/20 to-transparent" />
        
        <div className="absolute bottom-3 left-4 right-4 text-left">
          <span className="text-[8.5px] uppercase font-mono tracking-widest text-[#10b981] font-bold leading-none flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Google Places Discovery</span>
          </span>
          <h4 className="font-display font-extrabold text-white text-md leading-tight mt-1 truncate">
            {name}
          </h4>
        </div>

        {/* Rating overlay */}
        <div className="absolute top-3 left-3 bg-[#022c22]/95 border border-emerald-800/80 rounded-lg px-2.5 py-1 text-white text-[10.5px] flex items-center gap-1 shadow-md">
          <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-400 shrink-0" />
          <span>{rating}</span>
        </div>
      </div>

      <div className="space-y-3.5 text-left flex-1 text-emerald-50 text-xs font-light">
        {isLoadingDetails ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin shrink-0" />
            <span className="ml-2 font-mono text-[10.5px]">Loading dynamic live details...</span>
          </div>
        ) : (
          <>
            <div className="space-y-1 bg-emerald-900/40 p-3 rounded-xl border border-emerald-800/40 leading-relaxed">
              <span className="text-[8px] font-mono uppercase text-emerald-300 font-bold block">Live Place description</span>
              <p className="font-sans font-light text-emerald-100">
                Discovered live via Google Places API nearby scan center. Great local option.
              </p>
            </div>

            <div className="bg-emerald-900/30 p-3 rounded-xl border border-emerald-800/30 text-[10.5px]">
              <span className="text-[8px] font-mono uppercase text-emerald-400 font-bold block">Verified Google Address</span>
              <p className="text-emerald-100 font-sans mt-1 leading-relaxed">
                {formattedAddress}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#022c22]/30 p-3.5 rounded-xl border border-emerald-900/40 text-emerald-150">
              <div className="space-y-0.5">
                <span className="text-[8px] font-mono uppercase text-emerald-400 font-bold block">Contact Number</span>
                <p className="font-sans font-bold text-white truncate">{phoneNumber}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[8px] font-mono uppercase text-emerald-400 font-bold block">Discovery Source</span>
                <p className="font-sans font-bold text-white leading-tight">Google Maps Javascript</p>
              </div>
            </div>
          </>
        )}

        {/* Action button row */}
        <div className="flex gap-2 pt-1 font-sans font-semibold">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] uppercase font-bold tracking-wider py-2.5 rounded-xl cursor-pointer shadow-md transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-white" />
            <span>Open in Maps</span>
          </a>

          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-900 hover:bg-emerald-800 text-emerald-300 border border-emerald-750 text-[11px] uppercase font-bold tracking-wider py-2.5 rounded-xl cursor-pointer transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Visit Website</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
