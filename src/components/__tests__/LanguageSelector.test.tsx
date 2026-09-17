import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LanguageSelector } from '../LanguageSelector';
import { setLanguage } from '../../locales';

describe('LanguageSelector', () => {
  it('should render the title and highlight the selected language', () => {
    setLanguage('en');
    const { container } = render(<LanguageSelector selectorIndex={1} />);

    expect(container.textContent).toContain('Select Language');
    expect(container.textContent).toContain('Español');
    expect(container.textContent).toContain('▶');
  });
});
