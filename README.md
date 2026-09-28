# z08 studio

The English-first website for z08 studio: small, focused tools that do one thing well. It brings together Ztab, Zdraft, and This Week in Obsidian, with a short introduction to their maker, Bear Wang.

Built with Astro, static HTML, and native CSS. Fonts and images are self-hosted. No database or client-side framework is required. Optional Google Analytics loads only after visitor consent.

## Development

Use Node.js 24 (see `.node-version`) and pnpm 11.20.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The development server runs at <http://127.0.0.1:4321>.

```sh
pnpm check    # Check Astro and TypeScript
pnpm build    # Build the static site in dist/
pnpm preview  # Preview the production build
```

## Content and maintenance

Use English for documentation, code comments, UI copy, and contribution discussions.

| File | Purpose |
| --- | --- |
| `src/data/studio.ts` | Studio details, project descriptions, links, icons, and order |
| `src/pages/index.astro` | Homepage |
| `src/pages/about.astro` | Maker's story |
| `src/pages/privacy.astro` | Analytics and privacy notice |
| `src/components/SiteHeader.astro`, `SiteFooter.astro` | Shared navigation and footer |
| `src/components/ProjectCard.astro` | Project card |
| `src/data/analytics.ts` | Public analytics configuration |
| `src/components/Analytics.astro`, `src/scripts/analytics.ts` | Consent controls and analytics loading |
| `src/styles/global.css` | Layout, typography, colors, and responsive styles |
| `public/images/` | SVG assets |
| `src/assets/` | Images optimized during the build |
| `astro.config.mjs` | Canonical website origin |
| `deploy/` | Vultr/Docker hosting configuration and instructions |

To add a project, add an entry to `projects` in `src/data/studio.ts`. Array order determines display order. Use an HTTPS destination and one clear description.

```ts
{
  id: 'project-slug',
  name: 'Project name',
  category: 'Web app',
  description: 'What the project does and who it helps.',
  href: 'https://example.com',
  linkLabel: 'Explore the project',
  image: '/images/project.svg',
  background: '#eef1f6',
  imageWidth: 130,
},
```

Import PNG/JPEG images from `src/assets/` and pass them to `image`; Astro generates optimized WebP variants. Put SVG files in `public/images/`.

When adding a page, update `src/pages/sitemap.xml.ts`. When changing the production domain, update `astro.config.mjs`, `public/robots.txt`, `src/data/analytics.ts`, the gateway configuration, and the Analytics web stream.

## Design explorations

Open `/explore/` in the local preview to compare Editorial, Workbench, and Signal. The overview includes desktop and mobile miniatures; each full-size design has a switcher for moving between versions and the current homepage.

The studies share project data from `src/data/studio.ts`, with isolated layouts and styles under `src/pages/explore/`, `src/components/explore/`, and `src/styles/explore/`. Preview routes disable analytics, declare `noindex`, and are excluded from the sitemap.

## Analytics

Copy `.env.example` to `.env` and set `PUBLIC_GOOGLE_ANALYTICS_ID` to your GA4 web stream measurement ID before building. With no ID configured, analytics and its cookie prompt are disabled.

The measurement ID is a public browser identifier, not a credential. Its deployment-specific value stays out of source control. Never put API keys or other secrets in `PUBLIC_` variables: Astro includes them in the browser build.

Analytics runs only on the HTTPS production hostnames listed in `src/data/analytics.ts`. Development, local previews, and other hostnames do not collect data. Visitors can accept or decline, and can change their choice using **Cookie settings** in the footer. The choice lasts 180 days. Before consent, no Google script or analytics request is sent. Withdrawing consent stops collection and removes the site's Analytics cookies.

In the GA4 web stream, enable page views, scrolls, and outbound clicks. Disable history-based page views for this static site so anchor links are not counted as new pages. Site search, form, video, and download measurement are unnecessary for the current pages. Advertising storage, Google signals, and advertising personalization are disabled in the integration.

After deployment, allow analytics in a browser and confirm a visit in **Realtime**. Project links use the enhanced-measurement `click` event with `link_url` and `link_domain`. Visitors who decline or block analytics do not appear in reports.

References: [Google consent mode](https://developers.google.com/tag-platform/security/guides/consent), [outbound click measurement](https://support.google.com/analytics/answer/13566436).

## Deployment

The site is hosted on a Vultr server using Docker and the server's existing Caddy HTTPS gateway. A small, isolated static-file service serves versioned builds. Deployments switch an atomic `current` symlink and keep previous releases for rollback.

See [the deployment guide](deploy/README.md) for setup, updates, verification, and rollback. Hostnames, SSH targets, gateway paths, and Docker network names belong in the ignored `.deploy.env` file. Only public example configuration is committed.

## Repository hygiene

Keep credentials, private account identifiers, infrastructure addresses, local paths, deployment receipts, and generated output out of commits. `.env` and `.deploy.env` are ignored; their example files contain placeholders only. Use GitHub's no-reply commit email when contributing. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Assets

- z08 studio: the existing studio wordmark and blue `#143EAB` palette.
- Ztab and Zdraft: official product icons.
- This Week in Obsidian: current artwork from the [official newsletter](https://thisweekinobsidian.substack.com/).
- Inter: self-hosted through `@fontsource-variable/inter`, under the [SIL Open Font License](https://github.com/rsms/inter/blob/master/LICENSE.txt).

Product names and brand artwork identify their respective projects. Do not assume that publishing this repository grants trademark rights.
