/**
 * Rhino Picnic Planner — Shillong region routes.
 * Source: "Rhino Picnic Planner JPY" PDF (transcribed markdown).
 * All distances/times measured from Anjali Petrol Pump, Shillong (trip origin).
 * No GPS in source — coordinates resolved at runtime via Google Places (cached).
 */

export type PicnicKind = "Tourist Spot" | "Eatery" | "Trek" | "Picnic Spot" | "Misc";

export interface PicnicPoint {
  ser: number;
  name: string;
  kind: PicnicKind;
  distKm: number;
  time: string;
  remarks: string;
}

export interface PicnicRoute {
  id: string;
  region: string;
  label: string;
  emoji: string;
  color: string;
  blurb: string;
  center: { lat: number; lng: number };
  zoom: number;
  startName: string;
  points: PicnicPoint[];
}

export const PICNIC_KIND_META: Record<PicnicKind, { color: string; emoji: string }> = {
  "Tourist Spot": { color: "#059669", emoji: "🏛️" },
  Eatery: { color: "#b45309", emoji: "🍽️" },
  Trek: { color: "#7c3aed", emoji: "🥾" },
  "Picnic Spot": { color: "#0369a1", emoji: "🧺" },
  Misc: { color: "#6b7280", emoji: "📦" },
};

const START = "Anjali Petrol Pump, Shillong, Meghalaya";

