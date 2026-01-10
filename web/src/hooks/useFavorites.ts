'use client';

import { useState, useEffect, useCallback } from 'react';

interface FavoriteItem {
  id: number;
  type: 'image' | 'video';
  savedAt: string;
}

const STORAGE_KEY = 'inspiration-favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
    setLoaded(true);
  }, []);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      } catch (err) {
        console.error('Failed to save favorites:', err);
      }
    }
  }, [favorites, loaded]);

  const addFavorite = useCallback((id: number, type: 'image' | 'video') => {
    setFavorites((prev) => {
      // Don't add duplicates
      if (prev.some((f) => f.id === id && f.type === type)) {
        return prev;
      }
      return [
        ...prev,
        {
          id,
          type,
          savedAt: new Date().toISOString(),
        },
      ];
    });
  }, []);

  const removeFavorite = useCallback((id: number, type: 'image' | 'video') => {
    setFavorites((prev) =>
      prev.filter((f) => !(f.id === id && f.type === type))
    );
  }, []);

  const toggleFavorite = useCallback(
    (id: number, type: 'image' | 'video') => {
      const exists = favorites.some((f) => f.id === id && f.type === type);
      if (exists) {
        removeFavorite(id, type);
      } else {
        addFavorite(id, type);
      }
    },
    [favorites, addFavorite, removeFavorite]
  );

  const isFavorite = useCallback(
    (id: number, type: 'image' | 'video') => {
      return favorites.some((f) => f.id === id && f.type === type);
    },
    [favorites]
  );

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

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
