import React from 'react';
import { Box, Text } from 'ink';
import { languages, getLanguageName, t } from '../locales';
import type { ThemeColors } from '../utils/themes';

interface LanguageSelectorProps {
  selectorIndex: number;
  colors: ThemeColors;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
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
        {t('languageSelector.title')}{' '}
      </Text>
      <Text> </Text>
      <Text dimColor>
        {t('languageSelector.current', {
          lang: getLanguageName(languages[selectorIndex]),
        })}
      </Text>
      <Text> </Text>
      {languages.map((lang, index) => (
        <Text key={lang} color={colors.selected}>
          {index === selectorIndex ? '▶ ' : '  '}
          {getLanguageName(lang)}
        </Text>
      ))}
      <Text> </Text>
      <Text dimColor>{t('languageSelector.help')}</Text>
    </Box>
  );
};
