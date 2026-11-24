import { z } from 'zod';

const yearMonth = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

export const profileSchema = z.object({
  name: z.string().min(1),
  /** Role headline; English in both locales. */
  title: z.string().min(1),
  /** Stack shown after the title, set in monospace; English in both locales. */
  stackLine: z.string().min(1),
  /** The two sentences under the hero headline. */
  intro: z.string().min(1),
  /** Search and link previews: <title> is "name · title"; this is the meta/OG description (≤ 160 chars). */
  metaDescription: z.string().min(1).max(160),
  focus: z.array(z.string().min(1)).length(6),
  stack: z.array(z.string().min(1)).min(5),
  availability: z.string().min(1),
  email: z.email(),
  links: z.array(
    z.object({ label: z.enum(['Email', 'CV', 'LinkedIn', 'GitHub']), href: z.string().min(1) }),
  ),
  education: z.string().min(1),
});

export const roleSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  start: yearMonth,
  end: yearMonth,
  bullets: z.array(z.string().min(1)).min(1),
});

export const areaSchema = z.object({
  id: z.string().regex(/^[a-z-]+$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  proof: z.string().min(1),
});

export const caseSummarySchema = z.object({
  slug: z.enum(['unity', 'meal-planner', 'career-pro']),
  /** Two short lines shown in the meta column: when (or a status), and where or what. */
  meta: z.tuple([z.string().min(1), z.string().min(1)]),
  title: z.string().min(1),
  summary: z.string().min(1),
  /** Shown on the card before expanding: "Result: …". */
  result: z.string().min(1).optional(),
  /** Short list of the owner's own contributions, shown on the card. */
  highlights: z.array(z.string().min(1)).min(1).optional(),
  tags: z.array(z.string().min(1)).min(1),
  diagram: z.enum(['architecture', 'decisions', 'release']),
});

/** `export const meta` at the top of each case body (src/content/cases/<locale>/<slug>.mdx). */
export const caseMetaSchema = z.object({
  slug: caseSummarySchema.shape.slug,
  locale: z.enum(['en', 'uk']),
});

export const alsoSchema = z.object({
  label: z.string().min(1),
  description: z.string().min(1),
  href: z.url().optional(),
});

/** "How I work" (M3): a habit, the short reason behind it, and optionally the case where it shows. */
export const principleSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  caseSlug: caseSummarySchema.shape.slug.optional(),
});

export const contentSchema = z.object({
  profile: profileSchema,
  roles: z.array(roleSchema).min(1),
  areas: z.array(areaSchema).length(6),
  cases: z.array(caseSummarySchema).min(1),
  also: z.array(alsoSchema),
  principles: z.array(principleSchema).length(3),
});

export type Profile = z.infer<typeof profileSchema>;
export type Role = z.infer<typeof roleSchema>;
export type Area = z.infer<typeof areaSchema>;
export type CaseSummary = z.infer<typeof caseSummarySchema>;
export type CaseSlug = CaseSummary['slug'];
export type CaseMeta = z.infer<typeof caseMetaSchema>;
export type Principle = z.infer<typeof principleSchema>;
export type AlsoItem = z.infer<typeof alsoSchema>;
export type Content = {
  profile: Profile;
  roles: Role[];
  areas: Area[];
  cases: CaseSummary[];
  also: AlsoItem[];
  principles: Principle[];
};
