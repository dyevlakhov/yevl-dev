import { expect, test } from '@playwright/test';
import { getContent } from '../../src/content';
import { localePath, locales } from '../../src/i18n/locales';
import { messages } from '../../src/i18n/messages';
import { yearRange } from '../../src/lib/format';
import { emailHref } from '../../src/content/links';
import { expectNoA11yViolations } from './helpers';

const links = [
  '/cv.pdf',
  'https://www.linkedin.com/in/dmytroyevlakhov',
  'https://github.com/dyevlakhov',
];

for (const locale of locales) {
  const c = getContent(locale);
  const t = messages[locale];
  const path = localePath(locale);

  test.describe(`${locale} landing: hero, career, expertise`, () => {
    test('hero: one h1 with name and role headline, intro, three CTAs and the key/value block', async ({
      page,
    }) => {
      await page.goto(path);
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
      await expect(h1.locator('.hero-name')).toHaveText(c.profile.name);
      await expect(h1.locator('.text-display')).toHaveText(
        `${c.profile.title} · ${c.profile.stackLine}`,
      );
      await expect(h1.locator('.text-display code')).toHaveText(c.profile.stackLine);
      // Raw text (reader modes, snippets) keeps the name and the title apart.
      expect(await h1.evaluate((el) => el.textContent)).toContain(
        `${c.profile.name} ${c.profile.title}`,
      );
      const hero = page.locator('#hero');
      await expect(hero.getByText(c.profile.intro)).toBeVisible();
      const actions = hero.locator('ul a');
      await expect(actions).toHaveText([t.actions.email, t.actions.cv, t.actions.unityCase]);
      expect(await actions.evaluateAll((els) => els.map((e) => e.getAttribute('href')))).toEqual([
        emailHref(t.contact.subject),
        '/cv.pdf',
        '#unity',
      ]);
      const kv = hero.locator('dl');
      await expect(kv).toContainText(c.profile.availability);
      for (const f of c.profile.focus) await expect(kv).toContainText(f);
      for (const s of c.profile.stack) await expect(kv).toContainText(s);
      await expect(kv).toContainText(c.profile.education);
    });

    test('contact offers email, CV, LinkedIn and GitHub', async ({ page }) => {
      await page.goto(path);
      const contact = page.locator('#contact');
      await expect(contact.locator(`a[href="${emailHref(t.contact.subject)}"]`)).toHaveCount(1);
      for (const href of links) await expect(contact.locator(`a[href="${href}"]`)).toHaveCount(1);
      for (const a of await contact.locator('a[href^="http"]').all()) {
        expect(await a.getAttribute('rel')).toBe('me noopener noreferrer');
      }
    });

    test('contact rows show each key, its real handle and what the click does', async ({
      page,
    }) => {
      await page.goto(path);
      const rows = page.locator('#contact [data-contact-rows] > li');
      await expect(rows).toHaveCount(4);
      const expected = [
        ['email', 'yevlakhovdmytro@gmail.com', t.contact.copy],
        ['linkedin', 'in/dmytroyevlakhov', t.contact.open],
        ['github', '@dyevlakhov', t.contact.open],
        ['cv', 'cv.pdf · PDF', t.contact.download],
      ] as const;
      for (const [i, parts] of expected.entries()) {
        for (const part of parts) await expect(rows.nth(i)).toContainText(part);
      }
      await expect(page.locator('#contact')).toContainText(c.profile.availability);
    });

    test('contact rows fit a 320px screen', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(path);
      await page.locator('#contact').scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        320,
      );
      for (const row of await page.locator('#contact [data-contact-rows] > li').all()) {
        const box = (await row.boundingBox())!;
        expect(box.height).toBeLessThan(60);
      }
    });

    test('footer links to email, LinkedIn and GitHub by name', async ({ page }) => {
      await page.goto(path);
      const footer = page.locator('body > footer');
      await expect(footer.getByRole('link', { name: t.actions.email })).toHaveAttribute(
        'href',
        emailHref(t.contact.subject),
      );
      for (const [name, href] of [
        ['LinkedIn', 'https://www.linkedin.com/in/dmytroyevlakhov'],
        ['GitHub', 'https://github.com/dyevlakhov'],
      ] as const) {
        const a = footer.getByRole('link', { name: new RegExp(`^${name}`) });
        await expect(a).toHaveAttribute('href', href);
        await expect(a).toHaveAttribute('rel', 'me noopener noreferrer');
      }
    });

    test('footer privacy note is closed, opens by keyboard and shows the approved text', async ({
      page,
    }) => {
      await page.goto(path);
      const note = page.locator('body > footer details#privacy');
      const summary = note.locator('summary');
      await expect(summary).toHaveText(t.privacy.label);
      await expect(note).not.toHaveAttribute('open');
      expect((await summary.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await summary.focus();
      await page.keyboard.press('Enter');
      await expect(note).toHaveAttribute('open', '');
      await expect(note.locator('p')).toHaveText(t.privacy.body);
    });

    test('privacy note deep link scrolls to it', async ({ page }) => {
      await page.goto(`${path}#privacy`);
      await expect(page.locator('details#privacy summary')).toBeInViewport();
    });

    test('open privacy note fits 360px without horizontal scroll', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(path);
      await page.locator('details#privacy summary').click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        360,
      );
    });

    for (const theme of ['vice', 'dark', 'light'] as const) {
      test(`axe passes with the privacy note open in the ${theme} theme`, async ({ page }) => {
        if (theme !== 'vice')
          await page.addInitScript((v) => localStorage.setItem('theme', v), theme);
        await page.goto(path);
        await page.locator('details#privacy summary').click();
        await expectNoA11yViolations(page);
      });
    }

    test('hero CTAs stack and never wrap mid-label at 360px', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(path);
      const items = page.locator('#hero ul li');
      await expect(items).toHaveCount(3);
      let prevTop = -1;
      for (const li of await items.all()) {
        const box = (await li.boundingBox())!;
        expect(box.y).toBeGreaterThan(prevTop);
        prevTop = box.y;
        const a = li.locator('a');
        const lines = await a.evaluate((el) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          const lh = parseFloat(getComputedStyle(el).lineHeight) || 20;
          return Math.round(range.getBoundingClientRect().height / lh);
        });
        expect(lines, await a.innerText()).toBeLessThanOrEqual(1);
      }
    });

    test('stacked hero CTAs center their labels; buttons never wrap', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(path);
      for (const a of await page.locator('#hero ul li a').all()) {
        const offset = await a.evaluate((el) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          const text = range.getBoundingClientRect();
          const box = el.getBoundingClientRect();
          return Math.abs(text.left + text.width / 2 - (box.left + box.width / 2));
        });
        expect(offset, await a.innerText()).toBeLessThanOrEqual(1);
        expect(await a.evaluate((el) => getComputedStyle(el).whiteSpace)).toBe('nowrap');
      }
    });

    test('name and headline are clearly sized: name ≥ 15px, headline larger', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 900 });
      await page.goto(path);
      const size = (sel: string) =>
        page
          .locator(sel)
          .first()
          .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      expect(await size('#hero .hero-name')).toBeGreaterThanOrEqual(15);
      expect(await size('#hero .text-display')).toBeGreaterThan(await size('#hero .hero-name'));
    });

    test('career strip: four entries with exact titles and year ranges', async ({ page }) => {
      await page.goto(path);
      const rows = page.locator('#career li');
      await expect(rows).toHaveCount(c.roles.length);
      for (const [i, r] of c.roles.entries()) {
        await expect(rows.nth(i)).toContainText(r.company);
        await expect(rows.nth(i)).toContainText(r.title);
        await expect(rows.nth(i)).toContainText(yearRange(r.start, r.end));
      }
    });

    test('expertise grid: six cells with area, scope and where', async ({ page }) => {
      await page.goto(path);
      const section = page.locator('#expertise');
      await expect(section.locator('h2')).toHaveText(t.sections.expertise.title);
      const rows = section.locator('li');
      await expect(rows).toHaveCount(6);
      for (const [i, a] of c.areas.entries()) {
        await expect(rows.nth(i)).toContainText(a.title);
        await expect(rows.nth(i)).toContainText(a.summary);
        await expect(rows.nth(i)).toContainText(a.proof);
      }
    });

    test('section headings carry the ## marker', async ({ page }) => {
      await page.goto(path);
      const marker = await page
        .locator('#expertise h2')
        .evaluate((el) => getComputedStyle(el, '::before').content);
      expect(marker).toBe('"## "');
    });

    test('first screen holds name, headline, status and the career strip at 1280×800', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(path);
      for (const el of [
        page.locator('#hero .hero-name'),
        page.locator('#hero .text-display'),
        page.locator('#hero dl').getByText(c.profile.availability),
        page.locator('#career li').last(),
      ]) {
        const box = await el.boundingBox();
        expect(box!.y + box!.height).toBeLessThanOrEqual(800);
      }
    });
  });
}
