/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],
  overrides: [{ files: ['**/*.astro'], customSyntax: 'postcss-html' }],
  rules: {
    // Component classes are short and descriptive; kebab-case is enough.
    'selector-class-pattern': null,
    // Tokens use the design's names (--step-h1, --on-signal), not a prefix scheme.
    'custom-property-pattern': null,
    // Fonts are listed with quotes consistently, keywords included.
    'font-family-name-quotes': null,
    // Vite resolves plain string imports; url() adds noise.
    'import-notation': 'string',
    // Tokens are grouped with blank lines between related sets.
    'custom-property-empty-line-before': null,
    // Nesting makes this rule fire on unrelated selectors; cascade layers handle precedence.
    'no-descending-specificity': null,
    // Astro's scoped-style escape hatch.
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global'] }],
    // iOS Safari still needs the prefix to stop text inflation on rotate.
    'property-no-vendor-prefix': [true, { ignoreProperties: ['-webkit-text-size-adjust'] }],
  },
};
