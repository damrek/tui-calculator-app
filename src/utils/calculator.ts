export type Operation = 'sum' | 'sub' | 'mul' | 'div';

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
        return { error: 'Error: division by zero' };
      }
      return { result: a / b };
  }
};
