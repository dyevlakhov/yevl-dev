# ADR 0002: Expanded motion and hover effects

- Status: accepted
- Date: 2026-11-24
- Decider: the site owner
- Spec and mockup: in the owner's private design notes (not in this repo)

## Context

The owner found the site static. They position themselves as a senior engineer with a strong frontend side and want the page to show that craft. The motion rules from 2026-11-15 allowed only five restrained movements (`docs/architecture.md`). The owner reviewed a mockup of 17 candidate effects on the live page and picked 13, with the gliding card fill as the hover style.

## Options

- **A. CSS first:** transitions, scroll-driven animations, View Transitions and `::details-content`, plus one small inline script and a few lines in existing client components. No bundle growth, and everything degrades to the previous page. **Chosen.**
- **B. A motion library** (Motion, GSAP). Uniform API and wide support. 15–60 KB gzip against 2.6 KB of budget headroom, and it hides the platform craft. Rejected.
- **C. Hand-written JS** (IntersectionObserver reveals, scroll listeners). Works everywhere. More JS, content hidden until scripts run, main-thread scroll work. Rejected.

## Decision

Option A. The effect inventory and its limits are in this ADR and `docs/architecture.md`. Load motion finishes within 1 s, nothing moves longer than 5 s without input, everything is off under reduced motion, and the resting page is the end state.

## Consequences

- **Browser tiers.**
  - Chromium gets everything.
  - Safari 26 gets everything except the smooth case expand (`interpolate-size`).
  - Firefox gets the scroll-driven effects (progress line, current section, settle-in) only where scroll timelines ship; elsewhere the page is the static one.
- **Budget.** `tests/unit/bundle.test.ts` counts external scripts only. The new inline glide script is 842 bytes and has its own size test (< 1.5 KB).
- **Hydration.** Inline scripts must not change the DOM structure before hydration; React 19 re-renders the tree on extra nodes. The glide fill is server-rendered, and the script only listens and moves it.
- **Contrast while animating.** Text on or near the first screen never fades: axe and Lighthouse audit it at load. The career years type in with `clip-path` for this reason, and the work section does not settle in.
- **Layout stability.** The hero CTA row fits one line only just, so no effect may add glyphs or width to it (a "↓" measured CLS 0.063). `pnpm perf:cold <url> [--3g]` checks cold-load CLS.
- **To retire an effect:** each lives in its own commented block in `src/app/globals.css`. #12 is the `origin` argument of `setTheme`, #15 the ghost in `Terminal.tsx`, #16 `src/lib/card-glide.ts` and the two `[data-glide]` wrappers.
