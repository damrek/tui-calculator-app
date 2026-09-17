import { describe, it, expect } from 'vitest';
import { evaluateExpression, isValidExpressionInput } from '../expression';

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
});
