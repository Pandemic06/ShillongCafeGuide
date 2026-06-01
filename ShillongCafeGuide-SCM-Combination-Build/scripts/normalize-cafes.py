"""
One-time cafe data normalization audit.

Scans src/cafes_db.json + reports:
  1. Neighborhood mismatch (stored vs address-inferred)
  2. Rooftop-tag plausibility (cross-check formatted_address + theme + tags)
  3. Duplicate name detection
  4. Missing required metadata
  5. Applies manual overrides from MANUAL_OVERRIDES dict

Usage:
  python scripts/normalize-cafes.py              # dry-run report
  python scripts/normalize-cafes.py --apply      # write fixes back to cafes_db.json
"""
import json
import sys
import re
from pathlib import Path
from collections import Counter

DB = Path(__file__).parent.parent / "src" / "cafes_db.json"

# Canonical neighborhoods recognized by the app (src/types.ts Cafe.neighborhood enum)
CANONICAL = [
    "Laitumkhrah", "Police Bazaar", "Golf Links", "Boyce Road",
    "Nongkynrih", "Kench's Trace", "Dhankheti"
]

# Soft-mapped neighborhoods not in enum but used in db. Will be flagged.
EXTENDED = ["Mawroh", "Nongrim Hills", "Oakland", "Cleve Colony", "MG Road", "Mawlai"]

# Address-pattern → canonical neighborhood. First match wins.
ADDR_PATTERNS = [
    (r"laitumkhrah|don bosco", "Laitumkhrah"),
    (r"police bazar|police bazaar|khyndailad|eee cee hotel|gs road", "Police Bazaar"),
    (r"golf links|new colony", "Golf Links"),
    (r"boyce road", "Boyce Road"),
    (r"nongkynrih", "Nongkynrih"),
    (r"kench'?s trace|kenches trace", "Kench's Trace"),
    (r"dhankheti", "Dhankheti"),
    (r"oakland", "Oakland"),
    (r"mawroh", "Mawroh"),
    (r"nongrim hills?", "Nongrim Hills"),
    (r"cleve colony", "Cleve Colony"),
    (r"mawlai", "Mawlai"),
    (r"m\.?g\.? road|mg road", "MG Road"),
]

ROOFTOP_TOKENS = re.compile(r"roof\s*top|terrace|sky\s*deck|deck", re.I)

# Hand-verified facts. Source of truth for known-wrong entries.
# Add new entries here as audit surfaces them.
MANUAL_OVERRIDES = {
    "evening-club-laitumkhrah": {
        "neighborhood": "Police Bazaar",
        "drop_tags": ["Rooftop Cafe", "Valley View"],
        "add_tags": ["Bar & Lounge", "Live Music"],
        "theme": "Classic Rock Lounge with Live Mic & Vinyl",
        "neighborhood_verified": True,
        "rooftop_verified": False,
        "neighborhood_source": "manual",
    },
    "ahavah-cafe": {
        "drop_tags": ["Rooftop", "Outdoor Deck"],
        "add_tags": ["Limited Outdoor Seating"],
        "rooftop_verified": False,
    },
    "jiva-grill-nongkynrih": {
        "drop_tags": ["Rooftop", "Outdoor Deck"],
        "add_tags": ["Outdoor Seating", "Scenic View"],
        "rooftop_verified": False,
    },
    "the-living-roof": {
        "rooftop_verified": True,  # confirmed real rooftop
    },
    "tring-tring": {
        "drop_tags": ["Rooftop"],
        "rooftop_verified": False,
        "theme": "Continental Fine Dining at Hotel Polo Towers",
    },
    "marsoki-cafe": {
        "drop_tags": ["Rooftop", "Rooftop Vibe"],
        "rooftop_verified": False,
        "theme": "Laitumkhrah Hidden Hideaway",
    },
}

# Cafes that do not exist (verified false-positives). Removed from db on apply.
DELETE_IDS = {
    "heads-up-cafe",      # does not exist (user-verified)
    "grub-s-cafe-bakery", # does not exist (user-verified)
}

# Auto-fixes inferred from Google formatted_address. Applied only when address
# strongly contradicts stored neighborhood. Hand-verify before re-running.
ADDRESS_AUTO_FIXES = {
    "rynsan-cafe":           "Nongkynrih",     # addr: Laitumkhrah Main Rd, Nongkynrih
    "cherry-bean-cafe":      "Police Bazaar",  # addr: GS Rd, Police Bazar
    "mellow-mood-cafe":      "Nongkynrih",     # addr: Upland Rd, Nongkynrih, Laitumkhrah
    "little-chef-cafe":      "Laitumkhrah",    # addr: Red Hill Rd, Nongkynrih, Laitumkhrah
    "ginger-restaurant":     "Police Bazaar",  # addr: Hotel Polo Towers, Police Bazar
    "click-cafe":            "Dhankheti",      # addr: Dhankheti st Peter's building
}


def infer_neighborhood(addr: str) -> str | None:
    if not addr:
        return None
    a = addr.lower()
    for pattern, canon in ADDR_PATTERNS:
        if re.search(pattern, a):
            return canon
    return None


