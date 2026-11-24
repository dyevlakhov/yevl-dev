import { describe, expect, test } from 'vitest';
import { getContent } from '@/content';
import { emailHref } from '@/content/links';
import { contactActions, contactRows, heroActions } from '@/components/landing/actions';
import { locales } from '@/i18n/locales';
import { messages } from '@/i18n/messages';

describe('emailHref', () => {
  test('adds an encoded subject to the mailto link', () => {
    expect(emailHref('Senior full-stack role')).toBe(
      'mailto:yevlakhovdmytro@gmail.com?subject=Senior%20full-stack%20role',
    );
    expect(emailHref('Роль senior full-stack інженера')).toBe(
      `mailto:yevlakhovdmytro@gmail.com?subject=${encodeURIComponent('Роль senior full-stack інженера')}`,
    );
  });
});

describe.each(locales)('%s contact rows', (locale) => {
  const { profile } = getContent(locale);
  const t = messages[locale];
  const rows = contactRows(profile, t);

  test('email, linkedin, github, cv with their real handles', () => {
    expect(rows.map((r) => [r.key, r.prefix ?? '', r.handle, r.suffix ?? ''])).toEqual([
      ['email', '', 'yevlakhovdmytro@gmail.com', ''],
      ['linkedin', 'in/', 'dmytroyevlakhov', ''],
      ['github', '@', 'dyevlakhov', ''],
      ['cv', '', 'cv.pdf', '· PDF'],
    ]);
  });

  test('links come from the profile and hints are localized', () => {
    expect(rows.map((r) => r.href)).toEqual([
      undefined,
      'https://www.linkedin.com/in/dmytroyevlakhov',
      'https://github.com/dyevlakhov',
      '/cv.pdf',
    ]);
    expect(rows.map((r) => r.hint)).toEqual([
      t.contact.copy,
      t.contact.open,
      t.contact.open,
      t.contact.download,
    ]);
  });

  test('every "Email me" opens a draft with the subject and copies the address', () => {
    for (const a of [heroActions(profile, t)[0]!, contactActions(profile, t)[0]!]) {
      expect(a.label).toBe(t.actions.email);
      expect(a.href).toBe(emailHref(t.contact.subject));
      expect(a.copyHint).toBe(t.contact.ctaCopied);
    }
  });
});

test('approved Ukrainian strings', () => {
  expect(messages.uk.contact.subject).toBe('Роль senior full-stack інженера');
  expect(messages.uk.contact.open).toBe('відкрити');
  expect(messages.uk.contact.download).toBe('завантажити');
  expect(messages.uk.contact.copy).toBe('копіювати');
});
