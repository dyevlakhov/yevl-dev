import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/** False during SSR and hydration, true afterwards. Lets JS-only controls stay out of no-JS pages. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
