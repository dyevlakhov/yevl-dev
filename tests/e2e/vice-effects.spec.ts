import { expect, test, type Page } from '@playwright/test';

const style = (page: Page, selector: string, pseudo: string | null, prop: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((el, [ps, pr]) => getComputedStyle(el, ps).getPropertyValue(pr!), [pseudo, prop]);

test.describe('vice effects (default theme)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
  });

  test('the role headline is filled with the dusk gradient', async ({ page }) => {
    expect(await style(page, '#hero .headline', null, 'background-image')).toContain(
      'linear-gradient',
    );
    expect(await style(page, '#hero .headline', null, '-webkit-background-clip')).toBe('text');
  });

  test('a 1px dusk horizon sits under the header', async ({ page }) => {
    expect(await style(page, '.site-header', '::after', 'height')).toBe('1px');
    expect(await style(page, '.site-header', '::after', 'background-image')).toContain(
      'linear-gradient',
    );
  });

  test('the key/value bar and the contact card carry dusk edges', async ({ page }) => {
    expect(await style(page, '.kv-bar', '::after', 'background-image')).toContain(
      'linear-gradient',
    );
    expect(await style(page, '.contact-card', '::before', 'background-image')).toContain(
      'linear-gradient',
    );
  });

  test('the warm light sits on the body, outside the dot-grid mask', async ({ page }) => {
    expect(await style(page, 'body', null, 'background-image')).toContain('radial-gradient');
    expect(await style(page, '.page-bg', '::before', 'content')).toMatch(/none|normal/);
  });

  test('case tiles glow from the bottom', async ({ page }) => {
    for (const d of ['architecture', 'decisions', 'release'])
      expect(
        await style(page, `.case-tile[data-diagram="${d}"]`, null, 'background-image'),
        d,
      ).toContain('radial-gradient');
  });
});

test('dark has none of the Vice effects', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
  await page.goto('/');
  expect(await style(page, '#hero .headline', null, 'background-image')).toBe('none');
  expect(await style(page, '.site-header', '::after', 'content')).toMatch(/none|normal/);
  expect(await style(page, '.kv-bar', '::after', 'content')).toMatch(/none|normal/);
  expect(await style(page, '.contact-card', '::before', 'content')).toMatch(/none|normal/);
  expect(await style(page, '.case-tile', null, 'background-image')).toBe('none');
  expect(await style(page, 'body', null, 'background-image')).toBe('none');
});

test('forced colours show the headline', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.goto('/');
  expect(await style(page, '#hero .headline', null, 'color')).not.toBe('rgba(0, 0, 0, 0)');
});
