import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './helpers';

for (const [path, ogLocale] of [
  ['/', 'en_US'],
  ['/uk', 'uk_UA'],
] as const) {
  test(`${path}: link preview metadata and a 1200×630 PNG`, async ({ page, request }) => {
    await page.goto(path);
    const meta = (sel: string) => page.locator(sel).first().getAttribute('content');
    expect(await meta('meta[property="og:title"]')).toBeTruthy();
    expect(await meta('meta[property="og:description"]')).toBeTruthy();
    expect(await meta('meta[property="og:locale"]')).toBe(ogLocale);
    expect(await meta('meta[name="twitter:card"]')).toBe('summary_large_image');
    const image = await meta('meta[property="og:image"]');
    expect(await meta('meta[property="og:image:width"]')).toBe('1200');
    expect(await meta('meta[property="og:image:height"]')).toBe('630');
    const res = await request.get(new URL(image!).pathname);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/png');
  });

  test(`${path}: one JSON-LD ProfilePage`, async ({ page }) => {
    await page.goto(path);
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blocks).toHaveLength(1);
    expect(JSON.parse(blocks[0]!)['@type']).toBe('ProfilePage');
  });
}

test('sitemap lists both locales with alternates; robots points to it', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('<loc>https://yevl.dev</loc>');
  expect(sitemap).toContain('<loc>https://yevl.dev/uk</loc>');
  expect(sitemap).toContain('hreflang="uk"');
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Allow: /');
  expect(robots).toContain('Sitemap: https://yevl.dev/sitemap.xml');
});

test('security headers are set', async ({ request }) => {
  const h = (await request.get('/')).headers();
  const csp = h['content-security-policy'] ?? '';
  for (const d of [
    "default-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
  ])
    expect(csp).toContain(d);
  expect(h['strict-transport-security']).toContain('max-age=');
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(h['permissions-policy']).toContain('camera=()');
});

test('no CSP violations, and scripted UI still works under the policy', async ({ page }) => {
  const violations: string[] = [];
  page.on(
    'console',
    (m) => /Content.Security.Policy|Refused to/i.test(m.text()) && violations.push(m.text()),
  );
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('textbox').fill('whoami');
  await page.getByRole('textbox').press('Enter');
  await expect(page.locator('[aria-live="polite"]')).toContainText('Dmytro Yevlakhov');
  await page.getByRole('button', { name: 'light theme', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(violations).toEqual([]);
});

test('unknown URLs get a bilingual 404 in the default theme', async ({ page }) => {
  const res = await page.goto('/no-such-page');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('404');
  await expect(page.locator('a[href="/"]')).toHaveCount(1);
  await expect(page.locator('a[href="/uk"]')).toHaveCount(1);
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  // The 404 shares globals.css, so it uses the default Vice background (#0c0b0f).
  expect(bg).toBe('rgb(12, 11, 15)');
  await expectNoA11yViolations(page);
});
