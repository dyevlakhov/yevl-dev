import type { Locale } from '@/i18n/locales';
import { Flag } from '@/components/ui/Flag';
import { ThemeSwitch, type ThemeLabels } from '@/components/ui/ThemeSwitch';

/** `mobile` items stay visible below 640px; the rest show from `sm` up. */
export type NavItem = { label: string; href: `#${string}`; mobile?: boolean };

export function SiteHeader({
  label,
  items,
  localeLink,
  themeLabels,
}: {
  label: string;
  items: NavItem[];
  localeLink: { label: string; shortLabel: string; href: string; hrefLang: Locale };
  themeLabels: ThemeLabels;
}) {
  const quiet = 'text-muted no-underline hover:text-text';
  return (
    <header className="site-header sticky top-0 z-40 border-b border-rule">
      <nav
        aria-label={label}
        className="mx-auto flex h-13 w-[min(100%-40px,1080px)] items-center gap-2.5 font-mono text-sm whitespace-nowrap sm:gap-5"
      >
        {/* Below 640px the hero name stands in for the logo and gaps tighten to 10px, so work, contact,
            the language link and the three-way theme switch fit at 320px (UK labels are longest). */}
        <a href="#main" className="logo mr-auto hidden font-bold text-text no-underline sm:inline">
          yevl.dev
        </a>
        <ul className="mr-auto flex items-center gap-2.5 sm:mr-0 sm:gap-5">
          {items.map((item) => (
            <li key={item.href} className={item.mobile ? '' : 'hidden sm:list-item'}>
              <a href={item.href} className={quiet}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href={localeLink.href}
          hrefLang={localeLink.hrefLang}
          lang={localeLink.hrefLang}
          className={`inline-flex items-center gap-2 ${quiet}`}
        >
          <Flag locale={localeLink.hrefLang} />
          {/* Label in Name (WCAG 2.5.3): the name starts with the visible short label. */}
          {/* Short label below 768px: from 640px the logo, four nav links and the theme switch
              share the row. */}
          <span className="md:hidden">
            {localeLink.shortLabel}
            <span className="sr-only"> · {localeLink.label}</span>
          </span>
          <span className="hidden md:inline">{localeLink.label}</span>
        </a>
        <ThemeSwitch labels={themeLabels} />
      </nav>
    </header>
  );
}
