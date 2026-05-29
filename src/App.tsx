import React, { useState, useEffect } from "react";
import { Compass, Search, Feather, FileText, Heart, MapPin, Sparkles, BookOpen, Layers, Menu, X, ArrowRight, Database, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { CAFES, NEIGHBORHOODS, ARTICLES } from "./data";
import { Cafe } from "./types";

// @ts-ignore
import logoImage from "./assets/images/shillong_cafe_logo_1779948676706.png";

import CafeCard from "./components/CafeCard";
import CafeDetailModal from "./components/CafeDetailModal";
import NeighborhoodGuide from "./components/NeighborhoodGuide";
import CuisineGuide from "./components/CuisineGuide";
import GuidesList from "./components/GuidesList";
import AboutPanel from "./components/AboutPanel";
import AIGuideChat from "./components/AIGuideChat";
import DataHubModal from "./components/DataHubModal";
import InteractiveMap from "./components/GoogleMap";

export default function App() {
  const [activeTab, setActiveTab] = useState<"explore" | "cafes" | "cuisine" | "walks" | "guides" | "about">("explore");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [selectedNeighborhoodId, setSelectedNeighborhoodId] = useState<string | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic cafes database handles
  const [cafes, setCafes] = useState<Cafe[]>(CAFES);
  const [dataHubOpen, setDataHubOpen] = useState(false);
  const [cafeViewMode, setCafeViewMode] = useState<"grid" | "map">("map");

  useEffect(() => {
    fetch("/api/cafes")
      .then((res) => {
        if (!res.ok) throw new Error("HTTP status " + res.status);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCafes(data);
        }
      })
      .catch((err) => console.error("Error loading cafes from database API:", err));
  }, []);

  // Filter cafes based on search and strict category rules for public view
  const filteredCafes = cafes.filter((cafe) => {
    // Under Cozy Cafés tab, apply taxonomy content guidelines if primary category is declared
    if (activeTab === "cafes") {
      if (cafe.primary_category) {
        const isApproved = cafe.publish_eligibility_status === "approved";
        const isVerifiedFit = cafe.reviewer_decision === "Verified fit" || cafe.review_status === "Verified fit";
        const isCozy = cafe.primary_category === "Cozy cafés";
        const meetsThreshold = (cafe.theme_fit_confidence || 0) >= 70; // 70% confidence threshold

        if (!isApproved || !isVerifiedFit || (!isCozy && !meetsThreshold)) {
          return false;
        }
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
    }
  };

  const navigateToNeighborhood = (districtId: string) => {
    setSelectedNeighborhoodId(districtId);
    setActiveTab("cuisine"); // Sticking to "cuisine" walkthrough or let's navigate to "cuisine"
    // Wait, let's look at Tab mappings: Neighborhood Walkthrough is inside its own panel in App.tsx or inside CuisineGuide or we can render it directly!
    // Ah, let's make it so Laitumkhrah goes to Cuisine/Walkthrough tab. Wait, we can toggle our view cleanly.
    // Let's create a dedicated Tab or combine Walkthrough with Cuisine/Hearth guide. Let's make sure our tabs include:
    // Tab 1: "Explore Hearth" (Home)
    // Tab 2: "All Cafes"
    // Tab 3: "Neighborhood Walks" (NeighborhoodGuides)
    // Tab 4: "Traditional Cuisine" (Khasi Food Guide)
    // Tab 5: "Editorial Guides" (stories/newsletters)
    // Tab 6: "Story & About"
  };

  // Setup tabs
  const tabsList = [
    { id: "explore", label: "Discovery" },
    { id: "cafes", label: "Cozy Cafés" },
    { id: "cuisine", label: "Khasi Cuisine" },
    { id: "walks", label: "District Walks" },
    { id: "guides", label: "Editorial" },
    { id: "about", label: "About Chronicles" }
  ];

  // Helper for rendering search placeholder items
  const handleQuickTagSearch = (tag: string) => {
    setSearchQuery(tag);
    setActiveTab("cafes");
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-stone-850 font-sans flex flex-col relative antialiased selection:bg-amber-800/20 selection:text-amber-900">
      {/* Visual background mist texture overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#8b5c1a_0.6px,transparent_0.6px)] [background-size:16px_16px] opacity-[0.04] pointer-events-none" />

      {/* Primary Header/Navbar (Layout 1) */}
      <header id="main-navbar" className="sticky top-0 z-40 bg-[#FAF8F5]/85 backdrop-blur-md border-b border-stone-200/80">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo Brand Brand */}
          <div
            onClick={() => setActiveTab("explore")}
            className="flex items-center gap-2.5 cursor-pointer leading-none group select-none"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center border border-stone-200 shadow-xs bg-white transition-transform group-hover:scale-105 duration-300">
              <img
                src={logoImage}
                alt="Shillong Cafe Map Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="font-display font-bold text-base tracking-wide text-stone-900">
                Shillong Café Map
              </h1>
              <span className="text-[10px] font-mono tracking-widest text-amber-800 uppercase font-bold">
                Editorial Hearth Guide
              </span>
            </div>
          </div>

          {/* Desktop Tab Links */}
          <nav className="hidden md:flex items-center gap-1">
            {tabsList.map((tab) => {
              const isActive = activeTab === tab.id || (tab.id === "walks" && selectedNeighborhoodId !== undefined && activeTab === "explore");
              return (
                <button
                  id={`nav-tab-${tab.id}`}
                  key={tab.id}
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

          {/* Desktop Data Hub Action */}
          <div className="hidden md:flex items-center ml-2">
            <button
              onClick={() => setDataHubOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono tracking-wider font-semibold uppercase cursor-pointer border border-stone-200 hover:border-amber-700 bg-white hover:bg-amber-50 text-stone-700 hover:text-amber-800 transition-all duration-300 shadow-xs"
            >
              <Database className="w-3.5 h-3.5 text-amber-700" />
              <span>Data Hub</span>
            </button>
          </div>

          {/* Mobile hamburger menu */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
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

                {/* Mobile Admin Data Hub Button */}
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

      {/* Main Container Wrapper */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {activeTab === "explore" && (
            /* EXPLORE HOME VIEW */
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
                {/* Background blurred mist effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-800/10 blur-[130px] pointer-events-none" />

                {/* Left Information */}
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
                        }
                      }}
                      className="flex-1 bg-transparent px-2 py-2.5 text-xs md:text-sm text-stone-850 outline-none font-sans"
                    />
                    <button
                      onClick={() => setActiveTab("cafes")}
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

                {/* Right Visual Image */}
                <div className="w-full md:w-80 shrink-0 h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl relative border border-stone-800">
                  <img
                    src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800"
                    alt="Cozy mist cafe window view"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-stone-900/35" />
                  <div className="absolute top-4 left-4 font-mono text-[9px] bg-stone-900/60 backdrop-blur-md text-amber-200 px-2.5 py-1 rounded-sm border border-stone-700 uppercase tracking-widest font-bold">
                    Rynsan Valley Elevation
                  </div>
                </div>
              </div>

              {/* Geographic Live Discovery Map Section */}
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 px-1">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
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
              </div>

              {/* Editor's Choice Highlights section (Layout 1: Editor's choice) */}
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

                {/* Editor Choice 3-Column Bento List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {cafes.slice(0, 3).map((cafe) => (
                    <CafeCard
                      key={cafe.id}
                      cafe={cafe}
                      onViewDetails={handleSelectCafe}
                    />
                  ))}
                </div>
              </div>

              {/* Traditional Khasi Cuisine spotlight callout (Layout 1: Spotlight) */}
              <div className="bg-[#FAF8F5] border border-stone-200 rounded-3xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-xs">
                {/* Visual Left 5 */}
                <div className="md:col-span-5 h-72 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                  <img
                    src="https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=800"
                    alt="Traditional Dohneiiong dish with sesame"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Info Right 7 */}
                <div className="md:col-span-7 space-y-4">
                  <span className="inline-block text-[10px] font-mono tracking-widest text-amber-800 uppercase font-bold bg-amber-50 px-2.5 py-1 rounded">
                    Indigenous Spotlight
                  </span>
                  <h3 className="text-2xl md:text-3.5xl font-display font-bold text-stone-905 tracking-tight leading-none text-stone-900">
                    Dohneiiong: Black Sesame Heritage Spot
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed font-sans font-light">
                    Savor the earthy, complex deep flavors of slow-stewed pork belly simmered gently in a jet-black gravy of hand-roasted whole black sesame seed (Nei-long), local wild ginger, and peppercorns. It is a masterpiece of Northeast Indian tribal cuisine.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveTab("cuisine")}
                      className="bg-amber-850 hover:bg-amber-800 bg-amber-800 text-white rounded-lg px-5 py-2.5 text-xs font-sans font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>Explore Khasi Foods</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleSelectCafe("rynsan-cafe")}
                      className="text-xs text-stone-600 font-sans font-medium px-4 py-2.5 hover:text-amber-800 transition-colors"
                    >
                      Find Sourdough Toast Partner →
                    </button>
                  </div>
                </div>
              </div>

              {/* District Walks summary listing sections (Layout 1) */}
              <div className="bg-stone-900 text-stone-100 rounded-3xl p-8 space-y-8 border border-stone-800 overflow-hidden relative shadow-lg">
                <div className="absolute top-0 right-0 w-44 h-44 opacity-[0.03] pointer-events-none transform translate-x-12 -translate-y-12">
                  <Layers className="w-44 h-44 text-amber-500" />
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 px-1">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono tracking-widest text-amber-400 font-bold uppercase">
                      Scenic Itineraries
                    </span>
                    <h3 className="text-2xl font-display font-bold text-stone-100">
                      Walk Through districts
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedNeighborhoodId(NEIGHBORHOODS[0].id);
                      setActiveTab("walks");
                    }}
                    className="text-xs text-amber-400 font-sans font-medium border-b border-amber-400 hover:text-amber-300 pb-0.5"
                  >
                    All Walks Timeline →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {NEIGHBORHOODS.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setSelectedNeighborhoodId(n.id);
                        setActiveTab("walks");
                      }}
                      className="border border-stone-800 bg-stone-950/60 p-6 rounded-2xl hover:border-amber-500 hover:-translate-y-1 cursor-pointer transition-all duration-300 space-y-4 shadow-sm relative group"
                    >
                      <div className="h-44 w-full rounded-xl overflow-hidden bg-stone-900 border border-stone-800">
                        <img
                          src={n.image}
                          alt={n.name}
                          className="w-full h-full object-cover opacity-85 group-hover:scale-103 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="font-display font-bold text-stone-100 text-md tracking-wide group-hover:text-amber-400 transition-colors">
                          {n.name}
                        </h4>
                        <p className="text-[11px] text-stone-400 font-sans leading-relaxed line-clamp-2 italic">
                          {n.itinerary.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest Guides section overview cards */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2">
                <div className="md:col-span-4 space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-808 text-amber-800 font-bold">
                    Independent Publishing
                  </span>
                  <h3 className="text-2.5xl md:text-3xl font-display font-bold text-stone-900 leading-tight">
                    Latest Editorial Periodic Issues
                  </h3>
                  <p className="text-stone-600 text-xs md:text-sm leading-relaxed font-sans font-light">
                    Slip into our quiet review room to read notes on Shillong's celebrated local bakers, roasting cultivators, and rainfall routines.
                  </p>
                  <button
                    onClick={() => setActiveTab("guides")}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-800 font-sans font-semibold border-b border-amber-800 hover:text-amber-950 transition-colors pb-0.5 cursor-pointer pt-2"
                  >
                    Enter Library Room →
                  </button>
                </div>

                <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 pb-2">
                  {ARTICLES.slice(0, 2).map((article) => (
                    <div
                      key={article.id}
                      onClick={() => setActiveTab("guides")}
                      className="bg-[#FAF8F5] border border-stone-200/80 p-5 rounded-2xl cursor-pointer hover:border-stone-400 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group space-y-4"
                    >
                      <div className="h-40 w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="space-y-1 px-1">
                        <span className="text-[9px] font-mono uppercase text-amber-800 tracking-wider">
                          {article.category}
                        </span>
                        <h4 className="font-display font-bold text-stone-900 text-xs sm:text-sm tracking-wide leading-snug group-hover:text-amber-800 transition-colors line-clamp-1">
                          {article.title}
                        </h4>
                        <p className="text-[11px] text-stone-500 font-sans leading-relaxed line-clamp-2">
                          {article.excerpt}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "cafes" && (
            /* COZY CAFES DIRECTORY TABS */
            <motion.div
              key="cafes-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-12"
            >
              <div className="text-center space-y-3">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#8b5c1a] font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Curated Ranks
                </span>
                <h2 className="text-3xl font-display font-medium tracking-tight text-stone-905 text-stone-900 sm:text-4.5xl leading-none">
                  The Cozy Cafés of Shillong
                </h2>
                <p className="max-w-xl mx-auto text-sm text-stone-605 text-stone-600 font-sans leading-relaxed">
                  Filter by neighborhood name, acoustic music facilities, or read organic story profiles. Select any card to explore menu items and write active customer reviews.
                </p>
              </div>

              {/* Dynamic Search & Results */}
              <div className="bg-[#FAF8F5] border border-stone-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto shadow-xs animate-fade-in">
                {/* Search text */}
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

              {/* Cafe Directory Grid and Filters */}
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
                /* INTERACTIVE LEAFLET GRAPHICAL MAP VIEW */
                <InteractiveMap 
                  cafes={filteredCafes} 
                  onSelectCafe={(cafe) => handleSelectCafe(cafe.id)} 
                  activeCafeId={selectedCafe?.id} 
                />
              ) : (
                /* STANDARD IMAGE GRID VIEW */
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

          {activeTab === "cuisine" && (
            /* TRADITIONAL KHASI CUISINE TAB */
            <motion.div
              key="cuisine-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <CuisineGuide />
            </motion.div>
          )}

          {activeTab === "walks" && (
            /* SCENIC WALKS TAB */
            <motion.div
              key="walks-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <NeighborhoodGuide
                onSelectCafe={handleSelectCafe}
                initialNeighborhoodId={selectedNeighborhoodId}
                cafes={cafes}
              />
            </motion.div>
          )}

          {activeTab === "guides" && (
            /* EDITORIAL PERIODICAL PUBLICATIONS */
            <motion.div
              key="guides-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <GuidesList />
            </motion.div>
          )}

          {activeTab === "about" && (
            /* ABOUT STORY & CONTACT PANEL */
            <motion.div
              key="about-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
            >
              <AboutPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Primary Footer (Layout 1) */}
      <footer id="main-footer" className="bg-stone-900 text-stone-400 text-xs font-sans pb-16 pt-10 border-t border-stone-800/80 mt-12 bg-stone-950 mt-auto">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5 font-sans text-sm font-semibold tracking-wide text-stone-200">
            <div className="w-6 h-6 rounded-md overflow-hidden bg-white border border-stone-800">
              <img
                src={logoImage}
                alt="Shillong Cafe Map Logo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span>Shillong Café Map © 2026</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 font-mono text-[10px] uppercase tracking-wider">
            <button onClick={() => setActiveTab("explore")} className="hover:text-stone-100 cursor-pointer">Explore Main</button>
            <button onClick={() => setActiveTab("cafes")} className="hover:text-stone-100 cursor-pointer">Cozy List</button>
            <button onClick={() => setActiveTab("cuisine")} className="hover:text-stone-100 cursor-pointer">Khasi Food</button>
            <button onClick={() => setActiveTab("guides")} className="hover:text-stone-100 cursor-pointer">Guides Periodic</button>
            <button onClick={() => setActiveTab("about")} className="hover:text-stone-100 cursor-pointer">Owner Letter</button>
          </div>

          <p className="text-[10px] font-mono text-stone-500 leading-relaxed max-w-xs text-center md:text-right">
            Hand-drawn cartography and local independent review logs compiled inside Meghalaya's misty ridges.
          </p>
        </div>
      </footer>

      {/* Floating AI Local Guide widget */}
      <AIGuideChat />

      {/* Slide overlay for Cafe Details Modal */}
      <AnimatePresence>
        {selectedCafe && (
          <CafeDetailModal
            cafe={selectedCafe}
            onClose={() => setSelectedCafe(null)}
          />
        )}
      </AnimatePresence>

      {/* Slide overlay for administration Data Hub Modal */}
      <AnimatePresence>
        {dataHubOpen && (
          <DataHubModal
            isOpen={dataHubOpen}
            onClose={() => setDataHubOpen(false)}
            onCafesUpdated={(updatedCafes) => setCafes(updatedCafes)}
            currentCafes={cafes}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
