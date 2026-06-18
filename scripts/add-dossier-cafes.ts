import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "src", "cafes_db.json");

interface Cafe {
  id: string;
  name: string;
  neighborhood: string;
  address: string;
  coordinates: { lat: number; lng: number };
  tagline: string;
  theme: string;
  vibeTags: string[];
  hasLiveMusic: boolean;
  hasKhasiMusic: boolean;
  editorial_featured: boolean;
  rating: number;
  user_ratings_total?: number;
  images: { hero: string; card: string };
  introduction?: string;
  whyVisit?: string;
}

const NEW_VENUES: Cafe[] = [
  {
    id: "shillong-cafes-and-restaurants",
    name: "Shillong Cafes and Restaurants",
    neighborhood: "Laitumkhrah",
    address: "LP Building, Laitumkhrah Main Rd, Nongkynrih, Shillong 793003",
    coordinates: { lat: 25.5682, lng: 91.8965 },
    tagline: "Hearty local multi-cuisine in Laitumkhrah.",
    theme: "Cozy local dining hub",
    vibeTags: ["Local Hangout", "Multi-cuisine", "Casual", "Comfort Food"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.2,
    user_ratings_total: 68,
    images: {
      hero: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Shillong Cafes and Restaurants is a cozy multi-cuisine dining space in Laitumkhrah, serving a variety of local, Indian, and Chinese dishes in a friendly atmosphere.",
    whyVisit: "For a reliable, casual multi-cuisine meal with family and friends in Laitumkhrah."
  },
  {
    id: "suburb",
    name: "Suburb",
    neighborhood: "Laitumkhrah",
    address: "Opp. Laitumkhrah Presbyterian Church, Lummawrie, Laitumkhrah, Shillong 793003",
    coordinates: { lat: 25.5690, lng: 91.8942 },
    tagline: "Great coffee and student conversations.",
    theme: "Charming student hangout",
    vibeTags: ["Student Crowd", "Cozy Nook", "Espresso", "Conversations"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.3,
    user_ratings_total: 82,
    images: {
      hero: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Located opposite Laitumkhrah Presbyterian Church, Suburb is a compact and vibrant cafe popular among local students for its warm coffees, light bites, and lively energy.",
    whyVisit: "To catch up on university gossip over an affordable, high-quality cappuccino."
  },
  {
    id: "secret-story-boutique-cafe",
    name: "Secret Story Boutique Cafe",
    neighborhood: "Police Bazaar",
    address: "Aldopama, Near Anthony's College, Bomfyle Road, Shillong 793001",
    coordinates: { lat: 25.5721, lng: 91.8860 },
    tagline: "Charming boutique bakes and intimate tea hours.",
    theme: "Floral boutique aesthetic parlour",
    vibeTags: ["Boutique", "Aesthetic", "High Tea", "Bakery", "Intimate"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.5,
    user_ratings_total: 45,
    images: {
      hero: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Secret Story Boutique Cafe brings a delightful floral and boutique aesthetic to Bomfyle Road, serving hand-crafted pastries, high tea, and custom desserts in a beautifully decorated intimate parlour.",
    whyVisit: "For an elegant afternoon tea session surrounded by beautiful floral decor."
  },
  {
    id: "the-loft-cafe-restaurant",
    name: "The Loft - Cafe & Restaurant",
    neighborhood: "Lachumiere",
    address: "Belma Mansion, Lower Lachumiere, Next to MPSC Building, Shillong 793001",
    coordinates: { lat: 25.5695, lng: 91.8828 },
    tagline: "Skyline views and acoustic melodies.",
    theme: "Live music rooftop cafe",
    vibeTags: ["Rooftop", "Live Music", "Scenic Views", "Continental", "Cocktails"],
    hasLiveMusic: true,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.4,
    user_ratings_total: 112,
    images: {
      hero: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Perched in Lower Lachumiere, The Loft combines scenic rooftop views of Shillong with regular acoustic gigs and a diverse menu of continental and fusion specialties.",
    whyVisit: "For a dinner under the stars with live acoustic performances by talented local artists."
  },
  {
    id: "roma-eatery",
    name: "Roma Eatery",
    neighborhood: "Laitumkhrah",
    address: "Shopper's Cove, Lummawrie, Laitumkhrah Main Rd, Shillong 793003",
    coordinates: { lat: 25.5678, lng: 91.8950 },
    tagline: "Eclectic global menu loved by Gen Z.",
    theme: "Trendy modern global eatery",
    vibeTags: ["Global Cuisine", "Gen Z Favorite", "Trendy", "Mocktails", "Vibrant"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.3,
    user_ratings_total: 154,
    images: {
      hero: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Roma Eatery in Lummawrie is a trendy hotspot featuring an eclectic menu of global fusion dishes, vibrant interiors, and refreshing mocktails that draw a lively young crowd.",
    whyVisit: "To experience modern global flavors and a buzzing, stylish neighborhood atmosphere."
  },
  {
    id: "scottys-shillong",
    name: "Scotty's Shillong",
    neighborhood: "Police Bazaar",
    address: "Opp. St. Anthony's College, Bomfyle Road, Police Bazar, Shillong 793001",
    coordinates: { lat: 25.5718, lng: 91.8845 },
    tagline: "Flame-grilled burgers and quick bites.",
    theme: "Burgers & quick casual fast food",
    vibeTags: ["Burgers", "Fast Food", "Quick Bite", "Casual", "Affordable"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.1,
    user_ratings_total: 198,
    images: {
      hero: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Scotty's Shillong is a popular fast-food stop near Bomfyle Road, famous for its juicy flame-grilled burgers, crispy fries, and quick, budget-friendly service.",
    whyVisit: "For a fast, delicious, and pocket-friendly burger meal in the central college zone."
  },
  {
    id: "shillong-coffee-house",
    name: "Shillong Coffee House",
    neighborhood: "Mawlai",
    address: "Mawlai Nongpdeng, Mawlai Mawdatbaki, Shillong 793008",
    coordinates: { lat: 25.5912, lng: 91.8752 },
    tagline: "Timeless coffee traditions in Mawlai.",
    theme: "Classic neighborhood coffee house",
    vibeTags: ["Classic", "Local Favorite", "Coffee Shop", "Affordable", "Talks"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.2,
    user_ratings_total: 120,
    images: {
      hero: "https://images.unsplash.com/photo-151097252790b-af4f42ded7a4?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-151097252790b-af4f42ded7a4?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Shillong Coffee House in Mawlai is a local landmark providing a simple, traditional space where neighbors gather for hot filter coffee, classic toast, and long conversations.",
    whyVisit: "For a nostalgic, slow-paced coffee experience in the historic Mawlai neighborhood."
  },
  {
    id: "isabella-cafe",
    name: "Isabella Cafe",
    neighborhood: "Laitumkhrah",
    address: "House 1, GF, Gatphoh Villa, Lane 9, Nongrimbah, Laitumkhrah, Shillong 793003",
    coordinates: { lat: 25.5642, lng: 91.8982 },
    tagline: "Cozy vibes and artisanal bakes.",
    theme: "Indie neighborhood garden cafe",
    vibeTags: ["Indie", "Garden Vibes", "Pastries", "Intimate", "Quiet"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.4,
    user_ratings_total: 76,
    images: {
      hero: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Located in the quiet lanes of Nongrimbah, Isabella Cafe is a beautiful garden-style retreat serving exceptional fresh pastries, herbal teas, and single-origin coffee.",
    whyVisit: "To escape the noise and read a book in a peaceful, lush garden setting."
  },
  {
    id: "cafe-seuji",
    name: "Cafe Seuji",
    neighborhood: "Umpling",
    address: "Lapalang Main Market, Lapalang, Shillong 793006 (near Umpling)",
    coordinates: { lat: 25.5780, lng: 91.9180 },
    tagline: "Fine matcha and peaceful tea hours.",
    theme: "Modern matcha & organic tea parlor",
    vibeTags: ["Matcha", "Tea House", "Minimalist", "Calm", "Healthy"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.5,
    user_ratings_total: 58,
    images: {
      hero: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Cafe Seuji in Lapalang is a minimalist sanctuary specializing in high-grade ceremonial matcha, organic green teas, and healthy fusion snacks in a calming, zen-inspired space.",
    whyVisit: "For a soothing green tea latte or authentic matcha bowl served with quiet mountain grace."
  },
  {
    id: "the-mango-tree-lounge-cafe",
    name: "The Mango Tree Lounge Cafe",
    neighborhood: "Laitumkhrah",
    address: "43/5, Lower New Colony, Laitumkhrah, Shillong 793011 (Assam Rifles area)",
    coordinates: { lat: 25.5702, lng: 91.8978 },
    tagline: "Lounge comfort under the canopy.",
    theme: "Relaxed outdoor lounge cafe",
    vibeTags: ["Lounge", "Outdoor Seating", "Comfort Food", "Relaxed", "Mocktails"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.3,
    user_ratings_total: 94,
    images: {
      hero: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Nestled in Lower New Colony, The Mango Tree Lounge Cafe offers a breezy outdoor terrace covered by mature trees, serving hearty mocktails and delicious fusion food.",
    whyVisit: "For a relaxed family lunch or a breezy evening hangout under open leafy arches."
  },
  {
    id: "belly-timber-cafe-restaurant",
    name: "Belly Timber Cafe & Restaurant",
    neighborhood: "Nongmynsong",
    address: "Umkdait, East Khasi Hills, Nongmynsong, Shillong 793019",
    coordinates: { lat: 25.5892, lng: 91.9212 },
    tagline: "Wood-fired pizzas and local timber vibes.",
    theme: "Rustic wood-fired pizzeria",
    vibeTags: ["Pizza", "Wood-fired", "Rustic", "Family Friendly", "Cozy"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.2,
    user_ratings_total: 105,
    images: {
      hero: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Belly Timber Cafe & Restaurant in Nongmynsong is a cozy, log-cabin style diner famous for its freshly baked wood-fired pizzas, hearty pastas, and rustic mountain interiors.",
    whyVisit: "To share a giant, bubbling wood-fired pepperoni pizza with family in a cozy timber loft."
  },
  {
    id: "woods-cafe-shillong",
    name: "Woods Cafe Shillong",
    neighborhood: "Laitumkhrah",
    address: "Upper Elysium, Boyce Road, Opp. UDP Office, Laitumkhrah, Shillong 793003",
    coordinates: { lat: 25.5665, lng: 91.8968 },
    tagline: "Forest themes and premium arabica.",
    theme: "Pine forest themed coffee hub",
    vibeTags: ["Pine Forest Theme", "Cozy", "Premium Coffee", "Pastries", "Quiet"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.4,
    user_ratings_total: 88,
    images: {
      hero: "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Woods Cafe Shillong on Boyce Road is a beautifully designed pine-themed space, showcasing natural tree-slab tables and serving single-estate Khasi arabica espresso drinks.",
    whyVisit: "To experience a peaceful, pine-scented environment while sipping a masterfully extracted macchiato."
  },
  {
    id: "coffee-chill",
    name: "Coffee & Chill",
    neighborhood: "Lachumiere",
    address: "Keating Road, Secretariat Hills, Shillong 793001",
    coordinates: { lat: 25.5710, lng: 91.8818 },
    tagline: "Great roasts in the Secretariat core.",
    theme: "Sleek modern espresso bar",
    vibeTags: ["Espresso Bar", "Modern", "Quick Service", "Secretariat", "Affordable"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.1,
    user_ratings_total: 130,
    images: {
      hero: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Coffee & Chill is a busy, modern espresso bar on Keating Road, popular with government staff and shoppers looking for a quick, robust caffeine shot and delicious bakery bites.",
    whyVisit: "For a reliable morning caffeine kick and a quick, buttery croissant."
  },
  {
    id: "theroys-art-gallery-cafe",
    name: "THEROYS - Art Gallery & Cafe",
    neighborhood: "Umpling",
    address: "Umpling area, East Khasi Hills, Shillong 793006",
    coordinates: { lat: 25.5790, lng: 91.9160 },
    tagline: "Beautiful local canvas and heritage tea.",
    theme: "Art gallery & cultural exhibition space",
    vibeTags: ["Art Gallery", "Cultural", "Quiet", "Tea Selection", "Exhibition"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.6,
    user_ratings_total: 42,
    images: {
      hero: "https://images.unsplash.com/photo-1487180142328-054b783fc471?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1487180142328-054b783fc471?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "THEROYS is a stunning gallery-cafe hybrid in Umpling, showcasing oil paintings and wood carvings from Meghalaya's finest local artists over custom tea and coffee.",
    whyVisit: "To appreciate regional contemporary art in a silent, beautiful creative refuge."
  },
  {
    id: "16-street-bistro",
    name: "16 Street Bistro",
    neighborhood: "Umpling",
    address: "Windermere Resorts complex, Umpling, Shillong 793006",
    coordinates: { lat: 25.5772, lng: 91.9192 },
    tagline: "Scenic views and rich bistro selections.",
    theme: "Modern resort-style bistro",
    vibeTags: ["Resort Bistro", "Scenic Views", "Continental", "Premium", "Garden"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.4,
    user_ratings_total: 86,
    images: {
      hero: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Set inside the lush Windermere Resorts complex, 16 Street Bistro is a premium dining destination offering continental cuisine and beautiful valley views in a garden setting.",
    whyVisit: "For a scenic lunch in a peaceful, manicured resort garden away from Shillong's central traffic."
  },
  {
    id: "bunker-bites-cafe",
    name: "Bunker Bites Cafe",
    neighborhood: "Cantonment",
    address: "Lummawbah, Shillong Cantonment, Lawsohtun, Shillong 793004",
    coordinates: { lat: 25.5582, lng: 91.8712 },
    tagline: "Cozy corner for snacks and teas.",
    theme: "Industrial style canteen cafe",
    vibeTags: ["Industrial Style", "Affordable", "Snacks", "Tea", "Friendly"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.1,
    user_ratings_total: 62,
    images: {
      hero: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Bunker Bites Cafe in Lummawbah offers an industrial metal-framed theme and budget-friendly menu, serving hot teas, burgers, and classic snacks in a lively local nook.",
    whyVisit: "For simple, tasty snacks and great hospitality near the Cantonment border."
  },
  {
    id: "karak-chaa-dhankheti",
    name: "Karak Chaa Dhankheti",
    neighborhood: "Dhankheti",
    address: "Opp. Shillong Law College, Lummawrie, Dhankheti, Malki, Shillong 793001",
    coordinates: { lat: 25.5662, lng: 91.8888 },
    tagline: "Strong karak tea and student bites.",
    theme: "Traditional style street tea house",
    vibeTags: ["Karak Tea", "Street Style", "Student Hangout", "Budget Friendly", "Ginger Chai"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.3,
    user_ratings_total: 210,
    images: {
      hero: "https://images.unsplash.com/photo-1599307737286-218221689ee8?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1599307737286-218221689ee8?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Karak Chaa Dhankheti is a bustling roadside hub opposite Shillong Law College, renowned for serving the strongest, spiciest ginger karak chai and quick street-style toast.",
    whyVisit: "To grab a quick, steaming steel glass of ginger chai and buttered bun between study sessions."
  },
  {
    id: "flare-restaurant",
    name: "Flare Restaurant",
    neighborhood: "Malki",
    address: "Malki / Police Bazar area, Shillong 793001",
    coordinates: { lat: 25.5692, lng: 91.8868 },
    tagline: "Lively multi-cuisine and family dining.",
    theme: "Family style multi-cuisine dining",
    vibeTags: ["Multi-cuisine", "Family Friendly", "Chinese", "N. Indian", "Spacious"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.2,
    user_ratings_total: 145,
    images: {
      hero: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Flare Restaurant offers a spacious and family-friendly dining environment near Malki, serving a popular menu of North Indian, Chinese, and local continental items.",
    whyVisit: "For a satisfying, comfortable family dinner with diverse cuisine choices."
  },
  {
    id: "zodiac-restaurant",
    name: "Zodiac Restaurant",
    neighborhood: "Police Bazaar",
    address: "Zara's Arcade, Hindi School, Keating Rd, Police Bazar, Shillong 793001",
    coordinates: { lat: 25.5735, lng: 91.8828 },
    tagline: "Fine Chinese and North Indian selections.",
    theme: "Classic corporate style restaurant",
    vibeTags: ["Fine Dining", "Chinese", "N. Indian", "Keating Road", "Corporate"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.1,
    user_ratings_total: 95,
    images: {
      hero: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Located in Zara's Arcade on Keating Road, Zodiac Restaurant is a classic corporate style dining hall serving dependable North Indian and Chinese specialties in a quiet setup.",
    whyVisit: "For a calm business lunch or traditional family gathering in Police Bazaar."
  },
  {
    id: "the-ambience-fine-dining",
    name: "The Ambience Fine Dining",
    neighborhood: "Nongthymmai",
    address: "House No. 11, Bowell Building, Nongthymmai, Shillong 793014",
    coordinates: { lat: 25.5605, lng: 91.9042 },
    tagline: "Elevated dining in Nongthymmai.",
    theme: "Elegant multi-cuisine fine dining",
    vibeTags: ["Fine Dining", "Elegant", "Multi-cuisine", "Nongthymmai", "Special Occasion"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.4,
    user_ratings_total: 64,
    images: {
      hero: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "The Ambience Fine Dining in Nongthymmai is a premium restaurant offering a quiet, sophisticated escape with clean table settings and masterfully cooked Indian and continental dishes.",
    whyVisit: "To enjoy premium, quiet dining with elegant table hospitality in Nongthymmai."
  },
  {
    id: "extra-butter-pure-veg-restaurant",
    name: "Extra Butter Pure Veg Restaurant",
    neighborhood: "Upper Shillong",
    address: "Mawnanglah Road, Upper Shillong, Mylliem 793009 (on Shillong-Cherrapunji route)",
    coordinates: { lat: 25.5205, lng: 91.8320 },
    tagline: "Authentic pure veg road stops.",
    theme: "Pure veg highway dhaba style restaurant",
    vibeTags: ["Pure Veg", "Highway Stop", "Mylliem", "South Indian", "North Indian"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.3,
    user_ratings_total: 178,
    images: {
      hero: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Located on the scenic highway to Cherrapunji, Extra Butter is Shillong's go-to pure vegetarian pitstop, serving hot dosas, parathas, and rich North Indian thalis with generous dollops of butter.",
    whyVisit: "For a satisfying pure veg breakfast or lunch while road-tripping to Sohra/Cherrapunji."
  },
  {
    id: "jiva-veg-restaurant",
    name: "Jiva Veg Restaurant",
    neighborhood: "Police Bazaar",
    address: "2nd Floor, Starline Building, GS Road, Police Bazar, Shillong 793001",
    coordinates: { lat: 25.5745, lng: 91.8835 },
    tagline: "Premium vegetarian thalis and filter coffee.",
    theme: "Premium family vegetarian dining",
    vibeTags: ["Pure Veg", "Thalis", "GS Road", "Family Favorite", "Clean"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.5,
    user_ratings_total: 420,
    images: {
      hero: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Jiva Veg Restaurant is a highly rated, clean pure-veg dining destination on GS Road, beloved for its expansive South Indian, North Indian, and Chinese menu, as well as its legendary hygiene standards.",
    whyVisit: "For the best, cleanest, and most popular vegetarian dining experience in central Police Bazaar."
  },
  {
    id: "blackstone-grill",
    name: "BLACKSTONE GRILL",
    neighborhood: "Golf Links",
    address: "Mawlai Mawroh, Near SBI ATM, Golf Links, Shillong 793008",
    coordinates: { lat: 25.5898, lng: 91.8988 },
    tagline: "Middle Eastern kebabs and smoky grills.",
    theme: "Middle Eastern grill house",
    vibeTags: ["Middle Eastern", "Grill", "Kebabs", "Mawlai Mawroh", "Scenic"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.4,
    user_ratings_total: 89,
    images: {
      hero: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "BLACKSTONE GRILL in Mawlai Mawroh is Shillong's unique Middle Eastern dining spot, bringing authentic hummus, falafel, and slow-roasted mutton grills to the Golf Links outskirts.",
    whyVisit: "To experience rich, authentic Arabic and Middle Eastern grill platters in the pine hills."
  },
  {
    id: "the-hut-restaurant-shillong",
    name: "The Hut Restaurant - Shillong",
    neighborhood: "Laitumkhrah",
    address: "Laitumkhrah Point, Nongkynrih, Laitumkhrah, Shillong 793003",
    coordinates: { lat: 25.5688, lng: 91.8972 },
    tagline: "Classic Chinese and continental comfort.",
    theme: "Neighborhood fusion restaurant",
    vibeTags: ["Chinese", "Continental", "Laitumkhrah Point", "Comfort Food", "Casual"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.2,
    user_ratings_total: 104,
    images: {
      hero: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "The Hut Restaurant is a busy Laitumkhrah Point dining room serving old-school Chinese stir-fries, crispy chicken cutlets, and continental comfort staples.",
    whyVisit: "For a quick, satisfying Chinese chowmein lunch at the bustling Laitumkhrah junction."
  },
  {
    id: "olivias-kitchen",
    name: "Olivia's Kitchen",
    neighborhood: "Laitumkhrah",
    address: "Nongkynrih, Bomfyle Road, Laitumkhrah, Shillong 793003",
    coordinates: { lat: 25.5658, lng: 91.8955 },
    tagline: "English breakfast and Mexican wraps.",
    theme: "Cozy student breakfast bistro",
    vibeTags: ["English Breakfast", "Mexican", "Student Hub", "Cozy", "Pastries"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.3,
    user_ratings_total: 78,
    images: {
      hero: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Olivia's Kitchen is a charming, split-level breakfast bistro on Bomfyle Road, serving a popular menu of loaded English breakfast platters, cheesy quesadillas, and fresh pastries.",
    whyVisit: "For a satisfying morning breakfast skillet with sausage, eggs, and freshly pressed juice."
  },
  {
    id: "eden-restaurant",
    name: "Eden Restaurant",
    neighborhood: "Police Bazaar",
    address: "GS Road, Police Bazar, Shillong 793001",
    coordinates: { lat: 25.5742, lng: 91.8842 },
    tagline: "Timeless Mughlai curries and biryani.",
    theme: "Classic Mughlai family restaurant",
    vibeTags: ["Mughlai", "Biryani", "GS Road", "Family Dining", "Rich Gravies"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.2,
    user_ratings_total: 165,
    images: {
      hero: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Eden Restaurant is a landmark Mughlai eatery on GS Road, serving rich chicken tikka masalas, slow-cooked mutton biryanis, and warm tandoori naans to generations of diners.",
    whyVisit: "To experience old-school rich Mughlai curries in the commercial heart of Police Bazaar."
  },
  {
    id: "atmosphere-wine-dine",
    name: "ATMOSPHERE Wine & Dine",
    neighborhood: "Nongmynsong",
    address: "Urkaliar, Assam Rifles, Nongmynsong, Shillong 793011",
    coordinates: { lat: 25.5878, lng: 91.9188 },
    tagline: "Fine dining and mountain skyline views.",
    theme: "Premium skybar & fusion restaurant",
    vibeTags: ["Skybar", "Fine Dining", "Wine & Dine", "Scenic Views", "Cocktails"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.5,
    user_ratings_total: 92,
    images: {
      hero: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "ATMOSPHERE Wine & Dine offers a premium lounge-style setup in the Nongmynsong outskirts, featuring sophisticated plating, international wines, and breathtaking mountain skyline views.",
    whyVisit: "For a special anniversary dinner with craft cocktails and a gorgeous view of Shillong's valleys."
  },
  {
    id: "zayra-the-cake-studio",
    name: "Zayra The Cake Studio",
    neighborhood: "Police Bazaar",
    address: "Next to US Polo Assn, SF Mall, GS Road, Police Bazar, Shillong 793001",
    coordinates: { lat: 25.5750, lng: 91.8848 },
    tagline: "Custom cakes and designer patisserie.",
    theme: "Premium custom cake parlor",
    vibeTags: ["Custom Cakes", "Bakery", "Designer Pastries", "GS Road", "Desserts"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.6,
    user_ratings_total: 110,
    images: {
      hero: "https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Zayra The Cake Studio inside SF Mall is famous for designing the most elaborate, beautiful, and delicious custom wedding and celebration cakes in Shillong, alongside French macarons.",
    whyVisit: "To grab a box of colorful designer macarons or order a breathtaking custom birthday cake."
  },
  {
    id: "saaz-bakery-confectionery",
    name: "Saaz Bakery & Confectionery",
    neighborhood: "Nongthymmai",
    address: "Upper Nongthymmai, Nongthymmai, Shillong 793014 (also near Bus Stand, Nongkhyriem)",
    coordinates: { lat: 25.5602, lng: 91.9038 },
    tagline: "Fresh local loaves and warm tea bakes.",
    theme: "Classic neighborhood bakery",
    vibeTags: ["Bakery", "Affordable", "Fresh Bread", "Nongthymmai", "Local Favorite"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.3,
    user_ratings_total: 180,
    images: {
      hero: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Saaz Bakery & Confectionery is Nongthymmai's most popular daily stop, serving freshly baked sandwich loaves, local cookies, and traditional tea cakes at highly affordable rates.",
    whyVisit: "To stock up on fresh daily bread and warm milk tea cookies."
  },
  {
    id: "james-sons-bakery",
    name: "James & Sons Bakery",
    neighborhood: "Golf Links",
    address: "Golf Links, Shillong 793001",
    coordinates: { lat: 25.5882, lng: 91.9022 },
    tagline: "Famous local donuts and heritage cookies.",
    theme: "Historic family heritage bakery",
    vibeTags: ["Heritage Bakery", "Donuts", "Golf Links", "Affordable", "Traditional"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.4,
    user_ratings_total: 240,
    images: {
      hero: "https://images.unsplash.com/photo-1557925923-cd4648e21187?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1557925923-cd4648e21187?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "James & Sons Bakery is a family legacy bakery near Golf Links, celebrated for its legendary sugar-dusted local donuts, cream buns, and old-school Khasi cookies.",
    whyVisit: "To grab a classic cream roll and a dozen fresh local donuts after a misty walk in Golf Links."
  },
  {
    id: "the-blue-ribbon-bakery-cafe",
    name: "The Blue Ribbon - Bakery & Cafe",
    neighborhood: "Golf Links",
    address: "Polo Hills, Golf Links, Police Bazar, Shillong 793001",
    coordinates: { lat: 25.5842, lng: 91.8952 },
    tagline: "Fine pastry and premium coffee blends.",
    theme: "Modern chic patisserie & cafe",
    vibeTags: ["Patisserie", "Chic Cafe", "Polo Hills", "Pastries", "Coffee"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.3,
    user_ratings_total: 84,
    images: {
      hero: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Located in the Polo Hills area, The Blue Ribbon is a stylish patisserie-cafe hybrid serving beautiful red velvet slices, chocolate eclairs, and artisanal lattes.",
    whyVisit: "For a chic afternoon tea session with high-quality French style pastries."
  },
  {
    id: "my-little-bakery-shillong",
    name: "My Little Bakery, Shillong",
    neighborhood: "Shillong",
    address: "Shillong (home/cloud bakery by Wanrilinia) 793001",
    coordinates: { lat: 25.5680, lng: 91.8850 },
    tagline: "Artisanal home bakes and cloud orders.",
    theme: "Custom artisanal cloud bakery",
    vibeTags: ["Cloud Bakery", "Home Made", "Custom Cakes", "Premium", "Delivery"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.7,
    user_ratings_total: 54,
    images: {
      hero: "https://images.unsplash.com/photo-1535124400015-725530413da6?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1535124400015-725530413da6?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "My Little Bakery is a premium custom home bakery run by Wanrilinia, delivering organic, hand-crafted celebration cakes and sourdough treats directly to customers across Shillong.",
    whyVisit: "To order the most delicious, customized organic fruit cakes for your mountain celebrations."
  },
  {
    id: "legacy-the-cake-shop",
    name: "Legacy The Cake Shop",
    neighborhood: "Police Bazaar",
    address: "Police Bazar area, Shillong 793001",
    coordinates: { lat: 25.5748, lng: 91.8838 },
    tagline: "Classic chocolate fudge and pastries.",
    theme: "Classic neighborhood cake shop",
    vibeTags: ["Cake Shop", "Chocolate Fudge", "Police Bazaar", "Affordable", "Desserts"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.3,
    user_ratings_total: 132,
    images: {
      hero: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Legacy The Cake Shop is a reliable Police Bazaar bakery, highly rated for its rich chocolate truffle cakes, custom design options, and friendly, fast service.",
    whyVisit: "For a delicious, classic chocolate fudge cake slice on the go."
  },
  {
    id: "savor-by-dee-the-artisanal-bakery",
    name: "Savor by Dee the Artisanal Bakery",
    neighborhood: "Laban",
    address: "Madan, Lawsohtun, Near NE Officer's Railway Rest House, Laban, Shillong 793004",
    coordinates: { lat: 25.5532, lng: 91.8792 },
    tagline: "Gourmet bakes and artisanal sourdough.",
    theme: "Chic artisanal boutique bakery",
    vibeTags: ["Artisanal Sourdough", "Boutique Bakery", "Laban", "Croissants", "Premium"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.6,
    user_ratings_total: 67,
    images: {
      hero: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Savor by Dee is an artisanal bakery in Laban/Lawsohtun, famous for its hand-laminated butter croissants, rustic sourdough loaves, and delicate gourmet tarts.",
    whyVisit: "To secure a fresh, warm batch of artisanal almond croissants on Saturday morning."
  },
  {
    id: "the-eee-cee-bakery",
    name: "The Eee Cee Bakery",
    neighborhood: "Police Bazaar",
    address: "Jail Road, Police Bazaar, Shillong 793001 (within Eee Cee Hotel)",
    coordinates: { lat: 25.5758, lng: 91.8858 },
    tagline: "A legacy of Shillong baking since 1964.",
    theme: "Historic legacy bakery landmark",
    vibeTags: ["Legacy Landmark", "Est. 1964", "Jail Road", "Cream Buns", "Nostalgic"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.5,
    user_ratings_total: 480,
    images: {
      hero: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Operating since 1964 within the Eee Cee Hotel, The Eee Cee Bakery is a nostalgic crown jewel of Shillong's culinary history, famous for cream buns, chicken patties, and tea cakes.",
    whyVisit: "To experience the nostalgic local taste of their famous, melt-in-mouth local cream buns."
  },
  {
    id: "biteclub-bakery",
    name: "BiteClub Bakery",
    neighborhood: "Laitumkhrah",
    address: "Laitumkhrah, Shillong 793003",
    coordinates: { lat: 25.5672, lng: 91.8960 },
    tagline: "Healthy vegan-friendly treats in Laitumkhrah.",
    theme: "Modern health-conscious bakery",
    vibeTags: ["Vegan", "Gluten Free", "Healthy", "Bakery", "Modern"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.3,
    user_ratings_total: 56,
    images: {
      hero: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "BiteClub Bakery is a modern Laitumkhrah bakeshop offering vegan, gluten-free, and refined-sugar-free cakes and cupcakes that taste absolutely delicious without compromise.",
    whyVisit: "For a guilt-free, delicious vegan double chocolate brownie slice."
  },
  {
    id: "samanbha-bakery",
    name: "Samanbha Bakery",
    neighborhood: "Police Bazaar",
    address: "Nongrimbah / Police Bazar area, Shillong 793001",
    coordinates: { lat: 25.5738, lng: 91.8848 },
    tagline: "Affordable cream rolls and tea buns.",
    theme: "Simple local neighborhood bakery",
    vibeTags: ["Bakery", "Affordable", "Local Hangout", "Tea Buns", "Friendly"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.1,
    user_ratings_total: 98,
    images: {
      hero: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Samanbha Bakery is a simple, no-fuss neighborhood bakery serving traditional Shillong cream rolls, soft tea buns, and ginger biscuits at highly affordable rates.",
    whyVisit: "To pick up a packet of traditional ginger biscuits and tea rolls."
  },
  {
    id: "s-k-bakery",
    name: "S.K. Bakery",
    neighborhood: "Laitumkhrah",
    address: "Laitumkhrah Main Road, Opp. Beat House, Laitumkhrah, Shillong 793001",
    coordinates: { lat: 25.5680, lng: 91.8958 },
    tagline: "Timeless local cookies and pastries.",
    theme: "Classic Laitumkhrah bakery shop",
    vibeTags: ["Bakery", "Affordable", "Laitumkhrah Main Road", "Cookies", "Nostalgic"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.2,
    user_ratings_total: 112,
    images: {
      hero: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Located opposite Laitumkhrah Beat House, S.K. Bakery has been serving the neighborhood with fresh local butter cookies, coconut biscuits, and cream cones for years.",
    whyVisit: "To grab a quick bag of freshly packed crispy butter cookies."
  },
  {
    id: "trifle-patisserie",
    name: "Trifle Patisserie",
    neighborhood: "Police Bazaar",
    address: "Hotel Alpine Continental, Ground Floor, Police Bazar, Shillong 793001",
    coordinates: { lat: 25.5740, lng: 91.8862 },
    tagline: "Eggless pastries and gourmet desserts.",
    theme: "Premium vegetarian patisserie parlor",
    vibeTags: ["Patisserie", "Eggless", "Gourmet", "Police Bazaar", "Premium"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.5,
    user_ratings_total: 78,
    images: {
      hero: "https://images.unsplash.com/photo-1535124400015-725530413da6?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1535124400015-725530413da6?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Trifle Patisserie on the ground floor of Hotel Alpine Continental offers a premium selection of 100% vegetarian, eggless pastries, gourmet chocolate tarts, and custom designer cakes.",
    whyVisit: "For the finest, most delicate eggless chocolate truffle slice in Shillong."
  },
  {
    id: "yummy-cakes",
    name: "Yummy Cakes",
    neighborhood: "Garikhana",
    address: "Garikhana, Shillong 793002",
    coordinates: { lat: 25.5792, lng: 91.8682 },
    tagline: "Delicious custom cakes and daily bakes.",
    theme: "Vibrant neighborhood bakery",
    vibeTags: ["Bakery", "Garikhana", "Affordable", "Cakes", "Local Choice"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.2,
    user_ratings_total: 94,
    images: {
      hero: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Yummy Cakes is a highly popular community bakery in Garikhana, serving affordable celebration cakes, vanilla buns, and fresh daily bread with warm local service.",
    whyVisit: "To pick up a delicious, pocket-friendly chocolate fudge round for weekend family gatherings."
  },
  {
    id: "the-cake-craving-shillong",
    name: "The Cake Craving, Shillong",
    neighborhood: "Garikhana",
    address: "Lower Mawprem, Ashonelane, Garikhana, Shillong 793002",
    coordinates: { lat: 25.5778, lng: 91.8665 },
    tagline: "Stunning wedding and celebratory tiers.",
    theme: "Designer wedding cake parlour",
    vibeTags: ["Wedding Cakes", "Custom Design", "Premium", "Garikhana", "Baker"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.6,
    user_ratings_total: 48,
    images: {
      hero: "https://images.unsplash.com/photo-1535124400015-725530413da6?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1535124400015-725530413da6?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Tucked in Lower Mawprem, The Cake Craving specializes in baking and crafting spectacular multi-tiered custom wedding cakes, bridal shower treats, and elegant birthday creations.",
    whyVisit: "To consult and design the most memorable, artistic tier cake for your major celebrations."
  },
  {
    id: "gateau-bakes-and-more",
    name: "Gateau - Bakes And More",
    neighborhood: "Police Bazaar",
    address: "Police Bazar, Shillong 793001 (also: Mawroh Kyntonlieh; Forest Colony; Block 1 Pynthorbah)",
    coordinates: { lat: 25.5752, lng: 91.8840 },
    tagline: "Fine European style bakes and breads.",
    theme: "Chic local patisserie franchise",
    vibeTags: ["Patisserie", "Bakery", "Police Bazaar", "Cookies", "Croissants"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.3,
    user_ratings_total: 154,
    images: {
      hero: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Gateau is a beloved local patisserie franchise with its flagship in Police Bazaar, celebrated for its French style cream tarts, almond biscotti, and fresh multi-grain loaves.",
    whyVisit: "To enjoy reliable European style pastries and delicious cookies in central Police Bazaar."
  },
  {
    id: "robert-junior-patisserie",
    name: "Robert Junior Patisserie",
    neighborhood: "Nongthymmai",
    address: "Demthring, Nongthymmai, Shillong 793014",
    coordinates: { lat: 25.5588, lng: 91.9078 },
    tagline: "Fine french pastries and gourmet bakes.",
    theme: "High end French patisserie parlour",
    vibeTags: ["Patisserie", "French Style", "Nongthymmai", "Gourmet", "Macarons"],
    hasLiveMusic: false,
    hasKhasiMusic: false,
    editorial_featured: false,
    rating: 4.5,
    user_ratings_total: 36,
    images: {
      hero: "https://images.unsplash.com/photo-1535124400015-725530413da6?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1535124400015-725530413da6?auto=format&fit=crop&q=80&w=600"
    },
    introduction: "Robert Junior Patisserie in Demthring brings high-end French baking to Nongthymmai, serving delicate choux pastries, chocolate eclairs, and a colorful selection of gourmet macarons.",
    whyVisit: "For the most authentic choux buns and delicate chocolate eclairs in the area."
  }
];

function main() {
  console.log("=== Appending Dossier Cafes ===");
  if (!fs.existsSync(DB_PATH)) {
    console.error(`Database not found at ${DB_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(DB_PATH, "utf-8");
  const cafes: Cafe[] = JSON.parse(raw);
  const existingNames = new Set(cafes.map((c) => c.name.toLowerCase()));

  let addedCount = 0;
  for (const venue of NEW_VENUES) {
    if (!existingNames.has(venue.name.toLowerCase())) {
      cafes.push(venue);
      existingNames.add(venue.name.toLowerCase());
      addedCount++;
    }
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(cafes, null, 2), "utf-8");
  console.log(`\nSuccessfully appended ${addedCount} new unique venues to ${DB_PATH}`);
  console.log(`Total cafes in database: ${cafes.length}`);
}

main();
