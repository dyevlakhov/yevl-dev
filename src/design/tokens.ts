import type { Theme } from '@/lib/theme';

export type TokenName =
  | 'bg'
  | 'soft'
  | 'text'
  | 'muted'
  | 'mark'
  | 'rule'
  | 'link'
  | 'ok'
  | 'tile'
  | 'tileText'
  | 'tileMuted'
  | 'tileRule'
  | 'green'
  | 'blue'
  | 'amber';

/**
 * Source of truth for colour tokens (docs/architecture.md; Vice: ADR 0001).
 * `src/app/globals.css` mirrors these values: vice in `:root` (the default), dark under
 * `[data-theme='dark']`, light under `[data-theme='light']`. Checked by tests/unit/tokens.test.ts.
 */
export const palette: Record<Theme, Record<TokenName, string>> = {
  vice: {
    bg: '#0c0b0f',
    soft: '#151419',
    text: '#ececf0',
    muted: '#a7a5b0',
    mark: '#8b8995',
    rule: '#27262d',
    link: '#f2a5c4',
    ok: '#86e3c9',
    tile: '#121116',
    tileText: '#ececf0',
    tileMuted: '#a09ea9',
    tileRule: '#34333b',
    green: '#86e3c9',
    blue: '#f2a5c4',
    amber: '#ffc58a',
  },
  dark: {
    bg: '#0b0b0c',
    soft: '#141416',
    text: '#e7e7e9',
    muted: '#a0a2a9',
    mark: '#85888f',
    rule: '#26272b',
    link: '#8ab4f8',
    ok: '#4ade80',
    tile: '#111113',
    tileText: '#e7e7e9',
    tileMuted: '#9a9ca3',
    tileRule: '#2c2d32',
    green: '#4ade80',
    blue: '#8ab4f8',
    amber: '#f5b14c',
  },
  light: {
    bg: '#ffffff',
    soft: '#f5f5f6',
    text: '#1b1b1d',
    muted: '#5d5f66',
    mark: '#6b6e76',
    rule: '#e6e6e8',
    link: '#0a58ca',
    ok: '#15803d',
    tile: '#0e0e10',
    tileText: '#e7e7e9',
    tileMuted: '#9a9ca3',
    tileRule: '#2c2d32',
    green: '#4ade80',
    blue: '#8ab4f8',
    amber: '#f5b14c',
  },
};

/**
 * Opacity of the frosted sticky header; tests check text contrast over every underlay. Content,
 * including the filled primary button, scrolls under it, so 0.85 is the floor (docs/architecture.md).
 */
export const NAV_SURFACE_OPACITY = 0.85;

/** Opacity of the frosted key/value window and terminal; only the static background sits under them. */
export const GLASS_SURFACE_OPACITY = 0.55;

/** Vice dusk gradient stops (ADR 0001): lines and edges, and the headline fill. */
export const VICE_DUSK = ['#ffc58a', '#ff9db0', '#d9a2ff'] as const;
export const VICE_DUSK_TEXT = ['#ffd3a0', '#ff9db0', '#d6a4ff'] as const;
