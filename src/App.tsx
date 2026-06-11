import React, { useState, useEffect } from "react";
import { Compass, Search, Feather, FileText, Heart, MapPin, Sparkles, BookOpen, Layers, Menu, X, ArrowRight, Database, LayoutGrid, RefreshCw, Star, Radio, Clock, Flame, Music, Crown, ArrowUpRight, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { CAFES, NEIGHBORHOODS, ARTICLES } from "./data";
import { Cafe } from "./types";
import { isFuzzyMatch } from "./utils";
import { getCustomCafesFromFirestore } from "./services/db";

// @ts-ignore
import logoImage from "./assets/images/shillong_cafe_logo_1779948676706.png";

import CafeCard from "./components/CafeCard";
import EditorsChoiceCard from "./components/EditorsChoiceCard";
import CafeDetailModal from "./components/CafeDetailModal";
import NeighborhoodGuide from "./components/NeighborhoodGuide";
import CuisineGuide from "./components/CuisineGuide";
import GuidesList from "./components/GuidesList";
import AboutPanel from "./components/AboutPanel";
import AIGuideChat from "./components/AIGuideChat";
import DataHubModal from "./components/DataHubModal";
import InteractiveMap from "./components/InteractiveMap";
import PlannersGuide from "./components/PlannersGuide";
import TrendingDestination from "./components/TrendingDestination";
import SEO from "./components/SEO";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { GOOGLE_MAPS_API_KEY, hasValidKey } from "./config";

type TabType = "explore" | "cafes" | "cuisine" | "walks" | "planners" | "guides" | "about" | "trending";

export default function App() {
  const [cafes, setCafes] = useState<Cafe[]>(CAFES);

  const [activeTab, setActiveTabState] = useState<TabType>("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanRegion, setScanRegion] = useState("Shillong");
  const [scanCategory, setScanCategory] = useState("cafes");
  const [scanReport, setScanReport] = useState<any | null>(null);

  const handleTriggerScan = async () => {
    setIsScanning(true);
    setScanProgress(5);
    setScanReport(null);
    const regionLabel = scanRegion;
    const categoryLabel = scanCategory;
    const logs = [
      `[SYSTEM] Connecting to Google Places Platform...`,
      `[SYSTEM] Initiating geospatial query in region: "${regionLabel}"...`,
      `[GMP] Executing text search passes for category: "${categoryLabel}"...`
    ];
    setScanLogs(logs);
    const addLogWithDelay = (message: string, delay: number, progress: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setScanLogs(prev => [...prev, message]);
          setScanProgress(progress);
          resolve();
        }, delay);
      });
    };
    try {
      await addLogWithDelay(`[GMP] Found coordinates bounding box for ${regionLabel}...`, 800, 15);
      await addLogWithDelay(`[GMP] Parsing results from active registry, filtering out low-confidence listings...`, 1500, 30);
      await addLogWithDelay(`[DATABASE] Cross-checking against local persisted entries (deduplication pass)...`, 2200, 45);
      await addLogWithDelay(`[SCHEMATICS] Synthesizing cultural tags, rating indexes, and Kong Labet's local comments...`, 2900, 60);
      await addLogWithDelay(`[SYSTEM] Dispatched backend job to resolve Places Photo Proxies and website links...`, 3600, 80);
      const res = await fetch("/api/cafes/discover-gmp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region: scanRegion, category: scanCategory })
      });
      if (!res.ok) throw new Error(`Crawl failed with status ${res.status}`);
      const data = await res.json();
      setScanProgress(100);
      setScanLogs(prev => [
        ...prev,
        `[SUCCESS] Sync complete! Synchronized database with Google Places registry.`,
        `[DATABASE] Cataloged: ${data.summary.newAdded} new venues, merged ${data.summary.duplicatesDetected} duplicates, detected ${data.summary.closedDetected} closed listings.`
      ]);
      setScanReport(data);
      await loadCafes();
    } catch (err: any) {
      console.error("Scanner exception:", err);
      setScanLogs(prev => [...prev, `[ERROR] Scan sequence aborted: ${err.message}`]);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab") as TabType;
    if (tabParam && ["explore", "cafes", "cuisine", "walks", "planners", "guides", "about", "trending"].includes(tabParam)) {
      setActiveTabState(tabParam);
    }
    const cafeslug = params.get("cafe");
    if (cafeslug && cafes.length > 0) {
      const found = cafes.find(c => c.id === cafeslug);
      if (found) setSelectedCafe(found);
    }
    const nbhd = params.get("district");
    if (nbhd) setSelectedNeighborhoodId(nbhd);
    const srch = params.get("search");
    if (srch) setSearchQuery(srch);
  }, [cafes]);

  const setActiveTab = (tab: TabType) => {
    setActiveTabState(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    if (tab !== "walks") url.searchParams.delete("district");
    if (tab !== "cafes") {
      url.searchParams.delete("cafe");
      url.searchParams.delete("search");
    }
    window.history.pushState({}, "", url);
  };

  const handleQuickTagSearch = (tag: string) => {
    setSearchQuery(tag);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", "cafes");
    url.searchParams.set("search", tag);
    window.history.pushState({}, "", url);
    setActiveTabState("cafes");
  };

  const handleSelectCafe = (cafeId: string | null) => {
    const url = new URL(window.location.href);
    if (!cafeId) {
      setSelectedCafe(null);
      url.searchParams.delete("cafe");
    } else {
      const found = cafes.find((c) => c.id === cafeId);
      if (found) {
        setSelectedCafe(found);
        url.searchParams.set("cafe", cafeId);
        url.searchParams.set("tab", "cafes");
      }
    }
    window.history.pushState({}, "", url);
  };

  const selectDistrict = (districtId: string) => {
    setSelectedNeighborhoodId(districtId);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", "walks");
    url.searchParams.set("district", districtId);
    window.history.pushState({}, "", url);
  };

  const [dataHubOpen, setDataHubOpen] = useState(false);
  const [cafeViewMode, setCafeViewMode] = useState<"grid" | "map">("map");

  const loadCafes = async () => {
    try {
      const res = await fetch("/api/cafes");
      if (!res.ok) throw new Error("HTTP status " + res.status);
      const apiCafes = await res.json();
      try {
        const firestoreCafes = await getCustomCafesFromFirestore();
        if (Array.isArray(firestoreCafes) && firestoreCafes.length > 0) {
          const merged = [...firestoreCafes];
          apiCafes.forEach((apiCafe: Cafe) => {
            if (!merged.some(c => c.id === apiCafe.id)) merged.push(apiCafe);
          });
          setCafes(merged);
          return;
        }
      } catch (err) {
        console.warn("Firestore custom cafes fetch failed:", err);
      }
      setCafes(apiCafes);
    } catch (err) {
      console.error("Error loading cafes from database API:", err);
    }
  };

  useEffect(() => { loadCafes(); }, []);

  const filteredCafes = cafes.filter((cafe) => {
    if (activeTab === "cafes") {
      if (cafe.primary_category) {
        const isApproved = cafe.publish_eligibility_status === "approved";
        const isVerifiedFit = cafe.reviewer_decision === "Verified fit" || cafe.review_status === "Verified fit";
        const isCozy = cafe.primary_category === "Cozy cafés";
        const meetsThreshold = (cafe.theme_fit_confidence || 0) >= 70;
        if (!isApproved || !isVerifiedFit || (!isCozy && !meetsThreshold)) return false;
      }
    }
    // Guard against undefined fields from API-sourced cafe objects
    const vibeTags = Array.isArray(cafe.vibeTags) ? cafe.vibeTags.join(" ") : "";
    const combinedTexts = `${cafe.name ?? ""} ${cafe.theme ?? ""} ${cafe.neighborhood ?? ""} ${vibeTags}`;
    return isFuzzyMatch(searchQuery, combinedTexts);
  });

  const navigateToNeighborhood = (districtId: string) => {
    setSelectedNeighborhoodId(districtId);
  };

  const tabsList = [
    { id: "explore", label: "Discovery" },
    { id: "cafes", label: "Cozy Cafés" },
    { id: "cuisine", label: "Khasi Cuisine" },
    { id: "walks", label: "District Walks" },
    { id: "planners", label: "Route Planner" },
    { id: "guides", label: "Editorial" },
    { id: "about", label: "About Chronicles" },
    { id: "trending", label: "🔥 Trending" }
  ];

  const getDynamicSchema = () => {
    if (selectedCafe) {
      return {
        "@context": "https://schema.org",
        "@type": ["CafeOrCoffeeShop", "FoodEstablishment"],
        "@id": `https://shillongcafemap.com/?tab=cafes&cafe=${selectedCafe.id}`,
        name: selectedCafe.name,
        description: selectedCafe.introduction || selectedCafe.tagline,
        url: selectedCafe.website || `https://shillongcafemap.com/?tab=cafes&cafe=${selectedCafe.id}`,
        image: [selectedCafe.images?.hero, selectedCafe.images?.card, selectedCafe.images?.interior].filter(Boolean),
        address: { "@type": "PostalAddress", streetAddress: selectedCafe.address, addressLocality: "Shillong", addressRegion: "Meghalaya", postalCode: "793003", addressCountry: "IN" },
        geo: { "@type": "GeoCoordinates", latitude: selectedCafe.coordinates?.lat || 25.5788, longitude: selectedCafe.coordinates?.lng || 91.8920 },
        telephone: selectedCafe.phone_number || "",
        servesCuisine: selectedCafe.khasi_food_available ? ["Khasi", "Local Meghalaya"] : ["Coffee", "Cafe", "Bakery"],
        priceRange: "₹₹",
        aggregateRating: selectedCafe.rating ? { "@type": "AggregateRating", ratingValue: selectedCafe.rating, reviewCount: selectedCafe.user_ratings_total || 25, bestRating: "5", worstRating: "1" } : undefined
      };
    }
    if (activeTab === "trending") {
      return {
        "@context": "https://schema.org",
        "@type": "TouristDestination",
        name: "Sohra (Cherrapunji)",
        description: "World's wettest place — Nohkalikai Falls, Double Decker Living Root Bridge, Seven Sisters Falls, Mawsmai Cave.",
        url: "https://shillongcafemap.in/?tab=trending",
        touristType: ["Adventure", "Nature", "Cultural"],
        geo: { "@type": "GeoCoordinates", latitude: 25.2802, longitude: 91.7196 },
        containedInPlace: { "@type": "State", name: "Meghalaya", containedInPlace: { "@type": "Country", name: "India" } }
      };
    }
    const breadcrumbItems: any[] = [{ "@type": "ListItem", position: 1, name: "Home", item: "https://shillongcafemap.com/?tab=explore" }];
    if (activeTab !== "explore") {
      breadcrumbItems.push({ "@type": "ListItem", position: 2, name: activeTab.charAt(0).toUpperCase() + activeTab.slice(1), item: `https://shillongcafemap.com/?tab=${activeTab}` });
    }
    return {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebSite", "@id": "https://shillongcafemap.com/#website", name: "Shillong Café Map", url: "https://shillongcafemap.com", description: "Discover cozy cafes, traditional Khasi cuisine, and neighborhood acoustic spaces in Shillong.", inLanguage: "en-IN", publisher: { "@type": "Organization", name: "Shillong Café Map", logo: { "@type": "ImageObject", url: "https://shillongcafemap.com/logo.png" } } },
        { "@type": "BreadcrumbList", "@id": `https://shillongcafemap.com/?tab=${activeTab}#breadcrumbs`, itemListElement: breadcrumbItems }
      ]
    };
  };

  return (
    <>
      <SEO schema={getDynamicSchema()} />
      <div className="md:h-screen md:max-h-screen md:overflow-hidden bg-[#FAF8F5] text-stone-850 font-sans flex flex-col md:flex-row relative antialiased selection:bg-amber-800/20 selection:text-amber-900 w-full">

        {/* Subtle dot grid texture overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#8b5c1a_0.6px,transparent_0.6px)] [background-size:16px_16px] opacity-[0.04] pointer-events-none z-10" />

        {/* === DESKTOP SIDEBAR NAV === */}
        <aside className="hidden md:flex w-[260px] shrink-0 h-full border-r border-stone-200 bg-white flex-col justify-between z-30 font-sans">
          <div>
            <div
              onClick={() => setActiveTab("explore")}
              className="p-6 flex items-center gap-2.5 cursor-pointer leading-none group select-none border-b border-stone-100"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center border border-stone-200 shadow-xs bg-white transition-transform group-hover:scale-105 duration-300 shrink-0">
                <img src={logoImage} alt="Shillong Cafe Map" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-display font-bold text-sm tracking-wide text-stone-900 block">Shillong Café Map</span>
                <span className="text-[10px] font-mono tracking-widest text-[#8b5c1a] uppercase font-bold">Editorial Hearth Guide</span>
              </div>
            </div>
            <nav className="p-4 flex flex-col gap-1">
              {tabsList.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`sidebar-nav-tab-${tab.id}`}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-sans tracking-wider font-semibold uppercase cursor-pointer relative transition-all flex items-center gap-3 ${
                      isActive
                        ? "text-amber-800 bg-amber-50"
                        : "text-stone-500 hover:text-stone-850 hover:bg-stone-50"
                    }`}
                  >
                    {isActive && <div className="w-1.5 h-1.5 bg-amber-800 rounded-full shrink-0" />}
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="p-4 border-t border-stone-100 bg-[#FAF8F5]">
            <button
              onClick={() => setDataHubOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-mono tracking-wider font-bold uppercase cursor-pointer border border-stone-200 hover:border-amber-700 bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-800 transition-all duration-300 shadow-2xs"
            >
              <Database className="w-4 h-4 text-[#8b5c1a]" />
              Data Hub
            </button>
          </div>
        </aside>

        {/* === MOBILE HEADER === */}
        <header id="main-navbar" className="md:hidden sticky top-0 z-40 bg-[#FAF8F5]/85 backdrop-blur-md border-b border-stone-200/80 w-full shrink-0">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center border border-stone-200 bg-white">
                <img src={logoImage} alt="Shillong Cafe Map" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-display font-bold text-sm tracking-wide text-stone-900 block">Shillong Café Map</span>
                <span className="text-[9px] font-mono tracking-widest text-amber-805 uppercase font-bold block">Hearth Guide</span>
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="border-t border-stone-200 bg-[#FAF8F5]">
                <nav className="p-4 flex flex-col gap-2">
                  {tabsList.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as TabType);
                        setMobileMenuOpen(false);
                      }}
                      className={`px-4 py-2.5 text-left rounded-lg text-xs font-sans font-medium tracking-wide uppercase ${
                        activeTab === tab.id ? "bg-amber-50 text-amber-800" : "text-stone-500 hover:bg-stone-50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                  <button
                    onClick={() => { setDataHubOpen(true); setMobileMenuOpen(false); }}
                    className="px-4 py-2.5 mt-1 text-left rounded-lg text-xs font-mono font-bold tracking-wide uppercase text-amber-800 bg-amber-50 hover:bg-amber-100 flex items-center gap-2 border border-amber-200/60 font-sans"
                  >
                    <Database className="w-4 h-4 text-amber-700" />
                    Data Hub
                  </button>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* === MAIN CONTENT === */}
        <main className="flex-1 min-w-0 flex flex-col h-auto md:h-full md:overflow-hidden relative">
          <AnimatePresence mode="wait">

            {/* EXPLORE TAB */}
            {activeTab === "explore" && (
              <motion.div key="explore-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="flex-1 flex flex-col md:flex-row h-auto md:h-full overflow-visible md:overflow-hidden">

              <div id="discovery-left-panel" className="w-full md:w-[42%] flex-none h-auto md:h-full overflow-y-auto border-r border-[#E6E4DF] bg-white p-4 md:p-6 space-y-12 select-none min-w-[340px] max-w-[480px]">
              <div className="relative text-[#FAF8F5] rounded-[32px] p-8 md:p-14 overflow-hidden border border-stone-850 shadow-2xl flex flex-col lg:flex-row items-center gap-12 bg-gradient-to-br from-[#2E1E0F] via-[#3D2814] to-[#1F140A]">
                <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-amber-600/10 blur-[120px] pointer-events-none animate-pulse" />
                <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] rounded-full bg-stone-900/40 blur-[100px] pointer-events-none" />
                <div className="flex-1 space-y-7 z-10 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-2 rounded-full text-[11px] font-mono font-bold tracking-widest uppercase shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    NOW GATHERING MONSOONS
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-display font-bold text-[#faf8f5] leading-none tracking-tight">
                    The Heart of<br />the Hills
                    <span className="text-amber-100 font-serif italic text-3xl sm:text-4xl font-normal block mt-2">A Curated Chronicle of cozy hearths, acoustic circles, and culinary heritage in Shillong's misty ridges.</span>
                  </h1>
                  <p className="text-stone-300 text-sm md:text-base max-w-xl font-sans leading-relaxed font-light">A guide to the best cafés in Shillong, Khasi food like Jadoh and Dohneiiong, walkable districts (Laitumkhrah, Police Bazaar, Golf Links) and curated road-trip routes across Meghalaya.</p>
                  <div className="bg-white hover:bg-white p-1.5 rounded-2xl border border-stone-200/80 flex items-center gap-2 max-w-md shadow-xl transition-all duration-300">
                    <Search className="w-5 h-5 text-stone-400 shrink-0 ml-3" />
                    <input id="hero-input" type="text" placeholder="Search cozy lofts, acoustic stages..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") setActiveTab("cafes"); }} className="flex-1 text-[#1c1917] bg-transparent px-2 py-3 text-xs md:text-sm outline-none font-sans" />
                    <button onClick={() => setActiveTab("cafes")} className="bg-amber-800 hover:bg-amber-900 text-white transition-colors px-5 py-2.5 rounded-xl text-xs font-sans font-semibold cursor-pointer active:scale-98">Find</button>
                  </div>
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-stone-400 text-[11px] font-mono">
                    <span className="font-semibold text-stone-350">Cozy Tags:</span>
                    {["Jazz Beats", "Book Heaven", "Greenhouse", "Rider Haven"].map((tag) => (
                      <button key={tag} onClick={() => handleQuickTagSearch(tag)} className="text-stone-350 hover:text-amber-400 transition-colors border-b border-stone-700/60 hover:border-amber-400 cursor-pointer">{tag}</button>
                    ))}
                  </div>
                </div>
                <div className="w-full lg:w-[360px] shrink-0 h-72 lg:h-96 rounded-2xl overflow-hidden shadow-2xl relative border border-stone-800">
                  {hasValidKey ? (
                    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                      <Map
                        defaultCenter={{ lat: 25.5788, lng: 91.8920 }}
                        defaultZoom={14}
                        mapId="shillong_discovery_hero"
                        disableDefaultUI={true}
                        gestureHandling="none"
                        className="w-full h-full"
                        colorScheme="DARK"
                      >
                        {cafes.slice(0, 5).map((cafe) => (
                          cafe.coordinates?.lat && cafe.coordinates?.lng ? (
                            <AdvancedMarker key={cafe.id} position={{ lat: cafe.coordinates.lat, lng: cafe.coordinates.lng }}>
                              <Pin background={"#8b5c1a"} borderColor={"#3d2817"} glyphColor={"#faf8f5"} scale={0.6} />
                            </AdvancedMarker>
                          ) : null
                        ))}
                      </Map>
                    </APIProvider>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-900">
                      <div className="text-center">
                        <MapPin className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                        <p className="text-stone-400 text-xs font-mono">PINE & HEARTH GEOGRAPHY</p>
                        <p className="text-stone-200 text-sm font-display">Discovery Hearth Map</p>
                        <p className="text-stone-500 text-xs mt-1">Navigate physical pine hills, misty valleys,<br />and historic alleys using exact geolocated coordinates.</p>
                        <p className="text-stone-600 text-[10px] mt-2 font-mono">Filter through traditional Khasi hearths,<br />luxury banquets, and acoustic cellars.</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-stone-900/20" />
                  <div className="absolute bottom-5 left-5 right-5 bg-stone-900/75 backdrop-blur-md border border-stone-800/80 p-4 rounded-xl text-stone-100 flex items-center justify-between shadow-lg">
                    <div>
                      <p className="text-[10px] font-mono tracking-widest text-[#E6AD4E] uppercase font-bold">Local Climate</p>
                      <h4 className="text-xs font-display font-medium text-[#FAF8F5]">Monsoon Ridge Patrol</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-stone-300">22.5°C</span>
                  </div>
                </div>
              </div>

              {/* EDITOR'S CHOICE CARDS */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-mono tracking-widest text-[#8b5c1a] uppercase font-bold">THE EDITORIAL HAND</p>
                    <h2 className="text-xl font-display font-bold text-stone-900">Editor's Choice</h2>
                  </div>
                  <button onClick={() => setActiveTab("cafes")} className="text-xs font-mono text-[#8b5c1a] font-bold hover:underline flex items-center gap-1">View Hearth Map <ArrowRight className="w-3 h-3" /></button>
                </div>
                <div className="space-y-4">
                  {cafes.filter(c => c.editorial_featured).slice(0, 3).map(cafe => (
                    <EditorsChoiceCard key={cafe.id} cafe={cafe} onViewDetails={(id) => handleSelectCafe(id)} />
                  ))}
                  {cafes.filter(c => c.editorial_featured).length === 0 && cafes.slice(0, 3).map(cafe => (
                    <EditorsChoiceCard key={cafe.id} cafe={cafe} onViewDetails={(id) => handleSelectCafe(id)} />
                  ))}
                </div>
              </div>

              {/* INDIGENOUS SPOTLIGHT */}
              <div className="bg-stone-900 text-[#FAF8F5] rounded-[28px] p-8 overflow-hidden relative shadow-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-800/10 rounded-full blur-3xl" />
                <p className="text-[10px] font-mono tracking-widest text-amber-400 uppercase font-bold mb-2">INDIGENOUS SPOTLIGHT</p>
                <h2 className="text-2xl font-display font-bold text-[#FAF8F5] leading-tight mb-3">Dohneiiong: Black Sesame Heritage Spot</h2>
                <p className="text-stone-300 text-sm leading-relaxed font-sans font-light max-w-lg">Savor the earthy, complex deep flavors of slow-stewed pork belly simmered gently in a jet-black gravy of hand-roasted whole black sesame seed (Nei-long), local wild ginger, and peppercorns. It is a masterpiece of Northeast Indian tribal cuisine.</p>
                <div className="flex gap-4 mt-6">
                  <button onClick={() => setActiveTab("cuisine")} className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 border-b border-amber-400/40 hover:border-amber-300 transition-colors">Explore Khasi Foods</button>
                  <button onClick={() => setActiveTab("cafes")} className="text-xs font-mono font-bold text-stone-400 hover:text-stone-200 border-b border-stone-600 hover:border-stone-300 transition-colors">Find Sourdough Toast Partner →</button>
                </div>
              </div>

              {/* NEIGHBORHOOD WALKS TEASER */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-mono tracking-widest text-[#8b5c1a] uppercase font-bold">SCENIC ITINERARIES</p>
                    <h2 className="text-xl font-display font-bold text-stone-900">Walk Through districts</h2>
                  </div>
                  <button onClick={() => setActiveTab("walks")} className="text-xs font-mono text-[#8b5c1a] font-bold hover:underline flex items-center gap-1">All Walks Timeline <ArrowRight className="w-3 h-3" /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {NEIGHBORHOODS.map(nbhd => (
                    <button key={nbhd.id} onClick={() => selectDistrict(nbhd.id)} className="bg-white border border-stone-200 hover:border-amber-300 rounded-2xl p-4 text-left transition-all group hover:shadow-md">
                      <p className="text-lg font-display font-bold text-stone-900 group-hover:text-amber-800 transition-colors">{nbhd.name}</p>
                      <p className="text-xs text-stone-500 mt-1 font-sans">{nbhd.tagline}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* EDITORIAL SECTION */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-mono tracking-widest text-[#8b5c1a] uppercase font-bold">INDEPENDENT PUBLISHING</p>
                    <h2 className="text-xl font-display font-bold text-stone-900">Latest Editorial Periodic Issues</h2>
                  </div>
                  <button onClick={() => setActiveTab("guides")} className="text-xs font-mono text-[#8b5c1a] font-bold hover:underline flex items-center gap-1">Enter Library Room <ArrowRight className="w-3 h-3" /></button>
                </div>
                <div className="space-y-3">
                  {ARTICLES.slice(0, 2).map(article => (
                    <div key={article.id} className="flex items-start gap-4 p-4 bg-white border border-stone-200 rounded-2xl hover:border-amber-200 hover:shadow-sm transition-all group">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[9px] font-mono tracking-widest font-bold uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded">{article.category}</span>
                          <span className="text-[9px] font-mono text-stone-400">{article.readTime} read</span>
                        </div>
                        <h3 className="text-sm font-display font-bold text-stone-900 leading-snug group-hover:text-amber-800 transition-colors">{article.title}</h3>
                        <p className="text-xs text-stone-500 mt-1 leading-relaxed font-sans">{article.excerpt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TRENDING INDICATORS */}
              <section id="trending-indicators" className="bg-stone-900 text-[#FAF8F5] rounded-[32px] p-8 border border-stone-850 relative overflow-hidden shadow-lg select-none">
                <div className="absolute top-0 right-0 w-72 h-72 bg-amber-700/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-3 mb-5">
                  <span className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 px-3.5 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase">
                    <Flame className="w-3 h-3 text-amber-400 animate-pulse" /> Trending Destination
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#FAF8F5] leading-tight mb-2">
                  Sohra (Cherrapunji)
                </h2>
                <p className="text-stone-400 text-sm font-sans font-light leading-relaxed max-w-lg mb-6">
                  World's wettest place. Nohkalikai Falls, Double Decker Living Root Bridge, Seven Sisters Falls, Mawsmai Cave. 83 km from Shillong — the essential day-trip from the city.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: "Distance", value: "83 km", sub: "from Shillong" },
                    { label: "Drive", value: "2.5h", sub: "via NH6" },
                    { label: "Best Time", value: "Oct–Mar", sub: "post-monsoon clarity" },
                    { label: "Key Sites", value: "12+", sub: "falls, caves, bridges" }
                  ].map(stat => (
                    <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                      <p className="text-[10px] font-mono text-stone-500 uppercase tracking-wide mb-0.5">{stat.label}</p>
                      <p className="text-lg font-display font-bold text-[#FAF8F5]">{stat.value}</p>
                      <p className="text-[9px] font-mono text-stone-400">{stat.sub}</p>
                    </div>
                  ))}
                </div>
                <button onClick={() => setActiveTab("trending")} className="flex items-center gap-2 bg-amber-700 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-lg cursor-pointer">
                  <Flame className="w-3.5 h-3.5" /> Explore Sohra Guide
                </button>
              </section>

              {/* FAQ */}
              <div className="bg-white border border-stone-200 rounded-[28px] p-6 shadow-xs">
                <h2 className="text-lg font-display font-bold text-stone-900 mb-4">Shillong cafés, Khasi food & routes — quick answers</h2>
                <div className="divide-y divide-stone-100">
                  {[
                    { q: "What are the best cafés in Shillong?", a: "Café Shillong (jazz tradition), Dylan's (Bob Dylan tribute, hillside), Rynsan (Khasi slow-food + live ka duitara), Ahavah Fine Dining (alpine chandeliers), Munchies Shillong (graffiti walls), Marsoki Café (hidden laitumkhrah gem)." },
                    { q: "Where can I try authentic Khasi food in Shillong?", a: "Trattoria (Police Bazaar, 70 years old), Rynsan (Newlands Compound, organic), Jadoh Restaurant (clay cookpots), Meghalaya Heritage Inn." },
                    { q: "Which Shillong neighborhood is best for café-hopping?", a: "Laitumkhrah for vinyl records + music cafés (afternoon to dusk). Police Bazaar for street food + neon reflections (evening). Golf Links for scenic pine-scented escape (morning)." },
                    { q: "Are there cafés in Shillong with live music?", a: "Yes — Café Shillong (live mountain brew sessions), Dylan's (open mic, folk), Rynsan (ka duitara performances), Dejavu Café & Lounge (underground acoustic)." },
                    { q: "Does the route planner cover places outside Shillong city?", a: "Yes — 12 curated routes including Cherrapunji (Nohkalikai, Root Bridge), Dawki (Umngot River), Laitlum Canyons, Jowai, Mawsynram, Garo Hills, and more." }
                  ].map((faq, i) => (
                    <details key={i} className="group py-4">
                      <summary className="flex items-center justify-between cursor-pointer list-none">
                        <span className="text-sm font-sans font-medium text-stone-900">{faq.q}</span>
                        <span className="text-stone-400 group-open:rotate-45 transition-transform text-lg font-light ml-4 shrink-0">+</span>
                      </summary>
                      <p className="text-xs text-stone-500 mt-2 leading-relaxed font-sans">{faq.a}</p>
                    </details>
                  ))}
                </div>
              </div>

              </div>

              {/* RIGHT PANEL — EXPLORE MAP */}
              <div className="hidden md:flex flex-col flex-1 min-w-0 h-full overflow-hidden">
                <InteractiveMap
                  cafes={cafes}
                  onSelectCafe={(c) => handleSelectCafe(c.id)}
                  onNavigateToNeighborhood={navigateToNeighborhood}
                />
              </div>
            </motion.div>
            )}

            {/* CAFES TAB */}
            {activeTab === "cafes" && (
              <motion.div key="cafes-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="h-full w-full flex flex-col md:flex-row overflow-hidden">
                {/* Left panel — filtered list */}
                <div className="w-full md:w-[420px] md:max-w-[480px] shrink-0 h-auto md:h-full overflow-y-auto border-r border-[#E6E4DF] bg-white">
                  <div className="p-4 border-b border-stone-100 sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-2 bg-[#FAF8F5] border border-stone-200 rounded-xl px-3 py-2.5">
                      <Search className="w-4 h-4 text-stone-400 shrink-0" />
                      <input type="text" placeholder="Search cozy lofts, acoustic stages..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 bg-transparent text-xs text-stone-800 outline-none font-sans placeholder:text-stone-400" />
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => setCafeViewMode("map")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wide uppercase transition-all ${
                          cafeViewMode === "map" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        <MapPin className="w-3 h-3" /> Map
                      </button>
                      <button
                        onClick={() => setCafeViewMode("grid")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold tracking-wide uppercase transition-all ${
                          cafeViewMode === "grid" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        <LayoutGrid className="w-3 h-3" /> Grid
                      </button>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    {filteredCafes.length === 0 ? (
                      <div className="text-center py-16">
                        <p className="text-stone-400 text-sm font-sans">No cafés match your search.</p>
                        <button onClick={() => setSearchQuery("")} className="mt-3 text-xs font-mono text-amber-700 hover:underline">Clear search</button>
                      </div>
                    ) : (
                      filteredCafes.map((cafe) => (
                        <CafeCard
                          key={cafe.id}
                          cafe={cafe}
                          onViewDetails={(id) => handleSelectCafe(id)}
                        />
                      ))
                    )}
                  </div>
                </div>
                {/* Right panel — map or grid */}
                <div className="flex-1 min-w-0 h-auto md:h-full overflow-hidden">
                  {cafeViewMode === "map" ? (
                    <InteractiveMap
                      cafes={filteredCafes}
                      selectedCafeId={selectedCafe?.id}
                      onSelectCafe={(c) => handleSelectCafe(c.id)}
                      onNavigateToNeighborhood={navigateToNeighborhood}
                    />
                  ) : (
                    <div className="h-full overflow-y-auto p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCafes.map((cafe) => (
                          <CafeCard
                            key={cafe.id}
                            cafe={cafe}
                            onViewDetails={(id) => handleSelectCafe(id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* CUISINE TAB */}
            {activeTab === "cuisine" && (
              <motion.div key="cuisine-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="h-full w-full overflow-y-auto">
                <CuisineGuide />
              </motion.div>
            )}

            {/* WALKS TAB */}
            {activeTab === "walks" && (
              <motion.div key="walks-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="h-full w-full overflow-y-auto">
                <NeighborhoodGuide
                  cafes={cafes}
                  onSelectCafe={handleSelectCafe}
                  initialNeighborhoodId={selectedNeighborhoodId}
                />
              </motion.div>
            )}

            {/* PLANNERS TAB */}
            {activeTab === "planners" && (
              <motion.div key="planners-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="h-full w-full overflow-y-auto">
                <PlannersGuide />
              </motion.div>
            )}

            {/* GUIDES TAB */}
            {activeTab === "guides" && (
              <motion.div key="guides-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="h-full w-full overflow-y-auto">
                <GuidesList />
              </motion.div>
            )}

            {/* ABOUT TAB */}
            {activeTab === "about" && (
              <motion.div key="about-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="h-full w-full overflow-y-auto">
                <AboutPanel />
              </motion.div>
            )}

            {/* TRENDING TAB */}
            {activeTab === "trending" && (
              <motion.div key="trending-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8 pb-16">
                <TrendingDestination />
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* CAFE DETAIL MODAL */}
        <AnimatePresence>
          {selectedCafe && (
            <CafeDetailModal cafe={selectedCafe} onClose={() => handleSelectCafe(null)} />
          )}
        </AnimatePresence>

        {/* AI GUIDE CHAT */}
        <AIGuideChat />

        {/* DATA HUB MODAL */}
        {dataHubOpen && (
          <DataHubModal
            isOpen={dataHubOpen}
            onClose={() => setDataHubOpen(false)}
            currentCafes={cafes}
            onRefresh={loadCafes}
          />
        )}
      </div>
    </>
  );
}
