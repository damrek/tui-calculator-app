import { Parser } from 'expr-eval';
import { CalculateOutput } from './calculator';

const parser = new Parser();

const EXPRESSION_CHARS = /^[0-9+\-*/().\s]$/;

export const isValidExpressionInput = (
  current: string,
  newChar: string
): boolean => {
  if (newChar.length !== 1) {
    return false;
  }
  if (!EXPRESSION_CHARS.test(newChar)) {
    return false;
  }
  if (newChar === ')' && !current.includes('(')) {
    return false;
  }
  return true;
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
