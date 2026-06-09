import React from 'react';
import { Box, Text } from 'ink';
import { languages, getLanguageName, t } from '../locales';

interface LanguageSelectorProps {
  selectorIndex: number;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectorIndex,
}) => {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      padding={1}
      width={36}
    >
      <Text bold color="cyan">
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
        <Text key={lang}>
          {index === selectorIndex ? '▶ ' : '  '}
          {getLanguageName(lang)}
        </Text>
      ))}
      <Text> </Text>
      <Text dimColor>{t('languageSelector.help')}</Text>
    </Box>
  );
};
