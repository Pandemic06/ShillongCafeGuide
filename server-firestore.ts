/**
 * Server-side Firestore writer (firebase-admin).
 *
 * Why this exists: Render's free tier has an ephemeral filesystem — anything
 * the server writes to cafes_db.json is wiped on every deploy and every
 * cold-start. So the café-updater agent's POSTs to /api/cafes never persist.
 * Firestore is the only durable store. This module lets the Express server
 * mirror new cafés into Firestore `cafes/{id}` so they survive restarts and
 * show up in the admin (which already reads Firestore).
 *
 * Auth: uses a service account (bypasses Firestore security rules — correct
 * for a trusted backend). The key is provided as a base64-encoded JSON blob
 * in FIREBASE_SERVICE_ACCOUNT. If that env var is absent, every call here
 * is a no-op (logged once) so local dev / unconfigured deploys still work.
 */

let _db: any = null;
let _initTried = false;
let _available = false;

function initFirestore(): any {
  if (_initTried) return _db;
  _initTried = true;

  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!b64) {
    console.warn(
      "[firestore] FIREBASE_SERVICE_ACCOUNT not set — server-side Firestore " +
      "writes disabled. Agent-added cafés will NOT persist on Render. " +
      "See README: create a service account, base64 the JSON, set the env var."
    );
    return null;
  }

  try {
    // Require lazily so the server still boots if firebase-admin isn't installed.
    const admin = require("firebase-admin");
    const json = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(json) });
    }
    // New project uses the default database; admin SDK targets it by default.
    _db = admin.firestore();
    _available = true;
    console.log("[firestore] server-side Firestore writer initialised.");
    return _db;
  } catch (err) {
    console.error("[firestore] init failed — writes disabled:", err);
    return null;
  }
}

export function isFirestoreWriteAvailable(): boolean {
  initFirestore();
  return _available;
}

/**
 * Upsert a café into Firestore `cafes/{id}`, merging so we never wipe fields.
 * `status` defaults to "pending" — the public site filters these out until an
 * admin approves them; the admin sidebar badge counts them.
 *
 * Fire-and-forget friendly: returns a promise but callers may ignore it. Never
 * throws — logs and resolves false on failure so the HTTP response isn't held
 * hostage to a Firestore hiccup.
 */
export async function upsertCafeToFirestore(
  cafe: Record<string, any>,
  status: "pending" | "approved" = "pending"
): Promise<boolean> {
  const db = initFirestore();
  if (!db || !cafe?.id) return false;
  try {
    await db.collection("cafes").doc(String(cafe.id)).set(
      {
        ...cafe,
        status,
        publish_eligibility_status: status,
        source: cafe.source || "agent",
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error(`[firestore] upsert cafe ${cafe.id} failed:`, err);
    return false;
  }
}
