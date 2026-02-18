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
 * Builds a randomized prompt from wizard categories using diversity-aware picking.
 *
 * `picker` is called once per field — pass the hook's pick function directly.
 * Returns a structured record keyed by top-level category (e.g. "subject", "environment").
 */
export function buildRandomPrompt(
  categories: readonly PickableCategory[],
  picker: (fieldKey: string, suggestions: readonly string[]) => string,
): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};

  for (const category of categories) {
    const categoryData: Record<string, string> = {};
    for (const field of category.fields) {
      const lastKey = field.key.split('.').pop()!;
      categoryData[lastKey] = picker(field.key, field.suggestions);
    }
    // Derive output key from field key prefix (e.g. "subject.description" → "subject").
    // Field prefixes map to the data model, while category.id is a UI label that may differ
    // (e.g. id="setting" but fields use "environment.*"). Fallback to id if category has no fields.
    const categoryKey = category.fields[0]?.key.split('.')[0] ?? category.id;
    result[categoryKey] = categoryData;
  }

  return result;
}

/**
 * Flattens a structured prompt record into a comma-separated natural language string.
 */
export function flattenPromptToText(prompt: Record<string, Record<string, string>>): string {
  const parts: string[] = [];
  for (const fields of Object.values(prompt)) {
    for (const value of Object.values(fields)) {
      if (value) parts.push(value);
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
