import { expect, test } from '@playwright/test';

const px = (v: string) => parseFloat(v);

test.describe('dark theme type scale (unchanged)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  });

  test('hero name line is 15–16px monospace', async ({ page }) => {
    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const size = await page
        .locator('#hero .hero-name')
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      expect(size).toBeGreaterThanOrEqual(15);
      expect(size).toBeLessThanOrEqual(16);
    }
  });

  test('headline scales from 30px to 44px', async ({ page }) => {
    for (const [width, size] of [
      [390, 30],
      [1920, 44],
    ] as const) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const px = await page
        .locator('#hero .text-display')
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      expect(Math.abs(px - size)).toBeLessThanOrEqual(0.5);
    }
  });

  test('nothing on the page is set below 12px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto('/');
    const tiny = await page.evaluate(() =>
      [...document.querySelectorAll('main *, header *, footer *')]
        .filter(
          (el) =>
            el.childNodes.length &&
            [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()),
        )
        .filter((el) => !el.closest('svg') && !el.closest('.sr-only'))
        .map(
          (el) =>
            [
              el.tagName,
              parseFloat(getComputedStyle(el).fontSize),
              el.textContent!.slice(0, 30),
            ] as const,
        )
        .filter(([, s]) => s < 12),
    );
    expect(tiny).toEqual([]);
  });

  test('body text is 16px at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto('/');
    const size = await page
      .locator('main p.text-body')
      .first()
      .evaluate((el) => getComputedStyle(el).fontSize);
    expect(px(size)).toBe(16);
  });

  test('name uses JetBrains Mono; headline and prose use IBM Plex Sans (self-hosted)', async ({
    page,
  }) => {
    await page.goto('/');
    const name = await page
      .locator('#hero .hero-name')
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(name.toLowerCase()).toContain('jetbrains');
    const display = await page
      .locator('#hero .text-display')
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(display.toLowerCase()).toContain('plex');
    const prose = await page
      .locator('main p.text-body')
      .first()
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(prose.toLowerCase()).toContain('plex');
  });
});

// First family name, without quotes, for comparing computed font stacks.
const first = (stack: string) =>
  stack
    .split(',')[0]!
    .trim()
    .replace(/^['"]|['"]$/g, '');

test.describe('vice theme type scale (default)', () => {
  test('name line stays 15–16px JetBrains Mono', async ({ page }) => {
    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const [size, family] = await page
        .locator('#hero .hero-name')
        .evaluate((el) => [
          parseFloat(getComputedStyle(el).fontSize),
          getComputedStyle(el).fontFamily,
        ]);
      expect(size).toBeGreaterThanOrEqual(15);
      expect(size).toBeLessThanOrEqual(16);
      expect(String(family).toLowerCase()).toContain('jetbrains');
    }
  });

  test('stack line sits 8px below the headline at 22px', async ({ page }) => {
    await page.goto('/');
    const [margin, size] = await page
      .locator('#hero .stack-line')
      .evaluate((el) => [
        parseFloat(getComputedStyle(el).marginTop),
        parseFloat(getComputedStyle(el).fontSize),
      ]);
    expect(margin).toBe(8);
    expect(size).toBe(22);
  });

  test('headline scales from 34px to 54px', async ({ page }) => {
    for (const [width, size] of [
      [390, 34],
      [1920, 54],
    ] as const) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const got = await page
        .locator('#hero .text-display')
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      expect(Math.abs(got - size)).toBeLessThanOrEqual(1);
    }
  });

  test('headings use Science Gothic; the experience title stays monospace', async ({ page }) => {
    await page.goto('/');
    const science = first(
      await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--font-science'),
      ),
    );
    expect(science).not.toBe('');
    for (const sel of [
      '#hero .text-display',
      '#work h2',
      '#work h3',
      '#contact h2',
      '#career .head-sm',
    ]) {
      const family = await page
        .locator(sel)
        .first()
        .evaluate((el) => getComputedStyle(el).fontFamily);
      expect(first(family), sel).toBe(science);
    }
    const title = await page
      .locator('#experience h3 span')
      .first()
      .evaluate((el) => getComputedStyle(el).fontFamily);
    expect(title.toLowerCase()).toContain('jetbrains');
  });

  test('nothing on the page is set below 12px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto('/');
    const tiny = await page.evaluate(() =>
      [...document.querySelectorAll('main *, header *, footer *')]
        .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()))
        .filter((el) => !el.closest('svg') && !el.closest('.sr-only'))
        .map((el) => [el.tagName, parseFloat(getComputedStyle(el).fontSize)] as const)
        .filter(([, s]) => s < 12),
    );
    expect(tiny).toEqual([]);
  });
});

for (const path of ['/', '/uk']) {
  for (const width of [320, 390, 1280, 1920, 2560]) {
    test(`no horizontal scroll on ${path} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
}

// The header grew a three-way switch; sweep every 20px so no width between breakpoints overflows.
for (const theme of ['vice', 'dark', 'light'] as const) {
  for (const path of ['/', '/uk']) {
    test(`no horizontal scroll from 320 to 1280px on ${path} (${theme})`, async ({ page }) => {
      if (theme !== 'vice')
        await page.addInitScript((v) => localStorage.setItem('theme', v), theme);
      await page.setViewportSize({ width: 320, height: 900 });
      await page.goto(path);
      const bad: number[] = [];
      for (let width = 320; width <= 1280; width += 20) {
        await page.setViewportSize({ width, height: 900 });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        if (overflow > 0) bad.push(width);
      }
      expect(bad).toEqual([]);
    });
  }
}
