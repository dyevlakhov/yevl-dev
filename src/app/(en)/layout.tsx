import type { ReactNode } from 'react';
import { localeMetadata, RootDocument } from '@/components/RootDocument';

export const metadata = localeMetadata('en');

export default function EnLayout({ children }: { children: ReactNode }) {
  return <RootDocument locale="en">{children}</RootDocument>;
}
