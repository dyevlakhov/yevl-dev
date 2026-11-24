import type { MDXComponents, MDXContent } from 'mdx/types';
import { createElement, type ReactNode } from 'react';
import type { Locale } from '@/i18n/locales';
import { caseMetaSchema, type CaseMeta, type CaseSlug } from '../schema';
import enCareerPro, { meta as enCareerProMeta } from './en/career-pro.mdx';
import enMealPlanner, { meta as enMealPlannerMeta } from './en/meal-planner.mdx';
import enUnity, { meta as enUnityMeta } from './en/unity.mdx';
import ukCareerPro, { meta as ukCareerProMeta } from './uk/career-pro.mdx';
import ukMealPlanner, { meta as ukMealPlannerMeta } from './uk/meal-planner.mdx';
import ukUnity, { meta as ukUnityMeta } from './uk/unity.mdx';

type Entry = { Body: MDXContent; meta: unknown };

const entries: Record<Locale, Record<CaseSlug, Entry>> = {
  en: {
    unity: { Body: enUnity, meta: enUnityMeta },
    'meal-planner': { Body: enMealPlanner, meta: enMealPlannerMeta },
    'career-pro': { Body: enCareerPro, meta: enCareerProMeta },
  },
  uk: {
    unity: { Body: ukUnity, meta: ukUnityMeta },
    'meal-planner': { Body: ukMealPlanner, meta: ukMealPlannerMeta },
    'career-pro': { Body: ukCareerPro, meta: ukCareerProMeta },
  },
};

// Validated on load, like the rest of the content: a body filed under the wrong slug or locale
// fails the build instead of shipping.
for (const [locale, bySlug] of Object.entries(entries)) {
  for (const [slug, { meta }] of Object.entries(bySlug)) {
    const parsed: CaseMeta = caseMetaSchema.parse(meta);
    if (parsed.slug !== slug || parsed.locale !== locale) {
      throw new Error(`case body ${locale}/${slug} declares meta ${JSON.stringify(parsed)}`);
    }
  }
}

/** Renders one case body. A module-level component, so React never sees a component made in render. */
export function CaseBody({
  locale,
  slug,
  components,
}: {
  locale: Locale;
  slug: CaseSlug;
  components: MDXComponents;
}): ReactNode {
  return createElement(entries[locale][slug].Body, { components });
}
