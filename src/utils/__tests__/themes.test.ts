import { describe, it, expect } from 'vitest';
import {
  themeNames,
  defaultTheme,
  isThemeName,
  getThemeColors,
} from '../themes';

describe('themes', () => {
  it('should expose four distinct theme names', () => {
    expect(themeNames).toEqual(['ocean', 'forest', 'sunset', 'mono']);
    expect(new Set(themeNames).size).toBe(themeNames.length);
  });

  it('should include the default theme in the list', () => {
    expect(themeNames).toContain(defaultTheme);
  });

  it('should validate theme names', () => {
    for (const name of themeNames) {
      expect(isThemeName(name)).toBe(true);
    }
    expect(isThemeName('neon')).toBe(false);
    expect(isThemeName('')).toBe(false);
    expect(isThemeName(undefined)).toBe(false);
    expect(isThemeName(3)).toBe(false);
  });

  it('should return a complete color set for every theme', () => {
    for (const name of themeNames) {
      const colors = getThemeColors(name);
      expect(colors.border).toBeTruthy();
      expect(colors.title).toBeTruthy();
      expect(colors.selected).toBeTruthy();
      expect(colors.success).toBeTruthy();
      expect(colors.danger).toBeTruthy();
      expect(colors.warning).toBeTruthy();
    }
  });

  it('should keep the ocean theme as the cyan look', () => {
    expect(getThemeColors('ocean')).toEqual({
      border: 'cyan',
      title: 'cyanBright',
      selected: 'greenBright',
      success: 'green',
      danger: 'red',
      warning: 'yellow',
    });
  });
});
