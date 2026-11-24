'use client';

import { useSyncExternalStore, type ReactNode } from 'react';
import { THEMES, type Theme } from '@/lib/theme';
import { centerOf, currentTheme, setTheme } from '@/lib/theme-client';

export type ThemeLabels = { group: string; names: Record<Theme, string>; option: string };

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

/** Shown below 768px instead of the text label, so the header fits from 320px up. */
const icons: Record<Theme, ReactNode> = {
  // A sun half below the horizon.
  vice: <path d="M5 15a7 7 0 0 1 14 0M2 15h20M7 19h10" />,
  dark: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  light: (
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
  ),
};

/**
 * Vice · dark · light. Rendered in the HTML so hydration shifts nothing, but hidden until the
 * bootstrap script marks the page as scripted: without JS it could not switch anything.
 */
export function ThemeSwitch({ labels }: { labels: ThemeLabels }) {
  // null on the server and during hydration; nothing is marked pressed until the theme is known.
  const theme = useSyncExternalStore<Theme | null>(subscribe, currentTheme, () => null);
  return (
    <div
      role="group"
      aria-label={labels.group}
      className="hidden shrink-0 rounded-[4px] border border-rule font-mono text-xs [.js_&]:inline-flex"
    >
      {THEMES.map((t, i) => (
        <button
          key={t}
          type="button"
          // Unknown until hydration: no state is claimed then; the CSS still shows the current one.
          aria-pressed={theme === null ? undefined : theme === t}
          data-option={t}
          // The name is the option; aria-pressed announces which one is on.
          aria-label={labels.option.replace('{name}', labels.names[t])}
          onClick={(e) => setTheme(t, centerOf(e.currentTarget))}
          className={`theme-option inline-flex h-8 min-w-8 cursor-pointer items-center justify-center px-2 text-muted hover:text-text md:px-2.5 ${i > 0 ? 'border-l border-rule' : ''}`}
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="md:hidden"
          >
            {icons[t]}
          </svg>
          <span aria-hidden="true" className="hidden md:inline">
            {labels.names[t]}
          </span>
        </button>
      ))}
    </div>
  );
}
