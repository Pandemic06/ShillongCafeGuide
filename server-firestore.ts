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
    // Use the modular subpath API (firebase-admin v12+). The legacy
    // namespace require ("firebase-admin").apps is undefined under v14's
    // CJS interop, which crashed init with "Cannot read properties of
    // undefined (reading 'length')". getApps()/initializeApp/cert/
    // getFirestore from the subpaths are stable across the interop.
    const { initializeApp, getApps, cert } = require("firebase-admin/app");
    const { getFirestore } = require("firebase-admin/firestore");
    const json = JSON.parse(Buffer.from(b64, "base64").toString("utf-8"));
    const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(json) });
    // New project uses the default database; admin SDK targets it by default.
    _db = getFirestore(app);
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
/**
 * Stable Firestore doc id for a café. Prefer place_id (globally unique per
 * Google place) so re-adds of the same café overwrite one doc instead of
 * piling up under fresh cafe-<timestamp> ids. Fall back to a normalized name
 * slug, then to whatever id the caller passed.
 *
 * This is the fix for the duplicate explosion: the agent dedupes against the
 * ephemeral /api/cafes list (which resets on deploy), so it kept re-adding the
 * same cafés. A deterministic doc id makes those re-adds idempotent.
 */
export function stableCafeDocId(cafe: Record<string, any>): string {
  const pid = cafe.place_id || cafe.placeId;
  if (pid) return `gp_${String(pid).replace(/[^a-zA-Z0-9_-]/g, "")}`.slice(0, 128);
  const name = (cafe.name || "").toString().toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  if (name) return `nm_${name}`.slice(0, 128);
  return String(cafe.id || `cafe-${Date.now()}`);
}

export async function upsertCafeToFirestore(
  cafe: Record<string, any>,
  status: "pending" | "approved" = "pending"
): Promise<boolean> {
  const db = initFirestore();
  if (!db || !cafe?.id) return false;
  try {
    const docId = stableCafeDocId(cafe);
    await db.collection("cafes").doc(docId).set(
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

/**
 * One-shot maintenance: collapse duplicate café docs. Groups every doc in the
 * `cafes` collection by place_id (preferred) or normalized name, keeps the
 * earliest-created doc in each group, deletes the rest. Static/seed cafés that
 * were never duplicated are untouched.
 *
 * `dryRun` returns the plan without deleting. Returns counts + the ids removed.
 */
export async function cleanupDuplicateCafes(
  dryRun = false
): Promise<{ total: number; groups: number; deleted: number; deletedIds: string[]; kept: string[] }> {
  const db = initFirestore();
  if (!db) return { total: 0, groups: 0, deleted: 0, deletedIds: [], kept: [] };

  const snap = await db.collection("cafes").get();
  const docs: { id: string; data: any }[] = [];
  snap.forEach((d: any) => docs.push({ id: d.id, data: d.data() }));

  const norm = (s: any) => (s || "").toString().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const groups = new Map<string, { id: string; data: any }[]>();
  for (const doc of docs) {
    const key = doc.data.place_id ? `pid:${doc.data.place_id}` : `nm:${norm(doc.data.name)}`;
    if (!key || key === "nm:") continue;
    const arr = groups.get(key) || [];
    arr.push(doc);
    groups.set(key, arr);
  }

  const deletedIds: string[] = [];
  const kept: string[] = [];
  for (const [, arr] of groups) {
    if (arr.length <= 1) { if (arr[0]) kept.push(arr[0].id); continue; }
    // Keep the earliest doc. cafe-<timestamp> ids sort by creation; otherwise
    // fall back to updatedAt. Prefer an already-approved doc if one exists.
    arr.sort((a, b) => {
      const aApproved = a.data.status === "approved" ? 0 : 1;
      const bApproved = b.data.status === "approved" ? 0 : 1;
      if (aApproved !== bApproved) return aApproved - bApproved;
      return String(a.id).localeCompare(String(b.id));
    });
    const [keepDoc, ...rest] = arr;
    kept.push(keepDoc.id);
    for (const r of rest) {
      deletedIds.push(r.id);
      if (!dryRun) await db.collection("cafes").doc(r.id).delete();
    }
  }

  return { total: docs.length, groups: groups.size, deleted: deletedIds.length, deletedIds, kept };
}
