import type { Content } from '@/content/schema';
import type { Messages } from '@/i18n/messages';
import { Section } from '@/components/ui/Section';

/** "How I work" (M3): three principles, each optionally pointing at the case where it shows. */
export function HowIWork({ principles, t }: { principles: Content['principles']; t: Messages }) {
  return (
    <Section id="how-i-work" title={t.sections.how.title} subtitle={t.sections.how.subtitle}>
      <ol className="border-t border-rule">
        {principles.map((p, i) => (
          <li
            key={p.title}
            className="grid gap-x-6 gap-y-1 border-b border-rule py-5 sm:grid-cols-[3rem_1fr]"
          >
            <p aria-hidden="true" className="font-mono text-xs text-mark sm:pt-1">
              {String(i + 1).padStart(2, '0')}
            </p>
            <div>
              <h3 className="head-sm font-mono text-base font-semibold">{p.title}</h3>
              <p className="text-body measure mt-1.5 text-muted">{p.body}</p>
              {p.caseSlug && (
                <p className="mt-2 font-mono text-[0.8125rem]">
                  <span className="text-mark">{t.see}</span>{' '}
                  <a href={`#${p.caseSlug}`}>#{p.caseSlug}</a>
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
