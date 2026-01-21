'use client';

import { useState, useEffect, useCallback } from 'react';

const FREE_TIER_LIMIT = 10;
const STORAGE_KEY = 'freeTierUsage';

interface FreeTierUsage {
  count: number;
  date: string;
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getStoredUsage(): FreeTierUsage {
  if (typeof window === 'undefined') {
    return { count: 0, date: getTodayDate() };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const usage = JSON.parse(stored) as FreeTierUsage;
      // Reset if it's a new day
      if (usage.date !== getTodayDate()) {
        return { count: 0, date: getTodayDate() };
      }
      return usage;
    }
  } catch {
    // Invalid stored data
  }

  return { count: 0, date: getTodayDate() };
}

function saveUsage(usage: FreeTierUsage): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
}

export function useFreeTier() {
  const [usage, setUsage] = useState<FreeTierUsage>({ count: 0, date: getTodayDate() });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load usage on mount
  useEffect(() => {
    const stored = getStoredUsage();
    setUsage(stored);
    setIsLoaded(true);
  }, []);

  const remaining = Math.max(0, FREE_TIER_LIMIT - usage.count);
  const canUseFreeTier = remaining > 0;

  const incrementUsage = useCallback(() => {
    setUsage((prev) => {
      const today = getTodayDate();
      const newUsage = {
        count: prev.date === today ? prev.count + 1 : 1,
        date: today,
      };
      saveUsage(newUsage);
      return newUsage;
    });
  }, []);

  const resetUsage = useCallback(() => {
    const newUsage = { count: 0, date: getTodayDate() };
    saveUsage(newUsage);
    setUsage(newUsage);
  }, []);

  return {
    remaining,
    used: usage.count,
    limit: FREE_TIER_LIMIT,
    canUseFreeTier,
    isLoaded,
    incrementUsage,
    resetUsage,
  };
}