def has_rooftop_signal(c: dict) -> bool:
    text = " ".join([
        c.get("theme", ""), c.get("tagline", ""),
        " ".join(c.get("vibeTags", [])), " ".join(c.get("tags", []))
    ])
    return bool(ROOFTOP_TOKENS.search(text)) or bool(c.get("hasRooftop"))


def main():
    apply_mode = "--apply" in sys.argv
    with open(DB, encoding="utf-8") as f:
        cafes = json.load(f)

    print(f"Loaded {len(cafes)} cafes.\n")

    # 1. Duplicates by lowercase name
    name_counts = Counter(c["name"].strip().lower() for c in cafes)
    dupes = [n for n, k in name_counts.items() if k > 1]
    if dupes:
        print(f"=== DUPLICATE NAMES ({len(dupes)}) ===")
        for n in dupes:
            print(f"  - {n} (x{name_counts[n]})")
        print()

    # 2. Non-canonical neighborhoods
    print("=== NON-CANONICAL NEIGHBORHOODS ===")
    nc = [c for c in cafes if c.get("neighborhood") not in CANONICAL]
    for c in nc:
        print(f"  - {c['name']:35s} → {c.get('neighborhood'):20s}  (need canonical or schema update)")
    if not nc:
        print("  (none)")
    print()

    # 3. Neighborhood mismatch vs address inference
    print("=== NEIGHBORHOOD MISMATCH (address ≠ stored) ===")
    mismatches = []
    for c in cafes:
        inferred = infer_neighborhood(c.get("formatted_address", "") or c.get("address", ""))
        stored = c.get("neighborhood")
        if inferred and inferred != stored:
            mismatches.append((c, inferred, stored))
            print(f"  - {c['name']:35s} | stored={stored:18s} | addr→{inferred:18s}")
            print(f"      addr: {(c.get('formatted_address') or c.get('address',''))[:90]}")
    if not mismatches:
        print("  (none)")
    print()

    # 4. Rooftop sanity
    print("=== ROOFTOP-TAGGED ===")
    for c in cafes:
        if has_rooftop_signal(c):
            print(f"  - {c['name']:35s} | tags={c.get('vibeTags',[])[:3]} | theme={c.get('theme','')[:50]}")
    print()

    # 5a. Apply address-inferred auto-fixes
    print("=== ADDRESS AUTO-FIXES TO APPLY ===")
    auto_applied = 0
    for c in cafes:
        new_n = ADDRESS_AUTO_FIXES.get(c["id"])
        if not new_n or c.get("neighborhood") == new_n:
            continue
        print(f"  - {c['name']:35s} | {c.get('neighborhood'):18s} -> {new_n}")
        c["neighborhood"] = new_n
        c["neighborhood_verified"] = True
        c["neighborhood_source"] = "address-inferred"
        c["last_normalized_at"] = "2026-05-31"
        auto_applied += 1
    print(f"  Total auto-fixes: {auto_applied}\n")

    # 5b. Apply manual overrides
    print("=== MANUAL OVERRIDES TO APPLY ===")
    applied = 0
    for c in cafes:
        ov = MANUAL_OVERRIDES.get(c["id"])
        if not ov:
            continue
        applied += 1
        print(f"  - {c['name']} ({c['id']})")
        if "neighborhood" in ov:
            print(f"      neighborhood: {c.get('neighborhood')} → {ov['neighborhood']}")
            c["neighborhood"] = ov["neighborhood"]
        if "theme" in ov:
            print(f"      theme: {c.get('theme')[:60]} → {ov['theme']}")
            c["theme"] = ov["theme"]
        if "drop_tags" in ov:
            before = list(c.get("vibeTags", []))
            c["vibeTags"] = [t for t in before if t not in ov["drop_tags"]]
            dropped = set(before) - set(c["vibeTags"])
            if dropped:
                print(f"      dropped tags: {dropped}")
        if "add_tags" in ov:
            existing = set(c.get("vibeTags", []))
            for t in ov["add_tags"]:
                if t not in existing:
                    c.setdefault("vibeTags", []).append(t)
                    print(f"      added tag: {t}")
        for k in ("neighborhood_verified", "rooftop_verified", "neighborhood_source"):
            if k in ov:
                c[k] = ov[k]
        c["last_normalized_at"] = "2026-05-31"
    print(f"\n  Total overrides applied: {applied}")
    print()

    # 6. Delete non-existent cafes
    print("=== DELETE NON-EXISTENT CAFES ===")
    before = len(cafes)
    for d in DELETE_IDS:
        match = next((c for c in cafes if c["id"] == d), None)
        if match:
            print(f"  - {match['name']} ({d})")
    cafes = [c for c in cafes if c["id"] not in DELETE_IDS]
    print(f"  Removed: {before - len(cafes)} cafes\n")

    if apply_mode:
        backup = DB.with_suffix(f".backup-normalize.json")
        with open(backup, "w", encoding="utf-8") as f:
            with open(DB, encoding="utf-8") as src:
                f.write(src.read())
        with open(DB, "w", encoding="utf-8") as f:
            json.dump(cafes, f, indent=2, ensure_ascii=False)
        print(f"✓ Wrote {DB.name} (backup: {backup.name})")
    else:
        print("(dry-run — pass --apply to write changes)")


if __name__ == "__main__":
    main()
