import type { ElementType, ReactNode } from 'react';

/** Page width: min(100% − 2·20px, 1080px). */
export function Container({
  as: Tag = 'div',
  children,
  className = '',
  ...rest
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <Tag {...rest} className={`mx-auto w-[min(100%-40px,1080px)] ${className}`}>
      {children}
    </Tag>
  );
}
