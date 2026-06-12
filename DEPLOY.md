# Deploy to prod

How `maps.bitcoinjungle.app` is built, deployed, and operated. The app is a single
Fastify process (`tsx server/index.ts`) that serves both the API (`/api/*`) and the
built SPA (`dist/`) from one container.

## Topology

| Piece | Value |
|-------|-------|
| Repo | `github.com/Bitcoin-Jungle/biz-map-site` (remote `origin`) |
| Deploy branch | `btcmap-migration` (⚠ not yet merged to `main`) |
| Prod host | `debian@100.64.0.34` (tailnet; hostname `maps`) |
| SSH | `ssh -i ~/.ssh/id_mbp_ed25519 debian@100.64.0.34` |
| App dir on box | `/home/debian/biz-map-site` |
| Container | `bj-map` (image `bj-map:latest`), `0.0.0.0:8080 -> 8080` |
| Data volume | `bjmap-data` → `/app/data` (SQLite submission queue; **persists across deploys**) |
| Secrets | `/home/debian/bj-map/.env` on the box (gitignored; never in the image) |
| On-box reverse proxy | Caddy: `maps.bitcoinjungle.app → 127.0.0.1:8080` (`Caddyfile`) |

### ⚠ DNS / Netlify cutover is incomplete (2026-06-02)

`maps.bitcoinjungle.app` currently resolves to **Netlify**, not the box. Netlify proxies
only **GET `/api/token`** through; it returns **404 on `POST /api/submit`** and **400 on
`/api/approve`**. Consequences until the cutover finishes:

- The browser **"Add a pin"** POST and the **email approve link** (which uses
  `PUBLIC_URL=https://maps.bitcoinjungle.app`) **do not reach the box** — they hit Netlify
  and fail.
- The box itself is fully functional; reach it directly on the tailnet:
  `http://100.64.0.34:8080/api/*`.

**To finish the cutover:** point `maps.bitcoinjungle.app` DNS at the box (Caddy terminates
TLS and proxies to `:8080`), or configure Netlify to proxy **all** `/api/*` (every method)
to the box. Verify with `curl -X POST https://maps.bitcoinjungle.app/api/submit` returning
200, not 404.

## Standard deploy (clean rebuild via deploy.sh)

`deploy.sh` is idempotent: it `git reset --hard origin/$BRANCH`, builds the image, swaps the
container (old one keeps serving until the new image is built), and waits for the
`/api/token` healthcheck.

```bash
# 1. Land the change on the deploy branch and push (deploy.sh pulls from origin)
git add -A && git commit -m "…"
git push origin btcmap-migration

# 2. Build + restart on the box
ssh -i ~/.ssh/id_mbp_ed25519 debian@100.64.0.34 \
  'cd ~/biz-map-site && BRANCH=btcmap-migration DOMAIN=maps.bitcoinjungle.app BIND=0.0.0.0 ./deploy.sh'
```

`deploy.sh` injects per-env values and reads secrets from `$HOME/bj-map/.env`:
`-e SITE_ORIGIN=https://$DOMAIN -e PUBLIC_URL=https://$DOMAIN --env-file ~/bj-map/.env`.
On success it prints `Healthy: bj-map (<rev>) serving on 0.0.0.0:8080 …`. On failure it
dumps the last 40 log lines and exits non-zero (the old container is already gone at that
point — re-run after fixing).

Defaults if you omit the vars: `BRANCH=main`, `DOMAIN=maps.bitcoinjungle.app`,
`BIND=127.0.0.1`. Always pass `BRANCH=btcmap-migration` until it's merged, and `BIND=0.0.0.0`
to match the current container.

## Hotfix deploy (server-only, no image rebuild)

The runtime executes the TypeScript directly via `tsx`, so a server-side change can be
shipped without a full `npm ci` + `vite build`. Faster, but **diverges from the image** — the
next `deploy.sh` reverts it, so always land + push the change too.

```bash
# copy updated server source into the running container and restart
rsync -e 'ssh -i ~/.ssh/id_mbp_ed25519' -a server/ debian@100.64.0.34:/tmp/server/
ssh -i ~/.ssh/id_mbp_ed25519 debian@100.64.0.34 \
  'docker cp /tmp/server/. bj-map:/app/server/ && docker restart bj-map'
```

Frontend (`dist/`) changes **do** need a rebuild (`deploy.sh`) — they're baked into the image.

## Required env (`~/bj-map/.env` on the box)

| Key | Purpose |
|-----|---------|
| `IMPORT_TOKEN` | Bearer token for BTC Map Import RPC (`origin: bitcoin-jungle`) |
| `APPROVE_KEY` | Shared secret in the approve/reject email links |
| `SENDGRID_API_KEY` | Sends the approval email to `mapadd@bitcoinjungle.app` |
| `PUBLIC_URL` | Base URL baked into approve/reject links (set by deploy.sh to `https://$DOMAIN`) |
| `APPLE_MAPS_KEY`, `APPLE_TEAM_ID`, `MAPS_KEY_ID` | MapKit JS token signing (`/api/token`) |

If `SENDGRID_API_KEY` is unset the server logs the email instead of sending (safe local mode).

## Verify a deploy

```bash
# health + which revision is live (deploy.sh prints the rev; confirm code is in the container)
ssh -i ~/.ssh/id_mbp_ed25519 debian@100.64.0.34 'docker ps --filter name=bj-map; docker logs --tail 20 bj-map'
curl -fsS http://100.64.0.34:8080/api/token        # box directly (always works)
curl -fsS https://maps.bitcoinjungle.app/api/token # through Netlify (GET only, today)
```

## Operational notes

- **The submission queue (SQLite) lives in the `bjmap-data` volume**, not the image — deploys
  don't drop pending submissions. To inspect:
  `docker exec bj-map sh -c 'ls -la /app/data'`.
- **Approving an `add`** calls BTC Map `submit_place`, which queues a Gitea ticket for manual
  OSM entry — it does **not** publish a pin instantly. See `OPEN_ISSUES.md` #1/#3 and
  `HANDOFF_btcmap_submit_schema.md`.
- **Restart policy** on the current container is whatever `deploy.sh` set
  (`--restart unless-stopped`). A box reboot brings `bj-map` back automatically.
- **Rollback:** images are tagged per commit (`bj-map:<rev>`). To roll back without a rebuild:
  `docker tag bj-map:<oldrev> bj-map:latest` is not enough (container must be recreated) —
  re-run `deploy.sh` after `git reset`ing to the previous commit, or
  `docker rm -f bj-map && docker run … bj-map:<oldrev>` mirroring deploy.sh's run block.
