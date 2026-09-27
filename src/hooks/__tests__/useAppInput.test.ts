import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const handlerHolder = vi.hoisted(() => ({
  current: null as unknown as (
    input: string,
    key: Record<string, boolean>
  ) => void,
}));

const clipboardMocks = vi.hoisted(() => ({
  copyToClipboard: vi.fn(),
}));

vi.mock('ink', () => ({
  useInput: (
    handler: (input: string, key: Record<string, boolean>) => void
  ) => {
    handlerHolder.current = handler;
  },
}));

vi.mock('../../utils/clipboard', () => ({
  copyToClipboard: clipboardMocks.copyToClipboard,
}));

import { useAppInput, MAX_HISTORY } from '../useAppInput';

const fireKey = (input: string, key: Record<string, boolean>) => {
  act(() => {
    handlerHolder.current(input, { ctrl: false, ...key });
  });
};

const fireCtrlY = () => {
  handlerHolder.current('y', { ctrl: true });
};

const goToSumScreen = () => {
  fireKey('', { return: true });
};

const goToExpressionScreen = () => {
  for (let i = 0; i < 4; i++) {
    fireKey('', { downArrow: true });
  }
  fireKey('', { return: true });
};

const typeExpression = (expression: string) => {
  for (const char of expression) {
    fireKey(char, {});
  }
};

const moveCursorLeft = (times: number) => {
  for (let i = 0; i < times; i++) {
    fireKey('', { leftArrow: true });
  }
};

const moveCursorRight = (times: number) => {
  for (let i = 0; i < times; i++) {
    fireKey('', { rightArrow: true });
  }
};

const typeDigits = (value: string) => {
  for (const char of value) {
    fireKey(char, {});
  }
};

const fillBinaryInput = (a: string, b: string) => {
  typeDigits(a);
  fireKey('', { downArrow: true });
  typeDigits(b);
};

