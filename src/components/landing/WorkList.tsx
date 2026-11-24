import type { Content } from '@/content/schema';
import type { Locale } from '@/i18n/locales';
import type { Messages } from '@/i18n/messages';
import { caseHashScript } from '@/lib/case-hash';
import { Section } from '@/components/ui/Section';
import { SmartLink } from '@/components/ui/ExternalLink';
import { CaseDetails } from './CaseDetails';
import { heroActions } from './actions';
import {
  ArchitectureDiagram,
  DecisionsDiagram,
  ReleaseDiagram,
} from '@/components/diagrams/Diagrams';

const diagrams = {
  architecture: ArchitectureDiagram,
  decisions: DecisionsDiagram,
  release: ReleaseDiagram,
};

export function WorkList({
  cases,
  also,
  profile,
  locale,
  t,
}: {
  cases: Content['cases'];
  profile: Content['profile'];
  also: Content['also'];
  locale: Locale;
  t: Messages;
}) {
  // Email and CV only; the Unity link would point back at the cases.
  const afterCase = heroActions(profile, t).slice(0, 2);
  return (
    <Section id="work" title={t.sections.work.title} subtitle={t.sections.work.subtitle}>
      <div className="space-y-3.5">
        {cases.map((cs) => {
          const Diagram = diagrams[cs.diagram];
          const d = t.diagrams[cs.diagram];
          return (
            <article
              key={cs.slug}
              id={cs.slug}
              aria-labelledby={`${cs.slug}-title`}
              className="grid overflow-hidden rounded-[6px] border border-rule md:grid-cols-2"
            >
              <div
                data-diagram={cs.diagram}
                className="case-tile relative grid min-h-[220px] place-items-center bg-tile px-5 pt-9 pb-5 text-tile-text"
              >
                <span
                  aria-hidden="true"
                  className="absolute top-2.5 left-3.5 font-mono text-xs text-tile-muted"
                >
                  {d.file}
                </span>
                <Diagram label={d.label} />
              </div>
              <div className="px-6 py-5">
                <p className="font-mono text-[0.8125rem] text-mark">
                  {cs.meta[0]} · {cs.meta[1]}
                </p>
                <h3 id={`${cs.slug}-title`} className="text-h3 mt-1.5">
                  {cs.title}
                </h3>
                <p className="text-body mt-2 text-muted">{cs.summary}</p>
                {cs.result && (
                  <p className="text-body mt-2">
                    <strong className="font-semibold">{t.cases.result}</strong> {cs.result}
                  </p>
                )}
                {cs.highlights && (
                  <ul className="case-list case-highlights mt-2">
                    {cs.highlights.map((h) => (
                      <li key={h} className="text-body mt-1">
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
                <ul className="mt-3 flex flex-wrap gap-1.5 font-mono text-[0.8125rem] text-muted">
                  {cs.tags.map((tag) => (
                    <li key={tag} className="rounded-[3px] border border-rule px-1.5">
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:col-span-2">
                <CaseDetails
                  slug={cs.slug}
                  title={cs.title}
                  actions={afterCase}
                  locale={locale}
                  t={t}
                />
              </div>
            </article>
          );
        })}
      </div>
      <ul className="mt-5 space-y-1 text-[0.9375rem]">
        {also.map((item) => (
          <li key={item.label}>
            <span aria-hidden="true" className="font-mono text-mark">
              +{' '}
            </span>
            {item.href ? (
              <SmartLink href={item.href} newTab={t.newTab}>
                {item.label}
              </SmartLink>
            ) : (
              <strong className="font-semibold">{item.label}</strong>
            )}
            : {item.description}
          </li>
        ))}
      </ul>
      <script dangerouslySetInnerHTML={{ __html: caseHashScript }} />
    </Section>
  );
}
