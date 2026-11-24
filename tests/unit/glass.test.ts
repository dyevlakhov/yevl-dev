import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from 'vitest';

// Playwright cannot emulate prefers-reduced-transparency, so the fallbacks are checked in the CSS.
const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
const block = (start: string) => {
  const i = css.indexOf(start);
  return i < 0 ? '' : css.slice(i, css.indexOf('\n}\n', i));
};

test.each(['@media (prefers-reduced-transparency: reduce)', '@supports not'])(
  '%s resets glass to a solid surface',
  (start) => {
    const b = block(start);
    expect(b).toMatch(/\.glass\s*\{[^}]*background:\s*var\(--soft\)/);
    expect(b).toMatch(/header[^{]*\{[^}]*background:\s*var\(--bg\)/);
  },
);
