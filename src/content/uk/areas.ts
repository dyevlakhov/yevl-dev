import type { Area } from '../schema';

export const areas: Area[] = [
  {
    id: 'backend',
    title: 'Бекенд і архітектура',
    summary:
      'Проєктування сервісів, асинхронна обробка, типізовані контракти між сервісами, PostgreSQL.',
    proof: 'Unity: міграція на NestJS, черги, gRPC',
  },
  {
    id: 'frontend',
    title: 'Фронтенд і дані',
    summary: 'Аналітичні дашборди та візуалізації метрик, якими користуються щодня.',
    proof: 'Unity: React, Next.js, TanStack',
  },
  {
    id: 'cloud',
    title: 'Хмарна інфраструктура та релізи',
    summary: 'Інфраструктура AWS як код, CI/CD-пайплайни, відтворювані релізи.',
    proof: 'Unity: Terraform, CircleCI, GitHub Actions',
  },
  {
    id: 'ai',
    title: 'AI-функції',
    summary: 'Продуктові функції на основі LLM та агенти, що автоматизують інженерну роботу.',
    proof: 'Планувальник харчування; агенти Claude Code в Unity',
  },
  {
    id: 'mobile',
    title: 'Мобільні застосунки з нуля',
    summary: 'Кросплатформні застосунки від ідеї до релізу в магазинах.',
    proof: 'Career PRO (одноосібно); планувальник харчування (Expo)',
  },
  {
    id: 'integrations',
    title: 'Інтеграції',
    summary:
      'Інтеграції зі сторонніми та банківськими сервісами у прямій співпраці з командами партнерів.',
    proof: 'Mate Academy: monobank',
  },
];
