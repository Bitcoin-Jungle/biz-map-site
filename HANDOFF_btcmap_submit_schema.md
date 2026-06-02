# Handoff → mobile-app agent: BTC Map `submit_place` schema (verified live)

We exercised BTC Map's Import RPC against `https://api.btcmap.org/rpc` on **2026-06-02**
with the `bitcoin-jungle` import token. PR #94 (`bitcoin-jungle` vendor) is **merged and
deployed** — the token authenticates and is authorized for `origin: "bitcoin-jungle"`.
Full `submit_place → get_submitted_place → revoke_submitted_place` round-trip works.

This is what you need to change in the mobile app's re-import path now that the schema is
known. The earlier guessed schema (`tags: { categories: [...] }`) is **wrong and will
fail** — read this before building the ~610-merchant re-import.

---

## The actual schema

`submit_place` params (JSON-RPC 2.0, `method: "submit_place"`):

```jsonc
{
  "origin": "bitcoin-jungle",          // REQUIRED — must be exactly this
  "external_id": "bj:<merchantId>",    // REQUIRED — unique per origin; see keying below
  "name": "Soda La Jungla",            // REQUIRED — string
  "lat": 9.382,                        // REQUIRED — number
  "lon": -84.129,                      // REQUIRED — number
  "category": "restaurant",            // REQUIRED — SINGULAR free string (see below)
  "extra_fields": {                    // OPTIONAL — object; only recognized keys are consumed
    "phone": "+506 8888-0000",
    "website": "https://soda.cr",      // MUST be a valid http(s) URL or it's dropped
    "description": "..."
  }
}
```

> **Read this first — `submit_place` does NOT publish a pin.** Verified against btcmap-api
> source (`src/rpc/import/submit_place.rs`, `sync_submitted_places.rs`, `place_submission/`).
> It writes a row to the `place_submission` **queue**. A background job
> (`sync_submitted_places`) then opens a **Gitea ticket** (bitcoin-jungle label `1552`)
> containing your `name`/`category`/`extra_fields`/coords as **text for a human OSM
> contributor**, who manually adds the merchant to **OpenStreetMap**. Only after that — and the
> next OSM→BTC Map sync — does it appear on `/v4/places`. So each `submit_place` call = one
> human OSM task. **For the ~610-merchant bulk re-import, do not assume this auto-publishes —
> coordinate a bulk OSM-import path with the BTC Map team** (610 individual tickets is not a
> plan).

### Hard rules (each verified against source)

