import { IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google';

// Share the same font instances between the root layouts and global 404 so Next.js emits one
// set of files and preloads, including when the fallback settings change.
export const plexSans = IBM_Plex_Sans({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-plex-sans',
  display: 'swap',
});

// Match JetBrains Mono's 0.6 em advance so a late font swap does not reflow text (ADR 0002).
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  adjustFontFallback: false,
  fallback: [
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Courier New',
    'DejaVu Sans Mono',
    'monospace',
  ],
});
