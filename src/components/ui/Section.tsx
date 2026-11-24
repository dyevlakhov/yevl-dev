import type { ReactNode } from 'react';

export function Section({
  id,
  title,
  subtitle,
  className = '',
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}) {
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} className={`mt-16 md:mt-20 ${className}`}>
      <h2 id={headingId} className="text-h2 md-h2">
        {title}
      </h2>
      {subtitle && <p className="text-body measure mt-1 text-muted">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}
