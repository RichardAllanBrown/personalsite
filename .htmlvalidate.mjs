import { defineConfig } from 'html-validate';

export default defineConfig({
  extends: ['html-validate:recommended'],
  rules: {
    // role="list" is deliberate: Safari drops list semantics when list-style is none.
    'no-redundant-role': 'off',
    // Shiki colours code tokens with style attributes; the CSP allows exactly those by hash.
    'no-inline-style': 'off',
  },
});
