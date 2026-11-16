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
import { languages } from '../../locales';
import { defaultTheme, themeNames } from '../themes';

const defaults = { language: 'en', theme: defaultTheme };

describe('loadConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return defaults when config file does not exist', () => {
    mocks.existsSync.mockReturnValue(false);
    expect(loadConfig()).toEqual(defaults);
    expect(mocks.readFileSync).not.toHaveBeenCalled();
  });

  it('should return the stored language and theme when valid', () => {
    mocks.existsSync.mockReturnValue(true);
    mocks.readFileSync.mockReturnValue('{"language":"es","theme":"mono"}');
    expect(loadConfig()).toEqual({ language: 'es', theme: 'mono' });
  });

  it('should default the theme when only a language is stored', () => {
    mocks.existsSync.mockReturnValue(true);
    mocks.readFileSync.mockReturnValue('{"language":"es"}');
    expect(loadConfig()).toEqual({ language: 'es', theme: defaultTheme });
  });

  it('should accept every language exposed by the locale module', () => {
    mocks.existsSync.mockReturnValue(true);
    for (const language of languages) {
      mocks.readFileSync.mockReturnValue(JSON.stringify({ language }));
      expect(loadConfig()).toEqual({ language, theme: defaultTheme });
    }
  });

  it('should accept every theme', () => {
    mocks.existsSync.mockReturnValue(true);
    for (const theme of themeNames) {
      mocks.readFileSync.mockReturnValue(JSON.stringify({ theme }));
      expect(loadConfig()).toEqual({ language: 'en', theme });
    }
  });

  it('should fall back to the default theme but keep a valid language', () => {
    mocks.existsSync.mockReturnValue(true);
    mocks.readFileSync.mockReturnValue('{"language":"de","theme":"neon"}');
    expect(loadConfig()).toEqual({ language: 'de', theme: defaultTheme });
  });

  it('should return defaults for an unknown language', () => {
    mocks.existsSync.mockReturnValue(true);
    mocks.readFileSync.mockReturnValue('{"language":"xx"}');
    expect(loadConfig()).toEqual(defaults);
  });

  it('should return defaults for malformed JSON', () => {
    mocks.existsSync.mockReturnValue(true);
    mocks.readFileSync.mockReturnValue('not json');
    expect(loadConfig()).toEqual(defaults);
  });

  it('should return defaults when reading throws', () => {
    mocks.existsSync.mockReturnValue(true);
    mocks.readFileSync.mockImplementation(() => {
      throw new Error('read failed');
    });
    expect(loadConfig()).toEqual(defaults);
  });
});

describe('saveConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create the config directory when missing', () => {
    mocks.existsSync.mockReturnValue(false);
    mocks.writeFileSync.mockImplementation(() => undefined);

    saveConfig({ language: 'fr', theme: 'ocean' });

    expect(mocks.mkdirSync).toHaveBeenCalled();
  });

  it('should write the config as JSON', () => {
    mocks.existsSync.mockReturnValue(true);
    mocks.writeFileSync.mockImplementation(() => undefined);

    saveConfig({ language: 'fr', theme: 'mono' });

    expect(mocks.writeFileSync).toHaveBeenCalledTimes(1);
    const [filePath, content] = mocks.writeFileSync.mock.calls[0];
    expect(String(filePath)).toMatch(/config\.json$/);
    expect(JSON.parse(String(content))).toEqual({
      language: 'fr',
      theme: 'mono',
    });
  });

  it('should not throw when write fails', () => {
    mocks.existsSync.mockReturnValue(true);
    mocks.writeFileSync.mockImplementation(() => {
      throw new Error('write failed');
    });

    expect(() =>
      saveConfig({ language: 'en', theme: defaultTheme })
    ).not.toThrow();
  });
});
