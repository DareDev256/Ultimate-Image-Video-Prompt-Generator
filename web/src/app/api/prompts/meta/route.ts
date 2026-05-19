import { NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const runtime = 'nodejs';
export const revalidate = 3600;

interface ImagePrompt {
  id: number;
  model: string;
  category?: string;
  tags?: string[];
  origin?: { repo: string; repoUrl: string };
}

interface VideoPrompt {
  id: number;
  category: string;
}

const DATA_DIR = join(process.cwd(), 'public', 'data');

let _cache: {
  models: { name: string; count: number }[];
  imageCategories: { name: string; count: number }[];
  videoCategories: { name: string; count: number }[];
  sources: { repo: string; repoUrl: string; count: number }[];
  tags: { name: string; count: number }[];
  totalImages: number;
  totalVideos: number;
} | null = null;

function buildCache() {
  if (_cache) return _cache;

  const images = JSON.parse(
    readFileSync(join(DATA_DIR, 'image-prompts.json'), 'utf-8')
  ) as ImagePrompt[];
  const videos = JSON.parse(
    readFileSync(join(DATA_DIR, 'video-prompts.json'), 'utf-8')
  ) as VideoPrompt[];

  const modelCounts = new Map<string, number>();
  const imageCatCounts = new Map<string, number>();
  const sourceCounts = new Map<string, { repo: string; repoUrl: string; count: number }>();
  const tagCounts = new Map<string, number>();

  const MODEL_CANONICAL: Record<string, string> = {
    'nano banana pro': 'Nano Banana Pro',
    'nano-banana pro': 'Nano Banana Pro',
    'nano banana 2': 'Nano Banana 2',
    'gpt-image-2': 'GPT-Image-2',
    'gpt image 2': 'GPT-Image-2',
    'gpt4o': 'GPT-4o Image',
    'gpt-4o': 'GPT-4o Image',
    'gpt-4o image': 'GPT-4o Image',
  };
  const canonModel = (n?: string): string | undefined => {
    if (!n) return n;
    return MODEL_CANONICAL[n.trim().toLowerCase()] ?? n.trim();
  };

  for (const p of images) {
    const model = canonModel(p.model);
    if (model) modelCounts.set(model, (modelCounts.get(model) || 0) + 1);
    if (p.category) imageCatCounts.set(p.category, (imageCatCounts.get(p.category) || 0) + 1);

    const repo = p.origin?.repo
      ?? (p.id >= 10000 && p.id < 20000
        ? 'YouMind-OpenLab/awesome-nano-banana-pro-prompts'
        : 'songguoxs/gpt4o-image-prompts');
    const repoUrl = p.origin?.repoUrl ?? `https://github.com/${repo}`;
    const cur = sourceCounts.get(repo);
    if (cur) cur.count++;
    else sourceCounts.set(repo, { repo, repoUrl, count: 1 });

    for (const t of p.tags || []) {
      tagCounts.set(t, (tagCounts.get(t) || 0) + 1);
    }
  }

  const videoCatCounts = new Map<string, number>();
  for (const v of videos) {
    if (v.category) videoCatCounts.set(v.category, (videoCatCounts.get(v.category) || 0) + 1);
  }

  const sortByCountDesc = <T extends { count: number }>(a: T, b: T) => b.count - a.count;

  _cache = {
    models: Array.from(modelCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort(sortByCountDesc),
    imageCategories: Array.from(imageCatCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort(sortByCountDesc),
    videoCategories: Array.from(videoCatCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort(sortByCountDesc),
    sources: Array.from(sourceCounts.values()).sort(sortByCountDesc),
    tags: Array.from(tagCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort(sortByCountDesc)
      .slice(0, 60), // top 60 tags only — UI doesn't need the long tail
    totalImages: images.length,
    totalVideos: videos.length,
  };
  return _cache;
}

export async function GET() {
  try {
    const data = buildCache();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
      },
    });
  } catch (err) {
    console.error('GET /api/prompts/meta error:', err);
    return NextResponse.json({ error: 'Failed to load metadata' }, { status: 500 });
  }
}
