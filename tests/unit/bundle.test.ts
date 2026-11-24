import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { describe, expect, test } from 'vitest';

// Next.js 16 App Router ships ~165 KB gzip of framework runtime (react-dom, router, prefetching)
// even with no client components. The budget guards against app code and dependencies
// growing on top of that baseline. See docs/architecture.md (budget revised 2026-11-15).
const BUDGET_BYTES = Number(process.env.JS_BUDGET_BYTES ?? 180 * 1024);
const pages = ['.next/server/app/index.html', '.next/server/app/uk.html'];

describe.skipIf(!existsSync(pages[0]!))('client JS budget (run after `pnpm build`)', () => {
  test.each(pages)('%s ships < 180 KB gzip of JavaScript', (page) => {
    const html = readFileSync(page, 'utf8');
    const srcs = [
      ...new Set([...html.matchAll(/<script[^>]+src="\/_next\/([^"]+)"/g)].map((m) => m[1]!)),
    ];
    expect(srcs.length).toBeGreaterThan(0);
    const total = srcs.reduce(
      (sum, src) => sum + gzipSync(readFileSync(join('.next', src))).length,
      0,
    );
    console.log(`${page}: ${srcs.length} scripts, ${(total / 1024).toFixed(1)} KB gzip`);
    expect(total).toBeLessThan(BUDGET_BYTES);
  });
});
