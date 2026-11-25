import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './helpers';

test('first Tab focuses the skip link', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveText('Skip to content');
});

// Section existence is asserted by the landing specs; here every present target must clear the nav.
test('anchor targets are not hidden under the sticky nav', async ({ page }) => {
  await page.goto('/');
  const navHeight = await page
    .getByRole('navigation', { name: /primary/i })
    .evaluate((el) => el.getBoundingClientRect().height);
  const hrefs = await page
    .getByRole('navigation', { name: /primary/i })
    .locator('a[href^="#"]')
    .evaluateAll((els) => els.map((e) => e.getAttribute('href')!));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) {
    if ((await page.locator(href).count()) === 0) continue;
    const margin = await page
      .locator(href)
      .evaluate((el) => parseFloat(getComputedStyle(el).scrollMarginTop));
    expect(margin, href).toBeGreaterThanOrEqual(navHeight);
  }
});

test('specimen page renders without a11y violations', async ({ page }) => {
  // The specimen is off in production (src/lib/env.ts); BASE_URL runs target the live site.
  test.skip(!!process.env.BASE_URL, 'specimen is not served in production');
  const res = await page.goto('/dev/specimen');
  expect(res?.status()).toBe(200);
  await expectNoA11yViolations(page);
});
