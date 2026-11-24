import type { CaseSlug, Content, Profile, Role } from '@/content/schema';
import { localePath, type Locale } from '@/i18n/locales';
import type { Messages, TerminalCommand } from '@/i18n/messages';
import { yearRange } from '@/lib/format';
import { isTheme, type Theme } from '@/lib/theme';

/** Only what the terminal prints, so the client component gets a small payload. */
export type TermContent = { profile: Profile; roles: Omit<Role, 'bullets'>[] };
export type TermContext = { content: TermContent; t: Messages['terminal']; locale: Locale };

export function terminalContent(content: Content): TermContent {
  return {
    profile: content.profile,
    roles: content.roles.map(({ company, title, start, end }) => ({ company, title, start, end })),
  };
}
export type TermLine = { kind: 'out' | 'err' | 'link'; text: string; href?: string };
export type SectionId = 'expertise' | 'work' | 'experience' | 'contact';
export type GotoTarget = SectionId | CaseSlug;
export type TermEffect =
  | { type: 'clear' }
  | { type: 'open'; href: string }
  | { type: 'copy'; text: string; done: string; failed: string }
  | { type: 'goto'; id: GotoTarget }
  | { type: 'theme'; value?: Theme } // no value: next theme in switch order
  | { type: 'lang'; href: string };
export type TermResult = { lines: TermLine[]; effect?: TermEffect };

/** Order matters: `help` prints in this order and completion lists matches in it. */
export const COMMANDS: readonly TerminalCommand[] = [
  'help',
  'whoami',
  'experience',
  'stack',
  'contact',
  'email',
  'cv',
  'github',
  'linkedin',
  'goto',
  'lang',
  'theme',
  'clear',
];

const GOTO_TARGETS: readonly GotoTarget[] = [
  'expertise',
  'work',
  'experience',
  'contact',
  'unity',
  'meal-planner',
  'career-pro',
];

const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, k: string) => values[k] ?? '');

const out = (text: string): TermLine => ({ kind: 'out', text });
const err = (text: string): TermLine => ({ kind: 'err', text });

/** Pure interpreter: maps one input line to output lines and at most one side effect. */
export function run(input: string, { content, t, locale }: TermContext): TermResult {
  const normalized = input.trim().replace(/\s+/g, ' ').toLowerCase();
  if (!normalized) return { lines: [] };

  const { profile } = content;
  const href = (label: 'Email' | 'CV' | 'LinkedIn' | 'GitHub') =>
    profile.links.find((l) => l.label === label)!.href;
  const open = (target: string, url: string): TermResult => ({
    lines: [out(fill(t.opening, { target }))],
    effect: { type: 'open', href: url },
  });

  if (normalized === 'sudo hire dmytro') {
    return {
      lines: [out(t.hirePassword), out(t.hireGranted)],
      effect: { type: 'open', href: href('Email') },
    };
  }

  const [cmd = '', arg] = normalized.split(' ');
  switch (cmd as TerminalCommand) {
    case 'help': {
      const width = Math.max(...COMMANDS.map((c) => c.length)) + 2;
      return {
        lines: [out(t.helpHeader), ...COMMANDS.map((c) => out(`  ${c.padEnd(width)}${t.help[c]}`))],
      };
    }
    case 'whoami':
      return {
        lines: [
          out(profile.name),
          out(`${profile.title} · ${profile.stackLine}`),
          out(profile.availability),
        ],
      };
    case 'experience':
      return {
        lines: content.roles.map((r) =>
          out(`${yearRange(r.start, r.end).padEnd(11)}${r.company} · ${r.title}`),
        ),
      };
    case 'stack':
      return { lines: [out(profile.stack.join(', '))] };
    case 'contact':
      return {
        lines: profile.links.map((l) => ({
          kind: 'link',
          text: `${l.label.toLowerCase().padEnd(10)}${l.href.replace(/^mailto:/, '')}`,
          href: l.href,
        })),
      };
    case 'email':
      // The outcome is printed only after the clipboard answers (it can refuse).
      return {
        lines: [],
        effect: {
          type: 'copy',
          text: profile.email,
          done: fill(t.copied, { email: profile.email }),
          failed: fill(t.copyFailed, { email: profile.email }),
        },
      };
    case 'cv':
      return open('cv.pdf', href('CV'));
    case 'github':
      return open('GitHub', href('GitHub'));
    case 'linkedin':
      return open('LinkedIn', href('LinkedIn'));
    case 'goto': {
      const id = GOTO_TARGETS.find((s) => s === arg);
      if (!id) return { lines: [err(t.gotoUsage)] };
      return { lines: [out(fill(t.going, { id }))], effect: { type: 'goto', id } };
    }
    case 'lang':
      return {
        lines: [out(t.lang)],
        effect: { type: 'lang', href: localePath(locale === 'en' ? 'uk' : 'en') },
      };
    case 'theme':
      if (!arg) return { lines: [out(t.theme)], effect: { type: 'theme' } };
      // Theme names stay English in both locales, like command names.
      if (!isTheme(arg)) return { lines: [err(t.themeUsage)] };
      return {
        lines: [out(fill(t.themeSet, { name: arg }))],
        effect: { type: 'theme', value: arg },
      };
    case 'clear':
      return { lines: [], effect: { type: 'clear' } };
    default:
      return { lines: [err(fill(t.notFound, { cmd }))] };
  }
}

/** Command names that start with the typed prefix. */
export function complete(prefix: string): string[] {
  const p = prefix.trim().toLowerCase();
  return p ? COMMANDS.filter((c) => c.startsWith(p)) : [];
}
