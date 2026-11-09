// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // TODO: replace with the real domain once it's registered.
  site: 'https://example.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [mdx(), sitemap()],
  markdown: {
    // Token colours come from CSS custom properties (see src/styles/code.css), so code follows the theme.
    shikiConfig: { theme: 'css-variables' },
  },
});
