import { Parser } from 'expr-eval';
import { CalculateOutput } from './calculator';

const parser = new Parser();

const EXPRESSION_CHARS = /^[0-9+\-*/(). ]$/;

export interface TextEdit {
  text: string;
  cursor: number;
}

export const isValidExpressionInput = (
  current: string,
  newChar: string,
  beforeCursor: string = current
): boolean => {
  if (newChar.length !== 1) {
    return false;
  }
  if (!EXPRESSION_CHARS.test(newChar)) {
    return false;
  }
  if (newChar === ')' && !beforeCursor.includes('(')) {
    return false;
  }
  return true;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const insertAt = (
  text: string,
  cursor: number,
  newChar: string
): TextEdit => {
  const position = clamp(cursor, 0, text.length);
  return {
    text: text.slice(0, position) + newChar + text.slice(position),
    cursor: position + 1,
  };
};

export const deleteBefore = (text: string, cursor: number): TextEdit => {
  const position = clamp(cursor, 0, text.length);
  if (position === 0) {
    return { text, cursor: position };
  }
  return {
    text: text.slice(0, position - 1) + text.slice(position),
    cursor: position - 1,
  };
};

export const evaluateExpression = (input: string): CalculateOutput => {
  const trimmed = input.trim();
  if (trimmed === '') {
    return { error: 'Error: empty expression' };
  }
  try {
    const output = parser.parse(trimmed).evaluate();
    if (typeof output !== 'number' || !Number.isFinite(output)) {
      return { error: 'Error: division by zero' };
    }
    return { result: output };
  } catch {
    return { error: 'Error: invalid expression' };
  }
};
