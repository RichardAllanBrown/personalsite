// Site-wide facts.
const email = 'richard.allan.brown@gmail.com';
const github = 'https://github.com/RichardAllanBrown';

export const site = {
  name: 'Richard Brown',
  handle: 'richard.brown',
  description: 'Richard Brown, thoroughly documented, questionably designed',
  email,
  /** Year your career started: "in production since". */
  inProductionSince: '2011',
  /** Spec block revision; bump it with each year of experience. */
  specRevision: '15.0',
  /** Source repo; /now links to its file history. */
  repo: `${github}/personalsite`,
  links: {
    email: `mailto:${email}`,
    github,
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
