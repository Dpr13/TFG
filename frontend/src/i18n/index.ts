import es from './es';
import en from './en';
import de from './de';
import fr from './fr';
import type { Translations } from './es';

export type Language = 'es' | 'en' | 'de' | 'fr';

const translations: Record<Language, Translations> = { es, en, de, fr };

export function getTranslations(lang: Language): Translations {
  return translations[lang] || translations.es;
}

export type { Translations };
