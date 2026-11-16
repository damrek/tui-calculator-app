import { useState, useCallback } from 'react';
import { useInput } from 'ink';
import { loadConfig, saveConfig } from '../utils/config';
import { themeNames, getThemeColors } from '../utils/themes';
import type { ThemeName, ThemeColors } from '../utils/themes';

export interface UseThemeOptions {
  enableHotkey?: boolean;
}

export interface UseThemeReturn {
  theme: ThemeName;
  colors: ThemeColors;
  showSelector: boolean;
  selectorIndex: number;
  setSelectorIndex: (index: number) => void;
  openSelector: () => void;
  onSelectTheme: () => void;
  onCancelSelector: () => void;
}

export function useTheme(options?: UseThemeOptions): UseThemeReturn {
  const enableHotkey = options?.enableHotkey ?? true;
  const [theme, setThemeState] = useState<ThemeName>(() => loadConfig().theme);
  const [showSelector, setShowSelector] = useState(false);
  const [selectorIndex, setSelectorIndex] = useState(0);

  const handleSelectTheme = useCallback(() => {
    const newTheme = themeNames[selectorIndex];
    setThemeState(newTheme);
    saveConfig({ ...loadConfig(), theme: newTheme });
    setShowSelector(false);
  }, [selectorIndex]);

  const handleCancelSelector = useCallback(() => {
    setShowSelector(false);
  }, []);

  const handleOpenSelector = useCallback(() => {
    const currentIdx = themeNames.indexOf(theme);
    setSelectorIndex(currentIdx >= 0 ? currentIdx : 0);
    setShowSelector(true);
  }, [theme]);

  useInput((input, key) => {
    if (enableHotkey && key.ctrl && input === 't') {
      handleOpenSelector();
    }
    if (showSelector) {
      if (key.upArrow) {
        setSelectorIndex(
          (i) => (i + themeNames.length - 1) % themeNames.length
        );
      } else if (key.downArrow) {
        setSelectorIndex((i) => (i + 1) % themeNames.length);
      } else if (key.return) {
        handleSelectTheme();
      } else if (key.escape) {
        handleCancelSelector();
      }
    }
  });

  return {
    theme,
    colors: getThemeColors(theme),
    showSelector,
    selectorIndex,
    setSelectorIndex,
    openSelector: handleOpenSelector,
    onSelectTheme: handleSelectTheme,
    onCancelSelector: handleCancelSelector,
  };
}
