#!/usr/bin/env bun
/**
 * Translate Chinese titles to English by extracting from prompt content
 * Since prompts contain both English and Chinese versions, we extract
 * a meaningful title from the English prompt text.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const dataDir = join(__dirname, '../web/public/data');

interface ImagePrompt {
  id: number;
  slug: string;
  title: string;
  titleEn?: string;
  source: { name: string; url: string };
  model: string;
  images: string[];
  prompts: string[];
  examples: string[];
  notes: string[];
  originFile: string;
  description: string;
  tags: string[];
  coverImage: string;
}

interface VideoPrompt {
  id: number;
  title: string;
  titleEn?: string;
  source: { name: string; url: string };
  promptEn: string;
  promptZh: string;
  category: string;
}

// Check if text contains Chinese characters
function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fa5]/.test(text);
}

// Extract a clean English title from prompt text
function extractTitleFromPrompt(prompt: string): string {
  if (!prompt) return '';

  // Get first line or sentence
  let title = prompt.split('\n')[0].trim();

  // If it starts with a number or JSON, try to find descriptive text
  if (title.startsWith('{') || title.startsWith('1.') || title.startsWith('2.')) {
    // Try to find a descriptive phrase
    const lines = prompt.split('\n');
    for (const line of lines) {
      const cleaned = line.trim();
      if (cleaned.length > 10 && !cleaned.startsWith('{') && !cleaned.startsWith('"') && !containsChinese(cleaned)) {
        title = cleaned;
        break;
      }
    }
  }

  // Clean up the title
  title = title
    .replace(/^["'\-•*]+/, '') // Remove leading punctuation
    .replace(/["'\-•*]+$/, '') // Remove trailing punctuation
    .trim();

  // Truncate to reasonable length
  if (title.length > 80) {
    const words = title.split(' ');
    title = '';
    for (const word of words) {
      if ((title + ' ' + word).length <= 80) {
        title = title ? title + ' ' + word : word;
      } else {
        break;
      }
    }
    title += '...';
  }

  // Capitalize first letter
  if (title) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  return title;
}

// Extract title from video prompt (usually structured JSON)
function extractVideoTitle(promptEn: string): string {
  if (!promptEn) return 'Video Prompt';

  // Try to find subject description in JSON-like structure
  const subjectMatch = promptEn.match(/"description":\s*"([^"]+)"/);
  if (subjectMatch) {
    let title = subjectMatch[1];
    if (title.length > 80) {
      title = title.substring(0, 77) + '...';
    }
    return title.charAt(0).toUpperCase() + title.slice(1);
  }

  // Try to find action description
  const actionMatch = promptEn.match(/"action":\s*"([^"]+)"/);
  if (actionMatch) {
    let title = actionMatch[1];
    if (title.length > 80) {
      title = title.substring(0, 77) + '...';
    }
    return title.charAt(0).toUpperCase() + title.slice(1);
  }

  // Fall back to first meaningful line
  const lines = promptEn.split('\n').filter(l => l.trim() && !l.trim().startsWith('{'));
  if (lines.length > 0) {
    let title = lines[0].trim();
    if (title.length > 80) {
      title = title.substring(0, 77) + '...';
    }
    return title;
  }

  return 'Video Prompt';
}

async function main() {
  console.log('🌐 Translating titles...\n');

  // Process image prompts
  console.log('📸 Processing image prompts...');
  const imageData = JSON.parse(readFileSync(join(dataDir, 'image-prompts.json'), 'utf-8')) as ImagePrompt[];

  let imageTranslated = 0;
  for (const prompt of imageData) {
    if (containsChinese(prompt.title)) {
      // Get English prompt (usually first in array)
      const englishPrompt = prompt.prompts.find(p => !containsChinese(p)) || prompt.prompts[0];
      const newTitle = extractTitleFromPrompt(englishPrompt);

      if (newTitle && !containsChinese(newTitle)) {
        prompt.titleEn = newTitle;
        prompt.title = newTitle; // Replace title with English version
        imageTranslated++;
      }
    }
  }

  writeFileSync(join(dataDir, 'image-prompts.json'), JSON.stringify(imageData, null, 2));
  console.log(`   ✓ Translated ${imageTranslated} image titles`);

  // Process video prompts
  console.log('🎬 Processing video prompts...');
  const videoData = JSON.parse(readFileSync(join(dataDir, 'video-prompts.json'), 'utf-8')) as VideoPrompt[];

  let videoTranslated = 0;
  for (const prompt of videoData) {
    // Video prompts often have empty titles, generate from content
    if (!prompt.title || containsChinese(prompt.title)) {
      const newTitle = extractVideoTitle(prompt.promptEn);
      prompt.titleEn = newTitle;
      prompt.title = newTitle;
      videoTranslated++;
    }
  }

  writeFileSync(join(dataDir, 'video-prompts.json'), JSON.stringify(videoData, null, 2));
  console.log(`   ✓ Generated ${videoTranslated} video titles`);

  console.log('\n✅ Title translation complete!');
}

main().catch(console.error);
