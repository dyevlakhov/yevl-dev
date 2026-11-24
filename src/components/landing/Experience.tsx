import type { Content } from '@/content/schema';
import type { Messages } from '@/i18n/messages';
import { Section } from '@/components/ui/Section';
import { monthRange } from '@/lib/format';

export function Experience({ roles, t }: { roles: Content['roles']; t: Messages }) {
  return (
    <Section
      id="experience"
      title={t.sections.experience.title}
      subtitle={t.sections.experience.subtitle}
    >
      <div className="border-t border-rule">
        {roles.map((role) => (
          <article
            key={role.company}
            data-role
            className="grid gap-1 border-b border-rule py-5 sm:grid-cols-[11rem_1fr] sm:gap-4"
          >
            <p className="tabular font-mono text-sm text-muted">
              {monthRange(role.start, role.end)}
            </p>
            <div>
              <h3 className="head-sm font-mono text-[1.0625rem] font-semibold">
                {role.company}{' '}
                <span className="font-mono text-[1.0625rem] font-normal text-muted">
                  · {role.title}
                </span>
              </h3>
              <ul className="dash-list measure mt-2 space-y-1">
                {role.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
