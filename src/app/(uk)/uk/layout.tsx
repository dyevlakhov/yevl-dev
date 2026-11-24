import type { ReactNode } from 'react';
import { localeMetadata, RootDocument } from '@/components/RootDocument';

export const metadata = localeMetadata('uk');

export default function UkLayout({ children }: { children: ReactNode }) {
  return <RootDocument locale="uk">{children}</RootDocument>;
}
