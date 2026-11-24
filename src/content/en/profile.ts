import { EMAIL, links } from '../links';
import type { Profile } from '../schema';
import { STACK } from '../stack';

export const profile: Profile = {
  name: 'Dmytro Yevlakhov',
  title: 'Senior Full-Stack Engineer',
  stackLine: 'React, Next.js & Node.js',
  intro:
    'At Unity and ironSource, I built analytics dashboards for game developers and modernized backend services for the same monetization platform. 7+ years of commercial software development, with TypeScript across the stack.',
  metaDescription:
    '7+ years of commercial software development with React, Next.js, Node.js and TypeScript. At Unity, I built analytics dashboards and modernized backend services.',
  focus: ['backend', 'frontend', 'cloud', 'AI features', 'mobile', 'integrations'],
  stack: STACK,
  availability: 'Open to remote roles · Flexible across time zones',
  email: EMAIL,
  links,
  education: 'Computer Software Engineering · Kharkiv National University of Radio Electronics',
};
