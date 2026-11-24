import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './helpers';

test('home responds and has one h1', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('ukrainian home responds with lang=uk', async ({ page }) => {
  const res = await page.goto('/uk');
  expect(res?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
});

test('home has no a11y violations', async ({ page }) => {
  await page.goto('/');
  await expectNoA11yViolations(page);
});
