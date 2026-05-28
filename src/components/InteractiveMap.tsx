import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Sun, Moon, MapPin, Coffee, Flame, Music, Crown, 
  Sparkles, Clock, Globe, Navigation, MessageSquare, Info, Star, CheckCircle2, Phone
} from "lucide-react";
import { Cafe, Review } from "../types";

interface InteractiveMapProps {
  cafes: Cafe[];
  onSelectCafe: (cafe: Cafe) => void;
  activeCafeId?: string;
}

export default function InteractiveMap({ cafes, onSelectCafe, activeCafeId }: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // States
  const [mapTheme, setMapTheme] = useState<"light" | "dark">("light");
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(14);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hoveredCafeId, setHoveredCafeId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");

  // Fetch reviews to calculate dynamic ratings
  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setReviews(data))
      .catch((err) => console.error("Error loading ratings inside Map:", err));
  }, []);

  // Compute average rating for a cafe
  const getAvgRating = (cafeId: string) => {
    const cafeReviews = reviews.filter((r) => r.cafeId === cafeId);
    if (cafeReviews.length === 0) {
      // Seed a stable rating based on ID length
      const seed = (cafeId.charCodeAt(0) + cafeId.charCodeAt(cafeId.length - 1)) % 4;
      return (4.6 + seed * 0.1).toFixed(1);
    }
    const sum = cafeReviews.reduce((acc, cur) => acc + cur.rating, 0);
    return (sum / cafeReviews.length).toFixed(1);
  };

  // Classify cafe into custom categories
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

  // Category visual metadata
  const categoryMeta: { [key: string]: { label: string; bg: string; text: string; border: string; icon: any; colorHex: string } } = {
    all: { label: "All Hubs", bg: "bg-stone-100", text: "text-stone-800", border: "border-stone-300", icon: MapPin, colorHex: "#7c2d12" },
    cafe: { label: "Cozy Cafés", bg: "bg-amber-50/90", text: "text-amber-800", border: "border-amber-300", icon: Coffee, colorHex: "#b45309" },
    restaurant: { label: "Diners", bg: "bg-rose-50/90", text: "text-rose-800", border: "border-rose-300", icon: MapPin, colorHex: "#dc2626" },
    khasi_cuisine: { label: "Khasi Hearth", bg: "bg-emerald-50/90", text: "text-emerald-800", border: "border-emerald-300", icon: Flame, colorHex: "#059669" },
    rooftop: { label: "Rooftop Decks", bg: "bg-cyan-50/90", text: "text-cyan-800", border: "border-cyan-300", icon: Sun, colorHex: "#0891b2" },
    live_music: { label: "Live Stage", bg: "bg-fuchsia-50/90", text: "text-fuchsia-800", border: "border-fuchsia-300", icon: Music, colorHex: "#c026d3" },
    budget: { label: "Local Eateries", bg: "bg-yellow-50/90", text: "text-yellow-800", border: "border-yellow-300", icon: Info, colorHex: "#d97706" },
    premium: { label: "Fine Dining", bg: "bg-stone-900", text: "text-amber-250 text-amber-300", border: "border-amber-600", icon: Crown, colorHex: "#d97706" },
  };

  // Pre-calculate categories
  const cafesWithCategories = cafes.map((cafe) => ({
    ...cafe,
    category: getCafeCategory(cafe),
    rating: getAvgRating(cafe.id),
  }));

  // Handlers
  const handleMarkerClick = (cafe: Cafe) => {
    setSelectedCafe(cafe);
    onSelectCafe(cafe);
    if (mapInstanceRef.current && cafe.coordinates) {
      mapInstanceRef.current.flyTo([cafe.coordinates.lat - 0.002, cafe.coordinates.lng], 16, {
        animate: true,
        duration: 1.5,
      });
    }
  };

  // Dynamic Tile Layer URLs
  const tiles = {
    light: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  };

  // Toggle Map Theme
  const toggleTheme = () => {
    const nextTheme = mapTheme === "light" ? "dark" : "light";
    setMapTheme(nextTheme);
    if (tileLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      tileLayerRef.current = L.tileLayer(tiles[nextTheme], {
        attribution: '&copy; <a href="https://carto.com/">Carto</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }
  };

  // 1. INITIALIZE MAP
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init in dev StrictMode

    // Shillong central coordinates (coordinates cover Laitumkhrah/Police Bazaar ridges)
    const shillongCenter: L.LatLngExpression = [25.5788, 91.8920];

    const map = L.map(mapContainerRef.current, {
      center: shillongCenter,
      zoom: 14,
      zoomControl: false, // Customized position below
      layers: [],
    });

    // Add zoom controls on top-right
    L.control.zoom({ position: "topright" }).addTo(map);

    // Initialize Tile Layer according to state
    const tileLayer = L.tileLayer(tiles[mapTheme], {
      attribution: '&copy; <a href="https://carto.com/">Carto</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;
    mapInstanceRef.current = map;

    // Monitor zoom changes to support dynamic zoom-clustering
    map.on("zoomend", () => {
      setZoomLevel(map.getZoom());
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. REBUILD MARKERS AND CLUSTERS ON STATE CHANGES
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => {
      map.removeLayer(marker);
    });
    markersRef.current = {};

    // Filter cafes by Category
    const filteredCafes = cafesWithCategories.filter(
      (c) => activeCategoryFilter === "all" || c.category === activeCategoryFilter
    );

    // DYNAMIC ZOOM-SENSITIVE NEIGHBORHOOD CLUSTERING
    // If zoomed out, cluster cafes by neighborhood average coordinate
    if (zoomLevel <= 13) {
      // Group by neighborhood
      const grouped: { [key: string]: typeof cafesWithCategories } = {};
      filteredCafes.forEach((cafe) => {
        if (!cafe.coordinates) return;
        if (!grouped[cafe.neighborhood]) {
          grouped[cafe.neighborhood] = [];
        }
        grouped[cafe.neighborhood].push(cafe);
      });

      // Spawn a single cluster marker per neighborhood
      Object.entries(grouped).forEach(([neighborhood, items]) => {
        if (items.length === 0) return;

        // Math Average Coordinates
        const totalCoords = items.reduce(
          (acc, item) => ({
            lat: acc.lat + (item.coordinates?.lat || 25.57),
            lng: acc.lng + (item.coordinates?.lng || 91.89),
          }),
          { lat: 0, lng: 0 }
        );
        const avgLat = totalCoords.lat / items.length;
        const avgLng = totalCoords.lng / items.length;

        // Custom HTML for the dynamic cluster-circle
        const clusterHtml = `
          <div class="relative group cursor-pointer flex flex-col items-center">
            <!-- Pulsing outer bloom ring -->
            <div class="absolute inset-x-0 inset-y-0 -m-3 bg-amber-800/20 active:bg-amber-800/35 rounded-full animate-ping pointer-events-none duration-1000"></div>
            <!-- Aggregation Circle Badge -->
            <div class="w-11 h-11 rounded-full bg-stone-900 border border-amber-500 shadow-xl flex flex-col items-center justify-center text-white scale-100 hover:scale-110 active:scale-95 transition-transform duration-200">
              <span class="text-xs font-mono font-bold text-amber-400">${items.length}</span>
              <span class="text-[7.5px] font-sans font-bold tracking-[0.2px] text-stone-300 uppercase leading-none -mt-0.5">Spots</span>
            </div>
            <!-- Tooltip Label -->
            <div class="absolute -bottom-8 whitespace-nowrap bg-stone-950/90 text-[9.5px] font-sans font-medium tracking-wide text-amber-250 px-2.5 py-1 rounded-md border border-stone-800 shadow-lg pointer-events-none scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all origin-top duration-250">
              ${neighborhood} Basin
            </div>
          </div>
        `;

        const clusterIcon = L.divIcon({
          html: clusterHtml,
          className: "custom-leaflet-cluster-icon",
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        const clusterMarker = L.marker([avgLat, avgLng], { icon: clusterIcon })
          .addTo(map)
          .on("click", () => {
            // Fly into neighborhood
            map.flyTo([avgLat, avgLng], 15, { animate: true, duration: 1.5 });
          });

        markersRef.current[`cluster-${neighborhood}`] = clusterMarker;
      });

    } else {
      // ZOOMED IN: Render individual elegant markers
      filteredCafes.forEach((cafe) => {
        if (!cafe.coordinates) return;

        const isSelected = selectedCafe?.id === cafe.id;
        const meta = categoryMeta[cafe.category];
        const isKhasiFocus = cafe.category === "khasi_cuisine";

        // Setup marker theme variables
        const glowColorHex = meta.colorHex;
        
        // Define Custom HTML layout for Leaflet markers using Tailwind!
        const markerHtml = `
          <div class="relative flex flex-col items-center filter drop-shadow-md select-none group">
            <!-- Animated selection halo ring -->
            ${
              isSelected 
                ? `<div class="absolute -inset-2 rounded-full border border-dashed border-amber-600 animate-spin-slow"></div>
                   <div class="absolute -inset-3.5 rounded-full bg-amber-805/10 animate-pulse bg-amber-800/10"></div>`
                : `<div class="absolute -inset-0.5 rounded-full bg-transparent group-hover:bg-amber-600/15 group-hover:scale-110 active:scale-95 duration-300 transition-all"></div>`
            }

            <!-- Glow Ring for Indigenous khasi food focused joints -->
            ${
              isKhasiFocus 
                ? `<div class="absolute inset-x-0 inset-y-0 -m-1.5 rounded-full border border-emerald-500/40 animate-pulse pointer-events-none"></div>`
                : ""
            }

            <!-- Principal Marker pin block -->
            <div 
              style="border-color: ${isSelected ? '#eab308' : '#78716c'}" 
              class="w-8 h-8 rounded-full ${cafe.category === 'premium' ? 'bg-stone-950 text-amber-400' : 'bg-white text-stone-800'} border flex items-center justify-center transition-all duration-300 shadow-md ${
                isSelected ? 'scale-115 rotate-3' : 'group-hover:scale-115 group-hover:-translate-y-1'
              }"
            >
              <!-- Category Circle -->
              <div 
                style="background-color: ${meta.colorHex}" 
                class="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 shadow-inner"
              >
                <!-- SVG Icon loader mapping -->
                ${
                  cafe.category === "cafe" ? '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12Z"/><path d="M17 14h2a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-2"/><path d="M6 22h8"/></svg>' :
                  cafe.category === "live_music" ? '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>' :
                  cafe.category === "khasi_cuisine" ? '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>' :
                  cafe.category === "rooftop" ? '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 19.07-1.41-1.41"/><path d="M12 20v2"/><path d="m4.93 19.07 1.41-1.41"/><path d="M2 12h2"/><path d="m4.93 4.93 1.41 1.41"/><circle cx="12" cy="12" r="4"/></svg>' :
                  cafe.category === "premium" ? '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7Z"/><path d="M5 20h14"/></svg>' :
                  cafe.category === "budget" ? '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12"/><path d="M6 8h12"/><path d="m6 13 8.5 8"/><path d="M6 13h3a4 4 0 0 0 0-8"/></svg>' :
                  '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>'
                }
              </div>
            </div>

            <!-- Small Rating Star overlay badge -->
            <div class="absolute -top-1.5 -right-1.5 bg-neutral-900 border border-stone-700/60 text-white rounded-full px-1.5 py-0.5 text-[7.5px] font-sans font-black flex items-center gap-0.5 leading-none shadow-sm shadow-black shrink-0">
              <span class="text-amber-400">★</span><span>${cafe.rating}</span>
            </div>

            <!-- Sleek human readable Name tooltip of the hover -->
            <div class="absolute -bottom-7 whitespace-nowrap opacity-0 scale-0 group-hover:scale-100 group-hover:opacity-100 ${
              isSelected ? 'opacity-100 scale-100 bottom-[-28px] font-extrabold border-amber-600 bg-stone-900 text-stone-100' : 'bg-[#FAF8F5]/95 text-stone-850 border-stone-300'
            } border text-[10px] font-sans font-semibold tracking-wide px-2 py-0.5 rounded-md shadow-lg pointer-events-none transition-all origin-top duration-200">
              ${cafe.name}
            </div>
          </div>
        `;

        const divIcon = L.divIcon({
          html: markerHtml,
          className: "custom-leaflet-marker-icon",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([cafe.coordinates.lat, cafe.coordinates.lng], { icon: divIcon })
          .addTo(map)
          .on("click", () => handleMarkerClick(cafe));

        markersRef.current[cafe.id] = marker;
      });
    }
  }, [cafes, activeCategoryFilter, selectedCafe, zoomLevel, mapTheme, reviews]);

  // Handle outside selections (flyTo mapping)
  useEffect(() => {
    if (!activeCafeId) return;
    const matchedCafe = cafesWithCategories.find((c) => c.id === activeCafeId);
    if (matchedCafe && matchedCafe.coordinates) {
      setTimeout(() => {
        setSelectedCafe(matchedCafe);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(
            [matchedCafe.coordinates.lat - 0.002, matchedCafe.coordinates.lng],
            16,
            { animate: true, duration: 1.5 }
          );
        }
      }, 100);
    }
  }, [activeCafeId]);


  // Direct ask chatbot action
  const triggerChatAsk = (cafe: Cafe) => {
    const customPrompt = `Tell me more details about "${cafe.name}" in ${cafe.neighborhood}, Shillong. What are its operating hours, what are the popular dishes we should order, and can you describe the exact interior and musical vibes?`;
    
    // Dispatch our Custom Event
    const event = new CustomEvent("ask-kong-labet", {
      detail: { prompt: customPrompt }
    });
    window.dispatchEvent(event);
  };

  return (
    <div id="interactive-map-panel" className="relative w-full rounded-3xl overflow-hidden border border-stone-200 bg-[#FAF8F5] shadow-sm flex flex-col h-[640px] md:h-[680px]">
      
      {/* Category Filter Pills and Dark Toggle header strip */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pointer-events-none">
        
        {/* Category Selector Hub */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-900/80 backdrop-blur-md rounded-xl border border-stone-850/30 max-w-full overflow-x-auto shadow-xl pointer-events-auto shrink-0 scrollbar-none">
          {Object.entries(categoryMeta).map(([catKey, val]) => {
            const Icon = val.icon;
            const isFilterActive = activeCategoryFilter === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setActiveCategoryFilter(catKey)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-sans font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer text-nowrap shrink-0  ${
                  isFilterActive
                    ? "bg-amber-800 text-stone-100 shadow-md"
                    : "text-stone-300 hover:text-white hover:bg-stone-800/80"
                }`}
              >
                <Icon className={`w-3 h-3 ${isFilterActive ? "text-amber-300" : "text-stone-400 group-hover:text-amber-400"}`} />
                <span>{val.label}</span>
              </button>
            );
          })}
        </div>

        {/* Theme and stats section controls */}
        <div className="flex items-center gap-2 pointer-events-auto self-end sm:self-auto shrink-0">
          
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-stone-905 bg-stone-900/85 backdrop-blur-md border border-stone-800 hover:bg-stone-950 text-amber-400 hover:text-white shadow-xl transition-all cursor-pointer flex items-center justify-center shrink-0 w-10 h-10"
            title="Toggle Map Style"
          >
            {mapTheme === "light" ? <Moon className="w-4.5 h-4.5 text-amber-400" /> : <Sun className="w-4.5 h-4.5 text-yellow-405 text-amber-300" />}
          </button>

          {/* District Zoom indicators */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-stone-900/80 backdrop-blur-md border border-stone-800 text-[10px] font-mono tracking-widest uppercase font-bold text-stone-300 rounded-xl shadow-xl shrink-0 h-10 leading-none">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span>Map Zoom: {zoomLevel} // {zoomLevel <= 13 ? "Clustered" : "Expanded"}</span>
          </div>

        </div>

      </div>

      {/* Leaflet container */}
      <div 
        ref={mapContainerRef} 
        style={{ background: mapTheme === "light" ? "#f4f1ea" : "#1e1b18" }}
        className="w-full h-full z-0 cursor-default"
      />

      {/* FLOATING DETAILED INFO CARD (GLASSMORPHISM RESPONSIVE) */}
      <AnimatePresence>
        {selectedCafe && (
          <motion.div
            initial={{ opacity: 0, x: -100, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className={`absolute z-10 bottom-6 left-6 right-6 sm:right-auto sm:w-[420px] bg-[#FAF8F5]/90 sm:bg-stone-950/80 backdrop-blur-xl sm:text-white rounded-2xl border border-stone-200/50 sm:border-stone-800/80 shadow-2xl p-5 flex flex-col gap-4 overflow-hidden max-h-[380px] sm:max-h-[500px] overflow-y-auto text-stone-850`}
          >
            {/* Close card coordinates */}
            <button
              onClick={() => setSelectedCafe(null)}
              className="absolute top-3.5 right-3.5 z-20 p-1.5 rounded-full bg-stone-150/40 sm:bg-stone-800/80 text-stone-700 sm:text-stone-300 hover:text-stone-900 sm:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Showcase Image with rating shield overlay */}
            <div className="relative h-40 sm:h-44 w-full rounded-xl overflow-hidden shrink-0 bg-stone-150 border border-stone-200/30">
              <img
                src={selectedCafe.images.card}
                alt={selectedCafe.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/25 to-transparent" />
              
              {/* Slogan details */}
              <div className="absolute bottom-3 left-4 right-4 text-left">
                <span className="text-[9px] uppercase font-mono tracking-widest text-amber-400 font-bold leading-none select-none">
                  {categoryMeta[getCafeCategory(selectedCafe)]?.label || "Landmark"}
                </span>
                <h4 className="font-display font-extrabold text-white text-md sm:text-lg leading-tight mt-0.5">
                  {selectedCafe.name}
                </h4>
              </div>

              {/* Rating badge shield */}
              <div className="absolute top-3 left-3 bg-neutral-900/90 backdrop-blur-sm border border-stone-700/60 rounded-lg px-2.5 py-1 text-white text-[11px] font-sans font-bold flex items-center gap-1 select-none">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <span>{selectedCafe.rating || getAvgRating(selectedCafe.id)}</span>
                {selectedCafe.user_ratings_total && (
                  <span className="text-[9px] text-stone-400 font-light font-mono">({selectedCafe.user_ratings_total})</span>
                )}
              </div>

              {/* Google Verified Shield Badge */}
              {selectedCafe.verification_status === "verified" && (
                <div className="absolute top-3 right-3 bg-emerald-950/90 backdrop-blur-sm border border-emerald-800/80 rounded-lg px-2 py-1 text-emerald-400 text-[9px] font-mono font-bold flex items-center gap-1 select-none shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Google Verified</span>
                </div>
              )}
            </div>

            {/* Information specifications */}
            <div className="space-y-3.5 text-left flex-1 text-stone-800 sm:text-stone-100">
              {/* Slogan block & Vibe Description */}
              <div className="space-y-1 bg-stone-100 sm:bg-stone-900/60 p-3.5 rounded-xl border border-stone-200/60 sm:border-stone-800/60">
                <p className="text-[10px] font-mono tracking-wider font-bold text-amber-805 text-amber-800 sm:text-amber-400 uppercase">
                  "{selectedCafe.tagline}"
                </p>
                <p className="text-xs text-stone-650 sm:text-stone-300 font-sans leading-normal mt-1.5 font-light">
                  {selectedCafe.introduction}
                </p>
              </div>

              {/* Verified Google Address Details Block */}
              {selectedCafe.formatted_address && (
                <div className="bg-stone-100 sm:bg-stone-905 p-3 rounded-xl border border-stone-200 sm:border-stone-850/40 text-[11px]">
                  <span className="text-[9px] font-mono uppercase text-stone-400 font-bold block">Verified Google Address</span>
                  <p className="text-stone-705 sm:text-stone-300 font-sans mt-0.5 leading-relaxed">
                    {selectedCafe.formatted_address}
                  </p>
                </div>
              )}

              {/* Grid with metadata details */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50 sm:bg-stone-900/30 p-3.5 rounded-xl border border-stone-200/40 sm:border-stone-850/40">
                
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono uppercase text-stone-400 font-bold block">Neighborhood</span>
                  <p className="font-sans font-semibold text-stone-800 sm:text-stone-250 sm:text-white flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-600" />
                    {selectedCafe.neighborhood}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono uppercase text-stone-400 font-bold block">Hours</span>
                  <p className="font-sans font-semibold text-stone-800 sm:text-stone-250 sm:text-white flex items-center gap-1 truncate" title={selectedCafe.hours}>
                    <Clock className="w-3 h-3 text-amber-600" />
                    {selectedCafe.hours}
                  </p>
                </div>

                <div className="space-y-0.5 md:col-span-1">
                  <span className="text-[9px] font-mono uppercase text-stone-400 font-bold block">Vibe Specialty</span>
                  <p className="font-sans font-semibold text-stone-800 sm:text-stone-250 sm:text-white truncate">
                    {selectedCafe.theme}
                  </p>
                </div>

                {selectedCafe.phone_number && selectedCafe.phone_number !== "+91 364 123 4567" ? (
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono uppercase text-stone-400 font-bold block">Phone</span>
                    <p className="font-sans font-semibold text-stone-800 sm:text-stone-250 sm:text-white flex items-center gap-1 truncate" title={selectedCafe.phone_number}>
                      <Phone className="w-3 h-3 text-amber-600 shrink-0" />
                      {selectedCafe.phone_number}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-0.5 md:col-span-1">
                    <span className="text-[9px] font-mono uppercase text-stone-400 font-bold block">Pricing Grade</span>
                    <p className="font-sans font-semibold text-amber-850 text-amber-800 sm:text-amber-400 tracking-wider">
                      {getCafeCategory(selectedCafe) === "premium" ? "₹₹₹ (Premium)" : "₹₹ (Moderate)"}
                    </p>
                  </div>
                )}

              </div>

              {/* Show indigenous Khasi signature products available if any */}
              {selectedCafe.mustTry && selectedCafe.mustTry.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono uppercase text-stone-400 font-bold tracking-wider block">
                    Must-Try Signature Plates
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {selectedCafe.mustTry.map((dish, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-stone-100 sm:bg-stone-900 border border-stone-200/50 sm:border-stone-850">
                        <div className="text-left">
                          <p className="text-xs font-sans font-bold text-stone-850 sm:text-white">{dish.name}</p>
                          <p className="text-[10px] text-stone-550 sm:text-stone-400 line-clamp-1">{dish.description}</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-805 text-amber-800 sm:text-amber-400 ml-2 shrink-0">{dish.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons: directions, Ask Chatbot, Website */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1 pb-1">
                
                {/* Directions Google Maps Link */}
                <a
                  href={selectedCafe.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedCafe.name}, ${selectedCafe.address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-amber-800 hover:bg-amber-900 text-white font-sans text-[11px] uppercase font-bold tracking-wider py-2.5 rounded-xl cursor-pointer shadow-md transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </a>

                {/* Ask Chatbot Button */}
                <button
                  onClick={() => triggerChatAsk(selectedCafe)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-stone-800 sm:bg-stone-905 hover:bg-stone-900 hover:text-white text-white sm:text-amber-400 border sm:border-stone-700 font-sans text-[11px] uppercase font-bold tracking-wider py-2.5 rounded-xl cursor-pointer shadow-md transition-colors select-none"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask Chatbot</span>
                </button>

                {/* Website Link */}
                <a
                  href={selectedCafe.website || `https://instagram.com/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-2.5 bg-stone-100 sm:bg-stone-900 hover:bg-stone-200 sm:hover:bg-stone-805 border border-stone-200 sm:border-stone-800 text-stone-700 sm:text-stone-300 hover:text-stone-950 sm:hover:text-white rounded-xl cursor-pointer transition-colors"
                  title="Official Website / Instagram Profile"
                >
                  <Globe className="w-3.5 h-3.5" />
                </a>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
