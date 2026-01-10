#!/usr/bin/env bun
/**
 * Extract common patterns from prompts to build a suggestion library
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(__dirname, '../web/public/data');

interface PatternLibrary {
  lighting: PatternEntry[];
  cameras: PatternEntry[];
  moods: PatternEntry[];
  colorGrades: PatternEntry[];
  styles: PatternEntry[];
  compositions: PatternEntry[];
  subjects: PatternEntry[];
  environments: PatternEntry[];
}

interface PatternEntry {
  term: string;
  count: number;
  examples: string[]; // Sample prompt IDs where this appears
}

// Pattern definitions - keywords to look for
const PATTERNS = {
  lighting: [
    'golden hour', 'blue hour', 'neon', 'neon glow', 'neon lights', 'harsh flash',
    'soft light', 'diffused', 'backlit', 'backlighting', 'rim light', 'side light',
    'natural light', 'ambient', 'studio light', 'strobe', 'candlelight', 'firelight',
    'moonlight', 'sunlight', 'overcast', 'dramatic lighting', 'chiaroscuro',
    'high key', 'low key', 'volumetric', 'god rays', 'lens flare', 'bokeh',
    'cinematic lighting', 'moody lighting', 'flat lighting', 'three-point',
    'rembrandt', 'butterfly lighting', 'split lighting', 'loop lighting',
    'window light', 'twilight', 'dawn', 'dusk', 'sunset', 'sunrise',
    'fluorescent', 'tungsten', 'led', 'practical lights', 'fairy lights',
  ],
  cameras: [
    '85mm', '50mm', '35mm', '24mm', '135mm', '200mm', '70-200mm', '28mm',
    'wide angle', 'telephoto', 'macro', 'fisheye', 'tilt-shift',
    'portrait lens', 'prime lens', 'zoom lens', 'anamorphic',
    'shallow depth of field', 'deep depth of field', 'bokeh',
    'f/1.4', 'f/1.8', 'f/2.8', 'f/4', 'f/8', 'f/11',
    'close-up', 'extreme close-up', 'medium shot', 'wide shot', 'full shot',
    'dutch angle', 'low angle', 'high angle', 'eye level', 'bird\'s eye',
    'worm\'s eye', 'over the shoulder', 'pov', 'first person',
    'handheld', 'steadicam', 'dolly', 'tracking shot', 'crane shot',
    'hasselblad', 'leica', 'canon', 'nikon', 'sony', 'fujifilm',
    'medium format', 'full frame', 'aps-c', 'large format',
  ],
  moods: [
    'cinematic', 'dramatic', 'moody', 'ethereal', 'dreamy', 'surreal',
    'mysterious', 'romantic', 'melancholic', 'nostalgic', 'whimsical',
    'dark', 'gritty', 'raw', 'intimate', 'powerful', 'serene', 'peaceful',
    'energetic', 'dynamic', 'calm', 'tense', 'suspenseful', 'hopeful',
    'lonely', 'isolated', 'cozy', 'warm', 'cold', 'eerie', 'haunting',
    'playful', 'joyful', 'sad', 'contemplative', 'introspective',
    'epic', 'grand', 'minimalist', 'chaotic', 'orderly', 'vibrant',
    'muted', 'bold', 'subtle', 'intense', 'gentle', 'fierce',
  ],
  colorGrades: [
    'teal and orange', 'orange and teal', 'warm tones', 'cool tones',
    'desaturated', 'oversaturated', 'vibrant', 'muted colors', 'pastel',
    'monochrome', 'black and white', 'sepia', 'cross-processed',
    'kodak portra', 'fuji', 'cinestill', 'kodak gold', 'ektar',
    'film grain', 'film emulation', 'vintage', 'retro', 'faded',
    'high contrast', 'low contrast', 'crushed blacks', 'lifted shadows',
    'split toning', 'color grading', 'lut', 'log', 'raw',
    'neon colors', 'earth tones', 'jewel tones', 'neutral',
    'complementary', 'analogous', 'triadic', 'monochromatic palette',
    'golden', 'silver', 'bronze', 'copper', 'rose gold',
  ],
  styles: [
    'film noir', 'cyberpunk', 'vaporwave', 'synthwave', 'retrowave',
    'anime', 'manga', 'cartoon', 'pixar', 'disney', 'ghibli',
    'hyperrealistic', 'photorealistic', 'hyper-realistic', 'ultra-realistic',
    'impressionist', 'expressionist', 'surrealist', 'abstract',
    'minimalist', 'maximalist', 'baroque', 'renaissance', 'art deco',
    'art nouveau', 'brutalist', 'gothic', 'steampunk', 'dieselpunk',
    'editorial', 'fashion', 'street photography', 'documentary',
    'portrait', 'landscape', 'still life', 'architectural',
    'conceptual', 'fine art', 'commercial', 'advertising',
    '3d render', 'cgi', 'digital art', 'illustration', 'painting',
    'watercolor', 'oil painting', 'acrylic', 'pencil sketch', 'charcoal',
    'pop art', 'ukiyo-e', 'woodblock', 'linocut', 'collage',
  ],
  compositions: [
    'rule of thirds', 'golden ratio', 'centered', 'symmetrical',
    'asymmetrical', 'leading lines', 'framing', 'negative space',
    'fill the frame', 'minimalist composition', 'busy composition',
    'foreground interest', 'layered', 'depth', 'flat',
    'diagonal', 'horizontal', 'vertical', 'triangular',
    'circular', 'spiral', 's-curve', 'pattern', 'repetition',
    'contrast', 'juxtaposition', 'balance', 'tension',
    'full body', 'half body', 'headshot', 'portrait orientation',
    'landscape orientation', 'square format', 'panoramic',
    '16:9', '4:3', '3:2', '1:1', '2.35:1', 'anamorphic',
  ],
  subjects: [
    'woman', 'man', 'child', 'elderly', 'couple', 'group', 'crowd',
    'model', 'portrait subject', 'character', 'person',
    'animal', 'cat', 'dog', 'bird', 'wildlife',
    'object', 'product', 'food', 'plant', 'flower',
    'architecture', 'building', 'interior', 'exterior',
    'landscape', 'cityscape', 'seascape', 'mountain',
    'street scene', 'urban', 'rural', 'nature',
  ],
  environments: [
    'studio', 'outdoor', 'indoor', 'urban', 'rural', 'nature',
    'street', 'alley', 'rooftop', 'beach', 'forest', 'mountain',
    'desert', 'ocean', 'lake', 'river', 'waterfall',
    'city', 'town', 'village', 'countryside',
    'interior', 'living room', 'bedroom', 'kitchen', 'bathroom',
    'office', 'cafe', 'restaurant', 'bar', 'club',
    'industrial', 'warehouse', 'factory', 'abandoned',
    'futuristic', 'sci-fi', 'fantasy', 'historical',
    'japanese', 'european', 'asian', 'american',
    'minimalist space', 'cluttered', 'clean', 'messy',
  ],
};

function extractPatterns(prompts: string[], category: keyof typeof PATTERNS): PatternEntry[] {
  const counts = new Map<string, { count: number; examples: string[] }>();

  // Initialize all patterns
  for (const term of PATTERNS[category]) {
    counts.set(term.toLowerCase(), { count: 0, examples: [] });
  }

  // Count occurrences
  prompts.forEach((prompt, idx) => {
    const lowerPrompt = prompt.toLowerCase();

    for (const term of PATTERNS[category]) {
      const lowerTerm = term.toLowerCase();
      if (lowerPrompt.includes(lowerTerm)) {
        const entry = counts.get(lowerTerm)!;
        entry.count++;
        if (entry.examples.length < 3) {
          entry.examples.push(`prompt-${idx}`);
        }
      }
    }
  });

  // Convert to array and filter out zeros, sort by count
  return Array.from(counts.entries())
    .filter(([_, data]) => data.count > 0)
    .map(([term, data]) => ({
      term,
      count: data.count,
      examples: data.examples,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30); // Top 30 per category
}

async function main() {
  console.log('🔍 Extracting patterns from prompts...\n');

  // Load image prompts
  const imagePromptsPath = join(DATA_DIR, 'image-prompts.json');
  const imagePrompts = JSON.parse(readFileSync(imagePromptsPath, 'utf-8'));

  // Combine all prompt text
  const allPromptTexts: string[] = imagePrompts.flatMap((p: { prompts: string[] }) => p.prompts || []);

  console.log(`   Analyzing ${allPromptTexts.length} prompt texts...\n`);

  // Extract patterns for each category
  const patterns: PatternLibrary = {
    lighting: extractPatterns(allPromptTexts, 'lighting'),
    cameras: extractPatterns(allPromptTexts, 'cameras'),
    moods: extractPatterns(allPromptTexts, 'moods'),
    colorGrades: extractPatterns(allPromptTexts, 'colorGrades'),
    styles: extractPatterns(allPromptTexts, 'styles'),
    compositions: extractPatterns(allPromptTexts, 'compositions'),
    subjects: extractPatterns(allPromptTexts, 'subjects'),
    environments: extractPatterns(allPromptTexts, 'environments'),
  };

  // Print summary
  console.log('📊 Pattern extraction results:\n');
  for (const [category, entries] of Object.entries(patterns)) {
    const totalCount = entries.reduce((sum: number, e: PatternEntry) => sum + e.count, 0);
    console.log(`   ${category}: ${entries.length} unique patterns (${totalCount} occurrences)`);
    if (entries.length > 0) {
      const top3 = entries.slice(0, 3).map((e: PatternEntry) => `${e.term} (${e.count})`).join(', ');
      console.log(`      Top 3: ${top3}`);
    }
  }

  // Save patterns
  const outputPath = join(DATA_DIR, 'patterns.json');
  writeFileSync(outputPath, JSON.stringify(patterns, null, 2));
  console.log(`\n✅ Patterns saved to ${outputPath}`);

  // Also create a simplified version for quick suggestions
  const quickPatterns: Record<string, string[]> = {};
  for (const [category, entries] of Object.entries(patterns)) {
    quickPatterns[category] = entries.slice(0, 15).map((e: PatternEntry) => e.term);
  }
  const quickOutputPath = join(DATA_DIR, 'patterns-quick.json');
  writeFileSync(quickOutputPath, JSON.stringify(quickPatterns, null, 2));
  console.log(`✅ Quick patterns saved to ${quickOutputPath}`);
}

main();
