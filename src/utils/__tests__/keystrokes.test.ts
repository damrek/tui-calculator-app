import { describe, it, expect } from 'vitest';
import { splitKeystrokes } from '../keystrokes';

describe('splitKeystrokes', () => {
  it('should return a single char chunk as a one element array', () => {
    expect(splitKeystrokes('7')).toEqual(['7']);
  });

  it('should split a multi char chunk into one entry per char', () => {
    expect(splitKeystrokes('789')).toEqual(['7', '8', '9']);
  });

  it('should return an empty array for an empty string', () => {
    expect(splitKeystrokes('')).toEqual([]);
  });

  it('should split a run of delete characters', () => {
    expect(splitKeystrokes('\u007f\u007f\u007f')).toEqual([
      '\u007f',
      '\u007f',
      '\u007f',
    ]);
  });

  it('should keep surrogate pairs intact', () => {
    expect(splitKeystrokes('a\u{1F600}b')).toEqual(['a', '\u{1F600}', 'b']);
  });

  it('should treat a raw escape character as a regular entry', () => {
    expect(splitKeystrokes('ab\u001bcd')).toEqual([
      'a',
      'b',
      '\u001b',
      'c',
      'd',
    ]);
  });

  it('should not filter or classify entries', () => {
    expect(splitKeystrokes('1x.\u0000')).toEqual(['1', 'x', '.', '\u0000']);
  });
});
