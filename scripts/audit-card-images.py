"""Audit image sources across all 49 cafe cards.

For each cafe, reports the status of every image slot the user sees:
  - hero  (modal top)
  - card  (Explore Hearth Card thumbnail)
  - interior  (Vibe & Details panel)
  - details  (extra modal photo)
  - photos[]  (Google Shared Photos source)
  - gallery[]  (Gallery tab grid)
  - mustTry[].image  (Menu items)
  - menuImages (Menu Slate Scans — from CafeDetailModal MEDIA_DATABASE)

Status legend:
  CACHED  = local /cafe-photos/{id}/... (real Google Places, downloaded)
  UNSPLASH = generic stock from images.unsplash.com
  GOOGLE-LIVE = live maps.googleapis.com photo URL (not cached)
  MISSING = field empty/null
  OTHER = something else

Also reports # cached photos available for the cafe, indicating whether
better images already exist in the local store and just need wiring.

Run: python scripts/audit-card-images.py
"""
import json, os, re, sys

sys.stdout.reconfigure(encoding="utf-8")

DB_PATH = "src/cafes_db.json"
PHOTOS_ROOT = "public/cafe-photos"
MODAL_FILE = "src/components/CafeDetailModal.tsx"

def classify(url):
    if not url: return "MISSING"
    if url.startswith("/cafe-photos/"): return "CACHED"
    if "unsplash" in url: return "UNSPLASH"
    if "maps.googleapis.com" in url: return "GOOGLE-LIVE"
    if "wikimedia" in url or "upload.wikimedia" in url: return "WIKIMEDIA"
    return "OTHER"

# Parse the modal MEDIA_DATABASE hard-coded gallery/menuImages
modal_src = open(MODAL_FILE, encoding="utf-8").read()
# crude: find ids inside MEDIA_DATABASE that have unsplash entries
media_db_unsplash_ids = set()
media_db_present_ids = set()
for m in re.finditer(r'"([\w-]+)":\s*{[^}]*?gallery:\s*\[([^\]]*)\][^}]*?menuImages:\s*\[([^\]]*)\]', modal_src, re.S):
    cid = m.group(1)
    media_db_present_ids.add(cid)
    if "unsplash" in (m.group(2) + m.group(3)):
        media_db_unsplash_ids.add(cid)

db = json.load(open(DB_PATH, encoding="utf-8"))

# Header
cols = ["#","ID","hero","card","interior","details","photos[]","gallery[]","mustTry imgs","menuImages","cached files"]
print(" | ".join(f"{c:<22s}" if i==1 else f"{c:<15s}" for i,c in enumerate(cols)))
print("-" * 200)

stats = {"UNSPLASH":0, "CACHED":0, "GOOGLE-LIVE":0, "MISSING":0, "OTHER":0, "WIKIMEDIA":0}
issues_per_cafe = {}

for idx, cafe in enumerate(db, 1):
    cid = cafe["id"]
    imgs = cafe.get("images") or {}
    hero = classify(imgs.get("hero"))
    card = classify(imgs.get("card"))
    interior = classify(imgs.get("interior"))
    details = classify(imgs.get("details"))

    photos = cafe.get("photos") or []
    photo_classes = [classify(p) for p in photos]
    photo_sum = f"{photo_classes.count('CACHED')}/{len(photos)}cached" if photos else "EMPTY"

    gallery = cafe.get("gallery") or []
    gallery_classes = [classify(g) for g in gallery]
    gallery_sum = f"{gallery_classes.count('CACHED')}/{len(gallery)}cached" if gallery else "EMPTY"

    must = cafe.get("mustTry") or []
    must_classes = [classify(m.get("image")) for m in must]
    must_sum = f"{must_classes.count('CACHED')}/{len(must)}cached" if must else "EMPTY"

    # menuImages section in modal comes from MEDIA_DATABASE hard-code
    menu_section = "UNSPLASH(hardcode)" if cid in media_db_unsplash_ids else ("OK(hardcode)" if cid in media_db_present_ids else "UNSPLASH(default)")

    cached_dir = os.path.join(PHOTOS_ROOT, cid)
    cached_count = len(os.listdir(cached_dir)) if os.path.isdir(cached_dir) else 0

    for s in (hero, card, interior, details):
        stats[s] = stats.get(s, 0) + 1
    for c in photo_classes + gallery_classes + must_classes:
        stats[c] = stats.get(c, 0) + 1

    bad = sum(1 for s in (hero, card, interior, details) if s != "CACHED")
    bad += sum(1 for c in photo_classes if c != "CACHED")
    bad += sum(1 for c in gallery_classes if c != "CACHED")
    bad += sum(1 for c in must_classes if c != "CACHED")
    if "UNSPLASH" in menu_section:
        bad += 4
    issues_per_cafe[cid] = bad

    row = [str(idx), cid, hero, card, interior, details, photo_sum, gallery_sum, must_sum, menu_section, str(cached_count)]
    print(" | ".join(f"{c:<22s}" if i==1 else f"{c:<15s}" for i,c in enumerate(row)))

print("\n=== AGGREGATE COUNTS ===")
for k, v in sorted(stats.items()):
    print(f"  {k}: {v}")

print(f"\n=== TOP 10 PROBLEM CAFES (most non-CACHED image slots) ===")
worst = sorted(issues_per_cafe.items(), key=lambda x: -x[1])[:10]
for cid, n in worst:
    cached_dir = os.path.join(PHOTOS_ROOT, cid)
    avail = len(os.listdir(cached_dir)) if os.path.isdir(cached_dir) else 0
    print(f"  {cid}: {n} bad slots, {avail} cached files available")

print(f"\n=== MENU/GALLERY SECTION (MEDIA_DATABASE override) ===")
print(f"  cafes hardcoded with UNSPLASH gallery+menu: {len(media_db_unsplash_ids)}")
print(f"  cafes NOT in MEDIA_DATABASE → fall back to default Unsplash: {len(db) - len(media_db_present_ids)}")
print(f"  → these {len(media_db_unsplash_ids) + (len(db) - len(media_db_present_ids))} cafes show Unsplash in 'Google Shared Photos' + 'Menu Slate Scans' tabs")
