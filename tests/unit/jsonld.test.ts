import { describe, expect, test } from 'vitest';
import { getContent } from '@/content';
import { profileJsonLd, serializeJsonLd } from '@/lib/jsonld';

describe.each(['en', 'uk'] as const)('%s JSON-LD', (locale) => {
  const c = getContent(locale);
  const ld = profileJsonLd(locale, c);

  test('is a ProfilePage about a Person with facts from content only', () => {
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('ProfilePage');
    expect(ld.url).toBe(locale === 'en' ? 'https://yevl.dev' : 'https://yevl.dev/uk');
    expect(ld.inLanguage).toBe(locale);
    const p = ld.mainEntity;
    expect(p['@type']).toBe('Person');
    expect(p.name).toBe(c.profile.name);
    expect(p.jobTitle).toBe('Senior Full-Stack Engineer');
    expect(p.sameAs).toEqual([
      'https://github.com/dyevlakhov',
      'https://www.linkedin.com/in/dmytroyevlakhov',
    ]);
    expect(p.knowsAbout).toEqual(c.profile.stack);
    // The bachelor's program is still in progress, so no alumniOf.
    expect(p).not.toHaveProperty('alumniOf');
  });

  test('serialization escapes "<"', () => {
    const out = serializeJsonLd({ x: '</script><b>' });
    expect(out).not.toContain('<');
    expect(JSON.parse(out)).toEqual({ x: '</script><b>' });
  });
});
