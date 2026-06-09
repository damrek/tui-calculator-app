import en from './en.json';
import es from './es.json';
import fr from './fr.json';

export type Language = 'en' | 'es' | 'fr';

type TranslationDict = {
  [key: string]: string | TranslationDict;
};

const translations: Record<Language, TranslationDict> = { en, es, fr };

let currentLanguage: Language = 'en';

export function setLanguage(lang: Language): void {
  currentLanguage = lang;
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(key: string, params?: Record<string, string>): string {
  const keys = key.split('.');
  let value: TranslationDict | string | undefined =
    translations[currentLanguage];
  for (const k of keys) {
    if (typeof value === 'string' || value === undefined) {
      return key;
    }
    value = value[k];
  }
  if (typeof value !== 'string') {
    return key;
  }
  if (params) {
    return Object.entries(params).reduce(
      (str, [k, v]) => str.replace(new RegExp(`\\{${k}\\}`, 'g'), v),
      value
    );
  }
  return value;
}

export const languages: Language[] = ['en', 'es', 'fr'];

export function getLanguageName(lang: Language): string {
  return t(`languageSelector.languages.${lang}`);
}
