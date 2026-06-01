import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeApp, getApps, getApp } from "firebase/app";
import firebaseConfig from "../../firebase-applet-config.json";

/**
 * Firebase Storage image uploader (admin-only flow).
 * Files land under `uploads/{folder}/{timestamp}-{name}` and return a
 * permanent download URL string that can be saved into Firestore as an
 * image URL.
 */

// Storage uses default bucket — reuse the app initialised in src/firebase.ts.
// Defensive init so this module works standalone too (e.g. tests).
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const storage = getStorage(app);

function sanitize(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(0, 80);
}

export async function uploadImage(
  file: File,
  folder: "cafes" | "guides" | "misc" = "misc"
): Promise<string> {
  if (!file) throw new Error("No file");
  if (!file.type.startsWith("image/")) throw new Error("Not an image");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image larger than 5MB");

  const path = `uploads/${folder}/${Date.now()}-${sanitize(file.name)}`;
  const r = ref(storage, path);
  await uploadBytes(r, file, { contentType: file.type });
  return await getDownloadURL(r);
}
