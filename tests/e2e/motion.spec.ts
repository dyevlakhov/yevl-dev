import { expect, test } from '@playwright/test';
import { expectNoA11yViolations } from './helpers';
import { guardWords } from '../guard-terms';

const timing = (el: Element) => {
  const s = getComputedStyle(el);
  return {
    name: s.animationName,
    total:
      (parseFloat(s.animationDelay) + parseFloat(s.animationDuration)) *
      (s.animationIterationCount === 'infinite' ? Infinity : 1),
    iterations: s.animationIterationCount,
    duration: parseFloat(s.animationDuration),
  };
};

test('hero key/value lines reveal once and finish within 1 s', async ({ page }) => {
  await page.goto('/');
  const items = await page.locator('#hero dl > div > *').evaluateAll((els) => {
    const s = (el: Element) => getComputedStyle(el);
    return els.map((el) => ({
      name: s(el).animationName,
      end: parseFloat(s(el).animationDelay) + parseFloat(s(el).animationDuration),
      iterations: s(el).animationIterationCount,
    }));
  });
  expect(items.length).toBe(8);
  for (const i of items) {
    expect(i.name).not.toBe('none');
    expect(i.iterations).toBe('1');
    expect(i.end).toBeLessThanOrEqual(1);
  }
});

test('terminal cursor blinks only while focused and stops within 5 s', async ({ page }) => {
  await page.goto('/');
  const cursor = page.locator('.motion-cursor');
  expect((await cursor.evaluate(timing)).name).toBe('none');
  await page.keyboard.press('/');
  const t = await cursor.evaluate(timing);
  expect(t.name).not.toBe('none');
  expect(t.duration * Number(t.iterations)).toBeLessThanOrEqual(5);
});

test('diagram motion ends within 5 seconds unless the reader engages', async ({ page }) => {
  await page.goto('/');
  const timings = await page.locator('.motion-flow').evaluateAll((els) =>
    els.map((e) => {
      const s = getComputedStyle(e);
      return parseFloat(s.animationDuration) * Number(s.animationIterationCount);
    }),
  );
  expect(timings.length).toBeGreaterThan(0);
  for (const total of timings) expect(total).toBeLessThanOrEqual(5);
});

// With a fine pointer and JS, one gliding fill highlights the hovered card (effect 16).
test('rows highlight on hover', async ({ page }) => {
  await page.goto('/');
  for (const list of ['#expertise', '#career']) {
    await page.locator(`${list} li`).first().hover();
    await page.waitForTimeout(300);
    expect(
      await page.locator(`${list} .card-glide`).evaluate((el) => getComputedStyle(el).opacity),
      list,
    ).toBe('1');
  }
});

// Effects 1–3 (ADR 0002).
const hoverTargets = ['main a:not(.btn)', 'main .btn', '#expertise li', '#career li'];

test('hover states transition in 150 ms', async ({ page }) => {
  await page.goto('/');
  for (const sel of hoverTargets) {
    const d = await page
      .locator(sel)
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(d.split(', '), sel).toContain('0.15s');
  }
});

test('hover transitions are instant under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const sel of hoverTargets) {
    const d = await page
      .locator(sel)
      .first()
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(new Set(d.split(', ')), sel).toEqual(new Set(['0s']));
  }
});

test('nav underline draws on hover', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const link = page.locator('.site-header nav ul a[href="#work"]');
  const line = () => link.evaluate((el) => getComputedStyle(el, '::after').transform);
  expect(await line()).toBe('matrix(0, 0, 0, 1, 0, 0)');
  await link.hover();
  await page.waitForTimeout(400);
  expect(await line()).toBe('matrix(1, 0, 0, 1, 0, 0)');
});

test('buttons press', async ({ page }) => {
  await page.goto('/');
  const btn = page.locator('#hero a.btn[href="/cv.pdf"]');
  const box = (await btn.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(250);
  const t = await btn.evaluate((el) => getComputedStyle(el).transform);
  // Release away from the link so no download starts.
  await page.mouse.move(5, 5);
  await page.mouse.up();
  expect(t).toBe('matrix(0.97, 0, 0, 0.97, 0, 0)');
});

test('all motion is off under reduced motion, and content stays visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('/');
  const names = await page
    .locator('.motion-reveal, .motion-cursor, .motion-flow')
    .evaluateAll((els) => els.map((e) => getComputedStyle(e).animationName));
  expect(names.length).toBeGreaterThan(10);
  expect(new Set(names)).toEqual(new Set(['none']));
  await expect(page.locator('#hero dl')).toBeVisible();
});

