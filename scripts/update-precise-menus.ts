import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "src", "cafes_db.json");
const PHOTOS_ROOT = path.join(process.cwd(), "public", "cafe-photos");

interface MenuItem {
  name: string;
  description: string;
  price: string;
  image: string;
}

function pickLocalPhoto(cafeId: string, idx: number): string {
  const dir = path.join(PHOTOS_ROOT, cafeId);
  if (fs.existsSync(dir)) {
    const photos = fs.readdirSync(dir).filter((f) => f.startsWith("photo-") && f.endsWith(".jpg"));
    if (photos.length > 0) {
      const pick = photos[idx % photos.length];
      return `/cafe-photos/${cafeId}/${pick}`;
    }
  }
  // Generic fallback if local photo is not found
  const fallbacks = [
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=600"
  ];
  return fallbacks[idx % fallbacks.length];
}

const MENUS: Record<string, Omit<MenuItem, "image">[]> = {
  "dylans-cafe": [
    { name: "Crunchy Chicken Burger", price: "₹319", description: "Crispy fried chicken breast fillet with fresh lettuce and mayo in a soft bun." },
    { name: "Chicken Classic Club Sandwich", price: "₹319", description: "Triple decker sandwich with grilled chicken, crisp bacon, fried egg, lettuce, tomato, and cheese." },
    { name: "The Dylans Jawbreaker", price: "₹429", description: "Massive double-patty chicken burger with melted cheese, fried egg, onion rings, and secret sauce." },
    { name: "Chicken Classic Shillong Noodles", price: "₹249", description: "Stir-fried noodles with shredded chicken and fresh local greens." },
    { name: "Chicken Perfecto Pasta", price: "₹279", description: "Creamy white sauce pasta tossed with chicken and Italian herbs." },
    { name: "Veg Perfecto Pasta", price: "₹329", description: "Rich penne pasta tossed with fresh garden vegetables in a savory cream sauce." },
    { name: "Peri Peri Chicken Steak (2 Pcs)", price: "₹349", description: "Two succulent chicken breasts grilled in spicy peri-peri marinade, served with mashed potato and jus." },
    { name: "Fiery Hot Chicken Wings", price: "₹259", description: "Crispy chicken wings tossed in extra-spicy chili-garlic glaze, served with dip." },
    { name: "Chicken Classic Nachos", price: "₹299", description: "Crispy tortilla chips topped with melted cheese, chicken bits, salsa, and jalapenos." },
    { name: "The Dylans Hot Chocolate", price: "₹199", description: "Rich, velvety classic hot chocolate topped with marshmallows." },
    { name: "Classic Mojito", price: "MRP", description: "Refreshing blend of fresh mint, lime juice, sugar, and club soda." },
    { name: "Minty Lemon Iced Tea", price: "MRP", description: "Chilled brewed black tea flavored with lemon and fresh mint leaves." },
    { name: "Sangria", price: "MRP", description: "Classic refreshing beverage with mixed fruit slices." },
    { name: "Chocolate Molten Cake", price: "₹199", description: "Warm chocolate cake with a gooey, molten chocolate center." },
    { name: "Banana Split Sundae", price: "₹269", description: "Classic dessert with a split banana, scoops of vanilla, chocolate, and strawberry ice cream, topped with syrups." },
    { name: "Classic Fluffy Pancakes", price: "₹269", description: "Stack of fluffy buttermilk pancakes served with butter and maple syrup." }
  ],
  "ml-05-cafe": [
    { name: "Wai Wai Thukpa", price: "MRP", description: "Classic spiced noodle soup with vegetables and local seasonings." },
    { name: "Onion Bhajia with Chai", price: "MRP", description: "Crispy onion fritters served hot with a cup of spiced masala chai." },
    { name: "Cheesy Garlic Bread", price: "₹189", description: "Toasted bread topped with garlic butter, herbs, and melted mozzarella cheese." },
    { name: "Chilly Pork", price: "MRP", description: "Spicy wok-tossed pork with green chilies, onions, and local spices." },
    { name: "Chicken Alfredo Pasta", price: "MRP", description: "Penne pasta cooked in a rich, creamy Alfredo sauce with tender chicken pieces." },
    { name: "Pizza (various toppings)", price: "MRP", description: "Freshly baked thin-crust pizza with your choice of veggie or meat toppings." },
    { name: "Chilly Garlic Noodles", price: "MRP", description: "Stir-fried noodles with a spicy garlic glaze and chopped vegetables." },
    { name: "Espresso Coffee", price: "₹130", description: "Rich and bold single shot of high-altitude roasted coffee beans." },
    { name: "Diet Coke (250ml)", price: "₹100", description: "Chilled 250ml can of sugar-free Coca-Cola." },
    { name: "Aerated Beverage (600ml)", price: "₹120", description: "Refreshing carbonated soft drink (600ml bottle)." },
    { name: "Chocolate Molten Cake", price: "₹249", description: "Decadent warm chocolate cake with a rich molten center." },
    { name: "Pork Ribs Caramelized (Specialty)", price: "MRP", description: "Tender slow-roasted pork ribs glazed in a sweet caramelized sauce." }
  ],
  "cafe-shillong": [
    { name: "Khao Suey", price: "₹520", description: "Signature Burmese noodle dish in a rich, spiced coconut milk broth, served with assorted condiments." },
    { name: "Chicken Bastenga (NE Specialty)", price: "₹450", description: "A traditional Northeast specialty featuring tender chicken cooked with fermented bamboo shoot (bastenga) and local green chilies." },
    { name: "Rice Stick Noodles with Diced Pork", price: "₹520", description: "Flat rice noodles tossed with spicy diced pork belly and seasonal vegetables." },
    { name: "Chicken Thukpa", price: "₹320", description: "Nourishing Tibetan style noodle soup with tender chicken slices and greens." },
    { name: "Shillong Fried Rice + Chilly Chicken", price: "₹410", description: "Savory local-style fried rice paired with spicy, wok-tossed chilly chicken." },
    { name: "Shillong Noodles + Chilly Chicken", price: "₹410", description: "Wok-tossed local noodles served alongside dry chilly chicken." },
    { name: "Smoked Pork Hakka Noodles", price: "₹450", description: "Stir-fried noodles tossed with house-smoked pork slices, cabbage, carrots, and light soy sauce." },
    { name: "Shillong Veg Noodles", price: "₹370", description: "Simple, delicious stir-fried noodles with farm-fresh local veggies." },
    { name: "Chicken Momo with Soup", price: "₹320", description: "Steamed chicken dumplings served with a clear, comforting chicken broth and hot sesame-tomato chutney." },
    { name: "Beef Momo with Soup", price: "₹340", description: "Steamed beef dumplings served with hot chili sauce and a side of clear broth." },
    { name: "Veg Momo with Soup", price: "₹290", description: "Freshly steamed vegetable dumplings with a comforting vegetable broth." },
    { name: "Chicken Burger", price: "₹370", description: "Juicy chicken patty with lettuce, tomatoes, and mayo in a toasted bun." },
    { name: "Spaghetti Bolognese", price: "₹430", description: "Classic spaghetti topped with rich, slow-simmered meat sauce and parmesan." },
    { name: "Penne Arrabiata", price: "₹430", description: "Penne pasta in a spicy tomato sauce with garlic, chili, and olive oil." },
    { name: "French Fries", price: "₹200", description: "Crispy golden potato fries served with tomato ketchup." }
  ],
  "trattoria-shillong-pb": [
    { name: "Jadoh (pork rice in broth)", price: "₹150–₹200", description: "The ultimate Khasi staple: short-grain red rice cooked with pork stock, local ginger, and onions." },
    { name: "Dohkhlieh (pork salad)", price: "₹150–₹200", description: "Traditional Khasi salad made of minced pork, onions, ginger, and local green chilies." },
    { name: "Pork Combo Meal", price: "₹200–₹400", description: "A comprehensive traditional plate featuring Jadoh, pork curry, salad, and spicy chutney." },
    { name: "Smoked Meat Curry", price: "₹150–₹200", description: "Fragrant local curry made with house-smoked pork or beef, cooked with local wild herbs." },
    { name: "Rice + Salad + Meat Curry + Chutney + Veg", price: "₹200–₹300", description: "A filling daily platter of white rice served with meat curry, salad, chutney, and local veggies." }
  ],
  "city-hut-family-dhaba": [
    { name: "Roast Pepper Chicken", price: "MRP", description: "Tender roasted chicken coated in coarse black pepper and savory house spices." },
    { name: "Smoked Roast Chicken", price: "MRP", description: "Juicy chicken roasted to perfection with a deep hickory smoke flavor." },
    { name: "Mexican Spice Grilled Chicken", price: "MRP", description: "Grilled chicken breast rubbed with dynamic Mexican chili spices." },
    { name: "Lemongrass Grilled Chicken", price: "MRP", description: "Aromatic grilled chicken marinated with fresh lemongrass, ginger, and lime." },
    { name: "Peri Peri Grilled Fish", price: "MRP", description: "Flaky fish fillet grilled in a hot and fiery peri-peri sauce." },
    { name: "Cajun Spiced Grilled Chicken", price: "MRP", description: "Zesty chicken breast seasoned with rustic Louisiana-style Cajun spices." },
    { name: "Tandoori Chicken Full", price: "₹748", description: "Full portion of traditional yogurt-and-spice marinated chicken roasted in a clay oven." },
    { name: "Tandoori Chicken Half", price: "₹552", description: "Half portion of classic clay-oven roasted tandoori chicken." },
    { name: "Garlic Naan", price: "₹104", description: "Leavened flatbread brushed with garlic butter and herbs." },
    { name: "Chicken Butter Masala Boneless", price: "₹489", description: "Tender boneless chicken pieces cooked in a rich, buttery tomato gravy." },
    { name: "Chicken Biryani", price: "₹518", description: "Aromatic basmati rice layered with spiced chicken, saffron, and fresh herbs." },
    { name: "Dal Makhani", price: "MRP", description: "Slow-cooked black lentils and kidney beans in a creamy, buttery sauce." },
    { name: "Paneer Butter Masala", price: "MRP", description: "Cottage cheese cubes cooked in a sweet and spicy tomato cream gravy." },
    { name: "Fish Thali", price: "₹250–₹300", description: "Traditional platter served with steamed rice, fish curry, dal, and vegetables." },
    { name: "Chicken Thali", price: "₹250–₹300", description: "A full thali featuring rice, spiced chicken curry, dal, salad, and seasonal sides." },
    { name: "Veg Thali", price: "₹250–₹300", description: "A wholesome vegetarian thali with rice, paneer/veg curry, dal, and local chutney." },
    { name: "Chicken Momo (Steam)", price: "₹299", description: "Steamed chicken dumplings served with hot tomato-sesame chutney." },
    { name: "Chicken Hakka Noodles", price: "₹299", description: "Wok-fried noodles tossed with chicken strips and mixed vegetables." },
    { name: "Veg Fried Rice", price: "₹265", description: "Fluffy stir-fried rice loaded with finely chopped vegetables." },
    { name: "Cheese Stuffed Fried Mushroom", price: "MRP", description: "Crispy button mushrooms stuffed with molten cheese and herbs." },
    { name: "Masala Papad", price: "₹65", description: "Crispy papadum topped with spiced onions, tomatoes, and cilantro." },
    { name: "Pineapple Raita", price: "₹180", description: "Cool yogurt mixed with sweet pineapple chunks and roasted cumin." }
  ],
  "lamee-restaurant": [
    { name: "Momos (8 pcs)", price: "₹195–₹220", description: "Eight pieces of steamed vegetable or chicken dumplings, served with hot soup." },
    { name: "Burnt Garlic Fried Rice", price: "MRP", description: "Fluffy fried rice tossed with crispy golden burnt garlic and spring onions." },
    { name: "Chicken with Bamboo Shoots", price: "MRP", description: "Tender chicken pieces simmered with sliced bamboo shoots in a savory gravy." },
    { name: "Chicken Hot Garlic Sauce", price: "MRP", description: "Wok-tossed chicken cooked in a spicy, pungent hot garlic gravy." },
    { name: "Wonton Soup", price: "MRP", description: "Comforting clear broth with delicate chicken or veg wontons and greens." },
    { name: "Finger Chicken Thai Style", price: "MRP", description: "Crispy deep-fried chicken fingers tossed in a sweet-and-spicy Thai chili sauce." },
    { name: "Tom Yum Soup", price: "MRP", description: "Classic spicy and sour Thai soup with lemongrass, galangal, lime leaves, and mushrooms." },
    { name: "Cheese Naan", price: "MRP", description: "Leavened oven-baked flatbread stuffed with melted processed cheese." },
    { name: "Paneer Dishes (various)", price: "MRP", description: "Rich and creamy cottage cheese curries cooked in your style of choice." },
    { name: "Tawa Roti", price: "MRP", description: "Simple, flat whole-wheat griddle bread cooked fresh." },
    { name: "Various Veg Chinese Dishes", price: "MRP", description: "Stir-fried vegetables cooked in choice of black bean, Schezwan, or sweet & sour sauce." },
    { name: "Paneer North Indian Dishes", price: "MRP", description: "Assorted classic North Indian cottage cheese curries like Kadai Paneer or Shahi Paneer." },
    { name: "Fresh Fruit Salad", price: "MRP", description: "A bowl of seasonal fresh fruits cut and tossed with a hint of honey." }
  ],
  "munchies-shillong": [
    { name: "Shawarma (Pan-fried)", price: "MRP", description: "Spiced chicken slices wrapped in pita bread with garlic sauce and pickles." },
    { name: "German Sausages", price: "MRP", description: "Grilled pan-seared juicy sausages served with mustard and fries." },
    { name: "Spaghetti Carbonara", price: "MRP", description: "Spaghetti tossed in a rich sauce of eggs, cheese, cured meats, and black pepper." },
    { name: "Spaghetti Bolognese", price: "MRP", description: "Spaghetti with a savory slow-cooked minced meat and tomato sauce." },
    { name: "Chicken Pasta in White Sauce (Penne)", price: "₹270", description: "Penne pasta and tender chicken tossed in a rich, creamy white cheese sauce." },
    { name: "Italian Thin Crust Pizza", price: "MRP", description: "Crispy, hand-stretched thin crust pizza topped with fresh sauce and cheese." },
    { name: "Jucy Lucy Burger (Cheese Burst)", price: "MRP", description: "Signature burger featuring a beef or chicken patty stuffed with molten cheese." },
    { name: "Roast Beef / Chicken Pattie Burger", price: "MRP", description: "Classic burger with a choice of roasted beef slice or spiced chicken patty." },
    { name: "Smoothies (various)", price: "MRP", description: "Creamy blended beverages made with fresh yogurt and seasonal fruits." },
    { name: "Hot Beverages / Chai", price: "MRP", description: "Freshly brewed hot milk tea or coffee to warm you up." }
  ],
  "little-chef-cafe": [
    { name: "Brownie (Signature)", price: "MRP", description: "Famous warm fudgy chocolate brownie with a rich crust." },
    { name: "Black Forest Cake", price: "MRP", description: "Classic chocolate sponge cake layered with whipped cream and cherries." },
    { name: "Croissants", price: "MRP", description: "Flaky, buttery crescent-shaped French pastry baked fresh." },
    { name: "Pepperoni Pizza", price: "MRP", description: "Classic thin-crust pizza topped with spicy pepperoni slices and mozzarella." },
    { name: "Continental Mains (various)", price: "MRP", description: "A choice of grilled steaks, baked pastas, or roasted vegetables." },
    { name: "Tangdi Kabab", price: "₹150", description: "Chicken drumsticks marinated in yogurt and spices, grilled to perfection." },
    { name: "Veg Seekh Kabab", price: "₹200", description: "Spiced minced vegetable skewers roasted in a clay oven." },
    { name: "Paneer Tikka", price: "₹250", description: "Cottage cheese chunks marinated in spices and grilled on skewers." },
    { name: "Boondi Raita", price: "₹90", description: "Yogurt mixed with tiny fried chickpea flour balls (boondi) and spices." },
    { name: "Irish Coffee (Signature)", price: "MRP", description: "Signature cocktail of hot coffee, Irish whiskey, and sugar, topped with thick cream." },
    { name: "Innovative Beverages Menu", price: "MRP", description: "Curated selection of modern mocktails, herbal teas, and specialty iced brews." }
  ],
  "woodstock-cafe": [
    { name: "Beer Battered Chicken Popcorn", price: "₹149", description: "Crispy, bite-sized chicken nuggets in a light beer batter." },
    { name: "Chicken Pakora", price: "₹229", description: "Spiced chicken fritters deep-fried till golden brown." },
    { name: "Mix Veg Pakoda", price: "₹149", description: "Deep-fried spiced fritters made with assorted fresh vegetables." },
    { name: "Great Cheesy Fries", price: "₹179", description: "Golden French fries smothered in warm, melted cheese sauce." },
    { name: "Hand Tossed Herby Potato Wedges", price: "₹199", description: "Thick-cut potato wedges seasoned with garlic, rosemary, and local mountain herbs." },
    { name: "Tom Yum Soup Chicken", price: "₹149", description: "Spicy and sour Thai clear soup with chicken, mushrooms, and lemongrass." },
    { name: "Wonton Soup Chicken", price: "₹149", description: "Clear, comforting soup with chicken wontons and fresh bok choy." },
    { name: "Farm House Momo Chicken", price: "₹199", description: "Steamed chicken momos served with a rustic home-style spicy sauce." },
    { name: "Pav Bhaji Supreme", price: "₹149", description: "Spiced mixed vegetable mash served with buttery toasted buns." },
    { name: "Continental Mains (various)", price: "MRP", description: "A select choice of classic continental dishes including steaks and pastas." }
  ],
  "the-living-roof": [
    { name: "Light café meals & snacks", price: "MRP", description: "Healthy sandwiches, loaded wraps, and fresh salads." },
    { name: "Coffee & hot beverages", price: "MRP", description: "Organically brewed local coffee, custom lattes, and hot green teas." },
    { name: "Continental dishes", price: "MRP", description: "Curated selection of pastas, risottos, and baked specialties." }
  ],
  "madras-cafe": [
    { name: "Dosa Tabri Creap (Signature)", price: "MRP", description: "Crispy South Indian fermented crepe served with sambar and fresh coconut chutney." },
    { name: "Filter Coffee (Signature)", price: "MRP", description: "Traditional chicory-infused South Indian filter coffee brewed with hot milk." },
    { name: "South Indian Thali", price: "MRP", description: "Platter featuring rice, sambar, rasam, kootu, poriyal, papad, and buttermilk." },
    { name: "Idli, Vada, Sambar", price: "MRP", description: "Steamed rice cakes and crispy lentil donuts served with piping hot sambar." },
    { name: "Continental Starters (various)", price: "MRP", description: "Assortment of finger foods like french fries, cheese balls, and garlic toast." },
    { name: "Continental Mains", price: "MRP", description: "Choice of vegetarian pastas and baked continental mains." },
    { name: "Chinese Noodles (various)", price: "MRP", description: "Stir-fried noodles cooked in Indo-Chinese style with choice of vegetables." },
    { name: "Fried Rice", price: "MRP", description: "Wok-tossed fried rice seasoned with soy sauce and green onions." }
  ],
  "heritage-club-tripura-castle": [
    { name: "Hazelnut Coffee (Signature)", price: "MRP", description: "Smooth espresso infused with toasted hazelnut flavor, topped with steamed milk." },
    { name: "Chicken Momos (Steamed)", price: "MRP", description: "Soft steamed dumplings stuffed with spiced minced chicken, served with chili dip." },
    { name: "Shillong Noodles", price: "MRP", description: "Specialty stir-fried local noodles tossed with shredded egg and fresh vegetables." },
    { name: "Thukpa", price: "MRP", description: "Hearty noodle soup with fresh greens and choice of meats in a flavorful broth." },
    { name: "Steaks", price: "MRP", description: "Premium sizzler plates featuring grilled chicken, beef, or pork steaks with sides." },
    { name: "Various Asian small bites", price: "MRP", description: "Assorted spring rolls, satays, and crispy dumplings." },
    { name: "Finger sandwiches & snacks", price: "MRP", description: "Club sandwiches, finger snacks, and fries served with dips." }
  ]
};

function main() {
  console.log("=== Updating Cafe Database Menus ===");
  if (!fs.existsSync(DB_PATH)) {
    console.error(`Database file not found at ${DB_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(DB_PATH, "utf-8");
  const cafes = JSON.parse(raw);

  let updatedCount = 0;
  for (const cafe of cafes) {
    const targetMenu = MENUS[cafe.id];
    if (targetMenu) {
      console.log(`Updating menu for: ${cafe.name} (${cafe.id})`);
      cafe.mustTry = targetMenu.map((item, idx) => ({
        name: item.name,
        price: item.price,
        description: item.description,
        image: pickLocalPhoto(cafe.id, idx)
      }));
      updatedCount++;
    }
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(cafes, null, 2), "utf-8");
  console.log(`\nSuccessfully updated ${updatedCount} cafes in ${DB_PATH}`);
}

main();
