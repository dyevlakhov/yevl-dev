import type { CSSProperties, ReactNode } from 'react';

export type KeyValueRow = { key: string; value: ReactNode; tone?: 'ok' };

/** A key/value block framed as a small editor window, e.g. profile.yaml. */
export function KeyValue({
  file,
  rows,
  className = '',
  reveal = false,
}: {
  file: string;
  rows: KeyValueRow[];
  className?: string;
  /** Reveal lines once, like typed output (hero only). */
  reveal?: boolean;
}) {
  const motion = reveal ? 'motion-reveal' : '';
  return (
    <div className={`glass overflow-hidden rounded-[6px] border border-rule bg-soft ${className}`}>
      <div
        aria-hidden="true"
        className="kv-bar flex justify-between border-b border-rule px-4 py-2 font-mono text-xs text-mark"
      >
        <span>{file}</span>
        <span>yaml</span>
      </div>
      <dl className="grid gap-x-4 p-4 font-mono text-[0.875rem] leading-relaxed max-[480px]:grid-cols-1 min-[481px]:grid-cols-[7.5rem_1fr] min-[481px]:gap-y-1.5">
        {rows.map((row, i) => (
          <div key={row.key} className="contents" style={{ '--i': i } as CSSProperties}>
            <dt className={`text-mark ${motion}`}>{row.key}</dt>
            <dd
              className={`mb-2.5 min-[481px]:mb-0 ${row.tone === 'ok' ? 'text-ok' : ''} ${motion}`}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
