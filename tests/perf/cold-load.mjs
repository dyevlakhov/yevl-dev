// Cold-cache load check (ADR 0002): layout shifts while fonts arrive.
// Usage: pnpm perf:cold <url> [--3g]   — exits 1 when CLS ≥ 0.05.
// Run against a production build (`pnpm build && pnpm start`), with Playwright's Chromium.
import { chromium } from '@playwright/test';

const [url, flag] = process.argv.slice(2);
if (!url) {
  console.error('usage: pnpm perf:cold <url> [--3g]');
  process.exit(2);
}

const browser = await chromium.launch();
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  if (flag === '--3g') {
    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150,
      downloadThroughput: 1.6e6 / 8,
      uploadThroughput: 750e3 / 8,
    });
  }
  await page.addInitScript(() => {
    window.__shifts = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.hadRecentInput) continue;
        window.__shifts.push({
          t: Math.round(e.startTime),
          v: Number(e.value.toFixed(4)),
          sources: (e.sources ?? []).map((s) =>
            s.node ? `${s.node.nodeName}${s.node.id ? '#' + s.node.id : ''}` : '?',
          ),
        });
      }
    }).observe({ type: 'layout-shift', buffered: true });
    window.__fontsDone = null;
    document.fonts?.addEventListener('loadingdone', () => {
      window.__fontsDone = Math.round(performance.now());
    });
  });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  const result = await page.evaluate(() => ({
    shifts: window.__shifts,
    firstPaint: Math.round(
      performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? -1,
    ),
    fontsDone: window.__fontsDone,
  }));
  const cls = Number(result.shifts.reduce((sum, s) => sum + s.v, 0).toFixed(4));
  console.log(
    JSON.stringify({ url, network: flag === '--3g' ? '3g' : 'none', cls, ...result }, null, 1),
  );
  process.exitCode = cls >= 0.05 ? 1 : 0;
} finally {
  await browser.close();
}
