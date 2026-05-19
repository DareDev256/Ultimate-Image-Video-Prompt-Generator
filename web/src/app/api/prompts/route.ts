import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const runtime = 'nodejs';
export const revalidate = 3600; // ISR — re-read data hourly in case scrape ran

interface ImagePrompt {
  id: number;
  slug: string;
  title: string;
  source: { name: string; url: string };
  model: string;
  images?: string[];
  prompts?: string[];
  tags?: string[];
  coverImage?: string | null;
  category?: string;
  language?: string;
  publishedDate?: string;
  generatedImage?: string;
  origin?: { repo: string; repoUrl: string };
}

interface VideoPrompt {
  id: number;
  title: string;
  source: { name: string; url: string };
  promptEn: string;
  promptZh: string;
  category: string;
}

type FeedItem = (ImagePrompt & { _type: 'image' }) | (VideoPrompt & { _type: 'video' });

const DATA_DIR = join(process.cwd(), 'public', 'data');

let _imageCache: ImagePrompt[] | null = null;
let _videoCache: VideoPrompt[] | null = null;

// Source data has casing inconsistencies — collapse to a canonical name so filters work.
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

function canonicalModel(name: string): string {
  if (!name) return name;
  const key = name.trim().toLowerCase();
  return MODEL_CANONICAL[key] ?? name.trim();
}

function loadImagePrompts(): ImagePrompt[] {
  if (_imageCache) return _imageCache;
  const raw = readFileSync(join(DATA_DIR, 'image-prompts.json'), 'utf-8');
  const parsed = JSON.parse(raw) as ImagePrompt[];
  // Normalize model casing in-place once at load time.
  for (const p of parsed) {
    if (p.model) p.model = canonicalModel(p.model);
  }
  _imageCache = parsed;
  return _imageCache;
}

function loadVideoPrompts(): VideoPrompt[] {
  if (_videoCache) return _videoCache;
  const raw = readFileSync(join(DATA_DIR, 'video-prompts.json'), 'utf-8');
  _videoCache = JSON.parse(raw) as VideoPrompt[];
  return _videoCache;
}

// Stable per-id hash for deterministic random ordering. xorshift32-style.
function hashId(id: number, seed: number): number {
  let x = (id ^ seed) | 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  return (x >>> 0) % 1_000_003;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10) || 50));
    const type = (searchParams.get('type') as 'image' | 'video' | 'all') || 'all';
    const model = searchParams.get('model');
    const sourceRepo = searchParams.get('source');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const sort = (searchParams.get('sort') || 'recent') as 'recent' | 'random' | 'trending';

    const items: FeedItem[] = [];

    if (type === 'image' || type === 'all') {
      let images: ImagePrompt[] = loadImagePrompts();
      if (model) images = images.filter((p) => p.model === model);
      if (sourceRepo) {
        images = images.filter((p) => {
          if (p.origin?.repo === sourceRepo) return true;
          if (!p.origin && sourceRepo === 'songguoxs/gpt4o-image-prompts') return true;
          if (!p.origin && sourceRepo === 'YouMind-OpenLab/awesome-nano-banana-pro-prompts' && p.id >= 10000 && p.id < 20000) return true;
          return false;
        });
      }
      if (category) images = images.filter((p) => p.category === category);
      if (tag) images = images.filter((p) => p.tags?.includes(tag));
      if (search) {
        images = images.filter(
          (p) =>
            p.title.toLowerCase().includes(search) ||
            p.prompts?.some((pp) => pp.toLowerCase().includes(search)) ||
            p.tags?.some((t) => t.toLowerCase().includes(search))
        );
      }
      images.forEach((p) => items.push({ ...p, _type: 'image' as const }));
    }

    if (type === 'video' || type === 'all') {
      let videos: VideoPrompt[] = loadVideoPrompts();
      if (category) videos = videos.filter((p) => p.category === category);
      if (search) {
        videos = videos.filter(
          (p) =>
            p.title.toLowerCase().includes(search) ||
            p.promptEn?.toLowerCase().includes(search) ||
            p.promptZh?.toLowerCase().includes(search)
        );
      }
      // Videos have no model/source metadata yet. When user filters on either, drop videos
      // so 'all' results stay accurate (avoids "source=foo" returning 50 unrelated videos).
      if (model || sourceRepo) videos = [];
      videos.forEach((p) => items.push({ ...p, _type: 'video' as const }));
    }

    const total = items.length;

    if (sort === 'random') {
      const seed = parseInt(searchParams.get('seed') || `${Date.now()}`, 10);
      items.sort((a, b) => hashId(a.id, seed) - hashId(b.id, seed));
    } else if (sort === 'trending') {
      // Daily-rotating featured order (deterministic per UTC day, no usage data yet).
      const dailySeed = Math.floor(Date.now() / 86_400_000);
      items.sort((a, b) => hashId(a.id, dailySeed) - hashId(b.id, dailySeed));
    } else {
      // 'recent' = source-newest-first. New sources merged at top of array, so default order is fine.
    }

    const start = (page - 1) * limit;
    const slice = items.slice(start, start + limit);

    return NextResponse.json(
      {
        items: slice,
        page,
        limit,
        total,
        hasMore: start + limit < total,
        type,
        sort,
      },
      {
        headers: {
          // Edge cache for 5 min, allow stale for 1 hr (cheap revalidation).
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
        },
      }
    );
  } catch (err) {
    console.error('GET /api/prompts error:', err);
    return NextResponse.json({ error: 'Failed to load prompts' }, { status: 500 });
  }
}
