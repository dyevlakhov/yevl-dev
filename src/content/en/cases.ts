import type { AlsoItem, CaseSummary } from '../schema';

export const cases: CaseSummary[] = [
  {
    slug: 'unity',
    meta: ['2022–2026', 'Unity, ironSource'],
    title: 'Monetization platform for game developers',
    summary:
      'I built React and Next.js analytics dashboards for game developers and initiated the move of the backend to NestJS services, done in phases alongside product work.',
    result:
      'After selected operations moved to an Amazon SQS worker, the affected API requests could return before background processing finished.',
    highlights: [
      'Initiated the NestJS migration and designed the separate services',
      'Proposed and implemented gRPC between services; we generated client and server types from shared Protocol Buffer definitions',
      'Dashboards with React, Next.js, TanStack Query and TanStack Table',
    ],
    tags: ['backend', 'frontend', 'cloud', 'ai-tooling'],
    diagram: 'architecture',
  },
  {
    slug: 'meal-planner',
    meta: ['closed alpha', 'personal project'],
    title: 'Family meal planner',
    summary:
      'A mobile app and API I build and run alone, with AI-generated recipes that a person approves before they reach the plan. Run like a real product: architecture decisions recorded as ADRs and backups verified by test restores.',
    tags: ['ai', 'mobile', 'backend', 'cloud'],
    diagram: 'decisions',
  },
  {
    slug: 'career-pro',
    meta: ['2021', 'Career PRO'],
    title: 'Huntd: iOS and Android app, shipped solo',
    summary:
      'I chose the stack, built the app with React Native and Apollo GraphQL, set up automated tests and CI/CD, and released it to the App Store and Google Play as the only developer.',
    tags: ['mobile', 'delivery'],
    diagram: 'release',
  },
];

export const also: AlsoItem[] = [
  {
    label: 'monobank',
    description:
      'at Mate Academy I delivered the end-to-end monobank API integration for student loans and installment payments, working with the bank’s managers and engineers from requirements through testing.',
  },
];
