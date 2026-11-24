/** The design-system specimen is a review tool: visible locally and on previews, never in production. */
export function isSpecimenEnabled(env: { VERCEL_ENV?: string; NODE_ENV?: string }): boolean {
  return env.VERCEL_ENV !== 'production';
}
