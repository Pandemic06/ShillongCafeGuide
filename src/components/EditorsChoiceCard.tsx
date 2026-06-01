import React, { useState, useEffect } from "react";
import { Heart, Compass, MapPin, Sparkles, Sunrise, CloudRain, Camera, ArrowRight, Star } from "lucide-react";
import { motion } from "motion/react";
import { Cafe } from "../types";
import { fetchBestScenicImage } from "../services/googlePlaces";

interface EditorsChoiceCardProps {
  cafe: Cafe;
  onViewDetails: (cafeId: string) => void;
  onOpenRoute?: (routeId: string) => void;
}

export default function EditorsChoiceCard({ cafe, onViewDetails, onOpenRoute }: EditorsChoiceCardProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Determine dynamic travel accolades based on cafe attributes
  const getAccolade = () => {
    const id = cafe.id.toLowerCase();
    if (id.includes("rynsan")) {
      return {
        label: "Hidden Gem",
        icon: Sparkles,
        style: "bg-emerald-950/80 text-emerald-300 border-emerald-500/30",
        routeId: "city"
      };
    } else if (id.includes("ahavah")) {
      return {
        label: "Photographer's Pick",
        icon: Camera,
        style: "bg-amber-950/80 text-amber-300 border-amber-500/30",
        routeId: "city"
      };
    } else if (id.includes("ml-05") || id.includes("ml05")) {
      return {
        label: "Best in Monsoon",
        icon: CloudRain,
        style: "bg-blue-950/80 text-blue-300 border-blue-500/30",
        routeId: "city"
      };
    } else {
      return {
        label: "Best for Sunrise",
        icon: Sunrise,
        style: "bg-rose-950/80 text-rose-300 border-rose-500/30",
        routeId: "city"
      };
    }
  };

  const accolade = getAccolade();
  const AccoladeIcon = accolade.icon;

  // Sync bookmarks with localStorage
  useEffect(() => {
    try {
      const items = localStorage.getItem("shillong_cafe_bookmarks");
      if (items) {
        const bookmarks: string[] = JSON.parse(items);
        setIsBookmarked(bookmarks.includes(cafe.id));
      }
    } catch (e) {
      console.warn("Bookmark loading skipped.", e);
    }
  }, [cafe.id]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const items = localStorage.getItem("shillong_cafe_bookmarks");
      let bookmarks: string[] = items ? JSON.parse(items) : [];
      if (bookmarks.includes(cafe.id)) {
        bookmarks = bookmarks.filter(id => id !== cafe.id);
        setIsBookmarked(false);
      } else {
        bookmarks.push(cafe.id);
        setIsBookmarked(true);
      }
      localStorage.setItem("shillong_cafe_bookmarks", JSON.stringify(bookmarks));
      // Dispatch a storage event to synchronize other components instantly
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.warn("Bookmark toggling failed:", err);
    }
  };

  // Resolve Place Image on Mount
  useEffect(() => {
    let active = true;
    async function loadBestImage() {
      setIsImageLoading(true);
      try {
        const bestImage = await fetchBestScenicImage(cafe.name, cafe.images?.card || cafe.images?.hero, cafe.id);
        if (active) {
          setImageUrl(bestImage);
          setIsImageLoading(false);
        }
      } catch (err) {
        console.warn("Best image fetching failed, applying static card link", err);
        if (active) {
          setImageUrl(cafe.images?.card || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800");
          setIsImageLoading(false);
        }
      }
    }
    loadBestImage();
    return () => {
      active = false;
    };
  }, [cafe.id, cafe.name, cafe.images]);

  // Handle route navigation
  const handleOpenRoute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenRoute) {
      onOpenRoute(accolade.routeId);
    } else {
      // Direct URL redirection fallback
      const url = new URL(window.location.href);
      url.searchParams.set("tab", "planners");
      url.searchParams.set("route", accolade.routeId);
      window.history.pushState({}, "", url);
      // Dispatch popstate event to trigger components listening to popstate
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  return (
    <motion.div
      id={`editors-choice-id-${cafe.id}`}
      className="group relative flex flex-col justify-end h-[460px] md:h-[500px] w-full rounded-2xl overflow-hidden cursor-pointer shadow-[0_12px_45px_-12px_rgba(20,18,16,0.18)] hover:shadow-[0_20px_55px_-10px_rgba(20,18,16,0.3)] bg-stone-900 border border-stone-200/5 transition-all text-left"
      onClick={() => onViewDetails(cafe.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
    >
      {/* Blurred image background layout skeleton loader */}
      {isImageLoading && (
        <div className="absolute inset-0 bg-stone-900 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-stone-700 border-t-amber-400 rounded-full animate-spin" />
        </div>
      )}

      {/* Hero Image Component */}
      {!isImageLoading && imageUrl && (
        <motion.img
          src={imageUrl}
          alt={cafe.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover select-none pointer-events-none"
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          referrerPolicy="no-referrer"
        />
      )}

      {/* Soft Multi-Layer Premium Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent opacity-90 transition-opacity group-hover:opacity-95" />
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950/40 via-transparent to-transparent opacity-80" />

      {/* Floating Header UI */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        {/* Dynamic Accolade Badge */}
        <div className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${accolade.style} backdrop-blur-md shadow-lg`}>
          <AccoladeIcon className="w-3.5 h-3.5" />
          <span>{accolade.label}</span>
        </div>

        {/* Favorite Bookmark Heart Button */}
        <button
          onClick={toggleBookmark}
          className={`w-9 h-9 rounded-full ${isBookmarked ? "bg-red-500/90 text-white" : "bg-black/45 text-white/95 hover:bg-black/60"} border border-white/10 flex items-center justify-center transition-all backdrop-blur-md active:scale-90 hover:scale-105 select-none`}
          aria-label="Bookmark Cafe"
        >
          <Heart className={`w-[18px] h-[18px] ${isBookmarked ? "fill-white" : ""}`} />
        </button>
      </div>

      {/* Primary Card Content Block */}
      <div className="relative p-6 md:p-8 z-10 w-full flex flex-col justify-end">
        
        {/* Location & Star Rating Indicators */}
        <div className="flex items-center gap-3 text-[11px] font-mono tracking-widest uppercase text-amber-400 mb-2">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>{cafe.neighborhood}</span>
          </div>
          {cafe.rating && (
            <div className="flex items-center gap-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-stone-300">({cafe.rating})</span>
            </div>
          )}
        </div>

        {/* Cafe Title & Concept */}
        <h3 className="text-2xl md:text-3xl font-display font-medium text-stone-100 italic tracking-tight mb-2 leading-tight group-hover:text-amber-300 transition-colors">
          {cafe.name}
        </h3>

        {/* Curated Editorial Tagline */}
        <p className="text-xs font-sans text-stone-300 font-light mb-4 line-clamp-2 max-w-sm leading-relaxed">
          {cafe.introduction || cafe.tagline}
        </p>

        {/* Quick Highlights Row (Bullet-proof features list) */}
        <div className="flex flex-wrap gap-2 mb-6">
          {cafe.vibeTags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-sans font-light px-2.5 py-1 rounded bg-stone-900/60 text-stone-400 border border-stone-800/40"
            >
              • {tag}
            </span>
          ))}
          {cafe.hasLiveMusic && (
            <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-amber-950/40 text-amber-300 border border-amber-600/20">
              ♪ Acoustic Chords
            </span>
          )}
        </div>

        {/* Dual Actions CTA Cluster */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-800/40">
          {/* Action 1: View Details Story */}
          <button
            onClick={() => onViewDetails(cafe.id)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-stone-900 border border-stone-850 hover:bg-stone-800 hover:text-white text-stone-300 text-xs font-sans font-medium hover:border-stone-700 transition-colors"
          >
            <span>Read Story</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          {/* Action 2: Open Scenic Route directions */}
          <button
            onClick={handleOpenRoute}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-sans font-semibold transition-colors shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Open Route</span>
          </button>
        </div>

      </div>
    </motion.div>
  );
}
