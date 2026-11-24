Font files in this folder.

## Open Graph images (build time only, `next/og`)

- JetBrains Mono (400, 700; latin, cyrillic) — SIL Open Font License 1.1, © The JetBrains Mono Project Authors.
- IBM Plex Sans (600; latin, cyrillic) — SIL Open Font License 1.1, © IBM Corp.

Source: Fontsource builds (cdn.jsdelivr.net/fontsource), fetched 2026-11-15. The site itself loads these two through `next/font/google`.

## Site: Vice theme headings (`science-gothic-vice.woff2`)

Science Gothic, SIL Open Font License 1.1, Copyright 2024 Font Detective LLC / The Science Gothic Project Authors (https://github.com/googlefonts/science-gothic). Loaded by `src/components/RootDocument.tsx` through `next/font/local` (ADR 0001). Budget: ≤ 60 KB (tests/unit/font-file.test.ts); built size 36 KB.

Built on 2026-11-23 from `ofl/sciencegothic/ScienceGothic[CTRS,slnt,wdth,wght].ttf` in google/fonts at commit `2c5cc65841a5cde120f954e9e7a5a905cd1bf923`, with fontTools:

```bash
fonttools varLib.instancer "ScienceGothic[CTRS,slnt,wdth,wght].ttf" wght=700 wdth=80:110 CTRS=0 slnt=0 -o sg-700.ttf
pyftsubset sg-700.ttf --flavor=woff2 --layout-features='kern,liga,calt' \
  --unicodes='U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD,U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116' \
  --output-file=science-gothic-vice.woff2
```

The result keeps one weight (700) and the width axis (80–110%), latin + cyrillic. The fallback `@font-face` in `src/app/globals.css` is tuned to it (size-adjust 121.4%, ascent 89.6%, descent 32%).

## Licenses

All three families are under the SIL Open Font License 1.1. The full license text with each family's copyright line is in [`licenses/`](licenses/). The OFL, not the repository's MIT license, applies to the font files.
