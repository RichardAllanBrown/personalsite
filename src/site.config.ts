// Site-wide facts. Anything in [BRACKETS] still needs a real value.
export const site = {
  name: 'Richard Brown',
  handle: 'richard.brown',
  description: 'Richard Brown, thoroughly documented, questionably designed',
  email: 'richard.allan.brown@gmail.com',
  /** Year your career started: "in production since". */
  inProductionSince: '2011',
  /** Spec block revision; bump it with each year of experience. */
  specRevision: '15.0',
  /** Source repo; /now links to its file history. */
  repo: 'https://github.com/RichardAllanBrown/personalsite',
  links: {
    github: 'https://github.com/RichardAllanBrown',
    linkedin: 'https://www.linkedin.com/in/richard-brown-464a0633',
    rss: '/rss.xml',
  },
  nav: [
    { href: '/notes', label: '/notes' },
    { href: '/projects', label: '/projects' },
    { href: '/now', label: '/now' },
    { href: '/about', label: '/about' },
  ],
} as const;
