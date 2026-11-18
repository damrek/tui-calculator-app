import { describe, it, expect, vi, beforeEach } from 'vitest';

const fsMocks = vi.hoisted(() => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

vi.mock('fs', () => ({
  default: {
    existsSync: fsMocks.existsSync,
    readFileSync: fsMocks.readFileSync,
    writeFileSync: fsMocks.writeFileSync,
    mkdirSync: fsMocks.mkdirSync,
  },
  existsSync: fsMocks.existsSync,
  readFileSync: fsMocks.readFileSync,
  writeFileSync: fsMocks.writeFileSync,
  mkdirSync: fsMocks.mkdirSync,
}));

import {
  loadHistory,
  saveHistory,
  appendHistory,
  MAX_HISTORY,
} from '../history';
import type { HistoryEntry } from '../history';
import type { AppState as HookAppState } from '../../hooks/useAppInput';
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

const baseState: HookAppState = {
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

describe('loadHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return an empty array when the history file does not exist', () => {
    fsMocks.existsSync.mockReturnValue(false);
    expect(loadHistory()).toEqual([]);
    expect(fsMocks.readFileSync).not.toHaveBeenCalled();
  });

  it('should load valid calculation and expression entries', () => {
    fsMocks.existsSync.mockReturnValue(true);
    fsMocks.readFileSync.mockReturnValue(
      JSON.stringify([
        makeCalculation(3, 5, 'sum', 8),
        makeExpression('3 + 5 * 2', 13),
      ])
    );
    expect(loadHistory()).toEqual([
      makeCalculation(3, 5, 'sum', 8),
      makeExpression('3 + 5 * 2', 13),
    ]);
  });

  it('should drop invalid entries and keep valid ones', () => {
    fsMocks.existsSync.mockReturnValue(true);
    fsMocks.readFileSync.mockReturnValue(
      JSON.stringify([
        makeCalculation(3, 5, 'sum', 8),
        { kind: 'expression', expression: 'missing result' },
        { kind: 'calculation', a: 1, b: 2, operation: 'modulo', result: 3 },
        { kind: 'unknown' },
        'not an object',
        makeExpression('10/4', 2.5),
      ])
    );
    expect(loadHistory()).toEqual([
      makeCalculation(3, 5, 'sum', 8),
      makeExpression('10/4', 2.5),
    ]);
  });

  it('should return an empty array on corrupt JSON', () => {
    fsMocks.existsSync.mockReturnValue(true);
    fsMocks.readFileSync.mockReturnValue('{not valid json');
    expect(loadHistory()).toEqual([]);
  });

  it('should return an empty array when the file is not a JSON array', () => {
    fsMocks.existsSync.mockReturnValue(true);
    fsMocks.readFileSync.mockReturnValue('{"language":"es"}');
    expect(loadHistory()).toEqual([]);
  });

  it('should keep only the last MAX_HISTORY entries from disk', () => {
    fsMocks.existsSync.mockReturnValue(true);
    const entries: HistoryEntry[] = [];
    for (let i = 0; i < MAX_HISTORY + 2; i++) {
      entries.push(makeCalculation(i, 1, 'sum', i + 1));
    }
    fsMocks.readFileSync.mockReturnValue(JSON.stringify(entries));

    const loaded = loadHistory();

    expect(loaded).toHaveLength(MAX_HISTORY);
    expect(loaded[0]).toEqual(makeCalculation(2, 1, 'sum', 3));
  });
});

describe('saveHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should write the history as JSON to the history file', () => {
    fsMocks.existsSync.mockReturnValue(true);
    const history = [makeCalculation(2, 3, 'mul', 6)];

    saveHistory(history);

    expect(fsMocks.writeFileSync).toHaveBeenCalledTimes(1);
    const [path, content] = fsMocks.writeFileSync.mock.calls[0];
    expect(String(path)).toContain('history.json');
    expect(JSON.parse(content as string)).toEqual(history);
  });

  it('should create the config directory when it does not exist', () => {
    fsMocks.existsSync.mockReturnValue(false);

    saveHistory([]);

    expect(fsMocks.mkdirSync).toHaveBeenCalledWith(expect.any(String), {
      recursive: true,
    });
    expect(fsMocks.writeFileSync).toHaveBeenCalledTimes(1);
  });

  it('should not throw when the write fails', () => {
    fsMocks.existsSync.mockReturnValue(true);
    fsMocks.writeFileSync.mockImplementation(() => {
      throw new Error('EACCES');
    });

    expect(() => saveHistory([])).not.toThrow();
  });
});

describe('AppState with history', () => {
  it('should initialize with empty history', () => {
    expect(baseState.history).toEqual([]);
  });

  it('should allow adding entries to history', () => {
    const state: HookAppState = { ...baseState };
    const entry = makeCalculation(2, 3, 'mul', 6);
    state.history = [...state.history, entry];
    expect(state.history).toHaveLength(1);
    expect(state.history[0]).toEqual(entry);
  });
});
