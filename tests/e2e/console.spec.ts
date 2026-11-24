import { expect, test } from '@playwright/test';

for (const path of ['/', '/uk']) {
  test(`${path} loads without console errors or failed requests`, async ({ page }) => {
    const problems: string[] = [];
    page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`));
    page.on('response', (r) => r.status() >= 400 && problems.push(`${r.status()} ${r.url()}`));
    await page.goto(path, { waitUntil: 'networkidle' });
    expect(problems).toEqual([]);
  });
}

for (const path of ['/', '/uk']) {
  test(`${path} declares a site icon that resolves`, async ({ page, request }) => {
    await page.goto(path);
    const href = await page.locator('link[rel="icon"]').first().getAttribute('href');
    expect(href).toBeTruthy();
    expect((await request.get(href!)).status()).toBe(200);
    // Browsers and crawlers also probe /favicon.ico directly.
    expect((await request.get('/favicon.ico')).status()).toBe(200);
  });
}
