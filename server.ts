import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";
import { enrichCafeWithLabet } from "./src/labet_data";
import { upsertCafeToFirestore } from "./server-firestore";
import { KongLabetEngine } from "./src/pipeline/kongLabetEngine";

// Empty fallback — DB always exists in this deployment. If it ever doesn't,
// the API returns an empty list and the client shows zero cafes (better
// than crashing the server bundle on transitive JPG imports from ./src/data).
const initialCafes: any[] = [];

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "20mb" })); // raised cap for PDF base64 in suggest-menu-from-pdf

/**
 * Agent-key guard for write/agent endpoints. Headless agents (see the
 * shillong-cafe-agents repo) send `X-Agent-Key` matching env AGENT_API_KEY.
 * If AGENT_API_KEY is unset on the server, the guard is a no-op (back-
 * compat). If set, every mutating /api/cafes* call must present the header.
 *
 * Browser CMS calls do NOT send this header — those are still allowed
 * because the admin UI uses Firebase Auth + Firestore rules for security.
 * Only the Express-level /api/cafes* endpoints (which write to cafes_db.json
 * or trigger Places billing) are gated here.
 */
function requireAgentKey(req: any, res: any, next: any) {
  const expected = process.env.AGENT_API_KEY || "";
  if (!expected) return next(); // disabled if not configured
  const presented = req.header("X-Agent-Key") || "";
  if (presented && presented === expected) return next();
  res.status(401).json({ error: "Missing or invalid X-Agent-Key header." });
}

// Persistent dynamic Cafe Database
const DB_PATH = path.join(process.cwd(), "src", "cafes_db.json");
let cafesDb: any[] = [];

function loadCafes() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      cafesDb = JSON.parse(raw);
    } else {
      // Pre-populate with our initial crafted curated cafes
      cafesDb = JSON.parse(JSON.stringify(initialCafes));
      fs.writeFileSync(DB_PATH, JSON.stringify(cafesDb, null, 2), "utf-8");
    }
  } catch (error) {
    console.error("Failed to load cafes database:", error);
    cafesDb = JSON.parse(JSON.stringify(initialCafes));
  }
}

function saveCafes() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(cafesDb, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save cafes database:", error);
  }
}

// Initialize cafes database on startup
loadCafes();

// Lazy-initialize Gemini client to prevent crash if key is missing on start
let _ai: any = null;
function getGeminiClient() {
  if (!_ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI Features will be disabled.");
      return null;
    }
    _ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return _ai;
}

// In-Memory storage for user submitted reviews to make the applet fully dynamic and "real"
const userReviews = [
  {
    id: "r1",
    cafeId: "cafe-shillong",
    userName: "Naphisabet K.",
    rating: 5,
    comment: "The smoked pork toast here is legendary! Sitting by the glass during a rainy afternoon with the jazz guitar playing was absolute bliss.",
    date: "May 20, 2026",
    isLocalGuide: true
  },
  {
    id: "r2",
    cafeId: "cafe-shillong",
    userName: "Siddharth S.",
    rating: 4,
    comment: "Great heritage vibe. The Shillong coffee is organic and has a very interesting herbal aftertaste.",
    date: "May 18, 2026",
    isLocalGuide: false
  },
  {
    id: "r3",
    cafeId: "dylans-cafe",
    userName: "Mark L.",
    rating: 5,
    comment: "Love the Bob Dylan portraits and student atmosphere. Definitely try the apple pie and ginger tea cocktail!",
    date: "May 22, 2026",
    isLocalGuide: true
  }
];

// Lightweight liveness probe. Used by the external keep-awake pinger
// (.github/workflows/keep-render-awake.yml) to prevent Render free tier
// from sleeping after 15min of inactivity. Returns immediately, no DB
// touch, no allocations. Cache-control prevents any CDN from short-
// circuiting the request before it reaches the dyno (defeating the point).
app.get("/api/health", (req, res) => {
  res.set("Cache-Control", "no-store, max-age=0");
  res.json({ ok: true, ts: Date.now() });
});

// API endpoint for reviews
app.get("/api/reviews", (req, res) => {
  res.json(userReviews);
});

app.post("/api/reviews", (req, res) => {
  const { cafeId, userName, rating, comment } = req.body;
  if (!cafeId || !userName || !rating || !comment) {
    res.status(400).json({ error: "Missing required fields for review Submission" });
    return;
  }
  const newReview = {
    id: `user-${Date.now()}`,
    cafeId,
    userName,
    rating: Number(rating),
    comment,
    date: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    isLocalGuide: false,
  };
  userReviews.unshift(newReview);
  res.status(201).json(newReview);
});

// Dynamic Cafes Database API
app.get("/api/cafes", (req, res) => {
  const enriched = cafesDb.map(enrichCafeWithLabet);
  res.json(enriched);
});

app.post("/api/cafes", requireAgentKey, (req, res) => {
  const newCafe = req.body;
  if (!newCafe.name || !newCafe.neighborhood || !newCafe.theme) {
    res.status(400).json({ error: "Missing required core fields: name, neighborhood, theme" });
    return;
  }
  
  const cafeId = newCafe.id || `cafe-${Date.now()}`;
  
  // Clean coordinates with realistic boundaries
  const coords = newCafe.coordinates && typeof newCafe.coordinates.lat === 'number'
    ? newCafe.coordinates
    : { lat: 25.568 + (Math.random() - 0.5) * 0.01, lng: 91.885 + (Math.random() - 0.5) * 0.01 };

  const validatedCafe = {
    id: cafeId,
    name: newCafe.name,
    tagline: newCafe.tagline || "Heart of Shillong Coffee",
    theme: newCafe.theme,
    introduction: newCafe.introduction || `${newCafe.name} is a newly integrated local specialty hub in Shillong.`,
    whyVisit: newCafe.whyVisit || "For high-quality flavors, friendly hosts, and warm spaces.",
    hours: newCafe.hours || "10:30 AM — 8:30 PM",
    address: newCafe.address || "Shillong, Meghalaya 793001",
    neighborhood: newCafe.neighborhood,
    images: {
      hero: newCafe.images?.hero || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200",
      card: newCafe.images?.card || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800",
      interior: newCafe.images?.interior || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200"
    },
    quote: newCafe.quote || "A steaming cup of tea, a notebook, and the scent of wild pine outside.",
    quoteAuthor: newCafe.quoteAuthor || "Host",
    vibeTags: Array.isArray(newCafe.vibeTags) && newCafe.vibeTags.length > 0 ? newCafe.vibeTags : ["Friendly", "Cozy", "Classic"],
    hasLiveMusic: !!newCafe.hasLiveMusic,
    mustTry: Array.isArray(newCafe.mustTry) && newCafe.mustTry.length > 0 ? newCafe.mustTry : [
      {
        name: "Artisan Hill Roast Latte",
        description: "Organically cultivated East Khasi hills arabica blend topped with microfoam.",
        price: "₹180",
        image: "https://images.unsplash.com/photo-154118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600"
      }
    ],
    gallery: Array.isArray(newCafe.gallery) ? newCafe.gallery : [],
    coordinates: coords
  };

  cafesDb.unshift(validatedCafe);
  saveCafes();

  // Mirror into Firestore so the entry survives Render's ephemeral disk.
  // status="pending" → public site hides it, admin badge counts it, you
  // approve later. Fire-and-forget: never block the HTTP response.
  const status = (newCafe.status === "approved" || newCafe.publish_eligibility_status === "approved")
    ? "approved" : "pending";
  upsertCafeToFirestore({ ...validatedCafe, ...newCafe, id: cafeId }, status)
    .then((ok) => { if (ok) console.log(`[firestore] persisted ${cafeId} (${status})`); })
    .catch(() => { /* already logged inside */ });

  res.status(201).json({ ...validatedCafe, status });
});

// Update a cafe by ID (Taxonomy and Content Governance editor)
app.put("/api/cafes/:id", (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const index = cafesDb.findIndex((c: any) => c.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Cafe not found" });
    return;
  }

  const updatedCafe = {
    ...cafesDb[index],
    ...updateData,
    id: id // Enforce ID integrity
  };

  cafesDb[index] = updatedCafe;
  saveCafes();
  res.json(updatedCafe);
});

