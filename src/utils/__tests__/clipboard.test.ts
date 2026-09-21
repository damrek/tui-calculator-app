import { describe, it, expect, vi } from 'vitest';
import clipboardy from 'clipboardy';
import { copyToClipboard } from '../clipboard';

vi.mock('clipboardy', () => ({
  default: { write: vi.fn() },
}));

describe('copyToClipboard', () => {
  beforeEach(() => {
    vi.mocked(clipboardy.write).mockReset();
  });

  it('should return true on successful copy', async () => {
    vi.mocked(clipboardy.write).mockResolvedValue(undefined);
    expect(await copyToClipboard('8')).toBe(true);
    expect(clipboardy.write).toHaveBeenCalledWith('8');
  });

  it('should return false when clipboard write fails', async () => {
    vi.mocked(clipboardy.write).mockRejectedValue(
      new Error('No xclip installed')
    );
    expect(await copyToClipboard('8')).toBe(false);
    expect(clipboardy.write).toHaveBeenCalledWith('8');
  });

  it('should never throw when clipboard is unavailable', async () => {
    vi.mocked(clipboardy.write).mockRejectedValue(new Error('clipboard error'));
    await expect(copyToClipboard('8')).resolves.toBe(false);
  });
});
