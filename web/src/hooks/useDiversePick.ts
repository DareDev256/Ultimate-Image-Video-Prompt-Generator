'use client';

import { useCallback, useRef } from 'react';
import { diversePick, pushRecent, DEFAULT_RECENT_WINDOW } from '@/lib/diverse-pick';

/**
 * React hook that provides diversity-aware random picking per field key.
 *
 * Maintains a sliding window of recent picks for each field so that
 * consecutive randomize clicks cycle through varied suggestions instead
 * of repeating the same value.
 *
 * Generic over `T` — works with strings, numbers, or any equatable type.
 * Default `T = string` preserves backward compatibility.
 */
export function useDiversePick<T = string>(windowSize = DEFAULT_RECENT_WINDOW) {
  const recentMap = useRef<Map<string, T[]>>(new Map());

  const pick = useCallback(
    (fieldKey: string, options: readonly T[]): T => {
      const recent = recentMap.current.get(fieldKey) ?? [];
      const value = diversePick(options, recent);
      recentMap.current.set(fieldKey, pushRecent(recent, value, windowSize));
      return value;
    },
    [windowSize]
  );

  return pick;
}
