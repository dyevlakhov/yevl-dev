import { expect, test } from '@playwright/test';
import { messages } from '../../src/i18n/messages';
import { expectNoA11yViolations } from './helpers';

const input = (page: import('@playwright/test').Page) =>
  page.getByRole('textbox', { name: messages.en.terminal.inputLabel });
const log = (page: import('@playwright/test').Page) => page.locator('[aria-live="polite"]');

test('terminal is rendered with JavaScript and absent without it', async ({ page, browser }) => {
  await page.goto('/');
  await expect(input(page)).toBeVisible();
  const context = await browser.newContext({ javaScriptEnabled: false });
  const noJs = await context.newPage();
  await noJs.goto('/');
  await expect(noJs.getByRole('textbox')).toHaveCount(0);
  await context.close();
});

test('slash and Ctrl+K focus the prompt', async ({ page }) => {
  await page.goto('/');
  await expect(input(page)).toBeVisible();
  await page.keyboard.press('/');
  await expect(input(page)).toBeFocused();
  await expect(input(page)).toHaveValue('');
  await page.keyboard.press('Escape');
  await expect(input(page)).not.toBeFocused();
  await page.keyboard.press('Control+k');
  await expect(input(page)).toBeFocused();
});

test('slash types normally while the prompt has focus', async ({ page }) => {
  await page.goto('/');
  await input(page).click();
  await page.keyboard.type('goto/x');
  await expect(input(page)).toHaveValue('goto/x');
});

test('help prints the command list into a live region', async ({ page }) => {
  await page.goto('/');
  await input(page).fill('help');
  await input(page).press('Enter');
  await expect(log(page)).toContainText(messages.en.terminal.help.whoami);
  await expect(input(page)).toHaveValue('');
});

test('Tab completes, ArrowUp recalls history, Escape clears output', async ({ page }) => {
  await page.goto('/');
  await input(page).fill('exp');
  await input(page).press('Tab');
  await expect(input(page)).toHaveValue('experience');
  await input(page).press('Enter');
  await expect(log(page)).toContainText('Unity');
  await input(page).press('ArrowUp');
  await expect(input(page)).toHaveValue('experience');
  await input(page).press('Escape');
  await expect(log(page)).toBeEmpty();
  await expect(input(page)).not.toBeFocused();
});

test('goto contact scrolls the contact section into view', async ({ page }) => {
  await page.goto('/');
  await input(page).fill('goto contact');
  await input(page).press('Enter');
  await expect(page.locator('#contact')).toBeInViewport();
});

test('theme command cycles and sets themes', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  await input(page).fill('theme');
  await input(page).press('Enter');
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await input(page).fill('theme light');
  await input(page).press('Enter');
  await expect(html).toHaveAttribute('data-theme', 'light');
  await input(page).fill('theme vice');
  await input(page).press('Enter');
  await expect(html).toHaveAttribute('data-theme', 'vice');
  expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('vice');
});

test('no a11y violations with output open', async ({ page }) => {
  await page.goto('/');
  await input(page).fill('help');
  await input(page).press('Enter');
  await expect(log(page)).not.toBeEmpty();
  await expectNoA11yViolations(page);
});

test('Tab leaves the prompt when completion would change nothing', async ({ page }) => {
  await page.goto('/');
  await input(page).fill('help');
  await input(page).press('Tab');
  await expect(input(page)).not.toBeFocused();
});

test('Shift+Tab always moves focus back and prints nothing', async ({ page }) => {
  await page.goto('/');
  await input(page).fill('c');
  await input(page).press('Shift+Tab');
  await expect(input(page)).not.toBeFocused();
  await expect(log(page)).toBeEmpty();
});

test('the same match list is not printed twice in a row', async ({ page }) => {
  await page.goto('/');
  await input(page).fill('c');
  await input(page).press('Tab');
  await input(page).press('Tab');
  await expect(log(page).getByText(/contact/)).toHaveCount(1);
});

test('Ctrl+Shift+K and Ctrl+/ do not grab the prompt', async ({ page }) => {
  await page.goto('/');
  await expect(input(page)).toBeVisible();
  await page.keyboard.press('Control+Shift+K');
  await expect(input(page)).not.toBeFocused();
  await page.keyboard.press('Control+/');
  await expect(input(page)).not.toBeFocused();
});

