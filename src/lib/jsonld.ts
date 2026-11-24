import type { Content } from '@/content/schema';
import type { Locale } from '@/i18n/locales';
import { SITE_URL } from '@/lib/site';

/** schema.org ProfilePage + Person, built only from typed content (no invented facts). */
export function profileJsonLd(locale: Locale, content: Content) {
  const { profile } = content;
  const href = (label: 'LinkedIn' | 'GitHub') => profile.links.find((l) => l.label === label)!.href;
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: locale === 'en' ? SITE_URL : `${SITE_URL}/uk`,
    inLanguage: locale,
    mainEntity: {
      '@type': 'Person',
      name: profile.name,
      jobTitle: profile.title,
      url: SITE_URL,
      sameAs: [href('GitHub'), href('LinkedIn')],
      knowsAbout: profile.stack,
    },
  };
}

/** JSON for an inline <script type="application/ld+json">, with "<" escaped (Next.js JSON-LD guide). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
