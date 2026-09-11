import { describe, it, expect } from 'vitest';
import { isValidInput } from '../../hooks/useAppInput';

describe('isValidInput', () => {
  describe('digits', () => {
    it('should allow digits on empty input', () => {
      expect(isValidInput('', '5')).toBe(true);
    });

    it('should allow digits after existing digits', () => {
      expect(isValidInput('12', '3')).toBe(true);
    });

    it('should allow digits after a decimal point', () => {
      expect(isValidInput('3.', '1')).toBe(true);
    });

    it('should allow digits after a negative sign', () => {
      expect(isValidInput('-', '5')).toBe(true);
    });
  });

  describe('decimal point', () => {
    it('should allow decimal point on empty input', () => {
      expect(isValidInput('', '.')).toBe(true);
    });

    it('should allow decimal point after digits', () => {
      expect(isValidInput('5', '.')).toBe(true);
    });

    it('should reject second decimal point', () => {
      expect(isValidInput('3.1', '.')).toBe(false);
    });

    it('should reject decimal point immediately after first decimal', () => {
      expect(isValidInput('3.', '.')).toBe(false);
    });
  });

  describe('negative sign', () => {
    it('should allow negative sign on empty input', () => {
      expect(isValidInput('', '-')).toBe(true);
    });

    it('should reject negative sign after digits', () => {
      expect(isValidInput('5', '-')).toBe(false);
    });

    it('should reject negative sign after decimal', () => {
      expect(isValidInput('3.', '-')).toBe(false);
    });

    it('should reject negative sign after another negative', () => {
      expect(isValidInput('-', '-')).toBe(false);
    });

    it('should reject negative sign after negative and digit', () => {
      expect(isValidInput('-5', '-')).toBe(false);
    });
  });

  describe('complex valid sequences', () => {
    it('should allow building "-3.14" step by step', () => {
      expect(isValidInput('', '-')).toBe(true);
      expect(isValidInput('-', '3')).toBe(true);
      expect(isValidInput('-3', '.')).toBe(true);
      expect(isValidInput('-3.', '1')).toBe(true);
      expect(isValidInput('-3.1', '4')).toBe(true);
    });

    it('should allow building "12.5" step by step', () => {
      expect(isValidInput('', '1')).toBe(true);
      expect(isValidInput('1', '2')).toBe(true);
      expect(isValidInput('12', '.')).toBe(true);
      expect(isValidInput('12.', '5')).toBe(true);
    });
  });
});
