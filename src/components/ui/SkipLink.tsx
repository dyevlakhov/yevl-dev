export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#main"
      className="sr-only rounded-[4px] bg-text px-4 py-2 font-mono text-bg no-underline focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
    >
      {label}
    </a>
  );
}
