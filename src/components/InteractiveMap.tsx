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

  // TRAILS & ROUTING EXPLORER MOUNT STATES
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

  // TRAILS ACTIONS IMPLEMENTATION
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
      setStartStopId(