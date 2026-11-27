import { expect, test, type Page } from '@playwright/test';
import { localePath, locales } from '../../src/i18n/locales';
import { messages } from '../../src/i18n/messages';

const EMAIL = 'yevlakhovdmytro@gmail.com';

declare global {
  interface Window {
    pendingClipboardWrites: { resolve: () => void; reject: () => void }[];
  }
}

async function deferClipboardWrites(page: Page) {
  await page.addInitScript(() => {
    window.pendingClipboardWrites = [];
    Object.defineProperty(navigator, 'platform', { value: 'Linux x86_64' });
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: () =>
          new Promise<void>((resolve, reject) => {
            window.pendingClipboardWrites.push({ resolve, reject });
          }),
      },
    });
  });
}

for (const locale of locales) {
  const t = messages[locale];
  const path = localePath(locale);

  for (const width of [320, 360]) {
    test(`${locale}: the full email is readable at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      const email = page.locator('[data-email]');
      await expect(email).toHaveText(EMAIL);
      const fits = await email.evaluate(
        (el) => el.scrollWidth <= el.clientWidth && el.scrollHeight <= el.clientHeight,
      );
      expect(fits).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    });
  }

  test(`${locale}: copy puts the address on the clipboard and confirms`, async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(path);
    const button = page.locator('#contact button[data-copy-email]');
    await expect(button).toHaveText(t.contact.copy);
    await button.click();
    await expect(button).toHaveText(t.contact.copied);
    await expect(page.locator('#contact [data-copy-status]')).toHaveText(t.contact.announce);
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(EMAIL);
    await expect(button).toHaveText(t.contact.copy, { timeout: 3000 });
    await expect(page.locator('#contact [data-copy-status]')).toHaveText('');
  });

  test(`${locale}: a refused clipboard selects the address and says how to copy`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(() => {
      // Pin the platform so the hint is the same on a Mac and on the Linux CI runner.
      Object.defineProperty(navigator, 'platform', { value: 'Linux x86_64' });
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: () => Promise.reject(new Error('denied')) },
      });
    });
    await page.goto(path);
    await page.locator('#contact button[data-copy-email]').click();
    const status = page.locator('#contact [data-copy-status]');
    await expect(status).toHaveText(t.contact.fallback);
    // Visible to sighted users too, not only announced (sr-only is a 1×1px box).
    expect((await status.boundingBox())!.width).toBeGreaterThan(50);
    expect(await page.evaluate(() => getSelection()?.toString())).toBe(EMAIL);
    expect(errors).toEqual([]);
  });
}

for (const locale of locales) {
  test(`${locale}: on a Mac the fallback hint names ⌘C`, async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'platform', { value: 'MacIntel' });
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: () => Promise.reject(new Error('denied')) },
      });
    });
    await page.goto(localePath(locale));
    await page.locator('#contact button[data-copy-email]').click();
    await expect(page.locator('#contact [data-copy-status]')).toHaveText(
      messages[locale].contact.fallbackMac,
    );
  });
}

for (const locale of locales) {
  const t = messages[locale];

  test(`${locale}: a refused copy right after a successful one keeps the hint`, async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'platform', { value: 'Linux x86_64' });
    });
    await page.goto(localePath(locale));
    const button = page.locator('#contact button[data-copy-email]');
    const status = page.locator('#contact [data-copy-status]');
    await button.click();
    await expect(button).toHaveText(t.contact.copied);
    await page.evaluate(() => {
      navigator.clipboard.writeText = () => Promise.reject(new Error('denied'));
    });
    await button.click();
    await expect(button).toHaveText(t.contact.copy);
    await expect(status).toHaveText(t.contact.fallback);
    // The success timer (2 s) must not wipe the hint.
    await page.waitForTimeout(2300);
    await expect(status).toHaveText(t.contact.fallback);
  });

  test(`${locale}: a repeat click without a clipboard API announces the hint again`, async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'platform', { value: 'Linux x86_64' });
      Object.defineProperty(navigator, 'clipboard', { value: undefined });
    });
    await page.goto(localePath(locale));
    const button = page.locator('#contact button[data-copy-email]');
    const status = page.locator('#contact [data-copy-status]');
    await button.click();
    await expect(status).toHaveText(t.contact.fallback);
    // Live regions announce a change; clearing and refilling in one task is no change.
    await page.evaluate(() => {
      const el = document.querySelector('[data-copy-status]')!;
      (window as unknown as { batches: number }).batches = 0;
      new MutationObserver(() => (window as unknown as { batches: number }).batches++).observe(el, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    });
    await button.click();
    await expect(status).toHaveText(t.contact.fallback);
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { batches: number }).batches))
      .toBeGreaterThanOrEqual(2);
  });

  for (const latest of ['success', 'failure'] as const) {
    test(`${locale}: a late clipboard response preserves the latest ${latest}`, async ({
      page,
    }) => {
      await deferClipboardWrites(page);
      await page.goto(localePath(locale));
      const button = page.locator('[data-copy-email]');
      const status = page.locator('[data-copy-status]');
      await button.click();
      await button.click();
      await page.evaluate((outcome) => {
        const current = window.pendingClipboardWrites[1]!;
        if (outcome === 'success') current.resolve();
        else current.reject();
      }, latest);
      await expect(status).toHaveText(
        latest === 'success' ? t.contact.announce : t.contact.fallback,
      );

      // Settle the older request with the opposite outcome, after the newer one is visible.
      await page.evaluate((outcome) => {
        const previous = window.pendingClipboardWrites[0]!;
        if (outcome === 'success') previous.reject();
        else previous.resolve();
      }, latest);
      await page.waitForTimeout(100);
      await expect(status).toHaveText(
        latest === 'success' ? t.contact.announce : t.contact.fallback,
      );
      await expect(button).toHaveText(latest === 'success' ? t.contact.copied : t.contact.copy);
      expect(await page.evaluate(() => getSelection()?.toString())).toBe(
        latest === 'success' ? '' : EMAIL,
      );
    });
  }
}

test.describe('touch-only device', () => {
  test.use({ hasTouch: true, isMobile: true });

  for (const locale of locales) {
    test(`${locale}: the fallback hint names no keys`, async ({ page }) => {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'platform', { value: 'iPhone' });
        Object.defineProperty(navigator, 'clipboard', { value: undefined });
      });
      await page.goto(localePath(locale));
      await page.locator('#contact button[data-copy-email]').click();
      await expect(page.locator('#contact [data-copy-status]')).toHaveText(
        messages[locale].contact.fallbackTouch,
      );
    });
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const locale of locales) {
    test(`${locale}: the full email remains readable at 320px without JavaScript`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(localePath(locale));
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.locator('[data-email]').evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true);
    });

    test(`${locale}: no copy button; the Unity CTA still reaches the card`, async ({ page }) => {
      await page.goto(localePath(locale));
      await expect(page.locator('#contact button[data-copy-email]')).toBeHidden();
      await page
        .locator('#hero')
        .getByRole('link', { name: messages[locale].actions.unityCase })
        .click();
      await expect(page.locator('article#unity')).toBeInViewport();
    });
  }
});

for (const locale of locales) {
  const t = messages[locale];

  test(`${locale}: "Email me" keeps the mailto, copies the address and says so`, async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(localePath(locale));
    const cta = page.locator('#hero').getByRole('link', { name: t.actions.email });
    await expect(cta).toHaveAttribute('href', /^mailto:yevlakhovdmytro@gmail\.com\?subject=/);
    // Stop the external protocol handler; the click listener still runs first.
    await cta.evaluate((a) => a.addEventListener('click', (e) => e.preventDefault()));
    await cta.click();
    await expect(page.locator('#hero [data-cta-status]')).toHaveText(t.contact.ctaCopied);
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(EMAIL);
    // The contact block's own status line is untouched.
    await expect(page.locator('#contact [data-copy-status]')).toHaveText('');
    expect(errors).toEqual([]);
  });

  test(`${locale}: "Email me" with a refused clipboard shows nothing and throws nothing`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: () => Promise.reject(new Error('denied')) },
      });
    });
    await page.goto(localePath(locale));
    const cta = page.locator('#contact').getByRole('link', { name: t.actions.email });
    await cta.evaluate((a) => a.addEventListener('click', (e) => e.preventDefault()));
    await cta.click();
    await page.waitForTimeout(200);
    await expect(page.locator('#contact [data-cta-status]')).toHaveText('');
    expect(errors).toEqual([]);
  });

  test(`${locale}: "Email me" ignores an older success after a newer failure`, async ({ page }) => {
    await deferClipboardWrites(page);
    await page.goto(localePath(locale));
    const cta = page.locator('#hero a[data-email-cta]');
    const status = page.locator('#hero [data-cta-status]');
    await cta.evaluate((el) => el.addEventListener('click', (event) => event.preventDefault()));
    await cta.click();
    await cta.click();
    await page.evaluate(() => window.pendingClipboardWrites[1]!.reject());
    await page.evaluate(() => window.pendingClipboardWrites[0]!.resolve());
    await page.waitForTimeout(100);
    await expect(status).toBeEmpty();
  });
}
