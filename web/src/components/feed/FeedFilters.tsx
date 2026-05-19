'use client';

import { motion } from 'framer-motion';
import { Search, Shuffle, Clock, Sparkles, X } from 'lucide-react';
import type { FeedFilters as FeedFilterState, SortMode, FeedTypeFilter } from '@/hooks/useFeedPrompts';
import type { FeedMeta } from '@/hooks/useFeedPrompts';

interface FeedFiltersProps {
  meta: FeedMeta | null;
  filters: FeedFilterState;
  onFiltersChange: (next: FeedFilterState) => void;
  total: number;
  sticky?: boolean;
}

const SORT_OPTIONS: { id: SortMode; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'trending', label: 'Trending', icon: Sparkles },
  { id: 'recent', label: 'Recent', icon: Clock },
  { id: 'random', label: 'Random', icon: Shuffle },
];

const TYPE_OPTIONS: { id: FeedTypeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'image', label: 'Image' },
  { id: 'video', label: 'Video' },
];

export function FeedFilters({ meta, filters, onFiltersChange, total, sticky = true }: FeedFiltersProps) {
  const update = (patch: Partial<FeedFilterState>) => {
    onFiltersChange({ ...filters, ...patch });
  };
  const clear = () => {
    onFiltersChange({ type: 'all', sort: filters.sort ?? 'trending' });
  };
  const hasActiveFilters = !!(filters.model || filters.source || filters.category || filters.search?.trim());

  return (
    <div
      className={
        sticky
          ? 'sticky top-0 z-30 backdrop-blur-md border-b'
          : 'border-b'
      }
      style={{
        background: 'rgba(10, 10, 18, 0.85)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="mx-auto max-w-[1600px] px-4 py-3 md:px-8 md:py-4">
        {/* Top row — counter + search + sort */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <p
            className="text-xs uppercase tracking-[0.25em]"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}
          >
            ▸ {total.toLocaleString()} {total === 1 ? 'result' : 'results'}
          </p>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
              style={{ color: 'var(--color-text-secondary)' }}
            />
            <input
              type="search"
              placeholder="Search prompts, tags, titles…"
              value={filters.search ?? ''}
              onChange={(e) => update({ search: e.target.value })}
              className="w-full rounded-md border bg-transparent py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-[var(--color-primary)]"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1 rounded-md border p-1" style={{ borderColor: 'var(--color-border)' }}>
            {SORT_OPTIONS.map(({ id, label, icon: Icon }) => {
              const active = (filters.sort ?? 'trending') === id;
              return (
                <button
                  key={id}
                  onClick={() => update({ sort: id })}
                  className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs uppercase tracking-wider transition-all"
                  style={{
                    fontFamily: 'var(--font-display)',
                    background: active ? 'var(--color-primary)' : 'transparent',
                    color: active ? 'white' : 'var(--color-text-secondary)',
                    boxShadow: active ? '0 0 18px var(--color-primary-glow)' : 'none',
                  }}
                >
                  <Icon size={12} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Type */}
          <div className="flex items-center gap-1 rounded-md border p-1" style={{ borderColor: 'var(--color-border)' }}>
            {TYPE_OPTIONS.map(({ id, label }) => {
              const active = (filters.type ?? 'all') === id;
              return (
                <button
                  key={id}
                  onClick={() => update({ type: id })}
                  className="rounded px-2.5 py-1 text-xs uppercase tracking-wider transition-all"
                  style={{
                    fontFamily: 'var(--font-display)',
                    background: active ? 'var(--color-secondary)' : 'transparent',
                    color: active ? 'white' : 'var(--color-text-secondary)',
                    boxShadow: active ? '0 0 18px var(--color-secondary-glow)' : 'none',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clear}
              className="ml-auto flex items-center gap-1 text-xs uppercase tracking-wider opacity-70 hover:opacity-100 transition-opacity"
              style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-display)' }}
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>

        {/* Bottom row — model + source + category chips (scrollable on mobile) */}
        {meta && (
          <div className="mt-3 flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
              <span
                className="mr-1 text-[10px] uppercase tracking-[0.3em]"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
              >
                Model
              </span>
              <ChipRow
                items={[
                  { id: null, label: 'Any', count: meta.totalImages + meta.totalVideos },
                  ...meta.models.map((m) => ({ id: m.name, label: m.name, count: m.count })),
                ]}
                value={filters.model ?? null}
                onChange={(v) => update({ model: v })}
                accent="var(--color-primary)"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
              <span
                className="mr-1 text-[10px] uppercase tracking-[0.3em]"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
              >
                Source
              </span>
              <ChipRow
                items={[
                  { id: null, label: 'Any', count: meta.totalImages + meta.totalVideos },
                  ...meta.sources.map((s) => ({ id: s.repo, label: shortRepo(s.repo), count: s.count })),
                ]}
                value={filters.source ?? null}
                onChange={(v) => update({ source: v })}
                accent="var(--color-success)"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
              <span
                className="mr-1 text-[10px] uppercase tracking-[0.3em]"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
              >
                Category
              </span>
              <ChipRow
                items={[
                  { id: null, label: 'Any', count: meta.totalImages + meta.totalVideos },
                  ...meta.imageCategories.slice(0, 12).map((c) => ({ id: c.name, label: c.name, count: c.count })),
                ]}
                value={filters.category ?? null}
                onChange={(v) => update({ category: v })}
                accent="var(--color-accent)"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function shortRepo(repo: string): string {
  // 'YouMind-OpenLab/awesome-nano-banana-pro-prompts' → 'youmind/nano-banana-pro'
  const parts = repo.split('/');
  if (parts.length !== 2) return repo;
  const [owner, name] = parts;
  const shortOwner = owner.toLowerCase().replace(/-openlab$/, '');
  const shortName = name.toLowerCase().replace(/^awesome-?/, '').replace(/-?prompts?$/, '').replace(/-api$/, '');
  return `${shortOwner}/${shortName || name.toLowerCase()}`;
}

interface ChipRowProps<T extends string | null> {
  items: { id: T; label: string; count: number }[];
  value: T;
  onChange: (v: T) => void;
  accent: string;
}

function ChipRow<T extends string | null>({ items, value, onChange, accent }: ChipRowProps<T>) {
  return (
    <>
      {items.map((item, idx) => {
        const active = value === item.id;
        return (
          <motion.button
            key={`${item.id ?? 'any'}-${idx}`}
            onClick={() => onChange(item.id)}
            whileTap={{ scale: 0.95 }}
            className="flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-all"
            style={{
              borderColor: active ? accent : 'var(--color-border)',
              background: active ? `${accent}22` : 'transparent',
              color: active ? accent : 'var(--color-text-secondary)',
              boxShadow: active ? `0 0 12px ${accent}55` : 'none',
              fontFamily: 'var(--font-body)',
            }}
          >
            <span className="font-medium">{item.label}</span>
            <span className="opacity-60 text-[9px]" style={{ fontFamily: 'var(--font-mono)' }}>
              {item.count.toLocaleString()}
            </span>
          </motion.button>
        );
      })}
    </>
  );
}
