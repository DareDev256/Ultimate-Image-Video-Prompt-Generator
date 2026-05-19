/**
 * Server-only helpers for reading the bundled prompt data files.
 * Used by API routes AND server components (e.g. /sources) — keeping the
 * load logic here avoids self-calling our own /api/prompts/meta endpoint.
 *
 * NOTE: any file imported into a client bundle MUST NOT import this module.
 * The 'use server' directive is omitted intentionally — these are plain
 * server utilities, not server actions.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface RawImagePrompt {
  id: number;
  slug?: string;
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

export interface RawVideoPrompt {
  id: number;
  title: string;
  source: { name: string; url: string };
  promptEn: string;
  promptZh: string;
  category: string;
}

const DATA_DIR = join(process.cwd(), 'public', 'data');

let _imageCache: RawImagePrompt[] | null = null;
let _videoCache: RawVideoPrompt[] | null = null;

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

export function canonicalModel(name?: string): string | undefined {
  if (!name) return name;
  return MODEL_CANONICAL[name.trim().toLowerCase()] ?? name.trim();
}

export function loadImagePrompts(): RawImagePrompt[] {
  if (_imageCache) return _imageCache;
  const raw = readFileSync(join(DATA_DIR, 'image-prompts.json'), 'utf-8');
  const parsed = JSON.parse(raw) as RawImagePrompt[];
  for (const p of parsed) {
    const canon = canonicalModel(p.model);
    if (canon) p.model = canon;
  }
  _imageCache = parsed;
  return _imageCache;
}

export function loadVideoPrompts(): RawVideoPrompt[] {
  if (_videoCache) return _videoCache;
  const raw = readFileSync(join(DATA_DIR, 'video-prompts.json'), 'utf-8');
  _videoCache = JSON.parse(raw) as RawVideoPrompt[];
  return _videoCache;
}

export interface SourceSummary {
  repo: string;
  owner: string;
  name: string;
  repoUrl: string;
  count: number;
  models: { name: string; count: number }[];
  topAuthors: { name: string; count: number }[];
}

export function buildSourceSummaries(): SourceSummary[] {
  const images = loadImagePrompts();
  const buckets = new Map<string, SourceSummary>();

  for (const p of images) {
    const repo = p.origin?.repo
      ?? (p.id >= 10000 && p.id < 20000
        ? 'YouMind-OpenLab/awesome-nano-banana-pro-prompts'
        : 'songguoxs/gpt4o-image-prompts');
    const repoUrl = p.origin?.repoUrl ?? `https://github.com/${repo}`;
    const [owner, name] = repo.split('/');

    let summary = buckets.get(repo);
    if (!summary) {
      summary = {
        repo,
        owner,
        name,
        repoUrl,
        count: 0,
        models: [],
        topAuthors: [],
      };
      buckets.set(repo, summary);
    }
    summary.count++;
  }

  // Compute per-repo model + author top lists
  for (const p of images) {
    const repo = p.origin?.repo
      ?? (p.id >= 10000 && p.id < 20000
        ? 'YouMind-OpenLab/awesome-nano-banana-pro-prompts'
        : 'songguoxs/gpt4o-image-prompts');
    const summary = buckets.get(repo);
    if (!summary) continue;

    if (p.model) {
      const existing = summary.models.find((m) => m.name === p.model);
      if (existing) existing.count++;
      else summary.models.push({ name: p.model, count: 1 });
    }

    if (p.source?.name) {
      const existing = summary.topAuthors.find((a) => a.name === p.source.name);
      if (existing) existing.count++;
      else summary.topAuthors.push({ name: p.source.name, count: 1 });
    }
  }

  for (const s of buckets.values()) {
    s.models.sort((a, b) => b.count - a.count);
    s.topAuthors.sort((a, b) => b.count - a.count);
    s.topAuthors = s.topAuthors.slice(0, 6);
  }

  return Array.from(buckets.values()).sort((a, b) => b.count - a.count);
}

interface GithubRepoMeta {
  stargazers_count: number;
  description: string | null;
  pushed_at: string | null;
  topics: string[] | null;
  owner: { avatar_url: string } | null;
}

/**
 * Best-effort GitHub stars fetch. Public repos are 60 req/hr unauthenticated
 * which is plenty for 5 sources. Caches at the route level via Next ISR.
 * Returns null on rate-limit / failure rather than throwing.
 */
export async function fetchGithubMeta(repo: string): Promise<GithubRepoMeta | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Accept: 'application/vnd.github+json' },
      // Re-cache for 1h to dodge GitHub rate limits.
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as GithubRepoMeta;
    return data;
  } catch {
    return null;
  }
}
