import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

// Spec 2026-11-24 §6: the monospace fallback must match JetBrains Mono's 0.6 em advance on every
// platform, or a late font swap reflows mono text. Consolas (~0.55 em) does not.
test('JetBrains Mono falls back only to 0.6 em monospace fonts', () => {
  const src = readFileSync('src/design/fonts.ts', 'utf8');
  const block = src.slice(
    src.indexOf('JetBrains_Mono({'),
    src.indexOf('});', src.indexOf('JetBrains_Mono({')),
  );
  const fallback = block.match(/fallback: \[([^\]]*)\]/)![1]!;
  expect(fallback).not.toContain('Consolas');
  expect(fallback).toContain("'Courier New'");
  expect(fallback.indexOf("'Courier New'")).toBeLessThan(fallback.indexOf("'monospace'"));
});
