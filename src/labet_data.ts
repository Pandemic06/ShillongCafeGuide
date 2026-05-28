export interface LabetCommentary {
  tagline: string;
  note: string;
  observations: string[];
}

export const KONG_LABET_REGISTRY: Record<string, LabetCommentary> = {
  "rynsan-cafe": {
    tagline: "Traditional Khasi slow-food served with wood-smoke and live Ka Duitara string chords. A recipe for simplifying your noisy modern complications.",
    note: "Order the Dohneiiong pork belly with black sesame. It is slow-cooked, like any good life decision.",
    observations: [
      "The timber walls smell like fresh pine and old secrets.",
      "Locals come here when they are tired of eating standardized assembly-line burgers.",
      "The musicians tune their string instruments with the same patience as the chefs cook the Jadoh."
    ]
  },
  "ahavah-cafe": {
    tagline: "Elegant alpine chandeliers, velvet cushions, and very fancy cakes. Designed for pretending your life is completely sorted out.",
    note: "Best for a date when you want to look richer than you are. Bring a proper coat.",
    observations: [
      "The crystal chandeliers blink like nervous stars.",
      "The rosewater sponge cake is lighter than the Shillong fog.",
      "Do not touch the velvet chairs with dirty hands, or the hosts will look at you with quiet middle-class tragedy."
    ]
  },
  "cherry-bean-cafe": {
    tagline: "Surrounded by vertical garden plants and ceiling lofts. The coffee is organic, so you can feel healthy while wasting the entire afternoon.",
    note: "The sourdough pizza takes some time. Patience is a mountain virtue, dear.",
    observations: [
      "More books on the shelf than customers actually reading them.",
      "The timber smell makes you feel like you are in an expensive treehouse.",
      "The local teenagers take a lot of photos near the hanging ivy. Let them be, youth is short."
    ]
  },
  "cafe-shillong": {
    tagline: "Good coffee, expensive pork toast, and a strong chance of overhearing someone discuss a business plan they will never start.",
    note: "Sit by the window. If the rain catches you here, the tragedy of the streets looks almost artistic.",
    observations: [
      "The jazz chords are smooth, unlike our steep hill paths.",
      "The smoked pork sourdough toast is legendary, though your wallet might disagree.",
      "People come here to meet their exes or write poetry they will never publish."
    ]
  },
  "dylans-cafe": {
    tagline: "A hillside tribute to Bob Dylan with ceiling tiles painted by customers. Enough vintage rock to make any teenager feel deeply misunderstood.",
    note: "The old-school hot apple pie is dependable. Some say Bob himself would have liked it; I say he just liked apple pie.",
    observations: [
      "Every wall has Bob's face looking at you like he knows you haven't listened to his deep cuts.",
      "The guitar tables are clever. Don't try to play them; wood polish has no strings.",
      "A favorite spot for students who are supposed to be studying at St. Edmunds but prefer sweet ginger tea."
    ]
  },
  "ml-05-cafe": {
    tagline: "Motorcycles hanging from the ceiling. A highway sanctuary for people who think loud engines represent inner peace.",
    note: "The pepper pork fry is great, but don't eat so much that you can't fit on your bike.",
    observations: [
      "Suspended bikes. Helpful if the cafe floods, I suppose.",
      "Perfect pitstop for riders who drive 20 kilometers just to get an espresso and look tough.",
      "The air is thick with the scent of roasted beans and leather jacket dreams."
    ]
  },
  "the-pine-loft": {
    tagline: "Cedar wood counters, soft whispers, and serious-faced people studying things they should have finished last semester.",
    note: "Silence is mandatory here. If you talk too loud, even the coffee filters will judge you.",
    observations: [
      "The minimalist decor is clean. It makes my own living room look like a crowded bazaar.",
      "The wildflower honey pour-over is subtle. Like Shillong sunshine in November.",
      "If you whisper a secret here, three people will note it down in their organic paper diaries."
    ]
  },
  "melody-beans": {
    tagline: "Central brick walls and signed acoustic guitars. The local crowd comes here to sing cover songs they've sung a hundred times.",
    note: "Vibrant and loud. Do not go here if you are trying to hide from someone to whom you owe money.",
    observations: [
      "The brick walls are rustic. Reminds me of the old post office, but with better smell.",
      "The cinnamon latte has too much spice. It wants to be a curry, but it is still just coffee.",
      "A lot of laughter here. Shillong people love to laugh, usually at someone else's expensive haircut."
    ]
  },
  "fern-mist-garden": {
    tagline: "A glass dome greenhouse that makes you feel like an exotic plant. The wild mint cold brew is surprisingly wise.",
    note: "The rain hitting the glass is the best background song in Shillong. Best visited slow.",
    observations: [
      "You are surrounded by endemic ferns. If you look closely, they look as tired as public servants.",
      "The mist generators are a bit redundant in Shillong, but visitors seem to think it is magic.",
      "The wild mint cold brew is clean, like a cold morning wash."
    ]
  },
  "trattoria-shillong-pb": {
    tagline: "No fancy lights, no hipster plating. Just real Khasi food that survived generations for a reason.",
    note: "The Jadoh and Dohkhlieh are authentic. If the queue is long, stand with some humility.",
    observations: [
      "The wooden benches have hosted three generations of hungry students and tired shopkeepers.",
      "The Jadoh is served on simple plates. There is no wild berry glaze, and thank God for that.",
      "Some tourists look slightly afraid of the Tungrymbai. Excellent, more for us."
    ]
  },
  "evening-club-laitumkhrah": {
    tagline: "Vintage vinyl, warm wood fires, and slightly aging musicians performing classic rock with incredible earnestness.",
    note: "The rooftop deck is beautiful when the fog rolls in. Bring a thick scarf.",
    observations: [
      "The fireplace is cozy. It is the only thing warmer than the local rumors in winter.",
      "They play Hotel California every Saturday. I think it is in our state constitution.",
      "Watch the clouds from the balcony. You can see the weather changing faster than a politician's opinion."
    ]
  },
  "jiva-grill-nongkynrih": {
    tagline: "Luxury pine yards, romantic stone fire pits, and artificial waterfalls. Very scenic, but your wallet will feel the cold.",
    note: "Bring a heavy jacket. The fires are warm, but the mountain wind has no respect for fine outfits.",
    observations: [
      "An artificial waterfall. In a town with real ones every five miles. Well, at least this one has a remote control.",
      "The basalt sizzlers are hot enough to cook your worries away.",
      "Mostly couples looking deeply into each other's eyes, trying not to look at the bill."
    ]
  },
  "bread-cafe-pb": {
    tagline: "Warm croissants and morning espressos. The perfect place to hide while waiting for the Police Bazaar crowd to thin out.",
    note: "Bakeries are always comforting. Butter never tells you to move faster or think harder.",
    observations: [
      "The morning croissants are flaky, like the plans my nephews make.",
      "Perfect shelter from the rain. Sip your tea and watch people rushing through Khyndailad.",
      "The scent of yeast and sugar is the only thing that handles our damp winters."
    ]
  }
};

