import React, { useState, useEffect } from "react";
import { Compass, Search, Feather, FileText, Heart, MapPin, Sparkles, BookOpen, Layers, Menu, X, ArrowRight, Database, LayoutGrid, RefreshCw, Star, Radio, Clock, Flame, Music, Crown, ArrowUpRight, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { CAFES, NEIGHBORHOODS, ARTICLES } from "./data";
import { Cafe } from "./types";
import { isFuzzyMatch } from "./utils";
import { getCustomCafesFromFirestore } from "./services/db";

// @ts-ignore
import logoImage from "./assets/images/shillong_cafe_logo_official.png";
// @ts-ignore
import heroVideo from "./assets/videos/hero.mp4";

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
import SEO, { PAGE_SEO } from "./components/SEO";
import { FAQBlock, faqPageSchema, ModuleSummary } from "./components/SEOExtras";
import { getPublicSiteSettings } from "./services/public-content";
import { SiteSettings } from "./services/admin-db";
import { GOOGLE_MAPS_API_KEY, hasValidKey } from "./config";

type TabType = "explore" | "cafes" | "cuisine" | "walks" | "planners" | "guides" | "about" | "trending";

// Shared FAQ datasets — used both for rendered <details> and JSON-LD FAQPage.
const FAQ_HOME = [
  { q: "What are the best cafés in Shillong?", a: "Cafe Shillong (Laitumkhrah), Dylan's Cafe (Dhankheti), Rynsan (Boyce Road) for Khasi food, ML 05 Cafe (NH 44) for highway views and Cherry Bean Cafe (Kench's Trace) for bakes consistently top local lists. Our map ranks 91 verified cafés across the city." },
  { q: "Where can I try authentic Khasi food in Shillong?", a: "Trattoria and Jadoh Stall near Police Bazaar are the most-cited Jadoh and Dohneiiong spots. Rynsan plates the same dishes in a sit-down format with live Ka Duitara music." },
  { q: "Which Shillong neighborhood is best for café-hopping?", a: "Laitumkhrah for student energy, vinyl shops and acoustic stages. Police Bazaar for street-food adjacency. Golf Links for quiet, pine-scented mornings." },
  { q: "Are there cafés in Shillong with live music?", a: "The Evening Club (Laitumkhrah), Cafe Shillong, Dylan's Cafe and Rynsan run regular acoustic and folk sets. Filter by 'Live Music' on the map." },
  { q: "Does the route planner cover places outside Shillong city?", a: "Yes. The Adventure Route Planner has 12 curated road-trips including Cherrapunji (Sohra), Dawki, Jowai, Mawsynram, Laitlum Canyons, Wei Sawdong, Umiam Lake and Guwahati." },
];

const FAQ_CUISINE = [
  { q: "What is Jadoh?", a: "Jadoh is the staple Khasi rice-and-pork dish — short-grain red hill rice slow-cooked in pork stock, ginger, shallots and mountain herbs. Best eaten with raw red onions and Lal-cha (unsweetened black tea)." },
  { q: "What is Dohneiiong?", a: "Dohneiiong is a Khasi pork curry slow-cooked in dry-roasted black sesame seeds (Nei-long), local ginger and peppercorns. Velvety, nutty, and unmistakably regional — best with steamed red rice." },
  { q: "What is Tungrymbai?", a: "Tungrymbai is fermented soybean paste slow-stewed with pork fat. Pungent, deep, traditional. Goes with red rice." },
  { q: "Where can I try Khasi food in Shillong?", a: "Trattoria, Jadoh Stall, Heritage Inn Kitchen, and Rynsan are the most-recommended kitchens. The cuisine tab links each dish to the cafés serving it." },
];

const FAQ_WALKS = [
  { q: "What's special about Laitumkhrah?", a: "Laitumkhrah is Shillong's student and music heart — elite schools, vinyl record stalls, acoustic cafés like Cafe Shillong, The Evening Club, Cherry Bean. Best walked late afternoon to dusk." },
  { q: "Is Police Bazaar walkable?", a: "Yes. The central circle is dense and energetic — Khasi handicraft stalls, Bhaichung Jadoh street food, Melody & Beans live music, and the heritage cathedral within 800 metres." },
  { q: "Why visit Golf Links?", a: "Quiet, misty, pine-shaded. Best for slow morning walks past botanical gardens. Fern & Mist Garden, ML 05 Cafe, and The Pine Loft are the anchor cafés." },
];

export default function App() {
  const [cafes, setCafes] = useState<Cafe[]>(CAFES);
  const [activeTab, setActiveTabState] = useState<TabType>("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dataHubOpen, setDataHubOpen] = useState(false);
  const [cafeViewMode, setCafeViewMode] = useState<"grid" | "map">("map");

  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanRegion, setScanRegion] = useState("Shillong");
  const [scanCategory, setScanCategory] = useState("cafes");
  const [scanReport, setScanReport] = useState<any | null>(null);

  // CMS-managed site settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  useEffect(() => {
    getPublicSiteSettings().then(setSiteSettings).catch(() => setSiteSettings(null));
  }, []);

  const heroVideoSrc = siteSettings?.heroVideoUrl || heroVideo;
  const logoSrc = siteSettings?.logoUrl || logoImage;

  // Global scroll-to-top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [activeTab]);

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

  const loadCafes = async () => {
    try {
      const res = await fetch("/api/cafes");
      if (!res.ok) throw new Error("HTTP status " + res.status);
      const apiCafes = await res.json();
      try {
        const firestoreCafes = await getCustomCafesFromFirestore();
        if (Array.isArray(firestoreCafes) && firestoreCafes.length > 0) {
          const publicFs = firestoreCafes.filter(
            (c: any) => c?.status !== "pending" && c?.publish_eligibility_status !== "pending"
          ).map((c: any) => {
            if (c.id === "alaya-cafe") {
              const localAlaya = apiCafes.find(ac => ac.id === "alaya-cafe");
              if (localAlaya) {
                return {
                  ...localAlaya,
                  images: c.images || localAlaya.images,
                  introduction: c.introduction || localAlaya.introduction,
                  mustTry: c.mustTry || localAlaya.mustTry,
                  gallery: c.gallery || localAlaya.gallery,
                  neighborhood: "Nongthymmai",
                  address: "Nongthymmai, Shillong, Meghalaya 793014",
                  coordinates: { lat: 25.5615, lng: 91.9025 },
                  vibeTags: localAlaya.vibeTags,
                  hasLiveMusic: true,
                  hasKhasiMusic: true,
                };
              }
            }
            return c;
          });
          const merged = [...publicFs];
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab") as TabType;
    if (tabParam && ["explore", "cafes", "cuisine", "walks", "planners", "guides", "about", "trending"].includes(tabParam)) {
      setActiveTabState(tabParam);
    }
    
    // Parse pathname for cafe slug (e.g. /cafe/the-living-roof)
    const path = window.location.pathname;
    const match = path.match(/^\/cafe\/([^/]+)/);
    const cafeslug = match ? match[1] : params.get("cafe");

    if (cafeslug && cafes.length > 0) {
      const found = cafes.find(c => c.id === cafeslug);
      if (found) {
        setSelectedCafe(found);
        setActiveTabState("explore");
      }
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
    if (url.pathname.startsWith("/cafe/")) {
      url.pathname = "/";
    }
    window.history.pushState({}, "", url);
  };

  const handleQuickTagSearch = (tag: string) => {
    setSearchQuery(tag);
    setActiveTab("cafes");
    setCafeViewMode("grid");
  };

  const handleSelectCafe = (cafeId: string | null) => {
    const url = new URL(window.location.href);
    if (!cafeId) {
      setSelectedCafe(null);
      url.searchParams.delete("cafe");
      if (url.pathname.startsWith("/cafe/")) {
        url.pathname = "/";
      }
    } else {
      const found = cafes.find((c) => c.id === cafeId);
      if (found) {
        setSelectedCafe(found);
        url.pathname = `/cafe/${cafeId}`;
        url.searchParams.delete("cafe");
        url.searchParams.set("tab", "explore");
      }
    }
    window.history.pushState({}, "", url);
  };

  const handleCloseCafe = () => {
    setSelectedCafe(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("cafe");
    if (url.pathname.startsWith("/cafe/")) {
      url.pathname = "/";
    }
    window.history.pushState({}, "", url);
  };

  const selectDistrict = (districtId: string) => {
    setSelectedNeighborhoodId(districtId);
    setActiveTab("walks");
  };

  const navigateToNeighborhood = (districtId: string) => {
    setSelectedNeighborhoodId(districtId);
    setActiveTab("walks");
  };

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
    const vibeTags = Array.isArray(cafe.vibeTags) ? cafe.vibeTags.join(" ") : "";
    const combinedTexts = `${cafe.name ?? ""} ${cafe.theme ?? ""} ${cafe.neighborhood ?? ""} ${vibeTags}`;
    return isFuzzyMatch(searchQuery, combinedTexts);
  });

  const tabsList = [
    { id: "explore", label: "Discovery" },
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

  const seoKey = activeTab === "planners" ? "discover" : activeTab;
  const seoMeta = PAGE_SEO[seoKey as keyof typeof PAGE_SEO] || PAGE_SEO.explore;
  const seoTitle = selectedCafe 
    ? `${selectedCafe.name} — Cozy Café in ${selectedCafe.neighborhood}` 
    : seoMeta.title;
  const seoDescription = selectedCafe 
    ? (selectedCafe.introduction || selectedCafe.tagline) 
    : seoMeta.description;

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={selectedCafe ? `https://shillongcafemap.in/?tab=cafes&cafe=${selectedCafe.id}` : seoMeta.canonical}
        schema={getDynamicSchema()}
      />
      
      <div className="min-h-screen bg-[#F5F2EB] text-stone-850 font-sans flex flex-col relative antialiased selection:bg-amber-800/20 selection:text-amber-900 w-full">
        {/* Subtle dot grid texture overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#8b5c1a_0.6px,transparent_0.6px)] [background-size:16px_16px] opacity-[0.04] pointer-events-none z-10" />

        {/* CMS-managed editorial banner */}
        {siteSettings?.bannerEnabled && siteSettings.bannerText && (
          <div className="relative z-50 bg-amber-800 text-amber-50 text-center text-xs font-sans font-medium tracking-wide px-4 py-2">
            {siteSettings.bannerText}
          </div>
        )}

        {/* === TOP NAVIGATION BAR === */}
        <header id="main-navbar" className="sticky top-0 z-40 bg-[#FAF8F5]/85 backdrop-blur-md border-b border-stone-200/80 w-full font-sans">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            {/* Logo and Branding */}
            <div
              onClick={() => setActiveTab("explore")}
              className="flex items-center gap-2.5 cursor-pointer leading-none group select-none"
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center border border-stone-200 shadow-xs bg-white transition-transform group-hover:scale-105 duration-300 shrink-0">
                <img src={logoSrc} alt="Shillong Cafe Map Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-display font-bold text-base tracking-wide text-stone-900">Shillong Café Map</p>
                <span className="text-[10px] font-mono tracking-widest text-[#8b5c1a] uppercase font-bold block">Editorial Hearth Guide</span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {tabsList.map((tab) => {
                const isActive = activeTab === tab.id || (tab.id === "walks" && selectedNeighborhoodId !== undefined && activeTab === "explore");
                return (
                  <button
                    key={tab.id}
                    id={`nav-tab-${tab.id}`}
                    onClick={() => {
                      if (tab.id === "walks") {
                        setSelectedNeighborhoodId(NEIGHBORHOODS[0].id);
                      }
                      setActiveTab(tab.id as TabType);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-sans tracking-wider font-semibold uppercase cursor-pointer relative transition-all ${
                      isActive
                        ? "text-amber-800 bg-amber-50"
                        : "text-stone-500 hover:text-stone-850 hover:bg-stone-100/65"
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabBadge"
                        className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-amber-800 rounded-full"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right side: Data Hub & Mobile Menu Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDataHubOpen(true)}
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono tracking-wider font-bold uppercase cursor-pointer border border-stone-200 hover:border-amber-700 bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-800 transition-all duration-300 shadow-2xs"
              >
                <Database className="w-3.5 h-3.5 text-[#8b5c1a]" />
                <span>Data Hub</span>
              </button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
              </button>
            </div>
          </div>

          {/* Mobile/Tablet Dropdown Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden border-t border-stone-200 bg-[#FAF8F5] overflow-hidden"
              >
                <nav className="p-4 flex flex-col gap-2">
                  {tabsList.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        if (tab.id === "walks") {
                          setSelectedNeighborhoodId(NEIGHBORHOODS[0].id);
                        }
                        setActiveTab(tab.id as TabType);
                        setMobileMenuOpen(false);
                      }}
                      className={`px-4 py-3 text-left rounded-lg text-xs font-sans font-medium tracking-wide uppercase ${
                        activeTab === tab.id ? "bg-amber-50 text-amber-855 text-amber-808" : "text-stone-500 hover:bg-stone-50"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setDataHubOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 mt-1.5 text-left rounded-lg text-xs font-mono font-bold tracking-wide uppercase text-amber-808 bg-amber-50 hover:bg-amber-100 flex items-center gap-2.5 border border-amber-200/60 font-sans"
                  >
                    <Database className="w-4 h-4 text-amber-705" />
                    <span>Data Hub Admin</span>
                  </button>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* === MAIN CONTENT === */}
        <main className={`flex-1 w-full min-h-0 flex flex-col relative`}>
          <AnimatePresence mode="wait">

            {/* EXPLORE TAB */}
            {activeTab === "explore" && (
              <motion.div
                key="explore-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-16"
              >
                {/* Dynamic Sweep Hero Section */}
                <div
                  style={{ backgroundColor: "#543d1b" }}
                  className="text-stone-100 rounded-3xl p-8 md:p-12 relative overflow-hidden border border-stone-800 shadow-xl flex flex-col md:flex-row items-center gap-10"
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-800/10 blur-[130px] pointer-events-none" />
                  <div className="flex-1 space-y-6 z-10 text-center md:text-left">
                    <span className="inline-flex items-center gap-1.5 bg-amber-900/40 text-amber-300 px-4 py-2 rounded-full text-[11px] font-mono font-bold tracking-widest uppercase border border-amber-600/30">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
                      Now Gathering Monsoons
                    </span>

                    <h1 className="text-4xl sm:text-5.5xl font-display font-bold text-stone-100 leading-tight tracking-tight">
                      The Heart of <br />the Hills
                    </h1>

                    <p className="text-sm md:text-base text-stone-300 max-w-md font-sans leading-relaxed font-light">
                      A Curated Chronicle of cozy hearths, acoustic circles, and culinary heritage in Shillong's misty ridges.
                    </p>

                    <p className="text-xs text-stone-400 max-w-md font-sans leading-relaxed">
                      A guide to the best cafés in Shillong, Khasi food like Jadoh and Dohneiiong, walkable districts (Laitumkhrah, Police Bazaar, Golf Links) and curated road-trip routes across Meghalaya.
                    </p>

                    {/* Curated Interactive Search */}
                    <div className="bg-[#FAF8F5] p-1.5 rounded-xl border border-stone-700/50 flex items-center gap-2 max-w-md shadow-lg">
                      <Search className="w-5 h-5 text-stone-400 shrink-0 ml-2" />
                      <input
                        id="hero-input"
                        type="text"
                        placeholder="Search cozy lofts, acoustic stages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setActiveTab("cafes");
                            setCafeViewMode("grid");
                          }
                        }}
                        className="flex-1 bg-transparent px-2 py-2.5 text-xs md:text-sm text-[#3d2817] placeholder:text-[#3d2817]/50 outline-none font-sans"
                      />
                      <button
                        onClick={() => {
                          setActiveTab("cafes");
                          setCafeViewMode("grid");
                        }}
                        className="bg-amber-800 text-white hover:bg-amber-900 px-4 py-2 rounded-lg text-xs font-sans font-semibold transition-colors cursor-pointer"
                      >
                        Find
                      </button>
                    </div>

                    {/* Suggestion tags */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 text-stone-400 text-[11px] font-mono">
                      <span className="font-semibold text-stone-400">Cozy Tags:</span>
                      {["Jazz Beats", "Book Heaven", "Greenhouse", "Rider Haven"].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleQuickTagSearch(tag)}
                          className="text-stone-300 hover:text-amber-400 transition-colors border-b border-stone-700 hover:border-amber-400 cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Visual Video */}
                  <div className="w-full md:w-[480px] shrink-0 h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl relative border border-stone-800 bg-stone-900">
                    <video
                      src={heroVideoSrc}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-stone-900/20 pointer-events-none" />
                    <div className="absolute top-4 left-4 font-mono text-[9px] bg-stone-900/60 backdrop-blur-md text-amber-200 px-2.5 py-1 rounded-sm border border-stone-700 uppercase tracking-widest font-bold">
                      Shillong in Motion
                    </div>
                  </div>
                </div>

                {/* Geographic Live Discovery Map Section */}
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 px-1">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#8b5c1a] font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Pine & Hearth Geography
                      </span>
                      <h2 className="text-2xl md:text-3xl font-display font-medium text-stone-900">
                        Discovery Hearth Map
                      </h2>
                      <p className="text-xs text-stone-500 max-w-xl font-sans font-light">
                        Navigate physical pine hills, misty valleys, and historic alleys using exact geolocated coordinates. Filter through traditional Khasi hearths, luxury banquets, and acoustic cellars.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-3xl overflow-hidden border border-stone-250 border-stone-200/80 shadow-md">
                    <InteractiveMap
                      cafes={cafes}
                      onSelectCafe={(c) => handleSelectCafe(c.id)}
                      activeCafeId={selectedCafe?.id}
                    />
                  </div>

                  <ModuleSummary
                    topic="What this map covers"
                    body={`${cafes.length} hand-picked cafés across Shillong's main neighborhoods — Laitumkhrah, Police Bazaar, Golf Links, Boyce Road, Nongkynrih, Kench's Trace and Dhankheti. Filter by Khasi cuisine, live music, rooftop, fine dining or local eats. Each pin links to a full café card with photos, hours, ratings and signature dishes like Jadoh and Dohneiiong.`}
                    links={[
                      { label: `Browse all ${cafes.length} cafés`, onClick: () => { setActiveTab("cafes"); setCafeViewMode("grid"); } },
                      { label: "Khasi food guide", onClick: () => setActiveTab("cuisine") },
                      { label: "Neighborhood walks", onClick: () => setActiveTab("walks") },
                      { label: "Meghalaya route planner", onClick: () => setActiveTab("planners") },
                    ]}
                  />
                </div>

                {/* Editor's Choice Highlights section */}
                <div className="space-y-6">
                  <div className="flex justify-between items-end px-1">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#8b5c1a] font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        The Editorial Hand
                      </span>
                      <h2 className="text-2xl md:text-3xl font-display font-medium text-stone-900">
                        Editor's Choice
                      </h2>
                    </div>
                    <button
                      onClick={() => setActiveTab("cafes")}
                      className="text-xs text-amber-800 font-sans font-medium border-b border-amber-800 hover:text-amber-950 transition-colors pb-0.5 cursor-pointer"
                    >
                      View Hearth Map →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {(() => {
                      const featuredCafes = cafes.filter(c => c.editorial_featured).slice(0, 3);
                      if (featuredCafes.length === 1) {
                        return (
                          <EditorsChoiceCard
                            key={featuredCafes[0].id}
                            cafe={featuredCafes[0]}
                            onViewDetails={(id) => handleSelectCafe(id)}
                            isFullWidth={true}
                          />
                        );
                      }
                      if (featuredCafes.length === 0) {
                        const fallbackCafes = cafes.slice(0, 3);
                        if (fallbackCafes.length === 1) {
                          return (
                            <EditorsChoiceCard
                              key={fallbackCafes[0].id}
                              cafe={fallbackCafes[0]}
                              onViewDetails={(id) => handleSelectCafe(id)}
                              isFullWidth={true}
                            />
                          );
                        }
                        return fallbackCafes.map(cafe => (
                          <EditorsChoiceCard key={cafe.id} cafe={cafe} onViewDetails={(id) => handleSelectCafe(id)} />
                        ));
                      }
                      return featuredCafes.map(cafe => (
                        <EditorsChoiceCard key={cafe.id} cafe={cafe} onViewDetails={(id) => handleSelectCafe(id)} />
                      ));
                    })()}
                  </div>
                </div>

                {/* FAQ Block */}
                <FAQBlock items={FAQ_HOME} title="Shillong cafés, Khasi food & routes — quick answers" />
              </motion.div>
            )}

            {/* COZY CAFES TAB */}
            {activeTab === "cafes" && (
              <motion.div
                key="cafes-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12"
              >
                <h1 className="sr-only">All Cafés in Shillong — Curated List &amp; Map</h1>
                <div className="text-center space-y-3">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#8b5c1a] font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    Curated Ranks
                  </span>
                  <h2 className="text-3xl font-display font-medium tracking-tight text-stone-900 sm:text-4.5xl leading-none">
                    The Cozy Cafés of Shillong
                  </h2>
                  <p className="max-w-xl mx-auto text-sm text-stone-600 font-sans leading-relaxed">
                    Filter by neighborhood name, acoustic music facilities, or read organic story profiles. Select any card to explore menu items and write active customer reviews.
                  </p>
                </div>

                {/* Dynamic Search & Results Control Panel */}
                <div className="bg-[#FAF8F5] border border-stone-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto shadow-xs animate-fade-in">
                  <div className="relative flex-1 w-full bg-white border border-stone-200/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                    <Search className="w-4 h-4 text-stone-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search cafes by name, mood, or tags (e.g., Laitumkhrah, minimal, scone)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent text-stone-850 outline-none w-full text-xs font-sans"
                    />
                  </div>

                  {/* View Mode Toggle Controls */}
                  <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200 shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => setCafeViewMode("grid")}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer ${
                        cafeViewMode === "grid"
                          ? "bg-amber-800 text-white shadow-xs"
                          : "text-stone-600 hover:text-stone-850"
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Grid View</span>
                    </button>
                    <button
                      onClick={() => setCafeViewMode("map")}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer ${
                        cafeViewMode === "map"
                          ? "bg-amber-800 text-white shadow-xs"
                          : "text-stone-600 hover:text-stone-850"
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Hearth Map</span>
                    </button>
                  </div>

                  {/* Counter */}
                  <div className="font-mono text-[10px] uppercase text-stone-400 font-bold shrink-0">
                    {filteredCafes.length} Landmarks Found
                  </div>
                </div>

                {/* Cafe Directory Grid / Map */}
                {filteredCafes.length === 0 ? (
                  <div className="text-center space-y-3 py-10 bg-[#FAF8F5] border border-stone-200 rounded-2xl animate-fade-in">
                    <p className="text-stone-400 font-sans italic">
                      No mountain cafes match your tag search. Speak to Kong Labet AI guide below to discover more secret trails!
                    </p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="bg-stone-800 hover:bg-stone-700 text-white text-xs px-4 py-2 rounded-lg font-sans cursor-pointer"
                    >
                      Clear Search Query
                    </button>
                  </div>
                ) : cafeViewMode === "map" ? (
                  <div className="rounded-3xl overflow-hidden border border-stone-200 shadow-lg">
                    <InteractiveMap 
                      cafes={filteredCafes} 
                      onSelectCafe={(cafe) => handleSelectCafe(cafe.id)} 
                      activeCafeId={selectedCafe?.id} 
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2 animate-fade-in">
                    {filteredCafes.map((cafe) => (
                      <CafeCard
                        key={cafe.id}
                        cafe={cafe}
                        onViewDetails={handleSelectCafe}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* CUISINE TAB */}
            {activeTab === "cuisine" && (
              <motion.div
                key="cuisine-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12"
              >
                <h1 className="sr-only">Khasi Food in Shillong — Jadoh, Dohneiiong, Tungrymbai &amp; Where to Eat</h1>
                <CuisineGuide />
                <FAQBlock items={FAQ_CUISINE} title="Khasi food in Shillong — common questions" />
              </motion.div>
            )}

            {/* WALKS TAB */}
            {activeTab === "walks" && (
              <motion.div
                key="walks-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12"
              >
                <h1 className="sr-only">Shillong Neighborhood Walks — Laitumkhrah, Police Bazaar, Golf Links</h1>
                <NeighborhoodGuide
                  cafes={cafes}
                  onSelectCafe={handleSelectCafe}
                  initialNeighborhoodId={selectedNeighborhoodId}
                />
                <FAQBlock items={FAQ_WALKS} title="Shillong neighborhoods — walker questions" />
              </motion.div>
            )}

            {/* PLANNERS TAB */}
            {activeTab === "planners" && (
              <motion.div
                key="planners-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12"
              >
                <h1 className="sr-only">Shillong &amp; Meghalaya Route Planner — Plan Your Adventure</h1>
                <PlannersGuide />
                <ModuleSummary
                  topic="What this planner covers"
                  body="12 curated road-trip routes radiating out of Shillong across Meghalaya: a 16-stop City Loop through Laitumkhrah and Police Bazaar, the 25-stop Cherrapunji circuit (Mawkdok, Nohkalikai, Mawsmai Caves, Double Decker Living Root Bridge), Dawki's crystal Umngot river, Jowai's monoliths and Phe Phe falls, Laitlum Canyons, Wei Sawdong, Mawsynram, Nongstoin, the Garo Hills via Tura, plus Umiam Lake and the Guwahati corridor. Toggle stops, see live drive distances, and export to Google Maps."
                  links={[
                    { label: "City Route", href: "https://shillongcafemap.in/?tab=planners&route=city" },
                    { label: "Cherrapunji Route", href: "https://shillongcafemap.in/?tab=planners&route=cherrapunji" },
                    { label: "Dawki Route", href: "https://shillongcafemap.in/?tab=planners&route=dawki" },
                    { label: "Laitlum Route", href: "https://shillongcafemap.in/?tab=planners&route=laitlum" },
                  ]}
                />
              </motion.div>
            )}

            {/* GUIDES TAB */}
            {activeTab === "guides" && (
              <motion.div
                key="guides-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12"
              >
                <h1 className="sr-only">Shillong Editorial — Stories, Reviews &amp; Culture</h1>
                <GuidesList />
              </motion.div>
            )}

            {/* ABOUT TAB */}
            {activeTab === "about" && (
              <motion.div
                key="about-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12"
              >
                <h1 className="sr-only">About Shillong Café Map</h1>
                <AboutPanel />
              </motion.div>
            )}

            {/* TRENDING TAB */}
            {activeTab === "trending" && (
              <motion.div
                key="trending-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-16"
              >
                <h1 className="sr-only">Sohra Trending Destination Guide</h1>
                <TrendingDestination />
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* Primary Footer */}
        <footer id="main-footer" className="bg-stone-900 text-stone-400 text-xs font-sans pb-16 pt-10 border-t border-stone-800/80 mt-12 bg-stone-950 mt-auto">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5 font-sans text-sm font-semibold tracking-wide text-stone-200">
              <div className="w-6 h-6 rounded-md overflow-hidden bg-white border border-stone-800">
                <img
                  src={logoSrc}
                  alt="Shillong Cafe Map Logo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span>Shillong Café Map © 2026</span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 font-mono text-[10px] uppercase tracking-wider">
              <button title="Home page with featured cafes, map & search" onClick={() => setActiveTab("explore")} className="hover:text-stone-100 cursor-pointer bg-transparent border-0 p-0">Explore Main</button>
              <button title="Adventure route planner with 12 curated road trips across Meghalaya" onClick={() => setActiveTab("planners")} className="hover:text-amber-400 cursor-pointer text-amber-600 bg-transparent border-0 p-0">Plan Your Adventure</button>
              <button title="Traditional Khasi dishes: Jadoh, Dohkhlieh & more" onClick={() => setActiveTab("cuisine")} className="hover:text-stone-100 cursor-pointer bg-transparent border-0 p-0">Khasi Food</button>
              <button title="Stories, reviews & cultural articles" onClick={() => setActiveTab("guides")} className="hover:text-stone-100 cursor-pointer bg-transparent border-0 p-0">Guides Periodic</button>
              <button title="About this project and the story behind the guide" onClick={() => setActiveTab("about")} className="hover:text-stone-100 cursor-pointer bg-transparent border-0 p-0">Owner Letter</button>
            </div>

            <p className="text-[10px] font-mono text-stone-500 leading-relaxed max-w-xs text-center md:text-right">
              Hand-drawn cartography and local independent review logs compiled inside Meghalaya's misty ridges.
            </p>
          </div>

          {/* SITEMAP */}
          <div className="max-w-7xl mx-auto mt-10 pt-8 border-t border-stone-700/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-stone-400 px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-[9px] font-mono uppercase tracking-widest text-amber-500 font-bold mb-3">🗺️ Sitemap — Browse</p>
              <ul className="space-y-1.5 text-[11px] font-sans">
                <li><button onClick={() => setActiveTab("explore")} className="hover:text-amber-400 cursor-pointer bg-transparent border-0 p-0">→ Discovery (Home)</button></li>
                <li><button onClick={() => setActiveTab("walks")} className="hover:text-amber-400 cursor-pointer bg-transparent border-0 p-0">→ District Walks (3)</button></li>
                <li><button onClick={() => setActiveTab("cuisine")} className="hover:text-amber-400 cursor-pointer bg-transparent border-0 p-0">→ Khasi Cuisine</button></li>
              </ul>
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-widest text-amber-500 font-bold mb-3">🧭 Sitemap — Plan</p>
              <ul className="space-y-1.5 text-[11px] font-sans">
                <li><button onClick={() => setActiveTab("planners")} className="hover:text-amber-400 cursor-pointer bg-transparent border-0 p-0">→ Adventure Routes (12)</button></li>
                <li><button onClick={() => { setActiveTab("planners"); }} className="hover:text-amber-400 cursor-pointer bg-transparent border-0 p-0">→ City Route</button></li>
                <li><button onClick={() => { setActiveTab("planners"); }} className="hover:text-amber-400 cursor-pointer bg-transparent border-0 p-0">→ Cherrapunji Route</button></li>
                <li><button onClick={() => { setActiveTab("planners"); }} className="hover:text-amber-400 cursor-pointer bg-transparent border-0 p-0">→ Dawki & More</button></li>
              </ul>
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-widest text-amber-500 font-bold mb-3">📖 Sitemap — Read</p>
              <ul className="space-y-1.5 text-[11px] font-sans">
                <li><button onClick={() => setActiveTab("guides")} className="hover:text-amber-400 cursor-pointer bg-transparent border-0 p-0">→ Editorial Stories</button></li>
                <li><button onClick={() => setActiveTab("about")} className="hover:text-amber-400 cursor-pointer bg-transparent border-0 p-0">→ About Chronicles</button></li>
                <li><button onClick={() => { document.getElementById("ai-chat-launcher")?.click(); }} className="hover:text-amber-400 cursor-pointer bg-transparent border-0 p-0">→ Ask Kong Labet (AI)</button></li>
                <li><button onClick={() => setDataHubOpen(true)} className="hover:text-amber-400 cursor-pointer bg-transparent border-0 p-0">→ Data Hub Admin</button></li>
              </ul>
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-widest text-amber-500 font-bold mb-3">🏔️ Neighborhoods</p>
              <ul className="space-y-1.5 text-[11px] font-sans">
                <li><button onClick={() => { setSelectedNeighborhoodId("laitumkhrah"); setActiveTab("walks"); }} className="hover:text-amber-400 cursor-pointer bg-transparent border-0 p-0">→ Laitumkhrah</button></li>
                <li><button onClick={() => { setSelectedNeighborhoodId("police-bazaar"); setActiveTab("walks"); }} className="hover:text-amber-400 cursor-pointer bg-transparent border-0 p-0">→ Police Bazaar</button></li>
                <li><button onClick={() => { setSelectedNeighborhoodId("golf-links"); setActiveTab("walks"); }} className="hover:text-amber-400 cursor-pointer bg-transparent border-0 p-0">→ Golf Links</button></li>
              </ul>
            </div>
          </div>
        </footer>

        {/* AI GUIDE CHAT */}
        <AIGuideChat />

        {/* CAFE DETAIL MODAL */}
        <AnimatePresence>
          {selectedCafe && (
            <CafeDetailModal cafe={selectedCafe} onClose={handleCloseCafe} />
          )}
        </AnimatePresence>

        {/* DATA HUB MODAL */}
        {dataHubOpen && (
          <DataHubModal
            isOpen={dataHubOpen}
            onClose={() => setDataHubOpen(false)}
            currentCafes={cafes}
            onCafesUpdated={setCafes}
          />
        )}
      </div>
    </>
  );
}
