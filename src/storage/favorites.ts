import { join } from 'path';
import { getConfigDir, ensureConfigDir } from './config';
import { JsonStore } from '../lib/json-store';

export type Favorites = Record<string, string[]>;

const store = new JsonStore<Favorites>(
  join(getConfigDir(), 'favorites.json'),
  {},
  ensureConfigDir,
);

export const loadFavorites = () => store.load();
export const saveFavorites = (favorites: Favorites) => store.save(favorites);

export function addFavorite(field: string, value: string) {
  const favorites = loadFavorites();
  if (!favorites[field]) {
    favorites[field] = [];
  }
  if (!favorites[field].includes(value)) {
    favorites[field].unshift(value);
    if (favorites[field].length > 10) {
      favorites[field] = favorites[field].slice(0, 10);
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
