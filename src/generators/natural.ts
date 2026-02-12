import type { ImagePrompt } from '../types';
import { PROMPT_SECTIONS } from './sections';

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