test('unity diagram is still under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#unity');
  const svg = page.locator('article#unity svg');
  // CV level: generic boxes only, no internal topology (private words: tests/guard-terms.ts).
  for (const word of guardWords('unityDiagram')) {
    await expect(svg).not.toContainText(word);
  }
  const names = await svg
    .locator('.motion-flow')
    .evaluateAll((els) => els.map((e) => getComputedStyle(e).animationName));
  expect(names.length).toBeGreaterThan(0);
  expect(new Set(names)).toEqual(new Set(['none']));
  // Opening by hash scrolls instantly: the position is final after one frame.
  await expect(page.locator('details[data-case="unity"]')).toHaveAttribute('open', '');
  const [a, b] = await page.evaluate(
    () =>
      new Promise<[number, number]>((resolve) => {
        const first = window.scrollY;
        requestAnimationFrame(() => requestAnimationFrame(() => resolve([first, window.scrollY])));
      }),
  );
  expect(a).toBeGreaterThan(0);
  expect(b).toBe(a);
});

test('vice horizon line draws once within 1 s, and not under reduced motion', async ({
  browser,
}) => {
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    const context = await browser.newContext({ reducedMotion });
    const page = await context.newPage();
    await page.goto('/');
    const t = await page.locator('.site-header').evaluate((el) => {
      const s = getComputedStyle(el, '::after');
      return {
        name: s.animationName,
        duration: parseFloat(s.animationDuration),
        iterations: s.animationIterationCount,
      };
    });
    if (reducedMotion === 'reduce') expect(t.name).toBe('none');
    else {
      expect(t.name).toBe('horizon-draw');
      expect(t.duration).toBeLessThanOrEqual(1);
      expect(t.iterations).toBe('1');
    }
    await context.close();
  }
});

// Effects 4, 5, 6 and 17 (ADR 0002).
const settleTargets = [
  '#expertise li',
  '[data-role]',
  '#how-i-work li',
  '#contact',
  '#expertise > h2',
];
const neverSettle = ['#hero *', '#career li', '#work *'];

