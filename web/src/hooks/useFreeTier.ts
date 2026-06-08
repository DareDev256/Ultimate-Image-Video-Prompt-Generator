'use client';

import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

// Must match the server's FREE_TIER_DAILY_LIMIT in
// api/generate/nano-banana/route.ts (25/day per IP — sized so the Gemini
// project key isn't drained). The client previously capped at 10, silently
// cutting free users off before the server limit; keep these in sync.
const FREE_TIER_LIMIT = 25;

interface FreeTierUsage {
  count: number;
  date: string;
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function useFreeTier() {
  const [usage, setUsage, isLoaded] = useLocalStorage<FreeTierUsage>(
    'freeTierUsage',
    { count: 0, date: getTodayDate() }
  );

  // Auto-reset on day change: if stored date differs from today, treat as zero
  const effectiveCount = usage.date === getTodayDate() ? usage.count : 0;
  const remaining = Math.max(0, FREE_TIER_LIMIT - effectiveCount);
  const canUseFreeTier = remaining > 0;

  const incrementUsage = useCallback(() => {
    setUsage((prev) => {
      const today = getTodayDate();
      return {
        count: prev.date === today ? prev.count + 1 : 1,
        date: today,
      };
    });
  }, [setUsage]);

  const resetUsage = useCallback(() => {
    setUsage({ count: 0, date: getTodayDate() });
  }, [setUsage]);

  return {
    remaining,
    used: effectiveCount,
    limit: FREE_TIER_LIMIT,
    canUseFreeTier,
    isLoaded,
    incrementUsage,
    resetUsage,
  };
}
