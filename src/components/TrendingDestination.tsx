import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp, MapPin, Clock, Cloud, Droplets, Camera,
  Utensils, Coffee, Car, Mountain, Waves, ChevronDown,
  ChevronUp, ExternalLink, AlertCircle, Star, Leaf,
  Navigation, Sunrise, ArrowRight, Info, Flame
} from "lucide-react";

// ─────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────

const SOHRA_WATERFALLS = [
  {
    name: "Nohkalikai Falls",
    height: "340 m",
    tag: "India's Tallest Plunge",
    desc: "The highest plunge waterfall in India. Fed by one of the wettest catchments on Earth, it free-falls into a blue-green gorge below the plateau edge. Best viewed 10–11 AM when mist lifts.",
    tips: "Viewpoint is 5 min walk from car park. Bring a rain jacket — spray travels far. Full roar Jul–Sep; seasonal trickle Dec–Feb.",
    coord: "25.2882° N, 91.7147° E",
    driveMins: 12,
    emoji: "💧",
  },
  {
    name: "Seven Sisters Falls",
    height: "315 m",
    tag: "Seven-Streamed Cascade",
    desc: "Seven parallel streams cascade down a single basalt cliff face — one of Meghalaya's most photogenic sights. The streams merge at the base into a white froth visible from the highway.",
    tips: "Best viewed from NH6 lay-by 2 km before Sohra town. Active only during and just after monsoon — dry season visit is scenic but the falls are thin.",
    coord: "25.2637° N, 91.7021° E",
    driveMins: 8,
    emoji: "🌊",
  },
  {
    name: "Dainthlen Falls",
    height: "60 m",
    tag: "Mythological Gorge",
    desc: "Named after the legendary serpent (Thlen) slain here in Khasi folklore. A broad, powerful curtain of water framed by moss-covered rock walls. A 10-minute walk from the road through mixed forest.",
    tips: "Entry fee applies. Slippery rocks — wear grip shoes. Combine with Wei Sawdong on the same day.",
    coord: "25.2791° N, 91.7268° E",
    driveMins: 6,
    emoji: "⚡",
  },
  {
    name: "Wei Sawdong Falls",
    height: "3-tier",
    tag: "Hidden Three-Tier Secret",
    desc: "Three tiers of cascades hidden 2 km off the main road. The bottom pool is swimmable outside monsoon months. Very few tourists reach tier 3 — the most dramatic level.",
    tips: "Drive a dirt road to Wei Sawdong village, then trek 40 min down. Take a local guide from the village (₹200–300). Swimwear recommended.",
    coord: "25.2718° N, 91.7434° E",
    driveMins: 20,
    emoji: "🏊",
  },
  {
    name: "Kynrem Falls",
    height: "305 m",
    tag: "Thangkharang Park Centrepiece",
    desc: "Three-tiered falls inside Thangkharang Park, near the Bangladesh border viewpoint. The Bangladesh plains stretch to the horizon below the park's cliff edge.",
    tips: "Entry to Thangkharang Park required (₹20–40). Visit the Bangladesh viewpoint while here — it is extraordinary on clear days.",
    coord: "25.1889° N, 91.6918° E",
    driveMins: 30,
    emoji: "🌅",
  },
  {
    name: "Mawsmai Cave",
    height: "150 m long",
    tag: "Illuminated Limestone Caves",
    desc: "Not a waterfall — but unmissable. A 150-metre lit limestone cave walk through sculpted stalactites and stalagmites carved by millions of years of water. Takes 20–30 minutes.",
    tips: "Very crowded on weekends. Arrive before 9 AM or after 3 PM. Narrow passages — not suitable for claustrophobia. Photography allowed.",
    coord: "25.2679° N, 91.7116° E",
    driveMins: 5,
    emoji: "🕳️",
  },
];

