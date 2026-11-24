import { describe, expect, test } from 'vitest';
import { getContent } from '@/content';
import { messages } from '@/i18n/messages';
import { COMMANDS, complete, run, terminalContent, type TermContext } from '@/lib/terminal';
import { yearRange } from '@/lib/format';

const ctx = (locale: 'en' | 'uk' = 'en'): TermContext => ({
  locale,
  content: terminalContent(getContent(locale)),
  t: messages[locale].terminal,
});
const text = (r: ReturnType<typeof run>) => r.lines.map((l) => l.text).join('\n');

describe('terminal interpreter', () => {
  test('help lists every command with a description', () => {
    const out = text(run('help', ctx()));
    for (const c of COMMANDS) {
      expect(out).toContain(c);
      expect(messages.en.terminal.help[c]).toBeTruthy();
    }
  });

  test('whoami prints name, title with stack line, and availability', () => {
    const p = getContent('en').profile;
    const out = text(run('whoami', ctx()));
    for (const s of [p.name, `${p.title} · ${p.stackLine}`, p.availability])
      expect(out).toContain(s);
  });

  test('experience prints every role with title and year range', () => {
    const out = text(run('experience', ctx()));
    for (const r of getContent('en').roles) {
      expect(out).toContain(r.company);
      expect(out).toContain(r.title);
      expect(out).toContain(yearRange(r.start, r.end));
    }
  });

  test('stack prints the stack', () => {
    expect(text(run('stack', ctx()))).toContain(getContent('en').profile.stack.join(', '));
  });

  test('contact prints each link as a link line', () => {
    const r = run('contact', ctx());
    expect(r.lines.filter((l) => l.kind === 'link').map((l) => l.href)).toEqual(
      getContent('en').profile.links.map((l) => l.href),
    );
  });

  test('email asks to copy and carries both outcomes, claiming nothing yet', () => {
    const r = run('email', ctx());
    expect(r.lines).toEqual([]);
    expect(r.effect).toMatchObject({ type: 'copy', text: 'yevlakhovdmytro@gmail.com' });
    if (r.effect?.type !== 'copy') throw new Error('expected copy');
    expect(r.effect.done).toContain('yevlakhovdmytro@gmail.com');
    expect(r.effect.failed).toContain('yevlakhovdmytro@gmail.com');
    expect(r.effect.failed).not.toBe(r.effect.done);
  });

  test('terminal content drops what the terminal never prints', () => {
    const slim = terminalContent(getContent('en'));
    expect(Object.keys(slim).sort()).toEqual(['profile', 'roles']);
    expect(slim.roles[0]).not.toHaveProperty('bullets');
  });

  test.each([
    ['cv', '/cv.pdf'],
    ['github', 'https://github.com/dyevlakhov'],
    ['linkedin', 'https://www.linkedin.com/in/dmytroyevlakhov'],
  ])('%s opens %s', (cmd, href) => {
    expect(run(cmd, ctx()).effect).toEqual({ type: 'open', href });
  });

  test('goto scrolls to a known section and rejects others', () => {
    expect(run('goto work', ctx()).effect).toEqual({ type: 'goto', id: 'work' });
    const bad = run('goto nope', ctx());
    expect(bad.effect).toBeUndefined();
    expect(bad.lines[0]?.kind).toBe('err');
  });

  test('goto opens a case by its slug and lists the cases in its usage', () => {
    expect(run('goto unity', ctx()).effect).toEqual({ type: 'goto', id: 'unity' });
    expect(run('goto career-pro', ctx('uk')).effect).toEqual({ type: 'goto', id: 'career-pro' });
    const bad = run('goto nope', ctx());
    expect(bad.lines[0]?.text).toBe(messages.en.terminal.gotoUsage);
    for (const locale of ['en', 'uk'] as const) {
      for (const slug of ['unity', 'meal-planner', 'career-pro']) {
        expect(messages[locale].terminal.gotoUsage).toContain(slug);
      }
    }
  });

  test('clear, theme and lang return effects', () => {
    expect(run('clear', ctx()).effect).toEqual({ type: 'clear' });
    expect(run('theme', ctx()).effect).toEqual({ type: 'theme' });
    expect(run('theme vice', ctx()).effect).toEqual({ type: 'theme', value: 'vice' });
    expect(run('theme  DARK ', ctx()).effect).toEqual({ type: 'theme', value: 'dark' });
    expect(run('theme light', ctx()).lines[0]?.text).toBe('Theme: light.');
    expect(run('theme light', ctx('uk')).lines[0]?.text).toBe('Тема: light.');
    expect(run('lang', ctx()).effect).toEqual({ type: 'lang', href: '/uk' });
    expect(run('lang', ctx('uk')).effect).toEqual({ type: 'lang', href: '/' });
  });

  test('theme with an unknown name prints the usage and changes nothing', () => {
    const bad = run('theme blue', ctx());
    expect(bad.effect).toBeUndefined();
    expect(bad.lines[0]).toEqual({ kind: 'err', text: messages.en.terminal.themeUsage });
  });

  test('help names every theme', () => {
    for (const locale of ['en', 'uk'] as const)
      for (const name of ['vice', 'dark', 'light'])
        expect(messages[locale].terminal.help.theme).toContain(name);
  });

  test('sudo hire dmytro prints lines and opens email', () => {
    const r = run('sudo hire dmytro', ctx());
    expect(r.lines.length).toBeGreaterThan(0);
    expect(r.effect).toEqual({ type: 'open', href: 'mailto:yevlakhovdmytro@gmail.com' });
  });

  test('unknown command prints an error naming the input and pointing to help', () => {
    const r = run('rm -rf /', ctx());
    expect(r.lines).toHaveLength(1);
    expect(r.lines[0]!.kind).toBe('err');
    expect(r.lines[0]!.text).toContain('rm');
    expect(r.lines[0]!.text).toContain('help');
  });

  test('input is trimmed and case-insensitive; empty input prints nothing', () => {
    expect(run('  WhoAmI  ', ctx()).lines.length).toBeGreaterThan(0);
    expect(run('   ', ctx())).toEqual({ lines: [] });
  });

  test('output is localized', () => {
    expect(text(run('whoami', ctx('uk')))).toContain(getContent('uk').profile.availability);
    expect(text(run('help', ctx('uk')))).toContain(messages.uk.terminal.help.whoami);
  });
});

describe('complete', () => {
  test('completes a unique prefix', () => expect(complete('ex')).toEqual(['experience']));
  test('lists all matches for a shared prefix', () =>
    expect(complete('c')).toEqual(['contact', 'cv', 'clear']));
  test('nothing for empty input', () => expect(complete('')).toEqual([]));
});
