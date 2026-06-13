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
  selectedCafeId?: string;
  hideSidebar?: boolean;
  onNavigateToNeighborhood?: (neighborhoodId: string) => void;
}

// Custom Google Maps Dark Theme styling
const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#1c1917" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1c1917" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#a8a29e" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#292524" }] },
  { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#a8a29e" }] },
  { "featureType": "landscape", "elementType": "geometry", "stylers": [{ "color": "#292524" }] },
  { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#14211a" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#44403c" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#57534e" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0c0a09" }] }
];

const lightMapStyle = [
  { "featureType": "poi", "stylers": [{ "visibility": "off" }] }
];

export default function InteractiveMap({ cafes, onSelectCafe, activeCafeId, selectedCafeId, hideSidebar = false, onNavigateToNeighborhood }: InteractiveMapProps) {
  const resolvedActiveCafeId = activeCafeId ?? selectedCafeId;
  const [activeSubTab, setActiveSubTab] = useState<"cafes" | "trails">("cafes");
  const [mapTheme, setMapTheme] = useState<"light" | "dark">("light");
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(14);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [isMapFullscreen, setIsMapFullscreen] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [discoveredPlaces, setDiscoveredPlaces] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDiscoveredPlace, setSelectedDiscoveredPlace] = useState<any | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const [selectedTrail, setSelectedTrail] = useState<Trail | null>(null);
  const [orderedStops, setOrderedStops] = useState<TrailStop[]>([]);
  const [startStopId, setStartStopId] = useState<string | null>(null);
  const [travelMode, setTravelMode] = useState<"WALKING" | "DRIVING" | "TRANSIT" | "BICYCLING" | "TWO_WHEELER">("DRIVING");
  const [routeDuration, setRouteDuration] = useState("");
  const [routeDistance, setRouteDistance] = useState("");
  const [isRouteUnavailable, setIsRouteUnavailable] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeStop, setActiveStop] = useState<TrailStop | null>(null);
  const [isLoadingStopDetails, setIsLoadingStopDetails] = useState(false);
  const [stopPlacesData, setStopPlacesData] = useState<any | null>(null);

  const shillongCenter = { lat: 25.5788, lng: 91.8920 };

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

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setReviews(data))
      .catch((err) => console.error("Error loading reviews inside Map:", err));
  }, []);

  const getAvgRating = (cafeId: string) => {
    const cafeReviews = reviews.filter((r) => r.cafeId === cafeId);
    if (cafeReviews.length === 0) {
      const seed = (cafeId.charCodeAt(0) + cafeId.charCodeAt(cafeId.length - 1)) % 4;
      return (4.6 + seed * 0.1).toFixed(1);
    }
    const sum = cafeReviews.reduce((acc, cur) => acc + cur.rating, 0);
    return (sum / cafeReviews.length).toFixed(1);
  };

  const getCafeCategory = (cafe: Cafe) => {
    if (cafe.hasKhasiMusic) return "khasi_music";
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

  const categoryMeta: { [key: string]: { label: string; bg: string; text: string; border: string; icon: any; colorHex: string } } = {
    all: { label: "All Hubs", bg: "bg-stone-100", text: "text-stone-800", border: "border-stone-300", icon: MapPin, colorHex: "#7c2d12" },
    cafe: { label: "Cozy Cafés", bg: "bg-amber-50/90", text: "text-amber-800", border: "border-amber-300", icon: Coffee, colorHex: "#b45309" },
    restaurant: { label: "Diners", bg: "bg-rose-50/90", text: "text-rose-800", border: "border-rose-300", icon: MapPin, colorHex: "#dc2626" },
    khasi_cuisine: { label: "Khasi Hearth", bg: "bg-emerald-50/90", text: "text-emerald-800", border: "border-emerald-300", icon: Flame, colorHex: "#059669" },
    rooftop: { label: "Rooftop Decks", bg: "bg-cyan-50/90", text: "text-cyan-800", border: "border-cyan-300", icon: Sun, colorHex: "#0891b2" },
    live_music: { label: "Live Stage", bg: "bg-fuchsia-50/90", text: "text-fuchsia-800", border: "border-fuchsia-300", icon: Music, colorHex: "#c026d3" },
    khasi_music: { label: "Khasi Music 🎵", bg: "bg-indigo-50/90", text: "text-indigo-800", border: "border-indigo-300", icon: Music, colorHex: "#4f46e5" },
    budget: { label: "Local Eateries", bg: "bg-yellow-50/90", text: "text-yellow-800", border: "border-yellow-300", icon: Info, colorHex: "#d97706" },
    premium: { label: "Fine Dining", bg: "bg-stone-900", text: "text-amber-300", border: "border-amber-600", icon: Crown, colorHex: "#d97706" },
  };

  const cafesWithCategories = cafes.map((cafe) => ({
    ...cafe,
    category: getCafeCategory(cafe),
    rating: getAvgRating(cafe.id),
  }));

  const handleMarkerClick = (cafe: Cafe) => {
    setSelectedDiscoveredPlace(null);
    setSelectedCafe(cafe);
    onSelectCafe(cafe);
  };

  const triggerChatAsk = (cafe: Cafe) => {
    const customPrompt = `Tell me more details about "${cafe.name}" in ${cafe.neighborhood}, Shillong. What are its operating hours, popular dishes, and tribal acoustic vibe?`;
    const event = new CustomEvent("ask-kong-labet", {
      detail: { prompt: customPrompt }
    });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    if (!resolvedActiveCafeId) return;
    const matchedCafe = cafesWithCategories.find((c) => c.id === resolvedActiveCafeId);
    if (matchedCafe) {
      setActiveSubTab("cafes");
      setSelectedDiscoveredPlace(null);
      setSelectedCafe(matchedCafe);
    }
  }, [resolvedActiveCafeId]);

  const handleSelectTrail = (trail: Trail) => {
    setSelectedTrail(trail);
    setOrderedStops(trail.stops);
    setStartStopId(trail.stops[0].id);
    setActiveStop(null);
    setRouteDistance("");
    setRouteDuration("");
    setIsRouteUnavailable(false);
  };

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
      const clickedStop = selectedTrail.stops[index];
      handleFetchStopDetails(clickedStop);
    }
  };

  const handleFetchStopDetails = async (stop: TrailStop) => {
    setActiveStop(stop);
    setIsLoadingStopDetails(true);
    setStopPlacesData(null);
    try {
      const res = await fetch(`/api/places/nearby?name=${encodeURIComponent(stop.name)}&lat=${stop.coordinates.lat}&lng=${stop.coordinates.lng}`);
      if (res.ok) {
        const data = await res.json();
        setStopPlacesData(data);
      }
    } catch (e) {
      console.error("Failed to fetch stop details", e);
    } finally {
      setIsLoadingStopDetails(false);
    }
  };

  const handleLivePlacesSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setDiscoveredPlaces([]);
    setSelectedDiscoveredPlace(null);
    try {
      const res = await fetch(`/api/places/search?query=${encodeURIComponent(searchQuery + " Shillong")}`);
      if (res.ok) {
        const data = await res.json();
        setDiscoveredPlaces(data.places || []);
      }
    } catch (e) {
      console.error("Live search failed", e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRouteCalculated = (duration: string, distance: string, failed: boolean) => {
    if (failed) {
      setIsRouteUnavailable(true);
      setRouteDuration("");
      setRouteDistance("");
    } else {
      setIsRouteUnavailable(false);
      setRouteDuration(duration);
      setRouteDistance(distance);
    }
  };

  const filteredCafes = cafesWithCategories.filter((c) => {
    if (c.id === "alaya-cafe") return true; // Always display Alaya Cafe
    if (activeCategoryFilter === "all") return true;
    if (activeCategoryFilter === "khasi_music") {
      return c.hasKhasiMusic || c.vibeTags?.some(t => /khasi music|local music|tribal music/i.test(t));
    }
    return c.category === activeCategoryFilter;
  });

  const filteredTrails = TRAILS.filter((trail) => {
    const matchDiff = difficultyFilter === "all" || trail.difficulty === difficultyFilter;
    const matchType = typeFilter === "all" || trail.type === typeFilter;
    return matchDiff && matchType;
  });

  const mapId = mapTheme === "dark" ? "dark-shillong-map" : "light-shillong-map";

  if (!hasValidKey) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-stone-100 rounded-2xl border border-stone-200 gap-4 text-stone-500 px-8 text-center">
        <MapPin className="w-10 h-10 text-stone-300" />
        <div>
          <p className="font-semibold text-stone-700 mb-1">Map Preview Unavailable</p>
          <p className="text-sm text-stone-400">A valid Google Maps API key is required to render the interactive map.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${isMapFullscreen ? "fixed inset-0 z-[9999] flex flex-col" : "w-full"}`}>
      {/* Map Tab Bar */}
      <div className={`${isMapFullscreen ? "bg-white border-b border-stone-200 px-4 py-2 flex items-center gap-3" : "flex items-center gap-2 mb-2"}`}>
        <button
          onClick={() => setActiveSubTab("cafes")}
          className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-colors ${
            activeSubTab === "cafes"
              ? "bg-stone-900 text-amber-300"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          <Coffee className="w-3 h-3 inline mr-1" />
          Cafes & Restaurants
        </button>
        <button
          onClick={() => setActiveSubTab("trails")}
          className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider rounded-lg transition-colors ${
            activeSubTab === "trails"
              ? "bg-amber-800 text-white"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          <Waypoints className="w-3 h-3 inline mr-1" />
          Trail Explorer
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setMapTheme(mapTheme === "dark" ? "light" : "dark")}
            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg transition-colors"
            aria-label="Toggle map theme"
          >
            {mapTheme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsMapFullscreen(!isMapFullscreen)}
            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg transition-colors"
            aria-label="Toggle fullscreen"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Category Filter Bar (Cafes Mode) */}
      {activeSubTab === "cafes" && (
        <div className="flex gap-1.5 flex-wrap mb-2">
          {Object.entries(categoryMeta).map(([key, val]) => {
            const Icon = val.icon;
            return (
              <button
                key={key}
                onClick={() => setActiveCategoryFilter(key)}
                className={`flex items-center gap-1 px-2 py-1 text-[10px] font-mono uppercase tracking-wider rounded-lg border transition-colors ${
                  activeCategoryFilter === key
                    ? `${val.bg} ${val.text} ${val.border} border`
                    : "bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100"
                }`}
              >
                <Icon className="w-3 h-3" />
                {val.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Trails Filter + Live Search (Trails Mode) */}
      {activeSubTab === "trails" && (
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="text-[11px] font-mono border border-stone-200 rounded-lg px-2 py-1 bg-white text-stone-700"
          >
            {DIFFICULTY_OPTIONS.map((d) => (
              <option key={d} value={d}>{d === "all" ? "All Difficulties" : d}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-[11px] font-mono border border-stone-200 rounded-lg px-2 py-1 bg-white text-stone-700"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>{t === "all" ? "All Trail Types" : t.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</option>
            ))}
          </select>
        </div>
      )}

      {/* Live Discovery Search Bar */}
      {activeSubTab === "cafes" && (
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLivePlacesSearch()}
              placeholder="Discover a place live on map…"
              className="w-full pl-8 pr-3 py-1.5 text-[11px] font-sans bg-white border border-stone-200 rounded-xl text-stone-700 placeholder-stone-400 focus:outline-none focus:border-stone-400"
            />
          </div>
          <button
            onClick={handleLivePlacesSearch}
            disabled={isSearching}
            className="px-3 py-1.5 bg-stone-900 text-amber-300 text-[10px] font-mono uppercase tracking-wider rounded-xl hover:bg-stone-800 transition-colors disabled:opacity-50"
          >
            {isSearching ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Go"}
          </button>
        </div>
      )}

      {/* Trails List Sidebar or Inline */}
      {activeSubTab === "trails" && !selectedTrail && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {filteredTrails.map((trail) => (
            <button
              key={trail.id}
              onClick={() => handleSelectTrail(trail)}
              className="text-left bg-white border border-stone-200 rounded-2xl p-3 hover:border-amber-400 hover:bg-amber-50/30 transition-all group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] font-mono font-bold text-stone-800 group-hover:text-amber-900 leading-tight">{trail.name}</p>
                  <p className="text-[9px] text-stone-400 mt-0.5 font-sans leading-snug line-clamp-2">{trail.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-amber-600 shrink-0 mt-0.5" />
              </div>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                <span className="text-[8px] px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded font-mono uppercase">{trail.difficulty}</span>
                <span className="text-[8px] px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded font-mono uppercase">{trail.durationFallback}</span>
                <span className="text-[8px] px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded font-mono uppercase">{trail.stops.length} stops</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Active Trail Info Strip */}
      {activeSubTab === "trails" && selectedTrail && (
        <div className="flex items-center gap-3 bg-amber-950 text-amber-100 rounded-xl px-3 py-2 mb-2 text-[11px] font-mono">
          <Waypoints className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-bold text-amber-300 truncate">{selectedTrail.name}</span>
          <span className="text-amber-600">·</span>
          <span className="text-amber-400 shrink-0">{orderedStops.length} stops</span>
          {routeDuration && (
            <>
              <span className="text-amber-600">·</span>
              <span className="text-amber-300 flex items-center gap-1 shrink-0">
                <Gauge className="w-3 h-3" />{routeDuration}
              </span>
              <span className="text-amber-600">·</span>
              <span className="text-amber-300 shrink-0">{routeDistance}</span>
            </>
          )}
          {isRouteUnavailable && (
            <span className="text-amber-500 ml-auto flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> Route unavailable
            </span>
          )}
          <button
            onClick={() => {
              setSelectedTrail(null);
              setOrderedStops([]);
              setActiveStop(null);
            }}
            className="ml-auto text-amber-500 hover:text-white transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Travel Mode Selector */}
      {activeSubTab === "trails" && selectedTrail && (
        <div className="flex gap-1.5 mb-2 flex-wrap">
          {(["DRIVING", "WALKING", "BICYCLING", "TRANSIT"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setTravelMode(mode)}
              className={`flex items-center gap-1 px-2 py-1 text-[9px] font-mono uppercase tracking-wider rounded-lg border transition-colors ${
                travelMode === mode
                  ? "bg-stone-900 text-amber-300 border-stone-700"
                  : "bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100"
              }`}
            >
              {mode === "DRIVING" && <Car className="w-3 h-3" />}
              {mode === "WALKING" && <Navigation className="w-3 h-3" />}
              {mode === "BICYCLING" && <ArrowRight className="w-3 h-3" />}
              {mode === "TRANSIT" && <Gauge className="w-3 h-3" />}
              {mode}
            </button>
          ))}
        </div>
      )}

      {/* Ordered Stop Strip for selected trail */}
      {activeSubTab === "trails" && selectedTrail && orderedStops.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2 scrollbar-none">
          {orderedStops.map((stop, i) => (
            <button
              key={stop.id}
              onClick={() => handleFetchStopDetails(stop)}
              className={`shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-mono uppercase tracking-wider transition-colors ${
                activeStop?.id === stop.id
                  ? "bg-amber-800 text-white border-amber-700"
                  : stop.id === startStopId
                  ? "bg-stone-900 text-amber-300 border-stone-700"
                  : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
              }`}
            >
              <span className="font-black text-[8px]">{i + 1}</span>
              <span className="max-w-[80px] truncate">{stop.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* THE MAP */}
      <div className={`relative rounded-2xl overflow-hidden border border-stone-200 ${isMapFullscreen ? "flex-1" : "h-[480px] md:h-[560px]"}`}>
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <Map
            mapId={mapId}
            defaultCenter={shillongCenter}
            defaultZoom={zoomLevel}
            gestureHandling="greedy"
            disableDefaultUI={false}
            styles={mapTheme === "dark" ? darkMapStyle : lightMapStyle}
            onZoomChanged={(ev) => setZoomLevel(ev.detail.zoom)}
            className="w-full h-full"
          >
            {/* Curated Cafe Markers */}
            {activeSubTab === "cafes" && filteredCafes.map((cafe) => {
              const meta = categoryMeta[cafe.category] || categoryMeta["cafe"];
              const isSelected = selectedCafe?.id === cafe.id;
              const isAlaya = cafe.id === "alaya-cafe";
              return (
                <AdvancedMarker
                  key={cafe.id}
                  position={cafe.coordinates}
                  onClick={() => handleMarkerClick(cafe)}
                  title={cafe.name}
                  zIndex={isAlaya ? (isSelected ? 9999 : 999) : (isSelected ? 100 : 10)}
                >
                  <div
                    className={`relative flex flex-col items-center filter drop-shadow-lg select-none transition-all duration-300 ${
                      isAlaya 
                        ? (isSelected ? "scale-[2.0] z-50 alaya-marker-class" : "scale-[1.6] z-40 alaya-marker-class") 
                        : (isSelected ? "scale-125 z-10" : "hover:scale-110")
                    }`}
                  >
                    {isAlaya ? (
                      <div className="relative flex flex-col items-center">
                        {/* Glowing backdrop halo */}
                        <div className="absolute -inset-4 rounded-full border-4 border-amber-500 bg-amber-500/30 animate-pulse blur-xs" />
                        <div className="absolute -inset-2 rounded-full border-2 border-amber-400 bg-amber-400/20 animate-ping pointer-events-none" />
                        
                        {/* Custom gold crown pin */}
                        <div
                          className="w-14 h-14 rounded-full border-4 border-amber-300 flex items-center justify-center shadow-2xl bg-gradient-to-tr from-amber-700 via-amber-400 to-amber-900 text-stone-900"
                        >
                          <Crown className="w-7 h-7 text-amber-100 fill-amber-400 shrink-0 filter drop-shadow-md animate-pulse" />
                        </div>
                        
                        {/* Floating Editor's Featured Choice Badge */}
                        <div className="absolute -top-9 bg-amber-900 border-2 border-amber-400 text-[9px] px-3 py-1 rounded-full font-mono text-white font-black whitespace-nowrap shadow-2xl flex items-center gap-1 select-none leading-none animate-bounce">
                          <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                          <span>EDITOR'S FEATURED CHOICE</span>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: meta.colorHex }}
                      >
                        <meta.icon className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    {isSelected && !isAlaya && (
                      <div className="absolute -inset-1 rounded-full border-2 border-amber-400 animate-ping pointer-events-none" />
                    )}
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* Live Discovered Place Markers */}
            {activeSubTab === "cafes" && discoveredPlaces.map((place) => (
              <AdvancedMarker
                key={place.id}
                position={{ lat: place.location?.latitude, lng: place.location?.longitude }}
                onClick={() => {
                  setSelectedCafe(null);
                  setSelectedDiscoveredPlace(place);
                }}
                title={place.displayName}
              >
                <div className="w-7 h-7 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </AdvancedMarker>
            ))}

            {/* Trail Stop Markers */}
            {activeSubTab === "trails" && selectedTrail && (
              <>
                {orderedStops.map((stop, ind) => {
                  const isStart = stop.id === startStopId;
                  return (
                    <AdvancedMarker
                      key={stop.id}
                      position={stop.coordinates}
                      onClick={() => handleFetchStopDetails(stop)}
                      title={`Stop ${ind + 1}: ${stop.name}`}
                    >
                      <div className={`relative flex flex-col items-center filter drop-shadow-md select-none group hover:scale-110 transition-transform`}>
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

                <DirectionsCalculator
                  stops={orderedStops}
                  travelMode={travelMode}
                  onRouteCalculated={handleRouteCalculated}
                />
              </>
            )}
            <MapCenterController selectedCafe={selectedCafe} activeStop={activeStop} />
          </Map>
        </APIProvider>

        {/* Curated Cafe Info Card */}
        <AnimatePresence>
          {activeSubTab === "cafes" && selectedCafe && (
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
        </AnimatePresence>

        {/* Discovered Place Info Card */}
        <AnimatePresence>
          {activeSubTab === "cafes" && selectedDiscoveredPlace && (
            <DiscoveredPlaceInfoCard
              place={selectedDiscoveredPlace}
              setSelectedDiscoveredPlace={setSelectedDiscoveredPlace}
            />
          )}
        </AnimatePresence>

        {/* Trail Stop Detail Panel */}
        <AnimatePresence>
          {activeSubTab === "trails" && activeStop && (
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
  );
}

/* ==================================================== */
/* DIRECTIONS ROUTE CALCULATOR & RENDERER INTERNAL PORT */
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

  useEffect(() => {
    if (!map) return;
    const r = new google.maps.DirectionsRenderer({
      map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#b45309",
        strokeWeight: 6,
        strokeOpacity: 0.85
      }
    });
    setRenderer(r);
    return () => {
      r.setMap(null);
    };
  }, [map]);

  useEffect(() => {
    if (!map || !routesLib || !renderer || stops.length < 2) return;

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
          let totalMeters = 0;
          let totalSeconds = 0;
          const routeLegs = result.routes[0]?.legs;
          if (routeLegs) {
            for (let i = 0; i < routeLegs.length; i++) {
              totalMeters += routeLegs[i].distance?.value || 0;
              totalSeconds += routeLegs[i].duration?.value || 0;
            }
          }
          const estKm = (totalMeters / 1000).toFixed(1) + " km";
          const totMins = Math.round(totalSeconds / 60);
          const estDur = totMins >= 60
            ? `${Math.floor(totMins / 60)}h ${totMins % 60}m`
            : `${totMins} mins`;
          onRouteCalculated(estDur, estKm, false);
        } else {
          onRouteCalculated("", "", true);
        }
      }
    );
  }, [map, routesLib, renderer, stops, travelMode]);

  return null;
}

/* ==================================================== */
/* TRAIL STOP DETAIL CARD (GOOGLE PLACES LIVE RETRIEVAL)*/
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
        <div className="absolute top-3 left-3 bg-[#1c1917]/95 border border-stone-800 rounded-lg px-2 py-0.5 text-white text-[10px] font-sans font-bold flex items-center gap-1 shadow-md">
          <Star className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
          <span>{displayRating}</span>
        </div>
      </div>

      <div className="space-y-3.5 text-left flex-1">
        {isLoading ? (
          <div className="flex flex-col gap-3 animate-pulse">
            <div className="h-3 bg-stone-800 rounded w-3/4" />
            <div className="h-3 bg-stone-800 rounded w-1/2" />
            <div className="h-3 bg-stone-800 rounded w-2/3" />
          </div>
        ) : (
          <>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-stone-300 font-sans leading-snug">{displayAddress}</p>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-stone-300 font-sans leading-snug">{displayHours}</p>
            </div>
            <p className="text-[11px] text-stone-400 font-sans leading-relaxed line-clamp-3 border-t border-stone-800 pt-3">
              {stop.description}
            </p>
            <div className="flex gap-2 pt-1">
              {!isStartingPoint && (
                <button
                  onClick={onSetAsStartPoint}
                  className="flex-1 py-2 px-3 bg-amber-800 hover:bg-amber-700 text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Set as Start</span>
                </button>
              )}
              {isStartingPoint && (
                <div className="flex-1 py-2 px-3 bg-stone-800 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 select-none">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Starting Point</span>
                </div>
              )}
              <button
                onClick={onClose}
                className="py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-300 text-[10px] font-mono uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ==================================================== */
/* CURATED CAFE INFO CARD (STATIC CURATED DATA POPUP)   */
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
  cafe: any;
  categoryMeta: any;
  getAvgRating: (id: string) => string;
  getCafeCategory: (cafe: any) => string;
  setSelectedCafe: (c: any) => void;
  triggerChatAsk: (cafe: any) => void;
  isSyncing: boolean;
  setIsSyncing: (v: boolean) => void;
}) {
  const cat = getCafeCategory(cafe);
  const meta = categoryMeta[cat] || categoryMeta["cafe"];
  const rating = getAvgRating(cafe.id);
  const isAlaya = cafe.id === "alaya-cafe";

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      className={`absolute bottom-6 left-6 right-6 md:right-auto md:w-[400px] bg-white rounded-3xl border shadow-2xl overflow-hidden max-h-[380px] md:max-h-[460px] flex flex-col select-none ${
        isAlaya ? "border-amber-450 ring-2 ring-amber-300/40" : "border-stone-200"
      }`}
    >
      <button
        onClick={() => setSelectedCafe(null)}
        className="absolute top-4 right-4 z-20 p-1.5 bg-white/80 backdrop-blur-sm border border-stone-200 text-stone-500 rounded-full hover:text-stone-900 hover:bg-white transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="relative h-36 md:h-44 w-full overflow-hidden bg-stone-100 shrink-0">
        <img
          src={cafe.images?.card || cafe.images?.hero || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200"}
          alt={cafe.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/70 via-stone-900/10 to-transparent" />
        <div className="absolute bottom-3 left-4 right-10 text-left">
          {isAlaya ? (
            <span className="inline-flex items-center gap-1 text-[8px] uppercase font-mono tracking-widest font-bold leading-none px-2 py-1 rounded bg-amber-800 text-amber-250 border border-amber-600 shadow-sm">
              <Crown className="w-2.5 h-2.5 text-amber-300" />
              Editor's Featured Choice
            </span>
          ) : (
            <span className={`text-[8px] uppercase font-mono tracking-widest font-bold leading-none px-1.5 py-0.5 rounded ${meta.bg} ${meta.text}`}>
              {meta.label}
            </span>
          )}
          <h4 className="font-display font-extrabold text-white text-sm leading-tight mt-1 drop-shadow">
            {cafe.name}
          </h4>
        </div>
        <div className="absolute top-3 left-3 bg-stone-900/90 border border-stone-700 rounded-lg px-2 py-0.5 text-white text-[10px] font-sans font-bold flex items-center gap-1 shadow-md">
          <Star className="w-3 h-3 fill-amber-500 text-amber-550 shrink-0 border-none" />
          <span>{rating}</span>
        </div>
      </div>

      <div className="p-4 space-y-3 overflow-y-auto flex-1">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span className="text-[11px] text-stone-500 font-sans">{cafe.neighborhood}, Shillong</span>
        </div>
        {cafe.tagline && (
          <p className="text-[11px] text-stone-600 font-sans leading-snug italic border-l-2 border-amber-300 pl-2">
            "{cafe.tagline}"
          </p>
        )}
        {cafe.vibeTags && cafe.vibeTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {cafe.vibeTags.slice(0, 5).map((tag: string) => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-mono uppercase tracking-wide">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2 pt-1 border-t border-stone-100">
          <button
            onClick={() => triggerChatAsk(cafe)}
            className="flex-1 py-2 px-3 bg-stone-900 hover:bg-stone-800 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Ask AI</span>
          </button>
          <button
            onClick={() => {
              setIsSyncing(true);
              setTimeout(() => setIsSyncing(false), 1500);
            }}
            className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-600 text-[10px] font-mono uppercase tracking-wider rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ==================================================== */
/* DISCOVERED PLACE INFO CARD (LIVE GOOGLE PLACES DATA) */
/* ==================================================== */
function DiscoveredPlaceInfoCard({
  place,
  setSelectedDiscoveredPlace
}: {
  place: any;
  setSelectedDiscoveredPlace: (p: any) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      className="absolute bottom-6 left-6 right-6 md:right-auto md:w-[380px] bg-white rounded-3xl border border-emerald-200 shadow-2xl p-5 flex flex-col gap-3 select-none max-h-[340px] overflow-y-auto"
    >
      <button
        onClick={() => setSelectedDiscoveredPlace(null)}
        className="absolute top-4 right-4 z-20 p-1.5 bg-stone-100 border border-stone-200 text-stone-500 rounded-full hover:text-stone-900 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      <div className="pr-8">
        <span className="text-[8px] uppercase font-mono tracking-widest text-emerald-700 font-bold flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          <span>Live Discovery Result</span>
        </span>
        <h4 className="font-display font-extrabold text-stone-900 text-sm leading-tight mt-1">
          {place.displayName}
        </h4>
      </div>
      {place.rating && (
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
          <span className="text-[11px] font-bold text-stone-700">{place.rating}</span>
          {place.userRatingsTotal && (
            <span className="text-[10px] text-stone-400 font-sans">({place.userRatingsTotal} reviews)</span>
          )}
        </div>
      )}
      {place.formattedAddress && (
        <div className="flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-stone-500 font-sans leading-snug">{place.formattedAddress}</p>
        </div>
      )}
      <a
        href={`https://www.google.com/maps/place/?q=place_id:${place.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-mono font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer mt-1"
      >
        <Globe className="w-3 h-3" />
        <span>View on Google Maps</span>
      </a>
    </motion.div>
  );
}

function MapCenterController({ selectedCafe, activeStop }: { selectedCafe: Cafe | null; activeStop: TrailStop | null }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    if (selectedCafe && selectedCafe.coordinates?.lat && selectedCafe.coordinates?.lng) {
      map.panTo({ lat: selectedCafe.coordinates.lat, lng: selectedCafe.coordinates.lng });
      map.setZoom(16);
    } else if (activeStop && activeStop.coordinates?.lat && activeStop.coordinates?.lng) {
      map.panTo({ lat: activeStop.coordinates.lat, lng: activeStop.coordinates.lng });
      map.setZoom(16);
    }
  }, [map, selectedCafe, activeStop]);
  return null;
}
