import React, { useState } from "react";
import { NEIGHBORHOODS, CAFES } from "../data";
import { NeighborhoodInfo, Cafe } from "../types";
import { MapPin, Calendar, Clock, Compass, Navigation, ArrowRight, Heart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NeighborhoodGuideProps {
  onSelectCafe: (id: string) => void;
  initialNeighborhoodId?: string;
  cafes?: Cafe[];
}

export default function NeighborhoodGuide({ onSelectCafe, initialNeighborhoodId, cafes }: NeighborhoodGuideProps) {
  const [selectedId, setSelectedId] = useState<string>(initialNeighborhoodId || NEIGHBORHOODS[0].id);

  const activeNeighborhood = NEIGHBORHOODS.find((n) => n.id === selectedId) || NEIGHBORHOODS[0];

  const cafesList = cafes || CAFES;

  // Get cafes matching this neighborhood
  const matchingCafes = cafesList.filter(
    (c) => c.neighborhood.toLowerCase() === activeNeighborhood.name.toLowerCase()
  );

  return (
    <div id="neighborhood-guide-container" className="space-y-10 max-w-5xl mx-auto">
      {/* Title block */}
      <div className="text-center space-y-3">
        <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          Neighborhood Walkthroughs
        </span>
        <h2 className="text-3xl font-display font-medium tracking-tight text-stone-900 sm:text-4.5xl">
          Browse by Neighborhood
        </h2>
        <p className="max-w-2xl mx-auto text-sm text-stone-600 font-sans leading-relaxed">
          Each ridge and circle of Shillong is its own mini-world. Select a district below to uncover its specific sub-culture, local timing, and visual stroll routes.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center border-b border-stone-200/80 max-w-lg mx-auto p-1.5 bg-stone-100/50 rounded-xl">
        {NEIGHBORHOODS.map((n) => {
          const isActive = selectedId === n.id;
          return (
            <button
              key={n.id}
              onClick={() => setSelectedId(n.id)}
              className={`flex-1 text-center py-2 px-3 rounded-lg text-xs font-sans tracking-wider font-semibold uppercase transition-all duration-300 cursor-pointer ${
                isActive
                  ? "bg-white text-amber-800 shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              {n.name}
            </button>
          );
        })}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* District Vitals & Description (Column Left 7) */}
        <div className="lg:col-span-7 space-y-6">
          <motion.div
            key={activeNeighborhood.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {/* Visual Header Image with quote */}
            <div className="relative h-72 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm">
              <img
                src={activeNeighborhood.image}
                alt={activeNeighborhood.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest">
                  Landmark Guide
                </span>
                <h3 className="text-2xl font-display font-bold text-stone-100 mt-1 leading-tight">
                  {activeNeighborhood.title}
                </h3>
              </div>
            </div>

            {/* Narrative Description */}
            <div className="bg-[#FAF8F5] border border-stone-200/60 rounded-2xl p-6 space-y-4">
              <h4 className="font-display font-bold text-stone-900 tracking-wide text-md">
                The Fabric of {activeNeighborhood.name}
              </h4>
              <p className="text-stone-600 text-sm leading-relaxed font-sans font-light">
                {activeNeighborhood.description}
              </p>

              {/* District vitals cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-stone-200/80">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-mono tracking-wider text-stone-400">
                    District Vibe
                  </p>
                  <p className="text-xs text-stone-700 font-sans font-medium">
                    {activeNeighborhood.vitals.vibe}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-mono tracking-wider text-stone-400">
                    Best Time To Walk
                  </p>
                  <p className="text-xs text-amber-800 font-sans font-medium">
                    {activeNeighborhood.vitals.bestTime}
                  </p>
                </div>
              </div>
            </div>

            {/* Neighborhood Cafes */}
            <div className="space-y-3">
              <h4 className="font-display font-medium text-stone-900 text-sm tracking-wide uppercase px-1">
                Cafes Hosted in {activeNeighborhood.name}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {matchingCafes.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => onSelectCafe(c.id)}
                    className="flex gap-4 items-center bg-white border border-stone-200 hover:border-amber-700 p-4 rounded-xl cursor-pointer hover:shadow-md transition-all duration-300 group"
                  >
                    <img
                      src={c.images.card}
                      alt={c.name}
                      className="w-14 h-14 object-cover rounded-lg bg-stone-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1">
                      <h5 className="font-display font-bold text-stone-800 text-xs tracking-wide group-hover:text-amber-800 transition-colors">
                        {c.name}
                      </h5>
                      <p className="text-[10px] text-stone-500 font-sans mt-0.5 italic line-clamp-1">
                        {c.theme}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Itinerary (Column Right 5) */}
        <div className="lg:col-span-5">
          <motion.div
            key={`itinerary-${activeNeighborhood.id}`}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-stone-900 text-stone-100 rounded-2xl p-6 space-y-6 shadow-lg border border-stone-800/80 relative overflow-hidden"
          >
            {/* Top accent maps overlay */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
              <Compass className="w-32 h-32 text-amber-500" />
            </div>

            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-amber-400 animate-pulse" />
              <h4 className="font-display font-bold text-stone-100 tracking-wide">
                Walking Itinerary
              </h4>
            </div>

            <div className="space-y-1">
              <h5 className="text-md font-display font-medium text-amber-400">
                {activeNeighborhood.itinerary.title}
              </h5>
              <p className="text-xs text-stone-400 font-sans font-light">
                {activeNeighborhood.itinerary.description}
              </p>
            </div>

            {/* Timeline steps */}
            <div className="relative border-l-2 border-stone-800 ml-2 pl-6 space-y-6 pt-2">
              {activeNeighborhood.itinerary.steps.map((step, idx) => (
                <div key={idx} className="relative space-y-1">
                  {/* Pin Dot */}
                  <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-stone-900" />

                  <span className="inline-block text-[9px] font-mono tracking-widest text-amber-500 uppercase font-bold">
                    {step.time}
                  </span>
                  <h6 className="font-display font-semibold text-xs text-stone-100">
                    {step.title}
                  </h6>
                  <p className="text-xs text-stone-400 leading-relaxed font-sans font-light">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Accent micro directions sticker */}
            <div className="pt-4 border-t border-stone-800 flex items-center gap-3 text-stone-400">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-[10px] font-mono leading-relaxed uppercase">
                Estimated Stroll: 1.5 Hour • 1,800 Paces • Grayscale signs guide you.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
