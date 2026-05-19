'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface FeedImagePrompt {
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
  _type: 'image';
}

export interface FeedVideoPrompt {
  id: number;
  title: string;
  source: { name: string; url: string };
  promptEn: string;
  promptZh: string;
  category: string;
  _type: 'video';
}

export type FeedItem = FeedImagePrompt | FeedVideoPrompt;

export type SortMode = 'trending' | 'recent' | 'random';
export type FeedTypeFilter = 'image' | 'video' | 'all';

export interface FeedFilters {
  type?: FeedTypeFilter;
  model?: string | null;
  source?: string | null;
  category?: string | null;
  search?: string;
  sort?: SortMode;
}

interface PageResponse {
  items: FeedItem[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  type: FeedTypeFilter;
  sort: SortMode;
}

const PAGE_SIZE = 30;

export function useFeedPrompts(filters: FeedFilters) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Stable seed for `random` so pagination doesn't reshuffle.
  const randomSeedRef = useRef<number>(Math.floor(Math.random() * 1_000_000));

  // Stable filter signature — re-fetch from page 1 whenever filters meaningfully change.
  const filterSig = useMemo(() => {
    return [
      filters.type ?? 'all',
      filters.model ?? '',
      filters.source ?? '',
      filters.category ?? '',
      filters.search ?? '',
      filters.sort ?? 'trending',
    ].join('|');
  }, [filters.type, filters.model, filters.source, filters.category, filters.search, filters.sort]);

  // Reset on filter change.
  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setTotal(0);
    setError(null);
    if (filters.sort === 'random') {
      randomSeedRef.current = Math.floor(Math.random() * 1_000_000);
    }
  }, [filterSig, filters.sort]);

  const fetchPage = useCallback(
    async (pageToFetch: number) => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set('page', String(pageToFetch));
        params.set('limit', String(PAGE_SIZE));
        if (filters.type && filters.type !== 'all') params.set('type', filters.type);
        if (filters.model) params.set('model', filters.model);
        if (filters.source) params.set('source', filters.source);
        if (filters.category) params.set('category', filters.category);
        if (filters.search?.trim()) params.set('search', filters.search.trim());
        params.set('sort', filters.sort ?? 'trending');
        if (filters.sort === 'random') params.set('seed', String(randomSeedRef.current));

        const res = await fetch(`/api/prompts?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: PageResponse = await res.json();

        setItems((prev) => (pageToFetch === 1 ? data.items : [...prev, ...data.items]));
        setHasMore(data.hasMore);
        setTotal(data.total);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    },
    [filters.type, filters.model, filters.source, filters.category, filters.search, filters.sort]
  );

  // First-page fetch on filter change (deferred to next tick after reset).
  useEffect(() => {
    fetchPage(1);
  }, [filterSig, fetchPage]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchPage(next);
  }, [loading, hasMore, page, fetchPage]);

  return { items, loading, error, hasMore, total, loadMore };
}

export interface FeedMeta {
  models: { name: string; count: number }[];
  imageCategories: { name: string; count: number }[];
  videoCategories: { name: string; count: number }[];
  sources: { repo: string; repoUrl: string; count: number }[];
  tags: { name: string; count: number }[];
  totalImages: number;
  totalVideos: number;
}

export function useFeedMeta() {
  const [meta, setMeta] = useState<FeedMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/prompts/meta');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: FeedMeta = await res.json();
        if (!cancelled) {
          setMeta(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load metadata');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { meta, loading, error };
}
