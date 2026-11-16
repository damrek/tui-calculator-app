import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeSelector } from '../ThemeSelector';
import { getThemeColors, defaultTheme, themeNames } from '../../utils/themes';
import { setLanguage, t } from '../../locales';

describe('ThemeSelector', () => {
  it('should render the title, every theme name and the highlight', () => {
    setLanguage('en');
    const { container } = render(
      <ThemeSelector selectorIndex={0} colors={getThemeColors(defaultTheme)} />
    );

    expect(container.textContent).toContain(t('themeSelector.title'));
    for (const name of themeNames) {
      expect(container.textContent).toContain(
        t(`themeSelector.themes.${name}`)
      );
    }
    expect(container.textContent).toContain('▶');
  });

  it('should show the current theme name', () => {
    setLanguage('en');
    const { container } = render(
      <ThemeSelector selectorIndex={2} colors={getThemeColors(defaultTheme)} />
    );

    expect(container.textContent).toContain(
      t(`themeSelector.themes.${themeNames[2]}`)
    );
    expect(container.textContent).toContain(t('themeSelector.current'));
  });
});