describe('useAppInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clipboardMocks.copyToClipboard.mockResolvedValue(true);
  });

  describe('copy result (Ctrl+Y)', () => {
    it('should copy the calculation expression and result', async () => {
      const { result } = renderHook(() => useAppInput());
      goToSumScreen();
      fillBinaryInput('5', '3');

      await act(async () => {
        fireCtrlY();
      });

      expect(clipboardMocks.copyToClipboard).toHaveBeenCalledWith('5 + 3 = 8');
      expect(result.current.state.copyFeedback).toBe('copied');
    });

    it('should copy the free expression and result', async () => {
      const { result } = renderHook(() => useAppInput());
      goToExpressionScreen();
      const expression = '3 + 5 * 2';
      typeExpression(expression);

      await act(async () => {
        fireCtrlY();
      });

      expect(clipboardMocks.copyToClipboard).toHaveBeenCalledWith(
        `${expression} = 13`
      );
      expect(result.current.state.copyFeedback).toBe('copied');
    });

    it('should mark copy as failed when clipboard errors', async () => {
      clipboardMocks.copyToClipboard.mockResolvedValue(false);
      const { result } = renderHook(() => useAppInput());
      goToSumScreen();
      fillBinaryInput('5', '3');

      await act(async () => {
        fireCtrlY();
      });

      expect(result.current.state.copyFeedback).toBe('copy-failed');
    });

    it('should do nothing when there is no result', async () => {
      const { result } = renderHook(() => useAppInput());
      goToSumScreen();

      await act(async () => {
        fireCtrlY();
      });

      expect(clipboardMocks.copyToClipboard).not.toHaveBeenCalled();
      expect(result.current.state.copyFeedback).toBeNull();
    });

    it('should do nothing with a division by zero error', async () => {
      const { result } = renderHook(() => useAppInput());
      goToSumScreen();
      fireKey('', { downArrow: true });
      // sum screen: go to sum, fill 10 / 0 on div screen
      // switch to div: escape then navigate
      fireKey('', { escape: true });
      for (let i = 0; i < 3; i++) {
        fireKey('', { downArrow: true });
      }
      fireKey('', { return: true });
      fireKey('1', {});
      fireKey('0', {});
      fireKey('', { downArrow: true });
      fireKey('0', {});

      await act(async () => {
        fireCtrlY();
      });

      expect(clipboardMocks.copyToClipboard).not.toHaveBeenCalled();
      expect(result.current.state.copyFeedback).toBeNull();
    });

    it('should do nothing on the menu screen', async () => {
      const { result } = renderHook(() => useAppInput());

      await act(async () => {
        fireCtrlY();
      });

      expect(clipboardMocks.copyToClipboard).not.toHaveBeenCalled();
      expect(result.current.state.copyFeedback).toBeNull();
    });
  });

  describe('expression cursor', () => {
    it('should keep the cursor at the end of a freshly typed expression', () => {
      const { result } = renderHook(() => useAppInput());
      goToExpressionScreen();
      typeExpression('3 + 5');

      expect(result.current.state.expressionInput).toBe('3 + 5');
      expect(result.current.state.expressionCursor).toBe(5);
    });

    it('should move the cursor left and right', () => {
      const { result } = renderHook(() => useAppInput());
      goToExpressionScreen();
      typeExpression('3 + 5');

      moveCursorLeft(2);
      expect(result.current.state.expressionCursor).toBe(3);

      moveCursorRight(1);
      expect(result.current.state.expressionCursor).toBe(4);
    });

    it('should not move the cursor past the boundaries', () => {
      const { result } = renderHook(() => useAppInput());
      goToExpressionScreen();
      typeExpression('3 + 5');

      moveCursorLeft(20);
      expect(result.current.state.expressionCursor).toBe(0);

      moveCursorRight(20);
      expect(result.current.state.expressionCursor).toBe(5);
    });

    it('should not move the cursor on the menu screen', () => {
      const { result } = renderHook(() => useAppInput());

      fireKey('', { leftArrow: true });
      fireKey('', { rightArrow: true });

      expect(result.current.state.expressionCursor).toBe(0);
    });

    it('should insert a character at the cursor position', () => {
      const { result } = renderHook(() => useAppInput());
      goToExpressionScreen();
      typeExpression('1 + 2');
      expect(result.current.state.result).toBe(3);

      moveCursorLeft(4);
      fireKey('5', {});

      expect(result.current.state.expressionInput).toBe('15 + 2');
      expect(result.current.state.expressionCursor).toBe(2);
      expect(result.current.state.result).toBe(17);
      expect(result.current.state.error).toBeUndefined();
    });

    it('should show an error after inserting an operator in the middle', () => {
      const { result } = renderHook(() => useAppInput());
      goToExpressionScreen();
      typeExpression('10 / 2');
      expect(result.current.state.result).toBe(5);

      moveCursorLeft(5);
      fireKey('/', {});

      expect(result.current.state.expressionInput).toBe('1/0 / 2');
      expect(result.current.state.expressionCursor).toBe(2);
      expect(result.current.state.error).toBeDefined();
      expect(result.current.state.result).toBeUndefined();
    });

    it('should delete the character before the cursor on backspace', () => {
      const { result } = renderHook(() => useAppInput());
      goToExpressionScreen();
      typeExpression('12 + 34');

      moveCursorLeft(1);
      fireKey('', { backspace: true });

      expect(result.current.state.expressionInput).toBe('12 + 4');
      expect(result.current.state.expressionCursor).toBe(5);
      expect(result.current.state.result).toBe(16);
    });

    it('should not delete anything on backspace at the start', () => {
      const { result } = renderHook(() => useAppInput());
      goToExpressionScreen();
      typeExpression('3 + 5');

      moveCursorLeft(20);
      fireKey('', { backspace: true });

      expect(result.current.state.expressionInput).toBe('3 + 5');
      expect(result.current.state.expressionCursor).toBe(0);
    });

    it('should delete the character before the cursor on delete', () => {
      const { result } = renderHook(() => useAppInput());
      goToExpressionScreen();
      typeExpression('123');

      moveCursorLeft(1);
      fireKey('', { delete: true });

      expect(result.current.state.expressionInput).toBe('13');
      expect(result.current.state.expressionCursor).toBe(1);
    });

    it('should not delete anything on delete at the start', () => {
      const { result } = renderHook(() => useAppInput());
      goToExpressionScreen();
      typeExpression('3 + 5');

      moveCursorLeft(20);
      fireKey('', { delete: true });

      expect(result.current.state.expressionInput).toBe('3 + 5');
      expect(result.current.state.expressionCursor).toBe(0);
    });

    it('should reject a closing parenthesis without an opening one', () => {
      const { result } = renderHook(() => useAppInput());
      goToExpressionScreen();
      typeExpression('1 + 2');

      moveCursorLeft(5);
      fireKey(')', {});

      expect(result.current.state.expressionInput).toBe('1 + 2');
      expect(result.current.state.expressionCursor).toBe(0);
    });

    it('should accept a closing parenthesis after an opening one', () => {
      const { result } = renderHook(() => useAppInput());
      goToExpressionScreen();
      typeExpression('(3+5');

      fireKey(')', {});

      expect(result.current.state.expressionInput).toBe('(3+5)');
      expect(result.current.state.expressionCursor).toBe(5);
      expect(result.current.state.result).toBe(8);
    });

    it('should reject a closing parenthesis when the opening one is after the cursor', () => {
      const { result } = renderHook(() => useAppInput());
      goToExpressionScreen();
      typeExpression('(3+5)');

      moveCursorLeft(6);
      fireKey(')', {});

      expect(result.current.state.expressionInput).toBe('(3+5)');
      expect(result.current.state.expressionCursor).toBe(0);
    });

    it('should reset the cursor when leaving the expression screen', () => {
      const { result } = renderHook(() => useAppInput());
      goToExpressionScreen();
      typeExpression('3 + 5');
      moveCursorLeft(3);

      fireKey('', { escape: true });
      expect(result.current.state.expressionCursor).toBe(0);

      goToExpressionScreen();
      expect(result.current.state.expressionCursor).toBe(0);
    });
  });

  describe('committing with Enter', () => {
    const pressEnter = () => fireKey('', { return: true });

    describe('free expression mode', () => {
      it('should stay on the expression screen and clear the input after Enter', () => {
        const { result } = renderHook(() => useAppInput());
        goToExpressionScreen();
        typeExpression('3 + 5');

        pressEnter();

        expect(result.current.state.screen).toBe('input-expression');
        expect(result.current.state.expressionInput).toBe('');
        expect(result.current.state.expressionCursor).toBe(0);
        expect(result.current.state.result).toBeUndefined();
        expect(result.current.state.error).toBeUndefined();
        expect(result.current.state.history).toEqual([
          { kind: 'expression', expression: '3 + 5', result: 8 },
        ]);
      });

      it('should trim the expression before storing it in the history', () => {
        const { result } = renderHook(() => useAppInput());
        goToExpressionScreen();
        typeExpression(' 3 + 5 ');

        pressEnter();

        expect(result.current.state.history).toEqual([
          { kind: 'expression', expression: '3 + 5', result: 8 },
        ]);
      });

      it('should do nothing on an empty expression', () => {
        const { result } = renderHook(() => useAppInput());
        goToExpressionScreen();

        pressEnter();

        expect(result.current.state.screen).toBe('input-expression');
        expect(result.current.state.history).toEqual([]);
      });

      it('should do nothing on an expression with an error', () => {
        const { result } = renderHook(() => useAppInput());
        goToExpressionScreen();
        typeExpression('1/0');

        expect(result.current.state.error).toBeDefined();

        pressEnter();

        expect(result.current.state.screen).toBe('input-expression');
        expect(result.current.state.expressionInput).toBe('1/0');
        expect(result.current.state.history).toEqual([]);
      });

      it('should let Esc go back to the menu', () => {
        const { result } = renderHook(() => useAppInput());
        goToExpressionScreen();
        typeExpression('3 + 5');
        pressEnter();

        fireKey('', { escape: true });

        expect(result.current.state.screen).toBe('menu');
        expect(result.current.state.history).toHaveLength(1);
      });
    });

    describe('binary screens', () => {
      it('should move to the second input on the first Enter', () => {
        const { result } = renderHook(() => useAppInput());
        goToSumScreen();
        typeDigits('3');

        pressEnter();

        expect(result.current.state.screen).toBe('input-sum');
        expect(result.current.state.inputIndex).toBe(1);
        expect(result.current.state.inputs).toEqual(['3', '']);
        expect(result.current.state.history).toEqual([]);
      });

      it('should stay on the screen and clear the input after Enter', () => {
        const { result } = renderHook(() => useAppInput());
        goToSumScreen();
        fillBinaryInput('3', '5');

        pressEnter();

        expect(result.current.state.screen).toBe('input-sum');
        expect(result.current.state.inputs).toEqual(['', '']);
        expect(result.current.state.inputIndex).toBe(0);
        expect(result.current.state.result).toBeUndefined();
        expect(result.current.state.error).toBeUndefined();
        expect(result.current.state.history).toEqual([
          { kind: 'calculation', a: 3, b: 5, operation: 'sum', result: 8 },
        ]);
      });

      it('should start a new operation after committing', () => {
        const { result } = renderHook(() => useAppInput());
        goToSumScreen();
        fillBinaryInput('3', '5');
        pressEnter();

        typeDigits('1');
        pressEnter();
        typeDigits('2');
        pressEnter();

        expect(result.current.state.inputs).toEqual(['', '']);
        expect(result.current.state.history).toEqual([
          { kind: 'calculation', a: 3, b: 5, operation: 'sum', result: 8 },
          { kind: 'calculation', a: 1, b: 2, operation: 'sum', result: 3 },
        ]);
      });

      it('should do nothing on an empty second input', () => {
        const { result } = renderHook(() => useAppInput());
        goToSumScreen();
        fireKey('3', {});

        pressEnter();
        pressEnter();

        expect(result.current.state.screen).toBe('input-sum');
        expect(result.current.state.inputs).toEqual(['3', '']);
        expect(result.current.state.history).toEqual([]);
      });

      it('should do nothing on a division by zero', () => {
        const { result } = renderHook(() => useAppInput());
        for (let i = 0; i < 3; i++) {
          fireKey('', { downArrow: true });
        }
        pressEnter();
        fillBinaryInput('10', '0');

        expect(result.current.state.error).toBeDefined();

        pressEnter();
        pressEnter();

        expect(result.current.state.screen).toBe('input-div');
        expect(result.current.state.inputs).toEqual(['10', '0']);
        expect(result.current.state.history).toEqual([]);
      });
    });

    describe('history limit', () => {
      it('should keep at most MAX_HISTORY entries', () => {
        const { result } = renderHook(() => useAppInput());
        goToExpressionScreen();
        for (const expression of ['1+1', '2+2', '3+3', '4+4', '5+5', '6+6']) {
          typeExpression(expression);
          pressEnter();
        }

        expect(result.current.state.history).toHaveLength(MAX_HISTORY);
        const last = result.current.state.history;
        expect(last[last.length - 1]).toEqual({
          kind: 'expression',
          expression: '6+6',
          result: 12,
        });
      });
    });
  });
});
