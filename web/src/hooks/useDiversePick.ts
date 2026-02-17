'use client';

import { useCallback, useRef } from 'react';
import { diversePick, pushRecent, DEFAULT_RECENT_WINDOW } from '@/lib/diverse-pick';

/**
 * React hook that provides diversity-aware random picking per field key.
 *
 * Maintains a sliding window of recent picks for each field so that
 * consecutive randomize clicks cycle through varied suggestions instead
 * of repeating the same value.
 */
export function useDiversePick(windowSize = DEFAULT_RECENT_WINDOW) {
  // Map of fieldKey → recent picks. useRef to avoid re-renders on pick tracking.
  const recentMap = useRef<Map<string, string[]>>(new Map());

  const pick = useCallback(
    (fieldKey: string, options: readonly string[]): string => {
      const recent = recentMap.current.get(fieldKey) ?? [];
      const value = diversePick(options, recent);
      recentMap.current.set(fieldKey, pushRecent(recent, value, windowSize));
      return value;
    },
    [windowSize]
  );

  return pick;
}
