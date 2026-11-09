// Checks every internal link and #fragment in the built site. External links are skipped:
// they flake in CI, and placeholders like github.com/[USERNAME] are tracked separately.
// Usage: node scripts/check-links.mjs [dist]
import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.argv[2] ?? 'dist';

const files = (await readdir(root, { recursive: true, withFileTypes: true }))
  .filter((e) => e.isFile() && e.name.endsWith('.html'))
  .map((e) => join(e.parentPath, e.name));

/** Route for a built file, matching Cloudflare's drop-trailing-slash handling. */
const routeOf = (file) =>
  '/' +
  relative(root, file)
    .replace(/(^|\/)index\.html$/, '')
    .replace(/\.html$/, '');

const pages = new Map();
for (const file of files) {
  const html = await readFile(file, 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const links = [...html.matchAll(/\s(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  pages.set(routeOf(file).replace(/\/$/, '') || '/', { file, ids, links });
}

/** Resolves a site path to a built page key or a static file. */
function resolve(path) {
  const clean = decodeURIComponent(path).replace(/\/$/, '') || '/';
  if (pages.has(clean)) return { page: pages.get(clean) };
  if (existsSync(join(root, clean)) && !clean.endsWith('/')) return { asset: true };
  return null;
}

const errors = [];
for (const [route, { file, links }] of pages) {
  for (const link of links) {
    if (/^(?:[a-z]+:|\/\/)/i.test(link)) continue; // external, mailto:, data:
    const url = new URL(link, `https://site.invalid${route}`);
    const target = resolve(url.pathname);
    if (!target) {
      errors.push(`${relative(root, file)}: broken link ${link}`);
      continue;
    }
    const fragment = decodeURIComponent(url.hash.slice(1));
    if (fragment && target.page && !target.page.ids.has(fragment)) {
      errors.push(`${relative(root, file)}: missing #${fragment} in ${link}`);
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  console.error(`\n${errors.length} broken link(s).`);
  process.exit(1);
}
console.log(`Links OK: ${pages.size} pages checked.`);
