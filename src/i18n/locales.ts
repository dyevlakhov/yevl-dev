export type Locale = 'en' | 'uk';

export const locales: readonly Locale[] = ['en', 'uk'];
export const defaultLocale: Locale = 'en';

/** `en` lives at the root, every other locale under its own prefix. */
export function localePath(locale: Locale, hash?: string): string {
  const base = locale === defaultLocale ? '/' : `/${locale}`;
  return hash ? `${base}#${hash}` : base;
}
