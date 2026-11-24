import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { getContent } from '@/content';
import type { Locale } from '@/i18n/locales';
import { palette } from '@/design/tokens';
import { yearRange } from '@/lib/format';

export const ogSize = { width: 1200, height: 630 };

const font = (file: string) => readFile(join(process.cwd(), 'src/assets/fonts', file));

// Loaded at module scope (as in the Next.js docs) so the images stay statically generated.
const [mono4l, mono4c, mono7l, mono7c, sans6l, sans6c] = await Promise.all([
  font('jetbrains-mono-latin-400.woff'),
  font('jetbrains-mono-cyrillic-400.woff'),
  font('jetbrains-mono-latin-700.woff'),
  font('jetbrains-mono-cyrillic-700.woff'),
  font('ibm-plex-sans-latin-600.woff'),
  font('ibm-plex-sans-cyrillic-600.woff'),
]);

/** 1200×630 link preview in the site's dark style, rendered at build time. */
export function profileCard(locale: Locale) {
  const { profile, roles } = getContent(locale);
  const p = palette.dark;
  // Each subset file gets its own family name; the family lists fall back glyph by glyph.
  const mono = 'JBMono, JBMonoCyr';
  const sans = 'PlexSans, PlexSansCyr';
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: p.bg,
        color: p.text,
        padding: '56px 64px',
        fontFamily: mono,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 32,
          fontSize: 24,
          color: p.mark,
        }}
      >
        <span style={{ color: p.text, fontWeight: 700 }}>yevl.dev</span>
        <span style={{ color: p.ok, fontSize: 20 }}>{profile.availability}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -2 }}>{profile.name}</div>
        <div
          style={{ fontSize: 28, color: p.muted, marginTop: 8 }}
        >{`${profile.title} · ${profile.stackLine}`}</div>
        <div
          style={{
            fontFamily: sans,
            fontSize: 40,
            fontWeight: 600,
            lineHeight: 1.2,
            marginTop: 32,
            maxWidth: 1000,
          }}
        >
          {profile.intro.split(/(?<=\.)\s/)[0]}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          gap: 28,
          fontSize: 22,
          color: p.muted,
          borderTop: `1px solid ${p.rule}`,
          paddingTop: 24,
        }}
      >
        {roles.map((r) => (
          <span key={r.company} style={{ display: 'flex', gap: 10 }}>
            <span style={{ color: p.text, fontWeight: 700 }}>{r.company}</span>
            <span style={{ color: p.mark }}>{yearRange(r.start, r.end)}</span>
          </span>
        ))}
      </div>
    </div>,
    {
      ...ogSize,
      fonts: [
        { name: 'JBMono', data: mono4l, weight: 400, style: 'normal' },
        { name: 'JBMonoCyr', data: mono4c, weight: 400, style: 'normal' },
        { name: 'JBMono', data: mono7l, weight: 700, style: 'normal' },
        { name: 'JBMonoCyr', data: mono7c, weight: 700, style: 'normal' },
        { name: 'PlexSans', data: sans6l, weight: 600, style: 'normal' },
        { name: 'PlexSansCyr', data: sans6c, weight: 600, style: 'normal' },
      ],
    },
  );
}
