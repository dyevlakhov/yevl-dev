import { expect, test, type Page } from '@playwright/test';
import { emailHref } from '../../src/content/links';
import { localePath, locales } from '../../src/i18n/locales';
import { messages } from '../../src/i18n/messages';
import { getContent } from '../../src/content';
import { expectNoA11yViolations } from './helpers';

const slugs = ['unity', 'meal-planner', 'career-pro'] as const;
const details = (page: Page, slug: string) => page.locator(`details[data-case="${slug}"]`);
const hash = (page: Page) => page.evaluate(() => location.hash);

for (const locale of locales) {
  const t = messages[locale];
  const path = localePath(locale);

  test.describe(`${locale} cases`, () => {
    test('case opens smoothly where supported and always opens', async ({ page }) => {
      await page.goto(path);
      const d = details(page, 'unity');
      await d.locator('summary').scrollIntoViewIfNeeded();
      await d.locator('summary').click();
      await expect(d).toHaveAttribute('open', '');
      const prop = await d.evaluate(
        (el) => getComputedStyle(el, '::details-content').transitionProperty,
      );
      expect(prop).toContain('block-size');
      await page.waitForTimeout(600);
      await expect(d.locator('.case-body p').first()).toBeVisible();
    });

    test('each summary names its case for assistive tech', async ({ page }) => {
      await page.goto(path);
      for (const cs of getContent(locale).cases) {
        await expect(details(page, cs.slug).locator('summary')).toHaveAccessibleName(
          `${t.cases.read}: ${cs.title}`,
        );
      }
    });

    test('an opened case ends with email and CV links', async ({ page }) => {
      await page.goto(`${path}#career-pro`);
      const body = details(page, 'career-pro');
      await expect(body).toHaveAttribute('open', '');
      await expect(body.getByRole('link', { name: t.actions.email })).toHaveAttribute(
        'href',
        emailHref(t.contact.subject),
      );
      await expect(body.getByRole('link', { name: t.actions.cv })).toHaveAttribute(
        'href',
        '/cv.pdf',
      );
    });

    test('the hero Unity CTA opens the case, again after it was collapsed', async ({ page }) => {
      await page.goto(path);
      const cta = page.locator('#hero').getByRole('link', { name: t.actions.unityCase });
      await cta.click();
      await expect(details(page, 'unity')).toHaveAttribute('open', '');
      await expect(details(page, 'unity').locator('h4').first()).toBeInViewport();
      await details(page, 'unity').getByRole('button', { name: t.cases.collapse }).click();
      await expect(details(page, 'unity')).not.toHaveAttribute('open', '');
      await page.evaluate(() => window.scrollTo(0, 0));
      await cta.click();
      await expect(details(page, 'unity')).toHaveAttribute('open', '');
      await expect(details(page, 'unity').locator('h4').first()).toBeInViewport();
    });

    test('the Unity card shows its result and highlights before expanding', async ({ page }) => {
      await page.goto(path);
      const unity = getContent(locale).cases.find((c) => c.slug === 'unity')!;
      const card = page.locator('article#unity');
      await expect(details(page, 'unity')).not.toHaveAttribute('open', '');
      await expect(card.getByText(unity.result!)).toBeVisible();
      await expect(card.getByText(t.cases.result)).toBeVisible();
      const items = card.locator('ul.case-highlights li');
      await expect(items).toHaveText(unity.highlights!);
    });

    for (const slug of slugs) {
      test(`#${slug} opens and scrolls to the case`, async ({ page }) => {
        await page.goto(`${path}#${slug}`);
        await expect(details(page, slug)).toHaveAttribute('open', '');
        await expect(details(page, slug).locator('h4').first()).toBeInViewport();
      });
    }

    test('clicking summary sets the hash; collapse closes, focuses summary and sets #work', async ({
      page,
    }) => {
      await page.goto(path);
      const d = details(page, 'career-pro');
      await d.locator('summary').click();
      await expect(d).toHaveAttribute('open', '');
      await expect.poll(() => hash(page)).toBe('#career-pro');
      await d.getByRole('button', { name: t.cases.collapse }).click();
      await expect(d).not.toHaveAttribute('open', '');
      await expect(d.locator('summary')).toBeFocused();
      await expect.poll(() => hash(page)).toBe('#work');
    });

    test('back and forward between case hashes reopen the right case', async ({ page }) => {
      await page.goto(`${path}#unity`);
      await expect(details(page, 'unity')).toHaveAttribute('open', '');
      await details(page, 'unity').getByRole('button', { name: t.cases.collapse }).click();
      await details(page, 'career-pro').locator('summary').click();
      await expect.poll(() => hash(page)).toBe('#career-pro');
      await page.goBack();
      await expect.poll(() => hash(page)).toBe('#work');
      // Close everything while the URL names no case, so going forward must reopen it.
      await page.evaluate(() =>
        document.querySelectorAll('details[data-case]').forEach((d) => d.removeAttribute('open')),
      );
      await page.goForward();
      await expect.poll(() => hash(page)).toBe('#career-pro');
      await expect(details(page, 'career-pro')).toHaveAttribute('open', '');
      await expect(details(page, 'unity')).not.toHaveAttribute('open', '');
    });

    test('collapsing the case named in the URL replaces the hash with #work', async ({ page }) => {
      await page.goto(`${path}#unity`);
      await details(page, 'unity').locator('summary').click();
      await expect(details(page, 'unity')).not.toHaveAttribute('open', '');
      await expect.poll(() => hash(page)).toBe('#work');
      await page.reload();
      await expect(details(page, 'unity')).not.toHaveAttribute('open', '');
    });

    for (const target of ['work', 'nope']) {
      test(`#${target} opens no case and logs no console error`, async ({ page }) => {
        const errors: string[] = [];
        page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
        page.on('pageerror', (e) => errors.push(e.message));
        await page.goto(`${path}#${target}`, { waitUntil: 'networkidle' });
        await expect(page.locator('details[data-case][open]')).toHaveCount(0);
        expect(errors).toEqual([]);
      });
    }

    test('how I work sits between experience and contact with three principles', async ({
      page,
    }) => {
      await page.goto(path);
      const order = await page.evaluate(() =>
        [...document.querySelectorAll('main > section[id]')].map((s) => s.id),
      );
      const i = order.indexOf('how-i-work');
      expect(i).toBeGreaterThan(-1);
      expect(order[i - 1]).toBe('experience');
      expect(order[i + 1]).toBe('contact');
      await expect(page.locator('#how-i-work li')).toHaveCount(3);
      await expect(page.locator('#how-i-work h2')).toHaveText(t.sections.how.title);
    });

    test('axe: no violations with every case open', async ({ page }) => {
      await page.goto(path);
      for (const slug of slugs) await details(page, slug).locator('summary').click();
      await expectNoA11yViolations(page);
    });
  });

  test(`${locale}: every case open at 360px has no horizontal scroll`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(path);
    for (const slug of slugs) await details(page, slug).locator('summary').click();
    for (const slug of slugs) await expect(details(page, slug)).toHaveAttribute('open', '');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      360,
    );
  });

  test.describe(`${locale} cases without JavaScript`, () => {
    test.use({ javaScriptEnabled: false });

    test('case text is in the page and opens by click', async ({ page }) => {
      await page.goto(path);
      for (const slug of slugs) {
        const d = details(page, slug);
        await expect(d.locator('h4').first()).toBeAttached();
        await d.locator('summary').click();
        await expect(d.locator('h4').first()).toBeVisible();
        await expect(d.locator('[data-collapse]')).toBeHidden();
      }
    });
  });
}
