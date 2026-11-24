import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

// Static pages cannot carry nonces, and the inline RSC payload scripts Next.js writes into static
// HTML change with every build, so a hash list is not workable (experimental SRI covers only
// external files; verified 2026-11-15: a strict script-src broke hydration). Scripts therefore
// allow 'unsafe-inline'; everything else stays strict. The site has no user input or third-party
// scripts; Vercel Analytics and Speed Insights load from the same origin (/_vercel/*). See
// docs/architecture.md.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Two root layouts (en, uk) need one global 404 (docs/architecture.md).
    globalNotFound: true,
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

// MDX is only imported (case bodies), never routed, so `pageExtensions` keeps its default.
// No remark/rehype plugins: Turbopack accepts only serializable plugin options.
export default createMDX({})(nextConfig);
