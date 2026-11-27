import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { getContent } from '@/content';
import { localePath, type Locale } from '@/i18n/locales';
import { messages } from '@/i18n/messages';
import { GLASS_SURFACE_OPACITY, NAV_SURFACE_OPACITY } from '@/design/tokens';
import { plexSans, jetbrainsMono } from '@/design/fonts';
import { SiteHeader } from '@/components/ui/SiteHeader';
import { SkipLink } from '@/components/ui/SkipLink';
import { themeBootstrapScript } from '@/lib/theme';
import '@/app/globals.css';

// Vercel serves /_vercel/insights and /_vercel/speed-insights only on its own deployments, so the
// beacons render in production builds on Vercel and nowhere else. Pages are static, so this is
// decided at build time: CI, `next start` and previews ship no beacon (no 404 console errors, and
// previews do not spend the Hobby event quotas). See docs/architecture.md.
const vercelProduction = process.env.VERCEL_ENV === 'production';

// Vice headings (ADR 0001): Science Gothic 700, width axis 80–110%, latin + cyrillic in
// one self-hosted file (src/assets/fonts/README.md). Preloaded because the role headline is the
// LCP element; the metric-matched fallback lives in globals.css.
const scienceGothic = localFont({
  src: '../assets/fonts/science-gothic-vice.woff2',
  variable: '--font-science',
  weight: '700',
  display: 'swap',
  preload: true,
  adjustFontFallback: false,
  declarations: [{ prop: 'font-stretch', value: '80% 110%' }],
});

export function localeMetadata(locale: Locale): Metadata {
  const { profile } = getContent(locale);
  // Kept under ~60 characters so search results show it whole; the stack is in the description.
  const title = `${profile.name} · ${profile.title}`;
  const description = profile.metaDescription;
  return {
    metadataBase: new URL('https://yevl.dev'),
    title,
    description,
    // Google Search needs a raster favicon (a multiple of 48 px); browsers prefer the SVG.
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '48x48' },
        { url: '/icon.svg', type: 'image/svg+xml' },
      ],
    },
    // Google Search Console ownership (URL-prefix property https://yevl.dev).
    verification: { google: 'T55qKM-np7-exwc7rFFi4XnEgzxTv_2wWNO750LGK7Q' },
    alternates: {
      canonical: localePath(locale),
      languages: { en: '/', uk: '/uk', 'x-default': '/' },
    },
    openGraph: {
      type: 'profile',
      siteName: 'yevl.dev',
      locale: locale === 'en' ? 'en_US' : 'uk_UA',
      url: localePath(locale),
      title,
      description,
    },
    twitter: { card: 'summary_large_image' },
  };
}

export function RootDocument({ locale, children }: { locale: Locale; children: ReactNode }) {
  const t = messages[locale];
  const other: Locale = locale === 'en' ? 'uk' : 'en';
  return (
    <html
      lang={locale}
      className={`${plexSans.variable} ${jetbrainsMono.variable} ${scienceGothic.variable}`}
      // Surface opacities come from the tokens the contrast tests check.
      style={
        {
          '--nav-opacity': `${NAV_SURFACE_OPACITY * 100}%`,
          '--glass-opacity': `${GLASS_SURFACE_OPACITY * 100}%`,
        } as CSSProperties
      }
      suppressHydrationWarning
    >
      {/* App Router root layouts own <head>; the next/head rule targets the Pages Router. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body>
        <div aria-hidden="true" className="page-bg" />
        <SkipLink label={t.skip} />
        <SiteHeader
          label={t.nav.label}
          items={[
            // Same order as the page (docs/architecture.md).
            { label: t.nav.work, href: '#work', mobile: true },
            { label: t.nav.expertise, href: '#expertise' },
            { label: t.nav.experience, href: '#experience' },
            { label: t.nav.contact, href: '#contact', mobile: true },
          ]}
          localeLink={{
            label: t.nav.otherLocale,
            shortLabel: t.nav.otherLocaleShort,
            href: localePath(other),
            hrefLang: other,
          }}
          themeLabels={t.theme}
        />
        {children}
        {vercelProduction && <Analytics />}
        {vercelProduction && <SpeedInsights />}
      </body>
    </html>
  );
}
