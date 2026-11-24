import { revealRadius, THEME_STORAGE_KEY, type Theme } from '@/lib/theme';

export type { Theme };

/** Vice is the default for everyone; only an explicit dark or light choice changes it. */
export function currentTheme(): Theme {
  const t = document.documentElement.dataset.theme;
  return t === 'dark' || t === 'light' ? t : 'vice';
}

export type Point = { x: number; y: number };

export function centerOf(el: Element): Point {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function persist(next: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Storage can be unavailable (private mode); the choice then lasts for this page view.
  }
}

function apply(next: Theme): void {
  document.documentElement.dataset.theme = next;
}

/**
 * With an origin, the new theme opens as a circle from that point (View Transitions; ADR 0002, effect 12). Without support, or under reduced motion, it changes at once.
 */
let current: ViewTransition | null = null;

/**
 * While a view transition runs, Chromium hit-tests every click to <html>, so a second click on the
 * switch would be lost. Route it to the theme button under the pointer instead.
 */
function routeClick(e: MouseEvent): void {
  if (e.target !== document.documentElement) return;
  const hit = [...document.querySelectorAll<HTMLElement>('.theme-option')].find((b) => {
    const r = b.getBoundingClientRect();
    return (
      e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom
    );
  });
  if (hit) hit.click();
}

export function setTheme(next: Theme, origin?: Point): void {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // The choice is stored at once; only the repaint waits for the transition's snapshot.
  persist(next);
  if (!origin || reduce || !document.startViewTransition) return apply(next);
  root.style.setProperty('--vt-x', `${origin.x}px`);
  root.style.setProperty('--vt-y', `${origin.y}px`);
  root.style.setProperty(
    '--vt-r',
    `${revealRadius(origin.x, origin.y, window.innerWidth, window.innerHeight)}px`,
  );
  // No colour transitions while the circle opens (they would ease through low contrast inside it).
  root.classList.add('theme-switching');
  const transition = document.startViewTransition(() => apply(next));
  if (!current) document.addEventListener('click', routeClick, true);
  current = transition;
  // A second switch skips this transition: its `ready` rejects (expected), and only the latest
  // transition may lift the class and stop routing clicks.
  transition.ready.catch(() => {});
  const done = () => {
    if (current !== transition) return;
    current = null;
    root.classList.remove('theme-switching');
    document.removeEventListener('click', routeClick, true);
  };
  transition.finished.then(done, done);
}
