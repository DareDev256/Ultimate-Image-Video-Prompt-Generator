import { homedir } from 'os';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

export interface Config {
  defaultPreset: string;
  lastUsedTemplate: string;
}

const CONFIG_DIR = join(homedir(), '.prompt-gen');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  const presetsDir = join(CONFIG_DIR, 'presets');
  if (!existsSync(presetsDir)) {
    mkdirSync(presetsDir, { recursive: true });
  }
}

export function loadConfig(): Config {
  ensureConfigDir();
  if (!existsSync(CONFIG_FILE)) {
    return { defaultPreset: 'standard', lastUsedTemplate: '' };
  }
  return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
}

export function saveConfig(config: Config) {
  ensureConfigDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getConfigDir() {
  return CONFIG_DIR;
}
