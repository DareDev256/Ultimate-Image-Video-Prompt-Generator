#!/usr/bin/env bun
/**
 * Fetch prompts from songguoxs's GitHub repositories
 * - Image prompts: https://github.com/songguoxs/gpt4o-image-prompts
 * - Video prompts: https://github.com/songguoxs/awesome-video-prompts
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(__dirname, '../web/public/data');
const IMAGE_PROMPTS_URL = 'https://raw.githubusercontent.com/songguoxs/gpt4o-image-prompts/master/data/prompts.json';
const VIDEO_PROMPTS_URL = 'https://raw.githubusercontent.com/songguoxs/awesome-video-prompts/master/README.md';

interface ImagePrompt {
  id: number;
  slug: string;
  title: string;
  source: { name: string; url: string };
  model: string;
  images: string[];
  prompts: string[];
  tags: string[];
  coverImage: string;
}

interface VideoPrompt {
  id: number;
  title: string;
  source: { name: string; url: string };
  promptEn: string;
  promptZh: string;
  category: string;
}

async function fetchImagePrompts(): Promise<ImagePrompt[]> {
  console.log('📸 Fetching image prompts...');

  const response = await fetch(IMAGE_PROMPTS_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch image prompts: ${response.status}`);
  }

  const data = await response.json();
  console.log(`   Found ${data.total} image prompts`);

  // Transform to add full image URLs
  const baseImageUrl = 'https://raw.githubusercontent.com/songguoxs/gpt4o-image-prompts/master/';

  return data.items.map((item: ImagePrompt) => ({
    ...item,
    coverImage: item.coverImage ? baseImageUrl + item.coverImage : null,
    images: item.images?.map((img: string) => baseImageUrl + img) || [],
  }));
}

async function fetchVideoPrompts(): Promise<VideoPrompt[]> {
  console.log('🎬 Fetching video prompts...');

  const response = await fetch(VIDEO_PROMPTS_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch video prompts: ${response.status}`);
  }

  const markdown = await response.text();
  const prompts: VideoPrompt[] = [];

  // Parse markdown to extract prompts
  // Pattern: ## 案例XX (来源 [@user](url))
  // Followed by code blocks with prompts

  const caseRegex = /## 案例\s*(\d+)[^\n]*\(来源\s*\[@([^\]]+)\]\(([^)]+)\)\)/g;
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/g;

  let match;
  const cases: { id: number; source: { name: string; url: string }; startIndex: number }[] = [];

  // Find all cases
  while ((match = caseRegex.exec(markdown)) !== null) {
    cases.push({
      id: parseInt(match[1]),
      source: { name: `@${match[2]}`, url: match[3] },
      startIndex: match.index,
    });
  }

  // For each case, extract the prompts
  for (let i = 0; i < cases.length; i++) {
    const caseInfo = cases[i];
    const nextCaseStart = cases[i + 1]?.startIndex || markdown.length;
    const caseContent = markdown.slice(caseInfo.startIndex, nextCaseStart);

    // Find code blocks in this case
    const codeBlocks: string[] = [];
    let blockMatch;
    const localCodeRegex = /```(?:json)?\s*([\s\S]*?)```/g;

    while ((blockMatch = localCodeRegex.exec(caseContent)) !== null) {
      codeBlocks.push(blockMatch[1].trim());
    }

    // Extract title from the case header
    const titleMatch = caseContent.match(/## 案例\s*\d+[：:]*\s*([^\n(]+)/);
    const title = titleMatch ? titleMatch[1].trim() : `Video Prompt ${caseInfo.id}`;

    // Determine category from title
    let category = 'general';
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('asmr')) category = 'asmr';
    else if (lowerTitle.includes('开箱') || lowerTitle.includes('unbox')) category = 'unboxing';
    else if (lowerTitle.includes('广告') || lowerTitle.includes('ad')) category = 'advertising';
    else if (lowerTitle.includes('动画') || lowerTitle.includes('anime') || lowerTitle.includes('乐高') || lowerTitle.includes('lego')) category = 'animation';
    else if (lowerTitle.includes('游戏') || lowerTitle.includes('game')) category = 'gaming';

    prompts.push({
      id: caseInfo.id,
      title,
      source: caseInfo.source,
      promptEn: codeBlocks[0] || '',
      promptZh: codeBlocks[1] || '',
      category,
    });
  }

  console.log(`   Found ${prompts.length} video prompts`);
  return prompts;
}

async function main() {
  console.log('🚀 Starting prompt fetch...\n');

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created ${OUTPUT_DIR}\n`);
  }

  try {
    // Fetch image prompts
    const imagePrompts = await fetchImagePrompts();
    const imageOutputPath = join(OUTPUT_DIR, 'image-prompts.json');
    writeFileSync(imageOutputPath, JSON.stringify(imagePrompts, null, 2));
    console.log(`   ✅ Saved to ${imageOutputPath}\n`);

    // Fetch video prompts
    const videoPrompts = await fetchVideoPrompts();
    const videoOutputPath = join(OUTPUT_DIR, 'video-prompts.json');
    writeFileSync(videoOutputPath, JSON.stringify(videoPrompts, null, 2));
    console.log(`   ✅ Saved to ${videoOutputPath}\n`);

    // Write metadata
    const meta = {
      lastFetched: new Date().toISOString(),
      imagePromptsCount: imagePrompts.length,
      videoPromptsCount: videoPrompts.length,
      sources: {
        imagePrompts: 'https://github.com/songguoxs/gpt4o-image-prompts',
        videoPrompts: 'https://github.com/songguoxs/awesome-video-prompts',
      },
    };
    const metaOutputPath = join(OUTPUT_DIR, 'meta.json');
    writeFileSync(metaOutputPath, JSON.stringify(meta, null, 2));
    console.log(`📋 Metadata saved to ${metaOutputPath}\n`);

    console.log('✨ Done! Prompts fetched successfully.\n');
    console.log(`   📸 ${imagePrompts.length} image prompts`);
    console.log(`   🎬 ${videoPrompts.length} video prompts`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
