import React, { useState } from "react";
import { DISHES } from "../data";
import { FoodDish } from "../types";
import { Coffee, Flame, UtensilsCrossed, Leaf, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

export default function CuisineGuide() {
  const [selectedDishId, setSelectedDishId] = useState<string>(DISHES[0].id);

  const activeDish = DISHES.find((d) => d.id === selectedDishId) || DISHES[0];

  return (
    <div id="cuisine-guide-container" className="space-y-12 max-w-5xl mx-auto">
      {/* Editorial Header */}
      <div className="text-center space-y-3">
        <span className="text-[11px] font-mono uppercase tracking-widest text-amber-800 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          The Authentic Plate
        </span>
        <h2 className="text-3xl font-display font-medium tracking-tight text-stone-900 sm:text-4.5xl animate-fade-in">
          The Soul of the Hills: Khasi Food
        </h2>
        <p className="max-w-xl mx-auto text-sm text-stone-605 font-sans leading-relaxed text-stone-600">
          Unlike the heavily creamed curries of the plains, traditional Khasi cuisine relies on four foundational pillars: dry black sesame, hand-ground ginger, black wild pepper, and deep timber woodfires.
        </p>
      </div>

      {/* Culinary Navigation Circular Plates */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-2xl mx-auto">
        {DISHES.map((d) => {
          const isSelected = selectedDishId === d.id;
          return (
            <button
              id={`dish-btn-${d.id}`}
              key={d.id}
              onClick={() => setSelectedDishId(d.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full border transition-all duration-300 cursor-pointer ${
                isSelected
                  ? "bg-amber-850/10 border-amber-800 text-amber-900 bg-amber-50 font-semibold"
                  : "bg-[#FAF8F5]/80 border-stone-200 text-stone-600 hover:border-stone-400"
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? "bg-amber-800" : "bg-stone-300"}`} />
              <span className="font-sans text-xs tracking-wider uppercase font-medium">{d.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Focus Component */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch pt-2">
        {/* Dynamic Image Representation Left 5 */}
        <div className="md:col-span-5 flex flex-col justify-between">
          <motion.div
            key={activeDish.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[#FAF8F5] border border-stone-200 rounded-2xl overflow-hidden shadow-xs h-full flex flex-col justify-between"
          >
            <div className="relative h-72 md:h-80 w-full overflow-hidden">
              <img
                src={activeDish.image}
                alt={`Authentic Khasi dish: ${activeDish.name}`}
                loading="lazy"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest leading-none">
                  Sought-After Dish
                </span>
                <h3 className="text-2xl font-display font-bold text-stone-100 mt-1 leading-tight">
                  {activeDish.name}
                </h3>
              </div>
            </div>

            {/* Micro quote/philosophy block */}
            <div className="p-6 bg-stone-50 border-t border-stone-200/50 flex-1 flex flex-col justify-center">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold">
                Culinary Heritage
              </span>
              <p className="text-sm font-sans italic text-stone-700 font-normal leading-relaxed mt-1">
                "{activeDish.philosophy}"
              </p>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Fact Sheet Right 7 */}
        <div className="md:col-span-7 flex flex-col justify-between">
          <motion.div
            key={`info-${activeDish.id}`}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-[#FAF8F5] border border-stone-200 rounded-2xl p-6 md:p-8 space-y-6 h-full flex flex-col justify-between"
          >
            {/* Description */}
            <div className="space-y-3">
              <h4 className="font-display font-bold text-stone-900 text-lg leading-tight">
                The Anatomy of Flavor
              </h4>
              <p className="text-stone-600 text-sm leading-relaxed font-sans font-light">
                {activeDish.description}
              </p>
            </div>

            {/* Specifications Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-y border-stone-200/80">
              <div className="space-y-1">
                <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  Taste Profile
                </span>
                <p className="text-xs text-stone-700 font-sans font-medium">
                  {activeDish.profile}
                </p>
              </div>

              <div className="space-y-1">
                <span className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">
                  <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                  Pairing Secrets
                </span>
                <p className="text-xs text-stone-700 font-sans font-medium">
                  {activeDish.pairing}
                </p>
              </div>
            </div>

            {/* Food Landmarks recommendations mapping */}
            <div className="space-y-3 pt-3">
              <span className="flex items-center gap-1.5 text-xs text-stone-800 font-sans font-medium uppercase tracking-wide">
                <UtensilsCrossed className="w-4 h-4 text-amber-800" />
                Curated Recommendations in Shillong
              </span>

              <div className="flex flex-wrap gap-2">
                {activeDish.matchCafes.map((location) => (
                  <span
                    key={location}
                    className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-amber-50 text-stone-800 text-xs border border-stone-200/80 px-3.5 py-1.5 rounded-lg font-sans tracking-wide transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-amber-800" />
                    {location}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Traditional Food Etiquette Sidebar */}
      <div className="bg-stone-900 text-stone-200 rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center border border-stone-800 shadow-md">
        <div className="md:col-span-2 space-y-2">
          <h4 className="text-amber-400 font-display font-bold text-md tracking-wide">
            Where to Start Your Culinary Pilgrimage?
          </h4>
          <p className="text-stone-300 text-xs font-sans leading-relaxed font-light">
            If you wish to taste Jadoh or black sesame pork at its most raw, rustic form, stroll into the crowded alleys of Police Bazaar and find **Trattoria**—an unmarked local diner. For seventy years, local workers, artists, and visitors have crowded its long timber communal tables.
          </p>
        </div>
        <div className="flex md:justify-end">
          <span className="text-stone-400 font-mono text-[10px] uppercase border border-stone-700 py-3 px-4 rounded-xl text-center md:text-right block w-full leading-relaxed">
            PRO-TIP:<br />Ask for "Lal-Cha"<br />(Unsweetened Black Tea)
          </span>
        </div>
      </div>
    </div>
  );
}
