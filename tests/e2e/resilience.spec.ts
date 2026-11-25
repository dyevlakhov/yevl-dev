import { expect, test } from '@playwright/test';
import { localePath, locales } from '../../src/i18n/locales';

for (const locale of locales) {
  for (const width of [320, 360]) {
    test(`${locale} nav links never break mid-word at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(localePath(locale));
      const nav = page.getByRole('navigation').first();
      for (const link of await nav.locator('a:visible').all()) {
        const lines = await link.evaluate((el) => {
          const lh = parseFloat(getComputedStyle(el).lineHeight) || 20;
          const range = document.createRange();
          range.selectNodeContents(el);
          return Math.round(range.getBoundingClientRect().height / lh);
        });
        expect(lines, await link.innerText()).toBeLessThanOrEqual(1);
      }
    });
  }
}

test('theme switch is absent when JavaScript is disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('button', { name: /theme/i })).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Theme' })).toHaveCount(0);
  await context.close();
});
