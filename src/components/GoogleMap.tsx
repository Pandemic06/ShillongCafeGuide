import React, { useEffect, useRef, useState, useCallback } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { motion, AnimatePresence } from "motion/react";
import {
  X, MapPin, Coffee, Flame, Music, Crown,
  Sparkles, Clock, Globe, Navigation, MessageSquare, Star,
  CheckCircle2, Phone, Route, Timer, Milestone,
} from "lucide-react";
import { Cafe, Review } from "../types";

interface GoogleMapProps {
  cafes: Cafe[];
  onSelectCafe: (cafe: Cafe) => void;
  activeCafeId?: string;
}

interface RouteInfo {
  distance: string;
  duration: string;
  steps: string[];
}

const SHILLONG_CENTER = { lat: 25.5788, lng: 91.892 };
const CATEGORY_COLORS: Record<string, string> = {
  cafe: "#b45309",
  restaurant: "#dc2626",
  khasi_cuisine: "#059669",
  rooftop: "#0891b2",
  live_music: "#c026d3",
  budget: "#d97706",
  premium: "#92400e",
  all: "#7c2d12",
};

function getCafeCategory(cafe: Cafe): string {
  if (cafe.hasLiveMusic) return "live_music";
  if (cafe.vibeTags?.some((t) => /traditional|khasi|indigenous/i.test(t)) || cafe.id === "rynsan-cafe") return "khasi_cuisine";
  if (cafe.vibeTags?.some((t) => /rooftop|view|deck/i.test(t)) || cafe.theme?.toLowerCase().includes("deck")) return "rooftop";
  if (cafe.vibeTags?.some((t) => /premium|luxury|chandelier/i.test(t))) return "premium";
  if (cafe.vibeTags?.some((t) => /budget|street/i.test(t))) return "budget";
  if (cafe.name.toLowerCase().includes("restaurant") || cafe.name.toLowerCase().includes("grill")) return "restaurant";
  return "cafe";
}

