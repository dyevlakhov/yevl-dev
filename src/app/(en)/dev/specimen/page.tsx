import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { palette } from '@/design/tokens';
import { isSpecimenEnabled } from '@/lib/env';
import { Container } from '@/components/ui/Container';
import { KeyValue } from '@/components/ui/KeyValue';
import { Section } from '@/components/ui/Section';

export const metadata: Metadata = { title: 'Specimen', robots: { index: false } };

export default function SpecimenPage() {
  if (!isSpecimenEnabled(process.env)) notFound();

  return (
    <Container as="main" id="main" className="pb-24">
      <h1 className="text-h1 mt-14">Design system specimen</h1>

      <Section id="colour" title="colour" subtitle="Dark values; switch theme to see light.">
        <KeyValue
          file="tokens.css"
          rows={Object.keys(palette.dark).map((name) => ({
            key: name,
            value: (
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block size-4 rounded-[2px] border border-rule"
                  style={{ background: `var(--${name})` }}
                />
                var(--{name})
              </span>
            ),
          }))}
        />
      </Section>

      <Section
        id="type"
        title="type"
        subtitle="JetBrains Mono for structure, IBM Plex Sans for prose."
      >
        <p className="text-h1">Dmytro Yevlakhov</p>
        <p className="text-display mt-6">I build product systems end to end.</p>
        <p className="text-h2 md-h2 mt-6">experience</p>
        <p className="text-h3 mt-6">Monetization platform for game developers</p>
        <p className="text-lead measure mt-6">I build product systems end to end.</p>
        <p className="text-body measure mt-4">
          Body text stays within 40em so lines remain comfortable on every screen size.
        </p>
        <p className="text-label mt-4 text-muted">11/2022 – 10/2026</p>
      </Section>
    </Container>
  );
}
