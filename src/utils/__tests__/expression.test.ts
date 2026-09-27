import { describe, it, expect } from 'vitest';
import {
  evaluateExpression,
  isValidExpressionInput,
  insertAt,
  deleteBefore,
} from '../expression';

describe('evaluateExpression', () => {
  it('should evaluate sum', () => {
    expect(evaluateExpression('3 + 5')).toEqual({ result: 8 });
  });

  it('should respect operator precedence', () => {
    expect(evaluateExpression('3 + 5 * 2')).toEqual({ result: 13 });
  });

  it('should respect parentheses', () => {
    expect(evaluateExpression('2 * (3 + 4)')).toEqual({ result: 14 });
  });

  it('should handle decimals', () => {
    expect(evaluateExpression('1.5 + 2.5')).toEqual({ result: 4 });
  });

  it('should handle negative numbers', () => {
    expect(evaluateExpression('-3 + 4')).toEqual({ result: 1 });
  });

  it('should handle division', () => {
    expect(evaluateExpression('10/4')).toEqual({ result: 2.5 });
  });

  it('should ignore surrounding whitespace', () => {
    expect(evaluateExpression('  3 + 5  ')).toEqual({ result: 8 });
  });

  it('should return error for empty expression', () => {
    expect(evaluateExpression('')).toEqual({
      error: 'Error: empty expression',
    });
  });

  it('should return error for whitespace-only expression', () => {
    expect(evaluateExpression('   ')).toEqual({
      error: 'Error: empty expression',
    });
  });

  it('should return error for non-numeric input', () => {
    expect(evaluateExpression('abc')).toEqual({
      error: 'Error: invalid expression',
    });
  });

  it('should return error for missing operator', () => {
    expect(evaluateExpression('2 2')).toEqual({
      error: 'Error: invalid expression',
    });
  });

  it('should return error for consecutive operators', () => {
    expect(evaluateExpression('3+*5')).toEqual({
      error: 'Error: invalid expression',
    });
  });

  it('should return error for division by zero', () => {
    expect(evaluateExpression('1/0')).toEqual({
      error: 'Error: division by zero',
    });
  });

  it('should return error for zero divided by zero', () => {
    expect(evaluateExpression('0/0')).toEqual({
      error: 'Error: division by zero',
    });
  });
});

describe('isValidExpressionInput', () => {
  it('should accept digits', () => {
    expect(isValidExpressionInput('3', '5')).toBe(true);
  });

  it('should accept operators', () => {
    expect(isValidExpressionInput('3', '+')).toBe(true);
    expect(isValidExpressionInput('3', '-')).toBe(true);
    expect(isValidExpressionInput('3', '*')).toBe(true);
    expect(isValidExpressionInput('3', '/')).toBe(true);
  });

  it('should accept parentheses', () => {
    expect(isValidExpressionInput('', '(')).toBe(true);
    expect(isValidExpressionInput('2*(3+4', ')')).toBe(true);
  });

  it('should accept spaces and decimal point', () => {
    expect(isValidExpressionInput('3', ' ')).toBe(true);
    expect(isValidExpressionInput('1', '.')).toBe(true);
  });

  it('should reject letters', () => {
    expect(isValidExpressionInput('3', 'a')).toBe(false);
    expect(isValidExpressionInput('3', 'x')).toBe(false);
  });

  it('should reject invalid symbols', () => {
    expect(isValidExpressionInput('3', '^')).toBe(false);
    expect(isValidExpressionInput('3', '!')).toBe(false);
    expect(isValidExpressionInput('3', ';')).toBe(false);
    expect(isValidExpressionInput('3', ',')).toBe(false);
  });

  it('should reject closing parenthesis without opening', () => {
    expect(isValidExpressionInput('3+4', ')')).toBe(false);
  });

  it('should reject multi-character input', () => {
    expect(isValidExpressionInput('3', 'ab')).toBe(false);
  });

  it('should build a valid expression step by step', () => {
    const expression = '3 + 5 * 2';
    let current = '';
    for (const char of expression) {
      expect(isValidExpressionInput(current, char)).toBe(true);
      current += char;
    }
  });

  it('should check the opening parenthesis before the cursor', () => {
    expect(isValidExpressionInput('(1+2)', ')', '')).toBe(false);
    expect(isValidExpressionInput('(1+2)', ')', '(1+2')).toBe(true);
  });

  it('should default beforeCursor to the whole expression', () => {
    expect(isValidExpressionInput('2*(3+4', ')')).toBe(true);
  });
});

describe('insertAt', () => {
  it('should insert at the end', () => {
    expect(insertAt('3 +', 3, '5')).toEqual({ text: '3 +5', cursor: 4 });
  });

  it('should insert in the middle', () => {
    expect(insertAt('3 + 5', 3, '2')).toEqual({
      text: '3 +2 5',
      cursor: 4,
    });
  });

  it('should insert at the start', () => {
    expect(insertAt('3', 0, '1')).toEqual({ text: '13', cursor: 1 });
  });

  it('should insert into an empty text', () => {
    expect(insertAt('', 0, '7')).toEqual({ text: '7', cursor: 1 });
  });

  it('should clamp a cursor past the end', () => {
    expect(insertAt('ab', 99, 'c')).toEqual({ text: 'abc', cursor: 3 });
  });
});

describe('deleteBefore', () => {
  it('should delete the character before the cursor', () => {
    expect(deleteBefore('3 + 5', 5)).toEqual({ text: '3 + ', cursor: 4 });
  });

  it('should delete in the middle', () => {
    expect(deleteBefore('3 + 5', 2)).toEqual({ text: '3+ 5', cursor: 1 });
  });

  it('should be a no-op at the start', () => {
    expect(deleteBefore('3 + 5', 0)).toEqual({ text: '3 + 5', cursor: 0 });
  });

  it('should be a no-op on an empty text', () => {
    expect(deleteBefore('', 0)).toEqual({ text: '', cursor: 0 });
  });
});
