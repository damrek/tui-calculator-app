import { useInput } from 'ink';
import { useState, useCallback, useEffect } from 'react';
import {
  calculate,
  parseInput,
  Operation,
  getOperationSymbol,
  DIVISION_BY_ZERO_ERROR,
} from '../utils/calculator';
import {
  evaluateExpression,
  isValidExpressionInput,
  insertAt,
  deleteBefore,
} from '../utils/expression';
import { copyToClipboard } from '../utils/clipboard';
import { splitKeystrokes } from '../utils/keystrokes';
import { loadHistory, saveHistory, appendHistory } from '../utils/history';
import type { HistoryEntry } from '../utils/history';
import { t } from '../locales';

export { appendHistory, MAX_HISTORY } from '../utils/history';
export type { HistoryEntry } from '../utils/history';

type Screen =
  | 'menu'
  | 'input-sum'
  | 'input-sub'
  | 'input-mul'
  | 'input-div'
  | 'input-expression';

export interface AppState {
  screen: Screen;
  result?: number;
  error?: string;
  selectedIndex: number;
  inputIndex: number;
  inputs: string[];
  expressionInput: string;
  expressionCursor: number;
  operation: Operation | null;
  history: HistoryEntry[];
  historyCleared: boolean;
  copyFeedback: 'copied' | 'copy-failed' | null;
}

const FEEDBACK_TIMEOUT = 1500;

const OPERATIONS: readonly Operation[] = ['sum', 'sub', 'mul', 'div'];
const BINARY_SCREENS: Record<Operation, Screen> = {
  sum: 'input-sum',
  sub: 'input-sub',
  mul: 'input-mul',
  div: 'input-div',
};
const EXPRESSION_MENU_INDEX = OPERATIONS.length;
const CLEAR_HISTORY_MENU_INDEX = EXPRESSION_MENU_INDEX + 1;
// 4 binary operations + expression + clear history + exit
const MENU_OPTIONS = CLEAR_HISTORY_MENU_INDEX + 2;
const BINARY_INPUT_CHARS = /^[0-9.-]$/;

export const isValidInput = (current: string, newChar: string): boolean => {
  if (newChar === '.') {
    return !current.includes('.');
  }
  if (newChar === '-') {
    return current.length === 0;
  }
  return true;
};

export interface KeyInput {
  upArrow: boolean;
  downArrow: boolean;
  leftArrow: boolean;
  rightArrow: boolean;
  return: boolean;
  escape: boolean;
  backspace: boolean;
  delete: boolean;
  ctrl: boolean;
}

const NO_KEY_FLAGS: KeyInput = {
  upArrow: false,
  downArrow: false,
  leftArrow: false,
  rightArrow: false,
  return: false,
  escape: false,
  backspace: false,
  delete: false,
  ctrl: false,
};

const hasNamedKey = (key: KeyInput): boolean =>
  key.upArrow ||
  key.downArrow ||
  key.leftArrow ||
  key.rightArrow ||
  key.return ||
  key.escape ||
  key.backspace ||
  key.delete ||
  key.ctrl;

const calculateResult = (
  inputs: string[],
  operation: Operation | null
): Pick<AppState, 'result' | 'error'> => {
  if (!operation || inputs[0] === '' || inputs[1] === '') {
    return { result: undefined, error: undefined };
  }
  const a = parseInput(inputs[0]);
  const b = parseInput(inputs[1]);
  const output = calculate(a, b, operation);
  if ('error' in output) {
    return { result: undefined, error: t('input.errorDivZero') };
  }
  return { result: output.result, error: undefined };
};

const calculateExpressionResult = (
  expression: string
): Pick<AppState, 'result' | 'error'> => {
  if (expression.trim() === '') {
    return { result: undefined, error: undefined };
  }
  const output = evaluateExpression(expression);
  if ('error' in output) {
    if (output.error === DIVISION_BY_ZERO_ERROR) {
      return { result: undefined, error: t('input.errorDivZero') };
    }
    return { result: undefined, error: t('input.errorInvalidExpression') };
  }
  return { result: output.result, error: undefined };
};

