import { createHash } from 'node:crypto';
import { expect, test } from '@playwright/test';

for (const path of ['/', '/uk', '/missing-font-audit-page']) {
  test(`${path}: each font file is downloaded only once`, async ({ page }) => {
    const fonts: Promise<{ url: string; hash: string }>[] = [];
    page.on('response', (response) => {
      if (response.request().resourceType() !== 'font') return;
      fonts.push(
        response.body().then((body) => ({
          url: response.url(),
          hash: createHash('sha256').update(body).digest('hex'),
        })),
      );
    });
    await page.goto(path);
    await page.evaluate(() => document.fonts.ready);
    const downloaded = await Promise.all(fonts);
    expect(downloaded.length).toBeGreaterThan(0);
    const duplicates = downloaded.filter(
      (font, index) => downloaded.findIndex((other) => other.hash === font.hash) !== index,
    );
    expect(duplicates).toEqual([]);
  });
}
