/**
 * Lets text wrap only between words, so hyphenated terms like "Full-Stack" never split across
 * lines (display faces in the Vice theme are wide enough to force such breaks on phones).
 */
export function KeepWords({ text }: { text: string }) {
  return text.split(' ').map((word, i) => (
    <span key={i}>
      {i > 0 && ' '}
      <span className="whitespace-nowrap">{word}</span>
    </span>
  ));
}
