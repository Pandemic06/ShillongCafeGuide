/**
 * Download Google Places photo URLs to local `public/cafe-photos/`,
 * rewrite cafes_db.json to point at local paths. Idempotent — safe to rerun.
 *
 * Usage:
 *   npx tsx scripts/cache-place-photos.ts             # dry run
 *   npx tsx scripts/cache-place-photos.ts --apply     # download + write DB
 *   npx tsx scripts/cache-place-photos.ts --apply --refetch  # ignore existing files
 *
 * Local path scheme: /cafe-photos/{cafeId}/{slot}-{idx}.jpg
 *   slot ∈ {hero, card, interior, details, gallery}
 */

import fs from "fs";
import path from "path";
import https from "https";
import dotenv from "dotenv";

dotenv.config();

const APPLY = process.argv.includes("--apply");
const REFETCH = process.argv.includes("--refetch");

const ROOT = process.cwd();
const DB_PATH = path.join(ROOT, "src", "cafes_db.json");
const PHOTO_DIR_ABS = path.join(ROOT, "public", "cafe-photos");
const PUBLIC_PREFIX = "/cafe-photos";

if (!fs.existsSync(PHOTO_DIR_ABS)) fs.mkdirSync(PHOTO_DIR_ABS, { recursive: true });

interface Cafe {
  id: string;
  images: { hero?: string; card?: string; interior?: string; details?: string };
  photos?: string[];
  gallery?: string[];
  [k: string]: any;
}

function isGooglePhotoUrl(u: string | undefined): boolean {
  return !!u && u.includes("maps.googleapis.com/maps/api/place/photo");
}

function downloadFollowRedirects(url: string, dest: string, hops = 0): Promise<void> {
  return new Promise((resolve, reject) => {
    if (hops > 6) return reject(new Error("Too many redirects"));
    https
      .get(url, (res) => {
        const status = res.statusCode || 0;
        if (status >= 300 && status < 400 && res.headers.location) {
          res.resume();
          const next = res.headers.location.startsWith("http")
            ? res.headers.location
            : new URL(res.headers.location, url).toString();
          downloadFollowRedirects(next, dest, hops + 1).then(resolve, reject);
          return;
        }
        if (status !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${status} for ${url}`));
        }
        const tmp = dest + ".part";
        const file = fs.createWriteStream(tmp);
        res.pipe(file);
        file.on("finish", () => {
          file.close(() => {
            fs.renameSync(tmp, dest);
            resolve();
          });
        });
        file.on("error", (err) => {
          file.close();
          fs.unlink(tmp, () => reject(err));
        });
      })
      .on("error", reject);
  });
}

async function cacheOne(cafeId: string, slot: string, idx: number, srcUrl: string): Promise<string | null> {
  const cafeDir = path.join(PHOTO_DIR_ABS, cafeId);
  if (!fs.existsSync(cafeDir)) fs.mkdirSync(cafeDir, { recursive: true });
  const fname = `${slot}-${idx}.jpg`;
  const abs = path.join(cafeDir, fname);
  const publicPath = `${PUBLIC_PREFIX}/${cafeId}/${fname}`;
  if (fs.existsSync(abs) && !REFETCH) return publicPath;
  if (!APPLY) {
    console.log(`  [dry] would fetch ${slot}#${idx} → ${publicPath}`);
    return publicPath;
  }
  try {
    await downloadFollowRedirects(srcUrl, abs);
    const sz = fs.statSync(abs).size;
    if (sz < 1024) {
      // Tiny file → likely error page. Discard, return null so we fall back to original URL.
      fs.unlinkSync(abs);
      console.warn(`  ⚠ ${cafeId}/${fname}: only ${sz}B, discarded`);
      return null;
    }
    console.log(`  ✓ ${cafeId}/${fname} (${(sz / 1024).toFixed(0)}KB)`);
    return publicPath;
  } catch (e: any) {
    console.warn(`  ✗ ${cafeId}/${fname}: ${e.message}`);
    return null;
  }
}

async function main() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  const cafes: Cafe[] = JSON.parse(raw);
  console.log(`=== Cache Place Photos ${APPLY ? "(APPLY)" : "(DRY RUN — use --apply to write)"} ===`);
  console.log(`${cafes.length} cafes, scheme: ${PUBLIC_PREFIX}/{id}/{slot}-{idx}.jpg\n`);

  let totalRewrites = 0;
  let totalDownloads = 0;

  for (const cafe of cafes) {
    const updates: Record<string, string> = {};
    let touched = false;
    process.stdout.write(`${cafe.id}: `);

    // Slot map: each named image slot becomes one file
    const slotEntries: { slot: string; url: string | undefined }[] = [
      { slot: "hero", url: cafe.images?.hero },
      { slot: "card", url: cafe.images?.card },
      { slot: "interior", url: cafe.images?.interior },
      { slot: "details", url: cafe.images?.details },
    ];

    let any = false;
    for (const { slot, url } of slotEntries) {
      if (!isGooglePhotoUrl(url)) continue;
      any = true;
    }
    if (cafe.photos?.some(isGooglePhotoUrl)) any = true;
    if (cafe.gallery?.some(isGooglePhotoUrl)) any = true;
    if (!any) {
      console.log("no google urls, skip");
      continue;
    }
    console.log("");

    // Named slots
    for (const { slot, url } of slotEntries) {
      if (!isGooglePhotoUrl(url)) continue;
      const local = await cacheOne(cafe.id, slot, 0, url!);
      if (local) {
        updates[slot] = local;
        totalDownloads++;
      }
    }
    if (Object.keys(updates).length > 0) {
      cafe.images = { ...cafe.images, ...updates };
      touched = true;
    }

    // photos[] + gallery[]
    if (cafe.photos?.length) {
      const newPhotos: string[] = [];
      for (let i = 0; i < cafe.photos.length; i++) {
        const u = cafe.photos[i];
        if (!isGooglePhotoUrl(u)) {
          newPhotos.push(u);
          continue;
        }
        const local = await cacheOne(cafe.id, "photo", i, u);
        newPhotos.push(local || u);
        if (local) totalDownloads++;
      }
      cafe.photos = newPhotos;
      touched = true;
    }
    if (cafe.gallery?.length) {
      const newGallery: string[] = [];
      for (let i = 0; i < cafe.gallery.length; i++) {
        const u = cafe.gallery[i];
        if (!isGooglePhotoUrl(u)) {
          newGallery.push(u);
          continue;
        }
        const local = await cacheOne(cafe.id, "gallery", i, u);
        newGallery.push(local || u);
        if (local) totalDownloads++;
      }
      cafe.gallery = newGallery;
      touched = true;
    }
    if (touched) totalRewrites++;
  }

  console.log(`\n--- Summary ---`);
  console.log(`Cafes rewritten: ${totalRewrites}`);
  console.log(`Files downloaded: ${totalDownloads}`);

  if (!APPLY) {
    console.log("\nDry run only. Rerun with --apply to download + write DB.");
    return;
  }

  const backupPath = DB_PATH.replace(".json", `.backup-photo-cache-${Date.now()}.json`);
  fs.writeFileSync(backupPath, raw, "utf-8");
  console.log(`Backup: ${backupPath}`);
  fs.writeFileSync(DB_PATH, JSON.stringify(cafes, null, 2), "utf-8");
  console.log(`Wrote ${DB_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
