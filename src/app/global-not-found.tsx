import type { Metadata } from 'next';
import Link from 'next/link';
import { plexSans, jetbrainsMono } from '@/design/fonts';
import { themeBootstrapScript } from '@/lib/theme';
import './globals.css';

export const metadata: Metadata = {
  title: '404 · yevl.dev',
  robots: { index: false },
};

/** One 404 for both locales (two root layouts need global-not-found; docs/architecture.md). */
export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body>
        <main className="mx-auto w-[min(100%-40px,720px)] py-24 font-mono">
          <p className="text-sm text-mark">~/yevl.dev $ cd ./this-page</p>
          <h1 className="text-h1 mt-4">404: not found</h1>
          <p className="mt-4 text-muted">This page does not exist.</p>
          <p lang="uk" className="text-muted">
            Такої сторінки не існує.
          </p>
          <ul className="mt-8 flex flex-wrap gap-2.5">
            <li>
              <Link href="/" className="btn btn-primary">
                cd ~ (English)
              </Link>
            </li>
            <li>
              <Link href="/uk" hrefLang="uk" lang="uk" className="btn">
                cd ~/uk (Українською)
              </Link>
            </li>
          </ul>
        </main>
      </body>
    </html>
  );
}
