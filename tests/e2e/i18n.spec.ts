import { expect, test } from '@playwright/test';
import { getContent } from '../../src/content';

for (const [path, locale, other] of [
  ['/', 'en', { text: 'Українською', href: '/uk', lang: 'uk' }],
  ['/uk', 'uk', { text: 'English', href: '/', lang: 'en' }],
] as const) {
  test(`${path} renders ${locale} with a link to the other language`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('h1 .hero-name')).toHaveText(getContent(locale).profile.name);
    const link = page.getByRole('navigation').getByRole('link', { name: other.text });
    await expect(link).toHaveAttribute('href', other.href);
    await expect(link).toHaveAttribute('hreflang', other.lang);
    await expect(link).toHaveAttribute('lang', other.lang);
  });

  test(`${path} declares hreflang alternates and a self canonical`, async ({ page }) => {
    await page.goto(path);
    for (const lang of ['en', 'uk', 'x-default']) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveCount(1);
    }
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(new URL(canonical!).pathname).toBe(path);
  });
}

test('browser language never redirects', async ({ browser }) => {
  const context = await browser.newContext({
    locale: 'uk-UA',
    extraHTTPHeaders: { 'Accept-Language': 'uk' },
  });
  const page = await context.newPage();
  const res = await page.goto('/');
  expect(res?.status()).toBe(200);
  expect(new URL(page.url()).pathname).toBe('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await context.close();
});
