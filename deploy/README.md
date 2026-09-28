# Deploying on Vultr

The website runs as a static-file container behind an existing Caddy HTTPS gateway on a Vultr server. Only the gateway publishes ports 80 and 443. The site joins the gateway's Docker network and has no public container ports.

## Operator configuration

Requirements: Docker with Compose on the server, an existing gateway network, SSH access, and the local Node.js/pnpm versions from the root README.

```sh
cp .env.example .env
cp .deploy.env.example .deploy.env
```

Set the optional GA4 measurement ID in `.env`. Set the server's SSH alias, deployment directory, gateway Docker network, gateway container, and host-side gateway Caddyfile path in `.deploy.env`. These files are ignored by Git. SSH uses the operator's existing key or agent; never copy a private key into this repository.

The pinned Caddy image is shared with the current hosting stack. Review image updates deliberately; do not replace the digest with `latest`.

## First deployment

Commit the site and configuration templates, then run:

```sh
bash scripts/deploy.sh
```

The script checks and builds the site, uploads only the static artifact and public server configuration, verifies its checksum, and starts the private static service. It does not upload `.env`, `.deploy.env`, source files, or SSH credentials.

On the server, back up the existing gateway Caddyfile. Add the site blocks from `deploy/gateway.caddy` without replacing other sites. Validate and gracefully reload the gateway:

```sh
# Run in an operator shell with .deploy.env loaded.
docker exec "$Z08_GATEWAY_CONTAINER" caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
docker exec "$Z08_GATEWAY_CONTAINER" caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
```

Point the domain's A record to the Vultr server's public IPv4 address. Add `www` as a CNAME to the root domain. Use direct DNS records so Caddy can serve HTTPS itself. Add an AAAA record only when the server's IPv6 route is configured and verified. Caddy obtains and renews certificates, redirects HTTP to HTTPS, and redirects `www` to the canonical root domain.

The domain registrar and DNS service can remain separate from hosting. No provider-specific hosting files are required.

## Updates and verification

After merging a reviewed change, pull the production branch and run `bash scripts/deploy.sh` again. The script requires a clean checkout, builds locally, verifies the uploaded archive, validates Caddy, switches the `current` symlink atomically, and checks the site's pages. If an update fails, it restores the previous release and configuration. It records the source revision and archive checksum in a server-side receipt.

Verify the public site after each deployment:

```sh
curl --fail --head https://z08studio.com/
curl --fail --head https://z08studio.com/about/
curl --fail --head https://z08studio.com/privacy/
curl --head https://www.z08studio.com/
curl --head https://z08studio.com/missing-page
```

Expect successful pages, a `www` redirect to the root domain, and HTTP 404 for a missing page. Check an `/_astro/` asset for immutable caching. Inspect desktop/mobile navigation, project links, and cookie controls. A consenting production visit should appear in Analytics Realtime; local previews must not send analytics.

## Runtime layout and rollback

The deployment root contains:

```text
config/Caddyfile             Static-service configuration
compose.yaml                Container definition
runtime.env                 Private operator settings
incoming/                   Uploaded build archives
releases/<release>/site/    Versioned public files
releases/current            Atomic symlink to the active site directory
receipts/<release>/          Revision, checksum, previous target, and config backup
```

To roll back a content-only release, select a known-good directory under `releases/`, create a temporary symlink to `<release>/site`, and atomically rename it to `releases/current` with `mv -Tf`. No service restart is needed for a content-only rollback. If the server configuration changed, restore the matching files from that release's receipt, validate them, and reload the static service as well. Recheck the public pages afterward.

Keep receipts and operator settings on the server, outside Git. Retain previous releases until the current release is verified; remove old artifacts separately from deployment.

References: [Caddy static files](https://caddyserver.com/docs/caddyfile/directives/file_server), [custom error pages](https://caddyserver.com/docs/caddyfile/directives/handle_errors), [Docker Compose networking](https://docs.docker.com/compose/how-tos/networking/).
