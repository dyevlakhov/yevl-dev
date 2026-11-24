import { expect, test } from '@playwright/test';
import { localePath, locales } from '../../src/i18n/locales';
import { messages } from '../../src/i18n/messages';

for (const locale of locales) {
  const t = messages[locale];
  const path = localePath(locale);

  for (const width of [320, 360]) {
    test(`${locale} at ${width}px: work and contact stay in the header, on one line`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path);
      const nav = page.getByRole('navigation').first();
      await expect(nav.locator('ul a:visible')).toHaveText([t.nav.work, t.nav.contact]);
      // Label in Name (WCAG 2.5.3): the name contains the visible short label and the full language.
      const name = await nav.locator('a[hreflang]').evaluate((el) => el.textContent ?? '');
      expect(name).toContain(t.nav.otherLocaleShort);
      expect(name).toContain(t.nav.otherLocale);
      expect(await nav.locator('a[hreflang]').getAttribute('aria-label')).toBeNull();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
      const header = (await page.locator('body > header').boundingBox())!;
      expect(header.height).toBeLessThanOrEqual(56);
    });
  }

  test(`${locale} at 1280px: all four section links are visible`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(path);
    const nav = page.getByRole('navigation').first();
    await expect(nav.locator('ul a:visible')).toHaveText([
      t.nav.work,
      t.nav.expertise,
      t.nav.experience,
      t.nav.contact,
    ]);
  });
}

test('theme switch fits the 320px header in UK', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/uk');
  const buttons = page.getByRole('group', { name: 'Тема' }).getByRole('button');
  await expect(buttons).toHaveCount(3);
  // With aria-pressed, the name is the option itself; the pressed state is announced separately.
  await expect(buttons.nth(1)).toHaveAccessibleName('тема «темна»');
  for (const box of await Promise.all((await buttons.all()).map((b) => b.boundingBox()))) {
    expect(box!.width).toBeGreaterThanOrEqual(32);
    expect(box!.height).toBeGreaterThanOrEqual(32);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  // Every visible header item sits on one row.
  const tops = await page
    .locator('header nav > *:visible')
    .evaluateAll((els) =>
      els.map((el) => el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2),
    );
  expect(Math.max(...tops) - Math.min(...tops)).toBeLessThanOrEqual(2);
});
