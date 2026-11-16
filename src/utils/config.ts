import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { languages, defaultLanguage } from '../locales';
import type { Language } from '../locales';
import { defaultTheme, isThemeName } from './themes';
import type { ThemeName } from './themes';

const CONFIG_DIR = join(homedir(), '.calculator');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export interface Config {
  language: Language;
  theme: ThemeName;
}

function isLanguage(value: unknown): value is Language {
  return (
    typeof value === 'string' &&
    (languages as readonly string[]).includes(value)
  );
}

function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadConfig(): Config {
  try {
    if (existsSync(CONFIG_FILE)) {
      const content = readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        language: isLanguage(parsed.language)
          ? parsed.language
          : defaultLanguage,
        theme: isThemeName(parsed.theme) ? parsed.theme : defaultTheme,
      };
    }
  } catch {
    // Ignore errors, return defaults
  }
  return { language: defaultLanguage, theme: defaultTheme };
}

export function saveConfig(config: Config): void {
  try {
    ensureConfigDir();
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch {
    // Ignore write errors
  }
}