test('Ctrl+K works with a Cyrillic keyboard layout', async ({ page }) => {
  await page.goto('/uk');
  await expect(page.getByRole('textbox')).toBeVisible();
  await page.evaluate(() =>
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'л', code: 'KeyK', ctrlKey: true, bubbles: true }),
    ),
  );
  await expect(page.getByRole('textbox')).toBeFocused();
});

test('hint tells keyboard users how to leave', () => {
  expect(messages.en.terminal.hint).toMatch(/Esc/);
  expect(messages.uk.terminal.hint).toMatch(/Esc/);
});

test('email reports a successful copy only when the clipboard accepted it', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await input(page).fill('email');
  await input(page).press('Enter');
  await expect(log(page)).toContainText(messages.en.terminal.copied.split('{')[0]!);
});

test('email says so when copying fails, and still shows the address', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined });
  });
  await page.goto('/');
  await input(page).fill('email');
  await input(page).press('Enter');
  await expect(log(page)).toContainText(messages.en.terminal.copyFailed.split('{')[0]!);
  await expect(log(page)).toContainText('yevlakhovdmytro@gmail.com');
});

test('goto moves focus to the section', async ({ page }) => {
  await page.goto('/');
  await input(page).fill('goto experience');
  await input(page).press('Enter');
  await expect(page.locator('#experience')).toBeFocused();
});

test('goto meal-planner opens the case and focuses its card', async ({ page }) => {
  await page.goto('/');
  await input(page).click();
  await page.keyboard.type('goto meal-planner');
  await page.keyboard.press('Enter');
  await expect(page.locator('details[data-case="meal-planner"]')).toHaveAttribute('open', '');
  await expect(page.locator('article#meal-planner')).toBeFocused();
});

// Effect 15 (ADR 0002): a ghost hint types once when the terminal comes into view.
const HINT = 'help · whoami · stack';
const ghost = (page: import('@playwright/test').Page) => page.locator('.term-ghost');

test('hint types once when the terminal scrolls into view', async ({ page }) => {
  await page.goto('/');
  await expect(input(page)).toBeVisible();
  await expect(ghost(page)).toHaveAttribute('data-state', 'idle');
  await expect(ghost(page)).toHaveAttribute('aria-hidden', 'true');
  await expect(ghost(page)).toHaveText(HINT);
  await input(page).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await page.waitForTimeout(500);
  await expect(ghost(page)).toHaveAttribute('data-state', /play|done/);
  const t = await ghost(page).evaluate((el) => {
    const text = getComputedStyle(el.querySelector('.term-ghost-text')!);
    const caret = getComputedStyle(el, '::after');
    return {
      typing: parseFloat(text.animationDelay) + parseFloat(text.animationDuration),
      caretName: caret.animationName,
      caret:
        parseFloat(caret.animationDelay) +
        parseFloat(caret.animationDuration) * Number(caret.animationIterationCount),
    };
  });
  expect(t.typing).toBeGreaterThan(0);
  expect(t.typing).toBeLessThanOrEqual(1.3);
  expect(t.caretName).not.toBe('none');
  expect(t.caret).toBeLessThanOrEqual(5);
  await expect(page.locator('#term-hint')).toHaveText(messages.en.terminal.hint);
  await page.waitForTimeout(4500);
  await expect(ghost(page)).toHaveAttribute('data-state', 'done');
});

test('hint hides on focus and when typing', async ({ page }) => {
  await page.goto('/');
  await expect(input(page)).toBeVisible();
  await page.keyboard.press('/');
  await expect(ghost(page)).toBeHidden();
  await page.keyboard.type('h');
  await expect(ghost(page)).toHaveCount(0);
});

test('hint is static under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(input(page)).toBeVisible();
  await input(page).evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await expect(ghost(page)).toBeVisible();
  const s = await ghost(page).evaluate((el) => {
    const text = el.querySelector<HTMLElement>('.term-ghost-text')!;
    return {
      name: getComputedStyle(text).animationName,
      full: text.clientWidth >= text.scrollWidth,
      width: text.clientWidth,
    };
  });
  expect(s.name).toBe('none');
  expect(s.width).toBeGreaterThan(0);
  expect(s.full).toBe(true);
});

test('/uk shows the same English hint', async ({ page }) => {
  await page.goto('/uk');
  await expect(page.getByRole('textbox', { name: messages.uk.terminal.inputLabel })).toBeVisible();
  await expect(ghost(page)).toHaveText(HINT);
});
