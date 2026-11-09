// @ts-check
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

/** Cloudflare rejects longer header values. */
const MAX_HEADER_LENGTH = 2000;

const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
const INLINE_STYLE = /<style[\s>]/;
/** Shiki colours tokens with style attributes; double-quoted is all Astro emits. */
const STYLE_ATTR = /\sstyle="([^"]*)"/g;

/** @param {string} value */
const decode = (value) =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

/** @param {string} text */
const sha256 = (text) => `'sha256-${createHash('sha256').update(text).digest('base64')}'`;

/** @param {string} dir */
async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.html'))
    .map((e) => join(e.parentPath, e.name));
}

/**
 * Hashes every inline <script> in the built pages and writes a Content-Security-Policy
 * into the `/*` block of dist/_headers. Astro's own CSP option skips `is:inline` scripts,
 * which would block the theme script, and can only emit a <meta> tag. Style attributes
 * (Shiki's token colours) are allowed by hash via 'unsafe-hashes', which permits only those exact values.
 *
 * @returns {import('astro').AstroIntegration}
 */
export default function cspHeaders() {
  return {
    name: 'csp-headers',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const scripts = new Set();
        const styleAttrs = new Set();

        for (const file of await htmlFiles(root)) {
          const html = await readFile(file, 'utf8');
          for (const [, body] of html.matchAll(INLINE_SCRIPT)) scripts.add(sha256(body));
          for (const [, value] of html.matchAll(STYLE_ATTR)) styleAttrs.add(sha256(decode(value)));
          // Stylesheets are always external (build.inlineStylesheets: 'never'); keep it that way.
          if (INLINE_STYLE.test(html))
            throw new Error(`Inline <style> in ${file}: the CSP has no style hashes.`);
        }

        const policy = [
          "default-src 'self'",
          `script-src 'self' ${[...scripts].sort().join(' ')}`,
          "style-src 'self'",
          styleAttrs.size > 0
            ? `style-src-attr 'unsafe-hashes' ${[...styleAttrs].sort().join(' ')}`
            : "style-src-attr 'none'",
          "img-src 'self' data:",
          "font-src 'self'",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
          'upgrade-insecure-requests',
        ].join('; ');

        if (policy.length > MAX_HEADER_LENGTH) {
          throw new Error(
            `CSP is ${policy.length} characters; Cloudflare allows ${MAX_HEADER_LENGTH}.`,
          );
        }

        const headersPath = join(root, '_headers');
        const headers = await readFile(headersPath, 'utf8');
        if (!/^\/\*$/m.test(headers))
          throw new Error('public/_headers needs a `/*` block for the CSP.');
        await writeFile(
          headersPath,
          headers.replace(/^\/\*$/m, `/*\n  Content-Security-Policy: ${policy}`),
        );

        logger.info(
          `CSP written to _headers: ${scripts.size} script and ${styleAttrs.size} style attribute hash(es).`,
        );
      },
    },
  };
}
