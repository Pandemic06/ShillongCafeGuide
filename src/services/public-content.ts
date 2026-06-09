import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { GuideArticle, NeighborhoodInfo, FoodDish } from "../types";
import { SiteSettings } from "./admin-db";

/**
 * Merge Firestore override docs over a static base array by id. Override
 * fields win; anything the admin didn't touch falls back to the static
 * value. Items that exist only in Firestore are appended.
 */
function mergeById<T extends { id: string }>(base: T[], overrides: T[]): T[] {
  if (!overrides.length) return base;
  const map = new Map(base.map((b) => [b.id, b]));
  overrides.forEach((o) => {
    const existing = map.get(o.id);
    map.set(o.id, existing ? { ...existing, ...o } : o);
  });
  // Preserve base order, then append override-only items.
  const baseIds = new Set(base.map((b) => b.id));
  const extras = overrides.filter((o) => !baseIds.has(o.id));
  return [...base.map((b) => map.get(b.id)!), ...extras];
}

/**
 * Public readers for CMS-managed content. Used by the public site (not the
 * admin shell). All failures swallowed — public site falls back to static
 * data so a Firestore outage never breaks the homepage.
 */

export async function getPublishedGuides(): Promise<GuideArticle[]> {
  try {
    const q = query(collection(db, "guides"), where("status", "==", "published"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as GuideArticle));
  } catch (err) {
    console.warn("getPublishedGuides failed (using static fallback):", err);
    return [];
  }
}

export async function getPublicSiteSettings(): Promise<SiteSettings | null> {
  try {
    const snap = await getDoc(doc(db, "settings", "site"));
    return snap.exists() ? (snap.data() as SiteSettings) : null;
  } catch (err) {
    console.warn("getPublicSiteSettings failed:", err);
    return null;
  }
}

/** Static NEIGHBORHOODS with any Firestore admin overrides merged in. */
export async function getMergedNeighborhoods(base: NeighborhoodInfo[]): Promise<NeighborhoodInfo[]> {
  try {
    const snap = await getDocs(collection(db, "neighborhoods"));
    const overrides = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as NeighborhoodInfo));
    return mergeById(base, overrides);
  } catch (err) {
    console.warn("getMergedNeighborhoods failed (using static):", err);
    return base;
  }
}

/** Static DISHES with any Firestore admin overrides merged in. */
export async function getMergedDishes(base: FoodDish[]): Promise<FoodDish[]> {
  try {
    const snap = await getDocs(collection(db, "dishes"));
    const overrides = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as FoodDish));
    return mergeById(base, overrides);
  } catch (err) {
    console.warn("getMergedDishes failed (using static):", err);
    return base;
  }
}
