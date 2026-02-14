'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Generic hook for syncing React state with localStorage.
 * Handles SSR safety, JSON serialization, error recovery, and cross-tab sync.
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(defaultValue);
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(false);

  // Load from localStorage on mount (client-only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored));
      }
    } catch {
      // Corrupted data — fall back to default
    }
    loadedRef.current = true;
    setLoaded(true);
  }, [key]);

  // Persist to localStorage on change (skip the initial mount)
  useEffect(() => {
    if (!loadedRef.current) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable — fail silently
    }
  }, [key, value]);

  // Listen for cross-tab changes via the storage event
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== key) return;
      try {
        setValue(e.newValue !== null ? JSON.parse(e.newValue) : defaultValue);
      } catch {
        setValue(defaultValue);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, defaultValue]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => setValue(next),
    []
  );

  return [value, update, loaded];
}
