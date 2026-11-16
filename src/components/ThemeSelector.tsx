import React from 'react';
import { Box, Text } from 'ink';
import { themeNames, getThemeColors } from '../utils/themes';
import type { ThemeColors } from '../utils/themes';
import { t } from '../locales';

interface ThemeSelectorProps {
  selectorIndex: number;
  colors: ThemeColors;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectorIndex,
  colors,
}) => {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.border}
      padding={1}
      width={36}
    >
      <Text bold color={colors.title}>
        {' '}
        {t('themeSelector.title')}{' '}
      </Text>
      <Text> </Text>
      <Text dimColor>
        {t('themeSelector.current', {
          theme: t(`themeSelector.themes.${themeNames[selectorIndex]}`),
        })}
      </Text>
      <Text> </Text>
      {themeNames.map((name, index) => (
        <Text key={name} color={getThemeColors(name).selected}>
          {index === selectorIndex ? '▶ ' : '  '}
          {t(`themeSelector.themes.${name}`)}
        </Text>
      ))}
      <Text> </Text>
      <Text dimColor>{t('themeSelector.help')}</Text>
    </Box>
  );
};
