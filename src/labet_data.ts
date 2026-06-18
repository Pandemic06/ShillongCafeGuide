export interface LabetCommentary {
  tagline: string;
  note: string;
  observations: string[];
}

export const KONG_LABET_REGISTRY: Record<string, LabetCommentary> = {
  "alaya-cafe": {
    tagline: "A classy yet homely abode in Nongthymmai, combining premium dining with the warm acoustic chords of local musicians weekly.",
    note: "Alaya translates to 'Abode' for a reason—it's a classy yet deeply homely mountaintop escape in Nongthymmai. Order the Flat White, sit back during their weekly acoustic nights with local musicians, and appreciate the warm, premium hearth. Some places are meant to be felt, not just framed.",
    observations: [
      "Alaya means 'Abode'—classy and premium, yet it instantly makes you feel right at home.",
      "Located in Nongthymmai, it's away from the crowded market lanes, offering a more peaceful, upscale ambiance.",
      "Their weekly acoustic sessions showcasing local Shillong musicians are an absolute must-experience."
    ]
  },
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
  "pine-loft": {
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
  },
  "you-and-i-shared-cafe": {
    tagline: "Shared tables and quiet whispers. A space designed to make eavesdropping look like contemplation.",
    note: "Best for a date where you have nothing left to say to each other, but the cozy seats hide the silence.",
    observations: [
      "People here look very intense. Usually over single-shot espressos that went cold twenty minutes ago.",
      "The shared library bookshelf is full of books with missing pages. Like the memories we choose to leave behind.",
      "Order the ginger cookies. They have a sharp bite, unlike the mild promises people make here."
    ]
  },
  "cafe-sola": {
    tagline: "Blonde wood and clean lines in Rilbong. A place that pretends winter in Shillong is a stylish choice rather than a damp reality.",
    note: "If you sit near the big window, the light makes you look like you're in a movie. Bring your best coat.",
    observations: [
      "So much white wood. My kitchen has more character in a single tea stain, but students seem to find it peaceful.",
      "The cinnamon rolls are massive. They require a strategy, not just a fork.",
      "Very quiet. You can hear a teaspoon clink from three tables away, which makes laughing feel like a crime."
    ]
  },
  "mellow-mood-cafe": {
    tagline: "Earthy tones, soft seating, and a general agreement that nobody is in any hurry whatsoever.",
    note: "A solid choice when Laitumkhrah is too loud and you just want to read your book without someone asking for your chair.",
    observations: [
      "The green walls are soothing, though they match the moss on the exterior walls a bit too closely.",
      "The black coffee is honest and hot. No fancy caramel designs to distract you from the bitterness of life.",
      "The waiters have the patient eyes of people who know the rain will eventually stop, even if it takes three days."
    ]
  },
  "sip-and-bite-cafe": {
    tagline: "No-fuss snacks and local gossip in Nongthymmai. The tea is sweet and the snacks are fried, as nature intended.",
    note: "Drop by when you have fifty rupees and a craving for hot pakoras. Don't expect fancy plating.",
    observations: [
      "The chairs are plastic and red, which is fine because you don't come here to write a novel anyway.",
      "The steam from the momo steamer is the best heater in the room during November.",
      "A prime spot to hear what the local taxi drivers really think about the traffic jam at beat house."
    ]
  },
  "munchies-shillong": {
    tagline: "Bustling fast-food chaos in the middle of Police Bazaar. Young crowds, hot burgers, and zero peace.",
    note: "Go here if you want quick cheese fries and don't mind standing in a crowd of loud high school students.",
    observations: [
      "The music is usually slightly too loud, probably to encourage you to eat faster and leave.",
      "The chicken burgers are messy. Eat them with humility; napkins are always in short supply.",
      "A prime spot for watching tourists realize they took the wrong turn towards Bara Bazaar."
    ]
  },
  "the-shillong-cafe": {
    tagline: "Shillong pride in a cup, packaged for travelers. Clean, modern, and very safe for visitors.",
    note: "Best place to take your visiting cousin who is afraid of local street stalls. The coffee is reliable.",
    observations: [
      "A lot of souvenirs on display. You can buy a mug that says 'Shillong' just in case you forget where you spent your money.",
      "The local wood carving details on the counter are nice, though they look a bit too clean to be historic.",
      "The lemon ice tea is sweet enough to solve family disputes."
    ]
  },
  "little-chef-cafe": {
    tagline: "Tiny kitchen, huge portions. Homestyle comfort food that feels like your mother made it, if she was in a good mood.",
    note: "Try their daily specials. The pork chops are heavy enough to make you cancel your evening plans.",
    observations: [
      "The space is so small you might accidentally hear what the girl next to you is texting her mother.",
      "The wooden sign outside is slightly lopsided, which gives me hope for the authenticity of the kitchen.",
      "The caramel custard is the only sweet thing in Laitumkhrah that doesn't try to look artistic."
    ]
  },
  "city-hut-family-dhaba": {
    tagline: "The absolute center of family Sunday dinners. Butter naan, loud children, and heavy tandoori smoke.",
    note: "Prepare for a wait during dinner hours. Shillong families have been coming here since the roads were dirt.",
    observations: [
      "The indoor stream has actual fish. I hope they don't look at the kitchen menu too closely.",
      "The butter chicken is rich enough to pay off a small loan. Eat it with respect.",
      "You will hear at least three different family arguments about property or school grades if you sit near the center."
    ]
  },
  "delhi-mistan-bhandar": {
    tagline: "Hot jalebis and crowded counters since the British era. Nostalgia smells like pure ghee here.",
    note: "Go for the morning puri-sabji right when they open. The Police Bazaar fog is still cold, but the puri is hot.",
    observations: [
      "The line for sweets moves like a busy train station. Don't hesitate when it's your turn, or you'll be pushed aside.",
      "The jalebis are fried in front of you. Watching them float in hot syrup is the only therapy I recommend.",
      "The floor is always slightly sticky. It's the sign of a place that does real business."
    ]
  },
  "ginger-restaurant": {
    tagline: "Chic dining and sharp spices in Laitumkhrah. Designed for people who want their food to have an attitude.",
    note: "Bring your friends when you want a proper sit-down dinner and aren't in the mood for cafes.",
    observations: [
      "The modern lighting makes everyone look slightly mysterious, which helps if your conversation is dull.",
      "They use a lot of ginger in their curries. Honest ginger that clears your nose and your doubts.",
      "The waiters wear neat aprons and move with the serious speed of professionals."
    ]
  },
  "lamee-restaurant": {
    tagline: "Traditional tribal flavors slow-cooked in Nongkynrih. A quiet lesson in highland spice.",
    note: "Order the bamboo shoot pork. It smells like a wet forest afternoon, which is exactly why it is delicious.",
    observations: [
      "The decor has local weaving patterns on the walls. Simple, quiet, and not shouting for attention.",
      "The red rice is cooked in small pots. It has that earthy smell that city folk try to find in health stores.",
      "A very peaceful crowd. Mostly people who know how to eat their meal without taking ten photos first."
    ]
  },
  "barbeque-restaurant": {
    tagline: "Charcoal grills and hearty meat in Police Bazaar. Old-school Shillong dining that doesn't care about vegan trends.",
    note: "Get a booth near the back. The grill smell stays in your clothes, but the mutton kebabs are worth it.",
    observations: [
      "The wood paneling on the walls looks like it has survived several earthquakes and many local debates.",
      "The seekh kebabs are smoky and dark, cooked by men who have been doing this since before your parents met.",
      "Very popular with the local uncles who discuss football and old music over hot plates."
    ]
  },
  "heritage-club-tripura-castle": {
    tagline: "Fireplaces, royal portraits, and very quiet corridors. Eat like an old landlord, but prepare for the bill.",
    note: "Best in the evening when they light the fires. The pine trees outside look very noble in the dusk.",
    observations: [
      "The paintings on the wall look back at you with royal disapproval if you use the wrong fork.",
      "The single-malt selection is serious. Like the conversations the uncles have about local history here.",
      "The wind howling through the old windows makes the fire in the hearth look very dramatic."
    ]
  },
  "jadoh-restaurant": {
    tagline: "Red hill rice and fermented sesame pork cooked in clay. Zero concessions to tourists.",
    note: "If you don't like pork fat or spicy ginger, stay away. This is honest mountain food.",
    observations: [
      "The clay pots look older than my tea kettle, which means the flavor has had time to sink in.",
      "The Dohneiiong here is dark as a winter night and twice as comforting.",
      "The benches are narrow. You will sit close to your neighbor, so eat quickly and don't make small talk."
    ]
  },
  "the-living-roof": {
    tagline: "Under a canopy of mountain ivy in Laitumkhrah. A green escape for people who find concrete exhausting.",
    note: "Go when the sun is out. Sitting under the glass roof with a hot lemon tea feels like a luxury garden.",
    observations: [
      "There are so many hanging plants I half expect to find a forest bird nesting in my cappuccino.",
      "The wooden tables are thick and rough-cut. They feel solid, like a good tree.",
      "A lot of artists and writers come here to look out at the hills and pretend they are working on their masterpieces."
    ]
  },
  "smoky-falls-tribe-coffee": {
    tagline: "Roasted pine-wood beans from the deep forests of Meghalaya. Coffee that actually tastes like the earth.",
    note: "Take a pack of their dark roast home. It's the only thing that makes Monday mornings in the rain bearable.",
    observations: [
      "The roasting machine is loud and smells like heaven. Like toasted hazelnut and wild pine smoke.",
      "They support local tribal farmers directly, which is nice because coffee shouldn't just belong to big cities.",
      "The music here is often traditional Khasi folk guitar. Simple, woody, and very grounding."
    ]
  },
  "click-cafe": {
    tagline: "Old cameras on shelves and black-and-white photos of misty valleys. A gallery for the visually minded.",
    note: "Sit by the corner light. The vintage photos on the wall might inspire you to buy a camera you won't use.",
    observations: [
      "Every second customer seems to have a fancy lens on their table. It's a silent competition of focus.",
      "The dark chocolate tart is rich and dark, like an old film negative.",
      "A quiet spot during the mornings, when the only sound is the espresso machine and the rain."
    ]
  },
  "latte-love-cafe": {
    tagline: "Pour art that looks too pretty to drink on GS Road. A cozy pause in the middle of traffic noise.",
    note: "Take a photo of your latte quickly before the foam collapses and your internet followers lose interest.",
    observations: [
      "They draw flowers and swans on the coffee. I usually prefer my coffee to just look like hot water, but it's very skilled.",
      "The chairs are pastel blue and very soft. Good for resting your back after walking up the GS road incline.",
      "Mostly young couples sharing desserts and looking very pleased with their weekend outfits."
    ]
  },
  "woodstock-cafe": {
    tagline: "Vinyl posters and rock-and-roll relics. A sanctuary for people who believe music peaked in 1969.",
    note: "Order the classic filter coffee. The rock ballads on the stereo are loud, so don't bring your homework here.",
    observations: [
      "Jimi Hendrix is looking down from the wall like he knows you can't play the guitar solos.",
      "The tables are made of dark varnished wood, covered in old gig flyers from the nineties.",
      "You will always find at least one old rocker with long grey hair nursing a cold tea and tapping his boot."
    ]
  },
  "tring-tring": {
    tagline: "Quirky rotary phones and bright yellow walls in Laban. A cheerful retreat for the nostalgic collector.",
    note: "Pick up the old telephone on your table. It doesn't ring, which is the best thing about it.",
    observations: [
      "The decor is very bright. It's like a sunny day in the middle of monsoon, which is slightly disorienting but nice.",
      "The cheese toast is thick and greasy, the way comfort food should be when you're hiding from the cold wind.",
      "Kids love this place. If you want quiet contemplation, this might not be your sanctuary."
    ]
  },
  "qzine-restaurant": {
    tagline: "Experimental fusion in GS Road. Food that tries very hard to surprise you, and usually succeeds.",
    note: "Order the spiced peach mocktail. It has that clean, mountain-orchard sweetness that clears your head.",
    observations: [
      "They serve things on slate tiles instead of plates. I always worry the food will slide off, but it looks very modern.",
      "The modern jazz music is slightly strange, like a radio station that hasn't been tuned properly, but it fits the mood.",
      "The clients look very sleek, mostly business folks using words like 'leverage' and 'scalability'."
    ]
  },
  "dejavu-cafe-lounge": {
    tagline: "Dim lights and deep sofas. A place to disappear into the shadows when you don't want to be recognized.",
    note: "Bring a jacket; the air conditioning is cold, but the red velvet seats are very warm.",
    observations: [
      "The lighting is so dark I once nearly drank my neighbor's tea by mistake. A very intimate vibe.",
      "The menu has a lot of mocktails with dramatic names. Choose the one with ginger; it's the safest bet.",
      "A favorite for late-night talks when the streets of Laitumkhrah are quiet and wet."
    ]
  },
  "enchante-tea-room": {
    tagline: "Fine porcelain and high-grown Darjeeling in Lachumiere. A quiet nod to the tea-tables of the past.",
    note: "Best for afternoon tea with your grandmother. Speak softly; the teacups look very delicate.",
    observations: [
      "The lace tablecloths are white as clouds. Do not drop jam on them, or the auntie at the counter will sigh deeply.",
      "They serve scones with cream. Scones are just expensive biscuits, but here they make you feel very noble.",
      "The grandfather clock ticks with the slow rhythm of a town that has no interest in modern haste."
    ]
  },
  "inside-out-cafe": {
    tagline: "Avocado toast and green tea in Nongthymmai. Designed for pretending you enjoy healthy choices.",
    note: "Go after a long walk around the hills. The wheatgrass juice tastes like fresh grass, but it's good for your conscience.",
    observations: [
      "A lot of plants and clean white walls. It looks like a clinic but smells like roasted almonds.",
      "The vegan cakes are surprisingly sweet, considering they don't have sugar, butter, or joy in them.",
      "People here wear exercise clothes and look very fit. It makes me want to go home and eat pork lard."
    ]
  },
  "cafe-regal": {
    tagline: "Colonial-style brass fittings and dark mahogany in Police Bazaar. Quiet dignity in the middle of market noise.",
    note: "Sip an espresso here when you need to recover from the bargain hunting in Khyndailad.",
    observations: [
      "The leather booths are deep and smell like old library books and clean wax.",
      "The coffee is served with a small piece of dark chocolate. A class touch that shows they care about details.",
      "Very popular with the local lawyers who discuss cases with serious faces over hot tea."
    ]
  },
  "chez-rodin": {
    tagline: "Croissants and classical music in Laitumkhrah. A French corner that somehow fits into our rainy hills.",
    note: "Order the almond pastry. It's sweet enough to make you forget the cold damp wind outside.",
    observations: [
      "The classical piano music on the speaker is soft, like the rain on a tin roof.",
      "The pastries are golden and flaky, scattering crumbs over the table like winter snow.",
      "The owner speaks with a quiet pride about his yeast. A man who respects fermentation is a man you can trust."
    ]
  },
  "marsoki-cafe": {
    tagline: "A Mawlai secret served on wooden tables. Local comfort food that doesn't advertise to tourists.",
    note: "It's a bit of a drive, but the chicken stew is the warmest thing you'll find in Mawlai during winter.",
    observations: [
      "The floor is simple cement, which is clean and doesn't try to look like a gallery.",
      "The tea is served in steel mugs, keeping it hot twice as long as ceramic does.",
      "Locals come here to talk about neighborhood sports and politics in soft voices."
    ]
  },
  "bamboo-hut": {
    tagline: "Timber benches and valley wind near the Peak. High-altitude tea that tastes like the clouds.",
    note: "Bring a thick wool cap. The wind up here has zero manners and will steal your warmth in minutes.",
    observations: [
      "Everything is made of local bamboo. If you sit too fast, the chair might squeak in Khasi.",
      "The view is spectacular. On a clear day you can see the plains; on a rainy day you can't even see your tea.",
      "The red tea with ginger (Lal-cha) is the only reason to stand in this cold."
    ]
  },
  "wok-la-chaumiere": {
    tagline: "French plating meets Asian woks on GS Road. A sophisticated dance of soy and butter.",
    note: "Best for a celebratory dinner when you want to look like you understand international culinary trends.",
    observations: [
      "They serve soup in cups that look like abstract art. Delicious, but difficult to hold.",
      "The lighting is soft and golden, making the fusion dishes look like museum pieces.",
      "Mostly groups of colleagues celebrating promotions, trying to speak quietly but failing after the second drink."
    ]
  },
  "madras-cafe": {
    tagline: "Filter coffee and hot idlis in the center of Police Bazaar. Simple, fast, and completely dependable.",
    note: "Go for breakfast. The sambar is spicy enough to wake you up before the shops even open.",
    observations: [
      "The steel tumbler filter coffee is poured from a height. A local show that is always fun to watch.",
      "The dosas are long as a walking stick and paper-thin. Eat them hot, before the hill wind cools the butter.",
      "Very fast service. The waiters move like chess players who already know their next three moves."
    ]
  },
  "corner-cafe": {
    tagline: "Sunlight and scrambled eggs on a busy corner in Laitumkhrah. Simple food for busy mornings.",
    note: "Sit by the corner glass. It's the best spot in town to watch the school traffic pass by.",
    observations: [
      "The yellow walls make the room feel bright even when the rain outside is dark and heavy.",
      "The coffee is simple and strong. No fancy syrups, just good hot caffeine to start your day.",
      "A favorite for college students who look very tired but speak very fast about their weekend plans."
    ]
  },
  "turquoise-cafe": {
    tagline: "Turquoise walls and quiet views of Wards Lake. A calm blue shelter in Lachumiere.",
    note: "Bring a book and watch the ducks on the water through the window. A very peaceful afternoon.",
    observations: [
      "Everything is painted blue-green. It's like sitting inside a clean pool of water, but warmer.",
      "The peppermint tea is clean and sharp. Matches the cold breeze off the lake.",
      "People here speak in murmurs. The lake outside seems to demand quiet."
    ]
  },
  "the-press-cafe": {
    tagline: "Books on the counter and old newspaper prints on the wall. A quiet corner for the reader on GS Road.",
    note: "Good coffee and stable tables. If you look busy reading, the waiters will leave you in peace for hours.",
    observations: [
      "The menu looks like a newspaper front page. Clever, though reading it in the dim light takes some effort.",
      "The bookshelves have a decent selection of local poetry. Read some; our local writers have wise souls.",
      "A quiet refuge from the heavy truck noise of the main road outside."
    ]
  },
  "open-up-cafe": {
    tagline: "Open mic stages and local art on display in Nongthymmai. Where the youth comes to find their voice.",
    note: "Check their evening calendar. If there is a local acoustic set, it's worth sitting in the crowd.",
    observations: [
      "A lot of hand-painted murals on the walls. Very energetic and slightly chaotic, like youth itself.",
      "The lemon ginger honey tea is warm, perfect for healing dry throats before open mic slots.",
      "The crowd is very supportive. Even if a singer hits the wrong note, everyone claps. Shillong warmth."
    ]
  },
  "shillong-cafes-and-restaurants": {
    tagline: "Generous Indian-Chinese plates and student noise. As loud as a local taxi stand, but the chowmein is reliable.",
    note: "Sit near the back to avoid being hit by a student rushing to their coaching class. Get the mixed chowmein.",
    observations: [
      "The menu is longer than the lines at the district court, but everyone orders the same three items.",
      "You will hear at least five conversations about St. Anthony's college internal marks.",
      "The waiters have the blank look of people who have served ten thousand plates of chilly chicken this month."
    ]
  },
  "suburb": {
    tagline: "Opposite the church, where students pray their exams go well over very sweet lattes. Cozy but cramped.",
    note: "It's small, so don't bring your entire friend circle unless you want to sit on each other's laps. Order the cappuccino.",
    observations: [
      "Directly opposite the Presbyterian church. Convenient if you need to repent after skipping class.",
      "The stools are design-friendly but spine-unfriendly. Youth handles it, I suppose.",
      "The steam off the espresso machine is the only warm thing in here on a damp July afternoon."
    ]
  },
  "secret-story-boutique-cafe": {
    tagline: "Pink flowers on the walls and delicate high tea. Very fancy, but keep your elbows off the lace tables, dear.",
    note: "Order the rose pastry. It's almost too pretty to eat, which is good because you'll want to take ten pictures first.",
    observations: [
      "Floral wallpaper that reminds me of my sister's wedding parlour, but much more expensive.",
      "The tea stands have three tiers. A lot of geometry for two small biscuits and a sandwich.",
      "People here take photos with their tea cups held just so. A very rehearsed sort of relaxation."
    ]
  },
  "the-loft-cafe-restaurant": {
    tagline: "Rooftop dining where the local musicians sing sad songs under the stars. Excellent for pretending you have a dramatic past.",
    note: "Bring a thick scarf. The rooftop is lovely, but the night wind from the hills doesn't care about your style.",
    observations: [
      "The acoustic singers perform songs about heartbreak while people happily eat their pepper steak.",
      "The view of the Lachumiere ridge is very handsome, especially when the streetlights start to blink.",
      "If it starts to drizzle, watch the mad scramble for the indoor tables. A free comedy show."
    ]
  },
  "roma-eatery": {
    tagline: "Modern plates and bright mocktails that appeal to teenagers. Loud music, colorful seating, and zero quiet.",
    note: "Go with your younger cousins if you want to look hip, but bring earplugs just in case.",
    observations: [
      "The blue mocktails look like window cleaner but taste like sweet pineapple. Gen Z seems to trust it.",
      "The laughter here is very loud, the kind you only have before you start paying electricity bills.",
      "The burgers are stacked high. A messy business that requires some planning."
    ]
  },
  "scottys-shillong": {
    tagline: "Flame-grilled burgers, cheap fries, and a crowd of hungry college boys. The service moves faster than the traffic at Khyndailad.",
    note: "Get the double patty burger when you're too hungry to care about calories. Eat quickly, leave quickly.",
    observations: [
      "Perfect for when your pockets are light and your stomach is demanding meat.",
      "The smell of frying oil is the strongest perfume on Bomfyle Road.",
      "The tissue dispenser is always empty. Use your own handkerchief, like a proper gentleman."
    ]
  },
  "shillong-coffee-house": {
    tagline: "Traditional filter coffee and local gossip in Mawlai. A simple space that doesn't care about hipster trends.",
    note: "Order the simple toast and butter with a hot filter coffee. Let the uncles discuss local football in peace.",
    observations: [
      "Simple wooden tables that have probably seen more debates than the legislative assembly.",
      "The filter coffee is served hot and strong, the way it was before they started adding pumpkin spice.",
      "A very quiet, respectful space. Mawlai people like their coffee with a side of dignity."
    ]
  },
  "isabella-cafe": {
    tagline: "A quiet garden hideaway in Nongrimbah. Mismatched teacups, green ivy, and actual peace.",
    note: "Sit in the courtyard with a pot of chamomile tea. It's the only place in Laitumkhrah where the car horns sound distant.",
    observations: [
      "The ivy on the walls is very neat, like it was combed by a strict headmistress.",
      "The lemon tarts are sour enough to make you blink, which is exactly how a lemon tart should be.",
      "Perfect for reading that book you've carried in your bag for three months without opening."
    ]
  },
  "cafe-seuji": {
    tagline: "Matcha tea and quiet contemplation in Lapalang. Minimalist wood that makes my own living room look cluttered.",
    note: "Try the green matcha latte. It tastes like a healthy forest, which is good for your city soul.",
    observations: [
      "So quiet you can hear the ice melt in your green tea. Don't cough, or the whole room will look at you.",
      "The light pine furniture looks very Japanese, but the view outside is pure, beautiful Meghalaya.",
      "They serve matcha with little bamboo whisks. A lot of ceremony for a cup of tea, but very pleasant."
    ]
  },
  "the-mango-tree-lounge-cafe": {
    tagline: "Breezy outdoor seating under leaf canopies in New Colony. Relaxed lunches for slow afternoons.",
    note: "Go on a sunny Saturday afternoon. The outdoor tables are very pleasant, though the local crows might eye your chips.",
    observations: [
      "Sitting under the trees is lovely until a dry leaf falls directly into your soup. Natural seasoning, I guess.",
      "The mocktails are sweet and colorful, like the dresses at a Nongkrem dance.",
      "A great place for families who want to have a long, noisy lunch without the neighbors complaining."
    ]
  },
  "belly-timber-cafe-restaurant": {
    tagline: "Rustic log cabin vibes and wood-fired pizzas in Nongmynsong. Rich cheese and warm hearths.",
    note: "Order the pepperoni pizza. The wood oven gives it a proper mountain char that electric ovens can't match.",
    observations: [
      "The logs on the walls make you feel like you're in a forest cottage, though the main road is just outside.",
      "The pizza cheese stretches longer than the traffic jam at Nongmynsong junction.",
      "The hearth smells like oak-smoke and toasted garlic. A very comforting perfume in winter."
    ]
  },
  "woods-cafe-shillong": {
    tagline: "Polished tree-slab tables and single-estate espresso on Boyce Road. For serious coffee drinkers.",
    note: "Order the macchiato. They take their roasting very seriously here, so don't ask for extra milk and sugar, dear.",
    observations: [
      "The tables are made from massive tree trunks. If they ever move, they'll need a crane.",
      "The baristas look like they are conducting a science experiment when they brew your pour-over.",
      "Very quiet. Perfect for hiding from your relatives when you're supposed to be running errands."
    ]
  },
  "coffee-chill": {
    tagline: "A sleek espresso bar on Keating Road. Quick cups and buttery croissants for busy office workers.",
    note: "Drop in for a quick double espresso before your meeting. Don't expect to linger; the stools are designed for speed.",
    observations: [
      "The crowd is mostly government clerks and lawyers talking about files and court dates.",
      "The croissants are flaky enough to ruin your neat office trousers. Eat with caution.",
      "The service is faster than the local monsoon clouds. In and out in five minutes."
    ]
  },
  "theroys-art-gallery-cafe": {
    tagline: "Oil paintings on the walls and quiet tea tables. A silent refuge for people who find the city too loud.",
    note: "Walk around the gallery first before you order your tea. The local landscapes on canvas are very wise.",
    observations: [
      "The paintings are beautiful, mostly mist and old pine trees. Very realistic, considering the real thing is outside.",
      "The tea selection is serious, served in heavy ceramic pots that keep the heat well.",
      "You will find actual artists here, looking very thoughtful over cold cups of black tea."
    ]
  },
  "16-street-bistro": {
    tagline: "Scenic garden dining inside the Windermere Resorts. Premium plates with a view of the green valleys.",
    note: "Take a table near the lawn edge. The valley view is worth the slightly higher prices, believe me.",
    observations: [
      "The grass is so green and neat it looks like a carpet. Don't let your children run too wild on it.",
      "The continental platters are very pretty, like they were designed by a drawing teacher.",
      "The wind off the valley carries the smell of wet pine needles and expensive soap."
    ]
  },
  "bunker-bites-cafe": {
    tagline: "Industrial iron frames and cheap bites in Lawsohtun. Honest canteen food for hungry students.",
    note: "Try the simple egg burgers. It's cheap, hot, and satisfying when you've spent all your pocket money.",
    observations: [
      "Metal pipes and industrial bulbs. Looks a bit like a workshop, but the tea is sweet.",
      "The crowd is young and talks mostly about local football matches and bike repairs.",
      "Very close to the Cantonment forest. The air is clean, even if the fries are greasy."
    ]
  },
  "karak-chaa-dhankheti": {
    tagline: "Strong ginger tea served in small glasses on a busy road. The fuel that keeps Shillong students awake.",
    note: "Stand by the counter and drink your karak hot. The ginger has a proper bite that clears your throat.",
    observations: [
      "The tea master pours the chai from three feet high. A local spectacle that never gets old.",
      "No seats, just a crowd of people holding hot glasses and talking about the traffic jam.",
      "The ginger aroma is strong enough to cure a common cold on the spot."
    ]
  },
  "flare-restaurant": {
    tagline: "Spacious family dining and heavy curries near Malki. Classic Sunday dinner territory.",
    note: "Bring the whole family. The portions are large, and the naan is soft enough for the grandparents.",
    observations: [
      "The sofas are deep and covered in velvet. Designed for a proper post-lunch snooze.",
      "The Chinese-style sweet and sour pork is red enough to guide traffic, but very popular.",
      "You will always see a birthday party here with balloons and a very loud chorus of song."
    ]
  },
  "zodiac-restaurant": {
    tagline: "Dependable North Indian and Chinese in Zara's Arcade. Old-school business lunches in a quiet room.",
    note: "Order the butter chicken and garlic naan. It's safe, rich, and has tasted the same for ten years.",
    observations: [
      "The tablecloths are white and stiff, like a fresh office shirt. Very proper.",
      "The waiters move with a slow, dignified pace. They've seen many business deals succeed and fail here.",
      "Tucked away in the arcade, it's a good place to hide when Police Bazaar is too chaotic."
    ]
  },
  "the-ambience-fine-dining": {
    tagline: "Clean white tables and quiet service in Nongthymmai. For dates when you want to look serious.",
    note: "Make a reservation for a window table. The plating is very artistic, so dress up a bit, dear.",
    observations: [
      "The plates are huge, but the food is placed in the exact center in a tiny, neat pile. Very stylish.",
      "The jazz music on the speaker is so soft you might think you're imagining it.",
      "A very quiet crowd. People look like they are trying not to make noise with their forks."
    ]
  },
  "extra-butter-pure-veg-restaurant": {
    tagline: "Pure veg highway stop on the Cherrapunji route. Hot parathas swimming in actual butter.",
    note: "Stop here on your way to Sohra. The aloo parathas are heavy, so don't plan on doing any strenuous hikes right after.",
    observations: [
      "They do not spare the butter. Your fingers will be shiny, but your heart will be happy.",
      "The tea is served in clay cups (kulhads). A nice touch that makes the road trip feel authentic.",
      "The traffic outside is loud, but the smell of hot ghee inside is louder."
    ]
  },
  "jiva-veg-restaurant": {
    tagline: "Extremely clean vegetarian thalis on GS Road. A family favorite where the tables are always shiny.",
    note: "Order the special North Indian thali. The service is fast, and the kitchen is cleaner than a hospital ward.",
    observations: [
      "The steel plates shine like mirrors. You can check your hair while eating your dal.",
      "No alcohol, no meat, no noise. Just families eating paneer with great focus.",
      "The filter coffee is served in proper brass tumblers. Very traditional and very hot."
    ]
  },
  "blackstone-grill": {
    tagline: "Middle Eastern kebabs and garlic paste in Mawlai Mawroh. A smoky grill escape near the pine fields.",
    note: "Get the mixed grill platter. The garlic paste (toum) is strong enough to keep vampires away for a week.",
    observations: [
      "The kebabs are cooked over real charcoal, giving the air a lovely smoky flavor.",
      "The view of the pine trees from the balcony is very handsome, especially at dusk.",
      "A favorite for young guys who talk about gym routines and engine oil over plates of mutton."
    ]
  },
  "the-hut-restaurant-shillong": {
    tagline: "Old-school Chinese chowmein at Laitumkhrah Point. A busy junction diner that has survived the years.",
    note: "Grab a table near the glass. It's noisy, but the chicken cutlet with brown sauce is pure nostalgia.",
    observations: [
      "The steps up to the restaurant are steep. Consider it a pre-meal exercise.",
      "The sweet corn soup is thick and hot, perfect for a cold rainy day when your chest feels tight.",
      "Regulars have been coming here since they were schoolboys in short trousers."
    ]
  },
  "olivias-kitchen": {
    tagline: "English breakfasts and Mexican wraps in Laitumkhrah. Cozy, popular, and always full of students.",
    note: "Go for the breakfast skillet. The sausages are decent, and the coffee is hot enough to wake you up.",
    observations: [
      "So many students from St. Edmund's here, you might think it's an extension of the college library.",
      "The quesadillas are very cheesy. A messy business that requires many napkins.",
      "The wooden chairs are small, so don't plan on sitting here for five hours."
    ]
  },
  "eden-restaurant": {
    tagline: "Classic Mughlai curries and rich mutton biryani. A Police Bazaar landmark that doesn't care about fitness trends.",
    note: "Get the mutton biryani. It is heavy, rich, and best eaten when you have nothing else to do but take a long nap.",
    observations: [
      "The scent of rosewater and mutton fat hits you at the door. Very promising.",
      "The decor is slightly faded, but the flavors are still as sharp as they were in the nineties.",
      "Very popular with families who believe Sunday is not Sunday without mutton curry."
    ]
  },
  "atmosphere-wine-dine": {
    tagline: "Rooftop lounge in Nongmynsong with panoramic skyline views. Fancy plates and cold winds.",
    note: "Bring a jacket. The valley view is spectacular, but the wind up here will blow your hairstyle away in seconds.",
    observations: [
      "The cocktails have smoking leaves in them. A lot of drama, but the drinks are quite handsome.",
      "The valley looks like a basin of stars in the evening. Very romantic, if you have the right company.",
      "The fusion dishes are plated like modern art. You might spend five minutes figuring out where to start eating."
    ]
  },
  "zayra-the-cake-studio": {
    tagline: "Designer cakes and colorful macarons in SF Mall. Sweet art that requires a proper budget.",
    note: "Order the custom cakes for special occasions, but drop in for their macarons anytime. The lemon one is very clever.",
    observations: [
      "The cakes look like they are made of porcelain, not sugar. I'd be afraid to cut them.",
      "The macarons are arranged in perfect neat rows, looking like colorful buttons on a fancy coat.",
      "A lot of mothers here discussing wedding cake designs with very serious faces."
    ]
  },
  "saaz-bakery-confectionery": {
    tagline: "Affordable sandwich bread and local cookies in Nongthymmai. The neighborhood standard.",
    note: "Stop by in the evening for fresh milk bread. It's soft, cheap, and makes the best toast for morning tea.",
    observations: [
      "The queue at 5 PM moves fast because everyone knows exactly what they want: bread and buns.",
      "The coconut cookies are dry and crunchy, perfect for dipping into hot tea until they almost melt.",
      "The baker has the flour-dusted hands of an honest working man. A very comforting sight."
    ]
  },
  "james-sons-bakery": {
    tagline: "Legacy donuts and cream rolls near Golf Links. Sweet nostalgia that tastes like childhood.",
    note: "Grab a dozen sugar donuts after a walk in the pines. Simple yeast and sugar, no fancy sprinkles needed.",
    observations: [
      "The donuts are simple rings of fried dough covered in granulated sugar. Honest and perfect.",
      "The wood counters look older than my grandmother's wardrobe, smelling of sweet yeast and pine wood.",
      "A favorite stop for golfers who need a sugar boost after walking the eighteen holes."
    ]
  },
  "the-blue-ribbon-bakery-cafe": {
    tagline: "Chic patisserie and fancy eclairs in Polo Hills. Designed for proper afternoon tea hours.",
    note: "Order the chocolate eclair. The pastry is light and the chocolate is dark enough to satisfy a serious auntie.",
    observations: [
      "The pastel pink walls are very modern, though they look a bit strange against the dark pine trees outside.",
      "The eclairs are lined up in the glass case like little soldiers. Very neat.",
      "A quiet spot for ladies who discuss neighborhood gossip in very soft voices over tea."
    ]
  },
  "my-little-bakery-shillong": {
    tagline: "Artisanal custom cakes ordered online. Home bakes with high-quality ingredients and real care.",
    note: "Order your birthday cakes here well in advance. Wanrilinia uses organic fruit and doesn't load them with cheap sugar.",
    observations: [
      "No physical shopfront, just a busy kitchen where the magic happens and delivery boys wait.",
      "The butter-cream is smooth and real, unlike the shiny chemical foam they use in commercial shops.",
      "The fruit cakes actually contain real fruit, which is a rare and welcome choice these days."
    ]
  },
  "legacy-the-cake-shop": {
    tagline: "Rich chocolate truffle slices in Police Bazaar. Quick sweets for busy market afternoons.",
    note: "Drop in when you have a sugar craving after bargaining for shawls. The chocolate fudge slice is rich and cheap.",
    observations: [
      "The shop is small and always smells of melted chocolate and vanilla essence.",
      "The chocolate truffle cake is dense enough to be used as a paperweight, but very delicious.",
      "The service is quick. You pay, you eat, you go back to the crowd."
    ]
  },
  "savor-by-dee-the-artisanal-bakery": {
    tagline: "Laminated butter croissants and artisanal sourdough in Lawsohtun. Gourmet baking in the quiet hills.",
    note: "Get there before 10 AM on Saturday if you want the almond croissants. They sell out faster than local taxi seats.",
    observations: [
      "The croissants have actual layers that flake when you bite. A proper French technique in Laban.",
      "The sourdough loaves are hard and crusty. My husband says they are too tough, but I say they have character.",
      "A small boutique space that smells of high-quality butter and slow fermentation."
    ]
  },
  "the-eee-cee-bakery": {
    tagline: "Nostalgic cream buns and chicken patties since 1964. A Jail Road institution that everyone knows.",
    note: "Order the signature cream bun. The cream is sweet and the bun is soft. It has tasted exactly the same for forty years.",
    observations: [
      "The display cases look like they belong in a museum of local baking history. Nostalgia is the main ingredient.",
      "The chicken patties are flaky and spicy, though you might find more potato than chicken inside. Classic Shillong style.",
      "Almost every adult in Shillong has a memory of eating here after school."
    ]
  },
  "biteclub-bakery": {
    tagline: "Vegan brownies and gluten-free cakes in Laitumkhrah. For people with complicated diets.",
    note: "Order the gluten-free double chocolate muffin. It's surprisingly rich, considering it has no gluten, eggs, or fun in it.",
    observations: [
      "The crowd is very health-conscious, wearing yoga pants and drinking unsweetened almond milk.",
      "The bakery is clean and modern, matching the minimalist diets of its customers.",
      "The banana bread is dense and sweet, sweetened with real honey instead of white sugar."
    ]
  },
  "samanbha-bakery": {
    tagline: "Cheap cream rolls and soft buns. A simple local bakery where you get exactly what you pay for.",
    note: "Buy a packet of the butter buns. They are simple, fresh, and perfect for breakfast with a cup of hot milk tea.",
    observations: [
      "No fancy glass cases, just cardboard boxes full of fresh buns and biscuits.",
      "The cream rolls are long and filled with sweet white frosting. Youthful happiness for ten rupees.",
      "The staff is friendly and remembers your face if you visit twice."
    ]
  },
  "s-k-bakery": {
    tagline: "Timeless butter cookies opposite the Beat House. Classic tea-time companions for generations.",
    note: "Get a packet of their salt-butter cookies. They have that perfect balance of salt and crunch that makes you drink three cups of tea.",
    observations: [
      "The cookies are sold in simple clear plastic bags tied with a yellow rubber band. Authentic.",
      "The shop has been here for ages, watching the Laitumkhrah traffic grow from horse-carts to SUVs.",
      "The smell of baking butter wafts across the road, tempting students skipping classes."
    ]
  },
  "trifle-patisserie": {
    tagline: "Gourmet eggless pastries in the Starline building. 100% vegetarian sweets for selective tables.",
    note: "The chocolate mud cake is exceptionally rich. You won't miss the eggs at all, believe me.",
    observations: [
      "Located inside the hotel lobby, it is quiet and feels very safe from the Police Bazaar noise.",
      "The pastries are decorated with neat chocolate fans and gold leaf. Very fancy.",
      "A favorite for local vegetarian families who trust the kitchen completely."
    ]
  },
  "yummy-cakes": {
    tagline: "Affordable chocolate fudge cakes in Garikhana. Simple sweets for local celebrations.",
    note: "Perfect for a quick, cheap birthday cake. They write your name in very neat pink icing while you wait.",
    observations: [
      "The shop is busy, serving the Garikhana transport crowd with quick snacks and tea cakes.",
      "The vanilla buns are soft and sweet, the kind of comfort food that doesn't ask you to think.",
      "The prices are the best part of the menu. Shillong prices as they used to be."
    ]
  },
  "the-cake-craving-shillong": {
    tagline: "Designer wedding cakes from Lower Mawprem. Tiers of sugar and art for big family days.",
    note: "Book your wedding tiers here. The sugar flowers look so real you'd think they were plucked from a Ward's Lake garden.",
    observations: [
      "The kitchen smells of vanilla extract and warm sugar, a sweet pocket in the middle of Garikhana noise.",
      "The photo album of past wedding cakes is thicker than the local telephone directory.",
      "A lot of serious conversations here about ribbons, icing colors, and guest lists."
    ]
  },
  "gateau-bakes-and-more": {
    tagline: "European pastries and multi-grain loaves. A clean, modern bakeshop franchise in Police Bazaar.",
    note: "Try the almond biscotti. It is hard as local pine wood, which is exactly how a biscotti should be for dipping in espresso.",
    observations: [
      "The glass cases are spotless, showing off croissants and tarts like jewelry.",
      "The multi-grain bread is heavy and feels healthy, though I still prefer white flour myself.",
      "A popular stop for office workers buying a quick treat for their desks."
    ]
  },
  "robert-junior-patisserie": {
    tagline: "Gourmet French macarons and choux buns in Demthring. High-end baking that feels very noble.",
    note: "Get a box of the chocolate macarons. The shell has a proper crunch, and the ganache is smooth as mountain mist.",
    observations: [
      "The choux buns are filled with fresh vanilla cream that squeezes out when you bite. Eat with care.",
      "The macarons are arranged in perfect neat rows, looking like colorful buttons on a fancy coat.",
      "A very classy shop that brings a touch of Parisian style to Nongthymmai's quiet lanes."
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
  id?: string;
}): LabetCommentary {
  const name = cafe.name;
  const area = cafe.neighborhood || "Shillong";
  const isKhasi = !!cafe.khasi_food_available;
  const tags = cafe.vibeTags || [];

  // Deterministic seed based on the cafe name/id to ensure consistent descriptions across re-renders
  const seedStr = cafe.id || name || "";
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed += seedStr.charCodeAt(i);
  }
  
  const pick = <T>(arr: T[]): T => {
    return arr[seed % arr.length];
  };

  const pickMulti = <T>(arr: T[], count: number): T[] => {
    const res: T[] = [];
    for (let i = 0; i < count; i++) {
      const idx = (seed + i * 7) % arr.length;
      const val = arr[idx];
      if (!res.includes(val)) {
        res.push(val);
      }
    }
    return res.slice(0, count);
  };

  let tagline = "";
  let note = "";
  let obs: string[] = [];

  if (isKhasi) {
    const taglines = [
      `Honest ${name} kitchen in ${area}. No pretentious microgreens or imported plates, just food that respects the hills.`,
      `Real firewood smoke and red hill rice at ${name}. A humble kitchen that doesn't care about city fashion.`,
      `${name} serves genuine Khasi recipes in ${area}. The Jadoh pot here has seen generations of hungry locals.`
    ];
    const notes = [
      "Go with an open stomach and zero expectations of speed. Good things brew slowly.",
      "The Dohneiiong is slow-cooked, like any good life decision. Sit down and wait with humility.",
      "Grab a bench, eat with your hands, and don't complain about the queue. It's the local way."
    ];
    const observations = [
      `The Jadoh pot here has seen more local political debates than the Shillong municipal office.`,
      "Simple tables, clean water, and rich ginger aromas. The way Khasi dining is meant to be.",
      "You might have to share a bench with a stranger. Say hello, but don't ask about their salary.",
      "The black sesame gravy is dark as a winter night and twice as comforting.",
      "The ka duitara player tunes his strings with the same patience the chef cooks the pork stock."
    ];

    tagline = pick(taglines);
    note = pick(notes);
    obs = pickMulti(observations, 3);
  } else if (tags.some(t => /music|band|stage|live/i.test(t))) {
    const taglines = [
      `A musical escape in ${area} where people come to pretend they understand jazz chords and deep-cut acoustic poetry.`,
      `Guitars on the walls and songwriters on the stage at ${name}. Vintage rock beats for weary travelers.`,
      `Warm wood fires and acoustic sets at ${name} in ${area}. Keeping independent music alive in the hills.`
    ];
    const notes = [
      "Bring a warm sweater and steady hands. The guitar notes fly fast here.",
      "Order the ginger tea and listen to the cover bands. Some songs are old friends.",
      "Best visited in the evening when the hearth is lit. Let the acoustic chords settle your thoughts."
    ];
    const observations = [
      `The local songwriters here all sound like they've read too much Keats.`,
      "Guitars hanging on the brickwork. It gives the place a rugged feel, like my grandfather's garden shed.",
      "If they play Classic Rock, look serious and nod. It's the local etiquette.",
      "People sitting near the stage look very poetic, usually writing in leather notebooks.",
      "The rhythm here is slow, matching the rain drumming on the tin sheets outside."
    ];

    tagline = pick(taglines);
    note = pick(notes);
    obs = pickMulti(observations, 3);
  } else if (tags.some(t => /premium|luxury|fine/i.test(t))) {
    const taglines = [
      `Premium atmosphere in ${area}. Pricey coffee and fancy napkins, but at least the scenery is handsome.`,
      `Fancy glass decor and crystal chandeliers at ${name}. A place to pretend your life is perfectly sorted.`,
      `Elegant tables and velvet seating in ${area}. Highly sophisticated, though your wallet will feel the cold.`
    ];
    const notes = [
      "Perfect for when you want to impress someone with your sophisticated tastes. Watch your step, and your wallet.",
      "Bring your best coat. The lighting is dimmed so you look rich, but the mountain wind is still cold.",
      "Order the finest pastry and eat it slowly. Luxury is a mountain virtue when you can afford it."
    ];
    const observations = [
      "A place where the chairs are too comfy and the waiters speak english cleaner than mine.",
      "The lighting is dimmed so much you can barely see the prices. That is a strategic design choice, dear.",
      "People sitting here whisper like they are discussing international coffee trade agreements.",
      "Do not touch the velvet chairs with dirty hands, or the hosts will look at you with quiet tragedy.",
      "The rosewater sponge cake is lighter than the Shillong fog."
    ];

    tagline = pick(taglines);
    note = pick(notes);
    obs = pickMulti(observations, 3);
  } else {
    // Default / Cozy Cafe
    const taglines = [
      `A cozy slice in the heart of ${area}. Good coffee, decent tables, and enough mist outside the window to justify your poetic moods.`,
      `A quiet wooden refuge in ${area} to escape the market crowd. Simple brews for busy minds.`,
      `Warm lights, cedar countertops, and soft chatter at ${name}. A gentle shelter from the Shillong winter.`
    ];
    const notes = [
      "Grab a corner table and ignore your notifications. The mountains are waiting.",
      "Best visited slowly on a rainy afternoon. Let the steam from your cup warm your hands.",
      "Bring a book you actually intend to read. The quiet here is too good to waste on your phone."
    ];
    const observations = [
      "A quiet refuge. Perfect for writing angry emails you will fortunately never send.",
      "The baristas work with a quiet mountain pride. Respect their craft and tip them nicely.",
      `Overheard a student explaining the meaning of life here. I told him to eat his croissant first.`,
      "The timber walls smell like fresh pine and old secrets.",
      "More books on the shelf than customers actually reading them.",
      "A great spot to watch the early morning fog lift from the pine trees."
    ];

    tagline = pick(taglines);
    note = pick(notes);
    obs = pickMulti(observations, 3);
  }

  return {
    tagline,
    note,
    observations: obs
  };
}

export function enrichCafeWithLabet(cafe: any): any {
  // If the cafe already has Kong Labet fields defined in the database, preserve them!
  if (cafe.kong_labet_tagline || cafe.kong_labet_note) {
    return {
      kong_labet_observations: [],
      ...cafe
    };
  }

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
