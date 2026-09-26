import { useInput } from 'ink';
import { useState, useCallback, useEffect } from 'react';
import {
  calculate,
  parseInput,
  Operation,
  getOperationSymbol,
} from '../utils/calculator';
import {
  evaluateExpression,
  isValidExpressionInput,
  insertAt,
  deleteBefore,
} from '../utils/expression';
import { copyToClipboard } from '../utils/clipboard';
import { t } from '../locales';

type Screen =
  | 'menu'
  | 'input-sum'
  | 'input-sub'
  | 'input-mul'
  | 'input-div'
  | 'input-expression';

export type HistoryEntry =
  | {
      kind: 'calculation';
      a: number;
      b: number;
      operation: Operation;
      result: number;
    }
  | { kind: 'expression'; expression: string; result: number };

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
  copyFeedback: 'copied' | 'copy-failed' | null;
}

const MAX_HISTORY = 3;
const MENU_OPTIONS = 6;
const COPY_FEEDBACK_TIMEOUT = 1500;

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
    if (output.error === 'Error: division by zero') {
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
    history: [],
    copyFeedback: null,
  });

  const goToMenu = useCallback(() => {
    setState((s: AppState) => ({
      screen: 'menu',
      selectedIndex: 0,
      inputIndex: 0,
      inputs: ['', ''],
      expressionInput: '',
      expressionCursor: 0,
      operation: null,
      error: undefined,
      history: s.history,
      copyFeedback: null,
    }));
  }, []);

  const goToInputSum = useCallback(() => {
    setState((s: AppState) => ({
      screen: 'input-sum',
      selectedIndex: 0,
      inputIndex: 0,
      inputs: ['', ''],
      expressionInput: '',
      expressionCursor: 0,
      operation: 'sum',
      history: s.history,
      copyFeedback: null,
    }));
  }, []);

  const goToInputSub = useCallback(() => {
    setState((s: AppState) => ({
      screen: 'input-sub',
      selectedIndex: 0,
      inputIndex: 0,
      inputs: ['', ''],
      expressionInput: '',
      expressionCursor: 0,
      operation: 'sub',
      history: s.history,
      copyFeedback: null,
    }));
  }, []);

  const goToInputMul = useCallback(() => {
    setState((s: AppState) => ({
      screen: 'input-mul',
      selectedIndex: 0,
      inputIndex: 0,
      inputs: ['', ''],
      expressionInput: '',
      expressionCursor: 0,
      operation: 'mul',
      history: s.history,
      copyFeedback: null,
    }));
  }, []);

  const goToInputDiv = useCallback(() => {
    setState((s: AppState) => ({
      screen: 'input-div',
      selectedIndex: 0,
      inputIndex: 0,
      inputs: ['', ''],
      expressionInput: '',
      expressionCursor: 0,
      operation: 'div',
      history: s.history,
      copyFeedback: null,
    }));
  }, []);

  const goToInputExpression = useCallback(() => {
    setState((s: AppState) => ({
      screen: 'input-expression',
      selectedIndex: 0,
      inputIndex: 0,
      inputs: ['', ''],
      expressionInput: '',
      expressionCursor: 0,
      operation: null,
      error: undefined,
      history: s.history,
      copyFeedback: null,
    }));
  }, []);

  const addToHistory = useCallback((entry: HistoryEntry) => {
    setState((s: AppState) => ({
      ...s,
      history: [...s.history, entry].slice(-MAX_HISTORY),
    }));
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
    }, COPY_FEEDBACK_TIMEOUT);
    return () => clearTimeout(timer);
  }, [state.copyFeedback]);

  const isBinaryInputScreen = (screen: Screen): boolean => {
    return (
      screen === 'input-sum' ||
      screen === 'input-sub' ||
      screen === 'input-mul' ||
      screen === 'input-div'
    );
  };

  useInput(
    (input: string, key: KeyInput) => {
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
          if (state.selectedIndex === 0) goToInputSum();
          else if (state.selectedIndex === 1) goToInputSub();
          else if (state.selectedIndex === 2) goToInputMul();
          else if (state.selectedIndex === 3) goToInputDiv();
          else if (state.selectedIndex === 4) goToInputExpression();
          else process.exit(0);
        }
      } else if (isBinaryInputScreen(state.screen)) {
        if (key.escape) {
          goToMenu();
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
          if (state.inputs[0] !== '' && state.inputs[1] !== '') {
            if (state.operation && state.result !== undefined && !state.error) {
              addToHistory({
                kind: 'calculation',
                a: parseInput(state.inputs[0]),
                b: parseInput(state.inputs[1]),
                operation: state.operation,
                result: state.result,
              });
            }
            goToMenu();
          }
          return;
        }
        if (
          input === '0' ||
          input === '1' ||
          input === '2' ||
          input === '3' ||
          input === '4' ||
          input === '5' ||
          input === '6' ||
          input === '7' ||
          input === '8' ||
          input === '9' ||
          input === '.' ||
          input === '-'
        ) {
          if (!isValidInput(state.inputs[state.inputIndex], input)) {
            return;
          }
          setState((s: AppState) => {
            const newInputs = [...s.inputs];
            newInputs[s.inputIndex] += input;
            return {
              ...s,
              inputs: newInputs,
              ...calculateResult(newInputs, s.operation),
            };
          });
        }
        if (
          key.backspace ||
          key.delete ||
          input === '\b' ||
          input === '\u007f'
        ) {
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
          goToMenu();
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
          if (
            state.expressionInput.trim() !== '' &&
            state.result !== undefined &&
            !state.error
          ) {
            addToHistory({
              kind: 'expression',
              expression: state.expressionInput.trim(),
              result: state.result,
            });
          }
          goToMenu();
          return;
        }
        if (
          key.backspace ||
          key.delete ||
          input === '\b' ||
          input === '\u007f'
        ) {
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
    },
    { isActive }
  );

  return {
    state,
    goToMenu,
    goToInputSum,
    goToInputSub,
    goToInputMul,
    goToInputDiv,
    goToInputExpression,
  };
};