// Generates a witty fallback tagline, note and observations programmatically in Kong Labet's signature voice
export function generateProgrammaticLabetCommentary(cafe: {
  name: string;
  neighborhood: string;
  theme?: string;
  rating?: number | string;
  vibeTags?: string[];
  khasi_food_available?: boolean;
}): LabetCommentary {
  const name = cafe.name;
  const area = cafe.neighborhood;
  const isKhasi = !!cafe.khasi_food_available;
  const tags = cafe.vibeTags || [];

  let tagline = "";
  let note = "";
  let obs: string[] = [];

  if (isKhasi) {
    tagline = `Honest ${name} kitchen in ${area}. No pretentious microgreens or imported plates, just food that respect the hills.`;
    note = "Go with an open stomach and zero expectations of speed. Good things brew slowly.";
    obs = [
      `The Jadoh pot here has seen more local political debates than the Shillong municipal office.`,
      "Simple tables, clean water, and rich ginger aromas. The way Khasi dining is meant to be.",
      "You might have to share a bench with a stranger. Say hello, but don't ask about their salary."
    ];
  } else if (tags.some(t => /music|band|stage|live/i.test(t))) {
    tagline = `A musical escape in ${area} where people come to pretend they understand jazz chords and deep-cut acoustic poetry.`;
    note = "Bring a warm sweater and steady hands. The guitar notes fly fast here.";
    obs = [
      `The local songwriters here all sound like they've read too much Keats.`,
      "Guitars hanging on the brickwork. It gives the place a rugged feel, like my grandfather's garden shed.",
      "If they play Classic Rock, look serious and nod. It's the local etiquette."
    ];
  } else if (tags.some(t => /premium|luxury|fine/i.test(t))) {
    tagline = `Premium atmosphere in ${area}. Pricey coffee and fancy napkins, but at least the scenery is handsome.`;
    note = "Perfect for when you want to impress someone with your sophisticated tastes. Watch your step, and your wallet.";
    obs = [
      "A place where the chairs are too comfy and the waiters speak english cleaner than mine.",
      "The lighting is dimmed so much you can barely see the prices. That is a strategic design choice, dear.",
      "People sitting here whisper like they are discussing international coffee trade agreements."
    ];
  } else {
    // Default Cafe
    tagline = `A cozy slice in the heart of ${area}. Good coffee, decent tables, and enough mist outside the window to justify your poetic moods.`;
    note = "Grab a corner table and ignore your notifications. The mountains are waiting.";
    obs = [
      "A quiet refuge. Perfect for writing angry emails you will fortunately never send.",
      "The baristas work with a quiet mountain pride. Respect their craft and tip them nicely.",
      `Overheard a student explaining the meaning of life here. I told him to eat his croissant first.`
    ];
  }

  return {
    tagline,
    note,
    observations: obs
  };
}

export function enrichCafeWithLabet(cafe: any): any {
  const registered = KONG_LABET_REGISTRY[cafe.id];
  if (registered) {
    return {
      ...cafe,
      kong_labet_tagline: registered.tagline,
      kong_labet_note: registered.note,
      kong_labet_observations: registered.observations
    };
  }

  const generated = generateProgrammaticLabetCommentary(cafe);
  return {
    ...cafe,
    kong_labet_tagline: generated.tagline,
    kong_labet_note: generated.note,
    kong_labet_observations: generated.observations
  };
}
