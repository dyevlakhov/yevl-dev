import type { MDXComponents } from 'mdx/types';
import type { ComponentProps } from 'react';
import { CaseBody } from '@/content/cases';
import type { CaseSlug } from '@/content/schema';
import type { Locale } from '@/i18n/locales';
import type { Messages } from '@/i18n/messages';
import { Actions, type Action } from '@/components/ui/Actions';

// The case title is an h3, so the body's `##` sections render as h4.
const caseComponents: MDXComponents = {
  h2: (props: ComponentProps<'h2'>) => (
    <h4 className="mt-7 font-mono text-[0.9375rem] font-semibold first:mt-0" {...props} />
  ),
  h3: (props: ComponentProps<'h3'>) => (
    <h5 className="mt-5 font-mono text-[0.875rem] font-semibold" {...props} />
  ),
  p: (props: ComponentProps<'p'>) => <p className="text-body measure mt-2" {...props} />,
  ul: (props: ComponentProps<'ul'>) => <ul className="case-list measure mt-2" {...props} />,
  ol: (props: ComponentProps<'ol'>) => (
    <ol className="measure mt-2 list-decimal pl-6 marker:font-mono marker:text-mark" {...props} />
  ),
  li: (props: ComponentProps<'li'>) => <li className="text-body mt-1" {...props} />,
  strong: (props: ComponentProps<'strong'>) => <strong className="font-semibold" {...props} />,
  code: (props: ComponentProps<'code'>) => <code className="font-mono text-[0.9em]" {...props} />,
};

/** Full case, expanding in place under its card (native details; see src/lib/case-hash.ts). */
export function CaseDetails({
  slug,
  title,
  actions,
  locale,
  t,
}: {
  slug: CaseSlug;
  title: string;
  /** Shown at the end of the case, so the next step is one tap away (email, CV). */
  actions: Action[];
  locale: Locale;
  t: Messages;
}) {
  return (
    <details data-case={slug} className="case border-t border-rule">
      {/* The name starts with the visible text (WCAG 2.5.3) and says which case opens. */}
      <summary className="case-summary" aria-label={`${t.cases.read}: ${title}`}>
        {t.cases.read}
      </summary>
      <div className="case-body px-6 pt-2 pb-6">
        <CaseBody locale={locale} slug={slug} components={caseComponents} />
        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <Actions items={actions} newTab={t.newTab} />
          <button type="button" data-collapse hidden className="btn">
            {t.cases.collapse}
          </button>
        </div>
      </div>
    </details>
  );
}
