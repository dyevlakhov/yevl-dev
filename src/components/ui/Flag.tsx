import type { Locale } from '@/i18n/locales';

/**
 * Decorative flag next to the language link. Inline SVG rather than emoji, because Windows shows
 * flag emoji as plain letters. The link text stays the accessible name.
 */
export function Flag({ locale }: { locale: Locale }) {
  const common = {
    'aria-hidden': true,
    width: 18,
    height: 12,
    className: 'inline-block shrink-0 rounded-[2px] ring-1 ring-rule',
  } as const;
  if (locale === 'uk') {
    return (
      <svg {...common} viewBox="0 0 3 2">
        <rect width="3" height="1" fill="#0057b7" />
        <rect y="1" width="3" height="1" fill="#ffd700" />
      </svg>
    );
  }
  return (
    <svg {...common} viewBox="0 0 60 40">
      <clipPath id="flag-gb">
        <rect width="60" height="40" />
      </clipPath>
      <g clipPath="url(#flag-gb)">
        <rect width="60" height="40" fill="#012169" />
        <path d="M0 0 60 40M60 0 0 40" stroke="#fff" strokeWidth="8" />
        <path d="M0 0 60 40M60 0 0 40" stroke="#c8102e" strokeWidth="3" />
        <path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="12" />
        <path d="M30 0v40M0 20h60" stroke="#c8102e" strokeWidth="7" />
      </g>
    </svg>
  );
}
