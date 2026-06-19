# Handoff — SCM-Combination-Build — 2026-06-19

## What We Were Doing
Building out the Shillong Café Map CMS + a two-agent automation system. This session:
(1) fixed agent-added cafés vanishing on Render, (2) added admin image/content editors
for every remaining public section, (3) fixed an admin sign-in crash, (4) set up
keep-awake pingers + a custom domain.

## Two Repos (BOTH live on GitHub)
- **Website**: `C:\Users\rohit\ShillongCafeGuide-temp` → branch `SCM-Combination-Build`
  (this is the DEFAULT branch on GitHub — cron workflows run from it). Repo:
  `Pandemic06/ShillongCafeGuide`. Hosted on Render, served at
  `https://shillongcafemap.in` (GoDaddy domain → Render A record `216.24.57.1` + www CNAME).
- **Agents**: `C:\Users\rohit\shillong-cafe-agents` → branch `main`. Repo:
  `Pandemic06/shillong-cafe-agents`. Python. Runs nightly via GitHub Actions cron.

## Work Completed This Session
Website repo (newest first):
- `1c3f945` fix: firebase-admin v14 CJS interop — `require("firebase-admin").apps` was
  undefined, crashing Firestore init. Switched to modular subpaths
  (`firebase-admin/app`, `firebase-admin/firestore`). **This made server-side Firestore
  writes actually work — verified end-to-end.**
- `de2b72c` feat: District Walks + Khasi Cuisine + homepage-media admin editors.
- `3f749c4` feat: server mirrors POST /api/cafes → Firestore `cafes/{id}` (status=pending)
  so agent finds survive Render's ephemeral disk.
- `59bb98b` fix: moved pending-badge hooks above early returns (React #310 crash on sign-in).
- `553b9a9` feat: GA4 tag (G-QZB4VR1S34) — added by user separately.
- `fb8e92a` feat: pending-count badges on Cafés + Reviews sidebar.
- `c8ac3ff` feat: /api/health + keep-render-awake GitHub Actions pinger (every 10 min).
- `5a0e8d3` feat: X-Agent-Key gate on mutating /api/cafes endpoints.

Agent repo:
- `23c926e` fix: build Maps URL from place_id (Places API returns cid= URLs the website
  endpoint can't parse — was making all ~146 finds fail). Now ~100% add rate.
- `92e5d83` feat: `--agent digest` mode + daily-digest.yml cron (02:00 UTC) + dry-run-on-pr.yml.

## Current State (what works)
- **Agent persistence WORKS.** Last agent run persisted **44 pending cafés** to Firestore.
  Verified via Firestore REST. They survive deploys now.
- **Admin CMS fully works.** Sign-in works (user `ujjwalsharan05@gmail.com` is on allowlist).
  Sidebar: Cafés / Guides / Reviews / District Walks / Khasi Cuisine / Settings.
- **All public sections image-editable**: cafés (hero/card/interior/details/Google photos/
  gallery/menu dish pics — already existed), guides, + NEW: neighborhoods (District Walks),
  dishes (Khasi Cuisine), homepage hero video + logo (Settings tab).
- Keep-awake: GitHub Actions pinger + UptimeRobot (user set up) hit /api/health.
- Custom domain `shillongcafemap.in` live with SSL.

## Immediately Next Steps
1. **User must deploy Firestore rules** to Firebase Console → shillong-cafe-map →
   Firestore → Rules → paste `firestore.rules` → Publish. The new `neighborhoods` +
   `dishes` collections need this or admin saves get "permission denied". (May already
   be done — confirm with user.)
2. **User reviews the 44 pending cafés** in /admin → Cafés (red badge). Approve good
   ones (set status=approved), delete junk.
3. **Delete test doc**: one pending café is `_firestore-test-delete-me` ("_FS Test") —
   created to verify persistence. Delete it in admin.
4. Optionally drive a browser test of the 3 new editors (Chrome MCP) to confirm saves
   land and public site reflects overrides.

## Key Files Touched (this session)
- `server-firestore.ts` — NEW. Lazy firebase-admin init from base64 FIREBASE_SERVICE_ACCOUNT
  env, `upsertCafeToFirestore()`. Modular subpath API.
- `server.ts` — POST /api/cafes mirrors to Firestore; X-Agent-Key gate; /api/health.
- `src/App.tsx` — filters status=pending from public; hero video + logo use settings override.
- `src/services/admin-db.ts` — CRUD for neighborhoods + dishes; SiteSettings extended
  (heroVideoUrl, heroImageUrl, logoUrl, aboutImages).
- `src/services/public-content.ts` — getMergedNeighborhoods / getMergedDishes + mergeById.
- `src/components/admin/NeighborhoodManager.tsx`, `CuisineManager.tsx` — NEW editors.
- `src/components/admin/SiteSettings.tsx` — homepage/brand media section.
- `src/components/admin/AdminApp.tsx` — nav items walks/cuisine; badge hooks relocated.
- `src/components/NeighborhoodGuide.tsx`, `CuisineGuide.tsx` — read merged Firestore data.
- `firestore.rules` — added neighborhoods + dishes (public read, admin write).
- Agent: `src/agents/cafe_updater_agent.py`, `src/services/digest.py`, workflows.

## Commands to Know
- Trigger agent manually: `gh workflow run daily-digest.yml --repo Pandemic06/shillong-cafe-agents`
- Agent secrets synced via: `shillong-cafe-agents/scripts/sync-secrets-to-github.ps1`
- Test café write (needs key from agent .env AGENT_API_KEY):
  `POST https://shillongcafemap.in/api/cafes` with header `X-Agent-Key: <key>`
- Verify Firestore persist: GET Firestore REST with web API key
  `AIzaSyBQjJzq5r6eDAT0LA4QoiKlcFuDLprC0u0`, project `shillong-cafe-map`, default db.
- Render env needed: `FIREBASE_SERVICE_ACCOUNT` (base64 of service-account JSON) — IS SET
  and working. `AGENT_API_KEY` also set.
- Website lint: `npm run lint` (tsc --noEmit). Build: `npm run build`.

## Open Questions / Decisions Pending
- Confirm user published firestore.rules (else neighborhoods/dishes saves fail).
- The 44 pending cafés need human review/approval — not automated.
- Render free tier still cold-starts if both pingers lapse >15 min.
- Agent's `audit` agent (website-opportunity leads) — was built but not deeply tested
  this session; digest email includes its output.

## Optional Note from Outgoing Session
Context window filled. All code committed + pushed on both repos; working trees clean.
Nothing in-flight. Safe to resume cold from this doc.
