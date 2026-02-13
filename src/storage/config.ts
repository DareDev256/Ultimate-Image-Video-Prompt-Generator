import { homedir } from 'os';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { JsonStore } from '../lib/json-store';

export interface Config {
  defaultPreset: string;
  lastUsedTemplate: string;
}

const CONFIG_DIR = join(homedir(), '.prompt-gen');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

const DEFAULT_CONFIG: Config = { defaultPreset: 'standard', lastUsedTemplate: '' };

export function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  const presetsDir = join(CONFIG_DIR, 'presets');
  if (!existsSync(presetsDir)) {
    mkdirSync(presetsDir, { recursive: true });
  }
}

const store = new JsonStore<Config>(CONFIG_FILE, DEFAULT_CONFIG, ensureConfigDir);

export const loadConfig = () => store.load();
export const saveConfig = (config: Config) => store.save(config);
export const getConfigDir = () => CONFIG_DIR;
