import { describe, expect, test } from 'vitest';
import { isTheme, nextTheme, revealRadius, THEMES, themeBootstrapScript } from '@/lib/theme';

describe('theme model', () => {
  test('themes are vice, dark, light in switch order', () => {
    expect(THEMES).toEqual(['vice', 'dark', 'light']);
  });

  test('nextTheme cycles vice → dark → light → vice', () => {
    expect(nextTheme('vice')).toBe('dark');
    expect(nextTheme('dark')).toBe('light');
    expect(nextTheme('light')).toBe('vice');
  });

  test('isTheme accepts only known themes', () => {
    expect(isTheme('vice')).toBe(true);
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('light')).toBe(true);
    expect(isTheme('blue')).toBe(false);
    expect(isTheme(null)).toBe(false);
  });
});

test('revealRadius reaches the farthest corner', () => {
  expect(revealRadius(0, 0, 300, 400)).toBe(500);
  expect(revealRadius(150, 200, 300, 400)).toBe(250);
  expect(revealRadius(300, 0, 300, 400)).toBe(500);
});

describe('themeBootstrapScript', () => {
  // Runs the inline script against a minimal document and storage.
  const boot = (stored: string | null) => {
    const html = { dataset: {} as Record<string, string>, classList: { add: () => {} } };
    const storage = { getItem: () => stored };
    new Function('document', 'localStorage', themeBootstrapScript)(
      { documentElement: html },
      storage,
    );
    return html.dataset.theme;
  };

  test.each(['dark', 'light'])('applies a stored %s before paint', (stored) => {
    expect(boot(stored)).toBe(stored);
  });

  test.each([['vice'], [null], ['blue']])(
    'leaves no attribute for %s (vice is the default)',
    (stored) => {
      expect(boot(stored)).toBeUndefined();
    },
  );

  test('survives storage that throws', () => {
    const html = { dataset: {} as Record<string, string>, classList: { add: () => {} } };
    const storage = {
      getItem: () => {
        throw new Error('blocked');
      },
    };
    expect(() =>
      new Function('document', 'localStorage', themeBootstrapScript)(
        { documentElement: html },
        storage,
      ),
    ).not.toThrow();
    expect(html.dataset.theme).toBeUndefined();
  });
});
