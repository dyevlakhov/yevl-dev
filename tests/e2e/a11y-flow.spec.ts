import { expect, test } from '@playwright/test';
import { getContent } from '../../src/content';
import { localePath, locales } from '../../src/i18n/locales';
import { messages } from '../../src/i18n/messages';
import { expectNoA11yViolations } from './helpers';

for (const locale of locales) {
  const t = messages[locale];
  const path = localePath(locale);
  const c = getContent(locale);

  test(`${locale}: skip link moves focus into main; the next Tab stays in main`, async ({
    page,
  }) => {
    await page.goto(path);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: t.skip })).toBeFocused();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    const inMain = await page.evaluate(
      () => !!document.activeElement && !!document.activeElement.closest('main'),
    );
    expect(inMain).toBe(true);
    // The first focusable element in main is the hero's first CTA.
    await expect(page.locator('#hero').getByRole('link', { name: t.actions.email })).toBeFocused();
  });

  test(`${locale}: canonical, hreflang and Open Graph match the hero`, async ({ page }) => {
    await page.goto(path);
    const attr = (sel: string, name: string) => page.locator(sel).getAttribute(name);
    expect(await attr('link[rel="canonical"]', 'href')).toBe(
      locale === 'en' ? 'https://yevl.dev' : 'https://yevl.dev/uk',
    );
    for (const [lang, href] of [
      ['en', 'https://yevl.dev'],
      ['uk', 'https://yevl.dev/uk'],
      ['x-default', 'https://yevl.dev'],
    ])
      expect(await attr(`link[rel="alternate"][hreflang="${lang}"]`, 'href')).toBe(href);
    const title = `${c.profile.name} · ${c.profile.title}`;
    await expect(page).toHaveTitle(title);
    expect(await attr('meta[property="og:title"]', 'content')).toBe(title);
    expect(await attr('meta[name="description"]', 'content')).toBe(c.profile.metaDescription);
    expect(await attr('meta[property="og:description"]', 'content')).toBe(
      c.profile.metaDescription,
    );
  });

  for (const theme of ['vice', 'dark', 'light'] as const) {
    for (const width of [360, 1280]) {
      test(`${locale}: axe passes in the ${theme} theme at ${width}px`, async ({ page }) => {
        if (theme !== 'vice')
          await page.addInitScript((v) => localStorage.setItem('theme', v), theme);
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        // Vice is the default and sets no attribute; dark and light set data-theme.
        const set = await page.evaluate(() => document.documentElement.dataset.theme ?? '');
        expect(set).toBe(theme === 'vice' ? '' : theme);
        await expectNoA11yViolations(page);
      });
    }
  }
}

test('sitemap lists both locales with alternates; the CV is a PDF', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('<loc>https://yevl.dev</loc>');
  expect(sitemap).toContain('<loc>https://yevl.dev/uk</loc>');
  expect(sitemap).toContain('hreflang="uk"');
  const cv = await request.get('/cv.pdf');
  expect(cv.status()).toBe(200);
  expect(cv.headers()['content-type']).toContain('application/pdf');
});
