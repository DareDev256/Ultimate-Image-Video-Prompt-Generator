/**
 * Dot-notation path utilities for traversing nested objects.
 * Used by the CLI prompt system to read/write fields on `ImagePrompt`
 * using category field keys like `"subject.description"` or `"camera.angle"`.
 */

/** Get a deeply nested value using dot notation (e.g. `"subject.description"`). */
export function getNestedValue<T = unknown>(obj: Record<string, unknown>, path: string): T | undefined {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current as T | undefined;
}

/** Set a deeply nested value using dot notation, creating intermediate objects as needed. */
export function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let current: Record<string, unknown> = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!;
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }

  const lastPart = parts[parts.length - 1]!;
  current[lastPart] = value;
}
