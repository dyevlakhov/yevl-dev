import type { Content } from '@/content/schema';
import type { Messages } from '@/i18n/messages';
import type { Action } from '@/components/ui/Actions';
import type { IconName } from '@/components/ui/Icon';
import { emailHref } from '@/content/links';

type LinkLabel = Content['profile']['links'][number]['label'];

const linkHref = (profile: Content['profile'], label: LinkLabel) =>
  profile.links.find((l) => l.label === label)!.href;

/** "Email me": a draft with a subject; the click also copies the address (copy-email script). */
const emailAction = (t: Messages): Action => ({
  label: t.actions.email,
  href: emailHref(t.contact.subject),
  primary: true,
  copyHint: t.contact.ctaCopied,
});

/** Hero: email, the CV and the Unity case (opened by the case hash script). */
export function heroActions(profile: Content['profile'], t: Messages): Action[] {
  return [
    emailAction(t),
    { label: t.actions.cv, href: linkHref(profile, 'CV') },
    { label: t.actions.unityCase, href: '#unity' },
  ];
}

/** Contact block: the primary button; every channel is listed in contactRows. */
export function contactActions(_profile: Content['profile'], t: Messages): Action[] {
  return [{ ...emailAction(t), icon: 'mail' }];
}

export type ContactRow = {
  key: 'email' | 'linkedin' | 'github' | 'cv';
  icon: IconName;
  /** Muted part shown before the handle, e.g. "in/". */
  prefix?: string;
  handle: string;
  suffix?: string;
  /** Absent for email: that row is selectable text with a copy button. */
  href?: string;
  hint: string;
  kind: 'copy' | 'open' | 'download';
};

/** Contact rows: icon · key · the real handle · what the click does. Keys and handles stay English. */
export function contactRows(profile: Content['profile'], t: Messages): ContactRow[] {
  const linkedin = linkHref(profile, 'LinkedIn');
  const github = linkHref(profile, 'GitHub');
  return [
    { key: 'email', icon: 'mail', handle: profile.email, hint: t.contact.copy, kind: 'copy' },
    {
      key: 'linkedin',
      icon: 'linkedin',
      prefix: 'in/',
      handle: linkedin.replace(/\/$/, '').split('/').pop()!,
      href: linkedin,
      hint: t.contact.open,
      kind: 'open',
    },
    {
      key: 'github',
      icon: 'github',
      prefix: '@',
      handle: github.replace(/\/$/, '').split('/').pop()!,
      href: github,
      hint: t.contact.open,
      kind: 'open',
    },
    {
      key: 'cv',
      icon: 'cv',
      handle: 'cv.pdf',
      suffix: '· PDF',
      href: linkHref(profile, 'CV'),
      hint: t.contact.download,
      kind: 'download',
    },
  ];
}
