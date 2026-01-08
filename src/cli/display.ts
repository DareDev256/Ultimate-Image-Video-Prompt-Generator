import pc from 'picocolors';
import type { ImagePrompt } from '../types';
import { generateJSON } from '../generators/json';
import { generateNaturalLanguage } from '../generators/natural';

const LINE = '━'.repeat(50);

export function displayOutput(prompt: ImagePrompt) {
  const json = generateJSON(prompt);
  const natural = generateNaturalLanguage(prompt);

  console.log('');
  console.log(pc.cyan(LINE));
  console.log(pc.cyan(pc.bold(' JSON OUTPUT (for Nano Banana)')));
  console.log(pc.cyan(LINE));
  console.log('');
  console.log(json);
  console.log('');
  console.log(pc.green(LINE));
  console.log(pc.green(pc.bold(' NATURAL LANGUAGE (for ChatGPT/DALL-E)')));
  console.log(pc.green(LINE));
  console.log('');
  console.log(wrapText(natural, 60));
  console.log('');
  console.log(pc.dim(LINE));
}

function wrapText(text: string, width: number): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= width) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines.join('\n');
}
