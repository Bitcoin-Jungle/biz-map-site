# Open Issues — BTC Map migration

Tracked follow-ups for the BTC Map migration. The site is functional today; these
gate the **write-back path** (verify/report/add actually updating BTC Map) and one
cosmetic map detail. See `PLAN.md` for the full architecture and cutover plan.

Status legend: 🔴 blocked on external input · 🟡 needs work · ⚪ cosmetic

---

## 1. ✅ RESOLVED — `IMPORT_TOKEN` write path is live

**Impact:** Approving an `add` submission calls BTC Map's Import RPC (`submit_place`),
which requires a Bearer token scoped to import origin `bitcoin-jungle`.

**Status (verified live 2026-06-02):** btcmap-api PR #94 shipped. The token authenticates
**and is authorized for origin `bitcoin-jungle`** — the prior `"token is not allowed to
access import origin 'bitcoin-jungle'"` error is gone. Full round-trip confirmed against
`api.btcmap.org/rpc`: `submit_place` creates a submission (returns `{id, origin, external_id}`),
`get_submitted_place` returns it, `revoke_submitted_place` sets `revoked: true`. Test
submissions (15478–15481) were created and revoked during verification — nothing left behind.

**IMPORTANT — what `submit_place` actually does (verified from btcmap-api source):** it does
**not** publish a place to the map. It writes a row to the `place_submission` queue. The
`sync_submitted_places` job then opens a **Gitea ticket** (label `1552` for bitcoin-jungle)
containing our `name`/`category`/`extra_fields`/coords as **text for a human OSM contributor**,
who manually adds the merchant to OpenStreetMap with `currency:XBT` + proper tags. Only after
that, and the next OSM→BTC Map sync, does the pin appear on `/v4/places`. So "approve an add"
= "queue a human-reviewed OSM import task," not an instant publish. The `submit_place` `id` is
a submission id in a **separate id space** from public `/v4/places/{id}`.

**Where (ours):** `server/lib/importRpc.ts` sends `origin: "bitcoin-jungle"` +
`Bearer ${IMPORT_TOKEN}`; token lives in `~/bj-map/.env` on the VM and local `.env`
(both gitignored). Field mapping verified + corrected — see #3.

**Done:** approving an `add` now creates a `bitcoin-jungle` submission and
`get_submitted_place(origin, external_id)` returns it; from there it's a human OSM workflow.

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
   if BJ owns it, else `null`. **Read-side signal confirmed (live 2026-06-02):** the read API
   exposes a first-class **`payment_provider`** field (8,112 places; current values `square`,
   `coinos`). PR #94 registers the `bitcoin-jungle` vendor with
   `payment_provider: "bitcoin-jungle"`, so once BJ merchants are imported they surface
   `payment_provider: "bitcoin-jungle"` on `/v4/places` — ownership is detectable client-side
   without an RPC call. **Note:** `osm:payment:bitcoin-jungle` is NOT a read field (0 places);
   the `extra_fields["payment:bitcoin-jungle"]` we write at submit time is queue-internal and
   does not surface on the read API. **Also note:** submitted places are NOT on `/v4/places`
   until the import pipeline processes them (the submit `id` is a separate id space from public
   place ids). So pre-import, the only ownership check is
   `get_submitted_place(origin, external_id)`; post-import, use `payment_provider`.
3. On approve — **redesigned after reading btcmap-api source (2026-06-02); the original
   `submit_place`/`revoke_submitted_place` plan was wrong, see below.**

### How BTC Map actually models verify/report (authoritative, from source)

Read `src/service/overpass.rs` + `src/service/element.rs`:

- **Verification = OSM date tags.** A place is "verified" iff its OSM tags carry a parseable
  date in `survey:date`, `check_date`, or `check_date:currency:XBT` (most recent wins —
  `verification_date()`). "Up to date" = verified **< 365 days** ago (`up_to_date()`). The API
  auto-generates issues from this: `not_verified` (no date), `outdated` (>365d), `outdated_soon`.
- **These read from `overpass_data` (OSM-synced tags).** `set_element_tag` writes BTC Map's
  *own* tag overlay, which does **not** feed `verification_date()` — so you **cannot** refresh
  verification through the API. It requires a real **OSM edit** bumping `check_date:currency:XBT`.
- **There is no verify or report RPC.** What exists: `add_element_comment(element_id, comment)`
  — attach a free-text note to a place (native "report/leave a note"; also a paywalled variant).
  Issues are derived, not user-submitted. `submit_place` only writes the import **queue**
  (→ Gitea ticket → human OSM entry); it cannot touch a live place's `verified_at`.

