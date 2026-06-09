import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { Cafe, GuideArticle, Review, NeighborhoodInfo, FoodDish } from "../types";

/**
 * Admin-side CRUD. Reads/writes assume the caller is an authenticated admin;
 * Firestore rules enforce that for real (this code is purely client logic).
 *
 * Collections:
 *   cafes/{id}     — full cafe doc (overrides static + cafes_db.json data)
 *   reviews/{id}   — user reviews (admin can approve/delete)
 *   guides/{id}    — editorial articles (admin authored, rich text body)
 *   settings/site  — one global doc: { featuredCafes: string[], banner: string, ... }
 */

const CAFES = "cafes";
const REVIEWS = "reviews";
const GUIDES = "guides";
const SETTINGS = "settings";
const NEIGHBORHOODS = "neighborhoods";
const DISHES = "dishes";

// ── Cafés ─────────────────────────────────────────────────────────────────

export async function saveCafe(cafe: Cafe): Promise<Cafe> {
  if (!cafe.id) throw new Error("Cafe id required");
  try {
    const ref = doc(db, CAFES, cafe.id);
    // Merge: don't wipe existing fields the editor didn't touch.
    await setDoc(ref, { ...cafe, updatedAt: serverTimestamp() }, { merge: true });
    return cafe;
  } catch (err) {
    return handleFirestoreError(err, OperationType.UPDATE, `${CAFES}/${cafe.id}`);
  }
}

export async function deleteCafe(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, CAFES, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${CAFES}/${id}`);
  }
}

// ── Reviews ───────────────────────────────────────────────────────────────

export async function listReviews(): Promise<Review[]> {
  try {
    const snap = await getDocs(collection(db, REVIEWS));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  } catch (err) {
    return handleFirestoreError(err, OperationType.LIST, REVIEWS);
  }
}

export async function approveReview(id: string): Promise<void> {
  try {
    await setDoc(
      doc(db, REVIEWS, id),
      { approved: true, approvedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${REVIEWS}/${id}`);
  }
}

export async function deleteReview(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, REVIEWS, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${REVIEWS}/${id}`);
  }
}

// ── Guides ────────────────────────────────────────────────────────────────

export async function listGuides(): Promise<GuideArticle[]> {
  try {
    const q = query(collection(db, GUIDES), orderBy("date", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as GuideArticle));
  } catch (err) {
    // orderBy fails if 'date' missing; fall back to plain list.
    try {
      const snap = await getDocs(collection(db, GUIDES));
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as GuideArticle));
    } catch (err2) {
      return handleFirestoreError(err2, OperationType.LIST, GUIDES);
    }
  }
}

export async function getGuide(id: string): Promise<GuideArticle | null> {
  try {
    const snap = await getDoc(doc(db, GUIDES, id));
    return snap.exists() ? ({ id: snap.id, ...(snap.data() as any) } as GuideArticle) : null;
  } catch (err) {
    return handleFirestoreError(err, OperationType.GET, `${GUIDES}/${id}`);
  }
}

export async function saveGuide(guide: GuideArticle): Promise<GuideArticle> {
  if (!guide.id) throw new Error("Guide id required");
  try {
    await setDoc(
      doc(db, GUIDES, guide.id),
      { ...guide, updatedAt: serverTimestamp() },
      { merge: true }
    );
    return guide;
  } catch (err) {
    return handleFirestoreError(err, OperationType.UPDATE, `${GUIDES}/${guide.id}`);
  }
}

export async function deleteGuide(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, GUIDES, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${GUIDES}/${id}`);
  }
}

// ── Site settings ─────────────────────────────────────────────────────────

export interface SiteSettings {
  featuredCafes: string[]; // cafe ids in display order
  bannerText?: string;
  bannerEnabled?: boolean;
  homepageHeroCafeId?: string;
  // Homepage / brand media overrides. When set, the public site uses these
  // instead of the bundled static asset imports.
  heroVideoUrl?: string;
  heroImageUrl?: string;
  logoUrl?: string;
  aboutImages?: string[];
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const snap = await getDoc(doc(db, SETTINGS, "site"));
    if (!snap.exists()) return { featuredCafes: [], bannerEnabled: false };
    return snap.data() as SiteSettings;
  } catch (err) {
    return handleFirestoreError(err, OperationType.GET, `${SETTINGS}/site`);
  }
}

export async function saveSiteSettings(s: SiteSettings): Promise<void> {
  try {
    await setDoc(
      doc(db, SETTINGS, "site"),
      { ...s, updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${SETTINGS}/site`);
  }
}

// ── Neighborhoods (District Walks) ────────────────────────────────────────
// Firestore docs override the bundled static NEIGHBORHOODS by id. Only the
// fields an admin edits need to be present; the public merge keeps static
// values for anything absent.

export async function listNeighborhoodOverrides(): Promise<NeighborhoodInfo[]> {
  try {
    const snap = await getDocs(collection(db, NEIGHBORHOODS));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as NeighborhoodInfo));
  } catch (err) {
    return handleFirestoreError(err, OperationType.LIST, NEIGHBORHOODS);
  }
}

export async function saveNeighborhood(n: NeighborhoodInfo): Promise<NeighborhoodInfo> {
  if (!n.id) throw new Error("Neighborhood id required");
  try {
    await setDoc(doc(db, NEIGHBORHOODS, n.id), { ...n, updatedAt: serverTimestamp() }, { merge: true });
    return n;
  } catch (err) {
    return handleFirestoreError(err, OperationType.UPDATE, `${NEIGHBORHOODS}/${n.id}`);
  }
}

// ── Khasi Cuisine dishes ──────────────────────────────────────────────────

export async function listDishOverrides(): Promise<FoodDish[]> {
  try {
    const snap = await getDocs(collection(db, DISHES));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as FoodDish));
  } catch (err) {
    return handleFirestoreError(err, OperationType.LIST, DISHES);
  }
}

export async function saveDish(dish: FoodDish): Promise<FoodDish> {
  if (!dish.id) throw new Error("Dish id required");
  try {
    await setDoc(doc(db, DISHES, dish.id), { ...dish, updatedAt: serverTimestamp() }, { merge: true });
    return dish;
  } catch (err) {
    return handleFirestoreError(err, OperationType.UPDATE, `${DISHES}/${dish.id}`);
  }
}