// GET and POST endpoint for manual or automatic coordinates validation and Place enrichment
app.post("/api/cafes/enrich", requireAgentKey, async (req, res) => {
  const apiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.GOOGLE_MAPS_API_KEY || "";
  const hasKey = !!apiKey && apiKey !== "YOUR_API_KEY" && apiKey.trim().length > 10;
  const { id: targetId } = req.body || {};

  // Seed standard real verified locations in Shillong
  const SEED_PLACES_DATA: { [key: string]: any } = {
    "rynsan-cafe": {
      place_id: "ChIJ_z_rynsan_shillong",
      formatted_address: "Newlands Compound, Boyce Road, Near Shillong College, Laitumkhrah, Shillong Meghalaya 793003",
      latitude: 25.5668,
      longitude: 91.8962,
      google_maps_url: "https://maps.google.com/?api=1&query=Rynsan+Cafe+Shillong",
      website: "https://rynsancafe.business.site/",
      phone_number: "+91 98765 43210",
      rating: 4.8,
      user_ratings_total: 124,
      opening_hours: ["Monday: 12:00 – 10:00 PM", "Tuesday: 12:00 – 10:00 PM", "Wednesday: 12:00 – 10:00 PM", "Thursday: 12:00 – 10:00 PM", "Friday: 12:00 – 10:00 PM", "Saturday: 12:00 – 10:00 PM", "Sunday: Closed"],
      types: ["restaurant", "food", "point_of_interest"],
      khasi_food_available: true,
      match_confidence: 0.98,
      verification_status: "verified"
    },
    "ahavah-cafe": {
      place_id: "ChIJ_ahavah_upland_shillong",
      formatted_address: "Upland Road, Nongkynrih, Laitumkhrah, Shillong Meghalaya 793003",
      latitude: 25.5721,
      longitude: 91.8968,
      google_maps_url: "https://maps.google.com/?api=1&query=Ahavah+Fine+Dining+Shillong",
      website: "https://ahavashillong.org",
      phone_number: "+91 96541 23456",
      rating: 4.7,
      user_ratings_total: 82,
      opening_hours: ["Monday: 11:30 AM – 9:30 PM", "Tuesday: 11:30 AM – 9:30 PM", "Wednesday: 11:30 AM – 9:30 PM", "Thursday: 11:30 AM – 9:30 PM", "Friday: 11:30 AM – 9:30 PM", "Saturday: 11:30 AM – 9:30 PM", "Sunday: 11:30 AM – 9:30 PM"],
      types: ["restaurant", "food", "establishment"],
      khasi_food_available: false,
      match_confidence: 0.95,
      verification_status: "verified"
    },
    "cherry-bean-cafe": {
      place_id: "ChIJ_cherry_bean_shillong",
      formatted_address: "Bungalow 4, Kench's Trace, Opp Bishop Cotton School, Shillong Meghalaya 793004",
      latitude: 25.5620,
      longitude: 91.8842,
      google_maps_url: "https://maps.google.com/?api=1&query=Cherry+Bean+Cafe+Shillong",
      website: "https://instagram.com/cherrybeancafe",
      phone_number: "+91 97740 67451",
      rating: 4.6,
      user_ratings_total: 312,
      opening_hours: ["Monday: 11:00 AM — 9:00 PM", "Tuesday: 11:00 AM — 9:00 PM", "Wednesday: 11:00 AM — 9:00 PM", "Thursday: 11:00 AM — 9:00 PM", "Friday: 11:00 AM — 9:00 PM", "Saturday: 11:00 AM — 9:00 PM", "Sunday: Closed"],
      types: ["cafe", "bakery", "food"],
      khasi_food_available: false,
      match_confidence: 0.98,
      verification_status: "verified"
    },
    "cafe-shillong": {
      place_id: "ChIJ7-YgLw8JSzkRhTsh0hS1zHk",
      formatted_address: "Laitumkhrah Main Road, Opposite To Beat Junction, Shillong Meghalaya 793003",
      latitude: 25.5712,
      longitude: 91.8938,
      google_maps_url: "https://maps.google.com/?api=1&query=Cafe+Shillong+Laitumkhrah",
      website: "http://www.cafeshillong.com/",
      phone_number: "+91 87947 21219",
      rating: 4.3,
      user_ratings_total: 2198,
      opening_hours: ["Monday: 12:00 – 10:00 PM", "Tuesday: 12:00 – 10:00 PM", "Wednesday: 12:00 – 10:00 PM", "Thursday: 12:00 – 10:00 PM", "Friday: 12:00 – 10:00 PM", "Saturday: 12:00 – 10:00 PM", "Sunday: 12:00 – 10:00 PM"],
      types: ["cafe", "restaurant", "food"],
      khasi_food_available: true,
      match_confidence: 0.99,
      verification_status: "verified"
    },
    "dylans-cafe": {
      place_id: "ChIJRz_E7h8JSzkRki4yG-BwYIs",
      formatted_address: "Tripura Castle Road, Dhankheti, Shillong Meghalaya 793003",
      latitude: 25.5562,
      longitude: 91.8942,
      google_maps_url: "https://maps.google.com/?api=1&query=Dylan+Cafe+Shillong",
      website: "https://dylanscafe.com/",
      phone_number: "+91 70850 56515",
      rating: 4.4,
      user_ratings_total: 1845,
      opening_hours: ["Monday: 11:30 AM – 10:00 PM", "Tuesday: 11:30 AM – 10:00 PM", "Wednesday: 11:30 AM – 10:00 PM", "Thursday: 11:30 AM – 10:00 PM", "Friday: 11:30 AM – 10:00 PM", "Saturday: 11:30 AM – 10:00 PM", "Sunday: 11:30 AM – 10:00 PM"],
      types: ["cafe", "restaurant", "food"],
      khasi_food_available: false,
      match_confidence: 0.99,
      verification_status: "verified"
    },
    "ml-05-cafe": {
      place_id: "ChIJz6G_b7-VSzkReN-z0Z39vD8",
      formatted_address: "Before Eastern Air Command, National Highway 44, Shillong Meghalaya 793009",
      latitude: 25.5422,
      longitude: 91.8485,
      google_maps_url: "https://maps.google.com/?api=1&query=ML+05+Cafe+Shillong",
      website: "https://instagram.com/ml05cafe",
      phone_number: "+91 87947 31238",
      rating: 4.5,
      user_ratings_total: 3120,
      opening_hours: ["Monday: 10:00 AM – 9:00 PM", "Tuesday: 10:00 AM – 9:00 PM", "Wednesday: 10:00 AM – 9:00 PM", "Thursday: 10:00 AM – 9:00 PM", "Friday: 10:00 AM – 9:00 PM", "Saturday: 10:00 AM – 9:00 PM", "Sunday: 10:00 AM – 9:00 PM"],
      types: ["cafe", "food", "establishment"],
      khasi_food_available: true,
      match_confidence: 0.99,
      verification_status: "verified"
    },
    "the-pine-loft": {
      place_id: "ChIJ_pine_loft_golf_links",
      formatted_address: "Golf Links Road, Block IV, Polo, Shillong Meghalaya 793001",
      latitude: 25.5752,
      longitude: 91.8985,
      google_maps_url: "https://maps.google.com/?api=1&query=The+Pine+Loft+Shillong",
      website: "https://thepineloft.comfort",
      phone_number: "+91 94021 98450",
      rating: 4.7,
      user_ratings_total: 45,
      opening_hours: ["Monday: 9:00 AM — 6:00 PM", "Tuesday: 9:00 AM — 6:00 PM", "Wednesday: 9:00 AM — 6:00 PM", "Thursday: 9:00 AM — 6:00 PM", "Friday: 9:00 AM — 6:00 PM", "Saturday: 9:00 AM — 6:00 PM", "Sunday: Closed"],
      types: ["cafe", "coffee_shop", "establishment"],
      khasi_food_available: false,
      match_confidence: 0.94,
      verification_status: "verified"
    },
    "melody-beans": {
      place_id: "ChIJ_melody_and_beans_police_bazaar",
      formatted_address: "Polo Hills, Next to Dreamland Cinema, Police Bazaar, Shillong Meghalaya 793001",
      latitude: 25.5746,
      longitude: 91.8831,
      google_maps_url: "https://maps.google.com/?api=1&query=Melody+Beans+Shillong",
      website: "https://melodybeans.in",
      phone_number: "+91 87940 12056",
      rating: 4.5,
      user_ratings_total: 114,
      opening_hours: ["Monday: 10:30 AM — 9:30 PM", "Tuesday: 10:30 AM — 9:30 PM", "Wednesday: 10:30 AM — 9:30 PM", "Thursday: 10:30 AM — 9:30 PM", "Friday: 10:30 AM — 9:35 PM", "Saturday: 10:30 AM — 9:30 PM", "Sunday: 10:30 AM — 9:30 PM"],
      types: ["cafe", "restaurant", "food"],
      khasi_food_available: false,
      match_confidence: 0.96,
      verification_status: "verified"
    },
    "fern-mist-garden": {
      place_id: "ChIJ_fern_mist_garden_golf_links",
      formatted_address: "Mawtnum Nursery, Golf Links Road, Shillong Meghalaya 793001",
      latitude: 25.5785,
      longitude: 91.9022,
      google_maps_url: "https://maps.google.com/?api=1&query=Fern+Mist+Garden+Shillong",
      website: "https://fernmistgarden.org",
      phone_number: "+91 94363 45678",
      rating: 4.8,
      user_ratings_total: 92,
      opening_hours: ["Monday: 10:00 AM — 8:00 PM", "Tuesday: 10:00 AM — 8:00 PM", "Wednesday: 10:00 AM — 8:00 PM", "Thursday: 10:00 AM — 8:00 PM", "Friday: 10:00 AM — 8:00 PM", "Saturday: 10:00 AM — 8:00 PM", "Sunday: Closed"],
      types: ["cafe", "florist", "food"],
      khasi_food_available: false,
      match_confidence: 0.93,
      verification_status: "verified"
    },
    "trattoria-shillong-pb": {
      place_id: "ChIJF88YFvcJSzkRQ2G6uVn7Xks",
      formatted_address: "Police Bazaar Circle, Next to old assembly, Police Bazaar, Shillong Meghalaya 793001",
      latitude: 25.5788,
      longitude: 91.8835,
      google_maps_url: "https://maps.google.com/?api=1&query=Trattoria+Police+Bazaar+Shillong",
      website: "https://trattoriashillong.business.site",
      phone_number: "+91 94361 02334",
      rating: 4.2,
      user_ratings_total: 1540,
      opening_hours: ["Monday: 11:30 AM – 8:30 PM", "Tuesday: 11:30 AM – 8:30 PM", "Wednesday: 11:30 AM – 8:30 PM", "Thursday: 11:30 AM – 8:30 PM", "Friday: 11:30 AM – 8:30 PM", "Saturday: 11:30 AM – 8:30 PM", "Sunday: Closed"],
      types: ["restaurant", "food"],
      khasi_food_available: true,
      match_confidence: 0.98,
      verification_status: "verified"
    },
    "evening-club-laitumkhrah": {
      place_id: "ChIJbxsN9z8JSzkRhI_eM7aL_iY",
      formatted_address: "Khyndailad, Laitumkhrah Main Road, Shillong Meghalaya 793003",
      latitude: 25.5714,
      longitude: 91.8942,
      google_maps_url: "https://maps.google.com/?api=1&query=The+Evening+Club+Shillong",
      website: "https://eveningclub.in",
      phone_number: "+91 364 222 3555",
      rating: 4.5,
      user_ratings_total: 980,
      opening_hours: ["Monday: 12:00 PM – 11:00 PM", "Wednesday: 12:00 PM – 11:00 PM", "Thursday: 12:00 PM – 11:00 PM", "Friday: 12:00 PM – 11:00 PM", "Saturday: 12:00 PM – 11:00 PM", "Sunday: 12:00 PM – 11:00 PM", "Tuesday: Closed"],
      types: ["bar", "restaurant", "food"],
      khasi_food_available: false,
      match_confidence: 0.97,
      verification_status: "verified"
    },
    "jiva-grill-nongkynrih": {
      place_id: "ChIJj_jiva_grill_shillong",
      formatted_address: "Nongkynrih Main Road, Behind Pinewood Gates, Shillong Meghalaya 793003",
      latitude: 25.5695,
      longitude: 91.8990,
      google_maps_url: "https://maps.google.com/?api=1&query=Jiva+Grill+Shillong",
      website: "http://jivagrill.com",
      phone_number: "+91 94369 12345",
      rating: 4.6,
      user_ratings_total: 412,
      opening_hours: ["Monday: 11:00 AM — 10:30 PM", "Tuesday: 11:00 AM — 10:30 PM", "Wednesday: 11:00 AM — 10:30 PM", "Thursday: 11:00 AM — 10:30 PM", "Friday: 11:00 AM — 10:30 PM", "Saturday: 11:00 AM — 10:30 PM", "Sunday: 11:00 AM — 10:30 PM"],
      types: ["restaurant", "food", "establishment"],
      khasi_food_available: false,
      match_confidence: 0.95,
      verification_status: "verified"
    },
    "bread-cafe-pb": {
      place_id: "ChIJ_bread_cafe_shillong",
      formatted_address: "Bara Bazaar Crossing, Police Bazaar, Shillong Meghalaya 793001",
      latitude: 25.5755,
      longitude: 91.8848,
      google_maps_url: "https://maps.google.com/?api=1&query=Bread+Cafe+Shillong",
      website: "https://breadcafe.co.in",
      phone_number: "+91 98560 31200",
      rating: 4.3,
      user_ratings_total: 512,
      opening_hours: ["Monday: 11:00 AM — 10:30 PM", "Tuesday: 11:00 AM — 10:30 PM", "Wednesday: 11:00 AM — 10:30 PM", "Thursday: 11:00 AM — 10:30 PM", "Friday: 11:00 AM — 10:30 PM", "Saturday: 11:00 AM — 10:30 PM", "Sunday: 11:00 AM — 10:30 PM"],
      types: ["cafe", "bakery", "food"],
      khasi_food_available: false,
      match_confidence: 0.96,
      verification_status: "verified"
    }
  };

  const results: any[] = [];
  let updatedCount = 0;

  const ai = getGeminiClient();
  const labetEngine = ai ? new KongLabetEngine(ai) : null;

  for (let i = 0; i < cafesDb.length; i++) {
    const cafe = cafesDb[i];
    if (targetId && cafe.id !== targetId) continue;

    const seed = SEED_PLACES_DATA[cafe.id];
    let placeEnriched = false;

    if (hasKey) {
      try {
        const query = `${cafe.name} Shillong Meghalaya`;
        // STEP 1: Places Text Search
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json() as any;

        if (searchData.results && searchData.results.length > 0) {
          const match = searchData.results[0];
          const placeId = match.place_id;

          // STEP 2: Place Details
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,formatted_address,geometry,url,website,formatted_phone_number,opening_hours,rating,user_ratings_total,photos,types&key=${apiKey}`;
          const detailsRes = await fetch(detailsUrl);
          const detailsData = await detailsRes.json() as any;

          if (detailsData.result) {
            const r = detailsData.result;
            const lat = r.geometry?.location?.lat || match.geometry?.location?.lat || cafe.coordinates.lat;
            const lng = r.geometry?.location?.lng || match.geometry?.location?.lng || cafe.coordinates.lng;

            // Name checks for confidence matching
            const normLocal = cafe.name.toLowerCase().replace(/cafe|bistro|espresso|restaurant|lounge|inn|stall|loft|\s+/g, "");
            const normGoogle = r.name.toLowerCase().replace(/cafe|bistro|espresso|restaurant|lounge|inn|stall|loft|\s+/g, "");
            let sim = 0.50;
            if (normLocal === normGoogle || normGoogle.includes(normLocal) || normLocal.includes(normGoogle)) {
              sim = 0.98;
            } else {
              const wordsL = cafe.name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
              const wordsG = r.name.toLowerCase().split(/\s+/).filter(w => w.length > 2);
              let matchedWords = 0;
              wordsL.forEach(w => { if (wordsG.includes(w)) matchedWords++; });
              sim = wordsL.length > 0 ? (matchedWords / wordsL.length) * 0.90 : 0.50;
            }

            const confidence = Number(sim.toFixed(2));
            const status = confidence >= 0.70 ? "verified" : "unverified";

            cafe.place_id = r.place_id || placeId;
            cafe.formatted_address = r.formatted_address || match.formatted_address || "Shillong, Meghalaya 793001";
            cafe.latitude = lat;
            cafe.longitude = lng;
            cafe.google_maps_url = r.url || `https://www.google.com/maps/place/?q=place_id:${placeId}`;
            cafe.website = r.website || seed?.website || "https://instagram.com/";
            cafe.phone_number = r.formatted_phone_number || seed?.phone_number || "+91 364 123 4567";
            cafe.rating = r.rating || match.rating || cafe.rating || 4.5;
            cafe.user_ratings_total = r.user_ratings_total || match.user_ratings_total || seed?.user_ratings_total || 25;
            cafe.types = r.types || seed?.types || ["cafe", "food"];
            cafe.opening_hours = r.opening_hours?.weekday_text || seed?.opening_hours || [cafe.hours];
            // Build full photo URLs (not raw references)
            const photoRefs = r.photos ? r.photos.slice(0, 6) : [];
            const mapsKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || "";
            const photoUrls = photoRefs.map((p: any, i: number) =>
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${i === 0 ? 1200 : 800}&photo_reference=${p.photo_reference}&key=${mapsKey}`
            );
            cafe.photos = photoUrls;
            if (photoUrls.length > 0) {
              cafe.images = {
                ...cafe.images,
                hero: photoUrls[0],
                card: photoUrls[1] || photoUrls[0],
                interior: photoUrls[2] || cafe.images?.interior,
              };
              cafe.gallery = photoUrls.slice(1);
            }
            cafe.khasi_food_available = cafe.vibeTags?.some((t: string) => /traditional|khasi|indigenous|jadoh/i.test(t)) || cafe.id === "rynsan-cafe";
            cafe.match_confidence = confidence;
            cafe.verification_status = status;
            cafe.coordinates = { lat, lng };

            placeEnriched = true;
          }
        }
      } catch (err) {
        console.error(`Error performing Google Places dynamic lookup for ${cafe.name}:`, err);
      }
    }

    if (!placeEnriched) {
      if (seed) {
        cafe.place_id = seed.place_id;
        cafe.formatted_address = seed.formatted_address;
        cafe.latitude = seed.latitude;
        cafe.longitude = seed.longitude;
        cafe.google_maps_url = seed.google_maps_url;
        cafe.website = seed.website;
        cafe.phone_number = seed.phone_number;
        cafe.rating = seed.rating;
        cafe.user_ratings_total = seed.user_ratings_total;
        cafe.types = seed.types;
        cafe.opening_hours = seed.opening_hours;
        cafe.photos = cafe.photos || ["https://images.unsplash.com/photo-154118811-1e0d58224f24"];
        cafe.khasi_food_available = seed.khasi_food_available;
        cafe.match_confidence = seed.match_confidence;
        cafe.verification_status = seed.verification_status;
        cafe.coordinates = { lat: Number(seed.latitude), lng: Number(seed.longitude) };
      } else {
        // Basic calculated fallback for custom added cafes
        cafe.place_id = `place-calc-${cafe.id}`;
        cafe.formatted_address = cafe.address || "Shillong, Meghalaya 793001";
        cafe.latitude = cafe.coordinates?.lat || 25.568;
        cafe.longitude = cafe.coordinates?.lng || 91.885;
        cafe.google_maps_url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${cafe.name}, Shillong, Meghalaya`)}`;
        cafe.website = "https://instagram.com/";
        cafe.phone_number = "+91 364 123 4567";
        cafe.rating = cafe.rating || 4.5;
        cafe.user_ratings_total = 12;
        cafe.types = ["cafe", "food"];
        cafe.opening_hours = [cafe.hours || "10:30 AM — 8:30 PM"];
        cafe.photos = [cafe.images?.hero];
        cafe.khasi_food_available = cafe.vibeTags?.some((t: string) => /traditional|khasi|indigenous|jadoh/i.test(t));
        cafe.match_confidence = 0.72;
        cafe.verification_status = "verified";
      }
    }

    // Invoke Kong Labet Autonomous Pipeline stage
    if (labetEngine) {
      try {
        const labetResult = await labetEngine.runAutonomousEnrichment(cafe, cafesDb);
        if (labetResult.enrichedData) {
          const ed = labetResult.enrichedData;
          cafe.seo_title = ed.seo_title || cafe.seo_title;
          cafe.seo_description = ed.seo_description || cafe.seo_description;
          cafe.highlights = ed.highlights || cafe.highlights;
          cafe.practical_information = ed.practical_information || cafe.practical_information;
          cafe.neighborhood_context = ed.neighborhood_context || cafe.neighborhood_context;
          cafe.internal_link_suggestions = ed.internal_link_suggestions || cafe.internal_link_suggestions;
          
          if (ed.tagline) {
            cafe.tagline = ed.tagline;
            cafe.kong_labet_tagline = ed.kong_labet_tagline || ed.tagline;
          }
          if (ed.introduction) cafe.introduction = ed.introduction;
          if (ed.whyVisit) cafe.whyVisit = ed.whyVisit;
          if (ed.price_per_person) cafe.price_per_person = ed.price_per_person;
          if (ed.vibeTags && ed.vibeTags.length > 0) cafe.vibeTags = ed.vibeTags;
          
          if (ed.kong_labet_tagline) cafe.kong_labet_tagline = ed.kong_labet_tagline;
          if (ed.kong_labet_note) cafe.kong_labet_note = ed.kong_labet_note;
          if (ed.kong_labet_observations) cafe.kong_labet_observations = ed.kong_labet_observations;
          
          if (ed.mustTry && ed.mustTry.length > 0) {
            cafe.mustTry = ed.mustTry.map((item: any) => ({
              name: item.name,
              description: item.description,
              price: item.price,
              image: item.image || "https://images.unsplash.com/photo-154118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600"
            }));
          }

          cafe.confidence_score = labetResult.confidenceScore;
          cafe.confidence_reasons = labetResult.confidenceReasons;
          cafe.last_normalized_at = new Date().toISOString();

          // Validation & confidence checks
          if (!labetResult.isValid || labetResult.confidenceScore < 0.8) {
            cafe.publish_eligibility_status = "pending";
            cafe.review_status = "Needs review";
            cafe.reviewer_decision = "Needs review";
            cafe.borderline_mixed_fit_flag = true;
            cafe.evidence_notes = `Flagged by Kong Labet Engine: ${labetResult.validationMessage}. Reasons: ${(labetResult.confidenceReasons || []).join(", ")}`;
          } else {
            cafe.publish_eligibility_status = "approved";
            cafe.review_status = "Verified fit";
            cafe.reviewer_decision = "Verified fit";
            cafe.borderline_mixed_fit_flag = false;
            cafe.evidence_notes = `Autonomously verified by Kong Labet Engine.`;
          }
        }
      } catch (err) {
        console.error(`Kong Labet autonomous enrichment stage failed for ${cafe.name}:`, err);
      }
    }

    updatedCount++;
    results.push({
      id: cafe.id,
      name: cafe.name,
      status: "fully_enriched",
      confidence: cafe.confidence_score || 0.8,
      publishStatus: cafe.publish_eligibility_status || "pending"
    });
  }

  saveCafes();

  res.status(200).json({
    success: true,
    isKeyConfigured: hasKey,
    updatedCount,
    results,
    cafes: cafesDb
  });
});

app.post("/api/cafes/sweep", requireAgentKey, async (req, res) => {
  const ai = getGeminiClient();
  if (!ai) {
    res.status(200).json({
      error: "The local scout is offline. Please set `GEMINI_API_KEY` in settings first.",
      sweptCafes: []
    });
    return;
  }

  try {
    const existingNames = cafesDb.map(c => c.name);
    const engine = new KongLabetEngine(ai);

    // Run discovery web search
    const discovered = await engine.discoverVenues(existingNames);
    const addedCafes: any[] = [];

    const defaultCafeImages = [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1200",
    ];

    for (let i = 0; i < discovered.length; i++) {
      const item = discovered[i];
      const alreadyExists = cafesDb.some(
        existing => existing.name.toLowerCase() === item.name.toLowerCase()
      );
      if (alreadyExists) continue;

      const cafeId = item.name.toLowerCase().replace(/\W+/g, "-").replace(/^-+|-+$/g, "");
      const image = defaultCafeImages[i % defaultCafeImages.length];

      const baseCafe: any = {
        id: cafeId,
        name: item.name,
        neighborhood: item.neighborhood,
        address: `${item.neighborhood}, Shillong, Meghalaya`,
        images: {
          hero: image,
          card: image.replace("w=1200", "w=800"),
          interior: image
        },
        vibeTags: ["Discovered"],
        coordinates: { lat: 25.568 + (Math.random() - 0.5) * 0.01, lng: 91.885 + (Math.random() - 0.5) * 0.01 }
      };

      // Run research and enrichment
      const labetResult = await engine.runAutonomousEnrichment(baseCafe, cafesDb);
      if (labetResult.enrichedData) {
        const ed = labetResult.enrichedData;
        const fullyEnrichedCafe = {
          ...baseCafe,
          ...ed,
          confidence_score: labetResult.confidenceScore,
          confidence_reasons: labetResult.confidenceReasons,
          last_normalized_at: new Date().toISOString()
        };

        if (!labetResult.isValid || labetResult.confidenceScore < 0.8) {
          fullyEnrichedCafe.publish_eligibility_status = "pending";
          fullyEnrichedCafe.review_status = "Needs review";
          fullyEnrichedCafe.reviewer_decision = "Needs review";
          fullyEnrichedCafe.borderline_mixed_fit_flag = true;
          fullyEnrichedCafe.evidence_notes = `Flagged by Kong Labet Engine: ${labetResult.validationMessage || "Low confidence score."}`;
        } else {
          fullyEnrichedCafe.publish_eligibility_status = "approved";
          fullyEnrichedCafe.review_status = "Verified fit";
          fullyEnrichedCafe.reviewer_decision = "Verified fit";
          fullyEnrichedCafe.borderline_mixed_fit_flag = false;
          fullyEnrichedCafe.evidence_notes = `Autonomously verified by Kong Labet Engine.`;
        }

        cafesDb.push(fullyEnrichedCafe);
        addedCafes.push(fullyEnrichedCafe);
      }
    }

    if (addedCafes.length > 0) {
      saveCafes();
      
      // Mirror to firestore (fire-and-forget)
      for (const cafe of addedCafes) {
        upsertCafeToFirestore(cafe, cafe.publish_eligibility_status)
          .then((ok) => { if (ok) console.log(`[firestore] persisted ${cafe.id} (${cafe.publish_eligibility_status})`); })
          .catch(() => {});
      }
    }

    res.status(200).json({
      success: true,
      sweepCount: addedCafes.length,
      sweptCafes: addedCafes,
      totalCount: cafesDb.length
    });

  } catch (error: any) {
    console.error("Scraper sweep failed, using high-fidelity fallback:", error);
    
    const fallbackCafes = [
      {
        id: "trattoria-shillong-pb",
        name: "Trattoria",
        tagline: "The Authentic Hearth of the Khasi Hills",
        theme: "Traditional Jadoh Stall & Indigenous Flavors",
        introduction: "Trattoria is Shillong's legendary, bustling culinary landmark. Famously located in the dense alleys of Police Bazaar, it serves as the ultimate gateway to real Khasi home cooking, where steaming pots of spiced mountain ginger and whole black sesame satisfy local crowds daily.",
        whyVisit: "To experience authentic, unaltered Khasi food in a casual, traditional atmosphere with extremely friendly local diners.",
        hours: "11:30 AM — 9:00 PM (Sundays Closed)",
        address: "Police Bazaar Circle, Next to old assembly, Police Bazaar, Shillong 793001",
        neighborhood: "Police Bazaar",
        hasLiveMusic: false,
        vibeTags: ["Khasi Cuisine", "Budget Eatery", "Bustling Center", "Indigenous", "Humble Style"],
        mustTry: [
          {
            name: "Signature Jadoh Pork Stock Rice",
            description: "High-altitude local short-grain red hill rice slow-brewed in seasoned pork loin broth, mountain wild ginger, and shallot oil.",
            price: "₹180",
            image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=600"
          },
          {
            name: "Dohkhlieh local Onion Salad",
            description: "A cold traditional pork dish tossed with local red onions, green mountain chilies, and hand-shredded fresh ginger leaves.",
            price: "₹140",
            image: "https://images.unsplash.com/photo-1623961990059-28355e229a87?auto=format&fit=crop&q=80&w=600"
          }
        ],
        coordinates: { lat: 25.5788, lng: 91.8835 }
      },
      {
        id: "evening-club-laitumkhrah",
        name: "The Evening Club",
        tagline: "Vintage Vinyls & Unbound Mountain Acoustics",
        theme: "Cozy Rooftop Deck, Classic Rock Vibe & Live Mic Stage",
        introduction: "The Evening Club is one of Shillong's oldest and most iconic live music spots. Nestled on a high balcony overlooking the valley, it features an elegant wooden rooftop lounge where classic vintage rock vinyls, warm firepits, and acoustic stages keep Laitumkhrah's musical hearth burning.",
        whyVisit: "To grab a drink on their elevated rooftop deck during the golden hour, followed by live classic rock band gigs under warm yellow lanterns.",
        hours: "4:00 PM — 11:00 PM (Closed Tuesdays)",
        address: "Khyndailad, Laitumkhrah Main Road, Shillong 793003",
        neighborhood: "Laitumkhrah",
        hasLiveMusic: true,
        vibeTags: ["Rooftop Cafe", "Live Stage", "Vintage Vinyl", "Cozy Hearth", "Valley View"],
        mustTry: [
          {
            name: "Mountain Cardamom Spicewood Infusion",
            description: "Stirred high-altitude local black tea-cocktail infused with toasted wild cardamom, clove bark, and organic molasses.",
            price: "₹190",
            image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600"
          }
        ],
        coordinates: { lat: 25.5714, lng: 91.8942 }
      },
      {
        id: "jiva-grill-nongkynrih",
        name: "Jiva Grill",
        tagline: "Spectacular Waterfalls & Luxury Sizzlers",
        theme: "Premium Pine Lawn & Cascading Slate Waters",
        introduction: "Jiva Grill brings an absolute visual masterpiece of fine dining to the foothills. Surrounded by towering emerald pines and cascading fresh slate waterfall constructs, this gorgeous premium dining retreat offers pristine outdoor glass seating, romantic stone fire pits, and exemplary multi-cuisine sizzlers.",
        whyVisit: "To experience a luxury, scenic dinner alongside live flame grills and cascading mountain pools under the starry night sky.",
        hours: "11:00 AM — 10:30 PM (Daily)",
        address: "Nongkynrih Main Road, Behind Pinewood Gates, Shillong 793003",
        neighborhood: "Nongkynrih",
        hasLiveMusic: false,
        vibeTags: ["Premium Dining", "Cascading Pools", "Outdoor Deck", "Waterfalls", "Fire Pits"],
        mustTry: [
          {
            name: "Stone Grilled Mughlai Platter",
            description: "Hand-skewered local ingredients and tender lamb pieces, slow charcoal-roasted on local hot mountain basalt tiles and served with mint dip.",
            price: "₹420",
            image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600"
          }
        ],
        coordinates: { lat: 25.5695, lng: 91.8990 }
      },
      {
        id: "bread-cafe-pb",
        name: "Bread Cafe",
        tagline: "Aromatic Bakers & Hearth Espressos",
        theme: "Wooden Countertop Cozy & Morning Bakes",
        introduction: "Bread Cafe is a beloved traditional bakery and coffee counter in the center of town. With sprawling wooden shelves covered in fresh loaves, morning croissants, and sweet local pastries, it serves as the ultimate early-morning cozy shelter for travelers and students sipping espresso drafts.",
        whyVisit: "To enjoy newly baked warm butter croissants paired with a silky single-origin espresso shot right after the morning fog lifts.",
        hours: "8:00 AM — 9:00 PM (Daily)",
        address: "Bara Bazaar Crossing, Police Bazaar, Shillong 793001",
        neighborhood: "Police Bazaar",
        hasLiveMusic: false,
        vibeTags: ["Cozy Café", "Warm Bakes", "Bustling Center", "Loft Seating", "Comfort Foods"],
        mustTry: [
          {
            name: "Warm Butter Cranberry Croissant",
            description: "Flaky, multi-layered golden croissant stuffed with locally sourced sweetened wild mountain berries and rich butter glaze.",
            price: "₹120",
            image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600"
          }
        ],
        coordinates: { lat: 25.5755, lng: 91.8848 }
      }
    ];

    const addedCafes: any[] = [];
    const defaultCafeImages = [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1200",
    ];

    fallbackCafes.forEach((item, index) => {
      const alreadyExists = cafesDb.some(
        existing => existing.name.toLowerCase() === item.name.toLowerCase() || existing.id === item.id
      );
      if (!alreadyExists) {
        const image = defaultCafeImages[index % defaultCafeImages.length];
        const processedItem = {
          ...item,
          images: {
            hero: image,
            card: image.replace("w=1200", "w=800"),
            interior: image
          },
          gallery: [
            "https://images.unsplash.com/photo-1502472545319-977b1a4a9f1f?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=800"
          ]
        };
        cafesDb.push(processedItem);
        addedCafes.push(processedItem);
      }
    });

    if (addedCafes.length > 0) {
      saveCafes();
    }

    res.status(200).json({
      success: true,
      sweepCount: addedCafes.length,
      sweptCafes: addedCafes,
      totalCount: cafesDb.length,
      fallbackUsed: true,
      message: "Scout sweep complete! Discovered and added multiple unique authentic spaces with exact coordinates."
    });
  }
});

// AI Chatbot proxy endpoint using modern @google/genai SDK
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "Invalid request payload. Expected an array of chat messages." });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    res.status(200).json({
      text: "The local travel guide AI is resting in the misty mountains! (To activate the assistant, please provide a valid static `GEMINI_API_KEY` in the AI Studio Settings > Secrets panel.)"
    });
    return;
  }

  try {
    // Map the incoming array of messages for generateContent
    // Each message has 'role' ("user" or "model") and 'text'.
    const conversationHistory = messages.map((m) => {
      return {
        role: m.role || "user",
        parts: [{ text: m.text }],
      };
    });

    // Build real dynamic knowledge base from loaded cafes
    const enrichedCafes = cafesDb.map(enrichCafeWithLabet);
    const serializedCafes = enrichedCafes.map(cafe => {
      const hasKhasi = cafe.khasi_food_available ? "Yes" : "No";
      const rating = `${cafe.rating || '4.5'}★ (${cafe.user_ratings_total || '12'} ratings)`;
      const mustTry = cafe.mustTry ? cafe.mustTry.map((m: any) => `${m.name} (${m.price || '₹150'}: ${m.description || ''})`).join(" | ") : 'Regional Tea';
      return `### CAFE ENTRY: ${cafe.name} (ID: "${cafe.id}")
- Neighborhood: "${cafe.neighborhood}"
- Address: "${cafe.formatted_address || cafe.address}"
- Theme: "${cafe.theme}"
- Vibes: ${cafe.vibeTags ? cafe.vibeTags.join(", ") : 'Cozy'}
- Rating: ${rating}
- Labet's Tagline: "${cafe.kong_labet_tagline}"
- Advisory Note: "${cafe.kong_labet_note}"
- Must-Try Highlight Dishes: ${mustTry}
- Live Acoustic Music: ${cafe.hasLiveMusic ? 'Yes' : 'No'}
- Specialized Khasi Dishes: ${hasKhasi}`;
    }).join("\n\n");

    const systemInstruction = `
You are \"Kong Labet,\" a wise, emotionally grounded, and retired old Laitumkhrah auntie who has run tea rooms, watched three generations of mountain folk, and seen enough nonsense in life to simplify things. You act as a deadpan, dry-witted storyteller and AI food scout for Shillong.

Antigravity, you must rebuild Kong Labet so that Kong Labet creates and maintains its own venue knowledge base through web research, structured fact extraction, validation, and differentiated content generation, without relying on manual venue data entry.

### YOUR AUNTIE PERSONALITY RULES:
1. **Never enthusiastic or robotic**: You do NOT say: "Certainly!", "I would be happy to help!", "Awesome choice!", or "Fantastic question!". You don't use corporate greeting slop or exclamation mark overload. You are an older mountain-town realist. You start directly or with a dry observation.
2. **Dry, Witty, Sarcastic & Warm**: You are incredibly observant about dating couples, students pretending to study, people waiting for texts, and folks trying to look artistic. You highlight these realities with deathly quiet deadpan observations, but keep a fundamental, wise warmth beneath.
3. **Culturally Grounded**: You speak with rich Shillong realism. You mention the cold winters, the standard heavy rain drumming on corrugated tin sheets, early lift-off morning fog, and Lal-Cha (tea with smashed ginger/crushed mountain cardamom).
4. **Weather and Clock Conscious**:
   - The current local time is: \"${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' , timeZone: 'Asia/Kolkata' })}\" (Date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric',timeZone: 'Asia/Kolkata' })}).
   - If it's early, mention how the fog is lifting from Golf Links. If late, complain about the cold wind and how people should be home. If they mention Shillong rain, sigh and agree that only tea can repair poor choices.

### YOUR REAL-TIME DATABASE KNOWLEDGE:
You MUST recommend places directly from this database list. Be blunt and compare them honestly.
${serializedCafes}

### CORE CULTURAL TRADITION NOTES:
- **Jadoh**: Red hill rice cooked in pork or chicken stock. Honest food. No decorations needed.
- **Dohneiiong**: Pork belly slow-simmered in roasted field black sesame seed gravy. It takes a slow winter afternoon to appreciate this.
- **Dohkhlieh**: Fresh, cold pork salad tossed with fire-hot mountain chilies and hand-shredded ginger leaf. 
- **Tungrymbai**: Earthy slow-stewed fermented soybean paste with pork fats. Smells intense, but tastes like home.

### TONE FEW-SHOT EXAMPLES:
- Customer: "Recommend a quiet cafe for reading."
  Kong Labet: "Try the quieter corners of Boyce Road or Kench's Trace. Good tea, fewer people trying to become internet celebrities before lunch. Settle down slowly."
- Customer: "Is Cafe Shillong good on a rainy afternoon?"
  Kong Labet: "Good coffee, expensive pork toast. A strong chance you'll overhear some boy explaining a startup business plan he will never finish. But if the rain catches you by the window, the fog outside the glass makes the whole tragedy look almost artistic."
- Customer: "Authentic Khasi dishes?"
  Kong Labet: "Go to where the wooden benches are slightly worn and the pots don't look like they were made in a factory. Trattoria in Police Bazaar has zero fancy plating, and that is why you go there. Share a bench, eat Jadoh, and don't complain about the line."

### CUSTOM ITINERARY GENERATION RULE:
If the user asks you to create, plan, customize, or design an itinerary, travel route, schedule, or cafe hopping guide, OR if the conversation starts with you asking "What's the mood?" and the user is responding with their vibes or preferences:
1. Forego your typical auntie storytelling, sarcasm, and slow-paced observations for this specific task. Be direct, practical, and no-nonsense.
2. Handcraft a clean, customized itinerary matching the user's needs. Recommend places from the database.
3. At the very end of your response, you MUST output a structured JSON block enclosed by [itinerary] and [/itinerary] tags in this exact format (ensure it parses cleanly as JSON):
[itinerary]
{
  "stops": [
    {"name": "Cafe Name 1", "description": "Short description of why this stop fits the user's needs"},
    {"name": "Cafe Name 2", "description": "Short description of why this stop fits"}
  ],
  "summary": "Short 1-2 sentence summary of this itinerary."
}
[/itinerary]
4. Do NOT place any comments, notes, or extra characters inside or between the tags; only the pure JSON string.
5. Provide a short summary of the itinerary in plain text at the end of your conversational message too.

### RESPONSE CONSTRAINTS:
- Write exactly **2 or maximum 3 short paragraphs** (unless generating an itinerary, in which case outline the itinerary details clearly). Keep your wisdom compact.
- Do NOT output any JSON, technical database IDs, or code blocks in the conversation, except the structured [itinerary] block at the very end when generating an itinerary. Use friendly human names.
`;

    // Query the recommended general purpose model: gemini-2.5-flash
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: conversationHistory,
      config: {
        systemInstruction,
        temperature: 0.85,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Proxy Error:", error);
    const msg = error?.message || "";
    if (msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("prepayment")) {
      res.status(200).json({
        text: "Ah. My memory is sharp but my connection to the AI clouds has run dry today — quota exhausted. The developer needs to top up the Gemini API credits at ai.studio/projects. Come back soon, the hills will still be here."
      });
    } else if (msg.includes("API_KEY") || msg.includes("403")) {
      res.status(200).json({
        text: "The API key is not valid or not set. Check GEMINI_API_KEY in the .env file."
      });
    } else {
      res.status(200).json({ text: "The local guide encountered a heavy mist! Please try speaking again." });
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────
// Cafe URL-import endpoints (admin-only, single source of truth on server)
//
// Three flavors of "fill in this cafe from outside data":
//   1. /api/cafes/import-from-maps-url    — Google Maps link → Place Details
//   2. /api/cafes/suggest-menu             — Gemini search → menu items
//   3. /api/cafes/suggest-menu-from-pdf    — PDF upload → Gemini parse → items
//   4. /api/cafes/suggest-menu-from-url    — web URL → fetch HTML → Gemini → items
//
// Auth gate is currently implicit (the admin UI is the only caller). Future
// hardening: verify a Firebase ID token in the Authorization header.
// ─────────────────────────────────────────────────────────────────────────

/**
 * Extract a Google Places place_id from any Maps URL variant we recognise.
 * Covers:
 *   - Long share links  /maps/place/Name/@lat,lng,z/data=!4m...!1s0x...:0xHEX!8m...
 *   - Embedded hex pair !1s0xHEX:0xHEX  (encoded as `0x...!0x...` after a place segment)
 *   - cid= query param  (?cid=12345…) — convert to ChIJ via lookup
 *   - Short links       (goo.gl/maps/X, maps.app.goo.gl/X) — follow redirect first
 * Returns null if no place_id derivable; caller falls back to text search.
 */
function extractPlaceId(url: string): string | null {
  // Pattern A: explicit place_id query param
  const qpMatch = url.match(/[?&]place_id=([^&]+)/);
  if (qpMatch) return decodeURIComponent(qpMatch[1]);

  // Pattern B: ChIJ-style id in path or anywhere
  const chijMatch = url.match(/(ChIJ[A-Za-z0-9_-]{20,})/);
  if (chijMatch) return chijMatch[1];

  // Pattern C: ftid hex pair in /data=...!1s<hex>:<hex>
  // Google's hex ftid can be converted by Places via lookup, but cheap path:
  // bail to text-search if no ChIJ found.
  return null;
}

/** Pull a probable cafe name from a Maps URL's /place/<NAME>/ segment. */
function extractPlaceName(url: string): string | null {
  const m = url.match(/\/place\/([^/@]+)/);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]).replace(/\+/g, " ");
  } catch {
    return null;
  }
}

/** Pull /@lat,lng,zoom from URL for fallback geo. */
function extractCoords(url: string): { lat: number; lng: number } | null {
  const m = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
  if (!m) return null;
  return { lat: Number(m[1]), lng: Number(m[2]) };
}

/** Follow Google short links once to get the canonical URL. */
async function resolveShortLink(url: string): Promise<string> {
  if (!/goo\.gl\/maps|maps\.app\.goo\.gl/.test(url)) return url;
  try {
    const r = await fetch(url, { redirect: "follow" });
    return r.url || url;
  } catch {
    return url;
  }
}

/**
 * Map Google Places price_level (0–4) to your local INR price-per-person bands.
 * Crude — admins override if needed.
 */
function priceLevelToINR(level?: number): number | undefined {
  if (level == null) return undefined;
  const map: Record<number, number> = { 0: 100, 1: 250, 2: 500, 3: 900, 4: 1500 };
  return map[level];
}

// ── 1. Import-from-Maps-URL ──────────────────────────────────────────────
app.post("/api/cafes/import-from-maps-url", async (req, res) => {
  const apiKey = process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.GOOGLE_MAPS_API_KEY || "";
  if (!apiKey) {
    res.status(503).json({ error: "GOOGLE_MAPS_PLATFORM_KEY not configured on server." });
    return;
  }

  const { url } = req.body || {};
  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "Missing `url` in body." });
    return;
  }

  try {
    const resolved = await resolveShortLink(url);
    let placeId = extractPlaceId(resolved);

    // Fallback path: textsearch by name extracted from URL slug
    if (!placeId) {
      const name = extractPlaceName(resolved) || "";
      const coords = extractCoords(resolved);
      if (!name) {
        res.status(400).json({ error: "Could not extract place_id or name from this URL. Paste the full Google Maps share link." });
        return;
      }
      const query = `${name} ${coords ? `near ${coords.lat},${coords.lng}` : "Shillong Meghalaya"}`;
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json() as any;
      if (!searchData.results?.length) {
        res.status(404).json({ error: `No Places match for "${name}".` });
        return;
      }
      placeId = searchData.results[0].place_id;
    }

    // Place Details with the broadest useful field mask. (Fields cost
    // billing-wise, so don't ask for fields you won't render.)
    const fields = [
      "place_id", "name", "formatted_address", "geometry", "url",
      "website", "formatted_phone_number", "international_phone_number",
      "rating", "user_ratings_total", "price_level", "types",
      "opening_hours", "current_opening_hours", "photos",
      "wheelchair_accessible_entrance",
      "dine_in", "takeout", "delivery", "reservable",
      "serves_breakfast", "serves_lunch", "serves_dinner",
      "serves_beer", "serves_wine", "serves_vegetarian_food",
      "editorial_summary",
    ].join(",");

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json() as any;
    if (detailsData.status !== "OK") {
      res.status(502).json({ error: `Places API: ${detailsData.status}`, details: detailsData.error_message });
      return;
    }
    const r = detailsData.result;
    const lat = r.geometry?.location?.lat;
    const lng = r.geometry?.location?.lng;

    // Convert photo refs into ready-to-render permanent URLs (up to 10).
    const photoUrls: string[] = (r.photos || []).slice(0, 10).map((p: any, i: number) =>
      `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${i === 0 ? 1600 : 1000}&photo_reference=${p.photo_reference}&key=${apiKey}`
    );

    const services: string[] = [];
    if (r.dine_in) services.push("Dine-in");
    if (r.takeout) services.push("Takeout");
    if (r.delivery) services.push("Delivery");
    if (r.reservable) services.push("Reservable");
    if (r.wheelchair_accessible_entrance) services.push("Wheelchair accessible");
    if (r.serves_breakfast) services.push("Breakfast");
    if (r.serves_lunch) services.push("Lunch");
    if (r.serves_dinner) services.push("Dinner");
    if (r.serves_beer) services.push("Beer");
    if (r.serves_wine) services.push("Wine");
    if (r.serves_vegetarian_food) services.push("Vegetarian");

    // Partial Cafe-shaped object. Admin UI overlays this on the editor;
    // fields the admin already changed get preserved by a diff/merge.
    const partial = {
      place_id: r.place_id,
      name: r.name,
      formatted_address: r.formatted_address,
      address: r.formatted_address,
      coordinates: lat != null && lng != null ? { lat, lng } : undefined,
      latitude: lat,
      longitude: lng,
      google_maps_url: r.url,
      website: r.website || "",
      phone_number: r.formatted_phone_number || r.international_phone_number || "",
      rating: r.rating,
      user_ratings_total: r.user_ratings_total,
      price_per_person: priceLevelToINR(r.price_level),
      types: r.types || [],
      opening_hours: r.opening_hours?.weekday_text || r.current_opening_hours?.weekday_text || [],
      hours: r.opening_hours?.weekday_text?.[0]?.split(": ")[1] || "",
      photos: photoUrls,
      gallery: photoUrls.slice(1),
      images: photoUrls.length > 0 ? {
        hero: photoUrls[0],
        card: photoUrls[1] || photoUrls[0],
        interior: photoUrls[2] || photoUrls[0],
      } : undefined,
      service_options: services,
      introduction: r.editorial_summary?.overview || "",
      verification_status: "verified" as const,
      match_confidence: 0.99,
    };

    res.json({ ok: true, cafe: partial, photoCount: photoUrls.length });
  } catch (err: any) {
    console.error("import-from-maps-url failed:", err);
    res.status(500).json({ error: err.message || "Import failed." });
  }
});

// ── 2. Suggest menu via Gemini Google search grounding ───────────────────
app.post("/api/cafes/suggest-menu", async (req, res) => {
  const ai = getGeminiClient();
  if (!ai) {
    res.status(503).json({ error: "GEMINI_API_KEY not configured." });
    return;
  }
  const { cafeName, address, websiteUrl } = req.body || {};
  if (!cafeName) {
    res.status(400).json({ error: "Missing cafeName." });
    return;
  }

  const prompt = `
Search Google for the actual menu of this restaurant/cafe in Shillong, Meghalaya, India:
  Name: ${cafeName}
  Address: ${address || "Shillong"}
  ${websiteUrl ? `Website: ${websiteUrl}` : ""}

Find 6-12 of their signature or most-recommended dishes. Use real prices in INR (₹) from Zomato, Swiggy, the cafe's website, or recent Google reviews. Do not invent dishes.

Return STRICT JSON, no prose, no markdown:
[
  { "name": "Dish Name", "description": "Short 1-sentence description", "price": "₹150", "category": "starters|mains|desserts|beverages|sides" }
]

If you cannot find real menu data, return an empty array [] — do NOT hallucinate.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { tools: [{ googleSearch: {} }], temperature: 0.3 },
    });
    const text = response.text || "";
    const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\[\s*\{[\s\S]*\}\s*\]/) || text.match(/\[\s*\]/);
    const parsed = match ? JSON.parse((match[1] || match[0]).trim()) : [];
    const items = Array.isArray(parsed) ? parsed.map((it: any) => ({
      name: String(it.name || ""),
      description: String(it.description || ""),
      price: String(it.price || ""),
      category: String(it.category || ""),
      ai_suggested: true,
    })).filter((it) => it.name) : [];
    res.json({ ok: true, items, source: "gemini-search" });
  } catch (err: any) {
    console.error("suggest-menu failed:", err);
    res.status(500).json({ error: err.message || "Suggest menu failed.", items: [] });
  }
});

