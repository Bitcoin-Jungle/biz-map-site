# Open Issues — BTC Map migration

Tracked follow-ups for the BTC Map migration. The site is functional today; these
gate the **write-back path** (verify/report/add actually updating BTC Map) and one
cosmetic map detail. See `PLAN.md` for the full architecture and cutover plan.

Status legend: 🔴 blocked on external input · 🟡 needs work · ⚪ cosmetic

---

## 1. 🔴 `IMPORT_TOKEN` not set — approve → Import RPC is inert

**Impact:** Approving an `add` submission calls BTC Map's Import RPC (`submit_place`),
which requires a Bearer token scoped to `import_origins: ["bitcoin-jungle"]`. The token
is currently empty, so an `add` approval throws `IMPORT_TOKEN not configured`. (Verify/report
approvals degrade gracefully to `handled` + admin email — see #2.)

**Where:** `server/lib/importRpc.ts` (reads `process.env.IMPORT_TOKEN`, throws if absent);
`.env` / `.env.example` (`IMPORT_TOKEN=`).

**To resolve:**
- Get the production import token from the BTC Map team (Matrix `#btcmap:matrix.org`).
- Put it in the deployment env (`IMPORT_TOKEN=…`), server-side only — never expose to the browser.

**Done when:** approving an `add` in a staging deploy creates the place under
`origin=bitcoin-jungle` and `get_submitted_place("sub:<id>")` returns it.

---

## 2. 🔴 / 🟡 Ownership resolution stubbed — verify/report can't act on existing pins

**Impact:** `verify`/`report` can only update BTC Map for places **BJ owns**
(`origin=bitcoin-jungle`). Most current CR pins were imported by another OSM user
(`mrtraver`), not BJ. `resolveOwnership()` returns `null` for everything, so every
verify/report approval is marked `handled` and only emails the admin — it does not
update BTC Map.

**Precondition (external):** the ~610 BJ merchants must be (re)imported under
`origin=bitcoin-jungle`, keyed `bj:<merchantId>` (owned by the mobile migration / data team).

**Where:** `server/routes/moderate.ts` — `resolveOwnership(targetPlaceId)` (has a `// TODO`
marking this), the verify/report approval branch.

**To resolve:**
1. Complete the re-import under `bitcoin-jungle`.
2. Implement `resolveOwnership`: map a BTC Map place id → our namespaced `external_id`
   if BJ owns it, else `null`. Prefer a place field if BTC Map exposes the submission/import
   origin on `/v4/places/{id}`; otherwise reconcile via `get_submitted_place`.
3. On approve: BJ-owned verify → `submit_place` (refresh `verified_at`); BJ-owned report →
   `revoke_submitted_place`; non-owned → keep current notify-only behavior.

**Done when:** approving a verify/report on a BJ-owned pin updates BTC Map via RPC, and
a non-owned one still degrades to notify without error.

---

## 3. 🟡 `submit_place` field mapping is provisional

**Impact:** `mapPayloadToPlace()` maps our add-form fields to the `submit_place` params
as a best guess (`{name, lat, lon, tags:{categories,phone,website,description}}`). The exact
schema BTC Map's Import RPC expects (tag names, structure, required fields) has not been
validated against the live endpoint — it was only exercised against a mocked RPC in tests.

**Where:** `server/routes/moderate.ts` — `mapPayloadToPlace()` (has a comment flagging this);
`server/lib/importRpc.ts`.

**To resolve:** once `IMPORT_TOKEN` exists (#1), submit a test place against staging/live,
confirm it lands correctly (name, coords, categories, payment tags, contact), and adjust the
mapping. Coordinate tag conventions with the BTC Map team.

**Done when:** a submitted test merchant appears on BTC Map with all fields intact and correct
OSM-style tags.

---

## 4. ⚪ MapKit cluster bubbles use the default style (pink)

**Impact:** Cosmetic. Marker clusters render in MapKit's default pink with a count, which is
off-palette vs the tropical green/orange theme. Individual markers are themed; clusters are not.

**Where:** `src/App.tsx` (markers set `clusteringIdentifier`); `src/lib/markers.ts`.

**Why it's open:** `mapkit-react` doesn't expose cluster-annotation styling
(`annotationForCluster` / cluster glyph + color). Theming clusters means dropping to the raw
MapKit JS API via the map ref (`window.mapkit`) and providing a cluster annotation factory.

**To resolve:** either (a) use the underlying `mapkit.Map` instance to set a cluster annotation
callback that returns a themed annotation, or (b) upstream a PR to `mapkit-react` exposing it,
or (c) accept the default.

**Done when:** clusters render in the brand palette (or we decide to leave the default).
