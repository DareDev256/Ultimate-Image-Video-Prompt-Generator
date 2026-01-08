import { join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { getConfigDir, ensureConfigDir } from './config';

const FAVORITES_FILE = join(getConfigDir(), 'favorites.json');

export type Favorites = Record<string, string[]>;

export function loadFavorites(): Favorites {
  ensureConfigDir();
  if (!existsSync(FAVORITES_FILE)) {
    return {};
  }
  return JSON.parse(readFileSync(FAVORITES_FILE, 'utf-8'));
}

export function saveFavorites(favorites: Favorites) {
  ensureConfigDir();
  writeFileSync(FAVORITES_FILE, JSON.stringify(favorites, null, 2));
}

export function addFavorite(field: string, value: string) {
  const favorites = loadFavorites();
  if (!favorites[field]) {
    favorites[field] = [];
  }
  if (!favorites[field].includes(value)) {
    favorites[field].unshift(value); // Add to front
    if (favorites[field].length > 10) {
      favorites[field] = favorites[field].slice(0, 10); // Keep max 10
    }
    saveFavorites(favorites);
  }
}

export function removeFavorite(field: string, value: string) {
  const favorites = loadFavorites();
  if (favorites[field]) {
    favorites[field] = favorites[field].filter(v => v !== value);
    saveFavorites(favorites);
  }
}

export function getFavoritesForField(field: string): string[] {
  const favorites = loadFavorites();
  return favorites[field] || [];
}
