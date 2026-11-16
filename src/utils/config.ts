import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { languages, defaultLanguage } from '../locales';
import type { Language } from '../locales';

const CONFIG_DIR = join(homedir(), '.calculator');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export interface Config {
  language: Language;
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
      if (isLanguage(parsed.language)) {
        return { language: parsed.language };
      }
    }
  } catch {
    // Ignore errors, return default
  }
  return { language: defaultLanguage };
}

export function saveConfig(config: Config): void {
  try {
    ensureConfigDir();
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch {
    // Ignore write errors
  }
}
