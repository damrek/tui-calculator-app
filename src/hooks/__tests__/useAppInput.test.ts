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

import { useAppInput } from '../useAppInput';

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

const fillBinaryInput = (a: string, b: string) => {
  fireKey(a, {});
  fireKey('', { downArrow: true });
  fireKey(b, {});
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
      for (let i = 0; i < 4; i++) {
        fireKey('', { downArrow: true });
      }
      fireKey('', { return: true });
      const expression = '3 + 5 * 2';
      for (const char of expression) {
        fireKey(char, {});
      }

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
});
