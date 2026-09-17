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

import { useLanguage } from '../useLanguage';
import { getLanguage } from '../../locales';

const fireKey = (input: string, key: Record<string, boolean>) => {
  act(() => {
    handlerHolder.current(input, { ctrl: false, ...key });
  });
};

describe('useLanguage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configMocks.loadConfig.mockReturnValue({ language: 'en' });
  });

  it('should initialize from config', () => {
    const { result } = renderHook(() => useLanguage());
    expect(result.current.language).toBe('en');
    expect(result.current.showSelector).toBe(false);
    expect(configMocks.loadConfig).toHaveBeenCalled();
  });

  it('should open the selector on Ctrl+L', () => {
    const { result } = renderHook(() => useLanguage());
    fireKey('l', { ctrl: true });
    expect(result.current.showSelector).toBe(true);
  });

  it('should navigate languages with arrows', () => {
    const { result } = renderHook(() => useLanguage());
    fireKey('l', { ctrl: true });
    fireKey('', { upArrow: true });
    expect(result.current.selectorIndex).toBe(2);
    fireKey('', { downArrow: true });
    expect(result.current.selectorIndex).toBe(0);
  });

  it('should select the language and persist it', () => {
    const { result } = renderHook(() => useLanguage());
    fireKey('l', { ctrl: true });
    fireKey('', { downArrow: true });
    fireKey('', { downArrow: true });
    fireKey('', { return: true });

    expect(result.current.showSelector).toBe(false);
    expect(configMocks.saveConfig).toHaveBeenCalledWith({ language: 'fr' });
    expect(result.current.language).toBe('fr');
    expect(getLanguage()).toBe('fr');
  });

  it('should cancel the selector with Esc without saving', () => {
    const { result } = renderHook(() => useLanguage());
    fireKey('l', { ctrl: true });
    fireKey('', { escape: true });

    expect(result.current.showSelector).toBe(false);
    expect(configMocks.saveConfig).not.toHaveBeenCalled();
  });

  it('should reset selector index to the current language when opened', () => {
    configMocks.loadConfig.mockReturnValue({ language: 'fr' });
    const { result } = renderHook(() => useLanguage());
    fireKey('l', { ctrl: true });
    expect(result.current.selectorIndex).toBe(2);
  });
});
