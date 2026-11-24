import type { Role } from '../schema';

/** Newest first. Dates and titles as in the CV (English); bullets translate the CV lines. */
export const roles: Role[] = [
  {
    company: 'Unity',
    title: 'Senior Software Engineer',
    start: '2022-11',
    end: '2026-10',
    bullets: [
      'Ініціював міграцію власного Express API на NestJS і спроєктував окремі сервіси.',
      'Виніс частину операцій в обробник на Amazon SQS, щоб API відповідав, не чекаючи завершення обробки.',
      'Створював аналітичні дашборди та візуалізації метрик для розробників ігор на React, Next.js, TanStack Query і TanStack Table.',
      'Запропонував і впровадив gRPC між продакшн-мікросервісами з типізованими контрактами на Protocol Buffers.',
      'Налаштовував черги AWS і права доступу через Terraform; оновлював CI/CD у CircleCI та GitHub Actions.',
      'Створював власні skills та агентів для Claude Code, щоб автоматизувати рутинні інженерні задачі.',
    ],
  },
  {
    company: 'ironSource',
    title: 'Senior Software Engineer',
    start: '2022-02',
    end: '2022-11',
    bullets: [
      'Розробляв функції у фронтенді на React і бекенді на Node.js self-service платформи для монетизації застосунків і зростання аудиторії.',
    ],
  },
  {
    company: 'Career PRO',
    title: 'Full Stack Developer',
    start: '2021-01',
    end: '2021-12',
    bullets: [
      'Одноосібно спроєктував, розробив і запустив кросплатформний мобільний застосунок для реальних користувачів на React Native та Apollo GraphQL.',
      'Налаштував автоматизоване тестування й CI/CD для мобільних релізів і вів публікацію в магазинах застосунків.',
    ],
  },
  {
    company: 'Mate Academy',
    title: 'Full Stack Developer & Frontend Coach',
    start: '2019-07',
    end: '2022-01',
    bullets: [
      'Повністю реалізував інтеграцію з API monobank для студентських кредитів і оплати частинами, працюючи напряму з менеджерами та інженерами банку.',
      'Менторив студентів, робив код-рев’ю, проводив Q&A-сесії та розробляв модулі фронтенд-курсу.',
    ],
  },
];
