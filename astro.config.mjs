// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import cspHeaders from './integrations/csp-headers.mjs';

export default defineConfig({
  site: 'https://richardallanbrown.com',
  trailingSlash: 'never',
  build: {
    format: 'file',
    // Keeps CSS out of the HTML so the CSP needs no style hashes.
    inlineStylesheets: 'never',
  },
  integrations: [mdx(), sitemap(), cspHeaders()],
  markdown: {
    // Token colours come from CSS custom properties (see src/styles/code.css), so code follows the theme.
    shikiConfig: { theme: 'css-variables' },
  },
});
