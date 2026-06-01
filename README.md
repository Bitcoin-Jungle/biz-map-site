# Bitcoin Jungle Merchant Map

Vite, React, and TypeScript single-page app for the Bitcoin Jungle merchant map. The browser reads the public BTC Map API directly. A thin Fastify backend serves the built SPA, signs Apple MapKit tokens, stores a SQLite moderation queue for merchant submissions, sends moderation emails, and forwards approved submissions to the BTC Map Import RPC.

## Local Development

Install dependencies:

```sh
npm install
```

Run the frontend and API in separate terminals:

```sh
npm run dev
npm run server:dev
```

The Vite dev server is used for the SPA, and the API must also be running for endpoints such as `/api/token`.

To test the integrated production-style server locally:

```sh
npm run build
npm run start
```

That serves `./dist` and the `/api` routes on `http://localhost:8080` by default.

## Environment

Use `.env.example` as the reference. Do not commit real secrets.

- `APPLE_MAPS_KEY`: Apple MapKit private key PEM, with newlines escaped as `\n`.
- `APPLE_TEAM_ID`: Apple developer team ID used as the MapKit JWT issuer.
- `MAPS_KEY_ID`: Apple MapKit key ID used as the JWT `kid`.
- `SITE_ORIGIN`: Browser origin allowed in the MapKit JWT.
- `SENDGRID_API_KEY`: SendGrid API key for moderation email. If blank, development logs email output.
- `APPROVE_KEY`: Shared secret required by approval and rejection moderation links.
- `IMPORT_TOKEN`: BTC Map Import RPC bearer token. Keep server-side only.
- `BTCMAP_RPC_URL`: BTC Map JSON-RPC endpoint.
- `PUBLIC_URL`: Public base URL used when building moderation links.
- `PORT`: Fastify HTTP port. Defaults to `8080`.
- `DB_PATH`: SQLite database path for the submission queue. Defaults to `./data/submissions.db` locally and `/app/data/submissions.db` in Docker.

## Docker

Build the image:

```sh
docker build -t bj-map .
```

Run it:

```sh
docker run -p 8080:8080 --env-file .env -v bjmap-data:/app/data bj-map
```

The `bjmap-data` volume persists the SQLite submission queue database.

## Deployment

The production target is a single container on Bitcoin Jungle infrastructure, fronted by Caddy for automatic TLS at `maps.bitcoinjungle.app`. A minimal `Caddyfile` is included and reverse-proxies to the app on port `8080`.

A pure static host such as Cloudflare Pages is not sufficient on its own because MapKit token signing and submission moderation must run server-side. If static or edge hosting is desired later, the API would need to move to serverless or edge functions, and `IMPORT_TOKEN` must remain server-side.

## Cutover

Keep BJ's legacy `/api/list` running read-only until the new site and mobile clients are verified. The full migration plan lives in `PLAN.md`.
