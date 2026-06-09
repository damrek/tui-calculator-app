import React from 'react';
import { Box, Text } from 'ink';
import { useAppInput } from './hooks/useAppInput';
import { useLanguage } from './hooks/useLanguage';
import { LanguageSelector } from './components/LanguageSelector';
import { t } from './locales';

const App: React.FC = () => {
  const { showSelector, selectorIndex } = useLanguage();
  const { state } = useAppInput({ inputEnabled: !showSelector });

  const getOperationTitle = (): string => {
    switch (state.operation) {
      case 'sum':
        return t('input.sumTitle');
      case 'sub':
        return t('input.subTitle');
      case 'mul':
        return t('input.mulTitle');
      case 'div':
        return t('input.divTitle');
      default:
        return '';
    }
  };

  const getOperationSymbol = () => {
    if (state.operation === 'sum') return '+';
    if (state.operation === 'sub') return '-';
    if (state.operation === 'mul') return '*';
    if (state.operation === 'div') return '/';
    return '';
  };

  const renderMenu = () => (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      padding={1}
    >
      <Text bold color="cyan">
        {t('menu.title')}
      </Text>
      <Text> </Text>
      {state.selectedIndex === 0 ? (
        <Text bold color="green">
          ▶ {t('menu.sum')}
        </Text>
      ) : (
        <Text> {t('menu.sum')}</Text>
      )}
      {state.selectedIndex === 1 ? (
        <Text bold color="green">
          ▶ {t('menu.sub')}
        </Text>
      ) : (
        <Text> {t('menu.sub')}</Text>
      )}
      {state.selectedIndex === 2 ? (
        <Text bold color="green">
          ▶ {t('menu.mul')}
        </Text>
      ) : (
        <Text> {t('menu.mul')}</Text>
      )}
      {state.selectedIndex === 3 ? (
        <Text bold color="green">
          ▶ {t('menu.div')}
        </Text>
      ) : (
        <Text> {t('menu.div')}</Text>
      )}
      {state.selectedIndex === 4 ? (
        <Text bold color="red">
          ▶ {t('menu.exit')}
        </Text>
      ) : (
        <Text> {t('menu.exit')}</Text>
      )}
      <Text> </Text>
      <Text dimColor>{t('menu.navHelp')}</Text>
    </Box>
  );

  const renderInput = () => (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="cyan"
      padding={1}
    >
      <Text bold color="cyan">
        {getOperationTitle()}
      </Text>
      <Text> </Text>
      <Box flexDirection="column">
        <Text>
          {state.inputIndex === 0 ? '▶ ' : '  '}
          {t('input.firstNumber')}: {state.inputs[0] || '(empty)'}
        </Text>
        <Text>
          {state.inputIndex === 1 ? '▶ ' : '  '}
          {t('input.secondNumber')}: {state.inputs[1] || '(empty)'}
        </Text>
      </Box>
      {(state.result !== undefined || state.error) && (
        <Box flexDirection="column" marginTop={1}>
          <Text bold>
            {' '}
            {state.inputs[0]} {getOperationSymbol()} {state.inputs[1]} ={' '}
            {state.error ? (
              <Text bold color="red">
                {state.error}
              </Text>
            ) : (
              <Text bold color="green">
                {state.result}
              </Text>
            )}
          </Text>
        </Box>
      )}
      <Text> </Text>
      <Text dimColor>{t('input.switchHelp')}</Text>
    </Box>
  );

  return (
    <Box flexDirection="column" padding={1}>
      {state.screen === 'menu' && renderMenu()}
      {state.screen === 'input-sum' && renderInput()}
      {state.screen === 'input-sub' && renderInput()}
      {state.screen === 'input-mul' && renderInput()}
      {state.screen === 'input-div' && renderInput()}
      {showSelector && (
        <Box alignItems="center" flexDirection="column" marginTop={1}>
          <LanguageSelector selectorIndex={selectorIndex} />
        </Box>
      )}
    </Box>
  );
};

export default App;
