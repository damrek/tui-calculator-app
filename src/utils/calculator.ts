export type Operation = 'sum' | 'sub' | 'mul' | 'div';

/** Shared error contract: matched by callers to localize the message. */
export const DIVISION_BY_ZERO_ERROR = 'Error: division by zero';

export const getOperationSymbol = (
  operation: Operation | null | undefined
): string => {
  switch (operation) {
    case 'sum':
      return '+';
    case 'sub':
      return '-';
    case 'mul':
      return '*';
    case 'div':
      return '/';
    default:
      return '';
  }
};

export interface CalculateResult {
  result: number;
}

export interface CalculateError {
  error: string;
}

export type CalculateOutput = CalculateResult | CalculateError;

export const parseInput = (input: string): number => {
  const parsed = parseFloat(input);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export const calculate = (
  a: number,
  b: number,
  operation: Operation
): CalculateOutput => {
  switch (operation) {
    case 'sum':
      return { result: a + b };
    case 'sub':
      return { result: a - b };
    case 'mul':
      return { result: a * b };
    case 'div':
      if (b === 0) {
        return { error: DIVISION_BY_ZERO_ERROR };
      }
      return { result: a / b };
  }
};