export const PICNIC_ROUTES: PicnicRoute[] = [
  {
    id: "city",
    region: "City",
    label: "Shillong City",
    emoji: "🏙️",
    color: "#0891b2",
    blurb: "Cathedrals, cafés, war memorials & Shillong Peak",
    center: { lat: 25.5788, lng: 91.89 },
    zoom: 13,
    startName: START,
    points: [
      { ser: 1, name: "Rhino Prerna Sthal", kind: "Tourist Spot", distKm: 0.3, time: "0:02", remarks: "War memorial made in honour of martyrs of 1971 war." },
      { ser: 2, name: "Rhino Heritage Museum", kind: "Tourist Spot", distKm: 0.5, time: "0:03", remarks: "Very small museum with artifacts of 1971 War, where troops of 101 Area were first to enter Dacca." },
      { ser: 3, name: "All Saint's Cathedral", kind: "Tourist Spot", distKm: 1.1, time: "0:05", remarks: "Cathedral opened only during mass timings." },
      { ser: 4, name: "Wards Lake", kind: "Tourist Spot", distKm: 2.3, time: "0:08", remarks: "Tuesday closed." },
      { ser: 5, name: "Police Bazaar", kind: "Tourist Spot", distKm: 2.2, time: "0:08", remarks: "Sunday mostly closed." },
      { ser: 6, name: "City Hut Dhaba", kind: "Eatery", distKm: 2.4, time: "0:10", remarks: "Avoid weekend; parking available; advance table booking not permitted." },
      { ser: 7, name: "Cathedral of Mary Help of Christians", kind: "Tourist Spot", distKm: 2.4, time: "0:10", remarks: "Road often blocked due to schools around; avoid school start/end timings. Opened only during mass timings." },
      { ser: 8, name: "Dejavu Restaurant", kind: "Eatery", distKm: 2.9, time: "0:15", remarks: "Good Chinese cuisine. Vehicle parking is an issue." },
      { ser: 9, name: "Dylan's Café", kind: "Eatery", distKm: 2.5, time: "0:10", remarks: "Good ambiance, limited menu. Not crowded, adequate parking." },
      { ser: 10, name: "Tripura Castle", kind: "Eatery", distKm: 3.8, time: "0:15", remarks: "Excellent ambiance and food with car parking. Approach route a bit narrow." },
      { ser: 11, name: "Sweet Fall View Point", kind: "Tourist Spot", distKm: 11, time: "0:40", remarks: "Route through 58 GTC. Not recommended for a short visit." },
      { ser: 12, name: "Sunset Café", kind: "Eatery", distKm: 3.7, time: "0:09", remarks: "Nice place, large food portions, reasonably priced." },
      { ser: 13, name: "ML05 Café", kind: "Eatery", distKm: 7.1, time: "0:16", remarks: "Good ambiance and food. Usually closes by 19:30 hrs." },
      { ser: 14, name: "Don Bosco Museum", kind: "Tourist Spot", distKm: 4.5, time: "0:15", remarks: "Go via Mawlai Point. Must visit to learn about indigenous culture of NE. Sunday closed." },
      { ser: 15, name: "Shillong Peak", kind: "Tourist Spot", distKm: 9.6, time: "0:24", remarks: "Inside AF Station, carry ID card." },
      { ser: 16, name: "Rhododendron Trek", kind: "Trek", distKm: 2.4, time: "0:06", remarks: "6.5 km trek, easy climb, red arrow marks. Starts ~1 km ahead of HQ 101 Area Gate, ends en route to Shillong Peak. Blooms in March. Cater for ride to finish point." },
    ],
  },
  {
    id: "cherrapunji",
    region: "Cherrapunji",
    label: "Cherrapunji",
    emoji: "🌊",
    color: "#0369a1",
    blurb: "World's wettest — 25 falls, caves & root bridges",
    center: { lat: 25.2797, lng: 91.7262 },
    zoom: 11,
    startName: START,
    points: [
      { ser: 1, name: "Airforce Museum", kind: "Tourist Spot", distKm: 8.7, time: "0:25", remarks: "Small museum; will impress civilian guests." },
      { ser: 2, name: "Elephant Falls", kind: "Tourist Spot", distKm: 9.1, time: "0:26", remarks: "A very small waterfall closer to the city." },
      { ser: 3, name: "Woodstock Farmhouse", kind: "Eatery", distKm: 10, time: "0:25", remarks: "Nice ambiance and food." },
      { ser: 4, name: "Bulls Trek Wahniangleng", kind: "Trek", distKm: 24, time: "0:51", remarks: "Trek 45–50 min downhill (1.75 km / 300 m descent) + ~1 hr return climb. Follow signboard right and up (Meiduh Food Corner marks parking, don't follow Google). Riverbed soft/boggy; non-swimmers avoid. Best post-rains." },
      { ser: 5, name: "Café Cherrapunjee", kind: "Eatery", distKm: 27, time: "0:55", remarks: "Good ambiance and food. Opens around lunch (13:30 hrs)." },
      { ser: 6, name: "Mawkdok Dympep Valley View Pt", kind: "Tourist Spot", distKm: 27, time: "0:55", remarks: "Ziplining available." },
      { ser: 7, name: "Cloud Country Restaurant", kind: "Eatery", distKm: 37, time: "1:10", remarks: "Beautiful ambience. Pure veg, tasty, reasonably priced, opens ~08:00 hrs." },
      { ser: 8, name: "Misty Hills Restaurant", kind: "Eatery", distKm: 42, time: "1:16", remarks: "Good economical food. Gets covered in clouds during monsoon." },
      { ser: 9, name: "Wah Kaba Falls", kind: "Picnic Spot", distKm: 43, time: "1:10", remarks: "Walk down 300 m of steps." },
      { ser: 10, name: "Arwah Caves", kind: "Tourist Spot", distKm: 49, time: "1:43", remarks: "Scenic pathway. Large cave with fossils formed underwater." },
      { ser: 11, name: "Seven Sister Falls View Point", kind: "Tourist Spot", distKm: 53, time: "1:43", remarks: "Visit only in monsoons." },
      { ser: 12, name: "Polo Orchid Cherrapunji", kind: "Eatery", distKm: 54, time: "1:43", remarks: "Good ambiance and view of Seven Sister Falls. Food a bit costly." },
      { ser: 13, name: "Khoh Ramhah Conical Rock", kind: "Picnic Spot", distKm: 60, time: "1:50", remarks: "Amazing view of Bangladesh; space for group picnic." },
      { ser: 14, name: "Bangladesh View Point", kind: "Tourist Spot", distKm: 61, time: "1:51", remarks: "Good view of Bangladesh plains (Sylhet) on a clear day." },
      { ser: 15, name: "Kynrem Falls", kind: "Tourist Spot", distKm: 66, time: "2:05", remarks: "Amazing in monsoons. Car can reach base of the fall." },
      { ser: 16, name: "Rangkylliaw Suspension Bridge", kind: "Picnic Spot", distKm: 37, time: "1:20", remarks: "No tree cover, ideal in winters post lunch. Breathtaking sunset pictures." },
      { ser: 17, name: "Kongthong Village (Whistling Village)", kind: "Picnic Spot", distKm: 60, time: "2:30", remarks: "Ahead of Rangkylliaw Bridge (not on Google). Contact Mr Rothell Khongsit (9856060347) for guided trip + lunch at Travellers Nest. Try smoked pork curry with sticky rice." },
      { ser: 18, name: "Garden of Caves", kind: "Tourist Spot", distKm: 46, time: "1:25", remarks: "Visit only in monsoons; good photographic experience." },
      { ser: 19, name: "Mawmluh Caves", kind: "Trek", distKm: 53, time: "1:30", remarks: "~4 km trek inside cave. Hire guide, be kitted (₹1800/head for group >6). Book in advance." },
      { ser: 20, name: "Rainbow Falls", kind: "Tourist Spot", distKm: 61, time: "2:01", remarks: "Route via Double Decker Living Root Bridge. Cannot be done in one day; homestay advisable." },
      { ser: 21, name: "Nohkalikai Falls View Point", kind: "Tourist Spot", distKm: 51, time: "1:25", remarks: "Must visit, aka Cherrapunjee Falls. Buy local condiments and handicraft." },
      { ser: 22, name: "Jiva Resort", kind: "Eatery", distKm: 53, time: "1:25", remarks: "Good ambiance and food. Opens around lunch (13:00 hrs)." },
      { ser: 23, name: "Mawsmai Caves", kind: "Tourist Spot", distKm: 55, time: "1:44", remarks: "Awesome caves; avoid if claustrophobic or knee issues." },
      { ser: 24, name: "Sohbar Bridge", kind: "Picnic Spot", distKm: 69, time: "2:10", remarks: "Less popular version of Dawki. Visit in winters for crystal clear water." },
      { ser: 25, name: "Double Decker Living Root Bridge", kind: "Trek", distKm: 61, time: "2:01", remarks: "Tyrna Parking for start (Sunday closed). ~3500 stairs (~3 km); first 2000 difficult. Carry nimbu pani/ORS. Visit natural pool 1.5 km ahead. Homestays available; stretcher points on last 2000-step stretch (₹3000+)." },
    ],
  },
  {
    id: "wei-sawdong",
    region: "Wei Sawdong",
    label: "Wei Sawdong",
    emoji: "💧",
    color: "#0e7490",
    blurb: "Tiered falls cluster off the Cherrapunji road",
    center: { lat: 25.295, lng: 91.69 },
    zoom: 12,
    startName: START,
    points: [
      { ser: 1, name: "Lyngksiar Fall", kind: "Picnic Spot", distKm: 44, time: "1:10", remarks: "Best in monsoon. Space for group picnics and swimming. Water deep; non-swimmers avoid." },
      { ser: 2, name: "Janailar Falls", kind: "Picnic Spot", distKm: 46, time: "1:20", remarks: "Open swimming pool but no shallow end." },
      { ser: 3, name: "Prut Fall", kind: "Tourist Spot", distKm: 48, time: "1:25", remarks: "Best time is monsoon season." },
      { ser: 4, name: "Mawsawa Falls", kind: "Picnic Spot", distKm: 47, time: "1:30", remarks: "Good for photography. ~200 m easy trek. Very close to Prut Falls." },
      { ser: 5, name: "Wei Sawdong Falls", kind: "Picnic Spot", distKm: 50, time: "1:41", remarks: "Must-see, adventurous route. Wooden ladder damaged at the end; no access to the pool." },
      { ser: 6, name: "Dainthlen Falls", kind: "Picnic Spot", distKm: 50, time: "1:41", remarks: "Can go up to the mouth of the fall." },
    ],
  },
  {
    id: "dawki",
    region: "Dawki",
    label: "Dawki",
    emoji: "🏞️",
    color: "#0284c7",
    blurb: "Crystal Umngot river, root bridges & cleanest village",
    center: { lat: 25.1919, lng: 92.0261 },
    zoom: 12,
    startName: START,
    points: [
      { ser: 1, name: "Mawjngih Lapynshongdor view point", kind: "Tourist Spot", distKm: 34, time: "1:00", remarks: "Good valley view. Hot maggie available." },
      { ser: 2, name: "Ka Bri War Resort", kind: "Eatery", distKm: 57, time: "1:53", remarks: "Only decent eatery en route to Dawki. Separate veg/non-veg restaurants (non-veg crowded)." },
      { ser: 3, name: "Byrdaw Falls", kind: "Picnic Spot", distKm: 66, time: "2:06", remarks: "Good waterfall, difficult walk, sultry/humid. Water falls over two rock overhangs." },
      { ser: 4, name: "Dawki Boat Services", kind: "Tourist Spot", distKm: 76, time: "2:38", remarks: "Bit crowded. Open border with Bangladesh. Clearest water in winter." },
      { ser: 5, name: "Living Root Bridge Riwai Village", kind: "Picnic Spot", distKm: 72, time: "2:36", remarks: "Use correct name (many root bridges around). Closed on Sundays per latest inputs." },
      { ser: 6, name: "Balancing Rock", kind: "Tourist Spot", distKm: 73, time: "2:28", remarks: "Close to Cleanest Village." },
      { ser: 7, name: "Mawlynnong Cleanest Village", kind: "Tourist Spot", distKm: 74, time: "2:32", remarks: "Must try bamboo machhan for a view of Bangladesh. A bit overhyped." },
      { ser: 8, name: "Bamboo Trail", kind: "Trek", distKm: 44, time: "1:20", remarks: "Adventurous, scary and tiring. ~2 hr trek one way. Carry water; avoid with knee/health issues." },
      { ser: 9, name: "Borhill Fall", kind: "Tourist Spot", distKm: 78, time: "2:39", remarks: "On the alternate route to Dawki." },
    ],
  },
  {
    id: "laitlum",
    region: "Laitlum",
    label: "Laitlum",
    emoji: "⛰️",
    color: "#059669",
    blurb: "Grand canyon meadows & Nongjrong sunrise",
    center: { lat: 25.49, lng: 91.98 },
    zoom: 12,
    startName: START,
    points: [
      { ser: 1, name: "Daphiba Café", kind: "Eatery", distKm: 19, time: "0:50", remarks: "On top of a ledge, awesome valley view. Good ambience, reasonably priced." },
      { ser: 2, name: "Laitlum Canyon", kind: "Picnic Spot", distKm: 23, time: "1:00", remarks: "Beautiful meadow, valley view, sunset must-see. Try local rice beer. Closed on Sundays." },
      { ser: 3, name: "Nongjrong View Point", kind: "Picnic Spot", distKm: 49, time: "2:00", remarks: "Visit only Nov–Feb for sunrise. Mist over the valley is mesmerising. Closed on Sundays." },
      { ser: 4, name: "Pdem Falls", kind: "Tourist Spot", distKm: 55, time: "2:16", remarks: "On the road to Wahrashi Falls, closed Sunday. ~2 km trek (30–40 min). Best in monsoons." },
      { ser: 5, name: "Wahrashi Falls", kind: "Picnic Spot", distKm: 64, time: "2:23", remarks: "Three-tiered. Remote, no mobile coverage, scenic English-countryside drive. ~30 min trek (500–600 m). Carry food/clothes; download offline maps." },
    ],
  },
  {
    id: "jowai",
    region: "Jowai",
    label: "Jowai",
    emoji: "💎",
    color: "#0891b2",
    blurb: "Monoliths, sacred temple, Phe Phe & Krang Shuri",
    center: { lat: 25.45, lng: 92.2 },
    zoom: 11,
    startName: START,
    points: [
      { ser: 1, name: "Hotel Highwinds Lakeside", kind: "Eatery", distKm: 55, time: "1:28", remarks: "Good restaurant, good and cheap food." },
      { ser: 2, name: "Tyrshi Falls", kind: "Tourist Spot", distKm: 58, time: "1:43", remarks: "See in monsoons only." },
      { ser: 3, name: "The Loomkyntoor Resort", kind: "Picnic Spot", distKm: 74, time: "2:24", remarks: "Night stay recommended; morning walk to Phe Phe and swim in the pool is a must." },
      { ser: 4, name: "Phe Phe Falls", kind: "Picnic Spot", distKm: 78, time: "2:23", remarks: "Road repaired. Must-see fall with blue water. ~20 min trek." },
      { ser: 5, name: "Krang Shuri Falls", kind: "Picnic Spot", distKm: 86, time: "2:24", remarks: "Beautiful fall; swimming, boating, ziplining. ~20 min trek." },
      { ser: 6, name: "Shnongpdeng Village", kind: "Picnic Spot", distKm: 84, time: "3:00", remarks: "Route via Jowai longer but good (113 km), +10 min. Night halt; Betelnut Resort decent." },
      { ser: 7, name: "Monolith Garden Nartiang", kind: "Tourist Spot", distKm: 61, time: "1:51", remarks: "Not maintained; see with Durga temple." },
      { ser: 8, name: "Shri Nartiang Durga Temple", kind: "Tourist Spot", distKm: 61, time: "1:51", remarks: "One of the Shaktipeeths. Less crowded, positive vibes." },
      { ser: 9, name: "Amkoi Sliang Wah Umngot", kind: "Trek", distKm: 107, time: "3:30", remarks: "Challenging 2-hr one-way trek (~1000 ft descent), warm/humid; do in winters. Carry water/electrolytes. Guide a must (₹500). Google inaccurate near end via Nongbareh." },
      { ser: 10, name: "Noh Kawang Falls", kind: "Tourist Spot", distKm: 109, time: "3:19", remarks: "Mesmerising; two small falls en route. ~15–20 min trek. Road beyond Amlarem bad (~22 km) + 2 km mud track; avoid car if raining." },
    ],
  },
  {
    id: "silchar",
    region: "Silchar",
    label: "Silchar Side",
    emoji: "🌿",
    color: "#16a34a",
    blurb: "Remote falls & risky cave treks toward Silchar",
    center: { lat: 25.05, lng: 92.45 },
    zoom: 11,
    startName: START,
    points: [
      { ser: 1, name: "Moopun Falls", kind: "Picnic Spot", distKm: 88, time: "2:20", remarks: "Beautiful, small sandy beach with room to change. ~20 min trek. On the road towards Silchar." },
      { ser: 2, name: "Umbyein Falls", kind: "Picnic Spot", distKm: 92, time: "2:30", remarks: "4–5 km ahead of Moopun. ~2 km easy trek; confusing route, ask locals. Shallow beach then deep — non-swimmers careful, no lifeguards." },
      { ser: 3, name: "Krem Chympe (Brishirnot)", kind: "Trek", distKm: 131, time: "3:30", remarks: "Cave trek from the waterfall. Need good guide (Lashbuam 7005620839); very risky, one-way, no turning back. Entrance hidden behind boulders, reached by swimming; strong currents — wear life vest." },
      { ser: 4, name: "Khaddum Pieltleng Falls (Brishirnot)", kind: "Trek", distKm: 131, time: "3:30", remarks: "Trek from village Brishirnot. Monsoon: 12.6 km moderate trek. 4x4 to falls in winters; unmarked, need guide (Lashbuam 7005620839). Start early (~8–9 hrs). No eateries en route." },
    ],
  },
  {
    id: "mawsynram",
    region: "Maysynram",
    label: "Mawsynram",
    emoji: "🌧️",
    color: "#2563eb",
    blurb: "Wettest place on Earth, caves & David Scott Trail",
    center: { lat: 25.3, lng: 91.58 },
    zoom: 11,
    startName: START,
    points: [
      { ser: 1, name: "Molis Fall", kind: "Tourist Spot", distKm: 51, time: "2:00", remarks: "Next to the road to Split Rock Trail. Good photography spot during monsoons." },
      { ser: 2, name: "Mawjymbuin Caves", kind: "Tourist Spot", distKm: 56, time: "2:10", remarks: "Cave with a naturally formed Shiv Linga. Deep unlit cave, no guides inside." },
      { ser: 3, name: "Mawsynram", kind: "Tourist Spot", distKm: 57, time: "2:15", remarks: "Wettest place on Earth. Club with Split Rock Trails." },
      { ser: 4, name: "Umkhakoi Water Park", kind: "Picnic Spot", distKm: 73, time: "2:43", remarks: "See with Split Rock Trail (2 km). Family picnic; kayaking and swimming permitted." },
      { ser: 5, name: "Split Rock Trail", kind: "Picnic Spot", distKm: 76, time: "2:42", remarks: "500–600 m trek through a rock crevasse. Adventurous and difficult." },
      { ser: 6, name: "Mawphlang Sacred Forest", kind: "Picnic Spot", distKm: 23, time: "0:45", remarks: "Hire a guide to see the forest and learn its history." },
      { ser: 7, name: "Ranikor River Beach", kind: "Picnic Spot", distKm: 117, time: "4:10", remarks: "Beautiful, untouched river beach. Avoid single vehicle; download offline maps." },
      { ser: 8, name: "David Scott Trail", kind: "Trek", distKm: 22, time: "0:46", remarks: "13.5 km easy trek (4–6 hrs). Entry from Sacred Forest side, exit on Cherrapunji Road (both on Google). Mostly stone paved; guide ₹1500. One tea stall ~8 km in. Best in winter." },
    ],
  },
  {
    id: "nongstoin",
    region: "Nongstoin",
    label: "Nongstoin",
    emoji: "🪨",
    color: "#7c3aed",
    blurb: "Kyllang Rock, Dzuko valley & Mawphanlur meadows",
    center: { lat: 25.52, lng: 91.26 },
    zoom: 10,
    startName: START,
    points: [
      { ser: 1, name: "Khudoi Falls", kind: "Picnic Spot", distKm: 52, time: "1:25", remarks: "Google inaccurate. After Mairang Village, right turn from St Thomas Higher Secondary School. Ask locals." },
      { ser: 2, name: "Kyllang Rock", kind: "Tourist Spot", distKm: 54, time: "1:41", remarks: "Massive rock; scary + mesmerising view, ~20–30 min climb. See with Khudoi Falls." },
      { ser: 3, name: "Dommurok View Point (Markhan Valley)", kind: "Picnic Spot", distKm: 59, time: "1:45", remarks: "Last 8–9 km muddy/no road; avoid monsoons. Best immediately post-monsoon. Good group picnic." },
      { ser: 4, name: "Mawphanlur", kind: "Picnic Spot", distKm: 67, time: "1:44", remarks: "Good location for group picnic." },
      { ser: 5, name: "Meghalaya's Dzuko Valley", kind: "Tourist Spot", distKm: 76, time: "1:46", remarks: "Nice for photography, adjacent to highway." },
      { ser: 6, name: "Wei Weinia Falls", kind: "Picnic Spot", distKm: 102, time: "2:40", remarks: "Very scenic drive. Not much walking to see the fall." },
    ],
  },
  {
    id: "tura",
    region: "Tura",
    label: "Tura / Garo Hills",
    emoji: "🐘",
    color: "#be123c",
    blurb: "Wari Chora, Siju Caves & Garo Hills expedition",
    center: { lat: 25.33, lng: 90.62 },
    zoom: 9,
    startName: START,
    points: [
      { ser: 1, name: "Nasep Chiring Natural Pool", kind: "Picnic Spot", distKm: 234, time: "6:00", remarks: "Part of Wari Chora package, on the road to Siju. ~10 min easy trek. Bottomless old mine shaft pool; non/weak swimmers stay away. Guide required." },
      { ser: 2, name: "Rongchang Rock Formation Ram Sangma", kind: "Tourist Spot", distKm: 253, time: "6:40", remarks: "Part of Wari Chora package. Don't venture without a guide; sharp rocks, beware snakes." },
      { ser: 3, name: "Siju Caves", kind: "Tourist Spot", distKm: 254, time: "6:55", remarks: "Part of Wari Chora package. Guide needed; carry slippers, wade through water. Alongside Siju Tourist Lodge." },
      { ser: 4, name: "Siju Tourist Lodge", kind: "Misc", distKm: 254, time: "6:55", remarks: "Lonely place, only Jio works, erratic power, simple tasty food, poor rooms — carry towels/bedsheet/soap/booze. Beautiful river beach, campfire, nocturnal flying squirrels." },
      { ser: 5, name: "Jadesil Fish Sanctuary", kind: "Tourist Spot", distKm: 255, time: "8:30", remarks: "Part of Wari Chora package. Pick puffed rice to feed fishes from Tolegre village. ~1.5 hr (10 km) off-road from Siju + 20 min trek." },
      { ser: 6, name: "Wari Chora", kind: "Picnic Spot", distKm: 270, time: "7:35", remarks: "Needs guide + 4x4. 263 km Shillong→Siju. Stay at Siju; Wari Chora ~3.5 hr off-road + 1 hr trek. Baghmara Campers (6290979563) ₹8500/head incl pickup, 2 nights, 5 meals. Closed in rains." },
    ],
  },
  {
    id: "umiam",
    region: "Umiam",
    label: "Umiam Lake",
    emoji: "🚤",
    color: "#0d9488",
    blurb: "Lake resorts, water sports & camping",
    center: { lat: 25.65, lng: 91.9 },
    zoom: 12,
    startName: START,
    points: [
      { ser: 1, name: "Eastern Command Water Sports & Adventure Node", kind: "Picnic Spot", distKm: 16, time: "0:31", remarks: "Good for boating. Serve good South Indian food with advance intimation." },
      { ser: 2, name: "Orchid Lake Resort", kind: "Eatery", distKm: 16, time: "0:36", remarks: "Good ambience and food." },
      { ser: 3, name: "Umiam Lake", kind: "Picnic Spot", distKm: 16, time: "0:35", remarks: "On working day ~1 hr. No entry after 17:00 hrs." },
      { ser: 4, name: "Bahut Chota Pani", kind: "Picnic Spot", distKm: 21, time: "0:55", remarks: "Inside Umroi Cantt. Small lake with boating + eateries. Try Sunday brunch; inform before going." },
      { ser: 5, name: "Ri Kynjai Resort", kind: "Eatery", distKm: 22, time: "0:55", remarks: "Entry only after booking. Amazing ambience and food. Open at lunch." },
      { ser: 6, name: "Lake Paradise Camping Ground", kind: "Picnic Spot", distKm: 44, time: "1:48", remarks: "Leave car at resort parking, take a boat to campsite. Winter preferred. Order food in advance." },
    ],
  },
  {
    id: "guwahati",
    region: "Guwahati",
    label: "Guwahati",
    emoji: "🛕",
    color: "#d97706",
    blurb: "Kamakhya, Brahmaputra cruise & Pobitora rhinos",
    center: { lat: 26.18, lng: 91.75 },
    zoom: 10,
    startName: START,
    points: [
      { ser: 1, name: "Excelencia Restaurant", kind: "Eatery", distKm: 48, time: "1:21", remarks: "En route to Guwahati; good food and ambiance." },
      { ser: 2, name: "Jiva Veg", kind: "Eatery", distKm: 53, time: "1:18", remarks: "Good veg restaurant en route to Guwahati." },
      { ser: 3, name: "Alfresco Grand Cruise", kind: "Picnic Spot", distKm: 99, time: "2:52", remarks: "Sunset and dinner cruises. Sunset cruise worth it; book upper deck." },
      { ser: 4, name: "Pobitora Wildlife Sanctuary", kind: "Tourist Spot", distKm: 117, time: "3:17", remarks: "Smaller than Kaziranga but higher rhino density. Avoid monsoon. Elephant + jeep safari." },
      { ser: 5, name: "Sri Kamakhya Temple", kind: "Tourist Spot", distKm: 103, time: "3:00", remarks: "~4 hours for darshan even with VIP pass." },
    ],
  },
];
