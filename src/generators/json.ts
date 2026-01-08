import type { ImagePrompt } from '../types';

// Remove undefined values recursively
function cleanObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return undefined;
  }

  if (Array.isArray(obj)) {
    const cleaned = obj.filter(item => item !== undefined && item !== null);
    return cleaned.length > 0 ? cleaned : undefined;
  }

  if (typeof obj === 'object') {
    const cleaned: any = {};
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

export function generateJSON(prompt: ImagePrompt): string {
  const cleaned = cleanObject(prompt);
  return JSON.stringify(cleaned, null, 2);
}

export function generateCompactJSON(prompt: ImagePrompt): string {
  const cleaned = cleanObject(prompt);
  return JSON.stringify(cleaned);
}
