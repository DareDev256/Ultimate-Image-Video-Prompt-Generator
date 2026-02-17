/**
 * Picks a random item from `options` while avoiding recently picked values.
 *
 * Strategy: exclude items in `recent` from the candidate pool. If every option
 * has been recently used (pool is empty), ignore history and pick from all options.
 * This guarantees the function never deadlocks regardless of history size vs pool size.
 */
export function diversePick<T>(options: readonly T[], recent: readonly T[]): T {
  if (options.length === 0) {
    throw new Error('diversePick: options array must not be empty');
  }

  const recentSet = new Set(recent);
  const candidates = options.filter((item) => !recentSet.has(item));

  // If all options exhausted, reset — pick from full pool
  const pool = candidates.length > 0 ? candidates : options;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Default sliding window size for recent pick tracking */
export const DEFAULT_RECENT_WINDOW = 5;

/**
 * Appends `value` to the recent list and trims to `maxSize`.
 * Returns a new array (immutable).
 */
export function pushRecent<T>(recent: readonly T[], value: T, maxSize = DEFAULT_RECENT_WINDOW): T[] {
  const next = [...recent, value];
  return next.length > maxSize ? next.slice(next.length - maxSize) : next;
}
