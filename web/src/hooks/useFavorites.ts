'use client';

import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface FavoriteItem {
  id: number;
  type: 'image' | 'video';
  savedAt: string;
}

export function useFavorites() {
  const [favorites, setFavorites, loaded] = useLocalStorage<FavoriteItem[]>(
    'inspiration-favorites',
    []
  );

  const addFavorite = useCallback((id: number, type: 'image' | 'video') => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === id && f.type === type)) return prev;
      return [...prev, { id, type, savedAt: new Date().toISOString() }];
    });
  }, [setFavorites]);

  const removeFavorite = useCallback((id: number, type: 'image' | 'video') => {
    setFavorites((prev) =>
      prev.filter((f) => !(f.id === id && f.type === type))
    );
  }, [setFavorites]);

  const toggleFavorite = useCallback(
    (id: number, type: 'image' | 'video') => {
      setFavorites((prev) => {
        const exists = prev.some((f) => f.id === id && f.type === type);
        if (exists) return prev.filter((f) => !(f.id === id && f.type === type));
        return [...prev, { id, type, savedAt: new Date().toISOString() }];
      });
    },
    [setFavorites]
  );

  const isFavorite = useCallback(
    (id: number, type: 'image' | 'video') =>
      favorites.some((f) => f.id === id && f.type === type),
    [favorites]
  );

  const clearFavorites = useCallback(() => setFavorites([]), [setFavorites]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    loaded,
    imageFavoriteIds: favorites.filter((f) => f.type === 'image').map((f) => f.id),
    videoFavoriteIds: favorites.filter((f) => f.type === 'video').map((f) => f.id),
  };
}
