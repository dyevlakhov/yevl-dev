import type { Content } from '@/content/schema';
import type { Messages } from '@/i18n/messages';
import { yearRange } from '@/lib/format';

export function CareerStrip({ roles, t }: { roles: Content['roles']; t: Messages }) {
  return (
    <section id="career" aria-label={t.career.label} className="mt-8">
      {/* Clips the gliding fill (effect 16) to the strip's rounded corners. */}
      <div data-glide className="relative overflow-hidden rounded-[6px]">
        <span aria-hidden="true" className="card-glide" />
        <ol className="grid grid-cols-2 rounded-[6px] border border-rule md:grid-cols-4">
          {roles.map((r, i) => (
            <li
              key={r.company}
              className={`row-hover px-4 py-3.5 ${i % 2 ? 'border-l border-rule' : ''} ${i > 1 ? 'border-t border-rule md:border-t-0' : ''} ${i === 2 ? 'md:border-l' : ''}`}
            >
              <p className="tabular font-mono text-xs text-mark">{yearRange(r.start, r.end)}</p>
              <p className="head-sm mt-1 font-mono text-[0.9375rem] font-bold">{r.company}</p>
              <p className="text-[0.875rem] text-muted">{r.title}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
