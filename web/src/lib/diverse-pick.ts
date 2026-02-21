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

/** Minimal field shape needed for prompt assembly */
export interface PickableField {
  key: string;
  suggestions: readonly string[];
}

/** Minimal category shape needed for prompt assembly */
export interface PickableCategory {
  id: string;
  fields: readonly PickableField[];
}

/**
 * Parses a dot-delimited field key into its category and field components.
 *
 * @example
 * parseFieldKey('subject.hair.style') // → { categoryKey: 'subject', fieldKey: 'style' }
 * parseFieldKey('mood')               // → { categoryKey: 'mood', fieldKey: 'mood' }
 */
export function parseFieldKey(key: string): { categoryKey: string; fieldKey: string } {
  const segments = key.split('.');
  return {
    categoryKey: segments[0],
    fieldKey: segments[segments.length - 1],
  };
}

/**
 * Builds a randomized prompt from wizard categories using diversity-aware picking.
 *
 * `picker` is called once per field — pass the hook's pick function directly.
 * Returns a structured record keyed by top-level category (e.g. "subject", "environment").
 *
 * Categories sharing a field prefix are merged — both contribute fields to the
 * same output key without data loss.
 */
export function buildRandomPrompt(
  categories: readonly PickableCategory[],
  picker: (fieldKey: string, suggestions: readonly string[]) => string,
): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};

  for (const category of categories) {
    for (const field of category.fields) {
      const { categoryKey, fieldKey } = parseFieldKey(field.key);
      if (!result[categoryKey]) result[categoryKey] = {};
      result[categoryKey][fieldKey] = picker(field.key, field.suggestions);
    }
    // Ensure empty categories still produce an entry (keyed by id as fallback)
    if (category.fields.length === 0 && !result[category.id]) {
      result[category.id] = {};
    }
  }

  return result;
}

/**
 * Flattens a structured prompt record into a comma-separated natural language string.
 * Values are trimmed before inclusion — whitespace-only strings are excluded.
 */
export function flattenPromptToText(prompt: Record<string, Record<string, string>>): string {
  const parts: string[] = [];
  for (const fields of Object.values(prompt)) {
    for (const value of Object.values(fields)) {
      const trimmed = value.trim();
      if (trimmed) parts.push(trimmed);
    }
  }
  return parts.join(', ');
}

/**
 * Appends `value` to the recent list and trims to `maxSize`.
 * Returns a new array (immutable).
 */
export function pushRecent<T>(recent: readonly T[], value: T, maxSize = DEFAULT_RECENT_WINDOW): T[] {
  const next = [...recent, value];
  return next.length > maxSize ? next.slice(next.length - maxSize) : next;
}

/** Result of a pick-with-history operation */
export interface PickResult<T> {
  value: T;
  recent: T[];
}

/**
 * Picks a diverse value and returns the updated history in one call.
 *
 * Eliminates the temporal coupling between `diversePick` and `pushRecent` —
 * callers no longer need to remember the two-step sequence.
 *
 * @example
 * ```ts
 * let recent: string[] = [];
 * const { value, recent: next } = pickWithHistory(options, recent, 3);
 * recent = next; // single assignment, no forgetting pushRecent
 * ```
 */
export function pickWithHistory<T>(
  options: readonly T[],
  recent: readonly T[],
  maxSize = DEFAULT_RECENT_WINDOW,
): PickResult<T> {
  const value = diversePick(options, recent);
  return { value, recent: pushRecent(recent, value, maxSize) };
}

/**
 * Creates a stateful picker that tracks per-key history internally.
 *
 * Use outside React — for tests, scripts, or server-side code where
 * `useDiversePick` isn't available. The returned function has the same
 * signature as the hook's pick function, making it a drop-in replacement.
 *
 * @example
 * ```ts
 * const pick = createPicker(3);
 * const value = pick('subject.description', suggestions);
 * // History tracked automatically — no manual pushRecent calls
 * ```
 */
export function createPicker<T = string>(windowSize = DEFAULT_RECENT_WINDOW) {
  const histories = new Map<string, T[]>();

  return (fieldKey: string, options: readonly T[]): T => {
    const recent = histories.get(fieldKey) ?? [];
    const result = pickWithHistory(options, recent, windowSize);
    histories.set(fieldKey, result.recent);
    return result.value;
  };
}
