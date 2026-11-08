// Site-wide facts. Anything in [BRACKETS] still needs a real value.
export const site = {
  name: 'Richard Brown',
  handle: 'richard.brown',
  description: 'Richard Brown, documented like a system: notes, side projects and what I’m up to now.',
  email: '[EMAIL]',
  links: {
    github: 'https://github.com/[USERNAME]',
    linkedin: 'https://www.linkedin.com/in/[USERNAME]',
    rss: '/rss.xml',
  },
  nav: [
    { href: '/notes', label: '/notes' },
    { href: '/projects', label: '/projects' },
    { href: '/now', label: '/now' },
    { href: '/about', label: '/about' },
  ],
} as const;
