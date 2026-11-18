import { describe, it, expect, beforeEach } from 'vitest';
import {
  t,
  setLanguage,
  getLanguage,
  getLanguageName,
  languages,
} from '../index';
import { themeNames } from '../../utils/themes';

describe('locales', () => {
  beforeEach(() => {
    setLanguage('en');
  });

  it('should return the translation for an existing key', () => {
    expect(t('menu.title')).toBe('Calculator Menu');
  });

  it('should return the key when it does not exist', () => {
    expect(t('menu.nonexistent')).toBe('menu.nonexistent');
  });

  it('should return the first segment when a nested key is missing', () => {
    expect(t('unknown.deep.key')).toBe('unknown.deep.key');
  });

  it('should interpolate parameters', () => {
    expect(t('input.result', { a: '2', op: '+', b: '3', result: '5' })).toBe(
      '2 + 3 = 5'
    );
  });

  it('should replace repeated parameter occurrences', () => {
    expect(t('input.result', { a: '2', op: '+', b: '2', result: '4' })).toBe(
      '2 + 2 = 4'
    );
  });

  it('should switch language with setLanguage', () => {
    setLanguage('es');
    expect(getLanguage()).toBe('es');
    expect(t('menu.title')).toBe('Menú Calculadora');
  });

  it('should expose all languages', () => {
    expect(languages).toEqual(['en', 'es', 'fr', 'de', 'it']);
  });

  it('should switch to german and translate its labels', () => {
    setLanguage('de');
    expect(getLanguage()).toBe('de');
    expect(t('menu.title')).toBe('Rechner-Menü');
    expect(t('menu.expression')).toBe('Freier Ausdruck');
    expect(t('input.firstNumber')).toBe('Erste Zahl');
  });

  it('should switch to italian and translate its labels', () => {
    setLanguage('it');
    expect(getLanguage()).toBe('it');
    expect(t('menu.title')).toBe('Menu Calcolatrice');
    expect(t('menu.expression')).toBe('Espressione libera');
    expect(t('input.firstNumber')).toBe('Primo numero');
  });

  it('should return the localized language name in german and italian', () => {
    setLanguage('de');
    expect(getLanguageName('de')).toBe('Deutsch');
    expect(getLanguageName('it')).toBe('Italienisch');
    setLanguage('it');
    expect(getLanguageName('de')).toBe('Tedesco');
    expect(getLanguageName('it')).toBe('Italiano');
  });

  it('should return the localized language name', () => {
    setLanguage('es');
    expect(getLanguageName('es')).toBe('Español');
  });

  it('should include expression keys in translations', () => {
    expect(t('menu.expression')).toBe('Free expression');
    expect(t('input.errorInvalidExpression')).toBe('Error: invalid expression');
  });

  it('should translate every language name in every language', () => {
    for (const language of languages) {
      setLanguage(language);
      for (const code of languages) {
        expect(getLanguageName(code)).not.toBe(
          `languageSelector.languages.${code}`
        );
      }
    }
  });

  it('should translate theme names in every language', () => {
    for (const language of languages) {
      setLanguage(language);
      for (const theme of themeNames) {
        const key = `themeSelector.themes.${theme}`;
        expect(t(key)).not.toBe(key);
      }
      expect(t('themeSelector.title')).not.toBe('themeSelector.title');
      expect(t('themeSelector.help')).not.toBe('themeSelector.help');
      expect(t('themeSelector.hint')).not.toBe('themeSelector.hint');
    }
  });

  it('should translate the clear-history label and its feedback in every language', () => {
    for (const language of languages) {
      setLanguage(language);
      expect(t('menu.clearHistory')).not.toBe('menu.clearHistory');
      expect(t('menu.historyCleared')).not.toBe('menu.historyCleared');
    }
  });
});
