import { expect, test } from 'vitest';
import { isSpecimenEnabled } from '@/lib/env';

test('specimen is hidden in Vercel production', () => {
  expect(isSpecimenEnabled({ VERCEL_ENV: 'production' })).toBe(false);
});
test('specimen is visible on previews', () => {
  expect(isSpecimenEnabled({ VERCEL_ENV: 'preview' })).toBe(true);
});
test('specimen is visible locally', () => {
  expect(isSpecimenEnabled({})).toBe(true);
});
