import type { ImagePrompt } from '../types';

/**
 * Recursively strips `undefined` and `null` values from a nested object.
 * - Arrays: filters out null/undefined items; returns `undefined` if empty
 * - Objects: removes keys with undefined values; returns `undefined` if no keys remain
 * - Primitives: returned as-is
 *
 * This ensures the JSON output contains only populated fields,
 * keeping payloads minimal for the Nano Banana (Gemini) API.
 */
function cleanObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return undefined;
  }

  if (Array.isArray(obj)) {
    const cleaned = obj.filter(item => item !== undefined && item !== null);
    return cleaned.length > 0 ? cleaned : undefined;
  }

  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = cleanObject(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  return obj;
}

/**
 * Generates a JSON string from an {@link ImagePrompt},
 * with all empty/undefined fields recursively stripped.
 *
 * This is the primary output format for Nano Banana (Gemini) — the API
 * expects structured JSON describing the desired image.
 *
 * @param prompt - The structured prompt data
 * @param compact - When true, outputs minified JSON (no whitespace). Defaults to false (pretty-printed, 2-space indent).
 * @returns JSON string
 */
export function generateJSON(prompt: ImagePrompt, compact?: boolean): string {
  const cleaned = cleanObject(prompt);
  return compact ? JSON.stringify(cleaned) : JSON.stringify(cleaned, null, 2);
}