test.describe('scroll', () => {
  test('reading progress line follows the page scroll', async ({ page }) => {
    await page.goto('/');
    const t = await page.locator('.site-header').evaluate((el) => {
      const s = getComputedStyle(el, '::before');
      return { name: s.animationName, timeline: s.getPropertyValue('animation-timeline') };
    });
    expect(t.name).toBe('progress-grow');
    expect(t.timeline).toContain('scroll(');
  });

  for (const path of ['/', '/uk']) {
    test(`${path}: nav marks the section being read`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(path);
      await page
        .locator('#experience')
        .evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
      await page.waitForTimeout(300);
      const colors = await page.evaluate(() => {
        const c = (sel: string) => getComputedStyle(document.querySelector(sel)!).color;
        return {
          text: getComputedStyle(document.body).color,
          experience: c('.site-header nav ul a[href="#experience"]'),
          work: c('.site-header nav ul a[href="#work"]'),
        };
      });
      expect(colors.experience).toBe(colors.text);
      expect(colors.work).not.toBe(colors.text);
    });
  }

  test('blocks below the fold settle in, the first screen never does', async ({ page }) => {
    await page.goto('/');
    for (const sel of settleTargets) {
      const names = await page
        .locator(sel)
        .evaluateAll((els) => els.map((e) => getComputedStyle(e).animationName));
      expect(names.length, sel).toBeGreaterThan(0);
      expect(new Set(names), sel).toEqual(new Set(['settle-in']));
    }
    for (const sel of neverSettle) {
      const names = await page
        .locator(sel)
        .evaluateAll((els) => els.map((e) => getComputedStyle(e).animationName));
      expect(names, sel).not.toContain('settle-in');
    }
  });

  test('content opened mid-page is fully visible', async ({ page }) => {
    await page.goto('/#unity');
    await page.waitForTimeout(1500);
    expect(await page.locator('article#unity').evaluate((el) => getComputedStyle(el).opacity)).toBe(
      '1',
    );
  });

  test('blocks fully inside a tall first screen are opaque', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForTimeout(300);
    const faded = await page.evaluate(() =>
      [...document.querySelectorAll('main *')]
        .filter((el) => getComputedStyle(el).animationName === 'settle-in')
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.top >= 0 && r.bottom <= innerHeight;
        })
        .filter((el) => getComputedStyle(el).opacity !== '1')
        .map((el) => el.tagName + (el.id ? '#' + el.id : '')),
    );
    expect(faded).toEqual([]);
  });

  for (const [width, height] of [
    [1440, 900],
    [1920, 1080],
    [390, 844],
  ] as const) {
    test(`axe passes with reveals at the first screen (${width}×${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await expectNoA11yViolations(page);
    });
  }

  test('anchors scroll smoothly unless motion is reduced', async ({ browser }) => {
    for (const [reducedMotion, expected] of [
      ['no-preference', 'smooth'],
      ['reduce', 'auto'],
    ] as const) {
      const context = await browser.newContext({ reducedMotion });
      const page = await context.newPage();
      await page.goto('/');
      expect(
        await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior),
      ).toBe(expected);
      await context.close();
    }
  });

  test('scroll effects are off under reduced motion, and content stays visible', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const names = await page.evaluate((sels) => {
      const out: string[] = [
        getComputedStyle(document.querySelector('.site-header')!, '::before').animationName,
      ];
      for (const a of document.querySelectorAll('.site-header nav ul a')) {
        out.push(getComputedStyle(a).animationName, getComputedStyle(a, '::after').animationName);
      }
      for (const sel of sels)
        for (const el of document.querySelectorAll(sel))
          out.push(getComputedStyle(el).animationName);
      return out;
    }, settleTargets);
    expect(new Set(names)).toEqual(new Set(['none']));
    await page.locator('#expertise li').first().scrollIntoViewIfNeeded();
    await expect(page.locator('#expertise li').first()).toBeVisible();
  });

  test('no JS: every section is visible', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    for (const sel of ['#expertise li', '[data-role]', '#contact']) {
      const el = page.locator(sel).first();
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      expect(await el.evaluate((e) => getComputedStyle(e).opacity), sel).toBe('1');
    }
    await context.close();
  });
});

// Effects 9 and 11 (ADR 0002).
test('case cards respond to hover', async ({ page }) => {
  await page.goto('/');
  const card = page.locator('article#unity');
  await card.scrollIntoViewIfNeeded();
  const border = () => card.evaluate((el) => getComputedStyle(el).borderTopColor);
  const before = await border();
  await card.hover();
  await page.waitForTimeout(700);
  expect(await border()).not.toBe(before);
  expect(
    await card.locator('.case-tile > svg').evaluate((el) => getComputedStyle(el).transform),
  ).toBe('matrix(1.03, 0, 0, 1.03, 0, 0)');
});

test('career timeline draws once within 1 s, and not under reduced motion', async ({ browser }) => {
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    const context = await browser.newContext({ reducedMotion });
    const page = await context.newPage();
    await page.goto('/');
    const parts = await page.evaluate(() => {
      const read = (s: CSSStyleDeclaration) => ({
        name: s.animationName,
        end: parseFloat(s.animationDelay) + parseFloat(s.animationDuration),
        iterations: s.animationIterationCount,
        content: s.content,
        transform: s.transform,
      });
      return {
        line: read(getComputedStyle(document.querySelector('#career ol')!, '::before')),
        years: [...document.querySelectorAll('#career li > p:first-child')].map((el) =>
          read(getComputedStyle(el)),
        ),
      };
    });
    expect(parts.years.length).toBe(4);
    if (reducedMotion === 'reduce') {
      expect(parts.line.name).toBe('none');
      expect(parts.line.content).not.toBe('none');
      expect(parts.line.transform).toBe('none');
      for (const y of parts.years) expect(y.name).toBe('none');
    } else {
      expect(parts.line.name).toBe('timeline-draw');
      for (const a of [parts.line, ...parts.years]) {
        expect(a.end).toBeLessThanOrEqual(1);
        expect(a.iterations).toBe('1');
      }
      for (const y of parts.years) expect(y.name).toBe('year-in');
    }
    await context.close();
  }
});

// Effect 16, variant D (ADR 0002): one fill glides between cards.
const box = async (loc: import('@playwright/test').Locator) => (await loc.boundingBox())!;
const expectSameBox = async (
  a: import('@playwright/test').Locator,
  b: import('@playwright/test').Locator,
) => {
  const [p, q] = [await box(a), await box(b)];
  for (const k of ['x', 'y', 'width', 'height'] as const)
    expect(Math.abs(p[k] - q[k]), k).toBeLessThanOrEqual(1);
};
const showWhole = (page: import('@playwright/test').Page, sel: string) =>
  page.locator(sel).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));

test.describe('card glide', () => {
  test('fill glides to the hovered card', async ({ page }) => {
    await page.goto('/');
    await showWhole(page, '#expertise ul');
    const cells = page.locator('#expertise li');
    await cells.nth(0).hover();
    await cells.nth(1).hover();
    await page.waitForTimeout(500);
    const glide = page.locator('#expertise .card-glide');
    await expect(glide).toHaveClass(/\bon\b/);
    await expectSameBox(glide, cells.nth(1));
  });

  test('fill follows after a resize', async ({ page }) => {
    await page.goto('/');
    await showWhole(page, '#expertise ul');
    const cells = page.locator('#expertise li');
    await cells.nth(0).hover();
    await page.setViewportSize({ width: 900, height: 800 });
    await page.mouse.move(2, 2);
    await showWhole(page, '#expertise ul');
    await cells.nth(4).hover();
    await page.waitForTimeout(500);
    await expectSameBox(page.locator('#expertise .card-glide'), cells.nth(4));
  });

  test('fill leaves with the pointer', async ({ page }) => {
    await page.goto('/');
    await showWhole(page, '#expertise ul');
    await page.locator('#expertise li').first().hover();
    await page.mouse.move(2, 2);
    await expect(page.locator('#expertise .card-glide')).not.toHaveClass(/\bon\b/);
  });

  test('career strip glides too', async ({ page }) => {
    await page.goto('/');
    const cells = page.locator('#career li');
    await cells.nth(0).hover();
    await cells.nth(2).hover();
    await page.waitForTimeout(500);
    await expectSameBox(page.locator('#career .card-glide'), cells.nth(2));
  });

  test('touch devices keep the plain fill', async ({ browser }) => {
    const context = await browser.newContext({
      hasTouch: true,
      isMobile: true,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    await page.goto('/');
    for (const g of await page.locator('.card-glide').all()) await expect(g).toBeHidden();
    const cell = page.locator('#career li').first();
    const before = await cell.evaluate((el) => getComputedStyle(el).backgroundColor);
    await cell.tap();
    await page.waitForTimeout(250);
    expect(await cell.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(before);
    await context.close();
  });

  test('no JS keeps the plain fill', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    const cell = page.locator('#expertise li').first();
    await cell.scrollIntoViewIfNeeded();
    const before = await cell.evaluate((el) => getComputedStyle(el).backgroundColor);
    await cell.hover();
    await page.waitForTimeout(250);
    expect(await cell.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(before);
    await context.close();
  });
});

// Final-review fixes (2026-11-24).
for (const [width, height] of [
  [1280, 800],
  [1920, 1080],
] as const) {
  test(`contact lights in the nav at the bottom of the page (${width}×${height})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.evaluate(() =>
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }),
    );
    await page.waitForTimeout(300);
    const c = await page.evaluate(() => {
      const color = (sel: string) => getComputedStyle(document.querySelector(sel)!).color;
      return {
        text: getComputedStyle(document.body).color,
        contact: color('.site-header nav ul a[href="#contact"]'),
        experience: color('.site-header nav ul a[href="#experience"]'),
      };
    });
    expect(c.contact).toBe(c.text);
    expect(c.experience).not.toBe(c.text);
  });
}

test('hovering an open case summary keeps its minus sign upright', async ({ page }) => {
  await page.goto('/#unity');
  const summary = page.locator('details[data-case="unity"] > summary');
  await expect(page.locator('details[data-case="unity"]')).toHaveAttribute('open', '');
  await summary.hover();
  await page.waitForTimeout(400);
  expect(await summary.evaluate((el) => getComputedStyle(el, '::before').transform)).toBe('none');
});
