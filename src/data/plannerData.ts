export interface PlannerLocation {
  id: string;
  name: string;
  type: "Tourist Spot" | "Eatery" | "Trek" | "Picnic Spot" | "Misc";
  distanceKm: number;
  timeEstimate: string;
  remarks: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface PlannerRoute {
  id: string;
  name: string;
  pages: string;
  centroid: {
    lat: number;
    lng: number;
  };
  locations: PlannerLocation[];
}

export const RHINO_GYAN_RULES = [
  "All distances have been taken from Pinewalk Crossing Near Rhino Auditorium and timings are approximate.",
  "Crossing Laitumkhrah is time consuming on working days especially during school timings. While going towards Laitkor on a working day, it is advisable to use the route via Shillong Peak, it is a bit longer but saves lots of time.",
  "Rainy season is from Mid Mar to Late Sep, don't change your plan because of rain. Just carry a large umbrella, slipper and a dress change to enjoy the clouds, rains and the beautiful waterfalls.",
  "Picnic spots are places where you can sit & spend the whole day, carry your drinks, snacks and a dress to swim.",
  "Most of the places are in remote location, Google Map and GPay may not work. Download offline maps before commencing journey. Carry cash with adequate change, most of the places have entry tickets varying from 20/- to 100/-.",
  "Most of the places have clean Indian toilets, but carrying a ladies tent is advisable.",
  "For long treks carry adequate water (Nimbu Pani, ORS, Chocolates), avoid soft / hard drink. It is advisable to hire a guide since these are not properly marked and there are no mobile networks.",
  "Please consult your guide before eating any fruits / berries during treks, these could be poisonous / allergic. Carrying insect repellent cream and anti-allergy tablets is recommended.",
  "Please don't litter, carry waste disposal bags."
];

export const PLANNER_ROUTES: PlannerRoute[] = [
  {
    id: "city",
    name: "City Route",
    pages: "01-04",
    centroid: { lat: 25.5788, lng: 91.8920 },
    locations: [
      {
        id: "rhino-prerna",
        name: "Rhino Prerna Sthal",
        type: "Tourist Spot",
        distanceKm: 0.3,
        timeEstimate: "0:02",
        remarks: "War Memorial made in honour of Martyrs of 1971 War.",
        coordinates: { lat: 25.5684, lng: 91.8835 }
      },
      {
        id: "rhino-heritage",
        name: "Rhino Heritage Museum",
        type: "Tourist Spot",
        distanceKm: 0.5,
        timeEstimate: "0:03",
        remarks: "Very small museum having collection of artifacts of 1971 War, where the troops of 101 Area were the first to enter Dacca.",
        coordinates: { lat: 25.5654, lng: 91.8812 }
      },
      {
        id: "all-saints",
        name: "All Saint's Cathedral",
        type: "Tourist Spot",
        distanceKm: 1.1,
        timeEstimate: "0:05",
        remarks: "Cathedral is opened only during mass timings.",
        coordinates: { lat: 25.5701, lng: 91.8860 }
      },
      {
        id: "wards-lake",
        name: "Wards Lake",
        type: "Tourist Spot",
        distanceKm: 2.3,
        timeEstimate: "0:08",
        remarks: "Tue closed.",
        coordinates: { lat: 25.5750, lng: 91.8885 }
      },
      {
        id: "police-bazaar-spot",
        name: "Police Bazaar",
        type: "Tourist Spot",
        distanceKm: 2.2,
        timeEstimate: "0:08",
        remarks: "Sun mostly closed.",
        coordinates: { lat: 25.5794, lng: 91.8821 }
      },
      {
        id: "city-hut-dhaba",
        name: "City Hut Dhaba",
        type: "Eatery",
        distanceKm: 2.4,
        timeEstimate: "0:10",
        remarks: "Avoid weekend, parking available, advance table booking not permitted.",
        coordinates: { lat: 25.5765, lng: 91.8845 }
      },
      {
        id: "cathedral-mary-help",
        name: "Cathedral of Mary Help of Christians",
        type: "Tourist Spot",
        distanceKm: 2.4,
        timeEstimate: "0:10",
        remarks: "Usually the road gets blocked due to many schools around that place, avoid school start & end timings. Cathedral is opened only during mass timings.",
        coordinates: { lat: 25.5712, lng: 91.8938 }
      },
      {
        id: "dejavu",
        name: "Dejavu Restaurant",
        type: "Eatery",
        distanceKm: 2.9,
        timeEstimate: "0:15",
        remarks: "Good Chinese Cuisine. Vehicle parking is an issue.",
        coordinates: { lat: 25.5705, lng: 91.8988 }
      },
      {
        id: "dylans-cafe-spot",
        name: "Dylan's Café",
        type: "Eatery",
        distanceKm: 2.5,
        timeEstimate: "0:10",
        remarks: "Good ambiance, limited choice of menu. Not crowded and has adequate parking.",
        coordinates: { lat: 25.5658, lng: 91.9021 }
      },
      {
        id: "tripura-castle-spot",
        name: "Tripura Castle",
        type: "Eatery",
        distanceKm: 3.8,
        timeEstimate: "0:15",
        remarks: "Excellent ambiance and food with parking for cars. Approach route is a bit narrow.",
        coordinates: { lat: 25.5590, lng: 91.9065 }
      },
      {
        id: "sweet-fall",
        name: "Sweet Fall View Point",
        type: "Tourist Spot",
        distanceKm: 11,
        timeEstimate: "0:40",
        remarks: "Route through 58 GTC. Not recommended in case of short visit.",
        coordinates: { lat: 25.5552, lng: 91.9284 }
      },
      {
        id: "sunset-cafe-spot",
        name: "Sunset Café",
        type: "Eatery",
        distanceKm: 3.7,
        timeEstimate: "0:09",
        remarks: "Nice place, large food portion served, reasonably priced.",
        coordinates: { lat: 25.5681, lng: 91.8755 }
      },
      {
        id: "ml05-cafe-spot",
        name: "ML05 Café",
        type: "Eatery",
        distanceKm: 7.1,
        timeEstimate: "0:16",
        remarks: "Good ambiance & food. Usually closes by 19:30 hrs.",
        coordinates: { lat: 25.5312, lng: 91.8595 }
      },
      {
        id: "don-bosco",
        name: "Donbosco Museum",
        type: "Tourist Spot",
        distanceKm: 4.5,
        timeEstimate: "0:15",
        remarks: "Go via Mawlai Point. Must visit to learn about indigenous culture of North East. Sun closed.",
        coordinates: { lat: 25.5975, lng: 91.8842 }
      },
      {
        id: "ahavah-shillong-spot",
        name: "Ahavah",
        type: "Eatery",
        distanceKm: 3.1,
        timeEstimate: "0:12",
        remarks: "Upscale Continental & Mediterranean fine dining inside beautiful wooden conservatory styling.",
        coordinates: { lat: 25.5714, lng: 91.8998 }
      },
      {
        id: "nonna-mei-spot",
        name: "Nonna Mei",
        type: "Eatery",
        distanceKm: 2.8,
        timeEstimate: "0:14",
        remarks: "Premium artisanal Italian fusion using local Khasi organic ingredients.",
        coordinates: { lat: 25.5701, lng: 91.8962 }
      },
      {
        id: "the-feast-house-spot",
        name: "The Feast House",
        type: "Eatery",
        distanceKm: 1.8,
        timeEstimate: "0:08",
        remarks: "Cozy musical cabin setting, renowned for hearty sizzling plates and Khasi pork preparations.",
        coordinates: { lat: 25.5790, lng: 91.8845 }
      },
      {
        id: "the-yeastern-civilisation-spot",
        name: "The Yeastern Civilisation",
        type: "Eatery",
        distanceKm: 2.9,
        timeEstimate: "0:11",
        remarks: "Vibrant gastropub in Laitumkhrah. Outstanding cocktails, musical evenings, and great pub food.",
        coordinates: { lat: 25.5710, lng: 91.8975 }
      },
      {
        id: "shillong-peak-spot",
        name: "Shillong Peak",
        type: "Tourist Spot",
        distanceKm: 9.6,
        timeEstimate: "0:24",
        remarks: "Inside Air Force Station, carry I-Card.",
        coordinates: { lat: 25.5342, lng: 91.8685 }
      },
      {
        id: "rhododendron-trek",
        name: "Rhododendron Trek",
        type: "Trek",
        distanceKm: 2.4,
        timeEstimate: "0:06",
        remarks: "It is a 6.5 km trek, easy climb and marked by red arrow mark along the route. Starts about 1 km ahead of HQ 101 Area Gate and ends at a point enroute to Shillong Peak. Rhododendron bloom in March. Scenic and good for photography. Need to cater for move of your ride to finish point.",
        coordinates: { lat: 25.5450, lng: 91.8750 }
      }
    ]
  },
  {
    id: "cherrapunji",
    name: "Cherrapunji Route",
    pages: "05-10",
    centroid: { lat: 25.2793, lng: 91.7259 },
    locations: [
      {
        id: "airforce-museum",
        name: "Airforce Museum",
        type: "Tourist Spot",
        distanceKm: 8.7,
        timeEstimate: "0:25",
        remarks: "Small museum, will impress civilian guests.",
        coordinates: { lat: 25.5185, lng: 91.8530 }
      },
      {
        id: "elephant-falls",
        name: "Elephant Falls",
        type: "Tourist Spot",
        distanceKm: 9.1,
        timeEstimate: "0:26",
        remarks: "A very small waterfall closer to the city.",
        coordinates: { lat: 25.5391, lng: 91.8242 }
      },
      {
        id: "woodstock-farmhouse",
        name: "Woodstock Farmhouse",
        type: "Eatery",
        distanceKm: 10,
        timeEstimate: "0:25",
        remarks: "Nice ambiance and food.",
        coordinates: { lat: 25.5298, lng: 91.8395 }
      },
      {
        id: "bulls-trek",
        name: "Bulls Trek Wahniangleng",
        type: "Trek",
        distanceKm: 24,
        timeEstimate: "0:51",
        remarks: "Involves trekking 45-50 min downhill from car park (1.75 km or 300 m down hill) and return climb of approx 1 hr plus. Do not follow google. Non swimmers avoid entering water.",
        coordinates: { lat: 25.4312, lng: 91.8250 }
      },
      {
        id: "tall-timbers-spot",
        name: "Tall Timbers at Black Bridge Resort",
        type: "Eatery",
        distanceKm: 25,
        timeEstimate: "0:53",
        remarks: "Breathtaking rural resort restaurant in Kyrdemkhla. Offers majestic wilderness views, exceptional cocktails, and outdoor campfire evenings.",
        coordinates: { lat: 25.2938, lng: 91.7584 }
      },
      {
        id: "cafe-cherrapunjee-spot",
        name: "Café Cherrapunjee",
        type: "Eatery",
        distanceKm: 27,
        timeEstimate: "0:55",
        remarks: "Good ambience and food. Opens around lunch time (13:30 hrs).",
        coordinates: { lat: 25.3212, lng: 91.7580 }
      },
      {
        id: "mawkdok-valley",
        name: "Mawkdok Dympep Valley View Pt",
        type: "Tourist Spot",
        distanceKm: 27,
        timeEstimate: "0:55",
        remarks: "Ziplining available.",
        coordinates: { lat: 25.3421, lng: 91.7392 }
      },
      {
        id: "cloud-country",
        name: "Cloud Country",
        type: "Eatery",
        distanceKm: 37,
        timeEstimate: "1:10",
        remarks: "Nice place with beautiful ambience. Pure Veg restaurant, tasty food & reasonably priced.",
        coordinates: { lat: 25.2912, lng: 91.7185 }
      },
      {
        id: "misty-hills",
        name: "Misty Hills Restaurant",
        type: "Eatery",
        distanceKm: 42,
        timeEstimate: "1:16",
        remarks: "Good economical food. During monsoons gets covered in clouds.",
        coordinates: { lat: 25.2815, lng: 91.7240 }
      },
      {
        id: "wah-kaba",
        name: "Wah Kaba Falls",
        type: "Picnic Spot",
        distanceKm: 43,
        timeEstimate: "1:10",
        remarks: "Involve walking down 300 mtr of steps.",
        coordinates: { lat: 25.3195, lng: 91.7452 }
      },
      {
        id: "arwah-caves",
        name: "Arwah Caves",
        type: "Tourist Spot",
        distanceKm: 49,
        timeEstimate: "1:43",
        remarks: "The pathway leading to caves is very scenic. Large cave, has a collection of fossils formed underwater.",
        coordinates: { lat: 25.2845, lng: 91.7185 }
      },
      {
        id: "seven-sister-view",
        name: "Seven Sister Falls View Point",
        type: "Tourist Spot",
        distanceKm: 53,
        timeEstimate: "1:43",
        remarks: "The view point should be visited only in monsoons.",
        coordinates: { lat: 25.2505, lng: 91.7548 }
      },
      {
        id: "polo-orchid-cherra",
        name: "Polo Orchid Cherrapunji",
        type: "Eatery",
        distanceKm: 54,
        timeEstimate: "1:43",
        remarks: "Good ambience and view of Seven Sister Falls. Food bit costly.",
        coordinates: { lat: 25.2520, lng: 91.7562 }
      },
      {
        id: "khoh-ramhah",
        name: "Khoh Ramhah Conical Rock",
        type: "Picnic Spot",
        distanceKm: 60,
        timeEstimate: "1:50",
        remarks: "Amazing view of Bangladesh, adequate space available for group picnic.",
        coordinates: { lat: 25.2162, lng: 91.7350 }
      },
      {
        id: "bangladesh-view",
        name: "Bangladesh View Point",
        type: "Tourist Spot",
        distanceKm: 61,
        timeEstimate: "1:51",
        remarks: "Good view of Bangladesh plains on a clear day (Sylhet).",
        coordinates: { lat: 25.2012, lng: 91.7341 }
      },
      {
        id: "kynrem-falls",
        name: "Kynrem Falls",
        type: "Tourist Spot",
        distanceKm: 66,
        timeEstimate: "2:05",
        remarks: "Amazing place to visit in monsoons. Car can reach the base of the fall.",
        coordinates: { lat: 25.1985, lng: 91.7285 }
      },
      {
        id: "rangkylliaw-bridge",
        name: "Rangkylliaw Suspension Bridge",
        type: "Picnic Spot",
        distanceKm: 37,
        timeEstimate: "1:20",
        remarks: "No tree cover, ideal in winters post lunch. The sun set pics are breathtaking.",
        coordinates: { lat: 25.3341, lng: 91.6850 }
      },
      {
        id: "kongthong-whistling",
        name: "Kongthong Village (Whistling Village)",
        type: "Picnic Spot",
        distanceKm: 60,
        timeEstimate: "2:30",
        remarks: "Try the smoked pork curry with sticky rice. Contact Rothell Khongsit (9856060347) to coordinate trip.",
        coordinates: { lat: 25.2652, lng: 91.7750 }
      },
      {
        id: "garden-of-caves",
        name: "Garden of Caves",
        type: "Tourist Spot",
        distanceKm: 46,
        timeEstimate: "1:25",
        remarks: "Visit only in monsoons, good photographic experience.",
        coordinates: { lat: 25.3525, lng: 91.7712 }
      },
      {
        id: "mawmluh-caves",
        name: "Mawmluh Caves",
        type: "Trek",
        distanceKm: 53,
        timeEstimate: "1:30",
        remarks: "Approx 4 km trek inside cave. Hire a guide with proper kit.",
        coordinates: { lat: 25.2521, lng: 91.6985 }
      },
      {
        id: "rainbow-falls",
        name: "Rainbow Falls",
        type: "Tourist Spot",
        distanceKm: 61,
        timeEstimate: "2:01",
        remarks: "Route via Double Decker Living Root Bridge. Cannot be done in one day, homestay advisable.",
        coordinates: { lat: 25.2152, lng: 91.6710 }
      },
      {
        id: "nohkalikai",
        name: "Nohkalikai Falls View Point",
        type: "Tourist Spot",
        distanceKm: 51,
        timeEstimate: "1:25",
        remarks: "Must visit, also known as the Cherrapunjee falls. Local handicrafts available.",
        coordinates: { lat: 25.2798, lng: 91.6885 }
      },
      {
        id: "jiva-resort-spot",
        name: "Jiva Resort",
        type: "Eatery",
        distanceKm: 53,
        timeEstimate: "1:25",
        remarks: "Good ambience and food. Restaurant opens around lunch time (13:00 hrs).",
        coordinates: { lat: 25.2650, lng: 91.7198 }
      },
      {
        id: "mawsmai-caves",
        name: "Mawsmai Caves",
        type: "Tourist Spot",
        distanceKm: 55,
        timeEstimate: "1:44",
        remarks: "Awesome caves, avoid if you are claustrophobic or have knee issues.",
        coordinates: { lat: 25.2285, lng: 91.7198 }
      },
      {
        id: "sohbar-bridge",
        name: "Sohbar Bridge",
        type: "Picnic Spot",
        distanceKm: 69,
        timeEstimate: "2:10",
        remarks: "Less popular version of Dawki. Visit during winters to see crystal clear water.",
        coordinates: { lat: 25.1872, lng: 91.7850 }
      },
      {
        id: "double-decker-bridge",
        name: "Double Decker Trek Living Root Bridge",
        type: "Trek",
        distanceKm: 61,
        timeEstimate: "2:01",
        remarks: "Difficult trek with approx 3500 stairs (approx 3 km). Bring water & ORS. Closed on Sundays.",
        coordinates: { lat: 25.2120, lng: 91.6660 }
      }
    ]
  },
  {
    id: "wei-sawdong",
    name: "Wei Sawdong Route",
    pages: "11-12",
    centroid: { lat: 25.2750, lng: 91.6850 },
    locations: [
      {
        id: "lyngksiar-fall",
        name: "Lyngksiar Fall",
        type: "Picnic Spot",
        distanceKm: 44,
        timeEstimate: "1:10",
        remarks: "Best visited during monsoon season. Adequate space for group picnics and swimming. Water deep.",
        coordinates: { lat: 25.2810, lng: 91.6650 }
      },
      {
        id: "janailar-falls",
        name: "Janailar Falls",
        type: "Picnic Spot",
        distanceKm: 46,
        timeEstimate: "1:20",
        remarks: "Has an open swimming pool but there is NO shallow end.",
        coordinates: { lat: 25.2780, lng: 91.6620 }
      },
      {
        id: "prut-fall",
        name: "Prut Fall",
        type: "Tourist Spot",
        distanceKm: 48,
        timeEstimate: "1:25",
        remarks: "Best time in monsoon season.",
        coordinates: { lat: 25.2800, lng: 91.6780 }
      },
      {
        id: "mawsawa-falls",
        name: "Mawsawa Falls",
        type: "Picnic Spot",
        distanceKm: 47,
        timeEstimate: "1:30",
        remarks: "Good fall from photography point of view. About 200 mtr of easy trek.",
        coordinates: { lat: 25.2860, lng: 91.6640 }
      },
      {
        id: "wei-sawdong-falls",
        name: "Wei Sawdong Falls",
        type: "Picnic Spot",
        distanceKm: 50,
        timeEstimate: "1:41",
        remarks: "Must see fall, route to fall very adventurous. Note: wooden ladder damaged, take caution.",
        coordinates: { lat: 25.2752, lng: 91.6835 }
      },
      {
        id: "dainthlen-falls",
        name: "Dainthlen Falls",
        type: "Picnic Spot",
        distanceKm: 50,
        timeEstimate: "1:41",
        remarks: "Can go up to the mouth of the fall.",
        coordinates: { lat: 25.2785, lng: 91.6812 }
      }
    ]
  },
  {
    id: "dawki",
    name: "Dawki Route",
    pages: "13-15",
    centroid: { lat: 25.1812, lng: 92.0195 },
    locations: [
      {
        id: "mawjngih-viewpoint",
        name: "Mawjngih Lapynshongdor View Point",
        type: "Tourist Spot",
        distanceKm: 34,
        timeEstimate: "1:00",
        remarks: "Good valley view. You can have hot maggi there.",
        coordinates: { lat: 25.3125, lng: 91.9560 }
      },
      {
        id: "ka-bri-war",
        name: "Ka Bri War Resort",
        type: "Eatery",
        distanceKm: 57,
        timeEstimate: "1:53",
        remarks: "Only decent eatery enroute to Dawki. Separate veg & non-veg. Usually very crowded.",
        coordinates: { lat: 25.2250, lng: 91.9980 }
      },
      {
        id: "byrdaw-falls",
        name: "Byrdaw Falls",
        type: "Picnic Spot",
        distanceKm: 66,
        timeEstimate: "2:06",
        remarks: "Good waterfall, difficult walk, gets sultry & humid. Falls over two rock overhangs.",
        coordinates: { lat: 25.2110, lng: 92.0080 }
      },
      {
        id: "dawki-boat",
        name: "Dawki Boat Services",
        type: "Tourist Spot",
        distanceKm: 76,
        timeEstimate: "2:38",
        remarks: "Bit crowded. Open border with Bangladesh. Best time to see clear water is winter season.",
        coordinates: { lat: 25.1815, lng: 92.0198 }
      },
      {
        id: "riwai-living-root",
        name: "Living Root Bridge Riwai Village",
        type: "Picnic Spot",
        distanceKm: 72,
        timeEstimate: "2:36",
        remarks: "Use correct name when asking. As per latest inputs, closed on Sundays.",
        coordinates: { lat: 25.2012, lng: 91.9810 }
      },
      {
        id: "balancing-rock",
        name: "Balancing Rock",
        type: "Tourist Spot",
        distanceKm: 73,
        timeEstimate: "2:28",
        remarks: "Close to clean Mawlynnong village.",
        coordinates: { lat: 25.1990, lng: 91.9780 }
      },
      {
        id: "mawlynnong-village",
        name: "Mawlynnong Cleanest Village",
        type: "Tourist Spot",
        distanceKm: 74,
        timeEstimate: "2:32",
        remarks: "Must try bamboo machhan for a view of Bangladesh plains.",
        coordinates: { lat: 25.1985, lng: 91.9760 }
      },
      {
        id: "bamboo-trail",
        name: "Bamboo Trail",
        type: "Trek",
        distanceKm: 44,
        timeEstimate: "1:20",
        remarks: "Very adventurous trek, bit scary & tiring. Takes approx 2 hours one way. Carry water.",
        coordinates: { lat: 25.2150, lng: 91.9830 }
      },
      {
        id: "borhill-fall",
        name: "Borhill Fall",
        type: "Tourist Spot",
        distanceKm: 78,
        timeEstimate: "2:39",
        remarks: "On the alternative route back/to Dawki.",
        coordinates: { lat: 25.1840, lng: 92.0310 }
      }
    ]
  },
  {
    id: "laitlum",
    name: "Laitlum Route",
    pages: "16-18",
    centroid: { lat: 25.4410, lng: 91.9562 },
    locations: [
      {
        id: "daphiba-cafe-spot",
        name: "Daphiba Café",
        type: "Eatery",
        distanceKm: 19,
        timeEstimate: "0:50",
        remarks: "On top of a ledge, giving awesome view of valley. Good ambiance & reasonably priced.",
        coordinates: { lat: 25.4650, lng: 91.9480 }
      },
      {
        id: "laitlum-canyon-spot",
        name: "Laitlum Canyon",
        type: "Picnic Spot",
        distanceKm: 23,
        timeEstimate: "1:00",
        remarks: "Beautiful meadow, valley view and sunset must see. Local rice beer can be tasted. Closed on Sundays.",
        coordinates: { lat: 25.4412, lng: 91.9565 }
      },
      {
        id: "nongjrong-viewpoint",
        name: "Nongjrong View Point",
        type: "Picnic Spot",
        distanceKm: 49,
        timeEstimate: "2:00",
        remarks: "Visit only in Nov-Feb to see gorgeous sunrise above sea of clouds. Closed on Sundays.",
        coordinates: { lat: 25.4210, lng: 92.0520 }
      },
      {
        id: "pdem-falls",
        name: "Pdem Falls",
        type: "Tourist Spot",
        distanceKm: 55,
        timeEstimate: "2:16",
        remarks: "On the road to Wahrashi. Easy trek with mesmerizing landscape. Best in monsoons.",
        coordinates: { lat: 25.4120, lng: 92.0150 }
      },
      {
        id: "wahrashi-falls",
        name: "Wahrashi Falls",
        type: "Picnic Spot",
        distanceKm: 64,
        timeEstimate: "2:23",
        remarks: "Three-tiered waterfall. Feeling of English countryside. Bring food/change of clothes.",
        coordinates: { lat: 25.3850, lng: 92.1120 }
      },
      {
        id: "mawryngkneng-hills",
        name: "Mawryngkneng Hills",
        type: "Picnic Spot",
        distanceKm: 38,
        timeEstimate: "1:10",
        remarks: "Meghalaya's secret rolling highlands — open meadows at elevation with sweeping valley views and almost no tourists. Pine villages and rhododendron forests. Best in March–May.",
        coordinates: { lat: 25.5120, lng: 91.9570 }
      }
    ]
  },
  {
    id: "jowai",
    name: "Jowai Route",
    pages: "19-22",
    centroid: { lat: 25.4485, lng: 92.1980 },
    locations: [
      {
        id: "hotel-highwinds-lakeside",
        name: "Hotel Highwinds Lakeside",
        type: "Eatery",
        distanceKm: 55,
        timeEstimate: "1:28",
        remarks: "Good lakeside restaurant, tasty and cheap food.",
        coordinates: { lat: 25.4450, lng: 92.2010 }
      },
      {
        id: "tyrshi-falls",
        name: "Tyrshi Falls",
        type: "Tourist Spot",
        distanceKm: 58,
        timeEstimate: "1:43",
        remarks: "Recommended to be seen in monsoons only.",
        coordinates: { lat: 25.4590, lng: 92.1750 }
      },
      {
        id: "the-loomkyntoor-resort",
        name: "The Loomkyntoor Resort",
        type: "Picnic Spot",
        distanceKm: 74,
        timeEstimate: "2:24",
        remarks: "Night stay at cottages recommended. Swim in the deep pools is a must.",
        coordinates: { lat: 25.4120, lng: 92.2210 }
      },
      {
        id: "phe-phe-falls",
        name: "Phe Phe Falls",
        type: "Picnic Spot",
        distanceKm: 78,
        timeEstimate: "2:23",
        remarks: "Amazing falls with pristine blue water. Involves 20 mins of trek from road.",
        coordinates: { lat: 25.4050, lng: 92.2420 }
      },
      {
        id: "krang-shuri",
        name: "Krang Shuri Falls",
        type: "Picnic Spot",
        distanceKm: 86,
        timeEstimate: "2:24",
        remarks: "Beautiful pool, boating, ziplining & swimming. Life jacket mandatory.",
        coordinates: { lat: 25.3425, lng: 92.2590 }
      },
      {
        id: "shnongpdeng",
        name: "Shnongpdeng Village",
        type: "Picnic Spot",
        distanceKm: 84,
        timeEstimate: "3:00",
        remarks: "Clear water paradise. Camps/Resorts available. Highly recommended.",
        coordinates: { lat: 25.1950, lng: 92.0190 }
      },
      {
        id: "nartiang-monoliths",
        name: "Monolith Garden Nartiang",
        type: "Tourist Spot",
        distanceKm: 61,
        timeEstimate: "1:51",
        remarks: "Ancient monolithic structures, historic heritage of the Jaintia kings.",
        coordinates: { lat: 25.5710, lng: 92.2150 }
      },
      {
        id: "nartiang-durga",
        name: "Shri Nartiang Durga Temple",
        type: "Tourist Spot",
        distanceKm: 61,
        timeEstimate: "1:51",
        remarks: "One of the 51 Shaktipeeths of Hindu faith. Peaceful vibes.",
        coordinates: { lat: 25.5725, lng: 92.2162 }
      },
      {
        id: "amkoi-sliang",
        name: "Amkoi Sliang Wah Umngot",
        type: "Trek",
        distanceKm: 107,
        timeEstimate: "3:30",
        remarks: "Challenging trek with 1000 ft descend. Hire a local guide (approx ₹500).",
        coordinates: { lat: 25.2310, lng: 92.1120 }
      },
      {
        id: "noh-kawang",
        name: "Noh Kawang Falls",
        type: "Tourist Spot",
        distanceKm: 109,
        timeEstimate: "3:19",
        remarks: "Mesmerizing waterfalls. Bad road condition beyond Amlaren, avoid in heavy rains.",
        coordinates: { lat: 25.2650, lng: 92.1520 }
      },
      {
        id: "thadlaskein-lake",
        name: "Thadlaskein Lake",
        type: "Tourist Spot",
        distanceKm: 61,
        timeEstimate: "1:51",
        remarks: "Sacred Jaintia lake surrounded by gentle hills. Community performs traditional rituals here. Serene, melancholy beauty — particularly in mist. Good forest walk around perimeter.",
        coordinates: { lat: 25.4459, lng: 92.2011 }
      }
    ]
  },
  {
    id: "silchar",
    name: "Silchar Route",
    pages: "23-26",
    centroid: { lat: 25.2750, lng: 92.3550 },
    locations: [
      {
        id: "moopun-falls",
        name: "Moopun Falls",
        type: "Picnic Spot",
        distanceKm: 88,
        timeEstimate: "2:20",
        remarks: "Beautiful picnic spot with small sandy beach. On the road to Silchar.",
        coordinates: { lat: 25.2750, lng: 92.3550 }
      },
      {
        id: "umbyein-falls",
        name: "Umbyein Falls",
        type: "Picnic Spot",
        distanceKm: 92,
        timeEstimate: "2:30",
        remarks: "4-5 km ahead of Moopun Falls. Windows-wallpaper like views. Deep waters.",
        coordinates: { lat: 25.2610, lng: 92.3680 }
      },
      {
        id: "krem-chympe",
        name: "Krem Chympe (Brishirnot)",
        type: "Trek",
        distanceKm: 131,
        timeEstimate: "3:30",
        remarks: "Thrilling and dangerous cave trek. Hidden behind boulders, requires swimming and guide.",
        coordinates: { lat: 25.2210, lng: 92.4120 }
      },
      {
        id: "khaddum-falls",
        name: "Khaddum Pieltleng Falls (Brishirnot)",
        type: "Trek",
        distanceKm: 131,
        timeEstimate: "3:30",
        remarks: "Commences from Brishirnot. Monsoon trek of 12.6 km. No eateries enroute, carry snacks.",
        coordinates: { lat: 25.2150, lng: 92.4250 }
      }
    ]
  },
  {
    id: "maysynram",
    name: "Mawsynram Route",
    pages: "27-29",
    centroid: { lat: 25.3120, lng: 91.5830 },
    locations: [
      {
        id: "molis-fall",
        name: "Molis Fall",
        type: "Tourist Spot",
        distanceKm: 51,
        timeEstimate: "2:00",
        remarks: "Water is located next to road to Split Rock Trail. Good photography spot.",
        coordinates: { lat: 25.3190, lng: 91.5680 }
      },
      {
        id: "mawjymbuin-caves",
        name: "Mawjymbuin Caves",
        type: "Tourist Spot",
        distanceKm: 56,
        timeEstimate: "2:10",
        remarks: "Cave with naturally formed stone Shiv Linga. Deep, bring a high-beam flashlight.",
        coordinates: { lat: 25.3090, lng: 91.5810 }
      },
      {
        id: "maysynram-spot",
        name: "Mawsynram",
        type: "Tourist Spot",
        distanceKm: 57,
        timeEstimate: "2:15",
        remarks: "Wettest place on Earth. Can be clubbed with Split Rock trails.",
        coordinates: { lat: 25.3121, lng: 91.5832 }
      },
      {
        id: "umkhakoi-water-park",
        name: "Umkhakoi Water Park",
        type: "Picnic Spot",
        distanceKm: 73,
        timeEstimate: "2:43",
        remarks: "Kayaking & swimming permitted, very family friendly picnic spot.",
        coordinates: { lat: 25.3150, lng: 91.5450 }
      },
      {
        id: "split-rock",
        name: "Split Rock Trail",
        type: "Picnic Spot",
        distanceKm: 76,
        timeEstimate: "2:42",
        remarks: "500-600 mtr trek inside a giant cracked rock crevasse. Adventurous and tight.",
        coordinates: { lat: 25.3210, lng: 91.5390 }
      },
      {
        id: "sacred-forest",
        name: "Sacred Forest (Mawphlang)",
        type: "Picnic Spot",
        distanceKm: 23,
        timeEstimate: "0:45",
        remarks: "Must hire a local guide to explain Khasi clans history. Do not remove anything from forest.",
        coordinates: { lat: 25.4485, lng: 91.7350 }
      },
      {
        id: "ranikor",
        name: "Ranikor River Beach",
        type: "Picnic Spot",
        distanceKm: 117,
        timeEstimate: "4:10",
        remarks: "Beautiful, untouched pristine beach. Download offline maps first.",
        coordinates: { lat: 25.2150, lng: 91.2420 }
      },
      {
        id: "david-scott",
        name: "David Scott Trail",
        type: "Trek",
        distanceKm: 22,
        timeEstimate: "0:46",
        remarks: "13.5 km long historic trek, taking 4-6 hours. Best in winters.",
        coordinates: { lat: 25.4210, lng: 91.7420 }
      }
    ]
  },
  {
    id: "nongstoin",
    name: "Nongstoin Route",
    pages: "30-31",
    centroid: { lat: 25.5215, lng: 91.2690 },
    locations: [
      {
        id: "hudoi-falls",
        name: "Khudoi Falls",
        type: "Picnic Spot",
        distanceKm: 52,
        timeEstimate: "1:25",
        remarks: "Google maps inaccurate. Ask locals after entering Mirang village.",
        coordinates: { lat: 25.5610, lng: 91.4120 }
      },
      {
        id: "kyllang-rock",
        name: "Kyllang Rock",
        type: "Tourist Spot",
        distanceKm: 54,
        timeEstimate: "1:41",
        remarks: "Massive towering granite rock. Mesmerizing climb of 25 mins to summit.",
        coordinates: { lat: 25.5750, lng: 91.5450 }
      },
      {
        id: "dommurok-view",
        name: "Dommurok View Point (Markhan Valley)",
        type: "Picnic Spot",
        distanceKm: 59,
        timeEstimate: "1:45",
        remarks: "Muddy road for last 8 km. Avoid in monsoons. Post-monsoon is perfect.",
        coordinates: { lat: 25.4520, lng: 91.3120 }
      },
      {
        id: "mawphanlur-spot",
        name: "Mawphanlur",
        type: "Picnic Spot",
        distanceKm: 67,
        timeEstimate: "1:44",
        remarks: "Quiet rolling hills with multiple small lakes. Perfect group picnic setup.",
        coordinates: { lat: 25.5410, lng: 91.4820 }
      },
      {
        id: "dzuko-valley-meghalaya",
        name: "Meghalaya's Dzuko Valley",
        type: "Tourist Spot",
        distanceKm: 76,
        timeEstimate: "1:46",
        remarks: "Adjacent to highway, highly scenic photo spot.",
        coordinates: { lat: 25.5120, lng: 91.1250 }
      },
      {
        id: "wei-weinia",
        name: "Wei Weinia Falls",
        type: "Picnic Spot",
        distanceKm: 102,
        timeEstimate: "2:40",
        remarks: "Very scenic drive. No walking required to view the waterfalls.",
        coordinates: { lat: 25.5015, lng: 91.2590 }
      }
    ]
  },
  {
    id: "tura",
    name: "Tura Route",
    pages: "32-35",
    centroid: { lat: 25.3510, lng: 90.6850 },
    locations: [
      {
        id: "nasep-chiring",
        name: "Nasep Chiring Natural Pool",
        type: "Picnic Spot",
        distanceKm: 234,
        timeEstimate: "6:00",
        remarks: "Bottomless water in an old mine shaft. Adventurous 10 minute trek. Guide mandatory.",
        coordinates: { lat: 25.2815, lng: 90.5890 }
      },
      {
        id: "rongchang-rock",
        name: "Rongchang Rock Formation Ram Sangma",
        type: "Tourist Spot",
        distanceKm: 253,
        timeEstimate: "6:40",
        remarks: "Sharp-edged rock towers. Beware of snakes. Best accompanied by local guide.",
        coordinates: { lat: 25.3150, lng: 90.6410 }
      },
      {
        id: "siju-caves",
        name: "Siju Caves",
        type: "Tourist Spot",
        distanceKm: 254,
        timeEstimate: "6:55",
        remarks: "Bat cave of Meghalaya. Must wade through water inside, carry slippers and torch.",
        coordinates: { lat: 25.3510, lng: 90.6850 }
      },
      {
        id: "siju-lodge",
        name: "Siju Tourist Lodge",
        type: "Misc",
        distanceKm: 254,
        timeEstimate: "6:55",
        remarks: "Erratic power, simple food. Spot elusive nocturnal Flying Squirrels here.",
        coordinates: { lat: 25.3525, lng: 90.6865 }
      },
      {
        id: "jadesil-fish",
        name: "Jadesil Fish Sanctuary",
        type: "Tourist Spot",
        distanceKm: 255,
        timeEstimate: "8:30",
        remarks: "Feed chocolate-colored mahseer fish from Tolegre village.",
        coordinates: { lat: 25.3120, lng: 90.7120 }
      },
      {
        id: "wari-chora",
        name: "Wari Chora",
        type: "Picnic Spot",
        distanceKm: 270,
        timeEstimate: "7:35",
        remarks: "Meghalaya's mystical canyon. Requires 4x4 and guide. Fairyland feeling.",
        coordinates: { lat: 25.2150, lng: 90.5310 }
      }
    ]
  },
  {
    id: "umiam",
    name: "Umiam Route",
    pages: "36-38",
    centroid: { lat: 25.6812, lng: 91.8912 },
    locations: [
      {
        id: "eastern-command",
        name: "Eastern Command Water Sports Node",
        type: "Picnic Spot",
        distanceKm: 16,
        timeEstimate: "0:31",
        remarks: "Boating & South Indian food available (inform in advance).",
        coordinates: { lat: 25.6790, lng: 91.8920 }
      },
      {
        id: "orchid-lake",
        name: "Orchid Lake Resort",
        type: "Eatery",
        distanceKm: 16,
        timeEstimate: "0:36",
        remarks: "Good lakeside ambience and food options.",
        coordinates: { lat: 25.6810, lng: 91.8890 }
      },
      {
        id: "umiam-lake-spot",
        name: "Umiam Lake",
        type: "Picnic Spot",
        distanceKm: 16,
        timeEstimate: "0:35",
        remarks: "Entry closed post 17:00 hrs. Very crowded on working days.",
        coordinates: { lat: 25.6710, lng: 91.8950 }
      },
      {
        id: "bahut-chota-pani",
        name: "Bahut Chota Pani",
        type: "Picnic Spot",
        distanceKm: 21,
        timeEstimate: "0:55",
        remarks: "Inside Umroi Cantt. Small lake. Great Sunday mock brunch.",
        coordinates: { lat: 25.7120, lng: 91.9560 }
      },
      {
        id: "ri-kynjai",
        name: "Ri Kynjai Resort",
        type: "Eatery",
        distanceKm: 22,
        timeEstimate: "0:55",
        remarks: "Premium luxury resort, visitors only allowed after advance booking.",
        coordinates: { lat: 25.6610, lng: 91.8790 }
      },
      {
        id: "lake-paradise",
        name: "Lake Paradise Camping Ground",
        type: "Picnic Spot",
        distanceKm: 44,
        timeEstimate: "1:48",
        remarks: "Take boat to campsites. Gets warm/humid. Order food in advance.",
        coordinates: { lat: 25.7610, lng: 91.8650 }
      }
    ]
  },
  {
    id: "guwahati",
    name: "Guwahati Route",
    pages: "39-40",
    centroid: { lat: 26.1150, lng: 91.7350 },
    locations: [
      {
        id: "excelencia",
        name: "Excelencia Restaurant",
        type: "Eatery",
        distanceKm: 48,
        timeEstimate: "1:21",
        remarks: "Enroute to Guwahati. Good food and fine roadside ambiance.",
        coordinates: { lat: 25.9810, lng: 91.8120 }
      },
      {
        id: "jiva-veg-spot",
        name: "Jiva Veg",
        type: "Eatery",
        distanceKm: 53,
        timeEstimate: "1:18",
        remarks: "Excellent pure veg highway restaurant enroute to Guwahati.",
        coordinates: { lat: 25.9520, lng: 91.8250 }
      },
      {
        id: "alfresco-cruise",
        name: "Alfresco Grand Cruise",
        type: "Picnic Spot",
        distanceKm: 99,
        timeEstimate: "2:52",
        remarks: "Offers Brahmaputra sunset cruise & dinner cruise. Standard upper deck seats.",
        coordinates: { lat: 26.1850, lng: 91.7450 }
      },
      {
        id: "pobitora",
        name: "Pobitora Wildlife Sanctuary",
        type: "Tourist Spot",
        distanceKm: 117,
        timeEstimate: "3:17",
        remarks: "High density of Rhinos compared to Kaziranga. Early elephant/jeep safaris.",
        coordinates: { lat: 26.2410, lng: 92.0520 }
      },
      {
        id: "kamakhya-temple",
        name: "Sri Kamakhya Temple",
        type: "Tourist Spot",
        distanceKm: 103,
        timeEstimate: "3:00",
        remarks: "Ancient temple on Nilachal hill. Expect up to 4 hours wait time for general darshan.",
        coordinates: { lat: 26.1664, lng: 91.7056 }
      }
    ]
  }
];
