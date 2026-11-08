# Personal site: build plan

Design source: the **Personal Site Design** canvas (Direction A, "Richard, as a system", Ops Manual design system).

## Decisions

| Area | Choice | Why |
|---|---|---|
| Generator | Astro + MDX, TypeScript | Zero JS by default; content collections give typed frontmatter; components map 1:1 to the design's spec blocks, uptime rows, etc. |
| Styling | Hand-written modern CSS, no frameworks | Custom properties for tokens, cascade layers, `:has()`, container queries, logical properties |
| Hosting | Cloudflare (Workers static assets / Pages), free tier | Unlimited bandwidth, commercial use allowed, PR preview URLs. Vercel Hobby caps bandwidth and forbids commercial use |
| Deploy | GitHub repo → Cloudflare git integration | Push to `main` deploys; PRs get previews |
| Domain | Buy via Cloudflare Registrar | At-cost pricing, DNS already in the right place |
| Fonts | Self-hosted, subset woff2 (Archivo variable incl. `wdth` axis, JetBrains Mono 400/700) | No third-party requests |
| Analytics | None | Honours "no cookies" literally |
| Client JS | Only the day/night toggle (~20 lines, inline in `<head>` to avoid flash) | Everything else is HTML + CSS |

## Pages

| Route | Source | Notes |
|---|---|---|
| `/` | `pages/index.astro` | Hero + spec block, architecture diagram, status (uptime rows), log of latest entries |
| `/notes`, `/notes/[slug]` | `content/notes/*.mdx` | Reading mode: no grid, 680px measure, sidenotes, Shiki highlighting, prev/next |
| `/projects` | `content/projects/*.md` | Service catalogue; CSS-only filters; graveyard table |
| `/now` | `content/now.md` (single entry) | Standup format; "Change history →" links to the file's GitHub history |
| `/about` | `pages/about.astro` + data | README, changelog, `.richardrc`, open ports |
| `/rss.xml` | `@astrojs/rss` | Notes (and optionally projects) |
| `/404` | | "Incident" page in the same voice |

`/uses` and `/status` (dashed in the sitemap) are deferred.

## Content model (Astro content collections, Zod schemas)

- **notes**: `title`, `description`, `date`, `updated?`, `tags[]`, `draft`. Read time computed at build.
- **projects**: `title`, `summary`, `status: shipped | in-progress | abandoned`, `stack[]`, `started`, `ended?`, `featured`, `causeOfDeath?`, `writeUp?` (reference to a note).
- **now**: one YAML file per revision in `src/content/now/` (`date`, `summary`, `shipped[]`, `inProgress[]`, `blockers[]`, `loadout{}`, `notDoing[]`). The newest is the live page; older ones are its change history and feed the home log.
- **site data** (`src/data/*.yaml`): spec block rows, changelog, `.richardrc`, open ports, jokey status rows. Each file is a single `items:` list, because collections otherwise sort entries by id.
- **drafts**: every collection has `draft`; drafts render in `astro dev` and never in production. All placeholder content from the design is seeded as drafts.
- Helpers live in `src/lib/content.ts`: `getNotes`, `getProjects`, `getNowRevisions`, `getList`, `getLog`, `getStatusRows`.

## Build-time derived data

- **Writing uptime**: 45 day-buckets; a bucket is "up" if a note was published or updated in the trailing window (exact rule to tune so the bars look honest).
- **Side projects uptime**: from project dates and statuses.
- **Joke rows** (Curiosity, Patience in meetings): hand-written in YAML.
- **Last deploy**: build timestamp (Cloudflare provides the commit SHA too, which can go in the footer).
- **Log on home**: merged, date-sorted feed of notes, projects and `/now` updates.

Note: the bars are frozen at build time, so they only move when the site deploys. If that matters, add a scheduled daily rebuild via a Cloudflare deploy hook (a cron Worker, or a GitHub Actions schedule). It's free either way.

## CSS architecture

```
src/styles/
  index.css        @layer reset, tokens, base, layout, components, utilities;
  reset.css        minimal modern reset
  tokens.css       colour, type, space; day values on :root, night under [data-theme="night"] and prefers-color-scheme
  base.css         element styles: typography, links, focus rings
  layout.css       page shell, .wrap (max-width 1280px), reading measure (680px)
  components/      one file per component, co-located or imported by the matching .astro file
```

- **Tokens**: `--paper`, `--sheet`, `--ink`, `--graphite`, `--rule`, `--signal`, `--signal-text`, `--operational`, `--grid-alpha`. Night shift remaps them as specified in canvas board 08, and `--signal` stays the same.
- **Theme**: `prefers-color-scheme` by default; a `data-theme` attribute on `<html>` overrides it once the toggle is clicked (stored in `localStorage`). Without JS the site still follows the system setting.
- **Type**: Archivo `font-stretch: 125%` / weight 900 for display; fluid sizes with `clamp()`; mono for labels.
- **Semantic markup**: `<dl>` for spec blocks, `<ol>` for log rows, `<figure>`/`<figcaption>` for every "FIG." caption, `<aside>` for sidenotes, `<nav aria-label>`; uptime bars are an `aria-hidden` graphic plus a visually hidden text summary.
- **Projects filter**: visually hidden radio group above the grid; `.catalogue:has(#f-shipped:checked) .project:not([data-status="shipped"]) { display: none }`.
- **Sidenotes**: an MDX `<Sidenote>` component; floats into the margin on wide screens via a grid, and sits inline below the paragraph on narrow screens.

## Components (`src/components/`)

`StatusBar`, `SiteNav`, `ThemeToggle`, `SpecBlock`, `ArchitectureDiagram`, `UptimeRow`, `LogList`, `Tag`/`StatusPill`, `Figure`, `Sidenote`, `DecisionRecord`, `ProjectCard`, `Graveyard`, `Footer`, plus `BaseLayout` and `ReadingLayout`.

## Quality bar

- Lighthouse 100s; no layout shift (preload the two key fonts, `size-adjust` fallbacks)
- WCAG AA contrast in both themes (the night-shift numbers are already checked in the design)
- Works with JS disabled; zero third-party requests
- `astro check` + Prettier + Stylelint; HTML validation and a link check in CI on PRs
- Security headers via a `_headers` file: CSP with a hash for the inline theme script, HSTS, `Referrer-Policy`

## Build order

1. Scaffold: Astro + MDX + TS, GitHub repo, Cloudflare project, buy domain
2. Tokens, reset, fonts, base layout, status bar, nav, footer, theme toggle (day + night)
3. Content collections and schemas; seed with placeholder entries
4. Home: spec block, architecture diagram, uptime rows from derived data, log
5. Notes index + reading layout: Shiki dual theme, sidenotes, figures, decision record, RSS
6. Projects (with the CSS filter), Now, About, 404
7. Polish: OG images (build-time, optional), sitemap, headers, CI checks
8. Replace every `[PLACEHOLDER]` with real content, then launch
