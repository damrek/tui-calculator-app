import React from 'react';
import { Box, Text, useInput } from 'ink';
import { useAppInput, HistoryEntry } from './hooks/useAppInput';
import { useLanguage } from './hooks/useLanguage';
import { useTheme } from './hooks/useTheme';
import { LanguageSelector } from './components/LanguageSelector';
import { ThemeSelector } from './components/ThemeSelector';
import { t } from './locales';
import { getOperationSymbol } from './utils/calculator';

interface MenuItem {
  labelKey: string;
  danger?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  { labelKey: 'menu.sum' },
  { labelKey: 'menu.sub' },
  { labelKey: 'menu.mul' },
  { labelKey: 'menu.div' },
  { labelKey: 'menu.expression' },
  { labelKey: 'menu.clearHistory' },
  { labelKey: 'menu.exit', danger: true },
];

const App: React.FC = () => {
  const language = useLanguage({ enableHotkey: false });
  const theme = useTheme({ enableHotkey: false });
  const { state } = useAppInput({
    inputEnabled: !language.showSelector && !theme.showSelector,
  });
  const colors = theme.colors;

  useInput((input, key) => {
    if (!key.ctrl) {
      return;
    }
    if (input === 'l' && !theme.showSelector) {
      language.openSelector();
    } else if (input === 't' && !language.showSelector) {
      theme.openSelector();
    }
  });

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

  const renderCopyFeedback = () =>
    state.copyFeedback !== null && (
      <Text
        bold
        color={
          state.copyFeedback === 'copied' ? colors.success : colors.warning
        }
      >
        {state.copyFeedback === 'copied'
          ? ` ${t('input.copySuccess')}`
          : ` ${t('input.copyError')}`}
      </Text>
    );

  const renderHistory = (history: HistoryEntry[]) => (
    <Box flexDirection="column" marginTop={1}>
      <Text dimColor>{t('input.historyLabel')}</Text>
      {history.map((entry, index) => (
        <Text key={index} dimColor>
          {' '}
          {entry.kind === 'expression'
            ? `${entry.expression} = ${entry.result}`
            : `${entry.a} ${getOperationSymbol(entry.operation)} ${entry.b} = ${entry.result}`}
        </Text>
      ))}
    </Box>
  );

  const renderMenu = () => (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.border}
      padding={1}
    >
      <Text bold color={colors.title}>
        {t('menu.title')}
      </Text>
      <Text> </Text>
      {MENU_ITEMS.map((item, index) =>
        state.selectedIndex === index ? (
          <Text
            key={item.labelKey}
            bold
            color={item.danger ? colors.danger : colors.selected}
          >
            ▶ {t(item.labelKey)}
          </Text>
        ) : (
          <Text key={item.labelKey}> {t(item.labelKey)}</Text>
        )
      )}
      <Text> </Text>
      <Text dimColor>{t('menu.navHelp')}</Text>
    </Box>
  );

  const renderInput = () => (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.border}
      padding={1}
    >
      <Text bold color={colors.title}>
        {getOperationTitle()}
      </Text>
      <Text> </Text>
      <Box flexDirection="column">
        <Text>
          {state.inputIndex === 0 ? '▶ ' : '  '}
          {t('input.firstNumber')}: {state.inputs[0] || t('input.empty')}
        </Text>
        <Text>
          {state.inputIndex === 1 ? '▶ ' : '  '}
          {t('input.secondNumber')}: {state.inputs[1] || t('input.empty')}
        </Text>
      </Box>
      {(state.result !== undefined || state.error) && (
        <Box flexDirection="column" marginTop={1}>
          <Text bold>
            {' '}
            {state.inputs[0]} {getOperationSymbol(state.operation)}{' '}
            {state.inputs[1]} ={' '}
            {state.error ? (
              <Text bold color={colors.danger}>
                {state.error}
              </Text>
            ) : (
              <Text bold color={colors.success}>
                {state.result}
              </Text>
            )}
          </Text>
          {renderCopyFeedback()}
        </Box>
      )}
      {state.history.length > 0 && renderHistory(state.history)}
      <Text> </Text>
      <Text dimColor>{t('input.switchHelp')}</Text>
      <Text dimColor>{t('input.copyHint')}</Text>
    </Box>
  );

  const renderWithCursor = (value: string, cursor: number) => (
    <Text>
      {value.slice(0, cursor)}
      <Text inverse>{value[cursor] ?? ' '}</Text>
      {value.slice(cursor + 1)}
    </Text>
  );

  const renderExpressionInput = () => (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.border}
      padding={1}
    >
      <Text bold color={colors.title}>
        {t('input.expressionTitle')}
      </Text>
      <Text> </Text>
      <Text>
        ▶ {t('input.expressionLabel')}:{' '}
        {renderWithCursor(state.expressionInput, state.expressionCursor)}
      </Text>
      {(state.result !== undefined || state.error) && (
        <Box flexDirection="column" marginTop={1}>
          <Text bold>
            {' '}
            {state.expressionInput} ={' '}
            {state.error ? (
              <Text bold color={colors.danger}>
                {state.error}
              </Text>
            ) : (
              <Text bold color={colors.success}>
                {state.result}
              </Text>
            )}
          </Text>
          {renderCopyFeedback()}
        </Box>
      )}
      {state.history.length > 0 && renderHistory(state.history)}
      <Text> </Text>
      <Text dimColor>{t('input.expressionHelp')}</Text>
      <Text dimColor>{t('input.copyHint')}</Text>
    </Box>
  );

  return (
    <Box flexDirection="column" padding={1}>
      {state.screen === 'menu' && renderMenu()}
      {state.screen === 'menu' && state.historyCleared && (
        <Text bold color={colors.success}>
          {t('menu.historyCleared')}
        </Text>
      )}
      {state.screen === 'input-sum' && renderInput()}
      {state.screen === 'input-sub' && renderInput()}
      {state.screen === 'input-mul' && renderInput()}
      {state.screen === 'input-div' && renderInput()}
      {state.screen === 'input-expression' && renderExpressionInput()}
      <Box marginTop={1}>
        <Text dimColor>{t('themeSelector.hint')}</Text>
      </Box>
      {language.showSelector && (
        <Box alignItems="center" flexDirection="column" marginTop={1}>
          <LanguageSelector
            selectorIndex={language.selectorIndex}
            colors={colors}
          />
        </Box>
      )}
      {theme.showSelector && (
        <Box alignItems="center" flexDirection="column" marginTop={1}>
          <ThemeSelector selectorIndex={theme.selectorIndex} colors={colors} />
        </Box>
      )}
    </Box>
  );
};

export default App;
