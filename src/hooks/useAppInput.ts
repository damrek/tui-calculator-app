import { useInput } from 'ink';
import { useState, useCallback } from 'react';
import { calculate, parseInput, Operation } from '../utils/calculator';
import { t } from '../locales';

type Screen = 'menu' | 'input-sum' | 'input-sub' | 'input-mul' | 'input-div';

export interface HistoryEntry {
  a: number;
  b: number;
  operation: Operation;
  result: number;
}

export interface AppState {
  screen: Screen;
  result?: number;
  error?: string;
  selectedIndex: number;
  inputIndex: number;
  inputs: string[];
  operation: Operation | null;
  history: HistoryEntry[];
}

const MAX_HISTORY = 3;

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
  return: boolean;
  escape: boolean;
  backspace: boolean;
  delete: boolean;
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

export const useAppInput = (options?: { inputEnabled?: boolean }) => {
  const isActive = options?.inputEnabled ?? true;
  const [state, setState] = useState<AppState>({
    screen: 'menu',
    selectedIndex: 0,
    inputIndex: 0,
    inputs: ['', ''],
    operation: null,
    history: [],
  });

  const goToMenu = useCallback(() => {
    setState((s: AppState) => ({
      screen: 'menu',
      selectedIndex: 0,
      inputIndex: 0,
      inputs: ['', ''],
      operation: null,
      error: undefined,
      history: s.history,
    }));
  }, []);

  const goToInputSum = useCallback(() => {
    setState((s: AppState) => ({
      screen: 'input-sum',
      selectedIndex: 0,
      inputIndex: 0,
      inputs: ['', ''],
      operation: 'sum',
      history: s.history,
    }));
  }, []);

  const goToInputSub = useCallback(() => {
    setState((s: AppState) => ({
      screen: 'input-sub',
      selectedIndex: 0,
      inputIndex: 0,
      inputs: ['', ''],
      operation: 'sub',
      history: s.history,
    }));
  }, []);

  const goToInputMul = useCallback(() => {
    setState((s: AppState) => ({
      screen: 'input-mul',
      selectedIndex: 0,
      inputIndex: 0,
      inputs: ['', ''],
      operation: 'mul',
      history: s.history,
    }));
  }, []);

  const goToInputDiv = useCallback(() => {
    setState((s: AppState) => ({
      screen: 'input-div',
      selectedIndex: 0,
      inputIndex: 0,
      inputs: ['', ''],
      operation: 'div',
      history: s.history,
    }));
  }, []);

  const addToHistory = useCallback((entry: HistoryEntry) => {
    setState((s: AppState) => ({
      ...s,
      history: [...s.history, entry].slice(-MAX_HISTORY),
    }));
  }, []);

  useInput(
    (input: string, key: KeyInput) => {
      if (state.screen === 'menu') {
        if (key.upArrow) {
          setState((s: AppState) => ({
            ...s,
            selectedIndex: (s.selectedIndex + 4) % 5,
          }));
        } else if (key.downArrow) {
          setState((s: AppState) => ({
            ...s,
            selectedIndex: (s.selectedIndex + 1) % 5,
          }));
        } else if (key.return) {
          if (state.selectedIndex === 0) goToInputSum();
          else if (state.selectedIndex === 1) goToInputSub();
          else if (state.selectedIndex === 2) goToInputMul();
          else if (state.selectedIndex === 3) goToInputDiv();
          else process.exit(0);
        }
      } else if (
        state.screen === 'input-sum' ||
        state.screen === 'input-sub' ||
        state.screen === 'input-mul' ||
        state.screen === 'input-div'
      ) {
        if (key.escape) {
          goToMenu();
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
  };
};
