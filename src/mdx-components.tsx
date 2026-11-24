import type { MDXComponents } from 'mdx/types';

// Required by @next/mdx in the App Router. Case bodies get their components from CaseDetails.
export function useMDXComponents(): MDXComponents {
  return {};
}
