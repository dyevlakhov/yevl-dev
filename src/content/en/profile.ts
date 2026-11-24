import { EMAIL, links } from '../links';
import type { Profile } from '../schema';
import { STACK } from '../stack';

export const profile: Profile = {
  name: 'Dmytro Yevlakhov',
  title: 'Senior Full-Stack Engineer',
  stackLine: 'React, Next.js & Node.js',
  intro:
    'I build web products end to end: React interfaces, Node.js services, AWS infrastructure and AI features. 7+ years of commercial software development, the last four at Unity and ironSource.',
  metaDescription:
    '7+ years of commercial software development with React, Next.js, Node.js and TypeScript. At Unity, I built analytics dashboards and modernized backend services.',
  focus: ['backend', 'frontend', 'cloud', 'AI features', 'mobile', 'integrations'],
  stack: STACK,
  availability: 'Open to remote roles · Flexible across time zones',
  email: EMAIL,
  links,
  education: 'Computer Software Engineering · Kharkiv National University of Radio Electronics',
};
