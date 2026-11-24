import { readFileSync, statSync } from 'node:fs';
import { expect, test } from 'vitest';

// Spec 2026-11-23 §4.3: one self-hosted file, latin + cyrillic, preloaded on every page.
test('the Vice display font file stays within 60 KB', () => {
  const { size } = statSync('src/assets/fonts/science-gothic-vice.woff2');
  expect(size).toBeGreaterThan(10 * 1024);
  expect(size).toBeLessThanOrEqual(60 * 1024);
});

// Linux has no Arial and Android has neither Arial nor its metric clones, so each platform needs a
// fallback face the swap can match (CI on Linux caught a one-line jump at 320px).
test('fallback faces cover macOS/Windows, Linux and Android and are in the display stack', () => {
  // Prettier may wrap long declarations, so compare with whitespace collapsed.
  const css = readFileSync('src/app/globals.css', 'utf8').replace(/\s+/g, ' ');
  expect(css).toMatch(
    /font-family: 'Science Gothic Fallback';\s*src: local\('Arial'\), local\('Liberation Sans'\), local\('Arimo'\);/,
  );
  expect(css).toMatch(/font-family: 'Science Gothic Fallback Roboto';\s*src: local\('Roboto'\);/);
  expect(css).toContain(
    "--font-display: var(--font-science, 'Science Gothic Fallback'), 'Science Gothic Fallback', 'Science Gothic Fallback Roboto', sans-serif;",
  );
});
