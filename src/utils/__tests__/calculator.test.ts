import { describe, it, expect } from 'vitest';
import { calculate, parseInput } from '../calculator';

describe('parseInput', () => {
  it('should parse valid positive integer', () => {
    expect(parseInput('42')).toBe(42);
  });

  it('should parse valid negative integer', () => {
    expect(parseInput('-10')).toBe(-10);
  });

  it('should parse valid decimal', () => {
    expect(parseInput('3.14')).toBe(3.14);
  });

  it('should parse negative decimal', () => {
    expect(parseInput('-2.5')).toBe(-2.5);
  });

  it('should return 0 for empty string', () => {
    expect(parseInput('')).toBe(0);
  });

  it('should return 0 for invalid string', () => {
    expect(parseInput('abc')).toBe(0);
  });

  it('should return 0 for whitespace string', () => {
    expect(parseInput('   ')).toBe(0);
  });
});

describe('calculate - sum', () => {
  it('should add two positive numbers', () => {
    expect(calculate(2, 3, 'sum')).toEqual({ result: 5 });
  });

  it('should add negative and positive', () => {
    expect(calculate(-5, 10, 'sum')).toEqual({ result: 5 });
  });

  it('should add two negative numbers', () => {
    expect(calculate(-3, -4, 'sum')).toEqual({ result: -7 });
  });

  it('should add decimals', () => {
    expect(calculate(1.5, 2.5, 'sum')).toEqual({ result: 4 });
  });

  it('should add zero', () => {
    expect(calculate(5, 0, 'sum')).toEqual({ result: 5 });
  });
});

describe('calculate - subtract', () => {
  it('should subtract two positive numbers', () => {
    expect(calculate(10, 4, 'sub')).toEqual({ result: 6 });
  });

  it('should subtract resulting in negative', () => {
    expect(calculate(3, 8, 'sub')).toEqual({ result: -5 });
  });

  it('should subtract with negative numbers', () => {
    expect(calculate(-5, -3, 'sub')).toEqual({ result: -2 });
  });

  it('should subtract decimals', () => {
    expect(calculate(5.5, 2.2, 'sub')).toEqual({ result: 3.3 });
  });

  it('should subtract zero', () => {
    expect(calculate(7, 0, 'sub')).toEqual({ result: 7 });
  });
});

describe('calculate - multiply', () => {
  it('should multiply two positive numbers', () => {
    expect(calculate(3, 4, 'mul')).toEqual({ result: 12 });
  });

  it('should multiply by zero', () => {
    expect(calculate(100, 0, 'mul')).toEqual({ result: 0 });
  });

  it('should multiply negative numbers', () => {
    expect(calculate(-2, 5, 'mul')).toEqual({ result: -10 });
  });

  it('should multiply two negative numbers', () => {
    expect(calculate(-3, -4, 'mul')).toEqual({ result: 12 });
  });

  it('should multiply decimals', () => {
    expect(calculate(2.5, 2, 'mul')).toEqual({ result: 5 });
  });
});

describe('calculate - divide', () => {
  it('should divide two positive numbers', () => {
    expect(calculate(20, 4, 'div')).toEqual({ result: 5 });
  });

  it('should divide with decimal result', () => {
    const result = calculate(10, 3, 'div');
    expect('result' in result && result.result).toBeCloseTo(3.333333, 5);
  });

  it('should divide negative numbers', () => {
    expect(calculate(-10, 2, 'div')).toEqual({ result: -5 });
  });

  it('should divide by one', () => {
    expect(calculate(7, 1, 'div')).toEqual({ result: 7 });
  });

  it('should return error for division by zero', () => {
    expect(calculate(10, 0, 'div')).toEqual({
      error: 'Error: division by zero',
    });
  });
});
