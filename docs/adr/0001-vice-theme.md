# ADR 0001: Vice theme as the default

- Status: accepted
- Date: 2026-11-23
- Decider: the site owner
- Spec and mockup: in the owner's private design notes (not in this repo)

## Context

The owner wants yevl.dev to stand out during a job search. GTA VI launched on 2026-11-19 with a record $3.79B day one, and brands have been restyling their posts in its Florida-at-dusk palette since September 2026. The live "Code × V3" design is dark, hairline-based and monospace-led (`docs/architecture.md`). Its rules forbid display faces for headings and decorative gradients.

The owner reviewed several mockup rounds. Poster panels, a game HUD, palms and sunset bands were judged "too GTA". A neutral version of the current page with GTA VI–style type and colour was approved, first as an optional third theme. The owner then made it the default.

## Options

- **A. A separate Vice layout** rendered next to the normal page. Most distinctive. It means duplicate markup, two h1s, new copy needing translation, and many new tests. Rejected by the owner.
- **B. A third theme on the same DOM**: tokens, one display font and CSS-only effects. Cheap, and it keeps every test, SEO and accessibility path. The character comes from type and colour only. **Chosen.**
- **C. Vice as an accent layer on top of Dark**, with a second switch. Two independent switches are harder to explain and test. Rejected.

## Decision

Option B, with Vice as the default for everyone, including visitors without JavaScript. Dark (the previous look, unchanged) and Light stay available through a three-way switch (`vice · dark · light`) and the terminal (`theme vice|dark|light`). A stored `dark` or `light` choice is honoured before first paint.

Vice adds only:

- Science Gothic (OFL; self-hosted, one weight, width axis 80–110%, 36 KB) for headings.
- One soft dusk gradient on the role headline.
- 1px dusk lines on the header, the `profile.yaml` bar and the contact card.
- Faint warm radial light on the page and the case tiles.

## Consequences

- One more font file is preloaded on every page, including for visitors who switch to Dark or Light (accepted). A metric-matched fallback (`size-adjust` 121.4%, ascent and descent from the font) keeps the headline block from moving when the font arrives. An e2e test measures this.
- Rule exceptions are scoped to Vice: the display face for headings, the gradients and the one-time horizon-line motion (`docs/architecture.md`, `CLAUDE.md`).
- Isolation: Vice-only CSS lives under a single `:root:not([data-theme='dark'], [data-theme='light'])` prefix in `globals.css`. Utilities read role variables whose fallbacks are the Dark/Light values.
- **To retire Vice:**
  1. Move the Dark tokens back to `:root`.
  2. Delete the Vice block, the font file and its `localFont` call.
  3. Remove `vice` from `THEMES` and from the palette.
- IP boundary: no Rockstar or GTA assets or names (logo, Pricedown, GTAArtDeco, the "VI" mark, characters, Vice City, Leonida). "vice" is only the theme label.
- First impressions now depend on Vice. The neutral level keeps the same order, information and contrast (≥ 4.5:1) as Dark.
