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
    const combinedTexts = `${cafe.name} ${cafe.theme} ${cafe.neighborhood} ${cafe.vibeTags.join(" ")}`;
    return isFuzzyMatch(searchQuery, combinedTexts);
  });

  const navigateToNeighborhood = (districtId: string) => {
    setSelectedNeighborhoodId(districtId);
  };

  const tabsList = [
    { id: "explore", label: "Discovery" },
    { id: "cafes", label: "Cozy Cafés" },
    { id: "trending", label: "🔥 Trending" },
    { id: "cuisine", label: "Khasi Cuisine" },
    { id: "walks", label: "District Walks" },
    { id: "planners", label: "Route Planner" },
    { id: "guides", label: "Editorial" },
    { id: "about", label: "About Chronicles" }
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
    <div className="md:h-screen md:max-h-screen md:overflow-hidden bg-[#FAF8F5] text-stone-850 font-sans flex flex-col md:flex-row relative antialiased selection:bg-amber-800/20 selection:text-amber-900 w-full">
      <SEO
        title="Shillong Café Map | Independent Food & Coffee Guide"
        description="A Curated Chronicle of cozy hearths, acoustic circles, local Khasi cuisine, and culinary heritage in Shillong, Meghalaya."
        url={`/?tab=${activeTab}`}
        type="website"
        schema={getDynamicSchema()}
      />
      <div className="absolute inset-0 bg-[radial-gradient(#8b5c1a_0.6px,transparent_0.6px)] [background-size:16px_16px] opacity-[0.04] pointer-events-none z-10" />

      {/* LEFT SIDEBAR */}
      <aside className="hidden md:flex w-[260px] shrink-0 h-full border-r border-stone-200 bg-white flex-col justify-between z-30 font-sans">
        <div className="flex flex-col flex-grow overflow-y-auto">
          <div
            onClick={() => setActiveTabState("explore")}
            className="p-6 flex items-center gap-2.5 cursor-pointer leading-none group select-none border-b border-stone-100"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center border border-stone-200 shadow-xs bg-white transition-transform group-hover:scale-105 duration-300 shrink-0">
              <img src={logoImage} alt="Shillong Cafe Map Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-wide text-stone-900 block">Shillong Café Map</span>
              <span className="text-[10px] font-mono tracking-widest text-[#8b5c1a] uppercase font-bold">Editorial Hearth Guide</span>
            </div>
          </div>
          <nav className="p-4 flex flex-col gap-1">
            {tabsList.map((tab) => {
              const isActive = activeTab === tab.id || (tab.id === "walks" && selectedNeighborhoodId !== undefined && activeTab === "explore");
              return (
                <button
                  id={`sidebar-nav-tab-${tab.id}`}
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === "walks") setSelectedNeighborhoodId(NEIGHBORHOODS[0].id);
                    setActiveTabState(tab.id as TabType);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-sans tracking-wider font-semibold uppercase cursor-pointer relative transition-all flex items-center gap-3 ${
                    isActive || (tab.id === "walks" && activeTab === "walks")
                      ? "text-amber-800 bg-amber-50"
                      : "text-stone-500 hover:text-stone-850 hover:bg-stone-50"
                  }`}
                >
                  <span className="flex-1">{tab.label}</span>
                  {isActive && <div className="w-1.5 h-1.5 bg-amber-800 rounded-full shrink-0" />}
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
            <span>Data Hub Admin</span>
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header id="main-navbar" className="md:hidden sticky top-0 z-40 bg-[#FAF8F5]/85 backdrop-blur-md border-b border-stone-200/80 w-full shrink-0">
        <div className="px-4 py-3.5 flex items-center justify-between">
          <div onClick={() => setActiveTabState("explore")} className="flex items-center gap-2 cursor-pointer leading-none group select-none">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center border border-stone-200 bg-white">
              <img src={logoImage} alt="Shillong Cafe Map Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-wide text-stone-900 block">Shillong Café Map</span>
              <span className="text-[9px] font-mono tracking-widest text-amber-805 uppercase font-bold block">Hearth Guide</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors">
              {mobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="border-t border-stone-200 bg-[#FAF8F5]">
              <nav className="p-4 flex flex-col gap-2">
                {tabsList.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (tab.id === "walks") setSelectedNeighborhoodId(NEIGHBORHOODS[0].id);
                      setActiveTabState(tab.id as TabType);
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
                  <span>Data Hub Admin</span>
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-grow flex flex-col h-full overflow-hidden min-w-0 relative">
        <AnimatePresence mode="wait">
          {activeTab === "explore" && (
            <motion.div key="explore-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35, ease: "easeOut" }} className="h-full w-full flex flex-col md:flex-row overflow-hidden min-w-0">
              <div id="discovery-left-panel" className="w-full md:w-[42%] flex-none h-auto md:h-full overflow-y-auto border-r border-[#E6E4DF] bg-white p-4 md:p-6 space-y-12 select-none min-w-[340px] max-w-[480px]">
              <div className="relative text-[#FAF8F5] rounded-[32px] p-8 md:p-14 overflow-hidden border border-stone-850 shadow-2xl flex flex-col lg:flex-row items-center gap-12 bg-gradient-to-br from-[#2E1E0F] via-[#3D2814] to-[#1F140A]">
                <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-amber-600/10 blur-[120px] pointer-events-none animate-pulse" />
                <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] rounded-full bg-stone-900/40 blur-[100px] pointer-events-none" />
                <div className="flex-1 space-y-7 z-10 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-2 rounded-full text-[11px] font-mono font-bold tracking-widest uppercase shadow-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Independent Curated Chronicle</span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-display font-bold text-[#faf8f5] leading-none tracking-tight">
                    Behind the Misty Pine <span className="text-amber-100 font-serif italic text-3xl sm:text-4xl font-normal block mt-2">Discover the Hearth of the Hills</span>
                  </h1>
                  <p className="text-stone-300 text-sm md:text-base max-w-xl font-sans leading-relaxed font-light">An independent, data-driven digest mapping Shillong's celebrated local bakers, roasting cultivators, and traditional Khasi culinary guardians across Meghalaya's deep ridges.</p>
                  <div className="bg-white hover:bg-white p-1.5 rounded-2xl border border-stone-200/80 flex items-center gap-2 max-w-md shadow-xl transition-all duration-300">
                    <Search className="w-5 h-5 text-stone-400 shrink-0 ml-3" />
                    <input id="hero-input" type="text" placeholder="Search cafes by vibe, neighborhood, or specialty..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") setActiveTab("cafes"); }} className="flex-1 text-[#1c1917] bg-transparent px-2 py-3 text-xs md:text-sm outline-none font-sans" />
                    <button onClick={() => setActiveTab("cafes")} className="bg-amber-800 hover:bg-amber-900 text-white transition-colors px-5 py-2.5 rounded-xl text-xs font-sans font-semibold cursor-pointer active:scale-98">Search</button>
                  </div>
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-stone-400 text-[11px] font-mono">
                    <span className="font-semibold text-stone-350">Quick Tags:</span>
                    {["Jazz Beats", "Book Heaven", "Greenhouse", "Traditional Dohneiiong"].map((tag) => (
                      <button key={tag} onClick={() => handleQuickTagSearch(tag)} className="text-stone-350 hover:text-amber-400 transition-colors border-b border-stone-700/60 hover:border-amber-400 cursor-pointer">{tag}</button>
                    ))}
                  </div>
                </div>
                <div className="w-full lg:w-[360px] shrink-0 h-72 lg:h-96 rounded-2xl overflow-hidden shadow-2xl relative border border-stone-800">
                  <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800" alt="Cozy mist-shrouded green pine forest of Shillong ridges" className="w-full h-full object-cover select-none pointer-events-none" referrerPolicy="no-referrer" />
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

              <section id="google-places-scanner-hub" className="scroll-mt-24">
                <div className="bg-[#FAF8F5] border border-stone-200 shadow-md rounded-[28px] overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-700 via-[#8b5c1a] to-[#543d1b]" />
                  <div className="lg:col-span-7 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-block p-1 bg-amber-50 border border-amber-200 rounded-lg"><Radio className="w-4 h-4 text-amber-800 animate-pulse" /></span>
                        <span className="text-[10px] font-mono font-bold tracking-widest text-[#8b5c1a] uppercase bg-amber-50 px-2.5 py-0.5 rounded">Ingest Sequence Panel</span>
                      </div>
                      <h2 className="text-2xl font-display font-bold text-stone-900 leading-tight">Meghalaya Google Places Discovery Ingester</h2>
                      <p className="text-xs md:text-sm text-stone-500 leading-relaxed font-sans font-light">Query the live Google Places Registry to dynamically discover, deduplicate, and catalog cafes and restaurants across separate Meghalaya regions.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-200/60">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono tracking-wide uppercase text-stone-500 font-bold block">Select Patrol Locality</label>
                        <select value={scanRegion} onChange={(e) => setScanRegion(e.target.value)} disabled={isScanning} className="w-full bg-white border border-stone-200 text-stone-800 rounded-xl px-3.5 py-2.5 text-xs font-sans outline-none focus:border-amber-700 transition-all cursor-pointer font-medium">
                          <option value="Shillong">Shillong (Capital Boundaries)</option>
                          <option value="Sohra (Cherrapunji)">Sohra (Cherrapunji Hills)</option>
                          <option value="Dawki">Dawki (Umngot River Border)</option>
                          <option value="Jowai">Jowai District (West Jaintia)</option>
                          <option value="Mawlynnong">Mawlynnong (Asia's Cleanest)</option>
                          <option value="Tura">Tura (Garo Hills Ridge)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono tracking-wide uppercase text-stone-500 font-bold block">Select Food Classification</label>
                        <select value={scanCategory} onChange={(e) => setScanCategory(e.target.value)} disabled={isScanning} className="w-full bg-white border border-stone-200 text-stone-800 rounded-xl px-3.5 py-2.5 text-xs font-sans outline-none focus:border-amber-700 transition-all cursor-pointer font-medium">
                          <option value="cafes">Cozy Cafes & Espresso Lounges</option>
                          <option value="restaurants">Diners & Fine Restaurants</option>
                          <option value="bakeries">Bakeries & Tea Rooms</option>
                          <option value="traditional Khasi foods">Traditional Khasi Hearths</option>
                        </select>
                      </div>
                    </div>
                    <div className="pt-4 flex flex-col sm:flex-row items-center gap-3 w-full">
                      <button onClick={handleTriggerScan} disabled={isScanning} className={`w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-sans font-bold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm ${isScanning ? "bg-amber-900 border border-amber-800 text-amber-200 animate-pulse" : "bg-[#422006] hover:bg-[#5C310C] text-white active:scale-98"}`}>
                        <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isScanning ? "animate-spin" : ""}`} />
                        <span>{isScanning ? `Crawling Google Registry...` : `Patrol Google Places`}</span>
                      </button>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-stone-500 bg-white border border-stone-200/85 px-3 py-1.5 rounded-lg select-none">
                        <div className={`w-2 h-2 rounded-full ${hasValidKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        <span>{hasValidKey ? "API Connection Live" : "Simulated Local Backup Active"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-5 bg-[#1E1B18] p-6 sm:p-8 text-stone-200 border-l border-stone-800 flex flex-col justify-between">
                    {isScanning && (
                      <div className="space-y-4 h-full flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#E6AD4E] font-bold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />Active Stream Feed</span>
                          <span className="text-[10px] font-mono text-stone-400">{scanProgress}%</span>
                        </div>
                        <div className="w-full h-1 bg-[#2E2924] rounded-full overflow-hidden">
                          <motion.div initial={{ width: "0%" }} animate={{ width: `${scanProgress}%` }} transition={{ duration: 0.3 }} className="h-full bg-amber-500" />
                        </div>
                        <div id="scanner-terminal" className="flex-1 bg-[#12100E] rounded-xl p-4 border border-stone-800 font-mono text-[10px] space-y-1.5 text-stone-300 h-36 overflow-y-auto scrollbar-none select-none">
                          {scanLogs.map((log, i) => (
                            <div key={i} className="leading-relaxed whitespace-pre-wrap">
                              <span className="text-stone-500">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>{" "}
                              {log.startsWith("[SUCCESS]") ? <span className="text-emerald-400">{log}</span> : log.startsWith("[ERROR]") ? <span className="text-red-400 font-bold">{log}</span> : log.startsWith("[SCHEMATICS]") || log.startsWith("[DATABASE]") ? <span className="text-amber-400">{log}</span> : <span>{log}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {!isScanning && scanReport && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded w-fit">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Ingest Report Registered</span>
                        </div>
                        <div className="bg-[#12100E] border border-stone-800 p-4 rounded-xl space-y-3">
                          <h4 className="text-xs font-mono font-semibold text-stone-200">Reconciliation Breakdown:</h4>
                          <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                            <div className="p-2 border border-stone-800/80 rounded-lg"><span className="text-stone-400 block pb-0.5">Discovered Total</span><span className="text-sm font-bold text-[#FAF8F5]">{scanReport.summary.totalDiscovered} Venues</span></div>
                            <div className="p-2 border border-stone-800/80 rounded-lg border-l-2 border-l-emerald-500"><span className="text-emerald-400 block pb-0.5">Cataloged New</span><span className="text-sm font-bold text-[#FAF8F5]">+{scanReport.summary.newAdded}</span></div>
                            <div className="p-2 border border-stone-800/80 rounded-lg"><span className="text-stone-400 block pb-0.5">Duplicates</span><span className="text-sm font-bold text-stone-300">{scanReport.summary.duplicatesDetected}</span></div>
                            <div className="p-2 border border-stone-800/80 rounded-lg"><span className="text-stone-400 block pb-0.5">Permanently Closed</span><span className="text-sm font-bold text-stone-300">{scanReport.summary.closedDetected}</span></div>
                          </div>
                        </div>
                        <button onClick={() => { setActiveTab("cafes"); setSearchQuery(""); }} className="bg-[#faf8f5] hover:bg-[#eae8e5] text-[#1c1917] text-xs font-sans font-semibold px-4 py-2.5 rounded-lg flex items-center justify-between w-full shadow-md group transition-all">
                          <span>Explore Active Roster</span>
                          <ArrowRight className="w-3.5 h-3.5 text-stone-750 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    )}
                    {!isScanning && !scanReport && (
                      <div className="space-y-4 py-6 text-center select-none flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-full border border-stone-800 flex items-center justify-center bg-stone-950/40 text-stone-400 mb-2"><Database className="w-5 h-5 text-amber-500" /></div>
                        <h4 className="font-display font-semibold text-[#FAF8F5] text-sm">Crawl Engines Standby</h4>
                        <p className="text-[11px] text-stone-400 leading-relaxed font-sans font-light mx-auto max-w-[180px]">Choose a targeted patrol locality area and category on the left, then click Patrol.</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section id="discovery-map-section" className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 px-1">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-widest text-amber-800 font-bold uppercase bg-amber-100/70 px-2.5 py-0.5 rounded border border-amber-200 shadow-2xs">Visual Coordinate Grid</span>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 tracking-tight">Discovery Map — Get Started</h2>
                    <p className="text-xs text-stone-500 max-w-xl font-sans font-light">Explore Shillong's premium hillside cafes and scenic trails.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#FAF8F5] border border-stone-200/70 p-4 md:p-6 rounded-[32px] shadow-sm">
                  <div className="lg:col-span-4 flex flex-col justify-between space-y-6 bg-white p-6 rounded-2xl border border-stone-150 shadow-2xs">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-800 font-bold"><Compass className="w-4 h-4" /></div>
                        <div><h3 className="text-sm font-display font-semibold text-stone-900">Guided Quick Start</h3><p className="text-[10px] text-stone-400 font-mono uppercase tracking-wider">Explorer Checklist</p></div>
                      </div>
                      <div className="space-y-3">
                        {[
                          { n: "Pick a Sub-Tab", d: "Toggle between Coffee Hubs and Scenic Trails inside the map coordinates." },
                          { n: "Target Localities", d: "Click pins on the map to display deep local profiles, user rating indices, and operating hours instantly." },
                          { n: "Ask Labet AI", d: "Need a secret itinerary? Hit Ask Labet to summon your contextual digital guide." }
                        ].map((s, i) => (
                          <div key={s.n} className="p-3 bg-stone-50/80 rounded-xl border border-stone-100 hover:border-amber-700/40 transition-colors flex items-start gap-2.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-amber-300 font-mono text-[9px] font-bold">{i + 1}</span>
                            <div className="space-y-0.5"><h4 className="text-xs font-display font-semibold text-stone-800">{s.n}</h4><p className="text-[10px] text-stone-500 leading-normal font-sans font-light">{s.d}</p></div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-stone-100 space-y-2">
                      <span className="text-[9px] font-mono tracking-widest text-stone-400 font-bold uppercase block">Quick-Focus Hubs</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[{ name: "Mawlai", id: "you-and-i-arts-cafe" }, { name: "Police Bazar", id: "trattoria-shillong" }, { name: "Upper Shillong", id: "ml-05-cafe-heritage" }, { name: "Boyce Road", id: "rynsan-cafe" }, { name: "Kench's Trace", id: "cherry-bean-cafe" }].map((district) => (
                          <button key={district.name} onClick={() => handleSelectCafe(district.id)} className="px-2 py-1 text-[10px] font-sans font-medium rounded-lg border border-stone-200 bg-white hover:border-amber-700/60 hover:bg-amber-50 text-stone-600 hover:text-amber-800 transition-all cursor-pointer">{district.name}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-stone-200 shadow-md bg-[#FAF8F5] p-1.5">
                    <div className="rounded-[14px] overflow-hidden h-[450px] md:h-[550px] lg:h-[580px]">
                      <InteractiveMap cafes={cafes} onSelectCafe={(c) => handleSelectCafe(c.id)} activeCafeId={selectedCafe?.id} />
                    </div>
                  </div>
                </div>
              </section>

              <div className="space-y-6">
                <div className="flex justify-between items-end px-1">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#8b5c1a] font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">The Editorial Hand</span>
                    <h2 className="text-2xl md:text-3xl font-display font-medium text-stone-900">Editor's Choice</h2>
                  </div>
                  <button onClick={() => setActiveTab("cafes")} className="text-xs text-amber-800 font-sans font-medium border-b border-amber-800 hover:text-amber-950 transition-colors pb-0.5 cursor-pointer">View Hearth Map →</button>
                </div>
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 gap-8 md:overflow-x-visible md:pb-0">
                  {cafes.slice(0, 3).map((cafe) => (
                    <div key={cafe.id} className="w-[305px] shrink-0 snap-center md:w-auto md:shrink md:snap-align-none">
                      <EditorsChoiceCard cafe={cafe} onViewDetails={handleSelectCafe} onOpenRoute={(routeId) => { setActiveTab("planners"); }} />
                    </div>
                  ))}
                </div>
              </div>

              <section id="discovery-categories-shelves" className="space-y-12">
                <div className="space-y-4">
                  <div className="px-1 border-l-4 border-amber-700 pl-3">
                    <h3 className="text-xl sm:text-2xl font-display font-medium text-stone-900 tracking-tight">Atmospheric Sourdough & Craft Roasters</h3>
                    <p className="text-xs text-stone-500 font-sans">Slow drip roasters, acoustic pine woods desks, and handcrafted mountain sourdough setups.</p>
                  </div>
                  <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 -mx-4 px-4 gap-6 select-none">
                    {cafes.filter(c => c.primary_category === "Cozy cafés" || c.vibeTags.some(t => /minimal|craft|coffee|roast|music|espresso/i.test(t))).slice(0, 5).map((cafe) => (
                      <div key={cafe.id} className="w-[300px] shrink-0 snap-center"><CafeCard cafe={cafe} onViewDetails={handleSelectCafe} /></div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#FAF8F5] border border-stone-200 rounded-3xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-xs">
                  <div className="md:col-span-5 h-[280px] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 relative">
                    <img src="https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=800" alt="Traditional Dohneiiong dish with roasted black sesame and wild ginger spices" className="w-full h-full object-cover select-none pointer-events-none" referrerPolicy="no-referrer" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-4 text-white">
                      <span className="text-[9px] font-mono font-bold tracking-widest text-[#E6AD4E] block uppercase">Heritage Cuisine Spotlight</span>
                      <p className="text-[11px] font-serif italic text-stone-200">Slow-simmered in hand-roasted wild black sesame.</p>
                    </div>
                  </div>
                  <div className="md:col-span-7 space-y-4">
                    <span className="inline-block text-[10px] font-mono tracking-widest text-[#8b5c1a] font-bold bg-amber-100/50 border border-amber-200 px-3 py-1 rounded">Indigenous Culinary Craft</span>
                    <h3 className="text-2xl md:text-3xl font-display font-medium text-stone-900 tracking-tight leading-none">Dohneiiong: True Black Sesame Heritage</h3>
                    <p className="text-stone-600 text-xs md:text-sm leading-relaxed font-sans font-light">Savor the complex earth tones of tender tribal slow-stewed pork belly cooked in a jet-black sauce of dry-ground indigenous sesame seed (Nei-long), local wild garlic, and wild hillside ginger.</p>
                    <div className="pt-2 flex flex-wrap gap-2">
                      <button onClick={() => setActiveTab("cuisine")} className="bg-amber-800 hover:bg-amber-900 text-white rounded-xl px-5 py-2.5 text-xs font-sans font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"><span>Explore Indigenous Cuisine Guide</span><ArrowRight className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleSelectCafe("rynsan-cafe")} className="text-xs text-stone-600 font-sans font-medium px-4 py-2.5 hover:text-amber-800 transition-colors">View Cozy Rynsan Hearth →</button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="px-1 border-l-4 border-emerald-700 pl-3">
                    <h3 className="text-xl sm:text-2xl font-display font-medium text-stone-900 tracking-tight">Authentic Jadoh & Sesame Traditional Kitchens</h3>
                    <p className="text-xs text-stone-500 font-sans">Celebrate local Khasi hearths serving authentic Dohneiiong, wild mushroom curries, and smoked pine meats.</p>
                  </div>
                  <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 -mx-4 px-4 gap-6 select-none font-sans">
                    {cafes.filter(c => c.khasi_food_available || c.vibeTags.some(t => /traditional|khasi|local|jadoh|indigenous/i.test(t))).slice(0, 5).map((cafe) => (
                      <div key={cafe.id} className="w-[300px] shrink-0 snap-center"><CafeCard cafe={cafe} onViewDetails={handleSelectCafe} /></div>
                    ))}
                  </div>
                </div>
              </section>

              <section id="trending-indicators" className="bg-stone-900 text-[#FAF8F5] rounded-[32px] p-8 border border-stone-850 relative overflow-hidden shadow-lg select-none">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-stone-800">
                  <div className="pt-4 md:pt-0 pb-4 md:pb-0"><span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold uppercase block mb-1">Registry Total</span><h3 className="text-3xl font-display font-bold">{cafes.length} Landmarks</h3><p className="text-[10px] text-stone-400 font-sans mt-1">Deduplicated across Meghalaya</p></div>
                  <div className="pt-4 md:pt-0 pb-4 md:pb-0"><span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold uppercase block mb-1">Mean Rating</span><h3 className="text-2xl font-display font-bold text-stone-100 flex items-center justify-center gap-1.5"><Star className="w-5 h-5 fill-amber-400 text-amber-600" /><span>{(cafes.reduce((acc, c) => acc + Number(c.rating || 4.2), 0) / cafes.length).toFixed(2)}</span></h3><p className="text-[10px] text-stone-400 font-sans mt-1 font-light">High public approval metric</p></div>
                  <div className="pt-4 md:pt-0 pb-4 md:pb-0"><span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold uppercase block mb-1">Total Reviews</span><h3 className="text-3xl font-display font-bold block pb-1">{cafes.reduce((acc, c) => acc + Number(c.user_ratings_total || 45), 0).toLocaleString()}</h3><p className="text-[10px] text-stone-400 font-sans mt-1">Aggregated reviews indices</p></div>
                  <div className="pt-4 md:pt-0 pb-4 md:pb-0 flex flex-col items-center justify-center"><span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold uppercase block mb-1">Patrol Range</span><h3 className="text-2xl font-display font-semibold text-stone-100 flex items-center justify-center gap-1.5"><Compass className="w-5 h-5 text-amber-500" /><span>6 Regions</span></h3><p className="text-[10px] text-stone-400 font-sans mt-1">All major Meghalaya hubs</p></div>
                </div>
              </section>

              <div className="bg-stone-900 text-stone-100 rounded-[32px] p-8 md:p-12 space-y-8 border border-stone-850 overflow-hidden relative shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 px-1">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold uppercase">Leisurely Exploration Trails</span>
                    <h2 className="text-2xl font-display font-medium text-stone-100">Scenic Walks & Cultural Districts</h2>
                  </div>
                  <button onClick={() => { setSelectedNeighborhoodId(NEIGHBORHOODS[0].id); setActiveTab("walks"); }} className="text-xs text-amber-400 font-sans font-medium border-b border-amber-400 hover:text-amber-300 pb-0.5 cursor-pointer">All Neighborhood Itineraries →</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {NEIGHBORHOODS.map((n) => (
                    <div key={n.id} onClick={() => { setSelectedNeighborhoodId(n.id); setActiveTab("walks"); }} className="border border-stone-800 bg-stone-950/45 p-5 rounded-2xl hover:border-amber-500 hover:-translate-y-1 cursor-pointer transition-all duration-300 space-y-4 shadow-sm group">
                      <div className="h-44 w-full rounded-xl overflow-hidden bg-stone-900 border border-stone-800">
                        <img src={n.image} alt={`Neighborhood walk for ${n.name}`} loading="lazy" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-display font-bold text-stone-100 text-base tracking-wide group-hover:text-amber-400 transition-colors">{n.name}</h3>
                        <p className="text-[11px] text-stone-400 font-sans leading-relaxed line-clamp-2">{n.itinerary.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
                <div className="md:col-span-4 space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold">Independent Publishing</span>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-stone-900 leading-tight">Latest Editorial Periodical Issues</h2>
                  <p className="text-stone-600 text-xs md:text-sm leading-relaxed font-sans font-light">Slip into our quiet review room to read notes on Shillong's celebrated local bakers, roasting cultivators, and rainfall routines.</p>
                  <button onClick={() => setActiveTab("guides")} className="inline-flex items-center gap-1.5 text-xs text-amber-800 font-sans font-semibold border-b border-amber-800 hover:text-amber-950 transition-colors pb-0.5 cursor-pointer pt-2">Enter Library Room →</button>
                </div>
                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 pb-2">
                  {ARTICLES.slice(0, 2).map((article) => (
                    <div key={article.id} onClick={() => setActiveTab("guides")} className="bg-[#FAF8F5] border border-stone-200/80 p-5 rounded-2xl cursor-pointer hover:border-stone-400 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group space-y-4">
                      <div className="h-40 w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                        <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                      </div>
                      <div className="space-y-1 px-1">
                        <span className="text-[9px] font-mono uppercase text-amber-800 tracking-wider">{article.category}</span>
                        <h4 className="font-display font-bold text-stone-900 text-xs sm:text-sm tracking-wide leading-snug group-hover:text-amber-800 transition-colors line-clamp-1">{article.title}</h4>
                        <p className="text-[11px] text-stone-500 font-sans leading-relaxed line-clamp-2">{article.excerpt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <section id="location-section" className="py-10 px-5 max-w-[1100px] mx-auto">
                <h2 className="text-3xl font-display font-medium text-stone-900 mb-2">Location</h2>
                <p className="text-stone-600 font-sans mb-5 text-sm">Find Shillong on Google Maps.</p>
                <div className="rounded-[18px] overflow-hidden shadow-lg border border-stone-200/40 bg-stone-50">
                  {hasValidKey ? (
                    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} version="weekly">
                      <div className="w-full h-[320px] md:h-[450px]">
                        <Map id="landing-shillong-map" defaultCenter={{ lat: 25.5788, lng: 91.8920 }} defaultZoom={13} gestureHandling="cooperative" disableDefaultUI={true} zoomControl={true} mapId="DEMO_MAP_ID" style={{ width: "100%", height: "100%" }}>
                          <AdvancedMarker position={{ lat: 25.5788, lng: 91.8920 }} title="Shillong, Meghalaya, India">
                            <Pin background="#854d0e" glyphColor="#fff" borderColor="#713f12" />
                          </AdvancedMarker>
                        </Map>
                      </div>
                    </APIProvider>
                  ) : (
                    <div className="w-full h-[320px] md:h-[450px] bg-stone-100 flex flex-col items-center justify-center p-6 text-center select-none">
                      <MapPin className="w-8 h-8 text-amber-800 mb-2 animate-bounce" />
                      <h4 className="font-display font-semibold text-stone-800 text-sm">Interactive Map Offline</h4>
                      <p className="text-xs text-stone-500 max-w-xs mt-1 font-sans font-light">Please insert your Google Maps Key to run the live Maps SDK view.</p>
                    </div>
                  )}
                </div>
              </section>
              </div>

              <div id="discovery-right-map-panel" className="hidden md:block flex-grow h-full relative min-w-0 bg-[#FAF8F5]">
                <InteractiveMap cafes={cafes} onSelectCafe={(c) => handleSelectCafe(c.id)} activeCafeId={selectedCafe?.id} hideSidebar={true} />
              </div>
            </motion.div>
          )}

          {activeTab === "trending" && (
            <motion.div key="trending-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8 pb-16">
              <TrendingDestination />
            </motion.div>
          )}

          {activeTab === "cafes" && (
            <motion.div key="cafes-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className={`h-full w-full flex flex-col ${cafeViewMode === "map" ? "overflow-hidden" : "overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-12 pb-16"}`}>
              {cafeViewMode !== "map" && (
                <>
                  <div className="text-center space-y-3">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#8b5c1a] font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">Curated Ranks</span>
                    <h2 className="text-3xl font-display font-medium tracking-tight text-stone-900 sm:text-4xl leading-none">The Cozy Cafés of Shillong</h2>
                    <p className="max-w-xl mx-auto text-sm text-stone-600 font-sans leading-relaxed">Filter by neighborhood name, acoustic music facilities, or read organic story profiles.</p>
                  </div>
                  <div className="bg-[#FAF8F5] border border-stone-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto shadow-xs">
                    <div className="relative flex-1 w-full bg-white border border-stone-200/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                      <Search className="w-4 h-4 text-stone-400 shrink-0" />
                      <input type="text" placeholder="Search cafes by name, mood, or tags..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent text-black outline-none w-full text-xs font-sans" />
                    </div>
                    <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 shrink-0 w-full sm:w-auto">
                      <button onClick={() => setCafeViewMode("grid")} className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer ${cafeViewMode === "grid" ? "bg-amber-800 text-white shadow-xs" : "text-stone-600 hover:text-stone-800"}`}><LayoutGrid className="w-3.5 h-3.5" /><span>Grid View</span></button>
                      <button onClick={() => setCafeViewMode("map")} className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer ${cafeViewMode === "map" ? "bg-amber-800 text-white shadow-xs" : "text-stone-600 hover:text-stone-800"}`}><MapPin className="w-3.5 h-3.5" /><span>Hearth Map</span></button>
                    </div>
                    <div className="font-mono text-[10px] uppercase text-stone-400 font-bold shrink-0">{filteredCafes.length} Landmarks Found</div>
                  </div>
                </>
              )}
              {filteredCafes.length === 0 ? (
                <div className="text-center space-y-3 py-10 bg-[#FAF8F5] border border-stone-200 rounded-2xl">
                  <p className="text-stone-400 font-sans italic">No mountain cafes match your tag search.</p>
                  <button onClick={() => setSearchQuery("")} className="bg-stone-800 hover:bg-stone-700 text-white text-xs px-4 py-2 rounded-lg font-sans cursor-pointer">Clear Search Query</button>
                </div>
              ) : cafeViewMode === "map" ? (
                <div className="flex-1 h-full w-full relative">
                  <div className="absolute top-[84px] md:top-[20px] right-4 z-30 pointer-events-auto">
                    <button onClick={() => setCafeViewMode("grid")} className="px-3.5 py-2.5 bg-stone-900 hover:bg-stone-950 text-amber-300 rounded-lg text-xs font-mono font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer border border-stone-800">
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Grid Directory</span>
                    </button>
                  </div>
                  <InteractiveMap cafes={filteredCafes} onSelectCafe={(cafe) => handleSelectCafe(cafe.id)} activeCafeId={selectedCafe?.id} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
                  {filteredCafes.map((cafe) => (
                    <CafeCard key={cafe.id} cafe={cafe} onViewDetails={handleSelectCafe} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "cuisine" && (
            <motion.div key="cuisine-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8 pb-16">
              <CuisineGuide />
            </motion.div>
          )}

          {activeTab === "walks" && (
            <motion.div key="walks-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8 pb-16">
              <NeighborhoodGuide onSelectCafe={handleSelectCafe} initialNeighborhoodId={selectedNeighborhoodId} cafes={cafes} />
            </motion.div>
          )}

          {activeTab === "planners" && (
            <motion.div key="planners-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8 pb-16">
              <PlannersGuide />
            </motion.div>
          )}

          {activeTab === "guides" && (
            <motion.div key="guides-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8 pb-16">
              <GuidesList />
            </motion.div>
          )}

          {activeTab === "about" && (
            <motion.div key="about-tab" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.35 }} className="h-full w-full overflow-y-auto p-4 sm:p-6 lg:p-8 pb-16">
              <AboutPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer id="main-footer" className="bg-stone-900 text-stone-400 text-xs font-sans pb-16 pt-10 border-t border-stone-800/80 mt-auto">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 pb-10 border-b border-stone-800/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <h3 className="text-stone-300 font-mono text-[10px] uppercase tracking-widest font-bold">Explore By Area</h3>
              <ul className="space-y-2 flex flex-col items-start">
                <li><button onClick={() => { selectDistrict("laitumkhrah"); }} className="hover:text-amber-400 transition-colors">Cafes in Laitumkhrah</button></li>
                <li><button onClick={() => { selectDistrict("police-bazaar"); }} className="hover:text-amber-400 transition-colors">Restaurants near Police Bazaar</button></li>
                <li><button onClick={() => { selectDistrict("golf-links"); }} className="hover:text-amber-400 transition-colors">Golf Links Cafes</button></li>
                <li><button onClick={() => { selectDistrict("boyce-road"); }} className="hover:text-amber-400 transition-colors">Boyce Road Coffee</button></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-stone-300 font-mono text-[10px] uppercase tracking-widest font-bold">By Category</h3>
              <ul className="space-y-2 flex flex-col items-start">
                <li><button onClick={() => handleQuickTagSearch("Rooftop")} className="hover:text-amber-400 transition-colors">Rooftop Cafes Shillong</button></li>
                <li><button onClick={() => handleQuickTagSearch("Live Music")} className="hover:text-amber-400 transition-colors">Live Music Cafes Shillong</button></li>
                <li><button onClick={() => handleQuickTagSearch("Romantic")} className="hover:text-amber-400 transition-colors">Romantic Cafes for Dates</button></li>
                <li><button onClick={() => handleQuickTagSearch("Work")} className="hover:text-amber-400 transition-colors">Work-Friendly Wifi Cafes</button></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-stone-300 font-mono text-[10px] uppercase tracking-widest font-bold">Cuisine Types</h3>
              <ul className="space-y-2 flex flex-col items-start">
                <li><button onClick={() => setActiveTab("cuisine")} className="hover:text-amber-400 transition-colors">Khasi Food Shillong</button></li>
                <li><button onClick={() => handleQuickTagSearch("Indigenous")} className="hover:text-amber-400 transition-colors">Traditional Khasi Restaurants</button></li>
                <li><button onClick={() => handleQuickTagSearch("Jadoh")} className="hover:text-amber-400 transition-colors">Best Jadoh Shillong</button></li>
                <li><button onClick={() => handleQuickTagSearch("Bakery")} className="hover:text-amber-400 transition-colors">Local Bakeries & Bread</button></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-stone-300 font-mono text-[10px] uppercase tracking-widest font-bold">Popular Curations</h3>
              <ul className="space-y-2 flex flex-col items-start">
                <li><button onClick={() => handleQuickTagSearch("Budget")} className="hover:text-amber-400 transition-colors">Budget Cafes Shillong</button></li>
                <li><button onClick={() => handleQuickTagSearch("Late Night")} className="hover:text-amber-400 transition-colors">Late-Night Food Shillong</button></li>
                <li><button onClick={() => handleQuickTagSearch("Hidden Gem")} className="hover:text-amber-400 transition-colors">Hidden Gems & Trails</button></li>
                <li><button onClick={() => setActiveTab("planners")} className="hover:text-amber-400 transition-colors">Shillong Food Guide 2026</button></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5 font-sans text-sm font-semibold tracking-wide text-stone-200">
            <div className="w-6 h-6 rounded-md overflow-hidden bg-white border border-stone-800">
              <img src={logoImage} alt="Shillong Cafe Map Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <span>Shillong Café Map © 2026</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 font-mono text-[10px] uppercase tracking-wider">
            <button onClick={() => setActiveTab("explore")} className="hover:text-stone-100 cursor-pointer">Explore Main</button>
            <button onClick={() => setActiveTab("cafes")} className="hover:text-stone-100 cursor-pointer">Cozy List</button>
            <button onClick={() => setActiveTab("cuisine")} className="hover:text-stone-100 cursor-pointer">Khasi Food</button>
            <button onClick={() => setActiveTab("planners")} className="hover:text-stone-100 cursor-pointer">Route Planner</button>
            <button onClick={() => setActiveTab("guides")} className="hover:text-stone-100 cursor-pointer">Editorial Periodicals</button>
            <button onClick={() => setActiveTab("about")} className="hover:text-stone-100 cursor-pointer">Owner Letter</button>
          </div>
          <p className="text-[10px] font-mono text-stone-500 leading-relaxed max-w-xs text-center md:text-right">Hand-drawn cartography and local independent review logs compiled inside Meghalaya's misty ridges.</p>
        </div>
      </footer>

      <AIGuideChat />

      <AnimatePresence>
        {selectedCafe && (
          <CafeDetailModal cafe={selectedCafe} onClose={() => handleSelectCafe(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {dataHubOpen && (
          <DataHubModal isOpen={dataHubOpen} onClose={() => setDataHubOpen(false)} onCafesUpdated={(updatedCafes) => setCafes(updatedCafes)} currentCafes={cafes} />
        )}
      </AnimatePresence>
    </div>
  );
}
