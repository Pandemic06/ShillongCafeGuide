import React, { useEffect, useRef, useState, useCallback } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { motion, AnimatePresence } from "motion/react";
import {
  X, MapPin, Navigation, Plus, Trash2, Route,
  Timer, Milestone, ChevronDown, ChevronUp,
  GripVertical, Mountain, Waves, Compass, Sparkles,
  Utensils, ShoppingBag, TreePine, Building2, Coffee,
  Info, ExternalLink, Clock, Star, ArrowRight, Filter,
  AlertCircle, Loader2
} from "lucide-react";
import {
  MEGHALAYA_DESTINATIONS, DESTINATION_CATEGORIES, TYPE_COLORS,
  type Destination, type DestinationType
} from "../data/meghalaya-destinations";
import { type Cafe } from "../types";

interface Props {
  cafes: Cafe[];
}

interface ItineraryStop {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number };
  type: DestinationType | "cafe";
  region: string;
}

interface RouteMetrics {
  totalDistance: string;
  totalDuration: string;
  legs: { distance: string; duration: string }[];
}

// ── Marker SVG helpers ───────────────────────────────────────────────────────
function markerSvg(color: string, selected: boolean, emoji: string) {
  const size = selected ? 52 : 40;
  const ring = selected
    ? `<circle cx="26" cy="26" r="24" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-dasharray="5 3"/>`
    : "";
  return `<svg width="${size}" height="${size}" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
    ${ring}
    <circle cx="26" cy="26" r="20" fill="${color}" stroke="white" stroke-width="2.5"/>
    <text x="26" y="33" font-size="16" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  </svg>`;
}

function itineraryMarkerSvg(index: number) {
  return `<svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="22" r="18" fill="#b45309" stroke="white" stroke-width="3"/>
    <text x="22" y="27" font-size="14" font-weight="bold" text-anchor="middle" fill="white">${index + 1}</text>
  </svg>`;
}

const TYPE_EMOJI: Record<string, string> = {
  cafe: "☕", waterfall: "💧", scenic: "⛰️", adventure: "🧗",
  cultural: "🏛️", hidden_gem: "💎", market: "🛍️", restaurant: "🍽️", stay: "🏨",
};

const CATEGORY_ICONS: Record<string, any> = {
  all: Compass, cafe: Coffee, waterfall: Waves, scenic: Mountain,
  adventure: TreePine, cultural: Building2, hidden_gem: Sparkles,
  market: ShoppingBag, restaurant: Utensils,
};

const MEGHALAYA_CENTER = { lat: 25.467, lng: 91.966 };

// Travel guidelines content
const TRAVEL_GUIDELINES = [
  {
    title: "Plan Ahead",
    icon: "🗓️",
    content: "Meghalaya's best destinations require permits (Shillong Peak) and advance bookings during peak season (Oct–Mar). The Double Decker Bridge trek needs an early start — 6 AM minimum. Book homestays in Mawlynnong and Dawki weeks ahead.",
  },
  {
    title: "Connectivity & Access",
    icon: "📡",
    content: "Mobile networks are patchy beyond Shillong. Download offline maps before heading to Cherrapunji, Dawki, or Jowai. BSNL works best in remote areas. Keep 30% phone battery for emergency navigation.",
  },
  {
    title: "Best Time to Explore",
    icon: "🌤️",
    content: "October to April is ideal — clear skies, cool air, and all roads passable. July–September brings monsoon magic (waterfalls in full roar) but roads can wash out. June is avoided by most — it is the wettest month on Earth here.",
  },
  {
    title: "Local Etiquette",
    icon: "🙏",
    content: "Meghalaya is a matrilineal society. Respect is shown by asking before photographing locals, removing shoes at sacred sites, and participating in offered food. The sacred forests (Mawphlang) forbid removing even a leaf — honor this absolutely.",
  },
  {
    title: "Weather Preparedness",
    icon: "🌧️",
    content: "Even in dry season, carry a light rain jacket — Cherrapunji and Mawsynram are among the wettest places on Earth. Morning fog makes driving hazardous before 8 AM. Layers are essential for Shillong's evenings year-round.",
  },
  {
    title: "Responsible Travel",
    icon: "♻️",
    content: "Carry out all waste — especially from Dawki and Mawlynnong. Support local homestays over chain hotels. Buy directly from Khasi artisans at markets. The ecosystem is extraordinarily fragile; tread with intention.",
  },
];

