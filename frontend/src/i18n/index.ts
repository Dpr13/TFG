import es from './es';
import en from './en';
import type { Translations } from './es';

export type Language = 'es' | 'en' | 'gr';

const translations: Record<Language, Translations> = { es, en, gr };

export function getTranslations(lang: Language): Translations {
  return translations[lang] || translations.es;
}

export type { Translations };
