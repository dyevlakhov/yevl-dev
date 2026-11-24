import type { Area } from '../schema';

export const areas: Area[] = [
  {
    id: 'backend',
    title: 'Backend & architecture',
    summary: 'Service design, async processing, typed contracts between services, PostgreSQL.',
    proof: 'Unity: NestJS migration, queues, gRPC',
  },
  {
    id: 'frontend',
    title: 'Frontend & data',
    summary: 'Analytics dashboards and metric visualizations people use every day.',
    proof: 'Unity: React, Next.js, TanStack',
  },
  {
    id: 'cloud',
    title: 'Cloud & delivery',
    summary: 'AWS infrastructure as code, CI/CD pipelines, repeatable releases.',
    proof: 'Unity: Terraform, CircleCI, GitHub Actions',
  },
  {
    id: 'ai',
    title: 'AI features',
    summary: 'LLM-powered product features and agents that automate engineering work.',
    proof: 'Meal planner; Claude Code agents at Unity',
  },
  {
    id: 'mobile',
    title: 'Mobile, 0 to 1',
    summary: 'Cross-platform apps taken from idea to store release.',
    proof: 'Career PRO (solo); meal planner (Expo)',
  },
  {
    id: 'integrations',
    title: 'Integrations',
    summary: 'Third-party and banking integrations, working directly with partner teams.',
    proof: 'Mate Academy: monobank',
  },
];
