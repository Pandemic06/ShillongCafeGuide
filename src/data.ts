import { Cafe, NeighborhoodInfo, GuideArticle, FoodDish, Review } from "./types";

export const CAFES: Cafe[] = [
  {
    id: "rynsan-cafe",
    name: "Rynsan",
    tagline: "The Hearth Stage of the Hills",
    theme: "Traditional Slate Elements & Live Ka Duitara Chords",
    introduction: "Sleek and tucked away at Newlands Compound, Rynsan is a celebratory platform in the Khasi language where indigenous culinary arts and acoustic melodies tell a unique story. With stunning timber accents, rustic stone walls, and wide glass doors opening to a peaceful garden, Rynsan brings the fresh, organic ingredients of Meghalaya's pristine hills straight to your table.",
    whyVisit: "To experience traditional live acoustic music, featuring local artists playing the Ka Duitara string instrument while eating beautifully curated Khasi-style hearth dishes.",
    hours: "Lunch: 2:00 PM — 4:00 PM | Dinner: 6:00 PM — 10:00 PM",
    address: "Newlands Compound, Boyce Road, Near Shillong College, Laitumkhrah, Shillong 793003",
    neighborhood: "Boyce Road",
    images: {
      hero: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=800",
      interior: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1200"
    },
    quote: "In the silence between sips, the forest speaks.",
    quoteAuthor: "Rynsan Staff",
    vibeTags: ["Minimalist", "Silent Policy", "Book Heaven", "Light Wood", "Pine Canopy"],
    hasLiveMusic: true,
    mustTry: [
      {
        name: "Dohneiiong Black Sesame Plate",
        description: "Slow-cooked pork belly coated in earthy, hand-roasted field black sesame seeds, organic ginger, and wild herbs.",
        price: "₹280",
        image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=600"
      },
      {
        name: "Traditional Smoked Pork Slices",
        description: "Crispy wood-smoked pork slices served dry with local wild berry sauce and green microgreens.",
        price: "₹260",
        image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=600"
      }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1502472545319-977b1a4a9f1f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=800"
    ],
    coordinates: { lat: 25.5668, lng: 91.8962 }
  },
  {
    id: "ahavah-cafe",
    name: "Ahavah Fine Dining & Services",
    tagline: "Elegant Chandeliers, Velvet Comforts & Warm Hearth Bakes",
    theme: "Glittering Chandelier Banquets & Romantic Candle Dinners",
    introduction: "Ahavah Fine Dining brings a touch of supreme alpine hospitality and luxury dining to Shillong. Warmed by a roaring log fireplace and illuminated by towering crystal chandeliers, this elegant retreat boasts plush velvet chairs, clover tablecloths, and a glass-enclosed pastry collection. Known for spectacular banquet services, custom wedding cakes, and romantic candlelit seating, it is a haven of luxury.",
    whyVisit: "To indulge in a luxury candlelight dinner wrapped in wool throws under glowing chandeliers, followed by their legendary freshly baked pastries and cakes.",
    hours: "11:30 AM — 9:30 PM (Daily)",
    address: "Upland Road, Nongkynrih, Laitumkhrah, Shillong 793003",
    neighborhood: "Nongkynrih",
    images: {
      hero: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800",
      interior: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1200"
    },
    quote: "We gather under mountains, we part as family.",
    quoteAuthor: "Ahavah Founder",
    vibeTags: ["Valley View", "Hearth Fire", "Outdoor Deck", "Cozy Blankets", "Acoustic Soul"],
    hasLiveMusic: true,
    mustTry: [
      {
        name: "Shrimp & Fresh Herb Spaghetti",
        description: "Hand-tossed pasta cooked in white wine reduction, regional bay leaves, fresh garlic prawns, and local mountain greens.",
        price: "₹320",
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600"
      },
      {
        name: "Naked Rosewater Wedding Sponge",
        description: "A dense, floral rosewater cake layered with soft, fresh-whipped cream and fresh field peach compote.",
        price: "₹180",
        image: "https://images.unsplash.com/photo-1535124400015-725530413da6?auto=format&fit=crop&q=80&w=600"
      }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1535124400015-725530413da6?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&q=80&w=800"
    ],
    coordinates: { lat: 25.5684, lng: 91.8987 }
  },
  {
    id: "cherry-bean-cafe",
    name: "Cherry Bean Cafe",
    tagline: "Wooden Cabin Wood & Specialty Brewing",
    theme: "Warm Cabin Loft, Green Plants & Artisan Roasts",
    introduction: "Tucked in the peaceful lanes of Kench's Trace, Cherry Bean is an iconic wooden coffee sanctuary. Under double-height timber ceilings, beautiful warm lightbulbs glow over rows of books, vertical plant displays, and artisan brewing apparatus. Famous for sourcing local high-altitude organic arabica beans, they roast and hand-brew exceptional coffees paired with fresh-made pizzas and decadent pastries.",
    whyVisit: "To study, chat, or read in a warm, garden-filled wooden loft with a masterful single-estate espresso and freshly-kneaded sourdough pizza.",
    hours: "10:30 AM — 8:30 PM (Daily)",
    address: "Kench's Trace, Shillong 793004 (Opposite Pinewood)",
    neighborhood: "Kench's Trace",
    images: {
      hero: "https://images.unsplash.com/photo-154118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=800",
      interior: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=1200"
    },
    quote: "From blossom to bean, nurtured by the mountain soil.",
    quoteAuthor: "Liza, Head Roaster",
    vibeTags: ["Wood Cabin", "Loft Seating", "Warm Lighting", "Private Estate", "High Ceilings"],
    hasLiveMusic: false,
    mustTry: [
      {
        name: "Warm Artisan Sourdough Pizza",
        description: "Hand-kneaded sourdough crust topped with rich tomato sauce, fresh buffalo mozzarella, and mountain wild oregano.",
        price: "₹290",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600"
      },
      {
        name: "Double Chocolate Nut Cookie",
        description: "Big, soft-baked molten chocolate chip cookies stuffed with roasted hazelnut crumbs, matching dark espresso perfectly.",
        price: "₹120",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=600"
      }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=800"
    ],
    coordinates: { lat: 25.5630, lng: 91.8824 }
  },
  {
    id: "cafe-shillong",
    name: "Cafe Shillong",
    tagline: "The Heritage of the Hillside",
    theme: "Jazz and Coffee Traditions",
    introduction: "Since opening its doors in 2008, Cafe Shillong has stood as a guardian of the city's unique cultural syncretism: a space where the aroma of locally roasted Khasi Hills coffee beans blends seamlessly with vintage vinyl tracks spinning in the corner. Here, jazz is more than background music—it's the heartbeat of the room.",
    whyVisit: "To sit by the street-facing window during a sudden downpour, sipping a double espresso while listening to local artists cover classic jazz and blues under warm filament bulbs.",
    hours: "12:00 PM — 10:00 PM (Closed Thursdays)",
    address: "31 Laitumkhrah Main Road, Shillong 793003 (Opposite Beat Junction)",
    neighborhood: "Laitumkhrah",
    images: {
      hero: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
      interior: "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=1200"
    },
    quote: "Here, jazz isn't background music—it's the heartbeat of the Room.",
    quoteAuthor: "Iban, Founder",
    vibeTags: ["Legacy", "Cozy", "Jazz Beats", "Vintage Vinyl", "Rainy Window"],
    hasLiveMusic: true,
    mustTry: [
      {
        name: "Shillong Special Coffee",
        description: "Sourced from high-altitude organic plantations in the East Khasi Hills, medium-roasted, and brewed with crisp mountain spring water.",
        price: "₹180",
        image: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=600"
      },
      {
        name: "Smoked Pork Toast",
        description: "Crispy local sourdough toast topped slices of house-smoked Khasi pork belly, caramelized mountain onions, and wild mint leaves.",
        price: "₹260",
        image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=600"
      },
      {
        name: "Mountain Cardamom Infusion",
        description: "A delicate local black tea infused with hand-crushed wild cardamom pods and local orange blossom honey.",
        price: "₹140",
        image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600"
      }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&q=80&w=800"
    ],
    coordinates: { lat: 25.5714, lng: 91.8961 }
  },
  {
    id: "dylans-cafe",
    name: "Dylan's Cafe",
    tagline: "The Student Vanguard",
    theme: "Folk Rock Homage",
    introduction: "Named in homage to Bob Dylan, who enjoys a legendary cult status in Shillong and Northeast India. This split-level student haven is filled with guitar-shaped wood tables, hand-painted ceiling tiles left behind by creative patrons, and album covers spanning the 60s and 70s. It stands on a hillside, overlooking Laitumkhrah's misty pine slopes.",
    whyVisit: "Grab a cozy corner couch on a foggy afternoon, choose a hand-drawn mug, and let the vintage folk-rock acoustics carry you away.",
    hours: "11:00 AM — 9:00 PM (Daily)",
    address: "Dhankheti, Malki, Shillong 793001 (Near Malki Point)",
    neighborhood: "Dhankheti",
    images: {
      hero: "https://images.unsplash.com/photo-1487180142328-054b783fc471?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1485686531765-ba63b07845a7?auto=format&fit=crop&q=80&w=800"
    },
    quote: "Come in on a foggy afternoon, choose a warm mug, and let the 70s folk rock take you away.",
    quoteAuthor: "Staff Note",
    vibeTags: ["Student Haunt", "Bob Dylan", "Nostalgic Folk", "Creative Ceiling", "Mountain View"],
    hasLiveMusic: false,
    mustTry: [
      {
        name: "Blowin' in the Wind Cappuccino",
        description: "A dark double-ristretto with velvety micro-foam, dusted with organic cocoa powder in the shape of Dylan's signature acoustic guitar.",
        price: "₹160",
        image: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&q=80&w=600"
      },
      {
        name: "Old-School Hot Apple Pie",
        description: "Fresh local hill apples spiced with cinnamon, baked under a rich, golden butter pastry lattice and served with wild vanilla cream.",
        price: "₹190",
        image: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&q=80&w=600"
      }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1487180142328-054b783fc471?auto=format&fit=crop&q=80&w=800"
    ],
    coordinates: { lat: 25.5678, lng: 91.8902 }
  },
  {
    id: "ml-05-cafe",
    name: "ML 05 Cafe",
    tagline: "The Modern Pitstop on the Highway",
    theme: "Biker and Pine Forest Trails",
    introduction: "Branded with Shillong's regional registration prefix, ML 05, this striking glass-walled shelter lies nestled under tall, towering pines just off the highway. It combines dynamic, garage-inspired metal-working with the warm embrace of a rustic cozy log cabin, displaying vintage custom motorcycles hanging from the timber rafters.",
    whyVisit: "To experience an iconic highway stopover, enjoying dense pine air and hearing local riders share travel trails over firewood hearths.",
    hours: "10:30 AM — 8:30 PM (Daily)",
    address: "National Highway 40, Eastern Bypass, Shillong (Before Pine Forest Trails)",
    neighborhood: "Golf Links",
    images: {
      hero: "https://images.unsplash.com/photo-1545048702-79362596cdc9?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1459255418679-d6424da9ee33?auto=format&fit=crop&q=80&w=800"
    },
    quote: "True mountain vibes are found on the open roads and in the pine-scented breeze.",
    quoteAuthor: "Motorhead Diaries",
    vibeTags: ["Wood Cabin", "Glass Walls", "Highway Pitstop", "Rider Haven", "Pine Canopy"],
    hasLiveMusic: false,
    mustTry: [
      {
        name: "Highway French Press Coffee",
        description: "A bold, dark-roasted tribal blend direct from regional growers, pressed rich and robust to warm travelers from the dense morning fog.",
        price: "₹150",
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=600"
      },
      {
        name: "Wild Pepper Smoked Pork Fry",
        description: "Spicy pork belly wok-tossed with local black pepper, hand-harvested wild coriander, and mountain ghost chilly flakes.",
        price: "₹240",
        image: "https://images.unsplash.com/photo-1623961990059-28355e229a87?auto=format&fit=crop&q=80&w=600"
      }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=800"
    ],
    coordinates: { lat: 25.5921, lng: 91.9142 }
  },
  {
    id: "pine-loft",
    name: "The Pine Loft",
    tagline: "The Minimalist Sanctuary",
    theme: "Zen Light Wood and Reading Rails",
    introduction: "A beautiful, meditative cedarwood loft capturing filtered daylight. High cathedral glass ceilings and endless bookshelves line the walls, creating a serene, silent creative studio for writers, local illustrators, and remote workers looking for a quiet, focused headspace under the pines.",
    whyVisit: "To experience a deeply quiet, calm environment where the scratch of a pen or the trickle of rain is the only sound, surrounded by independent literature.",
    hours: "11:00 AM — 8:00 PM (Closed Mondays)",
    address: "Pine Tree Close, Golf Links Area, Shillong 793001",
    neighborhood: "Golf Links",
    images: {
      hero: "https://images.unsplash.com/photo-1521478413868-1bb348537586?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=800"
    },
    vibeTags: ["Minimalist", "Silent Policy", "Book Heaven", "Light Wood", "High Ceilings"],
    hasLiveMusic: false,
    mustTry: [
      {
        name: "Filtered White Honey Pour-Over",
        description: "A clean, paper-filtered light roast revealing delicate notes of white mountain jasmine and raw, regional wildflower honey.",
        price: "₹190",
        image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&q=80&w=600"
      }
    ],
    gallery: [
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=800"
    ],
    coordinates: { lat: 25.5891, lng: 91.9082 }
  },
  {
    id: "melody-beans",
    name: "Melody & Beans",
    tagline: "Classic Music Hub",
    theme: "Independent Jams & Warm Lattes",
    introduction: "Tucked inside the lively heart of Police Bazaar, this classic, high-vibe cafe is a canvas for local independent academic artists. Its brick-walls are adorned with signed guitars, and a cozy central stage hosts open mics, bringing regional storytellers together over steaming cups of hand-pressed espressos.",
    whyVisit: "To sit close to the stage, enjoying Shillong's celebrated acoustic scene with friendly, music-loving crowds.",
    hours: "12:00 PM — 9:00 PM (Daily)",
    address: "Acoustic Lane, Police Bazaar Circle, Shillong 793001",
    neighborhood: "Police Bazaar",
    images: {
      hero: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=800"
    },
    vibeTags: ["Live Stage", "Open Mic", "Brick Walls", "Bustling Center", "Acoustic Soul"],
    hasLiveMusic: true,
    mustTry: [
      {
        name: "Cinnamon Spiced Latte",
        description: "A smooth double shot of espresso steamed with local organic cinnamon sticks and nutmeg shavings, bringing festive mountain vibes to your table.",
        price: "₹170",
        image: "https://images.unsplash.com/photo-1570968915860-54d5c301fc9f?auto=format&fit=crop&q=80&w=600"
      }
    ],
    gallery: [],
    coordinates: { lat: 25.5784, lng: 91.8841 }
  },
  {
    id: "fern-mist-garden",
    name: "Fern & Mist Garden",
    tagline: "Botanical Greenhouse Retreat",
    theme: "Endemic Plants and Rain Pools",
    introduction: "Step inside a magical glass-domed greenhouse filled with vertical moss columns, native Khasi ferns, and slow-dripping slate waterfalls. It's a botanical temple combining local ecology with specialized cold brewing, letting you breathe pure, humid mountain forest air while escaping the chilly street winds.",
    whyVisit: "The tropical warmth, earthy scent of wet soil, trickling stream sounds, and visual comfort of hundreds of green ferns.",
    hours: "10:00 AM — 7:30 PM (Daily)",
    address: "Valley Walkway, Pine Forest Ridge, Shillong 793002",
    neighborhood: "Golf Links",
    images: {
      hero: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=1200",
      card: "https://images.unsplash.com/photo-1521193089946-7aa29d1fe73a?auto=format&fit=crop&q=80&w=800"
    },
    vibeTags: ["Greenhouse", "Botanical", "Trickling Streams", "Moss Walls", "Moist Serenity"],
    hasLiveMusic: false,
    mustTry: [
      {
        name: "Wild Mint Slow Cold Brew",
        description: "Espresso grounds cold-dripped for 14 hours over ice slabs, infused with crushed organic wild mint leaf syrup.",
        price: "₹200",
        image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&q=80&w=600"
      }
    ],
    gallery: [],
    coordinates: { lat: 25.5945, lng: 91.9214 }
  }
];

