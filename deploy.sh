#!/usr/bin/env bash
#
# deploy.sh — build & run the Bitcoin Jungle map on a Docker host (run ON the VM).
#
# Clones/updates the public repo, builds the image, and (re)starts the container.
# Secrets are NOT in the repo: they live in a local env file on the VM (ENV_FILE),
# and the per-environment domain is injected here (SITE_ORIGIN/PUBLIC_URL).
#
# Usage (prod):
#   ./deploy.sh
# Usage (staging, until the branch is merged to main):
#   BRANCH=btcmap-migration DOMAIN=maps-next.bitcoinjungle.app BIND=0.0.0.0 ./deploy.sh
#
# Prereqs: docker + git installed; ENV_FILE present with the secrets.
set -euo pipefail

REPO="${REPO:-https://github.com/Bitcoin-Jungle/biz-map-site.git}"
BRANCH="${BRANCH:-main}"
APP_DIR="${APP_DIR:-$HOME/biz-map-site}"
ENV_FILE="${ENV_FILE:-$HOME/bj-map/.env}"
DOMAIN="${DOMAIN:-maps.bitcoinjungle.app}"
NAME="${NAME:-bj-map}"
PORT="${PORT:-8080}"           # host port the reverse proxy forwards to
BIND="${BIND:-127.0.0.1}"      # 127.0.0.1 = local proxy only; 0.0.0.0 = exposed (e.g. tailnet testing)
VOLUME="${VOLUME:-bjmap-data}" # persists the SQLite submission queue

log() { printf '\033[1;32m==>\033[0m %s\n' "$*"; }
die() { printf '\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }

command -v git >/dev/null 2>&1 || die "git not installed (sudo apt-get install -y git)"
command -v docker >/dev/null 2>&1 || die "docker not installed"
[ -f "$ENV_FILE" ] || die "env file not found: $ENV_FILE (create it with the secrets; see .env.example)"

# Use sudo for docker only if the current user can't reach the daemon directly.
DOCKER="docker"
docker info >/dev/null 2>&1 || DOCKER="sudo docker"

log "Repo $REPO @ $BRANCH -> $APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch --depth 1 origin "$BRANCH"
  git -C "$APP_DIR" checkout -f "$BRANCH"
  git -C "$APP_DIR" reset --hard "origin/$BRANCH"
else
  git clone --depth 1 --branch "$BRANCH" "$REPO" "$APP_DIR"
fi
REV="$(git -C "$APP_DIR" rev-parse --short HEAD)"

log "Building image $NAME:$REV"
$DOCKER build -t "$NAME:$REV" -t "$NAME:latest" "$APP_DIR"

log "(Re)starting container $NAME (bind $BIND:$PORT -> 8080, domain https://$DOMAIN)"
$DOCKER rm -f "$NAME" >/dev/null 2>&1 || true
$DOCKER run -d --name "$NAME" \
  --env-file "$ENV_FILE" \
  -e SITE_ORIGIN="https://$DOMAIN" \
  -e PUBLIC_URL="https://$DOMAIN" \
  -e PORT=8080 \
  -p "$BIND:$PORT:8080" \
  -v "$VOLUME:/app/data" \
  --restart unless-stopped \
  "$NAME:latest"

log "Waiting for health..."
for i in $(seq 1 15); do
  if curl -fsS "http://127.0.0.1:$PORT/api/token" >/dev/null 2>&1; then
    log "Healthy: $NAME ($REV) serving on $BIND:$PORT for https://$DOMAIN"
    $DOCKER image prune -f >/dev/null 2>&1 || true
    exit 0
  fi
  sleep 2
done

die "Healthcheck failed; recent logs:
$($DOCKER logs --tail 40 "$NAME" 2>&1)"
