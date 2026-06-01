# Migration Plan: BJ Map → BTC Map data, off Netlify

## 1. What the current site actually is

A **Create React App (react-scripts 5)** SPA, hosted on **Netlify** + **Netlify Functions**.
Spanish/English, Costa-Rica-scoped, BJ-branded, with a wallet-download CTA.

| Concern | Current implementation |
|---|---|
| Map renderer | **Apple MapKit JS** via `mapkit-react`. Requires a JWT signed server-side (ES256) with an Apple private key. |
| Token | `/api/token` Netlify fn signs the MapKit JWT from `APPLE_MAPS_KEY` / `MAPS_KEY_ID` / `APPLE_TEAM_ID`. |
| Merchant data | `/api/list` fn proxies BJ's Strapi (`maps-api.bitcoinjungle.app`) with `STRAPI_API_KEY`; returns `{locations, categories}`. |
| Categories | Hand-maintained **bilingual ID-pair mapping** (en id ↔ es id), duplicated across `list/map.js` and `add/add.js`. ~30 IDs. |
| Add merchant | `/api/add` → writes unapproved row to Strapi → SendGrid email to `mapadd@` with a magic approve link. |
| Report | `/api/report` → unpublishes the row in Strapi + SendGrid email. |
| Approve | `/api/approve?id=&key=` GET, gated by `APPROVE_KEY`. |
| i18n | Tiny `en`/`es` dicts; lang from `?lang=` or `navigator.language`. |
| Branding | BJ logo (GCS), App Store + Play badges, GA `G-V9PXWJ1SEZ`. `?fromBJ=1` hides chrome when embedded in the mobile app and switches website links to clipboard-copy. |

**The single thing forcing a backend today is Apple MapKit** — its private key can't ship to the browser, so a token-signing endpoint is mandatory *as long as we use MapKit*. Everything else (`list`, `add`, `report`, `approve`, Strapi, SendGrid, the bilingual category tables) disappears when we move to BTC Map.

The mobile repo (`../bitcoin-jungle-mobile@map-isolation`) already has the entire BTC Map client written and reviewed: `app/utils/btcmap.ts` (fetch, CR bbox, category inference, payment parsing, localized name/desc, verification freshness, phone formatting), `app/utils/btcmap-submit.ts` (captcha → `/api/gitea/issue` web flow, no secret), and `app/types/btcmap.ts`. **We port these verbatim** so web and app behave identically.

## 2. Recommendation: Option A — thin static SPA, zero backend

Reject **B (redirect)** and **C (iframe)** outright: the brief *requires* keeping BJ branding, SEO, Spanish-first, the wallet CTA, and the `?fromBJ` embed behavior. B throws all of that away. C can't deliver it reliably — btcmap.org can break out of / refuse framing (`X-Frame-Options`/CSP) at any time, we can't scope it to CR or inject the CTA, and the mobile-embed contract dies. Both also leave us renting btcmap.org's UX with no control.

**Option A, with two structural changes that turn it into a genuinely backend-free static site:**

1. **Drop Apple MapKit → MapLibre GL JS.** This removes the *only* hard server dependency (the token signer) and the Apple Developer key-rotation liability. Tiles: self-host a **Protomaps `.pmtiles`** basemap (single static file, clipped to Costa Rica → a few MB, no tile server, no API key, no per-request cost). Renders vector tiles client-side. BTC Map itself is Leaflet/OSM; MapLibre gives us the same open-data look with full self-hosting.
2. **CRA → Vite.** `react-scripts` is unmaintained and pulls a large vulnerable dep tree; we're rewriting the data + map layers anyway, so the switch is nearly free and gives fast builds + a clean static `dist/`. Keep React + the existing components (`Add`, `Report`, `Modal`, the lang dicts).

### Resulting architecture