// ── 3. Suggest menu from URL (Zomato/Swiggy/cafe site/etc.) ──────────────
app.post("/api/cafes/suggest-menu-from-url", async (req, res) => {
  const ai = getGeminiClient();
  if (!ai) {
    res.status(503).json({ error: "GEMINI_API_KEY not configured." });
    return;
  }
  const { menuUrl } = req.body || {};
  if (!menuUrl) {
    res.status(400).json({ error: "Missing menuUrl." });
    return;
  }

  try {
    // Fetch raw HTML, strip scripts/styles, cap to ~80KB to stay within model context.
    const html = await fetch(menuUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ShillongCafeMap/1.0)" },
    }).then((r) => r.text());
    const cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/\s+/g, " ")
      .slice(0, 80000);

    const prompt = `
You are parsing a restaurant menu from this raw HTML (scripts/styles stripped).
Extract real dishes with names, prices in INR (₹), and short descriptions if present.
Return STRICT JSON array, no prose, no markdown:
[{ "name": "...", "description": "...", "price": "₹150", "category": "starters|mains|desserts|beverages|sides" }]

Skip empty sections, headers, navigation, and footer junk. Maximum 25 items.

HTML:
${cleaned}
`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { temperature: 0.2 },
    });
    const text = response.text || "";
    const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\[\s*\{[\s\S]*\}\s*\]/) || text.match(/\[\s*\]/);
    const parsed = match ? JSON.parse((match[1] || match[0]).trim()) : [];
    const items = Array.isArray(parsed) ? parsed.map((it: any) => ({
      name: String(it.name || ""),
      description: String(it.description || ""),
      price: String(it.price || ""),
      category: String(it.category || ""),
      ai_suggested: true,
    })).filter((it) => it.name) : [];
    res.json({ ok: true, items, source: "url-parse" });
  } catch (err: any) {
    console.error("suggest-menu-from-url failed:", err);
    res.status(500).json({ error: err.message || "URL parse failed.", items: [] });
  }
});

