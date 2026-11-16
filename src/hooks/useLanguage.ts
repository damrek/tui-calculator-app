import { useState, useCallback } from 'react';
import { useInput } from 'ink';
import { loadConfig, saveConfig } from '../utils/config';
import { setLanguage, languages, Language } from '../locales';

export interface UseLanguageOptions {
  enableHotkey?: boolean;
}

export interface UseLanguageReturn {
  language: Language;
  showSelector: boolean;
  selectorIndex: number;
  setSelectorIndex: (index: number) => void;
  openSelector: () => void;
  onSelectLanguage: () => void;
  onCancelSelector: () => void;
}

export function useLanguage(options?: UseLanguageOptions): UseLanguageReturn {
  const enableHotkey = options?.enableHotkey ?? true;
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
    saveConfig({ ...loadConfig(), language: newLang });
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
    if (enableHotkey && key.ctrl && input === 'l') {
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
    openSelector: handleOpenSelector,
    onSelectLanguage: handleSelectLanguage,
    onCancelSelector: handleCancelSelector,
  };
}
