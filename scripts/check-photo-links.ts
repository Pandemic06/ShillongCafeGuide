/**
 * Lists every Unsplash stock-photo link in the site's code and data that no longer loads.
 * Run before each upload:  npm run check:photos   (exit code 1 when any link is dead)
 * Read-only: it only asks Unsplash whether each public image still exists.
 */
import fs from "fs";
import path from "path";

const ROOTS = ["src", "server.ts", "index.html"];
const LINK = new RegExp("https://images\\.unsplash\\.com/(photo-[A-Za-z0-9_-]+)", "g");
const CONCURRENCY = 8;

function filesUnder(entry: string): string[] {
  if (!fs.existsSync(entry)) return [];
  if (fs.statSync(entry).isFile()) return [entry];
  return fs.readdirSync(entry).flatMap((name) => {
    const full = path.join(entry, name);
    if (fs.statSync(full).isDirectory()) return filesUnder(full);
    return /\.(ts|tsx|json|html)$/.test(name) && !name.includes("backup") ? [full] : [];
  });
}

async function isAlive(photoId: string): Promise<boolean> {
  try {
    const res = await fetch(`https://images.unsplash.com/${photoId}?w=100`, { method: "HEAD" });
    return res.status === 200;
  } catch {
    return false; // a network problem counts as "could not confirm"
  }
}

async function main() {
  const usedIn = new Map<string, Set<string>>();
  for (const file of ROOTS.flatMap(filesUnder)) {
    for (const match of fs.readFileSync(file, "utf8").matchAll(LINK)) {
      const files = usedIn.get(match[1]) ?? new Set<string>();
      files.add(file.replace(/\\/g, "/"));
      usedIn.set(match[1], files);
    }
  }
  const ids = [...usedIn.keys()];
  const dead: string[] = [];
  for (let i = 0; i < ids.length; i += CONCURRENCY) {
    const batch = ids.slice(i, i + CONCURRENCY);
    const alive = await Promise.all(batch.map(isAlive));
    batch.forEach((id, k) => { if (!alive[k]) dead.push(id); });
  }
  console.log(`${ids.length} stock photos referenced, ${dead.length} not loading.`);
  for (const id of dead) console.log(`  ${id}  used in: ${[...(usedIn.get(id) ?? [])].join(", ")}`);
  process.exit(dead.length ? 1 : 0);
}

main();