### Consequence — the current `approveOwnedTarget` is wrong (and schema-invalid)

`server/routes/moderate.ts` calls `submitPlace({ external_id, target_place_id })` for verify
and `revokeSubmittedPlace(externalId)` for report. Both are wrong: `submit_place` requires
`lat/lon/category/name` (would throw `missing field lat`) and only touches the queue;
`revoke_submitted_place` only works on *our own* submissions, not an arbitrary reported pin.
The branch is currently dead (gated behind `resolveOwnership() === null`), so it has never run.

### Redesign (matches BTC Map; this is the "option b" path)

- **Report** → `add_element_comment(element_id = <btcmap place id>, comment = <report text>)`
  — instant, native, visible on BTC Map. Keep admin-notify as a backstop for removals
  (we can't delete a pin we don't own). Confirm whether plain `add_element_comment` needs an
  admin role or only the paywalled variant is open — test with our token or ask BTC Map.
- **Verify** → there is no API shortcut. For **BJ-owned** pins, route the approval through the
  **same OSM-edit / Gitea-ticket pipeline as adds** to bump `check_date:currency:XBT` (durably,
  the re-import should carry a fresh date). For **non-owned** pins, `add_element_comment`
  ("user reports still accepting bitcoin as of <date>") and/or notify. Drop the `submit_place`
  call entirely.
- **Inputs:** `add_element_comment` needs the **numeric BTC Map element id**; our verify/report
  payloads carry `target_place_id` as a string — make sure it's the `/v4/places` numeric id.

**Done when:** report approval posts a comment to the BTC Map element (or notifies on failure);
verify approval either files an OSM `check_date` refresh (BJ-owned) or comments/notifies
(non-owned); no code path calls `submit_place` with a target id.

---

## 3. ✅ RESOLVED — `submit_place` field mapping verified against live schema

**Verified live 2026-06-02.** The real `submit_place` schema (confirmed by reading places
back via `get_submitted_place`):

Confirmed against btcmap-api source (`src/rpc/import/submit_place.rs`, `place_submission/`):

```jsonc
{
  "origin": "bitcoin-jungle",      // required
  "external_id": "sub:<id>",       // required, unique per origin (idempotent upsert)
  "name": "string",                // required
  "lat": 9.382, "lon": -84.129,    // required numbers
  "category": "restaurant",        // REQUIRED, singular free string, no server enum
  "extra_fields": {                // optional object; only recognized keys are consumed
    "phone": "...", "website": "https://...", "description": "...",
    "categories": "restaurant;cafe"   // hint only — see notes
  }
}
```

Key corrections from the old guess: `category` is a **required top-level singular string**
(was sent as `tags.categories` array → `"missing field category"`); there is **no `tags`
field** — extra data must go in **`extra_fields`**. `extra_fields` keys are read by named
getters on `PlaceSubmission` — recognized: `description, phone, website, address,
opening_hours, email, twitter, facebook, instagram, line, icon_url`. `website`/social keys
are **validated as http(s) URLs and silently dropped if invalid**, so the mapping now
normalizes bare URLs (`example.com` → `https://example.com`).

**Two fields removed after reading the source:**
- `payment:bitcoin-jungle` — **inert.** `payment_provider` and the OSM tag
  `payment:bitcoin-jungle=yes` are derived from the **`origin`** via the vendor table
  (`vendor.rs`), not from any extra_field. Sending it just cluttered the import ticket.
- `categories` kept only as a **free-text hint** for the human OSM editor (the ticket dumps
  `extra_fields` verbatim); it is not a structured field.

**Where (fixed):** `server/routes/moderate.ts` — `mapPayloadToPlace()` + `normalizeUrl()`.

**Done:** schema validated against source and live RPC; mapping emits exactly the recognized
fields.

**Note (read-side category — corrected mechanism):** the submit `category` is **never**
read-exposed (0 of 28,035 `/v4/places` carry a top-level `category`) and does **not** drive
the eventual map icon. `submit_place` does not publish — it queues a Gitea ticket; a human
adds the place to **OSM**, and BTC Map **generates** the icon/category from the resulting OSM
tags (`generate_element_icons` / `generate_element_categories`). So our `category` is just a
hint for that human, and its vocabulary need not match BTC Map's `icon` set. The real concern
for the ~610-merchant bulk re-import is operational, not schematic: each submission becomes a
human OSM task. **Coordinate a bulk path with the BTC Map team** rather than relying on 610
individual tickets. Tracked in `HANDOFF_btcmap_submit_schema.md`.

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
