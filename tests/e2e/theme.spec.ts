import { expect, test } from '@playwright/test';
import { palette } from '../../src/design/tokens';
import { expectNoA11yViolations } from './helpers';

// The CSS minifier may shorten hex colours (#ffffff → #fff), so compare expanded values.
const expand = (hex: string) =>
  hex.length === 4 ? `#${[...hex.slice(1)].map((c) => c + c).join('')}` : hex;
const bgVar = async (page: import('@playwright/test').Page) =>
  expand(
    await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(),
    ),
  );

test('vice is the default even under a light system setting', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  expect(await bgVar(page)).toBe(palette.vice.bg);
});

test('switch shows three pressed-state buttons in order vice, dark, light', async ({ page }) => {
  await page.goto('/');
  const group = page.getByRole('group', { name: 'Theme' });
  const buttons = group.getByRole('button');
  await expect(buttons).toHaveCount(3);
  for (const [i, name] of ['vice', 'dark', 'light'].entries()) {
    await expect(buttons.nth(i)).toHaveAccessibleName(`${name} theme`);
    await expect(buttons.nth(i)).toHaveAttribute('aria-pressed', i === 0 ? 'true' : 'false');
  }
});

test('switching to light persists, then back to vice', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'light theme', exact: true }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('button', { name: 'light theme', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'vice theme', exact: true }).click();
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.dataset.theme ?? 'vice')).toBe('vice');
  expect(await bgVar(page)).toBe(palette.vice.bg);
});

test('toggle to light persists across reloads', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'light theme', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await bgVar(page)).toBe(palette.light.bg);
  await page.getByRole('button', { name: 'dark theme', exact: true }).click();
  await page.reload();
  expect(await bgVar(page)).toBe(palette.dark.bg);
});

test('stored dark applies before hydration (returning visitors keep dark)', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark');
  expect(await bgVar(page)).toBe(palette.dark.bg);
});

test('stored light theme applies before hydration (no flash)', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('theme', 'light'));
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe('light');
});

test('without JavaScript the page is vice', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, colorScheme: 'light' });
  const page = await context.newPage();
  await page.goto('http://localhost:3000/');
  expect(await bgVar(page)).toBe(palette.vice.bg);
  await context.close();
});

for (const theme of ['vice', 'dark', 'light'] as const) {
  test(`no a11y violations in ${theme} theme`, async ({ page }) => {
    if (theme !== 'vice') await page.addInitScript((v) => localStorage.setItem('theme', v), theme);
    await page.goto('/');
    await expectNoA11yViolations(page);
  });
}

// Before hydration (here: never, the JS chunks are blocked) the bootstrap has already marked the
// page as scripted, so the switch shows; the current theme must look pressed from the first paint.
for (const theme of ['vice', 'dark'] as const) {
  test(`switch shows ${theme} as current before hydration`, async ({ page }) => {
    if (theme !== 'vice') await page.addInitScript((v) => localStorage.setItem('theme', v), theme);
    await page.route('**/_next/static/chunks/*.js', (r) => r.abort());
    await page.goto('/');
    const buttons = page.getByRole('group', { name: 'Theme' }).getByRole('button');
    await expect(buttons).toHaveCount(3);
    const soft = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.background = 'var(--soft)';
      document.body.append(probe);
      const c = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return c;
    });
    for (const [i, name] of (['vice', 'dark', 'light'] as const).entries()) {
      const bg = await buttons.nth(i).evaluate((el) => getComputedStyle(el).backgroundColor);
      if (name === theme) expect(bg, name).toBe(soft);
      else expect(bg, name).not.toBe(soft);
      // No false claims before the theme is known.
      await expect(buttons.nth(i)).not.toHaveAttribute('aria-pressed', /.*/);
    }
  });
}

// Effect 12 (ADR 0002): the new theme opens as a circle from the control.
const countViewTransitions = () => {
  (window as unknown as { __vt: number }).__vt = 0;
  const original = Document.prototype.startViewTransition;
  if (!original) return;
  Document.prototype.startViewTransition = function (this: Document, ...args) {
    (window as unknown as { __vt: number }).__vt++;
    return original.apply(this, args as Parameters<typeof original>);
  } as typeof original;
};
const viewTransitions = (page: import('@playwright/test').Page) =>
  page.evaluate(() => (window as unknown as { __vt: number }).__vt);

test('switching theme opens a view transition from the button', async ({ page }) => {
  await page.addInitScript(countViewTransitions);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const button = page.getByRole('button', { name: 'dark theme', exact: true });
  await button.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await viewTransitions(page)).toBe(1);
  const box = (await button.boundingBox())!;
  const x = await page.evaluate(() =>
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--vt-x')),
  );
  expect(x).toBeGreaterThanOrEqual(box.x);
  expect(x).toBeLessThanOrEqual(box.x + box.width);
});

test('no view transition under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(countViewTransitions);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'dark theme', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await viewTransitions(page)).toBe(0);
});

test('terminal theme command transitions too', async ({ page }) => {
  await page.addInitScript(countViewTransitions);
  await page.goto('/');
  // The terminal mounts after hydration; wait for it before using its shortcut.
  await expect(page.locator('#term-input')).toBeVisible();
  await page.keyboard.press('/');
  await expect(page.locator('#term-input')).toBeFocused();
  await page.keyboard.type('theme light');
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await viewTransitions(page)).toBe(1);
});

test('double switch settles on the last choice', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'dark theme', exact: true }).click();
  await page.getByRole('button', { name: 'light theme', exact: true }).click({ delay: 0 });
  await page.waitForTimeout(800);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('light');
  expect(errors).toEqual([]);
});

test('a second click during the circle still switches the theme', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const dark = (await page.getByRole('button', { name: 'dark theme', exact: true }).boundingBox())!;
  const light = (await page
    .getByRole('button', { name: 'light theme', exact: true })
    .boundingBox())!;
  // Raw mouse clicks: no actionability wait, like a person clicking twice quickly.
  await page.mouse.click(dark.x + dark.width / 2, dark.y + dark.height / 2);
  await page.waitForTimeout(100);
  await page.mouse.click(light.x + light.width / 2, light.y + light.height / 2);
  await page.waitForTimeout(900);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  // The skipped first transition rejects its `ready` promise; that must stay handled.
  expect(errors).toEqual([]);
});

test('colours do not transition while the theme circle opens', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const dark = (await page.getByRole('button', { name: 'dark theme', exact: true }).boundingBox())!;
  await page.mouse.click(dark.x + dark.width / 2, dark.y + dark.height / 2);
  const during = await page.evaluate(
    () => getComputedStyle(document.querySelector('.site-header a')!).transitionDuration,
  );
  expect(new Set(during.split(', '))).toEqual(new Set(['0s']));
  await page.waitForTimeout(900);
  const after = await page.evaluate(
    () => getComputedStyle(document.querySelector('.site-header a')!).transitionDuration,
  );
  expect(after.split(', ')).toContain('0.15s');
});
