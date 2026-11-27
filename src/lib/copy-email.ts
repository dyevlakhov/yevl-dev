import { EMAIL } from '@/content/links';

/**
 * Inline script for the contact block's copy button (docs/architecture.md).
 * Plain DOM, no React, so it adds nothing to the client bundle. Without it the button stays hidden
 * and the address remains selectable text.
 *
 * - Success: the label reads "copied ✓" and the status line confirms it, both for 2 s.
 * - Clipboard refused or missing: the address is selected and the live region says how to copy it
 *   (⌘C on Apple platforms, Ctrl+C elsewhere, tap and hold on touch-only devices). The hint lands
 *   in a later task than the clear, so screen readers announce it again on a repeat click.
 * - Each click cancels previous timers and invalidates pending clipboard results, so only the
 *   latest attempt updates the label, selection and status.
 *
 * "Email me" links (`a[data-email-cta]`) keep their mailto. The click also copies the address and,
 * once the clipboard accepts it, shows the link's hint in its scope's status line for 8 s: on a Mac
 * with no mail app set up, mailto does nothing and the browser can't tell. A refused clipboard
 * shows nothing; the contact block still shows the address.
 */
export const copyEmailScript = `(function () {
  try {
    const address = '${EMAIL}';
    document.querySelectorAll('a[data-email-cta]').forEach(function (link) {
      const scope = link.closest('[data-cta-scope]');
      const status = scope && scope.querySelector('[data-cta-status]');
      if (!status) return;
      let latestAttempt = 0;
      let announceTimer;
      let resetTimer;

      link.addEventListener('click', function () {
        const attempt = ++latestAttempt;
        clearTimeout(announceTimer);
        clearTimeout(resetTimer);
        status.textContent = '';
        const clipboard = navigator.clipboard;
        if (!clipboard || !clipboard.writeText) return;

        clipboard.writeText(address).then(function () {
          if (attempt !== latestAttempt) return;
          announceTimer = setTimeout(function () {
            status.textContent = link.getAttribute('data-email-cta');
          }, 50);
          resetTimer = setTimeout(function () {
            status.textContent = '';
          }, 8000);
        }, function () {});
      });
    });

    const button = document.querySelector('button[data-copy-email]');
    const email = document.querySelector('[data-email]');
    const status = document.querySelector('[data-copy-status]');
    if (!button || !email || !status) return;
    const label = button.querySelector('[data-label]') || button;
    const originalLabel = label.textContent;
    let timer;
    let latestAttempt = 0;
    button.hidden = false;

    const hint = function () {
      if (matchMedia('(pointer: coarse)').matches && !matchMedia('(any-pointer: fine)').matches) {
        return 'data-fallback-touch';
      }
      const platform = navigator.platform || (navigator.userAgentData && navigator.userAgentData.platform) || '';
      return /mac|iphone|ipad/i.test(platform) ? 'data-fallback-mac' : 'data-fallback';
    };

    button.addEventListener('click', function () {
      const attempt = ++latestAttempt;
      clearTimeout(timer);
      label.textContent = originalLabel;
      status.textContent = '';

      const fallback = function () {
        if (attempt !== latestAttempt) return;
        const range = document.createRange();
        range.selectNodeContents(email);
        const selection = getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        const text = button.getAttribute(hint());
        timer = setTimeout(function () {
          status.textContent = text;
        }, 50);
      };

      const clipboard = navigator.clipboard;
      if (!clipboard || !clipboard.writeText) {
        fallback();
        return;
      }
      clipboard.writeText(email.textContent.trim()).then(function () {
        if (attempt !== latestAttempt) return;
        label.textContent = button.getAttribute('data-copied');
        status.textContent = button.getAttribute('data-announce');
        timer = setTimeout(function () {
          label.textContent = originalLabel;
          status.textContent = '';
        }, 2000);
      }, fallback);
    });
  } catch (error) {}
})();`;