export const useAppInput = (options?: { inputEnabled?: boolean }) => {
  const isActive = options?.inputEnabled ?? true;
  const [state, setState] = useState<AppState>({
    screen: 'menu',
    selectedIndex: 0,
    inputIndex: 0,
    inputs: ['', ''],
    expressionInput: '',
    expressionCursor: 0,
    operation: null,
    history: loadHistory(),
    historyCleared: false,
    copyFeedback: null,
  });

  const goToScreen = useCallback(
    (screen: Screen, operation: Operation | null) => {
      setState((s: AppState) => ({
        ...s,
        screen,
        selectedIndex: 0,
        inputIndex: 0,
        inputs: ['', ''],
        expressionInput: '',
        expressionCursor: 0,
        operation,
        result: undefined,
        error: undefined,
        historyCleared: false,
        copyFeedback: null,
      }));
    },
    []
  );

  const handleClearHistory = useCallback(() => {
    setState((s: AppState) => ({ ...s, history: [], historyCleared: true }));
    saveHistory([]);
  }, []);

  const handleCopyResult = (): void => {
    if (state.result === undefined || state.error) {
      return;
    }
    let text: string | null = null;
    if (state.screen === 'input-expression') {
      text = `${state.expressionInput.trim()} = ${state.result}`;
    } else if (state.operation) {
      text = `${state.inputs[0]} ${getOperationSymbol(state.operation)} ${
        state.inputs[1]
      } = ${state.result}`;
    }
    if (text === null) {
      return;
    }
    void copyToClipboard(text).then((ok) => {
      setState((s: AppState) => ({
        ...s,
        copyFeedback: ok ? 'copied' : 'copy-failed',
      }));
    });
  };

  useEffect(() => {
    if (state.copyFeedback === null) {
      return;
    }
    const timer = setTimeout(() => {
      setState((s: AppState) =>
        s.copyFeedback === null ? s : { ...s, copyFeedback: null }
      );
    }, FEEDBACK_TIMEOUT);
    return () => clearTimeout(timer);
  }, [state.copyFeedback]);

  useEffect(() => {
    if (!state.historyCleared) {
      return;
    }
    const timer = setTimeout(() => {
      setState((s: AppState) =>
        s.historyCleared ? { ...s, historyCleared: false } : s
      );
    }, FEEDBACK_TIMEOUT);
    return () => clearTimeout(timer);
  }, [state.historyCleared]);

  const isBinaryInputScreen = (screen: Screen): boolean => {
    return (
      screen === 'input-sum' ||
      screen === 'input-sub' ||
      screen === 'input-mul' ||
      screen === 'input-div'
    );
  };

  const handleKeystroke = (input: string, key: KeyInput): void => {
    if (state.screen === 'menu') {
      if (key.upArrow) {
        setState((s: AppState) => ({
          ...s,
          selectedIndex: (s.selectedIndex + MENU_OPTIONS - 1) % MENU_OPTIONS,
        }));
      } else if (key.downArrow) {
        setState((s: AppState) => ({
          ...s,
          selectedIndex: (s.selectedIndex + 1) % MENU_OPTIONS,
        }));
      } else if (key.return) {
        if (state.selectedIndex < OPERATIONS.length) {
          const operation = OPERATIONS[state.selectedIndex];
          goToScreen(BINARY_SCREENS[operation], operation);
        } else if (state.selectedIndex === EXPRESSION_MENU_INDEX) {
          goToScreen('input-expression', null);
        } else if (state.selectedIndex === CLEAR_HISTORY_MENU_INDEX) {
          handleClearHistory();
        } else {
          process.exit(0);
        }
      }
    } else if (isBinaryInputScreen(state.screen)) {
      if (key.escape) {
        goToScreen('menu', null);
        return;
      }
      if (key.ctrl && input === 'y') {
        handleCopyResult();
        return;
      }
      if (key.upArrow || key.downArrow) {
        setState((s: AppState) => ({
          ...s,
          inputIndex: s.inputIndex === 0 ? 1 : 0,
        }));
        return;
      }
      if (key.return) {
        if (state.inputIndex === 0) {
          setState((s: AppState) => ({ ...s, inputIndex: 1 }));
          return;
        }
        const { inputs, operation } = state;
        if (inputs[0] === '' || inputs[1] === '' || operation === null) {
          return;
        }
        if (state.result === undefined || state.error) {
          return;
        }
        const result = state.result;
        const entry: HistoryEntry = {
          kind: 'calculation',
          a: parseInput(inputs[0]),
          b: parseInput(inputs[1]),
          operation,
          result,
        };
        const nextHistory = appendHistory(state.history, entry);
        saveHistory(nextHistory);
        setState((s: AppState) => ({
          ...s,
          inputs: ['', ''],
          inputIndex: 0,
          ...calculateResult(['', ''], s.operation),
          history: nextHistory,
        }));
        return;
      }
      if (BINARY_INPUT_CHARS.test(input)) {
        setState((s: AppState) => {
          if (!isValidInput(s.inputs[s.inputIndex], input)) {
            return s;
          }
          const newInputs = [...s.inputs];
          newInputs[s.inputIndex] += input;
          return {
            ...s,
            inputs: newInputs,
            ...calculateResult(newInputs, s.operation),
          };
        });
        return;
      }
      if (key.backspace || key.delete || input === '\b' || input === '\u007f') {
        setState((s: AppState) => {
          const newInputs = [...s.inputs];
          newInputs[s.inputIndex] = newInputs[s.inputIndex].slice(0, -1);
          return {
            ...s,
            inputs: newInputs,
            ...calculateResult(newInputs, s.operation),
          };
        });
      }
    } else if (state.screen === 'input-expression') {
      if (key.escape) {
        goToScreen('menu', null);
        return;
      }
      if (key.ctrl && input === 'y') {
        handleCopyResult();
        return;
      }
      if (key.leftArrow) {
        setState((s: AppState) => ({
          ...s,
          expressionCursor: Math.max(0, s.expressionCursor - 1),
        }));
        return;
      }
      if (key.rightArrow) {
        setState((s: AppState) => ({
          ...s,
          expressionCursor: Math.min(
            s.expressionInput.length,
            s.expressionCursor + 1
          ),
        }));
        return;
      }
      if (key.return) {
        const expression = state.expressionInput.trim();
        if (expression === '' || state.result === undefined || state.error) {
          return;
        }
        const result = state.result;
        const entry: HistoryEntry = {
          kind: 'expression',
          expression,
          result,
        };
        const nextHistory = appendHistory(state.history, entry);
        saveHistory(nextHistory);
        setState((s: AppState) => ({
          ...s,
          expressionInput: '',
          expressionCursor: 0,
          ...calculateExpressionResult(''),
          history: nextHistory,
        }));
        return;
      }
      if (key.backspace || key.delete || input === '\b' || input === '\u007f') {
        setState((s: AppState) => {
          const edit = deleteBefore(s.expressionInput, s.expressionCursor);
          return {
            ...s,
            expressionInput: edit.text,
            expressionCursor: edit.cursor,
            ...calculateExpressionResult(edit.text),
          };
        });
        return;
      }
      setState((s: AppState) => {
        const beforeCursor = s.expressionInput.slice(0, s.expressionCursor);
        if (!isValidExpressionInput(s.expressionInput, input, beforeCursor)) {
          return s;
        }
        const edit = insertAt(s.expressionInput, s.expressionCursor, input);
        return {
          ...s,
          expressionInput: edit.text,
          expressionCursor: edit.cursor,
          ...calculateExpressionResult(edit.text),
        };
      });
    }
  };

  useInput(
    (input: string, key: KeyInput) => {
      // A named key is always exactly one keystroke, so it is never split.
      // Without a named key, `input` longer than one code point is a batched
      // stdin chunk (fast typing or a paste) and is replayed char by char.
      if (hasNamedKey(key) || input.length <= 1) {
        handleKeystroke(input, key);
        return;
      }
      // Replay uses NO_KEY_FLAGS, so only the printable insert and the delete
      // paths are reachable. Both already read their state from the functional
      // update, so the queued updates apply in order and each sees the previous
      // result.
      for (const char of splitKeystrokes(input)) {
        handleKeystroke(char, NO_KEY_FLAGS);
      }
    },
    { isActive }
  );

  return { state };
};
