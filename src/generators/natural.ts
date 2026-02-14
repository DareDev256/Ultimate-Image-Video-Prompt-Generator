import type { ImagePrompt } from '../types';
import { PROMPT_SECTIONS } from './sections';

/**
 * Assembles a complete natural language prompt from an {@link ImagePrompt}.
 *
 * Pipeline: `PROMPT_SECTIONS.flatMap(fn) → join with periods → capitalize → ensure trailing period`
 *
 * Each section in {@link PROMPT_SECTIONS} returns `string[]` fragments.
 * `flatMap` merges them into a flat list, which is joined with `. ` separators.
 * Empty sections (returning `[]`) are silently skipped — no gaps in output.
 *
 * This is the primary output format for DALL-E 3 and Kling models.
 * Nano Banana (Gemini) uses the JSON format from {@link generateJSON} instead.
 *
 * @param prompt - The structured prompt data to assemble
 * @returns A capitalized, period-terminated natural language prompt string
 *
 * @example
 * ```ts
 * const text = generateNaturalLanguage({
 *   prompt_type: 'generate',
 *   subject: { description: 'A street photographer' },
 *   environment: { location: 'rainy Tokyo alley' },
 * });
 * // → "A street photographer. In rainy Tokyo alley."
 * ```
 */
export function generateNaturalLanguage(prompt: ImagePrompt): string {
  const parts = PROMPT_SECTIONS.flatMap(section => section(prompt));

  let text = parts.join('. ').replace(/\.\./g, '.');

  // Capitalize first letter
  text = text.charAt(0).toUpperCase() + text.slice(1);

  // Ensure ends with period
  if (!text.endsWith('.')) {
    text += '.';
  }

  return text;
}