function markerSvg(color: string, selected: boolean): string {
  const size = selected ? 44 : 36;
  const ring = selected ? `<circle cx="22" cy="22" r="20" fill="none" stroke="#eab308" stroke-width="2" stroke-dasharray="4 2"/>` : "";
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
      ${ring}
      <circle cx="22" cy="22" r="16" fill="${color}" stroke="white" stroke-width="2.5"/>
      <circle cx="22" cy="22" r="6" fill="white" opacity="0.9"/>
    </svg>`;
}

export default function GoogleMap({ cafes, onSelectCafe, activeCafeId }: GoogleMapProps) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [mapReady, setMapReady] = useState(false);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [routeOriginCafe, setRouteOriginCafe] = useState<Cafe | null>(null);
  const [routeMode, setRouteMode] = useState<"user" | "cafe">("user");

  // Fetch reviews
  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => (r.ok ? r.json() : []))
      .then(setReviews)
      .catch(() => {});
  }, []);

  // Fetch Maps API key from server
  useEffect(() => {
    fetch("/api/config/maps-key")
      .then((r) => r.json())
      .then((d) => d.key && setApiKey(d.key))
      .catch(() => {});
  }, []);

  // Get user geolocation once
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const getAvgRating = (cafeId: string): string => {
    const cr = reviews.filter((r) => r.cafeId === cafeId);
    if (!cr.length) {
      const seed = (cafeId.charCodeAt(0) + cafeId.charCodeAt(cafeId.length - 1)) % 4;
      return (4.6 + seed * 0.1).toFixed(1);
    }
    return (cr.reduce((a, c) => a + c.rating, 0) / cr.length).toFixed(1);
  };

  // Load Google Maps
  useEffect(() => {
    if (!apiKey || mapRef.current) return;

    setOptions({ key: apiKey, v: "weekly" });

    Promise.all([
      importLibrary("maps"),
      importLibrary("places"),
      importLibrary("routes"),
      importLibrary("geometry"),
    ]).then(() => {
      if (!mapDivRef.current) return;
      const map = new google.maps.Map(mapDivRef.current, {
        center: SHILLONG_CENTER,
        zoom: 14,
        mapTypeId: "roadmap",
        styles: [
          { featureType: "poi.business", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER,
        },
      });

      const renderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: "#b45309",
          strokeWeight: 4,
          strokeOpacity: 0.85,
        },
      });

      directionsRendererRef.current = renderer;
      mapRef.current = map;
      setMapReady(true);
    });
  }, [apiKey]);

  // Place/update markers when map ready or cafes/filter changes
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const map = mapRef.current;
    const filtered = cafes.filter(
      (c) => activeCategoryFilter === "all" || getCafeCategory(c) === activeCategoryFilter
    );

    // Remove old markers not in filtered set
    markersRef.current.forEach((marker, id) => {
      if (!filtered.find((c) => c.id === id)) {
        marker.setMap(null);
        markersRef.current.delete(id);
      }
    });

    filtered.forEach((cafe) => {
      const coords = cafe.coordinates;
      if (!coords) return;
      const isSelected = selectedCafe?.id === cafe.id;
      const category = getCafeCategory(cafe);
      const color = CATEGORY_COLORS[category];

      const icon: google.maps.Icon = {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(markerSvg(color, isSelected)),
        scaledSize: new google.maps.Size(isSelected ? 44 : 36, isSelected ? 44 : 36),
        anchor: new google.maps.Point(isSelected ? 22 : 18, isSelected ? 22 : 18),
      };

      const existing = markersRef.current.get(cafe.id);
      if (existing) {
        existing.setIcon(icon);
        existing.setPosition(coords);
      } else {
        const marker = new google.maps.Marker({
          position: coords,
          map,
          icon,
          title: cafe.name,
          animation: google.maps.Animation.DROP,
        });

        const infoContent = `
          <div style="font-family:sans-serif;padding:4px 2px;min-width:140px">
            <strong style="font-size:13px">${cafe.name}</strong><br/>
            <span style="font-size:11px;color:#888">${cafe.neighborhood}</span><br/>
            <span style="font-size:12px;color:#b45309">★ ${getAvgRating(cafe.id)}</span>
          </div>`;
        const infoWindow = new google.maps.InfoWindow({ content: infoContent });

        marker.addListener("click", () => {
          setSelectedCafe(cafe);
          onSelectCafe(cafe);
          map.panTo({ lat: coords.lat - 0.002, lng: coords.lng });
          map.setZoom(16);
          infoWindow.open(map, marker);
        });

        markersRef.current.set(cafe.id, marker);
      }
    });
  }, [mapReady, cafes, activeCategoryFilter, selectedCafe]);

  // Handle external activeCafeId
  useEffect(() => {
    if (!activeCafeId || !mapReady || !mapRef.current) return;
    const cafe = cafes.find((c) => c.id === activeCafeId);
    if (!cafe?.coordinates) return;
    setSelectedCafe(cafe);
    mapRef.current.panTo({ lat: cafe.coordinates.lat - 0.002, lng: cafe.coordinates.lng });
    mapRef.current.setZoom(16);
  }, [activeCafeId, mapReady]);

  // Calculate route
  const calculateRoute = useCallback(
    async (destination: Cafe, originCafe?: Cafe) => {
      if (!mapReady || !destination.coordinates) return;
      const origin = originCafe?.coordinates || userLocation;
      if (!origin) {
        alert("Enable location access to get directions from your current position.");
        return;
      }

      setRouteLoading(true);
      setRoute(null);

      const service = new google.maps.DirectionsService();
      const request: google.maps.DirectionsRequest = {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.coordinates.lat, destination.coordinates.lng),
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
      };

      service.route(request, (result, status) => {
        setRouteLoading(false);
        if (status === "OK" && result) {
          directionsRendererRef.current?.setDirections(result);
          const leg = result.routes[0].legs[0];
          setRoute({
            distance: leg.distance?.text || "—",
            duration: leg.duration?.text || "—",
            steps: leg.steps.slice(0, 5).map((s) => s.instructions.replace(/<[^>]+>/g, "")),
          });
        } else {
          console.error("Directions failed:", status);
        }
      });
    },
    [mapReady, userLocation]
  );

  const clearRoute = () => {
    directionsRendererRef.current?.setDirections({ routes: [] } as any);
    setRoute(null);
    setRouteOriginCafe(null);
  };

  const triggerChatAsk = (cafe: Cafe) => {
    const prompt = `Tell me more about "${cafe.name}" in ${cafe.neighborhood}, Shillong — hours, popular dishes, and vibe.`;
    window.dispatchEvent(new CustomEvent("ask-kong-labet", { detail: { prompt } }));
  };

  const categoryMeta: Record<string, { label: string; icon: any }> = {
    all: { label: "All", icon: MapPin },
    cafe: { label: "Cafés", icon: Coffee },
    khasi_cuisine: { label: "Khasi", icon: Flame },
    live_music: { label: "Live Music", icon: Music },
    rooftop: { label: "Rooftop", icon: Sparkles },
    premium: { label: "Fine Dining", icon: Crown },
    budget: { label: "Local Eats", icon: MapPin },
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-stone-200 bg-[#FAF8F5] shadow-sm flex flex-col h-[640px] md:h-[680px]">

      {/* Category filters */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-3 pointer-events-none">
        <div className="flex flex-wrap gap-1.5 p-1 bg-stone-900/85 backdrop-blur-md rounded-xl border border-stone-800 shadow-xl pointer-events-auto overflow-x-auto scrollbar-none max-w-full">
          {Object.entries(categoryMeta).map(([key, meta]) => {
            const Icon = meta.icon;
            const active = activeCategoryFilter === key;
            return (
              <button
                key={key}
                onClick={() => setActiveCategoryFilter(key)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  active ? "bg-amber-800 text-stone-100" : "text-stone-300 hover:text-white hover:bg-stone-800"
                }`}
              >
                <Icon className="w-3 h-3" />
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map container */}
      {!apiKey && (
        <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-500 text-sm">
          Maps API key not configured. Add <code className="mx-1 font-mono bg-stone-200 px-1 rounded">GOOGLE_MAPS_PLATFORM_KEY</code> to .env and restart.
        </div>
      )}
      <div ref={mapDivRef} className="w-full h-full z-0" style={{ display: apiKey ? "block" : "none" }} />

      {/* Route info bar */}
      <AnimatePresence>
        {route && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-stone-950/90 backdrop-blur-xl border border-stone-800 rounded-2xl px-5 py-3 flex items-center gap-4 shadow-2xl text-white"
          >
            <div className="flex items-center gap-1.5 text-amber-400">
              <Milestone className="w-4 h-4" />
              <span className="text-sm font-bold">{route.distance}</span>
            </div>
            <div className="w-px h-6 bg-stone-700" />
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Timer className="w-4 h-4" />
              <span className="text-sm font-bold">{route.duration}</span>
            </div>
            <div className="w-px h-6 bg-stone-700" />
            <span className="text-[11px] text-stone-400 max-w-[160px] truncate">
              {route.steps[0]}
            </span>
            <button onClick={clearRoute} className="ml-2 text-stone-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected cafe info card */}
      <AnimatePresence>
        {selectedCafe && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            className="absolute z-10 bottom-6 left-6 right-6 sm:right-auto sm:w-[420px] bg-stone-950/85 backdrop-blur-xl text-white rounded-2xl border border-stone-800 shadow-2xl p-5 flex flex-col gap-4 max-h-[500px] overflow-y-auto"
          >
            <button
              onClick={() => { setSelectedCafe(null); clearRoute(); }}
              className="absolute top-3.5 right-3.5 z-20 p-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Hero image */}
            <div className="relative h-40 sm:h-44 w-full rounded-xl overflow-hidden shrink-0">
              <img
                src={selectedCafe.images.card}
                alt={selectedCafe.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/20 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <p className="text-[9px] uppercase font-mono tracking-widest text-amber-400 font-bold">
                  {categoryMeta[getCafeCategory(selectedCafe)]?.label || "Cafe"}
                </p>
                <h4 className="font-bold text-white text-lg leading-tight mt-0.5">{selectedCafe.name}</h4>
              </div>
              <div className="absolute top-3 left-3 bg-neutral-900/90 backdrop-blur-sm border border-stone-700 rounded-lg px-2.5 py-1 text-white text-[11px] font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{selectedCafe.rating || getAvgRating(selectedCafe.id)}</span>
                {selectedCafe.user_ratings_total && (
                  <span className="text-[9px] text-stone-400 font-normal">({selectedCafe.user_ratings_total})</span>
                )}
              </div>
              {selectedCafe.verification_status === "verified" && (
                <div className="absolute top-3 right-3 bg-emerald-950/90 border border-emerald-800 rounded-lg px-2 py-1 text-emerald-400 text-[9px] font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Google Verified</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-3 text-stone-200">
              <p className="text-xs text-stone-300 leading-relaxed">{selectedCafe.introduction}</p>

              <div className="grid grid-cols-2 gap-2 text-xs bg-stone-900/40 p-3 rounded-xl border border-stone-800">
                <div>
                  <span className="text-[9px] font-mono uppercase text-stone-400 font-bold block mb-0.5">Hours</span>
                  <p className="flex items-center gap-1 font-semibold truncate">
                    <Clock className="w-3 h-3 text-amber-600 shrink-0" />{selectedCafe.hours}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] font-mono uppercase text-stone-400 font-bold block mb-0.5">Neighborhood</span>
                  <p className="flex items-center gap-1 font-semibold">
                    <MapPin className="w-3 h-3 text-amber-600" />{selectedCafe.neighborhood}
                  </p>
                </div>
                {selectedCafe.phone_number && (
                  <div>
                    <span className="text-[9px] font-mono uppercase text-stone-400 font-bold block mb-0.5">Phone</span>
                    <p className="flex items-center gap-1 font-semibold truncate">
                      <Phone className="w-3 h-3 text-amber-600 shrink-0" />{selectedCafe.phone_number}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-[9px] font-mono uppercase text-stone-400 font-bold block mb-0.5">Price</span>
                  <p className="font-semibold text-amber-400">
                    {(selectedCafe as any).price_display || (getCafeCategory(selectedCafe) === "premium" ? "₹₹₹" : "₹₹")}
                  </p>
                </div>
              </div>

              {/* Must try */}
              {selectedCafe.mustTry?.length > 0 && (
                <div>
                  <span className="text-[9px] font-mono uppercase text-stone-400 font-bold tracking-wider block mb-1.5">Must Try</span>
                  <div className="flex flex-col gap-1.5">
                    {selectedCafe.mustTry.map((dish, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-stone-900 border border-stone-800">
                        <div>
                          <p className="text-xs font-bold text-white">{dish.name}</p>
                          <p className="text-[10px] text-stone-400 line-clamp-1">{dish.description}</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-400 ml-2 shrink-0">{dish.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Route section */}
              <div className="space-y-2 pt-1">
                <span className="text-[9px] font-mono uppercase text-stone-400 font-bold tracking-wider block">Get Route</span>

                {/* Route mode toggle */}
                <div className="flex gap-2 text-[10px]">
                  <button
                    onClick={() => setRouteMode("user")}
                    className={`flex-1 py-1.5 rounded-lg font-bold uppercase tracking-wider border transition-all ${
                      routeMode === "user" ? "bg-amber-800 border-amber-700 text-white" : "border-stone-700 text-stone-400 hover:border-stone-600"
                    }`}
                  >
                    From My Location
                  </button>
                  <button
                    onClick={() => setRouteMode("cafe")}
                    className={`flex-1 py-1.5 rounded-lg font-bold uppercase tracking-wider border transition-all ${
                      routeMode === "cafe" ? "bg-amber-800 border-amber-700 text-white" : "border-stone-700 text-stone-400 hover:border-stone-600"
                    }`}
                  >
                    Between Cafes
                  </button>
                </div>

                {routeMode === "cafe" && (
                  <select
                    className="w-full bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded-lg px-3 py-2"
                    value={routeOriginCafe?.id || ""}
                    onChange={(e) => {
                      const c = cafes.find((x) => x.id === e.target.value) || null;
                      setRouteOriginCafe(c);
                    }}
                  >
                    <option value="">Select starting cafe…</option>
                    {cafes.filter((c) => c.id !== selectedCafe.id && c.coordinates).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}

                <button
                  onClick={() => calculateRoute(selectedCafe, routeMode === "cafe" ? (routeOriginCafe || undefined) : undefined)}
                  disabled={routeLoading || (routeMode === "cafe" && !routeOriginCafe)}
                  className="w-full flex items-center justify-center gap-2 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[11px] uppercase tracking-wider py-2.5 rounded-xl transition-colors shadow-md"
                >
                  <Route className="w-3.5 h-3.5" />
                  {routeLoading ? "Calculating…" : "Show Route & Distance"}
                </button>

                {route && (
                  <div className="bg-emerald-950/40 border border-emerald-900/60 rounded-xl p-3 text-xs space-y-1">
                    <div className="flex gap-4">
                      <span className="text-emerald-400 font-bold flex items-center gap-1"><Milestone className="w-3 h-3" />{route.distance}</span>
                      <span className="text-amber-400 font-bold flex items-center gap-1"><Timer className="w-3 h-3" />{route.duration}</span>
                    </div>
                    <div className="text-stone-400 space-y-0.5 mt-1">
                      {route.steps.slice(0, 3).map((s, i) => (
                        <p key={i} className="line-clamp-1">{i + 1}. {s}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <a
                  href={selectedCafe.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedCafe.name + " " + selectedCafe.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-amber-800 hover:bg-amber-900 text-white font-bold text-[11px] uppercase tracking-wider py-2.5 rounded-xl transition-colors shadow-md"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Google Maps
                </a>
                <button
                  onClick={() => triggerChatAsk(selectedCafe)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-amber-400 font-bold text-[11px] uppercase tracking-wider py-2.5 rounded-xl transition-colors shadow-md"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Ask Guide
                </button>
                {selectedCafe.website && (
                  <a
                    href={selectedCafe.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white rounded-xl transition-colors"
                    title="Website"
                  >
                    <Globe className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
