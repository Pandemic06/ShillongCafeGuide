import React, { useState, useEffect } from "react";
import { Compass, Search, Feather, FileText, Heart, MapPin, Sparkles, BookOpen, Layers, Menu, X, ArrowRight, Database, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { CAFES, NEIGHBORHOODS, ARTICLES } from "./data";
import { Cafe } from "./types";

// @ts-ignore
import logoImage from "./assets/images/shillong_cafe_logo_1779948676706.png";
// @ts-ignore
import heroVideo from "./assets/videos/hero.mp4";

import CafeCard from "./components/CafeCard";
import CafeDetailModal from "./components/CafeDetailModal";
import NeighborhoodGuide from "./components/NeighborhoodGuide";
import CuisineGuide from "./components/CuisineGuide";
import GuidesList from "./components/GuidesList";
import AboutPanel from "./components/AboutPanel";
import AIGuideChat from "./components/AIGuideChat";
import DataHubModal from "./components/DataHubModal";
import InteractiveMap from "./components/GoogleMap";
import PlannersGuide from "./components/PlannersGuide";
import TrendingDestination from "./components/TrendingDestination";
import { getCustomCafesFromFirestore } from "./services/db";
import { getPublicSiteSettings } from "./services/public-content";
import { SiteSettings } from "./services/admin-db";
import SEO, { PAGE_SEO } from "./components/SEO";
import { FAQBlock, faqPageSchema, ModuleSummary } from "./components/SEOExtras";

// Shared FAQ datasets — used both for rendered <details> and JSON-LD FAQPage.
const FAQ_HOME = [
  { q: "What are the best cafés in Shillong?", a: "Cafe Shillong (Laitumkhrah), Dylan's Cafe (Dhankheti), Rynsan (Boyce Road) for Khasi food, ML 05 Cafe (NH 44) for highway views and Cherry Bean Cafe (Kench's Trace) for bakes consistently top local lists. Our map ranks 47 verified cafés across the city." },
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
  const [activeTab, setActiveTab] = useState<"explore" | "cafes" | "cuisine" | "walks" | "guides" | "about" | "discover" | "trending">("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic cafes database handles
  const [cafes, setCafes] = useState<Cafe[]>(CAFES);
  const [dataHubOpen, setDataHubOpen] = useState(false);
  const [cafeViewMode, setCafeViewMode] = useState<"grid" | "map">("map");

  // CMS-managed site settings (banner, featured cafés order). Loaded async,
  // public site renders defaults until the doc arrives.
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  useEffect(() => {
    getPublicSiteSettings().then(setSiteSettings).catch(() => setSiteSettings(null));
  }, []);

  // Admin-overridable brand media. Fall back to the bundled static imports.
  const heroVideoSrc = siteSettings?.heroVideoUrl || heroVideo;
  const logoSrc = siteSettings?.logoUrl || logoImage;

  // Global scroll-to-top on tab change (fixes Editorial-opens-at-bottom + menu nav scroll bugs)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [activeTab]);

  useEffect(() => {
    const loadCafes = async () => {
      try {
        const res = await fetch("/api/cafes");
        if (!res.ok) throw new Error("HTTP status " + res.status);
        const apiCafes: Cafe[] = await res.json();

        try {
          const firestoreCafes = await getCustomCafesFromFirestore();
          if (Array.isArray(firestoreCafes) && firestoreCafes.length > 0) {
            const publicFs = firestoreCafes.filter(
              (c: any) => c?.status !== "pending" && c?.publish_eligibility_status !== "pending"
            );
            const merged = [...publicFs];
            apiCafes.forEach((c) => {
              if (!merged.some((m) => m.id === c.id)) merged.push(c);
            });
            setCafes(merged);
            return;
          }
        } catch (err) {
          console.warn("Firestore custom cafes fetch failed, using API data:", err);
        }

        if (Array.isArray(apiCafes) && apiCafes.length > 0) setCafes(apiCafes);
      } catch (err) {
        console.error("Error loading cafes:", err);
      }
    };
    loadCafes();
  }, []);

  // CMS-pinned featured cafés get sorted to the front of the list.
  const sortedCafes = (() => {
    const featured = siteSettings?.featuredCafes || [];
    if (featured.length === 0) return cafes;
    const featuredSet = new Set(featured);
    const pinned = featured
      .map((id) => cafes.find((c) => c.id === id))
      .filter((c): c is Cafe => !!c);
    const rest = cafes.filter((c) => !featuredSet.has(c.id));
    return [...pinned, ...rest];
  })();

  const filteredCafes = sortedCafes.filter((cafe) => {
    if (activeTab === "cafes") {
      if (cafe.primary_category) {
        const isApproved = cafe.publish_eligibility_status === "approved";
        const isVerifiedFit = cafe.reviewer_decision === "Verified fit" || cafe.review_status === "Verified fit";
        const isCozy = cafe.primary_category === "Cozy cafés";
        const meetsThreshold = (cafe.theme_fit_confidence || 0) >= 70;
        if (!isApproved || !isVerifiedFit || (!isCozy && !meetsThreshold)) return false;
      }
    }
    const query = searchQuery.toLowerCase();
    return (
      cafe.name.toLowerCase().includes(query) ||
      cafe.theme.toLowerCase().includes(query) ||
      cafe.neighborhood.toLowerCase().includes(query) ||
      cafe.vibeTags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const handleSelectCafe = (cafeId: string) => {
    const found = cafes.find((c) => c.id === cafeId);
    if (found) {
      setSelectedCafe(found);
      const target = `/cafe/${cafeId}`;
      if (typeof window !== "undefined" && window.location.pathname !== target) {
        window.history.pushState({ cafeId }, "", target);
      }
    }
  };

  const handleCloseCafe = () => {
    setSelectedCafe(null);
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/cafe/")) {
      window.history.pushState({}, "", "/");
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || cafes.length === 0) return;
    const m = window.location.pathname.match(/^\/cafe\/([\w-]+)\/?$/);
    if (m) {
      const found = cafes.find((c) => c.id === m[1]);
      if (found) setSelectedCafe(found);
    }
    const onPop = () => {
      const m2 = window.location.pathname.match(/^\/cafe\/([\w-]+)\/?$/);
      if (m2) {
        const f = cafes.find((c) => c.id === m2[1]);
        setSelectedCafe(f || null);
      } else {
        setSelectedCafe(null);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [cafes]);

  const navigateToNeighborhood = (districtId: string) => {
    setSelectedNeighborhoodId(districtId);
    setActiveTab("cuisine");
  };

  const tabsList = [
    { id: "explore", label: "Discovery", tooltip: "Home page with featured cafes, map & search" },
    { id: "discover", label: "Plan Your Adventure", tooltip: "Adventure route planner with 12 curated road trips across Meghalaya" },
    { id: "trending", label: "🔥 Trending", tooltip: "Sohra (Cherrapunji) — the trending destination right now in Meghalaya" },
    { id: "cuisine", label: "Khasi Cuisine", tooltip: "Traditional Khasi dishes: Jadoh, Dohkhlieh, Tungrymbai & more" },
    { id: "walks", label: "District Walks", tooltip: "Guided walking itineraries through Shillong neighborhoods" },
    { id: "guides", label: "Editorial", tooltip: "Stories, reviews & cultural articles about Shillong" },
    { id: "about", label: "About Chronicles", tooltip: "About this project and the story behind the guide" },
  ];

  const handleQuickTagSearch = (tag: string) => {
    setSearchQuery(tag);
    setActiveTab("cafes");
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-stone-850 font-sans flex flex-col relative antialiased selection:bg-amber-800/20 selection:text-amber-900">
      <div className="absolute inset-0 bg-[radial-gradient(#8b5c1a_0.6px,transparent_0.6px)] [background-size:16px_16px] opacity-[0.04] pointer-events-none" />

      {siteSettings?.bannerEnabled && siteSettings.bannerText && (
        <div className="relative z-50 bg-amber-800 text-amber-50 text-center text-xs font-sans font-medium tracking-wide px-4 py-2">
          {siteSettings.bannerText}
        </div>
      )}

      <header id="main-navbar" className="sticky top-0 z-40 bg-[#FAF8F5]/85 backdrop-blur-md border-b border-stone-200/80">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div
            onClick={() => setActiveTab("explore")}
            className="flex items-center gap-2.5 cursor-pointer leading-none group select-none"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center border border-stone-200 shadow-xs bg-white transition-transform group-hover:scale-105 duration-300">
              <img
                src={logoSrc}
                alt="Shillong Cafe Map Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="font-display font-bold text-base tracking-wide text-stone-900">
                Shillong Café Map
              </p>
              <span className="text-[10px] font-mono tracking-widest text-amber-800 uppercase font-bold">
                Editorial Hearth Guide
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {tabsList.map((tab) => {
              const isActive = activeTab === tab.id || (tab.id === "walks" && selectedNeighborhoodId !== undefined && activeTab === "explore");
              return (
                <button
                  id={`nav-tab-${tab.id}`}
                  key={tab.id}
                  title={tab.tooltip}
                  onClick={() => {
                    if (tab.id === "walks") {
                      setSelectedNeighborhoodId(NEIGHBORHOODS[0].id);
                    }
                    setActiveTab(tab.id as any);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-sans tracking-wider font-semibold uppercase cursor-pointer relative transition-all ${
                    isActive || (tab.id === "walks" && activeTab === "walks")
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

          <div className="hidden md:flex items-center ml-2">
            <button
              title="Admin panel: enrich cafes from Google Places, sweep new venues, edit taxonomy"
              onClick={() => setDataHubOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono tracking-wider font-semibold uppercase cursor-pointer border border-stone-200 hover:border-amber-700 bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-800 transition-all duration-300 shadow-xs"
            >
              <Database className="w-3.5 h-3.5 text-amber-700" />
              <span>Data Hub</span>
            </button>
          </div>

          <div className="md:hidden">
            <button
              title={mobileMenuOpen ? "Close menu" : "Open navigation menu"}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-stone-200 bg-[#FAF8F5] overflow-hidden"
            >
              <nav className="p-4 flex flex-col gap-2">
                {tabsList.map((tab) => (
                  <button
                    key={tab.id}
                    title={tab.tooltip}
                    onClick={() => {
                      if (tab.id === "walks") {
                        setSelectedNeighborhoodId(NEIGHBORHOODS[0].id);
                      }
                      setActiveTab(tab.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-4 py-3 text-left rounded-lg text-xs font-sans font-medium tracking-wide uppercase ${
                      activeTab === tab.id
                        ? "bg-amber-50 text-amber-850 text-amber-800"
                        : "text-stone-500 hover:bg-stone-50"
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
                  className="px-4 py-3 mt-1.5 text-left rounded-lg text-xs font-mono font-bold tracking-wide uppercase text-amber-800 bg-amber-50 hover:bg-amber-100 flex items-center gap-2.5 border border-amber-200/60"
                >
                  <Database className="w-4 h-4 text-amber-700" />
                  <span>Data Hub Admin</span>
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Per-tab SEO sync */}
      <SEO
        title={(PAGE_SEO[activeTab as keyof typeof PAGE_SEO] || PAGE_SEO.explore).title}
        description={(PAGE_SEO[activeTab as keyof typeof PAGE_SEO] || PAGE_SEO.explore).description}
        canonical={(PAGE_SEO[activeTab as keyof typeof PAGE_SEO] || PAGE_SEO.explore).canonical}
        breadcrumbs={[
          { name: "Home", url: "https://shillongcafemap.in/" },
          ...(activeTab !== "explore"
            ? [{
                name: (PAGE_SEO[activeTab as keyof typeof PAGE_SEO] || PAGE_SEO.explore).title.split(" | ")[0].split(" — ")[0],
                url: (PAGE_SEO[activeTab as keyof typeof PAGE_SEO] || PAGE_SEO.explore).canonical,
              }]
            : []),
        ]}
        schema={
          activeTab === "explore"
            ? faqPageSchema(FAQ_HOME)
            : activeTab === "cuisine"
            ? faqPageSchema(FAQ_CUISINE)
            : activeTab === "walks"
            ? faqPageSchema(FAQ_WALKS)
            : activeTab === "trending"
            ? {
                "@type": "TouristDestination",
                name: "Sohra (Cherrapunji)",
                description: "World's wettest place — Nohkalikai Falls, Double Decker Living Root Bridge, Seven Sisters Falls, Mawsmai Cave.",
                url: "https://shillongcafemap.in/?tab=trending",
                touristType: ["Adventure", "Nature", "Cultural"],
                geo: { "@type": "GeoCoordinates", latitude: 25.2802, longitude: 91.7196 },
                containedInPlace: { "@type": "State", name: "Meghalaya", containedInPlace: { "@type": "Country", name: "India" } },
              }
            : activeTab === "cafes"
            ? {
                "@type": "ItemList",
                name: "Cafés in Shillong",
                numberOfItems: cafes.length,
                itemListElement: cafes.slice(0, 20).map((c, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  item: {
                    "@type": "CafeOrCoffeeShop",
                    name: c.name,
                    address: c.formatted_address || c.address,
                    image: c.images?.hero,
                    aggregateRating: c.rating
                      ? { "@type": "AggregateRating", ratingValue: c.rating, reviewCount: c.user_ratings_total || 1 }
                      : undefined,
                  },
                })),
              }
            : undefined
        }
      />

      {selectedCafe && (
        <SEO
          key={selectedCafe.id}
          title={`${selectedCafe.name} — ${selectedCafe.neighborhood} Café, Shillong`}
          description={`${selectedCafe.name}: ${(selectedCafe.tagline || selectedCafe.theme || "").slice(0, 120)}. Address, hours, photos, must-try dishes and reviews — part of Shillong Café Map.`}
          canonical={`https://shillongcafemap.in/cafe/${selectedCafe.id}`}
          image={
            selectedCafe.images?.hero?.startsWith("/")
              ? `https://shillongcafemap.in${selectedCafe.images.hero}`
              : selectedCafe.images?.hero
          }
          breadcrumbs={[
            { name: "Home", url: "https://shillongcafemap.in/" },
            { name: "Cafés", url: "https://shillongcafemap.in/?tab=cafes" },
            { name: selectedCafe.name, url: `https://shillongcafemap.in/cafe/${selectedCafe.id}` },
          ]}
          schema={{
            "@type": "CafeOrCoffeeShop",
            "@id": `https://shillongcafemap.in/cafe/${selectedCafe.id}#cafe`,
            name: selectedCafe.name,
            image: (selectedCafe.photos || [selectedCafe.images?.hero])
              .filter(Boolean)
              .slice(0, 6)
              .map((u) => (u.startsWith("/") ? `https://shillongcafemap.in${u}` : u)),
            description: selectedCafe.introduction || selectedCafe.tagline || selectedCafe.theme,
            url: `https://shillongcafemap.in/cafe/${selectedCafe.id}`,
            telephone: selectedCafe.phone_number,
            servesCuisine: selectedCafe.khasi_food_available
              ? ["Khasi", "Indian", "Café"]
              : ["Café", "Indian"],
            priceRange: selectedCafe.price_display || "₹₹",
            address: {
              "@type": "PostalAddress",
              streetAddress: selectedCafe.formatted_address || selectedCafe.address,
              addressLocality: "Shillong",
              addressRegion: "Meghalaya",
              addressCountry: "IN",
            },
            geo: selectedCafe.coordinates
              ? {
                  "@type": "GeoCoordinates",
                  latitude: selectedCafe.coordinates.lat,
                  longitude: selectedCafe.coordinates.lng,
                }
              : undefined,
            aggregateRating:
              selectedCafe.rating != null
                ? {
                    "@type": "AggregateRating",
                    ratingValue: selectedCafe.rating,
                    reviewCount: selectedCafe.user_ratings_total || 1,
                  }
                : undefined,
            openingHours: selectedCafe.opening_hours,
            hasMenu: (selectedCafe.mustTry || []).length
              ? {
                  "@type": "Menu",
                  hasMenuSection: {
                    "@type": "MenuSection",
                    name: "Must-try",
                    hasMenuItem: (selectedCafe.mustTry || []).map((m) => ({
                      "@type": "MenuItem",
                      name: m.name,
                      description: m.description,
                      offers: m.price ? { "@type": "Offer", price: String(m.price).replace(/[^\d]/g, ""), priceCurrency: "INR" } : undefined,
                    })),
                  },
                }
              : undefined,
          }}
        />
      )}

      <main className={`flex-1 w-full ${activeTab === "discover" ? "px-4 sm:px-6 lg:px-12 xl:px-20" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"} py-8 md:py-12`}>
        <AnimatePresence mode="wait">

          {activeTab === "trending" && (
            <motion.div
              key="trending-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <TrendingDestination />
            </motion.div>
          )}

          {activeTab === "explore" && (
            <motion.div
              key="explore-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-16"
            >
              {/* Dynamic Sweep Hero Section */}
              <div
                style={{ backgroundColor: "#543d1b" }}
                className="text-stone-100 rounded-3xl p-8 md:p-12 relative overflow-hidden border border-stone-800 shadow-xl flex flex-col md:flex-row items-center gap-10"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-800/10 blur-[130px] pointer-events-none" />

                <div className="flex-1 space-y-6 z-10 text-center md:text-left">
                  <span className="inline-flex items-center gap-1.5 bg-amber-850/25 bg-amber-900/40 text-amber-400 px-4 py-2 rounded-full text-[11px] font-mono font-bold tracking-widest uppercase border border-amber-600/30">
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

                  <div className="bg-[#FAF8F5] p-1.5 rounded-xl border border-stone-700/50 flex items-center gap-2 max-w-md shadow-lg">
                    <Search className="w-5 h-5 text-stone-400 shrink-0 ml-2" />
                    <input
                      id="hero-input"
                      type="text"
                      placeholder="Search cozy lofts, acoustic stages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") setActiveTab("cafes");
                      }}
                      className="flex-1 bg-transparent px-2 py-2.5 text-xs md:text-sm text-[#3d2817] placeholder:text-[#3d2817]/50 outline-none font-sans"
                    />
                    <button
                      onClick={() => setActiveTab("cafes")}
                      className="bg-amber-800 text-white hover:bg-amber-900 px-4 py-2 rounded-lg text-xs font-sans font-semibold transition-colors cursor-pointer"
                    >
                      Find
                    </button>
                  </div>

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

                <div className="w-full md:w-[480px] shrink-0 h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl relative border border-stone-800 bg-stone-900">
                  <video
                    src={heroVideoSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-stone-900/10 rounded-2xl pointer-events-none" />
                </div>
              </div>

              {/* Trending Sohra CTA Banner */}
              <div
                className="rounded-2xl border border-amber-200/60 bg-gradient-to-r from-amber-50 to-emerald-50 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setActiveTab("trending")}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <p className="font-bold text-stone-900 text-sm">Trending: Sohra (Cherrapunji)</p>
                    <p className="text-xs text-stone-500 mt-0.5">Nohkalikai Falls · Double Decker Root Bridge · Mawsmai Cave · Curated routes from Shillong</p>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 bg-amber-800 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-amber-900 transition-colors shrink-0">
                  Explore Sohra <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* AI Guide Section */}
              <AIGuideChat cafes={cafes} />

              {/* Featured Cafes Grid */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-stone-900">Featured Hearths</h2>
                    <p className="text-stone-500 text-sm mt-0.5">Curated cafés for every mood in Shillong</p>
                  </div>
                  <button
                    onClick={() => setActiveTab("cafes")}
                    className="flex items-center gap-1.5 text-amber-800 hover:text-amber-900 text-xs font-semibold transition-colors"
                  >
                    View all <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sortedCafes.slice(0, 6).map((cafe) => (
                    <CafeCard
                      key={cafe.id}
                      cafe={cafe}
                      onClick={() => handleSelectCafe(cafe.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Neighborhood quick-access */}
              <div>
                <h2 className="font-display text-2xl font-bold text-stone-900 mb-6">Explore by District</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {NEIGHBORHOODS.slice(0, 3).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => {
                        setSelectedNeighborhoodId(n.id);
                        setActiveTab("walks");
                      }}
                      className="text-left bg-white rounded-2xl p-5 border border-stone-200 hover:border-amber-300 hover:shadow-md transition-all group"
                    >
                      <div className="text-2xl mb-2">{n.emoji || "🏘️"}</div>
                      <h3 className="font-bold text-stone-900 group-hover:text-amber-800 transition-colors">{n.name}</h3>
                      <p className="text-xs text-stone-500 mt-1 line-clamp-2">{n.tagline}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* FAQ Block for SEO */}
              <FAQBlock faqs={FAQ_HOME} title="Frequently Asked Questions" />
            </motion.div>
          )}

          {activeTab === "cafes" && (
            <motion.div
              key="cafes-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl font-bold text-stone-900">All Cafés</h2>
                  <p className="text-stone-500 text-sm mt-1">{filteredCafes.length} cafés across Shillong</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Search cafés..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 placeholder:text-stone-400 outline-none focus:border-amber-400 transition-colors w-48"
                    />
                  </div>
                  <button
                    onClick={() => setCafeViewMode(cafeViewMode === "grid" ? "map" : "grid")}
                    className="p-2 bg-white border border-stone-200 rounded-xl text-stone-600 hover:border-amber-400 transition-colors"
                    title={cafeViewMode === "grid" ? "Switch to map view" : "Switch to grid view"}
                  >
                    {cafeViewMode === "grid" ? <MapPin className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {cafeViewMode === "map" ? (
                <InteractiveMap
                  cafes={filteredCafes}
                  onSelectCafe={handleSelectCafe}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredCafes.map((cafe) => (
                    <CafeCard
                      key={cafe.id}
                      cafe={cafe}
                      onClick={() => handleSelectCafe(cafe.id)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "cuisine" && (
            <motion.div
              key="cuisine-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <CuisineGuide />
              <FAQBlock faqs={FAQ_CUISINE} title="Khasi Cuisine FAQ" />
            </motion.div>
          )}

          {activeTab === "walks" && (
            <motion.div
              key="walks-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <NeighborhoodGuide
                neighborhoods={NEIGHBORHOODS}
                selectedId={selectedNeighborhoodId}
                onSelect={setSelectedNeighborhoodId}
              />
              <FAQBlock faqs={FAQ_WALKS} title="District Walks FAQ" />
            </motion.div>
          )}

          {activeTab === "guides" && (
            <motion.div
              key="guides-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <GuidesList articles={ARTICLES} onSelectCafe={handleSelectCafe} />
            </motion.div>
          )}

          {activeTab === "about" && (
            <motion.div
              key="about-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <AboutPanel />
            </motion.div>
          )}

          {activeTab === "discover" && (
            <motion.div
              key="discover-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <PlannersGuide />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Cafe Detail Modal */}
      <AnimatePresence>
        {selectedCafe && (
          <CafeDetailModal
            cafe={selectedCafe}
            onClose={handleCloseCafe}
          />
        )}
      </AnimatePresence>

      {/* Data Hub Modal */}
      <DataHubModal
        isOpen={dataHubOpen}
        onClose={() => setDataHubOpen(false)}
        cafes={cafes}
        onCafesUpdated={setCafes}
      />
    </div>
  );
}