export const NEIGHBORHOODS: NeighborhoodInfo[] = [
  {
    id: "laitumkhrah",
    name: "Laitumkhrah",
    title: "The Student Heartbeat",
    description: "Built along high-altitude winding ridges, Laitumkhrah is the vibrant academic center of Shillong. Home to elite legacy schools and college hubs, its lively streets are lined with vinyl record shops, vintage clothing stalls, cozy cafes, and young local artists playing wooden guitars on the curbs during the blue hour.",
    image: "https://images.unsplash.com/photo-1583394293915-4c5d38e4c52f?auto=format&fit=crop&q=80&w=1200",
    vitals: {
      vibe: "Intelligent, student-centric, classic music hubs & vinyl lanes",
      bestTime: "Late afternoon to early dusk",
      accentUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=1200"
    },
    itinerary: {
      title: "The Perfect Laitumkhrah Afternoon Walk",
      description: "A slow, 1.5 km hillside route winding through historic schools, local viewpoints, and culminating in legendary musical cafés.",
      steps: [
        {
          time: "2:00 PM — The Beat Junction",
          title: "Starting Point",
          description: "Browse tiny local music stores containing local guitar recordings and unique cassettes."
        },
        {
          time: "3:00 PM — Cathedral of Mary Help of Christians",
          title: "Spiritual Interlude",
          description: "Stroll the sweeping Gothic paths, framing beautiful, misty views of the valleys below."
        },
        {
          time: "4:30 PM — The Upper Hills Slopes",
          title: "Hillside Wandering",
          description: "Walk past wood-framed British-era cottages with beautifully manicured mountain flower gardens."
        },
        {
          time: "6:00 PM — Heritage Tea at Cafe Shillong",
          title: "The Golden Hour Stop",
          description: "Relax by the wood paneling, enjoying a hot Mountain Brew while local singer-songwriters warm up."
        }
      ]
    }
  },
  {
    id: "police-bazaar",
    name: "Police Bazaar",
    title: "The Pulsing Capital Center",
    description: "The fast, sprawling marketplace heart of Shillong. Streets come alive with reflective neon pools in the rain, filled with local street foods, traditional shawls, wood carving stalls, and independent acoustic clubs tucked behind dark alleys.",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&q=80&w=1200",
    vitals: {
      vibe: "Energetic, bustling, traditional Khasi market lanes",
      bestTime: "Evening when neon lights reflect on wet streets",
      accentUrl: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?auto=format&fit=crop&q=80&w=1200"
    },
    itinerary: {
      title: "Neon Reflections Street Crawl",
      description: "A fun dive into busy intersections, local craft bazaars, and traditional Khasi food stalls.",
      steps: [
        {
          time: "5:00 PM — The Central Circle",
          title: "The Swarm",
          description: "Observe the energetic hub of Shillong traffic, finding quiet shortcuts through wooden shopping ranks."
        },
        {
          time: "6:00 PM — Bhaichung Khasi Stalls",
          title: "Traditional Appetizers",
          description: "Taste traditional Jadoh rice cooked rich with local spices in small, ancient brass pots."
        },
        {
          time: "7:30 PM — Melody & Beans Stage",
          title: "Warm Acoustic Ending",
          description: "Grab a high-top table, enjoying live independent cover bands playing classic acoustic soft rock."
        }
      ]
    }
  },
  {
    id: "golf-links",
    name: "Golf Links",
    title: "Misty Pined Slopes",
    description: "A landscape of rolling, deep green lawns surrounded by legacy pines. Golf Links is where Shillong comes to breathe—its quiet, misty slopes are perfect for morning joggers, artists sketching mossy branches, and seekers of quiet greenhouse sanctuaries.",
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=1200",
    vitals: {
      vibe: "Silent, misty, botanical greenhouse spaces & custom riders",
      bestTime: "Early dawn or misty midday rains",
      accentUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=1200"
    },
    itinerary: {
      title: "Pine-Scented Escape",
      description: "A scenic hike winding around lush lawns and hidden botanical sanctuaries under giant pine trees.",
      steps: [
        {
          time: "7:00 AM — Pine Ridge Walkway",
          title: "Mist Gathering",
          description: "Experience the sweeping, misty dew over empty emerald turf, under the protective shade of giant pine branches."
        },
        {
          time: "9:30 AM — Botanical Serenity",
          title: "Greenhouse Coffee",
          description: "Enter Fern & Mist Garden, drinking cold brew among humid endemic plants while rain taps the dome."
        },
        {
          time: "11:30 AM — Highway Run to ML 05",
          title: "Log Cabin Shelter",
          description: "Finish with a hearty Highway Press coffee and spicy pork stir-fry in a warm glass-timber hearth."
        }
      ]
    }
  }
];

