'use client';

import { useState, useEffect } from 'react';

export interface PatternEntry {
  term: string;
  count: number;
  examples: string[];
}

export interface PatternLibrary {
  lighting: PatternEntry[];
  cameras: PatternEntry[];
  moods: PatternEntry[];
  colorGrades: PatternEntry[];
  styles: PatternEntry[];
  compositions: PatternEntry[];
  subjects: PatternEntry[];
  environments: PatternEntry[];
}

export type PatternCategory = keyof PatternLibrary;

export function usePatterns() {
  const [patterns, setPatterns] = useState<PatternLibrary | null>(null);
  const [quickPatterns, setQuickPatterns] = useState<Record<string, string[]> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPatterns() {
      try {
        setLoading(true);

        const [fullRes, quickRes] = await Promise.all([
          fetch('/data/patterns.json'),
          fetch('/data/patterns-quick.json'),
        ]);

        if (!fullRes.ok || !quickRes.ok) {
          throw new Error('Failed to load patterns');
        }

        const [fullData, quickData] = await Promise.all([
          fullRes.json(),
          quickRes.json(),
        ]);

        setPatterns(fullData);
        setQuickPatterns(quickData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadPatterns();
  }, []);

  // Get suggestions for a specific category
  const getSuggestions = (category: PatternCategory, limit = 10): string[] => {
    if (!quickPatterns || !quickPatterns[category]) return [];
    return quickPatterns[category].slice(0, limit);
  };

  // Get full pattern data for a category
  const getPatternData = (category: PatternCategory): PatternEntry[] => {
    if (!patterns || !patterns[category]) return [];
    return patterns[category];
  };

  // Search across all patterns
  const searchPatterns = (query: string): { category: PatternCategory; term: string }[] => {
    if (!patterns || !query.trim()) return [];

    const results: { category: PatternCategory; term: string }[] = [];
    const queryLower = query.toLowerCase();

    for (const [category, entries] of Object.entries(patterns)) {
      for (const entry of entries as PatternEntry[]) {
        if (entry.term.toLowerCase().includes(queryLower)) {
          results.push({
            category: category as PatternCategory,
            term: entry.term,
          });
        }
      }
    }

    return results.slice(0, 20);
  };

  return {
    patterns,
    quickPatterns,
    loading,
    error,
    getSuggestions,
    getPatternData,
    searchPatterns,
  };
}
