import type { Principle } from '../schema';

export const principles: Principle[] = [
  {
    title: 'Look past the ticket',
    body: 'A habit from Mate Academy: find what the product and the team actually need, and work on that. At Unity I started by tracing slow requests nobody had assigned to me, and worked out where the time went before deciding what to optimize in place and what to move out.',
    caseSlug: 'unity',
  },
  {
    title: 'Change systems in steps',
    body: 'Big changes go in small, reversible steps. The product keeps running the whole time.',
    caseSlug: 'unity',
  },
  {
    title: 'Pick the simplest structure the team can run',
    body: 'At Unity, with a team and a large product, the answer was services. In my meal planner, with one developer, it is a single process on one database. The right structure depends on who has to keep it running.',
    caseSlug: 'meal-planner',
  },
];
