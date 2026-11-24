import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { getContent } from '@/content';
import { caseMetaSchema } from '@/content/schema';
import { locales } from '@/i18n/locales';
import { guardPatterns, guardTerms } from '../guard-terms';

// Case bodies are MDX (docs/architecture.md, Content). Vitest reads
// them as raw text, so the copy rules and EN/UK parity are checked without an MDX transform.
const slugs = ['unity', 'meal-planner', 'career-pro'] as const;
const file = (locale: string, slug: string) =>
  join(process.cwd(), 'src/content/cases', locale, `${slug}.mdx`);
const read = (locale: string, slug: string) => readFileSync(file(locale, slug), 'utf8');

function metaOf(source: string): unknown {
  const m = source.match(/^export const meta = (\{[^\n]*\});?$/m);
  if (!m) throw new Error('missing `export const meta = {…}` line');
  // The meta line is a JS object literal of plain strings; turn it into JSON.
  return JSON.parse(m[1]!.replace(/'/g, '"').replace(/(\w+):/g, '"$1":'));
}

const headings = (source: string) => source.match(/^## .+$/gm) ?? [];
const pairs = locales.flatMap((locale) => slugs.map((slug) => [locale, slug] as const));

describe('case bodies (MDX)', () => {
  test.each(pairs)('%s/%s exists and its meta parses and matches the file', (locale, slug) => {
    expect(existsSync(file(locale, slug))).toBe(true);
    const meta = caseMetaSchema.parse(metaOf(read(locale, slug)));
    expect(meta).toEqual({ slug, locale });
  });

  test.each(slugs)('%s: en and uk have the same number of ## headings', (slug) => {
    expect(headings(read('en', slug)).length).toBeGreaterThan(0);
    expect(headings(read('uk', slug))).toHaveLength(headings(read('en', slug)).length);
  });

  test.each(pairs)('%s/%s follows the copy rules', (locale, slug) => {
    const src = read(locale, slug);
    expect(src).not.toContain('—');
    expect(src).not.toMatch(/^# /m);
  });

  // Private rules (tests/guard-terms.ts): wording, and former employers' internals stay at CV level.
  describe.skipIf(!guardTerms)('private copy rules (guard terms)', () => {
    test.each(pairs)('%s/%s', (locale, slug) => {
      const src = read(locale, slug);
      for (const pattern of guardPatterns('content')) expect(src).not.toMatch(pattern);
    });

    test.each(locales)('%s/unity stays at CV level', (locale) => {
      for (const pattern of guardPatterns('unity'))
        expect(read(locale, 'unity')).not.toMatch(pattern);
    });

    test.each(locales)('%s/career-pro stays at CV level', (locale) => {
      const src = read(locale, 'career-pro');
      for (const pattern of guardPatterns('careerPro')) expect(src).not.toMatch(pattern);
    });
  });
});

describe('case cards (job-search positioning)', () => {
  const card = (locale: 'en' | 'uk', slug: string) =>
    getContent(locale).cases.find((c) => c.slug === slug)!;

  test.each(locales)('%s: the Unity card shows a result and three highlights', (locale) => {
    const unity = card(locale, 'unity');
    expect(unity.result).toBeTruthy();
    expect(unity.highlights).toHaveLength(3);
  });

  test('English Unity card copy', () => {
    const unity = card('en', 'unity');
    expect(unity.summary).toBe(
      'I built React and Next.js analytics dashboards for game developers and initiated the move of the backend to NestJS services, done in phases alongside product work.',
    );
    expect(unity.result).toBe(
      'After selected operations moved to an Amazon SQS worker, the affected API requests could return before background processing finished.',
    );
  });

  test('meal planner meta says closed alpha and personal project', () => {
    expect(card('en', 'meal-planner').meta).toEqual(['closed alpha', 'personal project']);
    expect(card('uk', 'meal-planner').meta).toEqual(['закрита альфа', 'особистий проєкт']);
  });

  test.each(locales)('%s: the Career PRO card is titled after the product, Huntd', (locale) => {
    expect(card(locale, 'career-pro').title.startsWith('Huntd:')).toBe(true);
  });

  test.each(locales)('%s: no card claims an unconfirmed compatibility guarantee', (locale) => {
    expect(JSON.stringify(getContent(locale).cases)).not.toMatch(/drift|розійт/i);
  });
});

describe('Unity case body and monobank line (job-search positioning)', () => {
  const grpc = {
    en: 'I proposed and implemented gRPC between services. We generated client and server types from shared Protocol Buffer definitions.',
    uk: 'Я запропонував і впровадив gRPC між сервісами. Типи клієнта й сервера ми генерували зі спільних визначень Protocol Buffers.',
  };
  const dashboards = {
    en: 'I owned the analytics side of the product’s frontend: the dashboards, charts and metric views game developers use to follow their numbers. I built them with React and Next.js, fetched data with TanStack Query and built the data tables on TanStack Table.',
    uk: 'Я відповідав за аналітичну частину фронтенду продукту: дашборди, графіки й екрани з метриками, за якими розробники ігор стежать за своїми показниками. Будував їх на React і Next.js, дані отримував через TanStack Query, таблиці робив на TanStack Table.',
  };
  const monobank = {
    en: 'at Mate Academy I delivered the end-to-end monobank API integration for student loans and installment payments, working with the bank’s managers and engineers from requirements through testing.',
    uk: 'у Mate Academy я реалізував наскрізну інтеграцію з API monobank для студентських кредитів і оплати частинами, працюючи з менеджерами та інженерами банку від вимог до тестування.',
  };

  test.each(locales)('%s: gRPC is described by what was done, without guarantees', (locale) => {
    const src = read(locale, 'unity');
    expect(src).toContain(grpc[locale]);
    expect(src).not.toMatch(/drift|розійт/i);
  });

  test.each(locales)('%s: the dashboards decision is in the case', (locale) => {
    const src = read(locale, 'unity');
    expect(src).toMatch(
      locale === 'en' ? /^### 3\. Analytics dashboards$/m : /^### 3\. Аналітичні дашборди$/m,
    );
    expect(src).toContain(dashboards[locale]);
    expect(src).toMatch(/^### 4\. /m);
  });

  test.each(locales)('%s: the "also" list no longer repeats the dashboards', (locale) => {
    const also = read(locale, 'unity').split(/^## /m).at(-1)!;
    expect(also).not.toMatch(/dashboard|дашборд/i);
  });

  test.each(locales)('%s: monobank line', (locale) => {
    expect(getContent(locale).also[0]!.description).toBe(monobank[locale]);
  });
});

// The CV-level rule for the Unity body applies to its card too.
test.skipIf(!guardTerms).each(locales)('%s: the Unity card stays at CV level', (locale) => {
  const unity = JSON.stringify(getContent(locale).cases.find((c) => c.slug === 'unity')!);
  for (const pattern of guardPatterns('unity')) expect(unity).not.toMatch(pattern);
});
