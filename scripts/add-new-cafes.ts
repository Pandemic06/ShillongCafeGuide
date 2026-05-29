/**
 * Add newly discovered Shillong cafes to cafes_db.json via Google Places API.
 * Run: npx tsx scripts/add-new-cafes.ts
 */

import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY!;
if (!API_KEY) { console.error("GOOGLE_MAPS_PLATFORM_KEY missing"); process.exit(1); }

const DB_PATH = path.join(process.cwd(), "src", "cafes_db.json");

// Cafes found via web research — not yet in DB
const NEW_CAFES = [
  { name: "Smoky Falls Tribe Coffee", address: "Police Bazar, Shillong", neighborhood: "Police Bazaar", vibeTags: ["Artisan Coffee", "Local Beans", "Cherrapunjee Roast", "Hidden Gem", "Tribe Culture"], theme: "Locally Roasted Cherrapunjee Beans & Tribe Heritage", tagline: "Where Meghalaya's Mountain Coffee Culture Was Born", introduction: "Founded by Dasumarlin Majaw and her father, Smoky Falls Tribe Coffee is Shillong's most beloved specialty coffee secret. Using handpicked, freshly roasted beans from the Cherrapunjee hills, every cup is a deep dive into northeast India's finest arabica terroir.", whyVisit: "For the most authentic, locally sourced single-origin Cherrapunjee hill coffee in Shillong.", mustTry: [{ name: "Cherrapunjee Single Origin Pour-Over", description: "Hand-roasted highland arabica, slow-poured through ceramic dripper. Deep berry and citrus notes.", price: "₹160" }, { name: "Cold Brew Tribe Blend", description: "12-hour cold steeped local blend with dark chocolate and earthy finish.", price: "₹180" }] },
  { name: "Click Cafe", address: "LP Building, Laitumkhrah Main Road, Nongkynrih, Laitumkhrah, Shillong", neighborhood: "Laitumkhrah", vibeTags: ["Photography", "Local Hangout", "Cozy Nook", "Student Favorite", "Creative Space"], theme: "Photography Art & Creative Expression Hub", tagline: "Frame Your Shillong Moment Over a Perfect Cup", introduction: "Tucked in the LP Building on Laitumkhrah Main Road, Click Cafe is the go-to creative den for Shillong's art and photography community. Walls lined with local prints, warm lighting, and genuinely good coffee make it a favorite for students and creatives.", whyVisit: "For the warm creative atmosphere, local photography exhibitions, and consistently good espresso drinks.", mustTry: [{ name: "Hazelnut Espresso", description: "Double shot espresso with locally sourced hazelnut syrup and steamed hill milk.", price: "₹150" }, { name: "Nutella French Toast", description: "Thick-cut bread, Nutella spread, fresh banana slices, dusted with cinnamon.", price: "₹180" }] },
  { name: "Latte Love Cafe", address: "Opposite Centre Point, Police Bazar, Shillong", neighborhood: "Police Bazaar", vibeTags: ["Latte Art", "Budget Friendly", "Police Bazaar", "Cozy", "Quick Bites"], theme: "Artisan Latte & Warm Police Bazaar Retreat", tagline: "Slow Down, Sip Slowly, Feel the Hills", introduction: "A compact, warm cafe right in the buzz of Police Bazaar, Latte Love is where Shillong's office crowd and shoppers sneak away for a quiet latte break. The latte art is genuinely impressive for a small neighborhood shop.", whyVisit: "For beautiful latte art, warm wooden interiors, and a quiet escape from Police Bazaar's market noise.", mustTry: [{ name: "Signature Latte Art Special", description: "Double shot with steamed whole milk poured into intricate rosette patterns.", price: "₹140" }, { name: "Grilled Cheese & Tomato Sandwich", description: "Old-school grilled sandwich with local cheese and garden tomatoes.", price: "₹120" }] },
  { name: "Woodstock Cafe", address: "Hotel Polo Towers, Polo Road, Shillong", neighborhood: "Police Bazaar", vibeTags: ["Live Music", "Rock Culture", "Hotel Cafe", "Classic Rock", "Lively Nights"], theme: "Classic Rock Memorabilia & Live Band Stage", tagline: "Rock & Roll Never Died — It Just Moved to Shillong", introduction: "Housed inside Hotel Polo Towers, Woodstock Cafe is Shillong's most storied music venue-cafe hybrid. With walls plastered in classic rock posters, a small stage for live acts, and a menu that spans comfort food to cocktails, it is the city's premier rock culture institution.", whyVisit: "For live classic rock bands on weekends, cold beers, and the best chicken wings in Shillong.", hasLiveMusic: true, mustTry: [{ name: "Woodstock BBQ Chicken Wings", description: "Crispy oven-roasted wings tossed in smoky BBQ sauce with slaw on the side.", price: "₹320" }, { name: "Classic Rock Burger", description: "Double beef patty, caramelized onions, cheddar, pickles, house sauce, brioche bun.", price: "₹280" }] },
  { name: "Tring Tring", address: "Hotel Polo Towers, Polo Road, Police Bazar, Shillong", neighborhood: "Police Bazaar", vibeTags: ["Fine Dining", "Rooftop", "Continental", "Hotel Restaurant", "Panoramic View"], theme: "Panoramic Valley View Rooftop Dining", tagline: "Dine Above the Clouds, Below the Stars", introduction: "Tring Tring at Hotel Polo Towers is Shillong's most elegant rooftop dining experience. With sweeping panoramic views of the Khasi Hills and a menu blending continental classics with Indian touches, it is the city's prime venue for romantic dinners and celebratory meals.", whyVisit: "For the unmatched panoramic view of Shillong's ridges from an elevated terrace while dining on refined continental cuisine.", mustTry: [{ name: "Pan Seared River Trout", description: "Fresh Meghalaya river trout, herb butter, lemon caper sauce, mashed potato.", price: "₹480" }, { name: "Mushroom Risotto with Truffle Oil", description: "Arborio rice, wild hill mushrooms, parmesan, aged truffle oil drizzle.", price: "₹420" }] },
  { name: "Qzine Restaurant", address: "Police Bazar, Shillong", neighborhood: "Police Bazaar", vibeTags: ["Live Grill", "International Fusion", "Innovative Menu", "Lively", "Trendy"], theme: "Live Grilling Theatre & International Fusion Kitchen", tagline: "Watch Your Meal Come Alive at the Grill", introduction: "Qzine brings theatrical live-fire cooking to Shillong. Skilled chefs grill meats and vegetables right before your eyes, blending local Meghalayan ingredients with international techniques for a dramatic dining experience unlike anything else in the city.", whyVisit: "For the live grilling theatre, innovative fusion dishes, and the most theatrical dining presentation in Shillong.", mustTry: [{ name: "Live Grill Mixed Platter", description: "Chef's daily selection of meats and vegetables grilled live at the table.", price: "₹550" }, { name: "Meghalaya Fusion Pork Chop", description: "Hill pork chop, local herbs, smoked pineapple chutney, grilled corn.", price: "₹380" }] },
  { name: "Dejavu Cafe & Lounge", address: "Laitumkhrah, Shillong", neighborhood: "Laitumkhrah", vibeTags: ["Lounge", "Youth Crowd", "Music", "Bar", "Late Night"], theme: "Retro Lounge Vibes & Underground Music Scene", tagline: "Relive Every Good Night You've Ever Had", introduction: "Dejavu is Shillong's premier lounge-cafe hybrid, pulling in the city's young creative crowd with its moody lighting, eclectic playlist, and a menu that runs from all-day coffee to late-night cocktails. The vibe is retro-chic with a northeast underground energy.", whyVisit: "For Shillong's best late-night lounge atmosphere, craft cocktails, and indie music discoveries.", mustTry: [{ name: "Smoked Pork Nachos", description: "Corn tortilla chips, pulled smoked pork, jalapeños, cheddar, sour cream.", price: "₹280" }, { name: "Passionfruit Mojito", description: "Fresh passionfruit, mint, lime, soda, light rum.", price: "₹220" }] },
  { name: "Enchante Tea Room", address: "Laitumkhrah, Shillong", neighborhood: "Laitumkhrah", vibeTags: ["Tea Culture", "Intimate", "Quiet", "Heritage", "Book Nook"], theme: "Colonial Heritage Tea Tradition & Intimate Parlour", tagline: "Seven Covers, a Thousand Stories, One Perfect Pot", introduction: "The smallest cafe in this guide with only 7 covers, Enchante Tea Room is a miniature masterpiece of old-Shillong tea culture. Mismatched vintage crockery, lace curtains, and a handwritten menu of estate teas make this the most intimate and charming stop in the city.", whyVisit: "For Meghalaya's finest heritage teas served in proper pots with homemade scones in a tiny, utterly charming parlour.", mustTry: [{ name: "Darjeeling First Flush Pot", description: "Authentic first-flush Darjeeling, loose-leaf brewed in a china pot, served with honey.", price: "₹180" }, { name: "Butter Scone with Jam", description: "Homemade scone, local honey, strawberry preserve, clotted cream.", price: "₹140" }] },
  { name: "Inside Out Cafe", address: "Laitumkhrah, Shillong", neighborhood: "Laitumkhrah", vibeTags: ["Chinese", "South Indian", "Fusion Snacks", "Casual", "Local Hangout"], theme: "East-South Fusion Street Food & Casual Bites", tagline: "Where Chinese Chowmein Meets South Indian Dosa", introduction: "Inside Out Cafe is Shillong's most delightfully eclectic fusion spot — a tiny casual cafe where Chinese stir-fries and South Indian tiffin items share equal billing on the menu. Popular with students and office workers for quick, affordable, and genuinely tasty food.", whyVisit: "For the best value fusion meal in Laitumkhrah — half Chinese, half South Indian, completely Shillong.", mustTry: [{ name: "Schezwan Chowmein", description: "Wok-tossed noodles, Schezwan sauce, mixed vegetables, egg.", price: "₹120" }, { name: "Masala Dosa with Coconut Chutney", description: "Crispy fermented dosa, spiced potato filling, freshly ground coconut chutney.", price: "₹100" }] },
  { name: "Cafe Regal", address: "Regal Point, Police Bazar, Shillong", neighborhood: "Police Bazaar", vibeTags: ["Heritage", "Old Shillong", "Classic", "Family Dining", "Colonial Style"], theme: "Old Shillong Colonial Heritage Cafe", tagline: "A Taste of Shillong as It Always Was", introduction: "One of Shillong's oldest cafes, Cafe Regal at Regal Point has been serving the city since colonial times. With its high ceilings, dark wood paneling, and a menu of timeless Indian and continental classics, it is where old Shillong lives on untouched.", whyVisit: "For old-world charm, heritage colonial ambience, and consistently good Indian-continental classics in the heart of Police Bazaar.", mustTry: [{ name: "Chicken Cutlet with Brown Sauce", description: "Old-recipe crumbed chicken cutlet, house brown sauce, mashed potato.", price: "₹240" }, { name: "Shillong Special Masala Chai", description: "Strong Assam tea, whole spices, fresh ginger, full-fat milk.", price: "₹60" }] },
  { name: "Chez Rodin", address: "Laitumkhrah, Shillong", neighborhood: "Laitumkhrah", vibeTags: ["French", "European", "Fine Dining", "Pastry", "Wine"], theme: "French Bistro & European Patisserie in the Khasi Hills", tagline: "Paris Meets the Pine Hills", introduction: "Chez Rodin brings a genuine slice of French bistro culture to Shillong's Laitumkhrah. With freshly baked croissants, authentic French press coffee, and a charcuterie board that surprises every visitor, it is the city's most unexpected and delightful culinary secret.", whyVisit: "For fresh croissants, French press coffee, and an authentic European bistro experience you never expected to find in Meghalaya.", mustTry: [{ name: "Butter Croissant & Café au Lait", description: "Freshly baked layered croissant with house cultured butter, café au lait.", price: "₹180" }, { name: "Charcuterie Board", description: "Cured meats, aged cheese, local fruit jam, crackers, olives.", price: "₹380" }] },
];

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getPhotoUrl(ref: string, w = 1200): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${w}&photo_reference=${ref}&key=${API_KEY}`;
}

function priceLevelStr(n?: number): string {
  return ["Free", "₹", "₹₹", "₹₹₹", "₹₹₹₹"][n ?? 2] ?? "₹₹";
}

async function searchPlace(name: string, address: string) {
  const q = encodeURIComponent(`${name} ${address} Shillong Meghalaya`);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${q}&key=${API_KEY}`;
  const r = await fetch(url);
  const d = await r.json() as any;
  if (d.status !== "OK" || !d.results?.length) return null;
  return d.results[0];
}