export const DISHES: FoodDish[] = [
  {
    id: "jadoh",
    name: "Jadoh",
    philosophy: "The Staple of the Hearth",
    description: "The absolute crown jewel of Khasi comfort food: short-grain hill rice slow-simmered with carefully spiced local pork stock, ginger paste, sliced wild shallots, and mountain herbs till every grain is rich, deeply flavorful, and golden.",
    profile: "Comforting, savory, lightly spiced, warm soil ginger notes",
    pairing: "Perfect with sliced red onions, raw local green chili, and a hot, unsweetened cup of black tea (Lal-Cha).",
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=800",
    matchCafes: ["Trattoria", "Jadoh Stall", "Meghalaya Heritage Inn"]
  },
  {
    id: "dohkhlieh",
    name: "Dohkhlieh",
    philosophy: "The Mountain Crisp Salad",
    description: "A traditional pork salad made of finely minced tender pork belly and brain, tossed raw with exceptionally sharp mountain small onions, fiery local small green chilies, and hand-plucked wild ginger leaves. Served cold.",
    profile: "Pungent, extremely fresh, crispy, with sharp chili heat",
    pairing: "Enjoyed as a contrasting side dish alongside a warm bowl of spiced Jadoh rice.",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800",
    matchCafes: ["Trattoria", "Hillside Kitchen"]
  },
  {
    id: "tungrymbai",
    name: "Tungrymbai",
    philosophy: "The Soulful Ferment",
    description: "A highly complex Khasi specialty of heavily fermented soybeans, slow-stewed in massive iron pots with thick pork cubes, ground black sesame seeds, ginger paste, garlic cloves, and regional dry spices until thick and earthy.",
    profile: "Rich, deeply savory, pungent umami, smooth gravy texture",
    pairing: "Spoon over plain white boiled rice or Jadoh for structural umami.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
    matchCafes: ["Trattoria", "Khein-Kong Kitchen"]
  },
  {
    id: "dohneiiong",
    name: "Dohneiiong",
    philosophy: "The Black Sesame Heritage",
    description: "An incredibly iconic Khasi classic: tender cubes of pork slow-cooked in a silky, jet-black gravy made from dry-roasted black sesame seeds (Nei-long), local ginger shreds, and fragrant wild fragrant wild peppercorns.",
    profile: "Nutty, velvety, deeply herbal, moderate slow-heat spice",
    pairing: "Tastes exceptional on cloudy days alongside steaming hot red hill rice.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800",
    matchCafes: ["Heritage Inn Kitchen", "Trattoria"]
  }
];

