import { expect, test } from '@playwright/test';
import { emailHref } from '../../src/content/links';
import { palette } from '../../src/design/tokens';
import { getContent } from '../../src/content';
import { localePath, locales } from '../../src/i18n/locales';
import { messages } from '../../src/i18n/messages';
import { monthRange } from '../../src/lib/format';
import { expectNoA11yViolations } from './helpers';

for (const locale of locales) {
  const c = getContent(locale);
  const t = messages[locale];
  const path = localePath(locale);

  test.describe(`${locale} landing: work, experience, contact`, () => {
    test('work cases with anchors, labelled diagrams, meta, titles and tags', async ({ page }) => {
      await page.goto(path);
      for (const cs of c.cases) {
        const row = page.locator(`#work article#${cs.slug}`);
        await expect(row.locator('h3')).toHaveText(cs.title);
        await expect(row.locator('svg[role="img"]')).toHaveAttribute(
          'aria-label',
          t.diagrams[cs.diagram].label,
        );
        await expect(row).toContainText(t.diagrams[cs.diagram].file);
        for (const m of cs.meta) await expect(row).toContainText(m);
        for (const tag of cs.tags) await expect(row.getByText(tag, { exact: true })).toBeVisible();
      }
      for (const item of c.also)
        await expect(page.locator('#work').getByText(item.label)).toBeVisible();
    });

    test('experience with month ranges, titles and bullets', async ({ page }) => {
      await page.goto(path);
      const roles = page.locator('#experience article[data-role]');
      await expect(roles).toHaveCount(c.roles.length);
      for (const [i, r] of c.roles.entries()) {
        await expect(roles.nth(i)).toContainText(monthRange(r.start, r.end));
        await expect(roles.nth(i)).toContainText(r.title);
        await expect(roles.nth(i).locator('li')).toHaveCount(r.bullets.length);
      }
    });

    test('contact and footer', async ({ page }) => {
      await page.goto(path);
      const contact = page.locator('#contact');
      await expect(contact.locator('h2')).toHaveText(t.sections.contact.title);
      await expect(contact.locator(`a[href="${emailHref(t.contact.subject)}"]`)).toHaveCount(1);
      // The address is readable and copyable for visitors whose mailto opens nothing.
      await expect(contact.getByText('yevlakhovdmytro@gmail.com', { exact: true })).toBeVisible();
      await expect(contact.locator('a[href="/cv.pdf"]')).toHaveCount(1);
      await expect(page.locator('body > footer')).toContainText('© 2026');
      await expect(page.locator('a[href*="github.com/dyevlakhov/yevl-dev"]')).toHaveCount(0);
    });

    test('readable and in the vice theme without JavaScript', async ({ browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false, colorScheme: 'light' });
      const page = await context.newPage();
      await page.goto(`http://localhost:3000${path}`);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('#hero dl')).toBeVisible();
      await expect(page.locator('#work h3').first()).toBeVisible();
      await expect(page.locator('#experience')).toBeVisible();
      const bg = await page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--bg').trim(),
      );
      expect(bg).toBe(palette.vice.bg);
      await context.close();
    });

    for (const theme of ['vice', 'dark', 'light'] as const) {
      test(`full page has no a11y violations (${theme})`, async ({ page }) => {
        // Vice is the default and needs no stored choice.
        if (theme !== 'vice')
          await page.addInitScript((v) => localStorage.setItem('theme', v), theme);
        await page.goto(path);
        await expectNoA11yViolations(page);
      });
    }

    test('full-page screenshots for review (CI artifact)', async ({ page }) => {
      for (const width of [390, 1280, 2560]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(path);
        await page.screenshot({
          path: `test-results/screens/${locale}-${width}.png`,
          fullPage: true,
          animations: 'disabled',
        });
      }
    });
  });
}

for (const locale of locales) {
  const path = localePath(locale);

  test(`${locale}: sections follow the positioning order; nav follows the page order`, async ({
    page,
  }) => {
    await page.goto(path);
    const y = (sel: string) => page.locator(sel).evaluate((el) => el.getBoundingClientRect().top);
    const order = [
      '#hero',
      '#career',
      '#work',
      '#expertise',
      '#experience',
      '#how-i-work',
      '.term-slot',
      '#contact',
    ];
    const tops = [];
    for (const sel of order) tops.push(await y(sel));
    expect(tops).toEqual([...tops].sort((p, q) => p - q));
    const hrefs = await page
      .getByRole('navigation')
      .locator('ul a')
      .evaluateAll((els) => els.map((e) => e.getAttribute('href')));
    expect(hrefs).toEqual(['#work', '#expertise', '#experience', '#contact']);
  });

  test(`${locale}: language link shows a decorative flag`, async ({ page }) => {
    await page.goto(path);
    const link = page.getByRole('navigation').locator('a[hreflang]');
    const flag = link.locator('svg');
    await expect(flag).toHaveCount(1);
    await expect(flag).toHaveAttribute('aria-hidden', 'true');
    await expect(flag).toBeVisible();
  });
}

for (const locale of locales) {
  test(`${locale}: CV links declare English PDF; new-tab links say so`, async ({ page }) => {
    await page.goto(localePath(locale));
    for (const a of await page.locator('a[href="/cv.pdf"]').all()) {
      expect(await a.getAttribute('hreflang')).toBe('en');
      expect(await a.getAttribute('type')).toBe('application/pdf');
    }
    for (const a of await page.locator('main a[target="_blank"]').all()) {
      await expect(a.locator('.sr-only')).toHaveText(messages[locale].newTab);
    }
  });
}