async function getDetails(placeId: string) {
  const fields = "place_id,name,formatted_address,geometry,url,website,formatted_phone_number,opening_hours,rating,user_ratings_total,photos,price_level,types";
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}`;
  const r = await fetch(url);
  const d = await r.json() as any;
  return d.status === "OK" ? d.result : null;
}

async function main() {
  console.log("=== Adding New Shillong Cafes ===\n");

  const raw = fs.readFileSync(DB_PATH, "utf-8");
  const db: any[] = JSON.parse(raw);
  const existingNames = new Set(db.map(c => c.name.toLowerCase()));

  const toAdd = NEW_CAFES.filter(c => !existingNames.has(c.name.toLowerCase()));
  console.log(`${toAdd.length} new cafes to add (${NEW_CAFES.length - toAdd.length} already exist)\n`);

  const added: any[] = [];

  for (const template of toAdd) {
    console.log(`Adding: ${template.name}`);
    await new Promise(r => setTimeout(r, 300));

    const search = await searchPlace(template.name, template.address);
    const placeId = search?.place_id;
    const details = placeId ? await getDetails(placeId) : null;

    const lat = details?.geometry?.location?.lat ?? search?.geometry?.location?.lat ?? 25.572;
    const lng = details?.geometry?.location?.lng ?? search?.geometry?.location?.lng ?? 91.892;

    const allPhotos = details?.photos || search?.photos || [];
    const photoUrls = allPhotos.slice(0, 6).map((p: any, i: number) =>
      getPhotoUrl(p.photo_reference, i === 0 ? 1200 : 800)
    );

    const cafe: any = {
      id: slug(template.name),
      name: template.name,
      tagline: template.tagline,
      theme: template.theme,
      introduction: template.introduction,
      whyVisit: template.whyVisit,
      hours: details?.opening_hours?.weekday_text?.[0] || "10:00 AM — 9:00 PM",
      address: details?.formatted_address || template.address,
      neighborhood: template.neighborhood,
      images: photoUrls.length > 0 ? {
        hero: photoUrls[0],
        card: photoUrls[1] || photoUrls[0],
        interior: photoUrls[2],
      } : {
        hero: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200",
        card: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800",
      },
      photos: photoUrls,
      gallery: photoUrls.slice(1),
      vibeTags: template.vibeTags,
      hasLiveMusic: template.hasLiveMusic ?? false,
      mustTry: template.mustTry.map(m => ({ ...m, image: photoUrls[3] || "" })),
      coordinates: { lat, lng },
      latitude: lat,
      longitude: lng,
      formatted_address: details?.formatted_address || template.address,
      place_id: placeId || null,
      phone_number: details?.formatted_phone_number || null,
      website: details?.website || null,
      google_maps_url: details?.url || null,
      rating: details?.rating ?? search?.rating ?? 4.2,
      user_ratings_total: details?.user_ratings_total ?? search?.user_ratings_total ?? 0,
      price_level: details?.price_level ?? 2,
      price_display: priceLevelStr(details?.price_level ?? 2),
      opening_hours: details?.opening_hours?.weekday_text || [],
      types: details?.types || ["cafe", "food"],
      verification_status: placeId ? "verified" : "unverified",
    };

    db.push(cafe);
    added.push(cafe);

    console.log(`  ✓ lat=${lat.toFixed(4)}, lng=${lng.toFixed(4)}, photos=${photoUrls.length}, rating=${cafe.rating}`);
    if (cafe.phone_number) console.log(`  ✓ phone=${cafe.phone_number}`);
  }

  const backup = DB_PATH.replace(".json", `.backup-${Date.now()}.json`);
  fs.writeFileSync(backup, raw, "utf-8");
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");

  console.log(`\n✅ Added ${added.length} cafes. Total: ${db.length} cafes in DB.`);
  console.log(`Backup: ${backup}`);
}

main().catch(console.error);