const SOHRA_CAFES = [
  {
    name: "Sohra Coffee House",
    area: "Sohra Town Centre",
    vibe: "Local Institution",
    mustTry: "Bamboo shoot broth & Tungrymbai rice",
    desc: "The oldest sit-down café in Sohra. Stone-walled interior, hand-painted menu boards, and the most honest Khasi thali for 80 kilometres around. Run by the same family since the 1990s.",
    priceRange: "₹80–220",
    openHours: "8 AM – 6 PM",
    emoji: "☕",
  },
  {
    name: "Mist & Moss Cafe",
    area: "Near Nohkalikai Viewpoint",
    vibe: "Scenic Perch",
    mustTry: "Black sesame tea & cardamom biscuits",
    desc: "A small wooden shack perched 50 metres from the Nohkalikai viewpoint. Sells Meghalayan black sesame tea, local honey, and bamboo-steamed Jadoh parcels wrapped in Sirsak leaf.",
    priceRange: "₹40–150",
    openHours: "7 AM – 5 PM (closed heavy rain days)",
    emoji: "🌿",
  },
  {
    name: "Rambler's Rest",
    area: "Cherrapunji Holiday Resort Road",
    vibe: "Trek Recovery",
    mustTry: "Ginger-lemon honey tea & pork momos",
    desc: "A hikers' hangout after the Double Decker Root Bridge trail. Bamboo-pole walls, hammocks, and heaters after wet treks. Very popular with the backpacking circuit.",
    priceRange: "₹60–280",
    openHours: "6:30 AM – 7 PM",
    emoji: "🏕️",
  },
  {
    name: "Lum Shyllong Eatery",
    area: "Market Road, Sohra",
    vibe: "No-Frills Authentic",
    mustTry: "Jadoh with Dohneiiong & raw red onions",
    desc: "No signboard, no Instagram, just the best Jadoh you can find at 1500 metres. Point-and-eat counter with two rice options, always packed with drivers and trekkers by noon.",
    priceRange: "₹60–130",
    openHours: "7 AM – 2 PM only",
    emoji: "🍚",
  },
];

