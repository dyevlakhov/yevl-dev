import type { Content } from '@/content/schema';
import type { Messages } from '@/i18n/messages';
import { SmartLink } from '@/components/ui/ExternalLink';
import { Icon, type IconName } from '@/components/ui/Icon';
import { emailHref } from '@/content/links';

export function Footer({ profile, t }: { profile: Content['profile']; t: Messages }) {
  const href = (label: 'LinkedIn' | 'GitHub') => profile.links.find((l) => l.label === label)!.href;
  // Reachable from the end of the page without scrolling back to the contact block.
  const links: { label: string; href: string; icon: IconName; me?: boolean }[] = [
    { label: t.actions.email, href: emailHref(t.contact.subject), icon: 'mail' },
    { label: 'LinkedIn', href: href('LinkedIn'), icon: 'linkedin', me: true },
    { label: 'GitHub', href: href('GitHub'), icon: 'github', me: true },
  ];
  return (
    <footer className="mt-20 border-t border-rule font-mono text-[0.8125rem] text-muted">
      <div className="mx-auto flex w-[min(100%-40px,1080px)] flex-wrap items-center justify-between gap-4 py-5 pb-10">
        <span>© 2026 yevl.dev</span>
        <div className="flex items-center gap-5">
          <span>{t.footer}</span>
          <ul className="flex items-center gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <SmartLink
                  href={l.href}
                  newTab={t.newTab}
                  me={l.me}
                  ariaLabel={l.label}
                  className="grid size-8 place-items-center text-muted hover:text-text"
                >
                  <Icon name={l.icon} />
                </SmartLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
