import { describe, it, expect } from 'vitest';
import { HistoryEntry, AppState } from '../../hooks/useAppInput';
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
  it('should keep only last N entries (simulating MAX_HISTORY=3)', () => {
    const MAX_HISTORY = 3;
    let history: HistoryEntry[] = [];

    for (let i = 0; i < 8; i++) {
      history = [...history, makeCalculation(i, 1, 'sum', i + 1)].slice(
        -MAX_HISTORY
      );
    }

    expect(history).toHaveLength(3);
    expect(history[0]).toEqual(makeCalculation(5, 1, 'sum', 6));
    expect(history[2]).toEqual(makeCalculation(7, 1, 'sum', 8));
  });

  it('should append new entries at the end', () => {
    const MAX_HISTORY = 3;
    let history: HistoryEntry[] = [];

    history = [...history, makeCalculation(1, 2, 'sum', 3)].slice(-MAX_HISTORY);
    history = [...history, makeCalculation(4, 5, 'sub', -1)].slice(
      -MAX_HISTORY
    );

    expect(history).toHaveLength(2);
    expect(history[0]).toEqual(makeCalculation(1, 2, 'sum', 3));
    expect(history[1]).toEqual(makeCalculation(4, 5, 'sub', -1));
  });

  it('should not exceed MAX_HISTORY limit', () => {
    const MAX_HISTORY = 3;
    let history: HistoryEntry[] = [];

    for (let i = 0; i < 100; i++) {
      history = [...history, makeCalculation(i, 0, 'sum', i)].slice(
        -MAX_HISTORY
      );
    }

    expect(history).toHaveLength(MAX_HISTORY);
  });

  it('should mix calculation and expression entries', () => {
    const MAX_HISTORY = 3;
    let history: HistoryEntry[] = [];

    history = [
      ...history,
      makeCalculation(2, 3, 'mul', 6),
      makeExpression('10/4', 2.5),
      makeCalculation(7, 1, 'sub', 6),
    ].slice(-MAX_HISTORY);

    expect(history).toHaveLength(3);
    expect(history[1]).toEqual(makeExpression('10/4', 2.5));
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
