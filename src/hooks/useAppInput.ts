import { useInput } from 'ink';
import { useState, useCallback } from 'react';
import { calculate, parseInput, Operation } from '../utils/calculator';

type Screen =
  | 'menu'
  | 'input-sum'
  | 'input-sub'
  | 'input-mul'
  | 'input-div'
  | 'result';

export interface AppState {
  screen: Screen;
  result?: number;
  error?: string;
  selectedIndex: number;
  inputIndex: number;
  inputs: string[];
  operation: Operation | null;
}

export interface KeyInput {
  upArrow: boolean;
  downArrow: boolean;
  return: boolean;
  escape: boolean;
  backspace: boolean;
  delete: boolean;
}

export const useAppInput = () => {
  const [state, setState] = useState<AppState>({
    screen: 'menu',
    selectedIndex: 0,
    inputIndex: 0,
    inputs: ['', ''],
    operation: null,
  });

  const goToMenu = useCallback(() => {
    setState({
      screen: 'menu',
      selectedIndex: 0,
      inputIndex: 0,
      inputs: ['', ''],
      operation: null,
      error: undefined,
    });
  }, []);

  const goToInputSum = useCallback(() => {
    setState({
      screen: 'input-sum',
      selectedIndex: 0,
      inputIndex: 0,
      inputs: ['', ''],
      operation: 'sum',
    });
  }, []);

  const goToInputSub = useCallback(() => {
    setState({
      screen: 'input-sub',
      selectedIndex: 0,
      inputIndex: 0,
      inputs: ['', ''],
      operation: 'sub',
    });
  }, []);

  const goToInputMul = useCallback(() => {
    setState({
      screen: 'input-mul',
      selectedIndex: 0,
      inputIndex: 0,
      inputs: ['', ''],
      operation: 'mul',
    });
  }, []);

  const goToInputDiv = useCallback(() => {
    setState({
      screen: 'input-div',
      selectedIndex: 0,
      inputIndex: 0,
      inputs: ['', ''],
      operation: 'div',
    });
  }, []);

  const calculateAndShowResult = useCallback(
    (operation: Operation) => {
      const a = parseInput(state.inputs[0]);
      const b = parseInput(state.inputs[1]);
      const output = calculate(a, b, operation);

      if ('error' in output) {
        setState({
          ...state,
          screen: 'result',
          result: undefined,
          operation,
          error: output.error,
        });
      } else {
        setState({
          ...state,
          screen: 'result',
          result: output.result,
          operation,
          error: undefined,
        });
      }
    },
    [state]
  );

  useInput((input: string, key: KeyInput) => {
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
        const op =
          state.screen === 'input-sum'
            ? 'sum'
            : state.screen === 'input-sub'
              ? 'sub'
              : state.screen === 'input-mul'
                ? 'mul'
                : 'div';
        calculateAndShowResult(op);
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
        setState((s: AppState) => {
          const newInputs = [...s.inputs];
          newInputs[s.inputIndex] += input;
          return { ...s, inputs: newInputs };
        });
      }
      if (key.backspace || key.delete || input === '\b' || input === '\u007f') {
        setState((s: AppState) => {
          const newInputs = [...s.inputs];
          newInputs[s.inputIndex] = newInputs[s.inputIndex].slice(0, -1);
          return { ...s, inputs: newInputs };
        });
      }
    } else if (state.screen === 'result') {
      goToMenu();
    }
  });

  return {
    state,
    goToMenu,
    goToInputSum,
    goToInputSub,
    goToInputMul,
    goToInputDiv,
  };
};
