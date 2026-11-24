import { statSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

// next/font renames files with a content hash, so recognise the Vice font by its exact size.
const SCIENCE_BYTES = statSync('src/assets/fonts/science-gothic-vice.woff2').size;

/** Sum of layout-shift scores observed from navigation until `ms` after load. */
async function clsUntil(page: Page, ms: number) {
  return page.evaluate(
    (wait) =>
      new Promise<number>((resolve) => {
        let total = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries() as (PerformanceEntry & {
            value: number;
            hadRecentInput: boolean;
          })[])
            if (!e.hadRecentInput) total += e.value;
        }).observe({ type: 'layout-shift', buffered: true });
        setTimeout(() => resolve(total), wait);
      }),
    ms,
  );
}

/** Delay or block only the Science Gothic file; other fonts load normally. */
async function routeScienceGothic(page: Page, mode: 'delay' | 'abort') {
  await page.route('**/*.woff2', async (route) => {
    const res = await route.fetch();
    const body = await res.body();
    if (body.length !== SCIENCE_BYTES) return route.fulfill({ response: res, body });
    if (mode === 'abort') return route.abort();
    await new Promise((r) => setTimeout(r, 1500));
    return route.fulfill({ response: res, body });
  });
}

/** Local fallback faces load asynchronously too; measure once none of them is still loading. */
async function fallbacksSettled(page: Page) {
  await page.waitForFunction(() =>
    [...document.fonts].every(
      (f) => !f.family.startsWith('Science Gothic Fallback') || f.status !== 'loading',
    ),
  );
}

for (const width of [390, 1280]) {
  test(`delayed font keeps CLS < 0.05 at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await routeScienceGothic(page, 'delay');
    await page.goto('/');
    expect(await clsUntil(page, 3000)).toBeLessThan(0.05);
  });
}

for (const width of [320, 768, 1280]) {
  test(`fallback keeps the headline's height at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await routeScienceGothic(page, 'delay');
    // `load` would wait for the preloaded font, so measure as soon as the DOM is styled.
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // The block's height is what moves the content below; it must not change on swap.
    const headline = page.locator('#hero .text-display');
    await headline.waitFor();
    await fallbacksSettled(page);
    const pending = await page.evaluate(
      () =>
        ![...document.fonts].some(
          (f) => f.family.includes('scienceGothic') && f.status === 'loaded',
        ),
    );
    expect(pending, 'measured while the fallback was showing').toBe(true);
    const before = (await headline.boundingBox())!.height;
    await page.waitForFunction(() =>
      [...document.fonts].some((f) => f.family.includes('scienceGothic') && f.status === 'loaded'),
    );
    const after = (await headline.boundingBox())!.height;
    expect(Math.abs(after - before)).toBeLessThanOrEqual(2);
  });
}

// Below-the-fold headings use wider cuts (86–90%), each with its own tuned fallback.
for (const width of [320, 360, 375, 414, 768, 1024, 1280]) {
  test(`fallback keeps case and contact headings' height at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await routeScienceGothic(page, 'delay');
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const selectors = [
      '#unity h3',
      '#meal-planner h3',
      '#career-pro h3',
      '#contact h2',
      '#work h2',
      '#expertise h3',
    ];
    await page.locator(selectors[0]!).waitFor();
    await fallbacksSettled(page);
    const heights = () =>
      Promise.all(
        selectors.map((s) =>
          page
            .locator(s)
            .first()
            .evaluate((el) => el.getBoundingClientRect().height),
        ),
      );
    const before = await heights();
    await page.waitForFunction(() =>
      [...document.fonts].some((f) => f.family.includes('scienceGothic') && f.status === 'loaded'),
    );
    const after = await heights();
    const diffs = selectors.map(
      (s, i) => [s, Math.round(Math.abs(after[i]! - before[i]!))] as const,
    );
    expect(diffs.filter(([, d]) => d > 2)).toEqual([]);
  });
}

test('headings never break inside "full-stack"', async ({ page }) => {
  for (const [path, width] of [
    ['/', 320],
    ['/uk', 320],
    ['/', 390],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    for (const sel of ['#hero .headline', '#contact h2']) {
      const split = await page.locator(sel).evaluate((el) => {
        const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let n: Node | null;
        while ((n = tw.nextNode())) {
          const i = n.textContent!.toLowerCase().indexOf('full-stack');
          if (i < 0) continue;
          const r = document.createRange();
          r.setStart(n, i);
          r.setEnd(n, i + 'full-stack'.length);
          return r.getClientRects().length > 1;
        }
        return false;
      });
      expect(split, `${path} ${width} ${sel}`).toBe(false);
    }
  }
});

test('blocked font still renders the headline', async ({ page }) => {
  await routeScienceGothic(page, 'abort');
  await page.goto('/');
  const box = await page.locator('#hero .text-display').boundingBox();
  expect(box?.height ?? 0).toBeGreaterThan(0);
  await expect(page.locator('#hero .text-display')).toBeVisible();
});

test('dark never uses Science Gothic', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await page.goto('/');
  const science = await page.evaluate(() =>
    getComputedStyle(document.documentElement)
      .getPropertyValue('--font-science')
      .split(',')[0]!
      .trim(),
  );
  const users = await page.evaluate(
    (fam) =>
      [...document.querySelectorAll('body *')].filter(
        (el) => getComputedStyle(el).fontFamily.split(',')[0]!.trim() === fam,
      ).length,
    science,
  );
  expect(science).not.toBe('');
  expect(users).toBe(0);
});
