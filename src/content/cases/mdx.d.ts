declare module '*.mdx' {
  import type { MDXContent } from 'mdx/types';
  export const meta: unknown;
  const Component: MDXContent;
  export default Component;
}