1. **`category` is required, singular, and top-level.** Free string, **no server enum**.
   Omitting it returns `"missing field category"`. Do **not** send a `categories` array at top
   level. (It's only a text hint for the human OSM editor — see "Category" below.)

2. **There is no `tags` field.** Anything under `tags` is **silently dropped**. Ancillary data
   goes in **`extra_fields`**, but only **recognized keys** are read by `PlaceSubmission`
   getters: `description, phone, website, address, opening_hours, email, twitter, facebook,
   instagram, line, icon_url`. Unrecognized keys are stored but only ever shown as raw text in
   the import ticket.

3. **`website` (and twitter/facebook/instagram/line) must be valid http(s) URLs.** The getter
   validates the scheme and **silently drops** anything else — a bare `example.com` is lost.
   Normalize to `https://…` before sending.

4. **Do NOT send a `payment:bitcoin-jungle` extra_field — it's inert.** `payment_provider`
   (`"bitcoin-jungle"`) and the OSM tag `payment:bitcoin-jungle=yes` are derived from the
   **`origin`** via the vendor table (`vendor.rs`) when the place is added to OSM — not from
   any extra_field. Sending it just clutters the human ticket. Ownership detection works off
   the resulting `payment_provider`, see "Read-API behaviour" below.

5. **`external_id` is unique per origin and the upsert key.** Re-submitting the same
   `(origin, external_id)` updates the existing submission (idempotent — returns the same `id`).
   This is what makes the re-import safe to re-run.

---

## `external_id` keying convention

Use **`bj:<merchantId>`** for the real merchant re-import (this is the convention OPEN_ISSUES
#2 assumes for ownership mapping). Reserve the `test:` prefix for throwaway test places, and
`sub:<submissionId>` is what the web add-flow uses for user submissions. Keep the three
namespaces distinct so reconciliation stays unambiguous.

| prefix | meaning | who writes it |
|--------|---------|---------------|
| `bj:<merchantId>`     | re-imported BJ merchant (the ~610) | mobile/data re-import |
| `sub:<submissionId>`  | user-submitted add via web/app     | web backend on approve |
| `test:<anything>`     | throwaway / schema tests           | tooling — always revoke |

---

## Category mapping

`category` is **one** free string and is a **hint for the human OSM editor**, nothing more — it
is never read-exposed and does **not** drive the map icon (BTC Map *generates* the icon and
category from the OSM tags the human applies; see "Read-API behaviour"). So the value only
needs to be clear to a person, not match any BTC Map vocabulary. The BJ category set
(`restaurant, cafe, hotel, retail, tourism, health, services, transport, other`) is fine as-is.
For multi-category merchants, send the primary as `category` and the rest as a
`;`-joined `extra_fields.categories` hint (what the web backend does):

```jsonc
"category": "restaurant",
"extra_fields": { "categories": "restaurant;cafe", ... }
```

If you want the imported pins to land with the **right icon** quickly, the higher-leverage move
is to give the human editor (or the bulk-import coordinator) the correct **OSM tags** per
merchant — `amenity=restaurant|cafe|bar|pharmacy|dentist`, `tourism=hotel`, `shop=*`, etc. —
since those are what BTC Map keys off. Agree the tag conventions with the BTC Map team as part
of the bulk-import coordination.

---

## RPC methods you'll use

All are JSON-RPC 2.0 POSTs to `BTCMAP_RPC_URL` (`https://api.btcmap.org/rpc`) with
`Authorization: Bearer <IMPORT_TOKEN>`.

- **`submit_place(params)`** → `{ id, origin, external_id }`. Create/update (upsert by
  `external_id`).
- **`get_submitted_place({ origin, external_id })`** (or `{ id }`) → full submission, or RPC
  error `"can't find place with provided origin and external_id"` when absent. Use to verify a
  write landed and to read ownership.
- **`revoke_submitted_place({ origin, external_id })`** (or `{ id }`) → soft-delete
  (`revoked: true`); the row persists with the flag. Use to retire a submission / clean up tests.

Errors come back in the JSON-RPC envelope as `body.error` (HTTP stays 200) — check
`body.error`, don't rely on HTTP status.

---

## Reference: the corrected web mapping

For parity, the web backend's `mapPayloadToPlace()` in `server/routes/moderate.ts` now emits
exactly this shape. Mirror it in the mobile re-import:

```ts
const normalizeUrl = (raw: string) => {
  const t = raw.trim();
  return !t || /^https?:\/\//i.test(t) ? t : `https://${t}`;
};

const categories = payload.categories.map(String);
const extra_fields: Record<string, string> = {};
if (categories.length > 1) extra_fields.categories = categories.join(';'); // human hint only
if (payload.phone) extra_fields.phone = payload.phone;
if (payload.website) extra_fields.website = normalizeUrl(payload.website);  // must be http(s)
if (payload.description) extra_fields.description = payload.description;
// NOTE: no payment:bitcoin-jungle field — payment_provider is derived from origin server-side.

const place = {
  name: payload.name,
  lat: payload.coordinates.latitude,
  lon: payload.coordinates.longitude,
  category: categories[0] ?? 'other',
  extra_fields,
};
// submit_place({ origin: 'bitcoin-jungle', external_id: 'bj:<merchantId>', ...place })
```

---

## Read-API behaviour — investigated live 2026-06-02

We ran the probes. Findings (these change how ownership detection and category filtering must
work — read carefully):

### Submitted places are NOT on `/v4/places/{id}` by their submit id

`submit_place` returns an `id` from the **submission/import queue**, which is a **separate id
space** from public places. We submitted a place, got `id: 15481`, and `GET /v4/places/15481`
returned a completely unrelated pre-existing place (an Italian furniture store). Submitted
places only become public `/v4/places` rows **after BTC Map's import pipeline processes them**
— there is propagation latency and a different id. **Do not** assume the submit id maps to a
read-API place id.

→ Until a submission is imported + propagated, the **only** way to read it back / check
ownership is `get_submitted_place({ origin, external_id })` via the RPC.

### Ownership signal on the read API = `payment_provider`, NOT `osm:payment:bitcoin-jungle`

- `osm:payment:bitcoin-jungle` does **not** exist on the read API (0 of 28,035 places).
- **`payment_provider` is a real, exposed, indexed read field** (8,112 places have it). Current
  distinct values: `square` (7,441), `coinos` (671) — these are the registered vendors. PR #94
  registers the `bitcoin-jungle` vendor with `payment_provider: "bitcoin-jungle"`, so once BJ
  merchants are imported they should surface **`payment_provider: "bitcoin-jungle"`** on
  `/v4/places`. That is the clean client-side ownership check for both web and mobile read
  sides (and for `resolveOwnership` once a place is public).
- **Action:** after your first real `bj:<id>` import propagates, fetch it from
  `/v4/places?fields=id,payment_provider,icon,osm:amenity` and confirm it carries
  `payment_provider: "bitcoin-jungle"`. Report back — that confirms the read-side ownership
  flag is viable without an RPC round-trip.

### Category: submit `category` is NOT read-exposed — `icon` + `osm:amenity` are

- The submit-time `category` field appears on **0** read-API places. The read side
  (`src/lib/btcmap.ts` → `inferCategory`) derives category from **`icon`** (Material Symbols
  names) first, then **`osm:amenity` / `osm:shop` / `osm:tourism` / …**.
- BTC Map's actual `icon` vocabulary (from live CR data) is Material Symbols, e.g.
  `restaurant`, `local_cafe`, `hotel`, `storefront`, `medical_services`, `fitness_center`,
  `lunch_dining`, `local_bar`, `dentistry`, `directions_car`, `tour`, `local_grocery_store`.
- Our BJ slugs (`restaurant cafe hotel retail tourism health services transport other`) only
  **coincidentally** match (`restaurant`, `hotel`). The rest diverge:
  `cafe → local_cafe`, `retail → storefront`, `health → medical_services`,
  `services → business`, `transport → directions_car`.
- **Implication:** the free-string `category` you send to `submit_place` will **not** drive the
  imported place's `icon`/OSM tags unless BTC Map maps it. What actually controls the read-side
  icon is the **OSM tagging applied during import**. So for the re-import to land with correct
  icons/categories, you must either (a) send proper OSM tags the importer promotes
  (`amenity=restaurant`, `amenity=cafe`, `tourism=hotel`, `shop=*`, `amenity=clinic|pharmacy`,
  etc.), or (b) confirm with the BTC Map team that submit `category` is mapped to an icon and
  get their accepted category vocabulary. **Confirm this with BTC Map before the bulk import** —
  otherwise ~610 pins land with a generic icon and our category filter breaks.
