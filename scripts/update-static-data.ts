import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "src", "data.ts");
const DB_PATH = path.join(process.cwd(), "src", "cafes_db.json");

function main() {
  console.log("=== Syncing Database Menus to Static data.ts ===");
  if (!fs.existsSync(DATA_PATH) || !fs.existsSync(DB_PATH)) {
    console.error("Missing data.ts or cafes_db.json");
    process.exit(1);
  }

  const cafesDb = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  let dataContent = fs.readFileSync(DATA_PATH, "utf-8");

  const targetIds = ["cafe-shillong", "dylans-cafe", "ml-05-cafe"];

  for (const id of targetIds) {
    const cafe = cafesDb.find((c: any) => c.id === id);
    if (!cafe || !cafe.mustTry) continue;

    // Find the cafe entry block in data.ts
    // We search for `id: "cafe-shillong"` or similar
    const idPatternDouble = `id: "${id}"`;
    const idPatternSingle = `id: '${id}'`;
    let idIndex = dataContent.indexOf(idPatternDouble);
    if (idIndex === -1) {
      idIndex = dataContent.indexOf(idPatternSingle);
    }

    if (idIndex === -1) {
      console.warn(`Could not find café with id ${id} in data.ts`);
      continue;
    }

    // Find `mustTry:` after the idIndex
    const mustTryKeyword = "mustTry:";
    const mustTryIndex = dataContent.indexOf(mustTryKeyword, idIndex);
    if (mustTryIndex === -1) {
      console.warn(`Could not find mustTry for ${id} in data.ts`);
      continue;
    }

    // Find the opening bracket `[`
    const openBracketIndex = dataContent.indexOf("[", mustTryIndex);
    if (openBracketIndex === -1) {
      console.warn(`Could not find opening bracket of mustTry for ${id} in data.ts`);
      continue;
    }

    // Find the matching closing bracket `]`
    let depth = 1;
    let closeBracketIndex = -1;
    for (let i = openBracketIndex + 1; i < dataContent.length; i++) {
      if (dataContent[i] === "[") depth++;
      else if (dataContent[i] === "]") depth--;

      if (depth === 0) {
        closeBracketIndex = i;
        break;
      }
    }

    if (closeBracketIndex === -1) {
      console.warn(`Could not find matching closing bracket for ${id} in data.ts`);
      continue;
    }

    // Format the new mustTry array in TypeScript syntax
    const formattedMustTry = "mustTry: [\n" + cafe.mustTry.map((item: any) => {
      return `      {
        name: ${JSON.stringify(item.name)},
        description: ${JSON.stringify(item.description)},
        price: ${JSON.stringify(item.price)},
        image: ${JSON.stringify(item.image)}
      }`;
    }).join(",\n") + "\n    ]";

    // Replace the old mustTry section with the new one
    dataContent = dataContent.slice(0, mustTryIndex) + formattedMustTry + dataContent.slice(closeBracketIndex + 1);
    console.log(`Synced static mustTry list for ${id}`);
  }

  fs.writeFileSync(DATA_PATH, dataContent, "utf-8");
  console.log(`\nSuccessfully updated static data in ${DATA_PATH}`);
}

main();
