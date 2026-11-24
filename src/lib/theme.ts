export const THEME_STORAGE_KEY = 'theme';

/** Switch order. Vice is the default for everyone (ADR 0001). */
export const THEMES = ['vice', 'dark', 'light'] as const;
export type Theme = (typeof THEMES)[number];

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

/** The theme after `t` in switch order: vice → dark → light → vice. */
export function nextTheme(t: Theme): Theme {
  return THEMES[(THEMES.indexOf(t) + 1) % THEMES.length]!;
}

/** Distance from (x, y) to the farthest viewport corner: the radius that covers the screen. */
export function revealRadius(x: number, y: number, width: number, height: number): number {
  return Math.hypot(Math.max(x, width - x), Math.max(y, height - y));
}

/**
 * Runs before first paint. Marks the page as scripted (so JS-only UI can reserve its space and
 * avoid layout shift) and applies a stored dark or light choice; vice is the default and needs
 * no attribute.
 */
export const themeBootstrapScript = `(function(){document.documentElement.classList.add('js');try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t;}catch(e){}})();`;
