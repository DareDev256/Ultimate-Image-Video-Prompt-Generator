'use client';

import { useState, useEffect, useMemo } from 'react';

export interface ImagePrompt {
  id: number;
  slug: string;
  title: string;
  source: { name: string; url: string };
  model: string;
  images: string[];
  prompts: string[];
  tags: string[];
  coverImage: string | null;
  generatedImage?: string | null;
}

export interface VideoPrompt {
  id: number;
  title: string;
  source: { name: string; url: string };
  promptEn: string;
  promptZh: string;
  category: string;
}

interface InspirationMeta {
  lastFetched: string;
  imagePromptsCount: number;
  videoPromptsCount: number;
}

interface UseInspirationDataOptions {
  type?: 'images' | 'videos' | 'all';
  tags?: string[];
  search?: string;
  limit?: number;
}

export function useInspirationData(options: UseInspirationDataOptions = {}) {
  const { type = 'all', tags = [], search = '', limit } = options;

  const [imagePrompts, setImagePrompts] = useState<ImagePrompt[]>([]);
  const [videoPrompts, setVideoPrompts] = useState<VideoPrompt[]>([]);
  const [meta, setMeta] = useState<InspirationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const [imageRes, videoRes, metaRes] = await Promise.all([
          fetch('/data/image-prompts.json'),
          fetch('/data/video-prompts.json'),
          fetch('/data/meta.json'),
        ]);

        if (!imageRes.ok || !videoRes.ok) {
          throw new Error('Failed to load inspiration data');
        }

        const [images, videos, metaData] = await Promise.all([
          imageRes.json(),
          videoRes.json(),
          metaRes.json(),
        ]);

        setImagePrompts(images);
        setVideoPrompts(videos);
        setMeta(metaData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    imagePrompts.forEach((p) => p.tags?.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [imagePrompts]);

  // Video categories
  const videoCategories = useMemo(() => {
    const cats = new Set<string>();
    videoPrompts.forEach((p) => cats.add(p.category));
    return Array.from(cats).sort();
  }, [videoPrompts]);

  // Filtered results
  const filteredImages = useMemo(() => {
    if (type === 'videos') return [];

    let results = imagePrompts;

    // Filter by tags
    if (tags.length > 0) {
      results = results.filter((p) =>
        tags.some((tag) => p.tags?.includes(tag))
      );
    }

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.prompts?.some((prompt) =>
            prompt.toLowerCase().includes(searchLower)
          ) ||
          p.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Limit results
    if (limit) {
      results = results.slice(0, limit);
    }

    return results;
  }, [imagePrompts, type, tags, search, limit]);

  const filteredVideos = useMemo(() => {
    if (type === 'images') return [];

    let results = videoPrompts;

    // Filter by category (using tags param)
    if (tags.length > 0) {
      results = results.filter((p) => tags.includes(p.category));
    }

    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.promptEn.toLowerCase().includes(searchLower) ||
          p.promptZh.toLowerCase().includes(searchLower)
      );
    }

    // Limit results
    if (limit) {
      results = results.slice(0, limit);
    }

    return results;
  }, [videoPrompts, type, tags, search, limit]);

  return {
    imagePrompts: filteredImages,
    videoPrompts: filteredVideos,
    allTags,
    videoCategories,
    meta,
    loading,
    error,
    totalImages: imagePrompts.length,
    totalVideos: videoPrompts.length,
  };
}
