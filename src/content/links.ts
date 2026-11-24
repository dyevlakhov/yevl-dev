import type { Profile } from './schema';

export const EMAIL = 'yevlakhovdmytro@gmail.com';

export const links: Profile['links'] = [
  { label: 'Email', href: `mailto:${EMAIL}` },
  { label: 'CV', href: '/cv.pdf' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/dmytroyevlakhov' },
  { label: 'GitHub', href: 'https://github.com/dyevlakhov' },
];

/** "Email me" buttons: a draft with a subject, so the message is easy to spot in an inbox. */
export const emailHref = (subject: string) =>
  `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;
