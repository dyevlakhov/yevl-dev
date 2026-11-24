import type { Content } from '@/content/schema';
import type { Messages } from '@/i18n/messages';
import { Actions } from '@/components/ui/Actions';
import { KeepWords } from '@/components/ui/KeepWords';
import { KeyValue } from '@/components/ui/KeyValue';
import { heroActions } from './actions';

export function Hero({ profile, t }: { profile: Content['profile']; t: Messages }) {
  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="grid items-start gap-8 pt-12 md:pt-16 lg:grid-cols-[1.15fr_1fr] lg:gap-10"
    >
      <div>
        {/* One heading: who, then the role. The role is the visual headline. */}
        <h1 id="hero-title">
          <span className="hero-name block font-mono text-[0.9375rem] font-bold md:text-base">
            {profile.name}
          </span>{' '}
          <span className="text-display mt-4 block max-w-[18em]">
            {/* Words never break inside, so "Full-Stack" stays whole on narrow screens. */}
            <span className="headline">
              <KeepWords text={profile.title} />
            </span>
            {/* Read as "title · stack"; shown as two lines. */}
            <span className="sr-only"> · </span>
            <code className="stack-line mt-1 block font-mono text-[0.66em] font-medium tracking-[-0.03em] text-muted">
              {profile.stackLine}
            </code>
          </span>
        </h1>
        <p className="text-lead measure mt-4 text-muted">{profile.intro}</p>
        <Actions className="mt-6" items={heroActions(profile, t)} newTab={t.newTab} stackOnMobile />
      </div>
      <KeyValue
        file={t.kv.file}
        reveal
        className="lg:mt-2"
        rows={[
          { key: t.kv.status, value: profile.availability, tone: 'ok' },
          { key: t.kv.focus, value: profile.focus.join(', ') },
          { key: t.kv.stack, value: profile.stack.join(', ') },
          { key: t.kv.education, value: profile.education },
        ]}
      />
    </section>
  );
}
