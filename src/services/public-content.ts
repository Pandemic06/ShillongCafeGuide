import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { GuideArticle } from "../types";
import { SiteSettings } from "./admin-db";

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
