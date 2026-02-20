import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dabada.cloudish.cloud';
  
  // Supported locales
  const locales = ['en', 'ko'];
  
  const routes = locales.flatMap(locale => [
    {
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/${locale}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
  ]);

  // Root redirect is handled by middleware but good to include root if it renders something or redirects
  const root = {
    url: `${baseUrl}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1,
  };

  return [root, ...routes];
}
