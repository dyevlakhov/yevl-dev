import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { contrastRatio } from '@/lib/contrast';
import { palette, VICE_DUSK, VICE_DUSK_TEXT, type TokenName } from '@/design/tokens';

describe('contrastRatio', () => {
  test('black on white is 21:1', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 2);
  });
  test('#777 on white is ~4.48:1', () => {
    expect(Math.abs(contrastRatio('#777777', '#ffffff') - 4.48)).toBeLessThan(0.02);
  });
});

test('palette matches the design starting values', () => {
  expect(palette.dark).toMatchObject({
    bg: '#0b0b0c',
    text: '#e7e7e9',
    muted: '#a0a2a9',
    rule: '#26272b',
    link: '#8ab4f8',
  });
  expect(palette.light).toMatchObject({
    bg: '#ffffff',
    text: '#1b1b1d',
    muted: '#5d5f66',
    rule: '#e6e6e8',
    link: '#0a58ca',
  });
  // Vice is the default theme (ADR 0001).
  expect(palette.vice).toMatchObject({
    bg: '#0c0b0f',
    soft: '#151419',
    text: '#ececf0',
    muted: '#a7a5b0',
    mark: '#8b8995',
    rule: '#27262d',
    link: '#f2a5c4',
    ok: '#86e3c9',
    tile: '#121116',
    tileText: '#ececf0',
    tileMuted: '#a09ea9',
    tileRule: '#34333b',
    green: '#86e3c9',
    blue: '#f2a5c4',
    amber: '#ffc58a',
  });
});

const pairs: [TokenName, TokenName][] = [
  ['text', 'bg'],
  ['muted', 'bg'],
  ['mark', 'bg'],
  ['link', 'bg'],
  ['text', 'soft'],
  ['muted', 'soft'],
  ['mark', 'soft'],
  ['link', 'soft'],
  ['ok', 'soft'],
  ['tileText', 'tile'],
  ['tileMuted', 'tile'],
  ['green', 'tile'],
  ['blue', 'tile'],
  ['amber', 'tile'],
];

describe.each(['vice', 'light', 'dark'] as const)('%s palette', (theme) => {
  test.each(pairs)('%s on %s meets 4.5:1', (fg, bg) => {
    expect(contrastRatio(palette[theme][fg], palette[theme][bg])).toBeGreaterThanOrEqual(4.5);
  });
});

describe('globals.css mirrors the palette', () => {
  const css = readFileSync('src/app/globals.css', 'utf8');
  const block = (selector: string) => {
    // Prettier may normalise attribute quotes, so accept either style.
    const start = Math.max(
      css.indexOf(`${selector} {`),
      css.indexOf(`${selector.replaceAll('"', "'")} {`),
    );
    expect(start, `missing ${selector} block`).toBeGreaterThanOrEqual(0);
    return css.slice(start, css.indexOf('}', start));
  };

  test(':root holds the vice palette (vice is the default)', () => {
    const body = block(':root');
    for (const [name, value] of Object.entries(palette.vice))
      expect(body, `vice.${name}`).toContain(`--${name}: ${value};`);
  });

  test('[data-theme="dark"] holds the dark palette', () => {
    const body = block('[data-theme="dark"]');
    for (const [name, value] of Object.entries(palette.dark))
      expect(body, `dark.${name}`).toContain(`--${name}: ${value};`);
  });

  test('[data-theme="light"] holds the light palette', () => {
    const body = block('[data-theme="light"]');
    for (const [name, value] of Object.entries(palette.light))
      expect(body, `light.${name}`).toContain(`--${name}: ${value};`);
  });

  test('the system colour scheme does not override the default', () => {
    expect(css).not.toContain('prefers-color-scheme');
  });
});

describe('Vice dusk gradients (ADR 0001)', () => {
  test('every headline gradient stop is ≥ 4.5:1 on the Vice background', () => {
    for (const stop of VICE_DUSK_TEXT)
      expect(contrastRatio(stop, palette.vice.bg), stop).toBeGreaterThanOrEqual(4.5);
  });

  test('globals.css defines both gradients with exactly these stops', () => {
    const css = readFileSync('src/app/globals.css', 'utf8');
    expect(css).toContain(
      `--dusk: linear-gradient(90deg, ${VICE_DUSK[0]}, ${VICE_DUSK[1]} 55%, ${VICE_DUSK[2]});`,
    );
    expect(css).toContain(
      `--dusk-text: linear-gradient(100deg, ${VICE_DUSK_TEXT[0]}, ${VICE_DUSK_TEXT[1]} 50%, ${VICE_DUSK_TEXT[2]});`,
    );
  });
});

describe('hover fill contrast (ADR 0002)', () => {
  const mix = (a: string, b: string, p: number) =>
    '#' +
    [1, 3, 5]
      .map((i) =>
        Math.round(parseInt(a.slice(i, i + 2), 16) * p + parseInt(b.slice(i, i + 2), 16) * (1 - p))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('');
  const fills = {
    vice: mix('#ff9db0', palette.vice.soft, 0.07),
    dark: palette.dark.soft,
    light: palette.light.soft,
  } as const;
  describe.each(['vice', 'dark', 'light'] as const)('%s', (theme) => {
    test.each(['text', 'muted', 'mark', 'link'] as const)(
      '%s on the hover fill meets 4.5:1',
      (fg) => {
        expect(contrastRatio(palette[theme][fg], fills[theme])).toBeGreaterThanOrEqual(4.5);
      },
    );
  });
  test('globals.css defines the fill tokens', () => {
    const css = readFileSync('src/app/globals.css', 'utf8');
    expect(css).toContain('--fill: color-mix(in srgb, #ff9db0 7%, var(--soft))');
    expect(css).toContain('--fill: var(--soft)');
  });
});
