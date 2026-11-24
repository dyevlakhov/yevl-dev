# yevl.dev

Personal website of Dmytro Yevlakhov. One static landing page in English (`/`, default) and Ukrainian (`/uk`).

@AGENTS.md

@private/CLAUDE.md

- Architecture: `docs/architecture.md`. Decisions: `docs/adr/` (add new ADRs there).
- `private/` is the owner's private notes, a separate git repository that this repo ignores. It may be absent; nothing in the build depends on it. Never copy its content into tracked files.
- Next.js 16 differs from older versions. Read `node_modules/next/dist/docs/` before using an API.

## Commands

```
pnpm dev          # local dev server
pnpm typecheck    # tsc --noEmit
pnpm lint         # eslint
pnpm format:check # prettier
pnpm test         # vitest (unit)
pnpm build        # production build
pnpm e2e          # playwright + axe
pnpm lhci         # lighthouse budgets
```

## Rules

- Two locales, both fully static: English (default) at `/`, Ukrainian at `/uk`. No automatic language redirect. No i18n library. Ukrainian copy is a faithful translation that the owner approves before merge. Company names, job titles, technology names and `/cv.pdf` stay in English in both locales.
- Content comes from the owner. Never invent facts, metrics or employer details. Former employers stay at CV level: no internal service names, metrics, customers or infrastructure.
- No location, country or UTC offset anywhere (UI, metadata, JSON-LD). Availability text: "Open to remote roles · Flexible across time zones" (UK: "Відкритий до віддаленої роботи · Працюю з будь-якими часовими поясами").
- Education: "Computer Software Engineering · Kharkiv National University of Radio Electronics". No dates, no completion status, no `alumniOf` in JSON-LD.
- Contact: email `yevlakhovdmytro@gmail.com`, LinkedIn `https://www.linkedin.com/in/dmytroyevlakhov`, GitHub `https://github.com/dyevlakhov`. No photo.
- Positioning: "Senior Full-Stack Engineer" with "React, Next.js & Node.js" as the hero headline; "7+ years of commercial software development" (never years per technology). Page order: hero, career, work, expertise, experience, how I work, terminal, contact; the nav follows it.
- Copy style: few em dashes (none in content, tested), no "not X, but Y" formulas, no slogans.
- Visual direction "Code × V3" with three themes (`docs/architecture.md`): Vice by default for everyone (ADR 0001), Dark and Light via the three-way switch. Vice is a scoped exception: Science Gothic headings, one dusk gradient on the headline, 1px dusk lines and faint warm light; no Rockstar/GTA assets or names. Otherwise no shadows, glows, pills or icon tiles; hairlines and square buttons. Frosted glass only on the header, the `profile.yaml` window and the terminal, over a static dot grid and grain. Nothing below 12px. Fonts: JetBrains Mono for name, headings, nav, labels, keys, dates, tags; IBM Plex Sans for prose; Science Gothic for Vice headings (`src/assets/fonts/README.md`). Self-hosted via `next/font`; no runtime requests to Google.
- Terminal: an enhancement over the page, never a replacement. The interpreter (`src/lib/terminal.ts`) is pure and unit-tested; all output comes from typed content.
- Motion (ADR 0002): CSS first; the only JS is `src/lib/card-glide.ts` (inline) and a few lines in `setTheme` and `Terminal`. Load motion ≤ 1 s, nothing on the first screen starts part-faded, nothing moves longer than 5 s without input. Never add glyphs or width to the hero CTAs (CLS). Fully disabled under `prefers-reduced-motion: reduce`.
- Budgets: client JS < 180 KB gzip total; Lighthouse ≥ 95 in all categories; CLS < 0.05; LCP < 1.5 s (lab).
- WCAG 2.2 AA: text contrast ≥ 4.5:1 in every theme (vice, dark, light); visible focus; skip link.
- No third-party scripts. Exception: Vercel Web Analytics and Speed Insights, same-origin (`/_vercel/*`), rendered only in Vercel production builds.
- No paid APIs or AI features without the owner's cost approval.
- Copy rules that would reveal private details live in `private/guard-terms.json` (CI: the `GUARD_TERMS` secret), read by `tests/guard-terms.ts`. Never write those terms into tracked files, including tests, comments, commit messages and PR descriptions.
