'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { HeroShowreel } from '@/components/hero/HeroShowreel';
import { FeedFilters } from './FeedFilters';
import { PromptCardEditorial } from './PromptCardEditorial';
import { useFeedPrompts, useFeedMeta, type FeedFilters as FilterState } from '@/hooks/useFeedPrompts';

const INITIAL_FILTERS: FilterState = {
  type: 'all',
  sort: 'trending',
};

export function FeedClient() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const { meta } = useFeedMeta();
  const { items, loading, error, hasMore, total, loadMore } = useFeedPrompts(filters);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Intersection-observer pagination — fire loadMore when sentinel enters viewport.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '600px' }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [loadMore]);

  const heroTotal = meta ? meta.totalImages + meta.totalVideos : 0;
  const heroSources = meta?.sources.length ?? 0;
  const heroModels = meta?.models.length ?? 0;

  return (
    <main className="relative min-h-screen">
      <HeroShowreel
        variant="feed"
        eyebrow="The Feed · v2.0"
        headline={['The prompt feed', 'that actually works.']}
      >
        <p
          className="text-xs uppercase tracking-[0.35em]"
          style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}
        >
          ▸ {heroTotal.toLocaleString()} prompts · {heroModels} models · {heroSources} sources
        </p>
      </HeroShowreel>

      <FeedFilters
        meta={meta}
        filters={filters}
        onFiltersChange={setFilters}
        total={total}
        sticky
      />

      <section className="mx-auto max-w-[1600px] px-4 py-8 md:px-8 md:py-12">
        {error && (
          <div
            className="mb-6 rounded border p-4 text-sm"
            style={{
              borderColor: 'var(--color-secondary)',
              background: 'rgba(255,0,170,0.08)',
              color: 'var(--color-secondary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            ⚠ Feed error: {error}
          </div>
        )}

        {/* Asymmetric editorial grid.
            Strategy: 1col mobile · 2col tablet · 3col desktop (4col on wide).
            Every 5th item gets the 'feature' variant which spans 2 cols on tablet+.
            Every 3rd image with id divisible by 7 gets 'tall' variant. */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, idx) => {
            const isFeature = idx > 0 && (idx + 1) % 9 === 0;
            const isTall = !isFeature && item.id % 7 === 0;
            return (
              <PromptCardEditorial
                key={`${item._type}-${item.id}-${idx}`}
                item={item}
                variant={isFeature ? 'feature' : isTall ? 'tall' : 'standard'}
                index={idx}
              />
            );
          })}
        </div>

        {/* Sentinel + loading + end-of-list */}
        <div ref={sentinelRef} className="mt-12 flex flex-col items-center justify-center gap-3">
          {loading && (
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              className="flex items-center gap-2 text-xs uppercase tracking-[0.3em]"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              <Loader2 className="animate-spin" size={14} />
              Loading more
            </motion.div>
          )}
          {!loading && !hasMore && items.length > 0 && (
            <p
              className="text-xs uppercase tracking-[0.3em]"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              ◆ End of feed · {total.toLocaleString()} prompts
            </p>
          )}
          {!loading && !hasMore && items.length === 0 && (
            <p
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
            >
              No prompts match these filters. Try clearing them.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
