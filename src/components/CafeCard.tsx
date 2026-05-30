import React from "react";
import { Cafe } from "../types";
import { Clock, MapPin, Compass, ArrowUpRight, Star, Phone, Globe } from "lucide-react";
import { motion } from "motion/react";

interface CafeCardProps {
  cafe: Cafe;
  onViewDetails: (id: string) => void;
}

export default function CafeCard({ cafe, onViewDetails }: CafeCardProps) {
  // Neighborhood colors for visual landmarks
  const neighborhoodColors = {
    Laitumkhrah: "bg-blue-50 text-blue-800 border-blue-200/50",
    "Police Bazaar": "bg-emerald-50 text-emerald-800 border-emerald-200/50",
    "Golf Links": "bg-amber-50 text-amber-800 border-amber-200/50",
    "Boyce Road": "bg-teal-50 text-teal-800 border-teal-200/50",
    Nongkynrih: "bg-purple-50 text-purple-800 border-purple-200/50",
    "Kench's Trace": "bg-rose-50 text-rose-800 border-rose-200/50",
    Dhankheti: "bg-indigo-50 text-indigo-800 border-indigo-200/50"
  };

  return (
    <motion.div
      id={`cafe-card-${cafe.id}`}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-[#FAF8F5] border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-full group"
    >
      {/* Hero Image Container */}
      <div className="relative h-56 w-full overflow-hidden bg-stone-100">
        <img
          src={cafe.images.card}
          alt={cafe.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Layer Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent opacity-60" />

        {/* Neighborhood Pill Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold font-sans tracking-wide border shadow-xs ${neighborhoodColors[cafe.neighborhood]}`}>
            <MapPin className="w-3 h-3" />
            {cafe.neighborhood}
          </span>
        </div>
      </div>

      {/* Body Information */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Theme Line */}
          <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
            <p className="text-[10px] tracking-widest font-mono text-amber-800 uppercase font-bold">{cafe.theme}</p>
            {cafe.rating && (
              <div className="flex items-center gap-1 bg-amber-50/70 border border-amber-100 rounded px-1.5 py-0.5 text-[10px] font-mono font-bold text-amber-900">
                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-550 border-none shrink-0" />
                <span>{cafe.rating ?? "4.5"}</span>
                <span className="text-stone-405 font-light">({cafe.user_ratings_total ?? "100"})</span>
              </div>
            )}
          </div>

          <h3 className="text-xl font-display font-bold text-stone-900 leading-tight mb-2 group-hover:text-amber-800 transition-colors flex items-center justify-between">
            {cafe.name}
            <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-amber-800 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </h3>

          <p className="text-xs text-amber-900/90 font-serif italic mb-3 leading-relaxed">
            "{cafe.kong_labet_tagline || cafe.quote || cafe.tagline}"
          </p>

          <p className="text-xs text-stone-600 font-sans line-clamp-3 mb-3 font-light">
            {cafe.introduction}
          </p>

          {/* Labet's Note Container */}
          <div className="p-3 bg-[#FAF8F5] border border-stone-200/60 shadow-2xs rounded-xl text-stone-750 mb-1">
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#713f12] font-bold block mb-1">
              💬 Labet's Note
            </span>
            <p className="text-xs font-sans italic leading-relaxed text-[#713f12]/90">
              "{cafe.kong_labet_note || 'Best visited slowly.'}"
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-stone-200/60 mt-auto space-y-3">
          {/* Vibe tags pills */}
          <div className="flex flex-wrap items-center gap-1">
            {cafe.vibeTags.slice(0, 2).map((vibe) => (
              <span
                key={vibe}
                className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded-sm"
              >
                #{vibe.toLowerCase().replace(/\s+/g, "-")}
              </span>
            ))}
            {cafe.khasi_food_available && (
              <span className="text-[10px] font-sans font-medium text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-sm">
                🍲 Khasi Dishes
              </span>
            )}
          </div>

          {/* Quick Google Insights: Phone & Website */}
          {(cafe.phone_number || cafe.website) && (
            <div className="flex flex-wrap gap-2 text-[10px] font-mono text-stone-500 pt-2 border-t border-dashed border-stone-200/50">
              {cafe.phone_number && (
                <a 
                  href={`tel:${cafe.phone_number}`}
                  className="inline-flex items-center gap-1 hover:text-amber-800 transition-colors bg-white hover:bg-stone-50 border border-stone-205 rounded px-2 py-0.5 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="w-2.5 h-2.5 text-stone-400" />
                  {cafe.phone_number}
                </a>
              )}
              {cafe.website && (
                <a 
                  href={cafe.website}
                  target="_blank"
                  rel="noreferrer"
                  referrerPolicy="no-referrer"
                  className="inline-flex items-center gap-1 hover:text-amber-800 transition-colors bg-white hover:bg-stone-50 border border-stone-205 rounded px-2 py-0.5 cursor-pointer ml-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Globe className="w-2.5 h-2.5 text-stone-400" />
                  Website
                </a>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            {/* Price or Hours */}
            {cafe.price_per_person ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-900 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
                💰 ₹{cafe.price_per_person}/person
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-stone-500 font-mono font-medium">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                {cafe.hours.split("(")[0].trim()}
              </span>
            )}

            <button
              id={`btn-view-${cafe.id}`}
              onClick={() => onViewDetails(cafe.id)}
              className="text-xs text-amber-800 font-sans font-medium border-b border-amber-800 hover:text-amber-900 hover:border-amber-900 hover:pb-0.5 transition-all cursor-pointer"
            >
              Explore Hearth →
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
