import { join } from 'path';
import { existsSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from 'fs';
import { getConfigDir, ensureConfigDir } from './config';
import type { ImagePrompt } from '../types';

const PRESETS_DIR = join(getConfigDir(), 'presets');

export function savePreset(name: string, prompt: ImagePrompt) {
  ensureConfigDir();
  const filePath = join(PRESETS_DIR, `${name}.json`);
  writeFileSync(filePath, JSON.stringify(prompt, null, 2));
}

export function loadPreset(name: string): ImagePrompt | null {
  const filePath = join(PRESETS_DIR, `${name}.json`);
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

export function listPresets(): string[] {
  ensureConfigDir();
  if (!existsSync(PRESETS_DIR)) {
    return [];
  }
  return readdirSync(PRESETS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

export function deletePreset(name: string): boolean {
  const filePath = join(PRESETS_DIR, `${name}.json`);
  if (!existsSync(filePath)) {
    return false;
  }
  unlinkSync(filePath);
  return true;
}
