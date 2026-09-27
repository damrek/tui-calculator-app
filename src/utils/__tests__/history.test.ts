import { describe, it, expect } from 'vitest';
import {
  HistoryEntry,
  AppState,
  appendHistory,
  MAX_HISTORY,
} from '../../hooks/useAppInput';
import { Operation } from '../calculator';

const makeCalculation = (
  a: number,
  b: number,
  operation: Operation,
  result: number
): HistoryEntry => ({ kind: 'calculation', a, b, operation, result });

const makeExpression = (expression: string, result: number): HistoryEntry => ({
  kind: 'expression',
  expression,
  result,
});

const baseState: AppState = {
  screen: 'menu',
  selectedIndex: 0,
  inputIndex: 0,
  inputs: ['', ''],
  expressionInput: '',
  expressionCursor: 0,
  operation: null,
  history: [],
};

describe('HistoryEntry type', () => {
  it('should create a valid calculation entry for sum', () => {
    const entry = makeCalculation(3, 5, 'sum', 8);
    expect(entry).toEqual({
      kind: 'calculation',
      a: 3,
      b: 5,
      operation: 'sum',
      result: 8,
    });
  });

  it('should create a valid calculation entry for sub', () => {
    const entry = makeCalculation(10, 4, 'sub', 6);
    expect(entry).toEqual({
      kind: 'calculation',
      a: 10,
      b: 4,
      operation: 'sub',
      result: 6,
    });
  });

  it('should create a valid calculation entry for mul', () => {
    const entry = makeCalculation(3, 7, 'mul', 21);
    expect(entry).toEqual({
      kind: 'calculation',
      a: 3,
      b: 7,
      operation: 'mul',
      result: 21,
    });
  });

  it('should create a valid calculation entry for div', () => {
    const entry = makeCalculation(20, 4, 'div', 5);
    expect(entry).toEqual({
      kind: 'calculation',
      a: 20,
      b: 4,
      operation: 'div',
      result: 5,
    });
  });

  it('should create a valid expression entry', () => {
    const entry = makeExpression('3 + 5 * 2', 13);
    expect(entry).toEqual({
      kind: 'expression',
      expression: '3 + 5 * 2',
      result: 13,
    });
  });
});

describe('History FIFO behavior', () => {
  it('should keep only the last MAX_HISTORY entries', () => {
    let history: HistoryEntry[] = [];

    for (let i = 0; i < MAX_HISTORY + 3; i++) {
      history = appendHistory(history, makeCalculation(i, 1, 'sum', i + 1));
    }

    expect(history).toHaveLength(MAX_HISTORY);
    expect(history[0]).toEqual(makeCalculation(3, 1, 'sum', 4));
    expect(history[MAX_HISTORY - 1]).toEqual(
      makeCalculation(MAX_HISTORY + 2, 1, 'sum', MAX_HISTORY + 3)
    );
  });

  it('should append new entries at the end', () => {
    let history: HistoryEntry[] = [];

    history = appendHistory(history, makeCalculation(1, 2, 'sum', 3));
    history = appendHistory(history, makeCalculation(4, 5, 'sub', -1));

    expect(history).toHaveLength(2);
    expect(history[0]).toEqual(makeCalculation(1, 2, 'sum', 3));
    expect(history[1]).toEqual(makeCalculation(4, 5, 'sub', -1));
  });

  it('should not exceed MAX_HISTORY limit', () => {
    let history: HistoryEntry[] = [];

    for (let i = 0; i < 100; i++) {
      history = appendHistory(history, makeCalculation(i, 0, 'sum', i));
    }

    expect(history).toHaveLength(MAX_HISTORY);
  });

  it('should drop the oldest entries regardless of their kind', () => {
    let history: HistoryEntry[] = [];

    history = appendHistory(history, makeCalculation(2, 3, 'mul', 6));
    history = appendHistory(history, makeExpression('10/4', 2.5));
    for (let i = 0; i < MAX_HISTORY; i++) {
      history = appendHistory(history, makeCalculation(i, 1, 'sub', i));
    }

    expect(history).toHaveLength(MAX_HISTORY);
    expect(history[0]).toEqual(makeCalculation(0, 1, 'sub', 0));
    expect(history[MAX_HISTORY - 1]).toEqual(
      makeCalculation(MAX_HISTORY - 1, 1, 'sub', MAX_HISTORY - 1)
    );
  });
});

describe('AppState with history', () => {
  it('should initialize with empty history', () => {
    expect(baseState.history).toEqual([]);
  });

  it('should allow adding entries to history', () => {
    const state: AppState = { ...baseState };
    const entry = makeCalculation(2, 3, 'mul', 6);
    state.history = [...state.history, entry];
    expect(state.history).toHaveLength(1);
    expect(state.history[0]).toEqual(entry);
  });
});
