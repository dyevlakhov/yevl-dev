import type { Role } from '../schema';

/** Newest first. Dates, titles and bullets come from the CV. */
export const roles: Role[] = [
  {
    company: 'Unity',
    title: 'Senior Software Engineer',
    start: '2022-11',
    end: '2026-10',
    bullets: [
      'Initiated the migration of a custom Express API to NestJS and designed separate services.',
      'Moved selected operations to an Amazon SQS worker so API requests could return before processing finished.',
      'Built analytics dashboards and metric visualizations for game developers with React, Next.js, TanStack Query and TanStack Table.',
      'Proposed and implemented gRPC between production microservices, with typed contracts in Protocol Buffers.',
      'Provisioned AWS queues and access permissions with Terraform; updated CI/CD in CircleCI and GitHub Actions.',
      'Built custom Claude Code skills and agents to automate recurring engineering tasks.',
    ],
  },
  {
    company: 'ironSource',
    title: 'Senior Software Engineer',
    start: '2022-02',
    end: '2022-11',
    bullets: [
      'Shipped features across the React frontend and Node.js backend of a self-service platform for app monetization and growth.',
    ],
  },
  {
    company: 'Career PRO',
    title: 'Full Stack Developer',
    start: '2021-01',
    end: '2021-12',
    bullets: [
      'Designed, built and launched a cross-platform mobile app for real users as the sole developer, using React Native and Apollo GraphQL.',
      'Set up automated testing and CI/CD for mobile releases and managed app store submissions.',
    ],
  },
  {
    company: 'Mate Academy',
    title: 'Full Stack Developer & Frontend Coach',
    start: '2019-07',
    end: '2022-01',
    bullets: [
      'Delivered the end-to-end monobank API integration for student loans and installment payments, working directly with the bank’s managers and engineers.',
      'Mentored students, reviewed their code, led Q&A sessions and developed frontend curriculum modules.',
    ],
  },
];
