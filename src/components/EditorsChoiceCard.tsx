import React from "react";
import { Star, MapPin, ArrowRight, Crown } from "lucide-react";
import { Cafe } from "../types";

interface EditorsChoiceCardProps {
  cafe: Cafe;
  onViewDetails: (cafeId: string) => void;
  onOpenRoute?: (routeId: string) => void;
}

export default function EditorsChoiceCard({ cafe, onViewDetails, onOpenRoute }: EditorsChoiceCardProps) {
  const heroImage =
    cafe.images?.hero ||
    cafe.images?.card ||
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800";

  return (
    <div
      className="group relative bg-white border border-stone-200 rounded-[24px] overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
      onClick={() => onViewDetails(cafe.id)}
    >
      {/* Hero image */}
      <div className="relative h-52 w-full overflow-hidden bg-stone-100">
        <img
          src={heroImage}
          alt={cafe.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Editor's Choice badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-amber-800/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[9px] font-mono font-bold tracking-widest uppercase shadow">
          <Crown className="w-3 h-3 text-amber-300 shrink-0" />
          <span>Editor's Choice</span>
        </div>

        {/* Rating badge */}
        {cafe.rating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-stone-800 px-2 py-1 rounded-full text-[10px] font-mono font-bold shadow">
            <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
            <span>{Number(cafe.rating).toFixed(1)}</span>
          </div>
        )}

        {/* Cafe name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display font-bold text-white text-base leading-tight line-clamp-1 drop-shadow">
            {cafe.name}
          </h3>
          {cafe.neighborhood && (
            <p className="flex items-center gap-1 text-stone-300 text-[10px] font-mono mt-0.5">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="line-clamp-1">{cafe.neighborhood}</span>
            </p>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Tagline / theme */}
        {(cafe.tagline || cafe.theme) && (
          <p className="text-stone-600 text-[11px] font-sans leading-relaxed line-clamp-2 font-light">
            {cafe.tagline || cafe.theme}
          </p>
        )}

        {/* Vibe tags */}
        {cafe.vibeTags && cafe.vibeTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {cafe.vibeTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-stone-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(cafe.id);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 bg-stone-900 hover:bg-stone-950 text-white text-[10px] font-sans font-semibold uppercase tracking-wider px-3 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <span>View Profile</span>
            <ArrowRight className="w-3 h-3" />
          </button>
          {onOpenRoute && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenRoute(cafe.id);
              }}
              className="px-3 py-2.5 rounded-xl border border-stone-200 hover:border-amber-700 text-stone-600 hover:text-amber-800 hover:bg-amber-50 text-[10px] font-sans font-semibold uppercase tracking-wider transition-all cursor-pointer"
            >
              Route
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
