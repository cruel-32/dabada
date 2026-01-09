import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['ko', 'en'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // Get the locale from the request
  let locale = await requestLocale;
  
  // Use explicit locale if provided, otherwise use requestLocale
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = 'ko'; // default locale
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});

