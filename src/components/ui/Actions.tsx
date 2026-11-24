import { SmartLink } from '@/components/ui/ExternalLink';
import { Icon, type IconName } from '@/components/ui/Icon';

export type Action = {
  label: string;
  href: string;
  primary?: boolean;
  icon?: IconName;
  /**
   * Email CTAs: the copy-email script copies the address on click and shows this hint in the
   * status line below the buttons, for visitors whose mailto opens nothing.
   */
  copyHint?: string;
};

/** Square, monospace action buttons. */
export function Actions({
  items,
  newTab,
  className = '',
  stackOnMobile = false,
}: {
  items: Action[];
  newTab: string;
  className?: string;
  /** Below 480px, one full-width button per row so long labels never wrap. */
  stackOnMobile?: boolean;
}) {
  const stack = stackOnMobile ? 'max-[480px]:flex-col' : '';
  const item = stackOnMobile ? 'max-[480px]:[&>a]:flex max-[480px]:[&>a]:w-full' : '';
  const cta = items.some((a) => a.copyHint);
  return (
    <div className={className} {...(cta ? { 'data-cta-scope': '' } : {})}>
      <ul className={`flex flex-wrap gap-2.5 ${stack}`}>
        {items.map((a) => (
          <li key={a.href} className={item}>
            <SmartLink
              href={a.href}
              newTab={newTab}
              className={a.primary ? 'btn btn-primary' : 'btn'}
              data={a.copyHint ? { 'data-email-cta': a.copyHint } : undefined}
            >
              {a.icon && <Icon name={a.icon} />}
              {a.label}
            </SmartLink>
          </li>
        ))}
      </ul>
      {cta && (
        <p role="status" data-cta-status className="mt-2 font-mono text-[0.8125rem] text-muted" />
      )}
    </div>
  );
}