const SOHRA_ROUTES = [
  {
    id: "day-trip",
    label: "One-Day Sohra Sprint",
    duration: "7–9 hours",
    distance: "~145 km round-trip",
    difficulty: "Easy",
    stops: [
      { time: "7:00 AM", stop: "Depart Shillong (Police Bazaar)", note: "NH6 via Cherrapunji Road" },
      { time: "9:30 AM", stop: "Mawsmai Cave", note: "30 min — arrive before crowds" },
      { time: "10:30 AM", stop: "Seven Sisters Falls viewpoint", note: "15 min roadside stop" },
      { time: "11:00 AM", stop: "Nohkalikai Falls", note: "45 min — prime mist-clear window" },
      { time: "12:00 PM", stop: "Lunch at Sohra Coffee House or Lum Shyllong Eatery", note: "Jadoh thali" },
      { time: "1:30 PM", stop: "Dainthlen Falls", note: "45 min trek + viewing" },
      { time: "3:00 PM", stop: "Thangkharang Park & Kynrem Falls", note: "60 min — Bangladesh plains view" },
      { time: "5:00 PM", stop: "Return to Shillong", note: "~75 km, 2.5 hrs" },
    ],
  },
  {
    id: "double-decker",
    label: "Double Decker Root Bridge Trek",
    duration: "Full day (10–12 hrs)",
    distance: "Nongriat village: 3.5 km / 3,500 steps each way",
    difficulty: "Moderate–Strenuous",
    stops: [
      { time: "6:00 AM", stop: "Depart Shillong — arrive Tyrna village by 8:30 AM", note: "Starting point of descent" },
      { time: "8:30 AM", stop: "Begin descent from Tyrna", note: "3,500+ concrete steps downhill — ~2 hrs" },
      { time: "10:30 AM", stop: "Single Root Bridge (lower)", note: "15 min crossing and rest" },
      { time: "11:00 AM", stop: "Double Decker Living Root Bridge — Nongriat", note: "Iconic UNESCO-nominated ancient bridge" },
      { time: "11:30 AM", stop: "Rainbow Falls (extra 45 min hike from Nongriat)", note: "Optional but spectacular" },
      { time: "1:00 PM", stop: "Lunch at Nongriat village homestay", note: "Simple rice and dal — ₹80–150" },
      { time: "2:00 PM", stop: "Begin ascent back to Tyrna", note: "~2.5 hrs uphill — harder than descent" },
      { time: "4:30 PM", stop: "Reach Tyrna — drive back toward Sohra", note: "" },
      { time: "5:00 PM", stop: "Tea & rest at Rambler's Rest or Mist & Moss Cafe", note: "Reward after the climb" },
      { time: "6:30 PM", stop: "Return to Shillong", note: "~1.5 hrs" },
    ],
  },
  {
    id: "overnight",
    label: "Overnight Sohra Immersion",
    duration: "2 days / 1 night",
    distance: "~75 km from Shillong",
    difficulty: "Easy (more leisure pace)",
    stops: [
      { time: "Day 1 — 9:00 AM", stop: "Depart Shillong", note: "Relax, no rush" },
      { time: "11:00 AM", stop: "Mawkdok Valley Viewpoint (en route)", note: "Zipline available, stunning gorge" },
      { time: "1:00 PM", stop: "Arrive Sohra — check in to homestay", note: "Book ahead: Cherry Top Homestay or Serene Sohra" },
      { time: "2:00 PM", stop: "Nohkalikai Falls & Seven Sisters Falls", note: "Afternoon golden hour photography" },
      { time: "4:30 PM", stop: "Mist & Moss Cafe — black sesame tea", note: "Wind down before dusk" },
      { time: "7:00 PM", stop: "Dinner at homestay (Khasi home-cooked)", note: "Often included in stay package" },
      { time: "Day 2 — 6:30 AM", stop: "Sunrise at Eco Park cliff edge", note: "Fog sea over Bangladesh plains" },
      { time: "8:00 AM", stop: "Breakfast at Sohra Coffee House", note: "" },
      { time: "9:30 AM", stop: "Mawsmai Cave + Dainthlen Falls", note: "Morning clarity, fewer crowds" },
      { time: "12:30 PM", stop: "Thangkharang Park & Kynrem Falls", note: "" },
      { time: "3:00 PM", stop: "Return to Shillong", note: "" },
    ],
  },
];

const TRAVEL_TIPS = [
  {
    icon: <Car className="w-4 h-4" />,
    title: "Getting There",
    color: "amber",
    tips: [
      "NH6 from Police Bazaar: 55–75 km, 2–2.5 hrs depending on traffic",
      "Shared taxis from Bara Bazaar (Police Bazaar): ₹150–200 per seat, 2.5 hrs",
      "Private cab: ₹1,800–2,500 for a full day from Shillong",
      "No direct bus — shared jeeps are the standard local transport",
    ],
  },
  {
    icon: <Clock className="w-4 h-4" />,
    title: "Best Time to Visit",
    color: "blue",
    tips: [
      "October–April: Clear skies, all waterfalls visible, root bridges accessible",
      "June–September: Monsoon — waterfalls at full roar but roads may wash out",
      "December–February: Thin waterfalls but crisp visibility and zero crowds",
      "Avoid May–June if road safety is a concern — heaviest rain of the year",
    ],
  },
  {
    icon: <AlertCircle className="w-4 h-4" />,
    title: "Essential Warnings",
    color: "red",
    tips: [
      "The Double Decker trek is 7,000+ steps total — begin before 8 AM",
      "Mobile signal drops to zero between Mawkdok and Sohra — download offline maps",
      "Carry cash — no ATMs near major waterfalls or in Nongriat village",
      "Sohra receives 12,000 mm of rain per year — a rain jacket is non-negotiable",
    ],
  },
  {
    icon: <Leaf className="w-4 h-4" />,
    title: "Responsible Travel",
    color: "green",
    tips: [
      "The sacred forests and root bridges are fragile — carry out all waste",
      "Hire local guides from Tyrna for the root bridge trek (₹200–300)",
      "Buy local honey and bamboo products directly from village stalls",
      "Do not pick plants — several species here are endangered and protected",
    ],
  },
];

