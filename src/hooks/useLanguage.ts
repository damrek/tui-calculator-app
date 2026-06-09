import { useState, useCallback } from 'react';
import { useInput } from 'ink';
import { loadConfig, saveConfig } from '../utils/config';
import { setLanguage, languages, Language } from '../locales';

export interface UseLanguageReturn {
  language: Language;
  showSelector: boolean;
  selectorIndex: number;
  setSelectorIndex: (index: number) => void;
  onSelectLanguage: () => void;
  onCancelSelector: () => void;
}

export function useLanguage(): UseLanguageReturn {
  const [language, setLanguageState] = useState<Language>(() => {
    const config = loadConfig();
    setLanguage(config.language);
    return config.language;
  });
  const [showSelector, setShowSelector] = useState(false);
  const [selectorIndex, setSelectorIndex] = useState(0);

  const handleSelectLanguage = useCallback(() => {
    const newLang = languages[selectorIndex];
    setLanguage(newLang);
    setLanguageState(newLang);
    saveConfig({ language: newLang });
    setShowSelector(false);
  }, [selectorIndex]);

  const handleCancelSelector = useCallback(() => {
    setShowSelector(false);
  }, []);

  const handleOpenSelector = useCallback(() => {
    const currentIdx = languages.indexOf(language);
    setSelectorIndex(currentIdx >= 0 ? currentIdx : 0);
    setShowSelector(true);
  }, [language]);

  useInput((input, key) => {
    if (key.ctrl && input === 'l') {
      handleOpenSelector();
    }
    if (showSelector) {
      if (key.upArrow) {
        setSelectorIndex((i) => (i + languages.length - 1) % languages.length);
      } else if (key.downArrow) {
        setSelectorIndex((i) => (i + 1) % languages.length);
      } else if (key.return) {
        handleSelectLanguage();
      } else if (key.escape) {
        handleCancelSelector();
      }
    }
  });

  return {
    language,
    showSelector,
    selectorIndex,
    setSelectorIndex,
    onSelectLanguage: handleSelectLanguage,
    onCancelSelector: handleCancelSelector,
  };
}
