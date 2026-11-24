import type { ReactNode } from 'react';

/* Case diagrams: inline SVG in tile tokens; dashed paths animate briefly (docs/architecture.md). */

function Svg({
  label,
  viewBox,
  children,
}: {
  label: string;
  viewBox: string;
  children: ReactNode;
}) {
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={viewBox}
      className="h-auto w-full max-w-[400px]"
      fontFamily="var(--font-mono)"
    >
      {children}
    </svg>
  );
}

const box = { fill: 'none', rx: 4 } as const;

/** Unity case: generic boxes only (dashboards, API, services over gRPC, an SQS queue and a worker). */
export function ArchitectureDiagram({ label }: { label: string }) {
  return (
    <Svg label={label} viewBox="0 0 420 200">
      <g fontSize="11">
        <rect x="20" y="24" width="112" height="60" {...box} stroke="var(--tileText)" />
        <text x="32" y="44" fill="var(--tileText)">
          dashboards
        </text>
        <path d="M32 72 l14-10 l14 6 l14-14 l14 8 l14-6" stroke="var(--green)" fill="none" />
        <rect x="170" y="24" width="90" height="32" {...box} stroke="var(--tileText)" />
        <text x="204" y="44" fill="var(--tileText)">
          API
        </text>
        <rect x="300" y="24" width="100" height="32" {...box} stroke="var(--tileRule)" />
        <text x="318" y="44" fill="var(--tileMuted)">
          SQS queue
        </text>
        <rect x="170" y="116" width="90" height="32" {...box} stroke="var(--tileRule)" />
        <text x="182" y="136" fill="var(--tileMuted)">
          service B
        </text>
        <rect x="300" y="116" width="100" height="32" {...box} stroke="var(--tileRule)" />
        <text x="330" y="136" fill="var(--tileMuted)">
          worker
        </text>
        <path className="motion-flow" fill="none" d="M132 40 H170" stroke="var(--tileText)" />
        <path className="motion-flow" fill="none" d="M260 40 H300" stroke="var(--tileMuted)" />
        <path className="motion-flow" fill="none" d="M215 56 V116" stroke="var(--blue)" />
        <text x="222" y="92" fill="var(--blue)">
          gRPC
        </text>
        <path className="motion-flow" fill="none" d="M350 56 V116" stroke="var(--tileMuted)" />
        <text x="20" y="186" fill="var(--tileMuted)">
          terraform · circleci · github actions
        </text>
      </g>
    </Svg>
  );
}

const commits: [string, string][] = [
  ['var(--amber)', 'adr: freeze web client, go Expo'],
  ['var(--amber)', 'feat: AI recipe generation'],
  ['var(--amber)', 'docs: architecture decision records'],
  ['var(--green)', 'test: backup restore'],
];

export function DecisionsDiagram({ label }: { label: string }) {
  return (
    <Svg label={label} viewBox="0 0 420 180">
      <g fontSize="12">
        <text x="24" y="34" fill="var(--tileMuted)">
          $ git log --oneline
        </text>
        <path className="motion-flow" fill="none" d="M28 66 V146" stroke="var(--tileRule)" />
        {commits.map(([color, text], i) => (
          <g key={text}>
            <circle cx="28" cy={62 + i * 27} r="4" fill={color} />
            <text x="44" y={66 + i * 27} fill="var(--tileText)">
              {text}
            </text>
          </g>
        ))}
      </g>
    </Svg>
  );
}

export function ReleaseDiagram({ label }: { label: string }) {
  return (
    <Svg label={label} viewBox="0 0 420 150">
      <g fontSize="12">
        <rect x="16" y="54" width="78" height="34" {...box} stroke="var(--tileText)" />
        <text x="40" y="75" fill="var(--tileText)">
          test
        </text>
        <rect x="124" y="54" width="78" height="34" {...box} stroke="var(--tileText)" />
        <text x="145" y="75" fill="var(--tileText)">
          build
        </text>
        <rect x="232" y="22" width="170" height="34" {...box} stroke="var(--tileRule)" />
        <text x="262" y="43" fill="var(--tileMuted)">
          App Store
        </text>
        <rect x="232" y="88" width="170" height="34" {...box} stroke="var(--tileRule)" />
        <text x="262" y="109" fill="var(--tileMuted)">
          Google Play
        </text>
        <path className="motion-flow" fill="none" d="M94 71 H124" stroke="var(--green)" />
        <path
          className="motion-flow"
          fill="none"
          d="M202 71 H216 V39 H232"
          stroke="var(--tileMuted)"
        />
        <path className="motion-flow" fill="none" d="M216 71 V105 H232" stroke="var(--tileMuted)" />
      </g>
    </Svg>
  );
}
