import { createTranslator } from 'next-intl';
import { locales, type Locale } from '@/i18n';

let messages: any;

export async function getTranslations(locale: Locale) {
  try {
    messages = (await import(`@/messages/${locale}.json`)).default;
  } catch (error) {
    console.error('Failed to load messages for locale:', locale, error);
    // Fallback to English if the requested locale is not found
    messages = (await import(`@/messages/en.json`)).default;
  }

  return createTranslator({ locale, messages });
}
