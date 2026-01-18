#!/usr/bin/env bun
/**
 * Fetch prompts from YouMind-OpenLab's awesome-nano-banana-pro-prompts repository
 * https://github.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts
 *
 * This parses the README.md which contains 5,676+ curated prompts
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(__dirname, '../web/public/data');
const README_URL = 'https://raw.githubusercontent.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts/main/README.md';
const EXISTING_PROMPTS_FILE = join(OUTPUT_DIR, 'image-prompts.json');

interface ParsedPrompt {
  id: number;
  slug: string;
  title: string;
  source: { name: string; url: string };
  model: string;
  images: string[];
  prompts: string[];
  tags: string[];
  coverImage: string | null;
  category: string;
  language: string;
  publishedDate: string;
  youmindId: number | null;
}

// Extract language from badge
function extractLanguage(text: string): string {
  const langMatch = text.match(/Language-([A-Z]{2})/);
  return langMatch ? langMatch[1].toLowerCase() : 'en';
}

// Extract category from title line
function extractCategory(title: string): string {
  // Common patterns: "Profile / Avatar - ...", "Social Media Post - ...", etc.
  const categoryMatch = title.match(/^([^-]+)\s*-\s*/);
  if (categoryMatch) {
    const cat = categoryMatch[1].trim().toLowerCase();
    // Normalize categories
    if (cat.includes('profile') || cat.includes('avatar')) return 'avatar';
    if (cat.includes('social media')) return 'social-media';
    if (cat.includes('thumbnail')) return 'thumbnail';
    if (cat.includes('infographic')) return 'infographic';
    if (cat.includes('comic') || cat.includes('storyboard')) return 'comic';
    if (cat.includes('product')) return 'product';
    if (cat.includes('game')) return 'game-asset';
    if (cat.includes('poster') || cat.includes('flyer')) return 'poster';
    if (cat.includes('logo')) return 'logo';
    if (cat.includes('illustration')) return 'illustration';
    if (cat.includes('photo')) return 'photography';
    if (cat.includes('3d')) return '3d-render';
    if (cat.includes('anime') || cat.includes('manga')) return 'anime';
    if (cat.includes('pixel')) return 'pixel-art';
    return cat.replace(/[\/\s]+/g, '-');
  }
  return 'general';
}

// Extract author info
function extractAuthor(text: string): { name: string; url: string } {
  const authorMatch = text.match(/\*\*Author:\*\*\s*\[([^\]]+)\]\(([^)]+)\)/);
  if (authorMatch) {
    return { name: `@${authorMatch[1]}`, url: authorMatch[2] };
  }
  return { name: 'Unknown', url: '' };
}

// Extract published date
function extractDate(text: string): string {
  const dateMatch = text.match(/\*\*Published:\*\*\s*([^\n]+)/);
  return dateMatch ? dateMatch[1].trim() : '';
}

// Extract YouMind ID from the try-it link
function extractYoumindId(text: string): number | null {
  const idMatch = text.match(/\?id=(\d+)/);
  return idMatch ? parseInt(idMatch[1]) : null;
}

// Extract image URLs from markdown
function extractImages(text: string): string[] {
  const images: string[] = [];
  // Match image markdown: <img src="url" or ![...](url)
  // First check for <img src="..."> tags
  const imgTagRegex = /<img\s+src="([^"]+)"/g;
  let match;
  while ((match = imgTagRegex.exec(text)) !== null) {
    if (match[1].includes('cms-assets.youmind.com')) {
      images.push(match[1]);
    }
  }

  // Also check for markdown image syntax
  const imgMarkdownRegex = /!\[[^\]]*\]\((https:\/\/cms-assets\.youmind\.com[^)]+)\)/g;
  while ((match = imgMarkdownRegex.exec(text)) !== null) {
    if (!images.includes(match[1])) {
      images.push(match[1]);
    }
  }

  return images;
}