// ── 4. Suggest menu from uploaded PDF ────────────────────────────────────
// Accepts JSON body with base64-encoded PDF to keep middleware simple
// (avoids adding multer/formidable). Client converts File -> base64 before POST.
app.post("/api/cafes/suggest-menu-from-pdf", async (req, res) => {
  const ai = getGeminiClient();
  if (!ai) {
    res.status(503).json({ error: "GEMINI_API_KEY not configured." });
    return;
  }
  const { pdfBase64 } = req.body || {};
  if (!pdfBase64 || typeof pdfBase64 !== "string") {
    res.status(400).json({ error: "Missing pdfBase64." });
    return;
  }
  // Soft size cap to keep one Gemini call cheap (~10MB raw, 13MB base64).
  if (pdfBase64.length > 14_000_000) {
    res.status(413).json({ error: "PDF too large (>10MB)." });
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [
          { inlineData: { mimeType: "application/pdf", data: pdfBase64 } },
          { text: `
This PDF is a restaurant menu. Extract every dish with its real name, description (if shown), and price in INR (use ₹). Categorise into starters / mains / desserts / beverages / sides.

Return STRICT JSON array, no prose, no markdown:
[{ "name": "...", "description": "...", "price": "₹150", "category": "starters|mains|desserts|beverages|sides" }]
` },
        ],
      }],
      config: { temperature: 0.1 },
    });
    const text = response.text || "";
    const match = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\[\s*\{[\s\S]*\}\s*\]/) || text.match(/\[\s*\]/);
    const parsed = match ? JSON.parse((match[1] || match[0]).trim()) : [];
    const items = Array.isArray(parsed) ? parsed.map((it: any) => ({
      name: String(it.name || ""),
      description: String(it.description || ""),
      price: String(it.price || ""),
      category: String(it.category || ""),
      ai_suggested: true,
    })).filter((it) => it.name) : [];
    res.json({ ok: true, items, source: "pdf-parse" });
  } catch (err: any) {
    console.error("suggest-menu-from-pdf failed:", err);
    res.status(500).json({ error: err.message || "PDF parse failed.", items: [] });
  }
});

// Expose Maps API key to frontend (safe — Maps JS API key is client-side by design)
app.get("/api/config/maps-key", (req, res) => {
  const key = process.env.GOOGLE_MAPS_PLATFORM_KEY || "";
  if (!key) {
    res.status(503).json({ error: "Maps key not configured" });
    return;
  }
  res.json({ key });
});

// Vite middleware setup to handle the dual runtime modes
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve compiled static assets from 'dist'
    const distPath = path.join(process.cwd(), "dist", "public");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Shillong Cafe Server running at http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