export const ARTICLES: GuideArticle[] = [
  {
    id: "rainy-day-coffee",
    title: "Why Rain is the Best Time for Coffee in Shillong",
    excerpt: "Exploring the sensory magic that happens when the clouds open over Shillong and local cafés become shelters of warm acoustic folk music.",
    image: "https://images.unsplash.com/photo-1428592953211-077101b2021b?auto=format&fit=crop&q=80&w=1200",
    author: "Ujjwal",
    date: "June 12, 2026",
    readTime: "5 min read",
    category: "culture",
    featured: true,
    content: `
# Why Rain is the Best Time for Coffee in Shillong

There is an unspoken agreement among the residents of Shillong: when the first thick drops of rain begin to strike the iron roofs, the pace of the city slows, and everyone targets their favorite café shelter.

Shillong, often called the "Scotland of the East," gets its climate and personality from the monsoon clouds that sweep up from Bangladesh plains. But instead of hiding at home, we head out.

In places like **Cafe Shillong** or **Dylan's Cafe**, the sound of rain tapping on windowpanes becomes a beautiful natural percussion. The misty hills of Laitumkhrah fade into soft gray water-color wash, while inside, fireplaces crackle and local musicians take up acoustic wooden guitars.

### The True Mountain Sip

A hot cup of coffee brewed during a monsoon shower is a different sensory experience. The crisp ambient mountain air makes the hot mug warm your hands, while locally harvested Khasi Hills beans reveal notes of deep roasted pine and citrus blossom.

Next time the sky darkens in Police Bazaar, don't run for a taxi. Slip inside a small cafe corner, order an organic pour-over, and listen to the rain drum on the roof. It is the closest you will ever get to the true, restful soul of Shillong.
    `
  },
  {
    id: "secret-roasters",
    title: "The Secret Roasters of Upper Shillong",
    excerpt: "Deep inside the misty pine forests, independent cultivators are quietly reviving pre-colonial Arabica bean strains.",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=1200",
    author: "Banrak",
    date: "May 28, 2026",
    readTime: "7 min read",
    category: "reviews",
    content: `
# The Secret Roasters of Upper Shillong

For decades, the standard tea stall (Chai-Dukan) was the absolute ruler of Meghalaya's hillsides. But high up in Upper Shillong, invisible behind pine tree fences, a small organic coffee revolution is taking root.

In small greenhouses, independent organic farmers are cultivating pre-colonial Arabica heirloom plants originally planted by British missionaries, growing them alongside wild orange orchards.

### The Altitude Effect

What makes Upper Shillong coffee extraordinary is the elevation. Grown at over 5,000 feet, the cold weather slows the growth of the coffee cherries, concentrating sugars and creating a beautiful, clean profile with elements of mountain honey and pine tree spice.

Roasters like the local family backing **Cafe Shillong's custom beans** roast in small iron drums. They keep the roast medium to preserve the delicate forest aromatics, showing how the hills of Shillong are finding a modern global coffee voice.
    `
  },
  {
    id: "hidden-bakers-mawlai",
    title: "The Hidden Bakers of Mawlai",
    excerpt: "Tracing the early morning paths of Mawlai's ancient sourdough cabins and buttery pastry landmarks.",
    image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=1200",
    author: "Ujjwal",
    date: "April 15, 2026",
    readTime: "4 min read",
    category: "area-guides",
    content: `
# The Hidden Bakers of Mawlai

While commercial white breads rule modern supermarkets, the historical suburb of Mawlai hides timber-fueled ovens that have been burning for over eighty years.

Before dawn, when the mist is still thick over the hills, sweet smells of buttery pastries fill the streets of Mawlai. Local old-timers line up outside tiny, unmarked shopfronts to buy crusty sourdough rolls and traditional butter tea cakes.

These bakers use ancient wood-fired brick ovens, giving their bakes a unique, subtly smokey aroma that you cannot find in any modern baker. If you wish to taste true Shillong history, wake up early, ride up to Mawlai, and buy hot buns direct from the baker's peel.
    `
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: "r-rynsan-1",
    cafeId: "rynsan-cafe",
    userName: "Ibansara T.",
    rating: 5,
    comment: "Hands down the most beautiful minimalist spot in Shillong. The siphon drip coffee is incredibly smooth and the smoked pork toast is spectacular.",
    date: "May 27, 2026",
    isLocalGuide: true
  },
  {
    id: "r-ahavah-1",
    cafeId: "ahavah-cafe",
    userName: "Banrap K.",
    rating: 5,
    comment: "The valley view from the cedarwood deck is breathtaking when the mist rolls in! Amazing wild thyme chicken skewers and cozy firewood hearth.",
    date: "May 26, 2026",
    isLocalGuide: true
  },
  {
    id: "r-cherry-1",
    cafeId: "cherry-bean-cafe",
    userName: "Darihun S.",
    rating: 5,
    comment: "Drinking estate-sourced coffee under the blooming cherry blossom trees was magic. The butter crumble cake is pure nostalgic comfort.",
    date: "May 25, 2026"
  },
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
    date: "May 18, 2026"
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
