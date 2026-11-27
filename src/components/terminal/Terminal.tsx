'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { complete, run, type TermContext, type TermEffect, type TermLine } from '@/lib/terminal';
import { nextTheme } from '@/lib/theme';
import { centerOf, currentTheme, setTheme } from '@/lib/theme-client';
import { useHydrated } from '@/lib/use-hydrated';

type Entry = TermLine & { id: number };

const PROMPT = '~/yevl.dev $';
/** Ghost hint (effect 15). Command names stay English in both locales (docs/architecture.md). */
const GHOST_HINT = 'help · whoami · stack';

function isEditable(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
}

function apply(effect: TermEffect, clear: () => void, say: (text: string) => void): void {
  switch (effect.type) {
    case 'clear':
      return clear();
    case 'open':
      if (effect.href.startsWith('http')) window.open(effect.href, '_blank', 'noopener');
      else window.location.href = effect.href;
      return;
    case 'copy':
      if (!navigator.clipboard) return say(effect.failed);
      navigator.clipboard.writeText(effect.text).then(
        () => say(effect.done),
        () => say(effect.failed),
      );
      return;
    case 'goto': {
      const section = document.getElementById(effect.id);
      if (!section) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      section.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      // Move focus too, so keyboard and screen-reader users land where the page scrolled.
      section.setAttribute('tabindex', '-1');
      section.focus({ preventScroll: true });
      // A case target also opens its details. replaceState first, so the toggle handler in
      // src/lib/case-hash.ts sees the hash already set and pushes no extra history entry.
      history.replaceState(null, '', `#${effect.id}`);
      const details = section.querySelector<HTMLDetailsElement>('details[data-case]');
      if (details) details.open = true;
      return;
    }
    case 'theme': {
      // The circle opens from the prompt the command was typed in.
      const prompt = document.getElementById('term-input');
      return setTheme(
        effect.value ?? nextTheme(currentTheme()),
        prompt ? centerOf(prompt) : undefined,
      );
    }
    case 'lang':
      window.location.href = effect.href;
  }
}

/** Interactive layer over the page: the page reads fully without it (docs/architecture.md). */
export function Terminal(ctx: TermContext) {
  const hydrated = useHydrated();
  const inputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [ghost, setGhost] = useState<'idle' | 'play' | 'done'>('idle');
  const nextId = useRef(0);
  const [value, setValue] = useState('');
  const [lines, setLines] = useState<Entry[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const lastMatches = useRef('');
  const t = ctx.t;

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.defaultPrevented || e.isComposing) return;
      const anyModifier = e.metaKey || e.ctrlKey || e.altKey || e.shiftKey;
      const slash = e.key === '/' && !anyModifier && !isEditable(e.target);
      // e.code keeps the shortcut working on non-Latin layouts (Ukrainian: key is "л").
      const cmdK =
        e.code === 'KeyK' &&
        (e.metaKey || e.ctrlKey) &&
        !e.shiftKey &&
        !e.altKey &&
        e.target !== inputRef.current;
      if (!slash && !cmdK) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // The ghost hint types once, the first time the terminal is well inside the viewport.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        setGhost((g) => (g === 'idle' ? 'play' : g));
        io.disconnect();
      },
      { rootMargin: '0px 0px -15% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hydrated]);

  if (!hydrated) return null;

  const print = (entries: TermLine[]) =>
    setLines((prev) => [...prev, ...entries.map((l) => ({ ...l, id: nextId.current++ }))]);

  const submit = () => {
    const input = value;
    lastMatches.current = '';
    setValue('');
    setCursor(null);
    if (!input.trim()) return;
    setHistory((h) => [...h, input]);
    const result = run(input, ctx);
    print([{ kind: 'out', text: `${PROMPT} ${input}` }, ...result.lines]);
    if (result.effect)
      apply(
        result.effect,
        () => setLines([]),
        (text) => print([{ kind: 'out', text }]),
      );
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'Escape') {
      setLines([]);
      setValue('');
      inputRef.current?.blur();
    } else if (e.key === 'Tab' && !e.shiftKey && value.trim()) {
      // Tab completes only when that changes something; otherwise focus moves on as usual.
      const matches = complete(value);
      const single = matches.length === 1 && matches[0] !== value.trim().toLowerCase();
      const list = matches.join('  ');
      if (single) {
        e.preventDefault();
        setValue(matches[0]!);
      } else if (matches.length > 1 && list !== lastMatches.current) {
        e.preventDefault();
        lastMatches.current = list;
        print([{ kind: 'out', text: t.matches.replace('{list}', list) }]);
      }
    } else if (e.key === 'ArrowUp' && history.length > 0) {
      e.preventDefault();
      const i = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(i);
      setValue(history[i]!);
    } else if (e.key === 'ArrowDown' && cursor !== null) {
      e.preventDefault();
      const i = cursor + 1;
      setCursor(i < history.length ? i : null);
      setValue(i < history.length ? history[i]! : '');
    }
  };

  return (
    <section
      ref={sectionRef}
      aria-label={t.label}
      className="term glass rounded-[6px] border border-rule font-mono text-[0.90625rem]"
    >
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        onClick={() => inputRef.current?.focus()}
      >
        <span aria-hidden="true" className="shrink-0 text-mark">
          {PROMPT}
        </span>
        <span className="relative min-w-0 flex-1">
          <input
            ref={inputRef}
            id="term-input"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label={t.inputLabel}
            aria-describedby="term-hint"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className={`w-full bg-transparent text-text outline-none ${value ? '' : 'caret-transparent'}`}
          />
          {value === '' && <span aria-hidden="true" className="motion-cursor term-cursor" />}
          {value === '' && (
            <span
              aria-hidden="true"
              className="term-ghost"
              data-state={ghost}
              onAnimationEnd={(e) => {
                if (e.animationName === 'ghost-caret') setGhost('done');
              }}
            >
              <span className="term-ghost-text">{GHOST_HINT}</span>
            </span>
          )}
        </span>
      </div>
      <p id="term-hint" className="sr-only">
        {t.hint}
      </p>
      <div
        role="log"
        aria-live="polite"
        className={
          lines.length ? 'border-t border-rule px-4 py-3 wrap-anywhere whitespace-pre-wrap' : ''
        }
      >
        {lines.map((l) =>
          l.kind === 'link' ? (
            <div key={l.id}>
              <a
                href={l.href}
                {...(l.href?.startsWith('http')
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                {l.text}
                {l.href?.startsWith('http') && <span className="sr-only"> {t.newTab}</span>}
              </a>
            </div>
          ) : (
            <div key={l.id} className={l.kind === 'err' ? 'text-muted' : ''}>
              {l.kind === 'err' ? `! ${l.text}` : l.text}
            </div>
          ),
        )}
      </div>
      {lines.length === 0 && (
        <p aria-hidden="true" className="hidden px-4 pb-2.5 text-[0.78125rem] text-mark sm:block">
          {t.hint}
        </p>
      )}
    </section>
  );
}