const FAST_FACTS = [
  { label: "Official Name", value: "Sohra (Cherrapunji is the colonial name)", icon: "📍" },
  { label: "Elevation", value: "1,484 metres above sea level", icon: "⛰️" },
  { label: "District", value: "East Khasi Hills, Meghalaya", icon: "🗺️" },
  { label: "Annual Rainfall", value: "~11,777 mm (one of Earth's wettest places)", icon: "🌧️" },
  { label: "Language", value: "Khasi (primary), Bengali, Hindi, English", icon: "🗣️" },
  { label: "Famous For", value: "Waterfalls, Living Root Bridges, Limestone Caves", icon: "🌿" },
  { label: "Distance from Shillong", value: "55–75 km via NH6 (2–2.5 hrs)", icon: "🚗" },
  { label: "Best Entry Point", value: "Police Bazaar → Mawkdok → Sohra", icon: "🧭" },
];

// ─────────────────────────────────────────────
//  SUB-COMPONENTS
// ─────────────────────────────────────────────

function TipCard({ tip }: { tip: typeof TRAVEL_TIPS[0] }) {
  const [open, setOpen] = useState(false);
  const colorMap: Record<string, string> = {
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    red: "bg-red-50 border-red-200 text-red-700",
    green: "bg-emerald-50 border-emerald-200 text-emerald-800",
  };
  const iconClass = colorMap[tip.color] || colorMap.amber;
  return (
    <div className="bg-[#FAF8F5] border border-stone-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center border ${iconClass}`}>
            {tip.icon}
          </span>
          <span className="text-sm font-display font-semibold text-stone-900">{tip.title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ul className="px-5 pb-4 space-y-2 border-t border-stone-100 pt-3">
              {tip.tips.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-stone-600 leading-relaxed font-sans">
                  <span className="text-amber-700 mt-0.5 shrink-0">•</span>
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RouteTimeline({ route }: { route: typeof SOHRA_ROUTES[0] }) {
  const diffColor = {
    Easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Moderate–Strenuous": "bg-red-50 text-red-700 border-red-200",
    "Easy (more leisure pace)": "bg-blue-50 text-blue-700 border-blue-200",
  }[route.difficulty] || "bg-stone-100 text-stone-600 border-stone-200";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <span className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border font-bold ${diffColor}`}>
          {route.difficulty}
        </span>
        <span className="text-[10px] font-mono text-stone-400">{route.duration}</span>
        <span className="text-[10px] font-mono text-stone-400">·</span>
        <span className="text-[10px] font-mono text-stone-400">{route.distance}</span>
      </div>
      <ol className="relative border-l-2 border-amber-200 pl-6 space-y-4">
        {route.stops.map((stop, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[29px] top-0 w-4 h-4 rounded-full bg-amber-700 border-2 border-white ring-2 ring-amber-200 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </span>
            <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-3">
              <span className="text-[10px] font-mono text-amber-700 font-bold shrink-0 mt-0.5 min-w-[90px]">{stop.time}</span>
              <div>
                <p className="text-xs font-display font-semibold text-stone-900">{stop.stop}</p>
                {stop.note && <p className="text-[11px] text-stone-500 font-sans mt-0.5">{stop.note}</p>}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ─────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────

export default function TrendingDestination() {
  const [activeRoute, setActiveRoute] = useState(SOHRA_ROUTES[0].id);
  const [expandedWaterfall, setExpandedWaterfall] = useState<string | null>(null);

  const currentRoute = SOHRA_ROUTES.find((r) => r.id === activeRoute) || SOHRA_ROUTES[0];

  return (
    <div className="space-y-14 max-w-5xl mx-auto">
      {/* ── HERO BANNER ────────────────────────────── */}
      <section>
        <div className="relative bg-stone-900 rounded-2xl overflow-hidden">
          {/* Background gradient canvas */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #1a2a1a 0%, #0d1f0d 40%, #1c2b1a 60%, #0a1a10 100%)",
            }}
          />
          {/* Mist overlay */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(ellipse at 70% 40%, #4ade80 0%, transparent 60%), radial-gradient(ellipse at 20% 70%, #86efac 0%, transparent 50%)" }} />
          <div className="relative z-10 px-6 sm:px-10 py-10 sm:py-14">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full font-bold">
                <Flame className="w-3 h-3" /> Trending Now
              </span>
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full font-bold">
                <TrendingUp className="w-3 h-3" /> June 2026
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white leading-tight tracking-tight">
              Sohra
              <span className="block text-emerald-400 font-light">Cherrapunji</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm text-stone-300 leading-relaxed font-sans font-light">
              The name that stopped the world — one of Earth's wettest inhabited places, now Meghalaya's most-searched destination on every travel platform. Waterfalls that dwarf buildings, caves sculpted over millennia, and living bridges grown over 500 years. This is where Meghalaya earns its name: <em>Abode of Clouds</em>.
            </p>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: <MapPin className="w-3.5 h-3.5" />, label: "75 km from Shillong", sub: "NH6 Route" },
                { icon: <Droplets className="w-3.5 h-3.5" />, label: "11,777 mm rain/yr", sub: "World Record" },
                { icon: <Mountain className="w-3.5 h-3.5" />, label: "1,484 m elevation", sub: "Above Sea Level" },
                { icon: <Star className="w-3.5 h-3.5" />, label: "6 waterfalls", sub: "Within 30 km" },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="text-emerald-400 mb-1">{stat.icon}</div>
                  <div className="text-xs font-display font-semibold text-white">{stat.label}</div>
                  <div className="text-[10px] text-stone-400 font-mono mt-0.5">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAST FACTS ─────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <Info className="w-4 h-4 text-amber-700" />
          <h2 className="text-lg font-display font-bold text-stone-900">At a Glance</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {FAST_FACTS.map((fact, i) => (
            <div key={i} className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-4 space-y-1">
              <div className="text-xl">{fact.icon}</div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold">{fact.label}</div>
              <div className="text-xs font-sans text-stone-700 leading-snug">{fact.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── WATERFALLS & SIGHTS ────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <Waves className="w-4 h-4 text-blue-600" />
          <h2 className="text-lg font-display font-bold text-stone-900">Waterfalls & Sights</h2>
        </div>
        <p className="text-xs text-stone-500 mb-5 font-sans">
          Sohra has more accessible major waterfalls per square kilometre than anywhere in the subcontinent. Listed in order of proximity to Sohra town.
        </p>
        <div className="space-y-3">
          {SOHRA_WATERFALLS.map((wf) => {
            const isOpen = expandedWaterfall === wf.name;
            return (
              <div
                key={wf.name}
                className="bg-[#FAF8F5] border border-stone-200 rounded-xl overflow-hidden"
              >
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 text-left cursor-pointer"
                  onClick={() => setExpandedWaterfall(isOpen ? null : wf.name)}
                  aria-expanded={isOpen}
                >
                  <span className="text-2xl shrink-0">{wf.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-bold text-stone-900 text-sm">{wf.name}</span>
                      <span className="text-[10px] font-mono uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                        {wf.tag}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px] text-stone-500 font-mono">{wf.height}</span>
                      <span className="text-[11px] text-stone-400">·</span>
                      <span className="text-[11px] text-stone-500 font-mono flex items-center gap-1">
                        <Car className="w-3 h-3" />{wf.driveMins} min drive
                      </span>
                    </div>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="wf-detail"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 pb-5 pt-2 border-t border-stone-100 space-y-3">
                        <p className="text-xs text-stone-600 leading-relaxed font-sans">{wf.desc}</p>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Star className="w-3 h-3 text-amber-700" />
                            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold">Visitor Tips</span>
                          </div>
                          <p className="text-xs text-amber-900 leading-relaxed font-sans">{wf.tips}</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-mono">
                          <Navigation className="w-3 h-3" />
                          {wf.coord}
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wf.name + " Cherrapunji Meghalaya")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-amber-700 hover:text-amber-900 flex items-center gap-1"
                          >
                            Open in Maps <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CAFES & FOOD ───────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <Coffee className="w-4 h-4 text-amber-700" />
          <h2 className="text-lg font-display font-bold text-stone-900">Where to Eat & Drink in Sohra</h2>
        </div>
        <p className="text-xs text-stone-500 mb-5 font-sans">
          Sohra's food scene is small but genuine. Khasi home cooking dominates — expect bamboo-steamed rice, dried pork preparations, and honey-laced teas.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SOHRA_CAFES.map((cafe) => (
            <div key={cafe.name} className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-5 space-y-3 hover:border-amber-300 hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xl">{cafe.emoji}</span>
                  <h3 className="font-display font-bold text-stone-900 text-sm mt-1.5">{cafe.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3 h-3 text-stone-400" />
                    <span className="text-[11px] text-stone-500 font-mono">{cafe.area}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold shrink-0">
                  {cafe.vibe}
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed font-sans">{cafe.desc}</p>
              <div className="pt-1 border-t border-stone-100 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Utensils className="w-3 h-3 text-amber-700 shrink-0" />
                  <span className="text-[11px] text-stone-700 font-sans">
                    <span className="font-semibold">Must try:</span> {cafe.mustTry}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span className="text-[11px] text-stone-500 font-mono">{cafe.openHours}</span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono">{cafe.priceRange}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ROUTE PLANNER ──────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-2">
          <Navigation className="w-4 h-4 text-emerald-700" />
          <h2 className="text-lg font-display font-bold text-stone-900">Curated Routes to Sohra</h2>
        </div>
        <p className="text-xs text-stone-500 mb-5 font-sans">
          Three tried-and-tested itineraries — from a tight day trip to a full overnight immersion. All start from Shillong city centre.
        </p>

        {/* Route selector tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SOHRA_ROUTES.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRoute(r.id)}
              className={`px-4 py-2 rounded-lg text-xs font-display font-semibold transition-all duration-200 cursor-pointer ${
                activeRoute === r.id
                  ? "bg-stone-900 text-white"
                  : "bg-[#FAF8F5] border border-stone-200 text-stone-600 hover:border-amber-300"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Route content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeRoute}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-5 sm:p-7"
          >
            <h3 className="font-display font-bold text-stone-900 mb-4">{currentRoute.label}</h3>
            <RouteTimeline route={currentRoute} />
            <div className="mt-5 pt-4 border-t border-stone-100">
              <a
                href={`https://www.google.com/maps/dir/Shillong/Sohra,+Meghalaya`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-display font-semibold px-4 py-2.5 rounded-lg transition-colors duration-200"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open full route in Google Maps
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ── TRAVEL TIPS ────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <AlertCircle className="w-4 h-4 text-amber-700" />
          <h2 className="text-lg font-display font-bold text-stone-900">Before You Go</h2>
        </div>
        <div className="space-y-3">
          {TRAVEL_TIPS.map((tip, i) => (
            <TipCard key={i} tip={tip} />
          ))}
        </div>
      </section>

      {/* ── PHOTO SPOTS ────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <Camera className="w-4 h-4 text-stone-600" />
          <h2 className="text-lg font-display font-bold text-stone-900">Photographer's Hit List</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { spot: "Nohkalikai viewpoint", timing: "9:30–11 AM", why: "Mist clears, golden light fills the gorge" },
            { spot: "Seven Sisters Falls lay-by (NH6)", timing: "2–4 PM", why: "Back-lit streams against dark basalt cliff" },
            { spot: "Double Decker Root Bridge", timing: "8–10 AM", why: "Dappled forest light before midday crowds" },
            { spot: "Eco Park cliff edge", timing: "6–7 AM (sunrise)", why: "Fog sea over the Bangladesh plains at first light" },
            { spot: "Mawkdok Valley zipline point", timing: "Any time en route", why: "360° gorge panorama with road sweeping through" },
            { spot: "Dainthlen Falls gorge mouth", timing: "11 AM–1 PM", why: "Direct overhead light inside the dark canyon" },
          ].map((photo, i) => (
            <div key={i} className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Camera className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <span className="text-xs font-display font-bold text-stone-900">{photo.spot}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sunrise className="w-3 h-3 text-amber-600" />
                <span className="text-[11px] text-amber-800 font-mono font-bold">{photo.timing}</span>
              </div>
              <p className="text-[11px] text-stone-500 font-sans leading-snug">{photo.why}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SEASONAL SUMMARY ───────────────────────── */}
      <section className="bg-stone-900 rounded-2xl p-7 sm:p-9">
        <div className="flex items-center gap-2 mb-6">
          <Cloud className="w-4 h-4 text-sky-400" />
          <h2 className="text-lg font-display font-bold text-white">Sohra Through the Seasons</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              season: "Oct–Nov",
              label: "Peak Season",
              icon: "☀️",
              text: "Clear skies, all waterfalls visible, root bridges fully accessible. Book accommodation 3 weeks ahead.",
              badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
            },
            {
              season: "Dec–Feb",
              label: "Cool & Clear",
              icon: "❄️",
              text: "Thinnest waterfalls but zero crowds, crisp air and vivid visibility. Mornings below 5°C — pack warm layers.",
              badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
            },
            {
              season: "Mar–May",
              label: "Pre-Monsoon",
              icon: "🌸",
              text: "Wildflowers in bloom. Waterfalls building. Heat in the plains means Sohra's cool air is very welcome.",
              badge: "bg-pink-500/20 text-pink-300 border-pink-500/30",
            },
            {
              season: "Jun–Sep",
              label: "Monsoon",
              icon: "🌧️",
              text: "Waterfalls at absolute maximum. Roads can flood suddenly. Experienced travellers only — but the views are unreal.",
              badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
            },
          ].map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
              <div className="text-2xl">{s.icon}</div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono text-stone-300 font-bold">{s.season}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${s.badge}`}>{s.label}</span>
              </div>
              <p className="text-xs text-stone-400 font-sans leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEARBY CONNECTIONS ─────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <ArrowRight className="w-4 h-4 text-stone-500" />
          <h2 className="text-lg font-display font-bold text-stone-900">While You're in the Area</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              name: "Mawlynnong",
              dist: "90 km from Sohra",
              tag: "Asia's Cleanest Village",
              desc: "The sky-walk here offers the best view of betel nut plantations and the Bangladesh flatlands. Tiny, spotless, extraordinary.",
              emoji: "🌳",
            },
            {
              name: "Dawki (Umngot River)",
              dist: "65 km from Sohra",
              tag: "Crystal River Boating",
              desc: "The Umngot river at Dawki is so clear that boats appear to float in air. Best combined with Sohra on a 2-day loop from Shillong.",
              emoji: "🚣",
            },
            {
              name: "Mawsynram",
              dist: "20 km from Sohra",
              tag: "Wettest Place on Earth",
              desc: "Officially the world's highest annual rainfall (competing with Sohra). A quick detour reveals a Shivalinga-shaped stalagmite cave at Mawjymbuin.",
              emoji: "🌊",
            },
          ].map((place, i) => (
            <div key={i} className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-5 space-y-2">
              <div className="text-2xl">{place.emoji}</div>
              <div>
                <h3 className="font-display font-bold text-stone-900 text-sm">{place.name}</h3>
                <span className="text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                  {place.tag}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-mono">{place.dist}</p>
              <p className="text-xs text-stone-600 font-sans leading-relaxed">{place.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
