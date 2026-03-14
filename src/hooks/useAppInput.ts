import { useInput } from 'ink';
import { useState, useCallback } from 'react';

type Screen = 'menu' | 'input-sum' | 'input-sub' | 'result';
type Operation = 'sum' | 'sub' | null;

export interface AppState {
  screen: Screen;
  result?: number;
  selectedIndex: number;
  inputIndex: number;
  inputs: string[];
  operation: Operation;
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

  const calculateAndShowResult = useCallback(
    (operation: 'sum' | 'sub') => {
      const a = parseFloat(state.inputs[0]) || 0;
      const b = parseFloat(state.inputs[1]) || 0;
      const result = operation === 'sum' ? a + b : a - b;
      setState({ ...state, screen: 'result', result, operation });
    },
    [state]
  );

  useInput((input: string, key: KeyInput) => {
    if (state.screen === 'menu') {
      if (key.upArrow) {
        setState((s: AppState) => ({
          ...s,
          selectedIndex: (s.selectedIndex + 2) % 3,
        }));
      } else if (key.downArrow) {
        setState((s: AppState) => ({
          ...s,
          selectedIndex: (s.selectedIndex + 1) % 3,
        }));
      } else if (key.return) {
        if (state.selectedIndex === 0) goToInputSum();
        else if (state.selectedIndex === 1) goToInputSub();
        else process.exit(0);
      }
    } else if (state.screen === 'input-sum' || state.screen === 'input-sub') {
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
        calculateAndShowResult(state.screen === 'input-sum' ? 'sum' : 'sub');
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

  return { state, goToMenu, goToInputSum, goToInputSub };
};
