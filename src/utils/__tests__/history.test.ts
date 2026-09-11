import { describe, it, expect } from 'vitest';
import { HistoryEntry, AppState } from '../../hooks/useAppInput';

const makeEntry = (
  a: number,
  b: number,
  operation: HistoryEntry['operation'],
  result: number
): HistoryEntry => ({ a, b, operation, result });

describe('HistoryEntry type', () => {
  it('should create a valid history entry for sum', () => {
    const entry = makeEntry(3, 5, 'sum', 8);
    expect(entry).toEqual({ a: 3, b: 5, operation: 'sum', result: 8 });
  });

  it('should create a valid history entry for sub', () => {
    const entry = makeEntry(10, 4, 'sub', 6);
    expect(entry).toEqual({ a: 10, b: 4, operation: 'sub', result: 6 });
  });

  it('should create a valid history entry for mul', () => {
    const entry = makeEntry(3, 7, 'mul', 21);
    expect(entry).toEqual({ a: 3, b: 7, operation: 'mul', result: 21 });
  });

  it('should create a valid history entry for div', () => {
    const entry = makeEntry(20, 4, 'div', 5);
    expect(entry).toEqual({ a: 20, b: 4, operation: 'div', result: 5 });
  });
});

describe('History FIFO behavior', () => {
  it('should keep only last N entries (simulating MAX_HISTORY=3)', () => {
    const MAX_HISTORY = 3;
    let history: HistoryEntry[] = [];

    for (let i = 0; i < 8; i++) {
      history = [...history, makeEntry(i, 1, 'sum', i + 1)].slice(-MAX_HISTORY);
    }

    expect(history).toHaveLength(3);
    expect(history[0]).toEqual({ a: 5, b: 1, operation: 'sum', result: 6 });
    expect(history[2]).toEqual({ a: 7, b: 1, operation: 'sum', result: 8 });
  });

  it('should append new entries at the end', () => {
    const MAX_HISTORY = 3;
    let history: HistoryEntry[] = [];

    history = [...history, makeEntry(1, 2, 'sum', 3)].slice(-MAX_HISTORY);
    history = [...history, makeEntry(4, 5, 'sub', -1)].slice(-MAX_HISTORY);

    expect(history).toHaveLength(2);
    expect(history[0]).toEqual({ a: 1, b: 2, operation: 'sum', result: 3 });
    expect(history[1]).toEqual({ a: 4, b: 5, operation: 'sub', result: -1 });
  });

  it('should not exceed MAX_HISTORY limit', () => {
    const MAX_HISTORY = 3;
    let history: HistoryEntry[] = [];

    for (let i = 0; i < 100; i++) {
      history = [...history, makeEntry(i, 0, 'sum', i)].slice(-MAX_HISTORY);
    }

    expect(history).toHaveLength(MAX_HISTORY);
  });
});

describe('AppState with history', () => {
  it('should initialize with empty history', () => {
    const state: AppState = {
      screen: 'menu',
      selectedIndex: 0,
      inputIndex: 0,
      inputs: ['', ''],
      operation: null,
      history: [],
    };
    expect(state.history).toEqual([]);
  });

  it('should allow adding entries to history', () => {
    const state: AppState = {
      screen: 'menu',
      selectedIndex: 0,
      inputIndex: 0,
      inputs: ['', ''],
      operation: null,
      history: [],
    };
    const entry = makeEntry(2, 3, 'mul', 6);
    state.history = [...state.history, entry];
    expect(state.history).toHaveLength(1);
    expect(state.history[0]).toEqual(entry);
  });
});
