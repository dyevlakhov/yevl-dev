import { EMAIL, links } from '../links';
import type { Profile } from '../schema';
import { STACK } from '../stack';

export const profile: Profile = {
  name: 'Дмитро Євлахов',
  title: 'Senior Full-Stack Engineer',
  stackLine: 'React, Next.js & Node.js',
  intro:
    'В Unity та ironSource я створював аналітичні дашборди для розробників ігор і модернізував бекенд-сервіси тієї самої платформи монетизації. Понад 7 років комерційної розробки, TypeScript на всьому стеку.',
  metaDescription:
    'Понад 7 років комерційної розробки на React, Next.js, Node.js і TypeScript. В Unity я створював аналітичні дашборди та модернізував бекенд-сервіси.',
  focus: [
    'бекенд',
    'фронтенд',
    'хмарна інфраструктура',
    'AI-функції',
    'мобільна розробка',
    'інтеграції',
  ],
  stack: STACK,
  availability: 'Відкритий до віддаленої роботи · Працюю з будь-якими часовими поясами',
  email: EMAIL,
  links,
  education:
    'Інженерія програмного забезпечення · Харківський національний університет радіоелектроніки',
};
