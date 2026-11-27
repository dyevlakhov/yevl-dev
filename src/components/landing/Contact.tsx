import type { Content } from '@/content/schema';
import type { Messages } from '@/i18n/messages';
import { Actions } from '@/components/ui/Actions';
import { SmartLink } from '@/components/ui/ExternalLink';
import { Icon } from '@/components/ui/Icon';
import { copyEmailScript } from '@/lib/copy-email';
import { contactActions, contactRows, type ContactRow } from './actions';
import { KeepWords } from '@/components/ui/KeepWords';

const rowGrid =
  'grid grid-cols-[1rem_5.25rem_minmax(0,1fr)_auto] min-h-[3.25rem] items-center gap-3 px-2 py-2.5 max-[480px]:px-0 max-[480px]:grid-cols-[1rem_minmax(0,1fr)_auto]';

function RowBody({ row }: { row: ContactRow }) {
  return (
    <>
      <Icon name={row.icon} className="text-muted" />
      <span className="font-mono text-[0.8125rem] text-muted max-[480px]:hidden">{row.key}</span>
      <span className="truncate font-mono text-[0.875rem] text-text max-[480px]:text-[0.8125rem]">
        {row.prefix && <span className="text-muted">{row.prefix}</span>}
        {row.handle}
        {row.suffix && <span className="text-muted"> {row.suffix}</span>}
      </span>
    </>
  );
}

export function Contact({ profile, t }: { profile: Content['profile']; t: Messages }) {
  const rows = contactRows(profile, t);
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="contact-card mt-16 grid gap-7 rounded-[8px] border border-rule bg-soft p-6 md:mt-20 md:p-8 min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] min-[900px]:gap-10"
    >
      <div>
        <p aria-hidden="true" className="font-mono text-[0.8125rem] text-mark">
          {t.contactComment}
        </p>
        <h2 id="contact-title" className="text-cta mt-2">
          <KeepWords text={t.sections.contact.title} />
        </h2>
        <p className="mt-1.5 text-muted">{t.sections.contact.subtitle}</p>
        <p className="mt-4 flex items-start gap-2 font-mono text-[0.8125rem] text-muted">
          <span
            aria-hidden="true"
            className="mt-[0.45rem] size-[7px] shrink-0 rounded-full bg-ok"
          />
          {profile.availability}
        </p>
        <Actions className="mt-5" items={contactActions(profile, t)} newTab={t.newTab} />
      </div>
      <div>
        <ul data-contact-rows className="border-t border-rule">
          {rows.map((row) => (
            <li key={row.key} className="border-b border-rule">
              {row.href ? (
                <SmartLink
                  href={row.href}
                  newTab={t.newTab}
                  me={row.kind === 'open'}
                  className={`${rowGrid} group text-text no-underline transition-colors hover:bg-bg motion-reduce:transition-none`}
                >
                  <RowBody row={row} />
                  <span className="inline-flex items-center gap-1.5 font-mono text-[0.8125rem] text-muted group-hover:text-text">
                    {/* Phones keep the arrow only, so the handle is never cut. */}
                    <span className="max-[480px]:sr-only">{row.hint}</span>
                    <Icon name={row.kind === 'download' ? 'down' : 'arrow'} size={14} />
                  </span>
                </SmartLink>
              ) : (
                <div className={rowGrid}>
                  <Icon name={row.icon} className="text-muted" />
                  <span className="font-mono text-[0.8125rem] text-muted max-[480px]:hidden">
                    {row.key}
                  </span>
                  {/* Visible and one-click selectable, for visitors whose mailto opens nothing. */}
                  <span
                    data-email
                    className="min-w-0 font-mono text-[0.875rem] wrap-anywhere select-all max-[480px]:text-[0.8125rem]"
                  >
                    {row.handle}
                  </span>
                  {/* Revealed by copyEmailScript; hidden without JavaScript. */}
                  <button
                    type="button"
                    hidden
                    data-copy-email
                    data-copied={t.contact.copied}
                    data-announce={t.contact.announce}
                    data-fallback={t.contact.fallback}
                    data-fallback-mac={t.contact.fallbackMac}
                    data-fallback-touch={t.contact.fallbackTouch}
                    className="btn btn-sm max-[480px]:w-7 max-[480px]:px-0"
                  >
                    <Icon name="copy" size={14} className="min-[481px]:hidden" />
                    {/* The script swaps this label; the status line below confirms on phones. */}
                    <span data-label className="max-[480px]:sr-only">
                      {row.hint}
                    </span>
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
        <p role="status" data-copy-status className="mt-2 font-mono text-[0.8125rem] text-muted" />
      </div>
      <script dangerouslySetInnerHTML={{ __html: copyEmailScript }} />
    </section>
  );
}
