import { join } from 'path';
import { existsSync, readdirSync, unlinkSync } from 'fs';
import { getConfigDir, ensureConfigDir } from './config';
import { JsonStore } from '../lib/json-store';
import type { ImagePrompt } from '../types';

const PRESETS_DIR = join(getConfigDir(), 'presets');

function storeFor(name: string) {
  return new JsonStore<ImagePrompt | null>(
    join(PRESETS_DIR, `${name}.json`),
    null,
    ensureConfigDir,
  );
}

export const savePreset = (name: string, prompt: ImagePrompt) =>
  storeFor(name).save(prompt);

export const loadPreset = (name: string): ImagePrompt | null =>
  storeFor(name).load();

export function listPresets(): string[] {
  ensureConfigDir();
  if (!existsSync(PRESETS_DIR)) return [];
  return readdirSync(PRESETS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

export function deletePreset(name: string): boolean {
  const store = storeFor(name);
  if (!store.exists()) return false;
  unlinkSync(join(PRESETS_DIR, `${name}.json`));
  return true;
}
