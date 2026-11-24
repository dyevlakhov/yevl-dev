import { existsSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { getContent } from '@/content';
import {
  alsoSchema,
  areaSchema,
  caseSummarySchema,
  principleSchema,
  profileSchema,
  roleSchema,
} from '@/content/schema';
import { localePath, locales } from '@/i18n/locales';
import { messages } from '@/i18n/messages';
import { guardPatterns, guardTerms } from '../guard-terms';

const titles: Record<string, string> = {
  Unity: 'Senior Software Engineer',
  ironSource: 'Senior Software Engineer',
  'Career PRO': 'Full Stack Developer',
  'Mate Academy': 'Full Stack Developer & Frontend Coach',
};
const dates: Record<string, [string, string]> = {
  Unity: ['2022-11', '2026-10'],
  ironSource: ['2022-02', '2022-11'],
  'Career PRO': ['2021-01', '2021-12'],
  'Mate Academy': ['2019-07', '2022-01'],
};

describe.each(locales)('%s content', (locale) => {
  const c = getContent(locale);

  test('parses with schemas', () => {
    profileSchema.parse(c.profile);
    c.roles.forEach((r) => roleSchema.parse(r));
    c.areas.forEach((a) => areaSchema.parse(a));
    c.cases.forEach((x) => caseSummarySchema.parse(x));
    c.also.forEach((x) => alsoSchema.parse(x));
  });

  test('has exactly six areas', () => expect(c.areas).toHaveLength(6));

  test('hero key/value data: six focus items and a stack list', () => {
    expect(c.profile.focus).toHaveLength(6);
    expect(c.profile.stack.length).toBeGreaterThanOrEqual(5);
    expect(c.profile.stack).toContain('TypeScript');
  });

  // Private copy rules (wording, excluded projects, places): see tests/guard-terms.ts.
  test.skipIf(!guardTerms)('private copy rules (guard terms)', () => {
    // "Українською" is the language-switch label (a language name, not a place).
    const all = JSON.stringify({ c, m: messages[locale] }).replace('Українською', '');
    for (const pattern of guardPatterns('content')) expect(all).not.toMatch(pattern);
  });

  test('copy style: no em dash in content or UI strings', () => {
    const all = JSON.stringify({ c, m: messages[locale] });
    expect(all).not.toContain('—');
  });

  test('cases carry a two-part meta line and lower-case tags', () => {
    for (const cs of c.cases) {
      expect(cs.meta).toHaveLength(2);
      for (const tag of cs.tags) expect(tag).toBe(tag.toLowerCase());
    }
  });

  test('job titles and dates match the CV exactly', () => {
    expect(c.roles.map((r) => r.company)).toEqual(Object.keys(titles));
    for (const r of c.roles) {
      expect(r.title).toBe(titles[r.company]);
      expect([r.start, r.end]).toEqual(dates[r.company]);
    }
  });

  test('how I work: three principles, each pointing at a real case if at all', () => {
    expect(c.principles).toHaveLength(3);
    const slugs = c.cases.map((x) => x.slug);
    for (const p of c.principles) {
      principleSchema.parse(p);
      if (p.caseSlug) expect(slugs).toContain(p.caseSlug);
    }
  });

  test('contact details', () => {
    expect(c.profile.email).toBe('yevlakhovdmytro@gmail.com');
    expect(c.profile.links.find((l) => l.label === 'CV')?.href).toBe('/cv.pdf');
  });

  test('education shows no dates or completion status', () => {
    expect(c.profile.education).not.toMatch(/\d{4}/);
    expect(c.profile.education).not.toMatch(/expected|unfinished|bachelor|бакалавр|незакінч/i);
  });

  test('no location or time zone (content and UI strings)', () => {
    const text = JSON.stringify({ c, m: messages[locale] });
    expect(text).not.toMatch(/\b(UTC|GMT)\s?[+−-]\s?\d|\b(based|located|living) in\b/i);
    expect(text).not.toMatch(/\b(Europe|Asia|America)\/[A-Z]/);
  });
});

test('English hero copy matches the positioning spec', () => {
  const p = getContent('en').profile;
  expect(p.title).toBe('Senior Full-Stack Engineer');
  expect(p.stackLine).toBe('React, Next.js & Node.js');
  expect(p.intro).toBe(
    'I build web products end to end: React interfaces, Node.js services, AWS infrastructure and AI features. 7+ years of commercial software development, the last four at Unity.',
  );
});

test('Ukrainian hero intro matches the positioning spec', () => {
  expect(getContent('uk').profile.intro).toBe(
    'Я створюю вебпродукти від і до: інтерфейси на React, сервіси на Node.js, інфраструктуру AWS і AI-функції. Понад 7 років комерційної розробки, останні чотири в Unity.',
  );
});

test('availability text', () => {
  expect(getContent('en').profile.availability).toBe(
    'Open to remote roles · Flexible across time zones',
  );
  expect(getContent('uk').profile.availability).toBe(
    'Відкритий до віддаленої роботи · Працюю з будь-якими часовими поясами',
  );
});

test('title and stack line are English in both locales', () => {
  for (const k of ['title', 'stackLine'] as const)
    expect(getContent('uk').profile[k]).toBe(getContent('en').profile[k]);
});

describe('locale parity', () => {
  const en = getContent('en');
  const uk = getContent('uk');

  test('same structure, slugs, dates and links', () => {
    expect(uk.cases.map((c) => c.slug)).toEqual(en.cases.map((c) => c.slug));
    expect(uk.cases.map((c) => c.tags.length)).toEqual(en.cases.map((c) => c.tags.length));
    expect(uk.cases.map((c) => c.diagram)).toEqual(en.cases.map((c) => c.diagram));
    expect(uk.areas.map((a) => a.id)).toEqual(en.areas.map((a) => a.id));
    expect(uk.profile.stack).toEqual(en.profile.stack);
    expect(uk.profile.focus).toHaveLength(en.profile.focus.length);
    expect(uk.roles.map((r) => [r.company, r.title, r.start, r.end])).toEqual(
      en.roles.map((r) => [r.company, r.title, r.start, r.end]),
    );
    expect(uk.profile.links.map((l) => l.href)).toEqual(en.profile.links.map((l) => l.href));
    expect(uk.also.map((a) => a.href)).toEqual(en.also.map((a) => a.href));
  });

  const keys = (o: unknown, prefix = ''): string[] =>
    o && typeof o === 'object'
      ? Object.entries(o).flatMap(([k, v]) => keys(v, `${prefix}${k}.`))
      : [prefix];

  test('UI strings have identical key sets', () => {
    expect(keys(messages.uk).sort()).toEqual(keys(messages.en).sort());
  });

  // Strings that legitimately stay English in both locales (names, titles, tech, brand).
  const allowSame = new Set([
    'Senior Full-Stack Engineer',
    'React, Next.js & Node.js',
    'yevlakhovdmytro@gmail.com',
    'Email',
    'CV',
    'LinkedIn',
    'GitHub',
    '2022–2026',
    '2021',
    'Unity, ironSource',
    'Career PRO',
    'AI',
    'monobank',
    'yevl.dev',
    'cv.pdf',
    'profile.yaml',
    'architecture.svg',
    'decisions.log',
    'release.yml',
    'Unity: React, Next.js, TanStack',
    'Unity: Terraform, CircleCI, GitHub Actions',
    'Mate Academy: monobank',
    'Next.js · Vercel',
  ]);

  const strings = (o: unknown, path = ''): [string, string][] =>
    typeof o === 'string'
      ? [[path, o]]
      : o && typeof o === 'object'
        ? Object.entries(o).flatMap(([k, v]) => strings(v, `${path}.${k}`))
        : [];

  test('every translatable string is actually translated', () => {
    const enMap = new Map(strings({ content: en, messages: messages.en }));
    const same = strings({ content: uk, messages: messages.uk }).filter(
      ([path, v]) => enMap.get(path) === v && !/^(\/|https?:|mailto:|#|\d)/.test(v),
    );
    const unexpected = same.filter(
      ([path, v]) =>
        !path.startsWith('.content.profile.stack.') &&
        !allowSame.has(v) &&
        !Object.keys(titles).includes(v) &&
        !Object.values(titles).includes(v) &&
        !/^[a-z-]+$/.test(v),
    );
    expect(unexpected).toEqual([]);
  });
});

test('localePath', () => {
  expect(localePath('en')).toBe('/');
  expect(localePath('uk')).toBe('/uk');
  expect(localePath('uk', 'unity')).toBe('/uk#unity');
});

test('content is validated with Zod when it is loaded', async () => {
  const { contentSchema } = await import('@/content/schema');
  for (const locale of locales) expect(() => contentSchema.parse(getContent(locale))).not.toThrow();
  expect(() => contentSchema.parse({ ...getContent('en'), areas: [] })).toThrow();
});

test('CV file is published', () => expect(existsSync('public/cv.pdf')).toBe(true));

test('principles link to the same cases in both locales', () => {
  const seq = (l: (typeof locales)[number]) => getContent(l).principles.map((p) => p.caseSlug);
  expect(seq('uk')).toEqual(seq('en'));
});

test('meta descriptions fit search snippets and skip ironSource', () => {
  for (const locale of ['en', 'uk'] as const) {
    const d = getContent(locale).profile.metaDescription;
    expect(d.length).toBeLessThanOrEqual(160);
    expect(d).not.toMatch(/ironSource/i);
  }
});
