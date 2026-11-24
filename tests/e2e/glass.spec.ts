import { expect, test } from '@playwright/test';
import { localePath, locales } from '../../src/i18n/locales';

// Glass and background, docs/architecture.md.
for (const locale of locales) {
  test(`${locale}: background layer is decorative and inert`, async ({ page }) => {
    await page.goto(localePath(locale));
    const bg = page.locator('body > .page-bg');
    await expect(bg).toHaveCount(1);
    await expect(bg).toHaveAttribute('aria-hidden', 'true');
    const style = await bg.evaluate((el) => {
      const s = getComputedStyle(el);
      return { pointerEvents: s.pointerEvents, position: s.position };
    });
    expect(style).toEqual({ pointerEvents: 'none', position: 'absolute' });
  });
}

test('glass sits on header, profile.yaml and terminal only', async ({ page }) => {
  await page.goto('/');
  await page.locator('section.term').waitFor();
  const filter = (selector: string) =>
    page
      .locator(selector)
      .first()
      .evaluate((el) => getComputedStyle(el).backdropFilter);
  for (const s of ['body > header', '#hero .glass', 'section.term']) {
    expect(await filter(s), s).toContain('blur');
  }
  for (const s of ['.case-body', '#contact']) {
    expect(await filter(s), s).toBe('none');
  }
});
