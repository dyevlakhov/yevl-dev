import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Some copy rules name the very things they keep off the site (private projects, details under
 * NDA). Those patterns live outside this public repo: in `private/guard-terms.json` (the owner's
 * private notes) or in the `GUARD_TERMS` environment variable (a CI secret with the same JSON).
 * Without either, the tests that need them are skipped; the public rules still run.
 *
 * Shape: { "<group>": ["/pattern/flags", …] }. Groups: `content` (every content and UI string and
 * every case body), `unity` (the Unity case body and card), `careerPro` (the Career PRO case
 * body), `unityDiagram` (plain words that must not appear in the Unity diagram).
 */
export type GuardGroup = 'content' | 'unity' | 'careerPro' | 'unityDiagram';
type GuardTerms = Partial<Record<GuardGroup, string[]>>;

function load(): GuardTerms | null {
  const file = join(process.cwd(), 'private/guard-terms.json');
  const raw = process.env.GUARD_TERMS || (existsSync(file) ? readFileSync(file, 'utf8') : '');
  return raw ? (JSON.parse(raw) as GuardTerms) : null;
}

export const guardTerms = load();

/** Patterns of one group as RegExps; "/x/i" keeps its flags, a bare string matches literally. */
export function guardPatterns(group: GuardGroup): RegExp[] {
  return (guardTerms?.[group] ?? []).map((entry) => {
    const m = entry.match(/^\/([\s\S]+)\/([a-z]*)$/);
    return m ? new RegExp(m[1]!, m[2]) : new RegExp(entry.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  });
}

/** Plain words of one group (for Playwright text checks). */
export function guardWords(group: GuardGroup): string[] {
  return guardTerms?.[group] ?? [];
}
