// Quick self-checks for the Google-label logic. Run: npx tsx scripts/checks.ts
import assert from "node:assert";
import { schemaType, buildOpeningHours } from "../src/utils/cafeSchema";
import { describePhotos } from "../src/utils/photos";

assert.strictEqual(schemaType({ name: "Jiva Resort Cherrapunjee", types: ["lodging", "restaurant"] }), "Resort");
assert.strictEqual(schemaType({ name: "Kynjai Cloud Kitchen", types: ["restaurant", "food"] }), "Restaurant");
assert.strictEqual(schemaType({ name: "Eden Restaurant" }), "Restaurant");            // no type data: name decides
assert.strictEqual(schemaType({ name: "Roma Eatery" }), "Restaurant");
assert.strictEqual(schemaType({ name: "BLACKSTONE GRILL" }), "Restaurant");
assert.strictEqual(schemaType({ name: "The Loft - Cafe & Restaurant" }), "CafeOrCoffeeShop"); // also a café
assert.strictEqual(schemaType({ name: "Cherry Bean Cafe", types: ["cafe", "restaurant"] }), "CafeOrCoffeeShop");
assert.strictEqual(schemaType({ name: "Suburb" }), "CafeOrCoffeeShop");
assert.strictEqual(schemaType({ name: "Saaz Bakery & Confectionery" }), "CafeOrCoffeeShop");

const hours = buildOpeningHours(["Monday: 9:30 AM – 9:30 PM", "Tuesday: Closed"]);
assert.deepStrictEqual(hours?.map((h: any) => [h.opens, h.closes]), [["09:30", "21:30"]]);
assert.strictEqual(buildOpeningHours(["10:30 AM — 8:30 PM"]), undefined);               // no weekday: never sent to Google
// Photo tab wording: stock vs real vs mixed vs none
const STOCK = "https://images.unsplash.com/photo-1?w=600";
const REAL = "/cafe-photos/you-and-i-arts-cafe/card-0.jpg";
assert.strictEqual(describePhotos([], "X").kind, "none");
assert.strictEqual(describePhotos([STOCK], "X").kind, "stock");
assert.strictEqual(describePhotos([REAL, REAL], "X").kind, "real");
assert.strictEqual(describePhotos([REAL, STOCK], "X").kind, "mixed");
assert.strictEqual(describePhotos([STOCK], "X").label(STOCK, 0), "Stock photo 1");
assert.strictEqual(describePhotos([REAL], "X").label(REAL, 0), "Photo 1");
assert.strictEqual(describePhotos([REAL], "Cafe Sola").heading, "Photos of Cafe Sola");
assert.match(describePhotos([STOCK], "X").caption, /do not show this caf/);
assert.doesNotMatch(describePhotos([REAL], "X").caption, /not authentic|stock/i);
assert.doesNotMatch(describePhotos([STOCK], "X").heading, /verified|local guides/i);

console.log("all checks pass");
