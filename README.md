# personalsite

Richard Brown's personal site: notes, side projects and a `/now` page.
Built with [Astro](https://astro.build) and MDX, styled with hand-written CSS, and served as static assets on Cloudflare.

## Getting started

Requires Node 24+ and pnpm.

```sh
pnpm install
pnpm dev       # http://localhost:4321
```

## Scripts

| Command             | What it does                                            |
| ------------------- | ------------------------------------------------------- |
| `pnpm dev`          | Start the dev server (drafts are shown)                 |
| `pnpm build`        | Production build into `dist/` (drafts excluded)         |
| `pnpm build:drafts` | Build including drafts                                  |
| `pnpm preview`      | Serve the built site locally                            |
| `pnpm check`        | Type-check with `astro check`                           |
| `pnpm lint`         | Check formatting (Prettier) and CSS (Stylelint)         |
| `pnpm lint:fix`     | Fix formatting and CSS lint issues                      |
| `pnpm validate`     | Validate built HTML and check links (run after a build) |

## Layout

- `src/content/`: notes, projects and `/now` revisions (content collections)
- `src/data/`: YAML for the spec block, changelog, status rows and so on
- `src/site.config.ts`: site-wide settings such as name, links and nav
- `src/components/`, `src/layouts/`, `src/pages/`, `src/styles/`: the site itself

Every collection supports `draft: true`. Drafts show in `pnpm dev` but never in a production build.

## Git hooks

`pnpm install` points `core.hooksPath` at `.githooks/`. The pre-commit hook runs `pnpm lint:fix` and re-stages any staged files it fixed. Skip it with `git commit --no-verify`.s