export default function DiscoverMeghalaya({ cafes }: Props) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const destMarkersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const itineraryMarkersRef = useRef<google.maps.Marker[]>([]);
  const directionsRenderersRef = useRef<google.maps.DirectionsRenderer[]>([]);

  const [apiKey, setApiKey] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [itinerary, setItinerary] = useState<ItineraryStop[]>([]);
  const [itineraryOpen, setItineraryOpen] = useState(false);
  const [metrics, setMetrics] = useState<RouteMetrics | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [openGuideline, setOpenGuideline] = useState<number | null>(null);
  const [filterOpen, setFilterOpen] = useState(true);

  // Fetch API key
  useEffect(() => {
    fetch("/api/config/maps-key")
      .then((r) => r.json())
      .then((d) => d.key && setApiKey(d.key))
      .catch(() => {});
  }, []);

  // Init map
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
        center: MEGHALAYA_CENTER,
        zoom: 9,
        mapTypeId: "roadmap",
        styles: [
          { featureType: "poi.business", stylers: [{ visibility: "off" }] },
          { featureType: "transit", stylers: [{ visibility: "off" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#a8d5f5" }] },
          { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#dcedc8" }] },
          { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#f5c842" }] },
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER,
        },
        gestureHandling: "greedy",
      });
      mapRef.current = map;
      setMapReady(true);
    });
  }, [apiKey]);

  // Place destination markers
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    // Filter destinations
    const filtered =
      activeCategory === "all"
        ? MEGHALAYA_DESTINATIONS
        : MEGHALAYA_DESTINATIONS.filter((d) => d.type === activeCategory);

    // Also add cafes if category is "cafe" or "all"
    const showCafes = activeCategory === "all" || activeCategory === "cafe";

    // Remove old markers not in filtered
    destMarkersRef.current.forEach((marker, id) => {
      const stillVisible = filtered.find((d) => d.id === id) || (showCafes && cafes.find((c) => c.id === id));
      if (!stillVisible) {
        marker.setMap(null);
        destMarkersRef.current.delete(id);
      }
    });

    // Add destination markers
    filtered.forEach((dest) => {
      const isSelected = selectedDest?.id === dest.id;
      const color = TYPE_COLORS[dest.type];
      const emoji = TYPE_EMOJI[dest.type] || "📍";
      const existing = destMarkersRef.current.get(dest.id);

      const icon: google.maps.Icon = {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(markerSvg(color, isSelected, emoji)),
        scaledSize: new google.maps.Size(isSelected ? 52 : 40, isSelected ? 52 : 40),
        anchor: new google.maps.Point(isSelected ? 26 : 20, isSelected ? 26 : 20),
      };

      if (existing) {
        existing.setIcon(icon);
      } else {
        const marker = new google.maps.Marker({
          position: dest.coordinates,
          map,
          icon,
          title: dest.name,
          animation: google.maps.Animation.DROP,
        });
        marker.addListener("click", () => {
          setSelectedDest(dest);
          map.panTo({ lat: dest.coordinates.lat - 0.15, lng: dest.coordinates.lng });
          if (map.getZoom()! < 11) map.setZoom(11);
        });
        destMarkersRef.current.set(dest.id, marker);
      }
    });

    // Add cafe markers if applicable
    if (showCafes) {
      cafes.forEach((cafe) => {
        if (!cafe.coordinates) return;
        const isSelected = false;
        const existing = destMarkersRef.current.get(cafe.id);
        const color = TYPE_COLORS["cafe"];
        const icon: google.maps.Icon = {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(markerSvg(color, isSelected, "☕")),
          scaledSize: new google.maps.Size(36, 36),
          anchor: new google.maps.Point(18, 18),
        };
        if (!existing) {
          const marker = new google.maps.Marker({
            position: cafe.coordinates,
            map,
            icon,
            title: cafe.name,
          });
          marker.addListener("click", () => {
            const dest: Destination = {
              id: cafe.id,
              name: cafe.name,
              type: "cafe",
              region: cafe.neighborhood,
              coordinates: cafe.coordinates!,
              description: cafe.introduction || cafe.tagline || "",
              tagline: cafe.tagline || "",
              highlights: cafe.vibeTags?.slice(0, 4) || [],
              bestTime: "Year round",
              duration: "1–2 hours",
            };
            setSelectedDest(dest);
            map.panTo({ lat: cafe.coordinates!.lat - 0.002, lng: cafe.coordinates!.lng });
            map.setZoom(15);
          });
          destMarkersRef.current.set(cafe.id, marker);
        }
      });
    }
  }, [mapReady, activeCategory, selectedDest, cafes]);

  // Redraw itinerary markers + routes
  const redrawItinerary = useCallback(async () => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;

    // Clear old itinerary markers
    itineraryMarkersRef.current.forEach((m) => m.setMap(null));
    itineraryMarkersRef.current = [];

    // Clear old renderers
    directionsRenderersRef.current.forEach((r) => r.setMap(null));
    directionsRenderersRef.current = [];

    if (itinerary.length === 0) {
      setMetrics(null);
      return;
    }

    // Place numbered markers
    itinerary.forEach((stop, i) => {
      const marker = new google.maps.Marker({
        position: stop.coordinates,
        map,
        icon: {
          url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(itineraryMarkerSvg(i)),
          scaledSize: new google.maps.Size(44, 44),
          anchor: new google.maps.Point(22, 22),
        },
        title: `${i + 1}. ${stop.name}`,
        zIndex: 100,
      });
      itineraryMarkersRef.current.push(marker);
    });

    if (itinerary.length < 2) {
      setMetrics(null);
      return;
    }

    // Calculate routes between consecutive stops
    setRouteLoading(true);
    setMetrics(null);

    const service = new google.maps.DirectionsService();
    const allLegs: { distance: string; duration: string }[] = [];
    let totalDistM = 0;
    let totalDurS = 0;

    const colors = ["#b45309", "#059669", "#0369a1", "#7c3aed", "#be123c"];

    for (let i = 0; i < itinerary.length - 1; i++) {
      const origin = itinerary[i].coordinates;
      const dest = itinerary[i + 1].coordinates;

      await new Promise<void>((resolve) => {
        service.route(
          {
            origin: new google.maps.LatLng(origin.lat, origin.lng),
            destination: new google.maps.LatLng(dest.lat, dest.lng),
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === "OK" && result) {
              const renderer = new google.maps.DirectionsRenderer({
                map,
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: colors[i % colors.length],
                  strokeWeight: 5,
                  strokeOpacity: 0.85,
                },
              });
              renderer.setDirections(result);
              directionsRenderersRef.current.push(renderer);

              const leg = result.routes[0].legs[0];
              totalDistM += leg.distance?.value || 0;
              totalDurS += leg.duration?.value || 0;
              allLegs.push({
                distance: leg.distance?.text || "—",
                duration: leg.duration?.text || "—",
              });
            } else {
              allLegs.push({ distance: "—", duration: "—" });
            }
            resolve();
          }
        );
      });
    }

    setRouteLoading(false);
    setMetrics({
      totalDistance: totalDistM > 0 ? `${(totalDistM / 1000).toFixed(1)} km` : "—",
      totalDuration: totalDurS > 0
        ? `${Math.floor(totalDurS / 3600)}h ${Math.round((totalDurS % 3600) / 60)}m`
        : "—",
      legs: allLegs,
    });

    // Fit bounds
    const bounds = new google.maps.LatLngBounds();
    itinerary.forEach((s) => bounds.extend(s.coordinates));
    map.fitBounds(bounds, { top: 60, right: 60, bottom: 100, left: 60 });
  }, [mapReady, itinerary]);

  useEffect(() => {
    redrawItinerary();
  }, [redrawItinerary]);

  const addToItinerary = (dest: Destination) => {
    if (itinerary.find((s) => s.id === dest.id)) return;
    setItinerary((prev) => [
      ...prev,
      {
        id: dest.id,
        name: dest.name,
        coordinates: dest.coordinates,
        type: dest.type,
        region: dest.region,
      },
    ]);
    setItineraryOpen(true);
  };

  const removeFromItinerary = (id: string) => {
    setItinerary((prev) => prev.filter((s) => s.id !== id));
  };

  const moveStop = (index: number, direction: "up" | "down") => {
    setItinerary((prev) => {
      const next = [...prev];
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= next.length) return prev;
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return next;
    });
  };

  const clearItinerary = () => {
    setItinerary([]);
    setMetrics(null);
    setItineraryOpen(false);
  };

  const inItinerary = (id: string) => itinerary.some((s) => s.id === id);

  return (
    <div className="space-y-0 w-full max-w-screen-2xl mx-auto">
      {/* ── Section Header ─────────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-8 pb-6 pt-2 space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          Immersive Discovery Platform
        </span>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-display font-medium text-stone-900">
              Discover Meghalaya
            </h2>
            <p className="text-xs text-stone-500 max-w-xl font-sans font-light">
              Explore waterfalls, hidden gems, scenic viewpoints, and the finest cafés across the Scotland of the East. Plan real road trip itineraries and navigate with live routes.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setGuidelinesOpen(!guidelinesOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono tracking-wider font-semibold uppercase border border-stone-200 hover:border-amber-700 bg-white hover:bg-amber-50 text-stone-600 hover:text-amber-800 transition-all"
            >
              <Info className="w-3.5 h-3.5" />
              Travel Guidelines
              {guidelinesOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Travel Guidelines Accordion ────────────────────── */}
      <AnimatePresence>
        {guidelinesOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden px-4 sm:px-6 lg:px-8 pb-6"
          >
            <div className="bg-[#FAF8F5] border border-stone-200 rounded-2xl divide-y divide-stone-100 overflow-hidden shadow-xs">
              {TRAVEL_GUIDELINES.map((g, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenGuideline(openGuideline === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-stone-50 transition-colors"
                  >
                    <span className="flex items-center gap-2.5 text-sm font-sans font-semibold text-stone-800">
                      <span className="text-base">{g.icon}</span>
                      {g.title}
                    </span>
                    {openGuideline === i ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                  </button>
                  <AnimatePresence>
                    {openGuideline === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-4 text-xs text-stone-500 font-sans leading-relaxed pt-0.5">
                          {g.content}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Immersive Map Container ─────────────────────────── */}
      <div className="relative w-full" style={{ height: "calc(100vh - 130px)", minHeight: 560, maxHeight: 900 }}>

        {/* Map Canvas */}
        {!apiKey ? (
          <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-500 text-sm">
            <div className="text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-stone-300 mx-auto" />
              <p>Maps API key not configured.</p>
            </div>
          </div>
        ) : (
          <div ref={mapDivRef} className="w-full h-full" />
        )}

        {/* ── Floating Category Filters ──────────────────── */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-start justify-between gap-3 pointer-events-none">

          {/* Filter chip strip */}
          <AnimatePresence>
            {filterOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="pointer-events-auto flex flex-wrap gap-1.5 p-1.5 bg-stone-950/80 backdrop-blur-xl rounded-2xl border border-stone-800/60 shadow-2xl max-w-full overflow-x-auto"
              >
                {DESTINATION_CATEGORIES.map(({ key, label, emoji }) => {
                  const active = activeCategory === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveCategory(key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                        active
                          ? "bg-amber-800 text-white shadow-md"
                          : "text-stone-300 hover:text-white hover:bg-stone-800"
                      }`}
                    >
                      <span>{emoji}</span>
                      {label}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle filter + Itinerary button */}
          <div className="pointer-events-auto flex flex-col gap-2 shrink-0">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-950/80 backdrop-blur-xl border border-stone-700 rounded-xl text-[10px] font-bold uppercase tracking-wider text-stone-300 hover:text-white transition-all shadow-xl"
            >
              <Filter className="w-3.5 h-3.5" />
              {filterOpen ? "Hide" : "Filter"}
            </button>

            <button
              onClick={() => setItineraryOpen(!itineraryOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 backdrop-blur-xl border rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all shadow-xl ${
                itinerary.length > 0
                  ? "bg-amber-800/90 border-amber-700 text-white"
                  : "bg-stone-950/80 border-stone-700 text-stone-300 hover:text-white"
              }`}
            >
              <Route className="w-3.5 h-3.5" />
              Plan Route
              {itinerary.length > 0 && (
                <span className="bg-white text-amber-800 rounded-full w-4 h-4 flex items-center justify-center font-mono text-[9px]">
                  {itinerary.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Itinerary Builder Panel ────────────────────── */}
        <AnimatePresence>
          {itineraryOpen && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 120 }}
              className="absolute top-4 right-4 bottom-4 z-20 w-[320px] max-w-[calc(100vw-2rem)] flex flex-col gap-3 pointer-events-auto"
            >
              {/* Panel header */}
              <div className="bg-stone-950/85 backdrop-blur-2xl border border-stone-800 rounded-2xl p-4 flex items-center justify-between shadow-2xl">
                <div>
                  <h3 className="text-white font-bold text-sm flex items-center gap-2">
                    <Route className="w-4 h-4 text-amber-400" />
                    Road Trip Planner
                  </h3>
                  <p className="text-stone-400 text-[10px] font-mono mt-0.5">
                    {itinerary.length === 0 ? "Click map destinations to add stops" : `${itinerary.length} stop${itinerary.length > 1 ? "s" : ""} planned`}
                  </p>
                </div>
                <button
                  onClick={() => setItineraryOpen(false)}
                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Route metrics */}
              <AnimatePresence>
                {(metrics || routeLoading) && itinerary.length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-stone-950/85 backdrop-blur-2xl border border-stone-800 rounded-2xl p-4 shadow-2xl"
                  >
                    {routeLoading ? (
                      <div className="flex items-center gap-2 text-stone-400 text-xs">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        Calculating real road routes…
                      </div>
                    ) : metrics ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                          <Milestone className="w-3 h-3" />
                          Route Metrics
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-stone-900 rounded-xl p-3 text-center">
                            <p className="text-[9px] font-mono text-stone-400 uppercase tracking-wider mb-1">Total Distance</p>
                            <p className="text-amber-400 font-bold text-lg font-mono">{metrics.totalDistance}</p>
                          </div>
                          <div className="bg-stone-900 rounded-xl p-3 text-center">
                            <p className="text-[9px] font-mono text-stone-400 uppercase tracking-wider mb-1">Drive Time</p>
                            <p className="text-emerald-400 font-bold text-lg font-mono">{metrics.totalDuration}</p>
                          </div>
                        </div>
                        {metrics.legs.length > 1 && (
                          <div className="space-y-1.5">
                            {metrics.legs.map((leg, i) => (
                              <div key={i} className="flex items-center justify-between text-[10px] text-stone-400 bg-stone-900/60 rounded-lg px-3 py-1.5">
                                <span className="text-stone-300 font-semibold truncate max-w-[120px]">
                                  {itinerary[i]?.name?.split(" ").slice(0, 2).join(" ")} → {itinerary[i + 1]?.name?.split(" ").slice(0, 2).join(" ")}
                                </span>
                                <span className="font-mono text-amber-400/80 shrink-0 ml-2">{leg.distance} · {leg.duration}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stops list */}
              <div className="bg-stone-950/85 backdrop-blur-2xl border border-stone-800 rounded-2xl shadow-2xl flex-1 overflow-hidden flex flex-col">
                {itinerary.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-stone-600" />
                    </div>
                    <p className="text-stone-400 text-xs font-sans leading-relaxed">
                      Click any destination on the map, then tap <strong className="text-amber-400">Add to Route</strong> to build your road trip.
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
                    {itinerary.map((stop, i) => (
                      <motion.div
                        key={stop.id}
                        layout
                        className="flex items-center gap-2 bg-stone-900/60 border border-stone-800 rounded-xl p-2.5"
                      >
                        <div className="w-6 h-6 rounded-full bg-amber-800 flex items-center justify-center shrink-0">
                          <span className="text-white text-[10px] font-bold">{i + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold truncate">{stop.name}</p>
                          <p className="text-stone-400 text-[9px] font-mono truncate">{stop.region}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => moveStop(i, "up")}
                            disabled={i === 0}
                            className="p-1 rounded text-stone-500 hover:text-stone-200 disabled:opacity-30 transition-colors"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => moveStop(i, "down")}
                            disabled={i === itinerary.length - 1}
                            className="p-1 rounded text-stone-500 hover:text-stone-200 disabled:opacity-30 transition-colors"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeFromItinerary(stop.id)}
                            className="p-1 rounded text-stone-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                {itinerary.length > 0 && (
                  <div className="p-3 border-t border-stone-800">
                    <button
                      onClick={clearItinerary}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-stone-500 hover:text-red-400 hover:bg-stone-900 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear All Stops
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Destination Info Card ──────────────────────── */}
        <AnimatePresence>
          {selectedDest && (
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 80 }}
              transition={{ type: "spring", damping: 28, stiffness: 130 }}
              className={`absolute z-20 bottom-4 left-4 pointer-events-auto ${itineraryOpen ? "right-[344px]" : "right-4 sm:right-auto sm:w-[400px]"}`}
            >
              <div className="bg-stone-950/90 backdrop-blur-2xl text-white rounded-2xl border border-stone-800 shadow-2xl overflow-hidden">
                {/* Hero image */}
                {selectedDest.image && (
                  <div className="relative h-36 w-full overflow-hidden">
                    <img
                      src={selectedDest.image}
                      alt={selectedDest.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-12">
                      <p className="text-[9px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                        {TYPE_EMOJI[selectedDest.type]} {selectedDest.region}
                      </p>
                      <h4 className="font-bold text-white text-base leading-tight mt-0.5">{selectedDest.name}</h4>
                    </div>
                    <button
                      onClick={() => setSelectedDest(null)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-stone-900/80 backdrop-blur-sm hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="p-4 space-y-3">
                  {!selectedDest.image && (
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[9px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                          {TYPE_EMOJI[selectedDest.type]} {selectedDest.region}
                        </p>
                        <h4 className="font-bold text-white text-base leading-tight mt-0.5">{selectedDest.name}</h4>
                      </div>
                      <button onClick={() => setSelectedDest(null)} className="p-1.5 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-stone-300 leading-relaxed line-clamp-3">{selectedDest.description}</p>

                  {/* Highlights */}
                  {selectedDest.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedDest.highlights.map((h) => (
                        <span key={h} className="text-[9px] font-mono bg-stone-800 text-stone-300 px-2 py-0.5 rounded-md">
                          {h}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta row */}
                  <div className="flex items-center gap-3 text-[10px] text-stone-400">
                    {selectedDest.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{selectedDest.duration}
                      </span>
                    )}
                    {selectedDest.bestTime && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500" />{selectedDest.bestTime}
                      </span>
                    )}
                    {selectedDest.entryFee && (
                      <span className="text-amber-400 font-bold">{selectedDest.entryFee}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => addToItinerary(selectedDest)}
                      disabled={inItinerary(selectedDest.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                        inItinerary(selectedDest.id)
                          ? "bg-emerald-900/60 border border-emerald-800 text-emerald-400 cursor-default"
                          : "bg-amber-800 hover:bg-amber-900 text-white shadow-md"
                      }`}
                    >
                      {inItinerary(selectedDest.id) ? (
                        <><Star className="w-3.5 h-3.5 fill-emerald-400" />Added to Route</>
                      ) : (
                        <><Plus className="w-3.5 h-3.5" />Add to Route</>
                      )}
                    </button>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedDest.name + " " + selectedDest.region + " Meghalaya")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[11px] font-bold uppercase tracking-wider transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Loading overlay ────────────────────────────── */}
        {!mapReady && apiKey && (
          <div className="absolute inset-0 bg-stone-100 flex items-center justify-center z-30">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 text-amber-700 animate-spin mx-auto" />
              <p className="text-stone-500 text-sm font-sans">Loading Meghalaya map…</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Region Highlights ──────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-8 pt-12 pb-4 space-y-6">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Regional Discovery
            </span>
            <h3 className="text-xl md:text-2xl font-display font-medium text-stone-900">
              Explore by Region
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { region: "Shillong", emoji: "🏙️", desc: "Hill station life, cafés & culture", dest: { lat: 25.5788, lng: 91.8900 }, zoom: 13 },
            { region: "Cherrapunji", emoji: "🌊", desc: "World's wettest — waterfalls & caves", dest: { lat: 25.2797, lng: 91.7262 }, zoom: 12 },
            { region: "Dawki", emoji: "🏞️", desc: "Crystal river & cleanest village", dest: { lat: 25.1919, lng: 92.0261 }, zoom: 12 },
            { region: "Jowai", emoji: "💎", desc: "Monoliths, sacred lakes & hidden falls", dest: { lat: 25.4459, lng: 92.2011 }, zoom: 12 },
          ].map(({ region, emoji, desc, dest, zoom }) => (
            <button
              key={region}
              onClick={() => {
                if (mapRef.current) {
                  mapRef.current.panTo(dest);
                  mapRef.current.setZoom(zoom);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="group bg-[#FAF8F5] border border-stone-200 hover:border-amber-300 hover:shadow-md rounded-2xl p-4 text-left transition-all duration-200 space-y-1.5"
            >
              <span className="text-2xl">{emoji}</span>
              <p className="font-display font-bold text-stone-900 text-sm group-hover:text-amber-800 transition-colors">{region}</p>
              <p className="text-[10px] text-stone-500 font-sans leading-relaxed">{desc}</p>
              <div className="flex items-center gap-1 text-[9px] text-amber-700 font-mono font-bold uppercase tracking-wider pt-1">
                Explore on Map <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
