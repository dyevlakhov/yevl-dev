import type { Locale } from '@/i18n/locales';
import { contentSchema, type Content } from './schema';
import * as en from './en';
import * as uk from './uk';

// Parsed on load: invalid content fails the build instead of shipping. This module is server-only
// in practice (client components receive plain props), so Zod stays out of the browser bundle.
const byLocale: Record<Locale, Content> = {
  en: contentSchema.parse(en),
  uk: contentSchema.parse(uk),
};

export function getContent(locale: Locale): Content {
  return byLocale[locale];
}