```
Browser (static bundle, no backend)
 ├─ MapLibre GL  ← self-hosted CR pmtiles basemap (static asset)
 ├─ BTC Map read:
 │    1. cdn.static.btcmap.org/api/v4/places.json   (id,lat,lon,icon,comments; ~2MB, CDN, <1s)
 │       → filter to CR bbox (N 11.22 / S 8.04 / E -82.55 / W -85.95) → render pins instantly,
 │         category from `icon` via inferCategory()
 │    2. on pin tap → enrich that place's detail (name/phone/website/desc/payment/verified_at)
 │    3. background incremental sync: GET api.btcmap.org/v4/places?fields=…&updated_since=<maxUpdatedAt>&include_deleted=true
 │       cached in IndexedDB; cursor = max(updated_at) of received places (not client clock)
 └─ Submissions (add / verify / report): captcha → POST btcmap.org/api/gitea/issue  (no secret, client-side)
```

No functions. No Strapi. No SendGrid. No approve flow (BTC Map's Supertaggers own moderation). The import token stays out of the browser entirely — we use the public captcha web flow, exactly like mobile.

**Open item to validate in implementation (not a blocker):** whether to enrich detail via a single-place GET vs. relying on the background full-field sync, depending on the real size of a full-field worldwide pull. Snapshot-first render means either choice is non-blocking. I'll confirm against the live API before committing the data layer.

### Self-host target

**Primary: a small static container (Caddy serving `dist/`) on BJ's existing infra** — same place that runs `maps-api.bitcoinjungle.app`. Full control, no new vendor, free, trivially reproducible (`Dockerfile` + `caddy` for gzip/br + far-future cache headers on hashed assets, no-cache on `index.html`). 
**Alternative: Cloudflare Pages** if you'd rather have zero-ops managed static hosting that is explicitly *not* Netlify. I recommend the container to keep everything under BJ's roof.

## 3. Cutover / DNS plan

**Precondition (not this repo's job, but gates cutover):** BJ's ~610 CR merchants must already be live in BTC Map under area 112 / `bitcoin-jungle` (via the Import RPC in the mobile migration). The web cutover assumes the data is in BTC Map.

1. Build + deploy the new static site to a staging URL (`maps-next.bitcoinjungle.app` or the host preview).
2. Verify on staging: CR pins match expectation, detail panel, category filter, es/en, `?fromBJ` embed behavior, add/verify/report captcha flow, wallet CTA, GA.
3. Point the mobile app's WebView (if it still embeds the map) at staging; confirm `?fromBJ` parity.
4. **Flip DNS:** repoint `maps.bitcoinjungle.app` from Netlify to the new host (CNAME/A). Keep TTL low (300s) for the day before, so rollback is fast. Provision TLS on the new host before the flip.
5. **Keep BJ's `/api/list` + Strapi running read-only** through the transition (old mobile builds + cached web clients may still hit it). Do **not** decommission until: new web verified in prod **and** new mobile shipped + verified, through a bake period (≥2 weeks of clean metrics).
6. Decommission Strapi/SendGrid/Apple Maps key + remove the Netlify site. Drop the now-dead `STRAPI_API_KEY`, `APPLE_MAPS_KEY`, `MAPS_KEY_ID`, `APPLE_TEAM_ID`, `SENDGRID_API_KEY`, `APPROVE_KEY` secrets.

## 4. Deliverables (after approval)

1. ✅ This plan (option + architecture + self-host target + cutover).
2. Rewritten static site: Vite + React, MapLibre + CR pmtiles, ported `btcmap` + `btcmap-submit` modules, CR bbox filter, es/en, BJ branding + CTA + `?fromBJ`, GA preserved. All Netlify functions deleted.
3. Self-host config: `Dockerfile` + `Caddyfile` (+ a note for the Cloudflare Pages alternative).
4. Cutover checklist (executable version of §3).

## 5. Decisions I need from you

- **Map renderer:** approve MapLibre + self-hosted CR pmtiles (drops the last backend), or keep Apple MapKit (keeps one token function)?
- **Build tool:** approve CRA → Vite, or stay on CRA?
- **Host:** static container on BJ infra (recommended) or Cloudflare Pages?
- **Submissions:** captcha web flow (recommended, no secret) — confirm. (Import RPC would need a server-side proxy, defeating "no backend".)
