import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { en: SITE_URL, uk: `${SITE_URL}/uk` };
  return [
    { url: SITE_URL, alternates: { languages } },
    { url: `${SITE_URL}/uk`, alternates: { languages } },
  ];
}
