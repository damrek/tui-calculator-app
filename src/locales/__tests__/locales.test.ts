import { describe, it, expect, beforeEach } from 'vitest';
import {
  t,
  setLanguage,
  getLanguage,
  getLanguageName,
  languages,
} from '../index';

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
    expect(languages).toEqual(['en', 'es', 'fr']);
  });

  it('should return the localized language name', () => {
    setLanguage('es');
    expect(getLanguageName('es')).toBe('Español');
  });

  it('should include expression keys in translations', () => {
    expect(t('menu.expression')).toBe('Free expression');
    expect(t('input.errorInvalidExpression')).toBe('Error: invalid expression');
  });
});
