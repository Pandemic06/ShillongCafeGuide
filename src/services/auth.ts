import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

/**
 * Admin auth: Google Sign-In + Firestore allowlist.
 * `admins/{uid}` doc existence == admin. Doc may carry { email, name, role }.
 * Firestore rules enforce real security; this client check is for UX gating.
 */

const ADMINS_COLLECTION = "admins";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutAdmin(): Promise<void> {
  await signOut(auth);
}

/** Read admin allowlist doc. Returns true if user is on the list. */
export async function isAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;
  try {
    const snap = await getDoc(doc(db, ADMINS_COLLECTION, user.uid));
    return snap.exists();
  } catch (err) {
    console.warn("Admin allowlist check failed:", err);
    return false;
  }
}

/** React-friendly subscription. Calls cb with (user, isAdmin). */
export function watchAuth(
  cb: (user: User | null, admin: boolean) => void
): () => void {
  return onAuthStateChanged(auth, async (user) => {
    const admin = await isAdmin(user);
    cb(user, admin);
  });
}
