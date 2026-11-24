import { describe, expect, test } from 'vitest';
import { cardGlideScript } from '@/lib/card-glide';

describe('card glide script (ADR 0002, effect 16)', () => {
  test('is small and self-contained', () => {
    expect(cardGlideScript.length).toBeLessThan(1536);
    expect(cardGlideScript).toContain('(hover: hover) and (pointer: fine)');
    expect(cardGlideScript).toContain('[data-glide]');
    // It must not change the DOM structure before hydration (React would re-render the tree).
    expect(cardGlideScript).not.toMatch(/appendChild|createElement|insertBefore|setAttribute/);
    expect(() => new Function(cardGlideScript)).not.toThrow();
  });
});
