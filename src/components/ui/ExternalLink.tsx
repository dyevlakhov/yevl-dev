import type { ReactNode } from 'react';

/**
 * Links to other sites open in a new tab and say so to screen readers; same-site links (mailto,
 * /cv.pdf) do not. The CV is an English PDF in both locales.
 */
export function SmartLink({
  href,
  className,
  newTab,
  me = false,
  data,
  ariaLabel,
  children,
}: {
  href: string;
  className?: string;
  /** Screen-reader note for links that open a new tab, e.g. "(opens in a new tab)". */
  newTab?: string;
  /** rel="me": the linked profile is mine (identity verification). */
  me?: boolean;
  /** Extra data-* attributes, e.g. hooks for the inline copy-email script. */
  data?: Record<`data-${string}`, string>;
  ariaLabel?: string;
  children: ReactNode;
}) {
  const external = href.startsWith('http');
  const pdf = href.endsWith('.pdf');
  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel && external && newTab ? `${ariaLabel} ${newTab}` : ariaLabel}
      {...data}
      {...(external ? { target: '_blank', rel: `${me ? 'me ' : ''}noopener noreferrer` } : {})}
      {...(pdf ? { hrefLang: 'en', type: 'application/pdf' } : {})}
    >
      {children}
      {external && newTab && <span className="sr-only"> {newTab}</span>}
    </a>
  );
}
