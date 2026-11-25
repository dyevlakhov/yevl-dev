# yevl.dev architecture

A one-page personal site in English (`/`) and Ukrainian (`/uk`). This document describes how it is built and which constraints the code keeps. Decisions that outlive a PR are recorded as ADRs in [`docs/adr/`](adr/).

## Goals and constraints

- A recruiter understands who the owner is, where they have worked and how to reach them within half a minute. An engineer can open the case studies and see how decisions were made.
- Fully static. No runtime server code, no CMS, no database. Publishing goes through git.
- Budgets, enforced in CI: Lighthouse ≥ 95 in every category, LCP < 1.5 s (lab), CLS < 0.05, client JS < 180 KB gzip in total (the Next.js 16 runtime alone is about 165 KB).
- WCAG 2.2 AA in every theme: text contrast ≥ 4.5:1, visible focus, a skip link, keyboard access everywhere. axe runs in the e2e suite.
- No third-party scripts. The one exception is Vercel Web Analytics and Speed Insights, served from the site's own origin (`/_vercel/*`) and rendered only in Vercel production builds.

## Stack

| Layer     | Choice                                                                                |
| --------- | ------------------------------------------------------------------------------------- |
| Framework | Next.js 16 (App Router), statically generated, React Server Components by default     |
| Language  | TypeScript (strict, `noUncheckedIndexedAccess`)                                       |
| Styling   | Tailwind CSS 4 with design tokens as CSS custom properties (`src/design/tokens.ts`)   |
| Content   | Typed modules validated with Zod; case studies in MDX (`@next/mdx`)                   |
| Fonts     | `next/font` (JetBrains Mono, IBM Plex Sans) and one self-hosted Science Gothic subset |
| Tests     | Vitest (unit), Playwright + axe (e2e and accessibility), Lighthouse CI (budgets)      |
| Hosting   | Vercel: a preview deployment per pull request, production from `main`                 |

Next.js was chosen over Astro because it is the owner's daily tool and because the codebase itself is part of the portfolio. The performance gap is closed with server components, native `<details>` for the case studies and very little client JavaScript.

## Content and i18n

- No i18n library. Each locale has its own root layout through route groups: `src/app/(en)/` renders `<html lang="en">`, `src/app/(uk)/uk/` renders `<html lang="uk">`. Both are static; there is no middleware and no automatic language redirect.
- `src/content/{en,uk}/` holds typed data for the hero, career, expertise, experience and "how I work". `src/content/cases/{en,uk}/<slug>.mdx` holds the case studies; each exports a `meta` object that is validated at build time. Invalid content fails the build.
- A parity test keeps both locales in the same shape: the same slugs, dates, links and number of headings.
- Company names, job titles, technology names and the CV PDF stay in English in both locales.
- Copy rules are tested: no em dashes, no location or time zone, education without dates. Some rules name the very things they keep off the site, so their patterns live outside the repo (see `tests/guard-terms.ts`); without them those tests are skipped.

## Page

Order: hero, career, work, expertise, experience, how I work, terminal, contact. The nav follows the page order.

- **Hero:** one `h1` with the name and the role headline, the stack line, a short intro and three square buttons. On wide screens a frosted `profile.yaml` key/value window sits beside it.
- **Work:** each case is a native `<details>` element. The full text is in the server-rendered HTML, so it can be read without JavaScript, found with Ctrl+F and indexed. Opening a case sets the URL hash; loading a hash opens the case and scrolls to it (`src/lib/case-hash.ts`, a small inline script).
- **Terminal:** an optional command line over the page (`help`, `whoami`, `stack`, `goto work`, `theme vice`…). The interpreter in `src/lib/terminal.ts` is a pure function with unit tests, and all output comes from the same typed content as the page. Without JavaScript it is not rendered and nothing is lost.
- **404:** two root layouts need one `global-not-found` page.

## Design system

- Three themes on the same DOM: **Vice** (the default, [ADR 0001](adr/0001-vice-theme.md)), **Dark** and **Light**, chosen with a three-way switch and applied before first paint. Every token pair is contrast-tested in every theme.
- Structure comes from 1px hairlines, tables and square buttons. No shadows, pills or icon tiles. The header, the `profile.yaml` window and the terminal are frosted glass over a static dot grid and grain; without `backdrop-filter` or under `prefers-reduced-transparency` they turn solid.
- JetBrains Mono for the name, headings, nav, labels, keys, dates and tags; IBM Plex Sans for prose; Science Gothic for Vice headings. The type scale never goes below 12px (tested).

## Motion

Inventory and limits are in [ADR 0002](adr/0002-expanded-motion.md). In short: CSS first (transitions, scroll-driven animations, View Transitions, `::details-content`); load motion finishes within 1 s; nothing on the first screen starts faded; the hero buttons never gain glyphs or width (that caused layout shift); everything is off under `prefers-reduced-motion: reduce`. The only JavaScript is the inline `src/lib/card-glide.ts` and a few lines in the theme switch and the terminal.

## SEO

Metadata API with a self-referencing canonical and `hreflang` alternates per locale, JSON-LD `ProfilePage` + `Person`, `sitemap.xml`, `robots.txt` and build-time Open Graph images (`next/og`).

## Security and privacy

- Headers in `next.config.ts`: CSP, HSTS, Referrer-Policy, X-Content-Type-Options, Permissions-Policy.
- The CSP is strict except `script-src 'self' 'unsafe-inline'`: static pages cannot carry nonces, and Next.js inlines per-build scripts. A stricter policy broke hydration.
- Analytics are cookieless and render only when `VERCEL_ENV === 'production'` at build time, so local builds, CI and previews ship no beacons.
- The site has no secrets and no runtime API.
- A privacy note in the footer (`<details id="privacy">`, no JS) states what the site and Vercel collect. The site sets no cookies, so there is no consent banner.

## Quality gates

`.github/workflows/ci.yml` runs on every pull request and on `main`: typecheck, lint, Prettier, unit tests, production build, JS budget, Playwright e2e with axe, and Lighthouse CI against the budgets above (job `check`, the required status check). Two more jobs run alongside it: `workflows` (actionlint and zizmor over `.github/`) and, on pull requests, `dependency-review` (new dependencies with known vulnerabilities fail).

`.github/workflows/prod-check.yml` runs daily against https://yevl.dev: the same e2e suite (`BASE_URL` points Playwright at the live site), Lighthouse budgets (`lighthouserc.prod.json`) and a link check of both locales. CodeQL runs through GitHub's default setup. Dependabot waits seven days after a release before proposing it.
