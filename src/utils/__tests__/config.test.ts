import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

vi.mock('fs', () => ({
  default: {
    existsSync: mocks.existsSync,
    readFileSync: mocks.readFileSync,
    writeFileSync: mocks.writeFileSync,
    mkdirSync: mocks.mkdirSync,
  },
  existsSync: mocks.existsSync,
  readFileSync: mocks.readFileSync,
  writeFileSync: mocks.writeFileSync,
  mkdirSync: mocks.mkdirSync,
}));

import { loadConfig, saveConfig } from '../config';

describe('loadConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return default english when config file does not exist', () => {
    mocks.existsSync.mockReturnValue(false);
    expect(loadConfig()).toEqual({ language: 'en' });
    expect(mocks.readFileSync).not.toHaveBeenCalled();
  });

  it('should return the stored language when valid', () => {
    mocks.existsSync.mockReturnValue(true);
    mocks.readFileSync.mockReturnValue('{"language":"es"}');
    expect(loadConfig()).toEqual({ language: 'es' });
  });

  it('should return default english for an unknown language', () => {
    mocks.existsSync.mockReturnValue(true);
    mocks.readFileSync.mockReturnValue('{"language":"xx"}');
    expect(loadConfig()).toEqual({ language: 'en' });
  });

  it('should return default english for malformed JSON', () => {
    mocks.existsSync.mockReturnValue(true);
    mocks.readFileSync.mockReturnValue('not json');
    expect(loadConfig()).toEqual({ language: 'en' });
  });

  it('should return default english when reading throws', () => {
    mocks.existsSync.mockReturnValue(true);
    mocks.readFileSync.mockImplementation(() => {
      throw new Error('read failed');
    });
    expect(loadConfig()).toEqual({ language: 'en' });
  });
});

describe('saveConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create the config directory when missing', () => {
    mocks.existsSync.mockReturnValue(false);
    mocks.writeFileSync.mockImplementation(() => undefined);

    saveConfig({ language: 'fr' });

    expect(mocks.mkdirSync).toHaveBeenCalled();
  });

  it('should write the config as JSON', () => {
    mocks.existsSync.mockReturnValue(true);
    mocks.writeFileSync.mockImplementation(() => undefined);

    saveConfig({ language: 'fr' });

    expect(mocks.writeFileSync).toHaveBeenCalledTimes(1);
    const [filePath, content] = mocks.writeFileSync.mock.calls[0];
    expect(String(filePath)).toMatch(/config\.json$/);
    expect(JSON.parse(String(content))).toEqual({ language: 'fr' });
  });

  it('should not throw when write fails', () => {
    mocks.existsSync.mockReturnValue(true);
    mocks.writeFileSync.mockImplementation(() => {
      throw new Error('write failed');
    });

    expect(() => saveConfig({ language: 'en' })).not.toThrow();
  });
});
