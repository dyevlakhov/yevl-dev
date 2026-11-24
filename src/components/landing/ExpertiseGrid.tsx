import type { Content } from '@/content/schema';
import type { Messages } from '@/i18n/messages';
import { Section } from '@/components/ui/Section';

export function ExpertiseGrid({ areas, t }: { areas: Content['areas']; t: Messages }) {
  return (
    <Section
      id="expertise"
      title={t.sections.expertise.title}
      subtitle={t.sections.expertise.subtitle}
    >
      {/* The fill glides between cells on fine pointers (effect 16, src/lib/card-glide.ts). */}
      <div data-glide className="relative">
        <span aria-hidden="true" className="card-glide" />
        <ul className="grid border-t border-l border-rule sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((a, i) => (
            <li key={a.id} className="row-hover border-r border-b border-rule p-5">
              <p aria-hidden="true" className="font-mono text-xs text-mark">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="head-sm mt-2 font-mono text-base font-semibold">{a.title}</h3>
              <p className="mt-1.5 text-[0.9375rem] text-muted">{a.summary}</p>
              <p className="mt-3 font-mono text-[0.8125rem]">
                <span className="text-mark">{t.where}</span> {a.proof}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
