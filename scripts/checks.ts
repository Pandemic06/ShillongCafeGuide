// Quick self-checks for the Google-label logic. Run: npx tsx scripts/checks.ts
import assert from "node:assert";
import { schemaType, buildOpeningHours } from "../src/utils/cafeSchema";

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
console.log("all checks pass");
