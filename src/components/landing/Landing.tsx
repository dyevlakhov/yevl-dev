import { getContent } from '@/content';
import type { Locale } from '@/i18n/locales';
import { messages } from '@/i18n/messages';
import { Container } from '@/components/ui/Container';
import { profileJsonLd, serializeJsonLd } from '@/lib/jsonld';
import { Terminal } from '@/components/terminal/Terminal';
import { terminalContent } from '@/lib/terminal';
import { cardGlideScript } from '@/lib/card-glide';
import { CareerStrip } from './CareerStrip';
import { Contact } from './Contact';
import { Experience } from './Experience';
import { ExpertiseGrid } from './ExpertiseGrid';
import { Footer } from './Footer';
import { Hero } from './Hero';
import { HowIWork } from './HowIWork';
import { WorkList } from './WorkList';

export function Landing({ locale }: { locale: Locale }) {
  const content = getContent(locale);
  const t = messages[locale];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(profileJsonLd(locale, content)) }}
      />
      <Container as="main" id="main">
        <Hero profile={content.profile} t={t} />
        <CareerStrip roles={content.roles} t={t} />
        <WorkList
          cases={content.cases}
          also={content.also}
          profile={content.profile}
          locale={locale}
          t={t}
        />
        <ExpertiseGrid areas={content.areas} t={t} />
        <Experience roles={content.roles} t={t} />
        <HowIWork principles={content.principles} t={t} />
        {/* The slot reserves the terminal's height on scripted pages, so hydration does not shift the layout. */}
        <div className="term-slot mt-16 md:mt-20">
          <Terminal content={terminalContent(content)} t={t.terminal} locale={locale} />
        </div>
        <Contact profile={content.profile} t={t} />
        {/* After both grids, so they exist when it runs (effect 16). */}
        <script dangerouslySetInnerHTML={{ __html: cardGlideScript }} />
      </Container>
      <Footer profile={content.profile} t={t} />
    </>
  );
}
