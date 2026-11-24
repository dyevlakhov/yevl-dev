import { expect, test } from 'vitest';
import {
  GLASS_SURFACE_OPACITY,
  NAV_SURFACE_OPACITY,
  palette,
  type TokenName,
} from '@/design/tokens';
import { contrastRatio } from '@/lib/contrast';

const hex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const blend = (top: string, under: string, alpha: number) => {
  const [a, b] = [rgb(top), rgb(under)];
  return `#${a.map((v, i) => hex(v * alpha + b[i]! * (1 - alpha))).join('')}`;
};

// The translucent header can sit over the page background or the filled key/value block.
const underlays: TokenName[] = ['bg', 'soft', 'text'];

test.each(['vice', 'light', 'dark'] as const)(
  '%s header text stays ≥ 4.5:1 over any underlay',
  (theme) => {
    const p = palette[theme];
    for (const under of underlays) {
      const navBg = blend(p.bg, p[under], NAV_SURFACE_OPACITY);
      expect(contrastRatio(p.muted, navBg), `muted over ${under}`).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.text, navBg), `text over ${under}`).toBeGreaterThanOrEqual(4.5);
    }
  },
);

// profile.yaml and the terminal are frosted glass over the static page background (docs/architecture.md).
test.each(['vice', 'light', 'dark'] as const)(
  '%s key/value text stays ≥ 4.5:1 on the glass fill',
  (theme) => {
    const p = palette[theme];
    const glass = blend(p.soft, p.bg, GLASS_SURFACE_OPACITY);
    for (const fg of ['text', 'mark', 'ok'] as const) {
      expect(contrastRatio(p[fg], glass), fg).toBeGreaterThanOrEqual(4.5);
    }
  },
);
