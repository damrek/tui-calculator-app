import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const handlerHolder = vi.hoisted(() => ({
  current: null as unknown as (
    input: string,
    key: Record<string, boolean>
  ) => void,
}));

const configMocks = vi.hoisted(() => ({
  loadConfig: vi.fn(),
  saveConfig: vi.fn(),
}));

vi.mock('ink', () => ({
  useInput: (
    handler: (input: string, key: Record<string, boolean>) => void
  ) => {
    handlerHolder.current = handler;
  },
}));

vi.mock('../../utils/config', () => configMocks);

import { useTheme } from '../useTheme';
import { themeNames } from '../../utils/themes';

const fireKey = (input: string, key: Record<string, boolean>) => {
  act(() => {
    handlerHolder.current(input, { ctrl: false, ...key });
  });
};

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configMocks.loadConfig.mockReturnValue({
      language: 'en',
      theme: 'ocean',
    });
  });

  it('should initialize from config and expose its colors', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('ocean');
    expect(result.current.colors.border).toBe('cyan');
    expect(result.current.showSelector).toBe(false);
  });

  it('should open the selector on Ctrl+T', () => {
    const { result } = renderHook(() => useTheme());
    fireKey('t', { ctrl: true });
    expect(result.current.showSelector).toBe(true);
  });

  it('should not react to Ctrl+T when the hotkey is disabled', () => {
    const { result } = renderHook(() => useTheme({ enableHotkey: false }));
    fireKey('t', { ctrl: true });
    expect(result.current.showSelector).toBe(false);
  });

  it('should navigate themes with arrows and wrap around', () => {
    const { result } = renderHook(() => useTheme());
    fireKey('t', { ctrl: true });
    fireKey('', { downArrow: true });
    expect(result.current.selectorIndex).toBe(1);
    fireKey('', { upArrow: true });
    fireKey('', { upArrow: true });
    expect(result.current.selectorIndex).toBe(themeNames.length - 1);
  });

  it('should reset the selector index to the current theme on open', () => {
    configMocks.loadConfig.mockReturnValue({ language: 'en', theme: 'sunset' });
    const { result } = renderHook(() => useTheme());
    fireKey('t', { ctrl: true });
    expect(result.current.selectorIndex).toBe(themeNames.indexOf('sunset'));
  });

  it('should apply the theme and persist it without dropping the language', () => {
    const { result } = renderHook(() => useTheme());
    fireKey('t', { ctrl: true });
    fireKey('', { downArrow: true });
    fireKey('', { return: true });

    expect(result.current.showSelector).toBe(false);
    expect(result.current.theme).toBe(themeNames[1]);
    expect(configMocks.saveConfig).toHaveBeenCalledWith({
      language: 'en',
      theme: themeNames[1],
    });
  });

  it('should cancel with Esc without saving', () => {
    const { result } = renderHook(() => useTheme());
    fireKey('t', { ctrl: true });
    fireKey('', { escape: true });

    expect(result.current.showSelector).toBe(false);
    expect(configMocks.saveConfig).not.toHaveBeenCalled();
  });
});
