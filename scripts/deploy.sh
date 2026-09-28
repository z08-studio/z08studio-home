#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"
[[ $# -eq 0 ]] || { printf '%s\n' 'Usage: scripts/deploy.sh' >&2; exit 1; }
[[ -f .deploy.env ]] || { printf '%s\n' 'Copy .deploy.env.example to .deploy.env and configure the target.' >&2; exit 1; }
# This file is trusted, local operator configuration, never part of an upload.
source .deploy.env
: "${Z08_DEPLOY_HOST:?}" "${Z08_DEPLOY_ROOT:?}" "${Z08_DOCKER_NETWORK:?}"
[[ "$Z08_DEPLOY_HOST" =~ ^[A-Za-z0-9][A-Za-z0-9._@-]*$ ]] || exit 1
[[ "$Z08_DOCKER_NETWORK" =~ ^[A-Za-z0-9][A-Za-z0-9_.-]*$ ]] || exit 1
[[ "$Z08_DEPLOY_ROOT" =~ ^/[A-Za-z0-9_/-]+$ && "$Z08_DEPLOY_ROOT" != / && "$Z08_DEPLOY_ROOT" != */ ]] || exit 1
[[ -z "$(git status --porcelain)" ]] || { printf '%s\n' 'Commit or stash changes before deploying a reproducible release.' >&2; exit 1; }

pnpm check
pnpm build
revision="$(git rev-parse HEAD)"
release_id="$(date -u +%Y%m%dT%H%M%SZ)-${revision:0:12}"
package_dir="$(mktemp -d "${TMPDIR:-/tmp}/z08studio-deploy.XXXXXX")"
trap 'rm -rf "$package_dir"' EXIT
mkdir "$package_dir/site" "$package_dir/config"
cp -R dist/. "$package_dir/site/"
cp deploy/Caddyfile deploy/compose.yaml "$package_dir/config/"
printf '%s\n' "$revision" > "$package_dir/revision"
if [[ "$(uname -s)" == Darwin ]]; then
  COPYFILE_DISABLE=1 tar --no-xattrs --disable-copyfile -czf "$package_dir/release.tar.gz" -C "$package_dir" site config revision
else
  tar -czf "$package_dir/release.tar.gz" -C "$package_dir" site config revision
fi
archive_sha="$(shasum -a 256 "$package_dir/release.tar.gz" | awk '{print $1}')"
ssh -o BatchMode=yes -o ConnectTimeout=10 "$Z08_DEPLOY_HOST" "mkdir -p '$Z08_DEPLOY_ROOT/incoming'"
scp -q "$package_dir/release.tar.gz" "$Z08_DEPLOY_HOST:$Z08_DEPLOY_ROOT/incoming/$release_id.tar.gz"

ssh -o BatchMode=yes -o ConnectTimeout=10 "$Z08_DEPLOY_HOST" bash -s -- "$Z08_DEPLOY_ROOT" "$Z08_DOCKER_NETWORK" "$release_id" "$archive_sha" <<'REMOTE'
set -euo pipefail
root="$1"
network="$2"
release_id="$3"
archive_sha="$4"
umask 022
exec 9> "$root/deploy.lock"
flock -n 9 || { printf '%s\n' 'Another deployment is running.' >&2; exit 1; }
docker network inspect "$network" >/dev/null
if [[ ! -f "$root/.z08studio-home" ]]; then
  [[ ! -e "$root/config" && ! -e "$root/compose.yaml" && ! -e "$root/releases" ]] || { printf '%s\n' 'Refusing to replace an unmanaged deployment directory.' >&2; exit 1; }
  touch "$root/.z08studio-home"
fi
mkdir -p "$root/releases" "$root/config" "$root/receipts"
upload="$root/incoming/$release_id.tar.gz"
printf '%s  %s\n' "$archive_sha" "$upload" | sha256sum --check --status
release="$root/releases/$release_id"
[[ ! -e "$release" ]] || { printf '%s\n' 'Release already exists.' >&2; exit 1; }
mkdir "$release"
tar -xzf "$upload" -C "$release"
test -s "$release/site/index.html"
test -s "$release/site/404.html"
chmod -R a+rX "$release"
previous="$(readlink "$root/releases/current" || true)"
if [[ -n "$previous" ]]; then
  [[ "$previous" =~ ^[A-Za-z0-9_-]+/site$ && -d "$root/releases/$previous" ]] || exit 1
fi
receipt="$root/receipts/$release_id"
mkdir "$receipt"
chmod 700 "$receipt"
printf '%s\n' "$previous" > "$receipt/previous"
printf '%s\n' "$archive_sha" > "$receipt/archive-sha256"
cp "$release/revision" "$receipt/revision"
for file in config/Caddyfile compose.yaml runtime.env; do
  if [[ -f "$root/$file" ]]; then cp "$root/$file" "$receipt/$(basename "$file")"; fi
done

# Compose must not consume the remote shell script from SSH's standard input.
compose() { docker compose --env-file "$root/runtime.env" -f "$root/compose.yaml" "$@" </dev/null; }
rollback() {
  trap - ERR
  for file in config/Caddyfile compose.yaml runtime.env; do
    if [[ -f "$receipt/$(basename "$file")" ]]; then cat "$receipt/$(basename "$file")" > "$root/$file"; fi
  done
  if [[ -n "$previous" ]]; then
    ln -s "$previous" "$root/releases/.rollback-$release_id"
    mv -Tf "$root/releases/.rollback-$release_id" "$root/releases/current"
    compose up -d --wait --wait-timeout 60 site
    compose exec -T site caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
    printf '%s\n' 'Deployment failed; restored the previous release.' >&2
  else
    compose stop site || true
    printf '%s\n' 'Initial deployment failed; the site service was stopped.' >&2
  fi
  exit 1
}
trap rollback ERR
# Preserve the Caddyfile inode because the running container bind-mounts this file.
cat "$release/config/Caddyfile" > "$root/config/Caddyfile"
cp "$release/config/compose.yaml" "$root/compose.yaml"
printf 'Z08_DEPLOY_ROOT=%s\nZ08_DOCKER_NETWORK=%s\n' "$root" "$network" > "$root/runtime.env"
chmod 600 "$root/runtime.env"
compose config --quiet
compose run --rm --no-deps site caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
ln -s "$release_id/site" "$root/releases/.current-$release_id"
mv -Tf "$root/releases/.current-$release_id" "$root/releases/current"
compose up -d --wait --wait-timeout 60 site
compose exec -T site caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
for path in / /about/ /privacy/ /sitemap.xml; do
  compose exec -T site wget -q -O /dev/null "http://127.0.0.1:8080$path"
done
trap - ERR
printf '%s\n' 'healthy' > "$receipt/status"
printf 'Deployed %s. Previous releases and a deployment receipt are retained.\n' "$release_id"
REMOTE
