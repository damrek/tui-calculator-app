import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const CONFIG_DIR = join(homedir(), '.calculator');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export interface Config {
  language: 'en' | 'es' | 'fr';
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
      if (parsed.language && ['en', 'es', 'fr'].includes(parsed.language)) {
        return { language: parsed.language };
      }
    }
  } catch {
    // Ignore errors, return default
  }
  return { language: 'en' };
}

export function saveConfig(config: Config): void {
  try {
    ensureConfigDir();
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch {
    // Ignore write errors
  }
}