// Extract prompt text
function extractPromptText(text: string): string[] {
  const prompts: string[] = [];

  // Look for prompt section - the content is between "#### 📝 Prompt" and "#### 🖼️ Generated Images" or "#### 📌 Details"
  const promptSectionMatch = text.match(/#### 📝 Prompt\s*([\s\S]*?)(?=\n#### 🖼️|\n#### 📌|$)/);
  if (promptSectionMatch) {
    let promptText = promptSectionMatch[1].trim();

    // Extract content from code blocks if present
    const codeBlockMatch = promptText.match(/```(?:[a-z]*)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      promptText = codeBlockMatch[1].trim();
    }

    // Clean up the prompt
    promptText = promptText.trim();

    if (promptText && promptText.length > 10) {
      prompts.push(promptText);
    }
  }

  return prompts;
}

// Generate tags based on content
function generateTags(title: string, promptText: string, category: string): string[] {
  const tags = new Set<string>();

  // Add category as tag
  if (category && category !== 'general') {
    tags.add(category);
  }

  const combined = (title + ' ' + promptText).toLowerCase();

  // Style tags
  if (combined.includes('anime') || combined.includes('manga')) tags.add('anime');
  if (combined.includes('3d') || combined.includes('render')) tags.add('3d');
  if (combined.includes('pixel')) tags.add('pixel-art');
  if (combined.includes('watercolor')) tags.add('watercolor');
  if (combined.includes('oil paint')) tags.add('oil-painting');
  if (combined.includes('photograph') || combined.includes('photo')) tags.add('photography');
  if (combined.includes('cinematic')) tags.add('cinematic');
  if (combined.includes('minimalis')) tags.add('minimalism');
  if (combined.includes('cyberpunk')) tags.add('cyberpunk');
  if (combined.includes('vintage') || combined.includes('retro')) tags.add('vintage');

  // Subject tags
  if (combined.includes('portrait')) tags.add('portrait');
  if (combined.includes('character')) tags.add('character');
  if (combined.includes('landscape')) tags.add('landscape');
  if (combined.includes('food') || combined.includes('drink')) tags.add('food');
  if (combined.includes('animal') || combined.includes('pet') || combined.includes('cat') || combined.includes('dog')) tags.add('animal');
  if (combined.includes('architecture') || combined.includes('building')) tags.add('architecture');
  if (combined.includes('logo')) tags.add('logo');
  if (combined.includes('icon')) tags.add('icon');

  return Array.from(tags).slice(0, 5); // Limit to 5 tags
}

async function fetchNanoBananaPrompts(): Promise<ParsedPrompt[]> {
  console.log('🍌 Fetching Nano Banana Pro prompts from README...');

  const response = await fetch(README_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch README: ${response.status}`);
  }

  const markdown = await response.text();
  console.log(`   Downloaded ${(markdown.length / 1024).toFixed(1)}KB of markdown`);

  const prompts: ParsedPrompt[] = [];

  // Split by prompt entries (### No. X: ...)
  // The format is: ### No. X: Title
  const promptPattern = /### No\.\s*(\d+):\s*([^\n]+)\n([\s\S]*?)(?=\n### No\.\s*\d+:|---\n## |\n## 🤝|$)/g;

  let match;
  let count = 0;

  while ((match = promptPattern.exec(markdown)) !== null) {
    const promptNumber = parseInt(match[1]);
    const titleLine = match[2].trim();
    const content = match[3];

    const language = extractLanguage(content);
    const category = extractCategory(titleLine);
    const author = extractAuthor(content);
    const publishedDate = extractDate(content);
    const youmindId = extractYoumindId(content);
    const images = extractImages(content);
    const promptTexts = extractPromptText(content);

    // Skip if no actual prompt text
    if (promptTexts.length === 0) continue;

    const tags = generateTags(titleLine, promptTexts[0] || '', category);

    // Clean title (remove category prefix)
    let cleanTitle = titleLine.replace(/^[^-]+-\s*/, '').trim();
    if (cleanTitle.length > 100) {
      cleanTitle = cleanTitle.substring(0, 97) + '...';
    }

    prompts.push({
      id: 10000 + promptNumber, // Offset IDs to avoid collision with existing prompts
      slug: `nano-banana-${promptNumber}`,
      title: cleanTitle || `Nano Banana Prompt ${promptNumber}`,
      source: author,
      model: 'Nano Banana Pro',
      images,
      prompts: promptTexts,
      tags,
      coverImage: images[0] || null,
      category,
      language,
      publishedDate,
      youmindId,
    });

    count++;

    // Progress indicator every 500 prompts
    if (count % 500 === 0) {
      console.log(`   Parsed ${count} prompts...`);
    }
  }

  console.log(`   ✅ Parsed ${prompts.length} prompts from README`);
  return prompts;
}

async function main() {
  console.log('🚀 Starting Nano Banana prompts fetch...\n');

  try {
    // Fetch new prompts
    const nanoBananaPrompts = await fetchNanoBananaPrompts();

    // Load existing prompts
    let existingPrompts: ParsedPrompt[] = [];
    if (existsSync(EXISTING_PROMPTS_FILE)) {
      console.log('\n📂 Loading existing prompts...');
      const existingData = readFileSync(EXISTING_PROMPTS_FILE, 'utf-8');
      existingPrompts = JSON.parse(existingData);
      console.log(`   Found ${existingPrompts.length} existing prompts`);
    }

    // Merge prompts (new ones first, then existing)
    const mergedPrompts = [...nanoBananaPrompts, ...existingPrompts];
    console.log(`\n📊 Total prompts after merge: ${mergedPrompts.length}`);

    // Save merged prompts
    const outputPath = EXISTING_PROMPTS_FILE;
    writeFileSync(outputPath, JSON.stringify(mergedPrompts, null, 2));
    console.log(`   ✅ Saved to ${outputPath}`);

    // Update metadata
    const metaPath = join(OUTPUT_DIR, 'meta.json');
    const meta = {
      lastFetched: new Date().toISOString(),
      imagePromptsCount: mergedPrompts.length,
      videoPromptsCount: 50, // Keep existing video count
      sources: {
        imagePrompts: [
          'https://github.com/songguoxs/gpt4o-image-prompts',
          'https://github.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts'
        ],
        videoPrompts: 'https://github.com/songguoxs/awesome-video-prompts',
      },
    };
    writeFileSync(metaPath, JSON.stringify(meta, null, 2));
    console.log(`   ✅ Updated metadata`);

    console.log('\n✨ Done! Nano Banana prompts added successfully.');
    console.log(`   🍌 ${nanoBananaPrompts.length} new prompts from Nano Banana repo`);
    console.log(`   📸 ${existingPrompts.length} existing prompts`);
    console.log(`   📊 ${mergedPrompts.length} total prompts`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
