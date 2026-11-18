import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { CONFIG_DIR, ensureConfigDir } from './config';
import type { Operation } from './calculator';

const HISTORY_FILE = join(CONFIG_DIR, 'history.json');

export type HistoryEntry =
  | {
      kind: 'calculation';
      a: number;
      b: number;
      operation: Operation;
      result: number;
    }
  | { kind: 'expression'; expression: string; result: number };

export const MAX_HISTORY = 5;

export const appendHistory = (
  history: HistoryEntry[],
  entry: HistoryEntry
): HistoryEntry[] => [...history, entry].slice(-MAX_HISTORY);

const OPERATIONS: readonly Operation[] = ['sum', 'sub', 'mul', 'div'];

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

export const isHistoryEntry = (value: unknown): value is HistoryEntry => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const entry = value as Record<string, unknown>;
  if (entry.kind === 'expression') {
    return typeof entry.expression === 'string' && isFiniteNumber(entry.result);
  }
  if (entry.kind === 'calculation') {
    return (
      isFiniteNumber(entry.a) &&
      isFiniteNumber(entry.b) &&
      isFiniteNumber(entry.result) &&
      typeof entry.operation === 'string' &&
      (OPERATIONS as readonly string[]).includes(entry.operation)
    );
  }
  return false;
};

export function loadHistory(): HistoryEntry[] {
  try {
    if (existsSync(HISTORY_FILE)) {
      const parsed: unknown = JSON.parse(readFileSync(HISTORY_FILE, 'utf-8'));
      if (Array.isArray(parsed)) {
        return parsed.filter(isHistoryEntry).slice(-MAX_HISTORY);
      }
    }
  } catch {
    // Ignore errors, return an empty history
  }
  return [];
}

export function saveHistory(history: HistoryEntry[]): void {
  try {
    ensureConfigDir();
    writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
  } catch {
    // Ignore write errors
  }
}
