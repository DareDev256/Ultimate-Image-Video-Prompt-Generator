'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearAll: () => void;
}

export function TagFilter({ tags, selectedTags, onTagToggle, onClearAll }: TagFilterProps) {
  const [expanded, setExpanded] = useState(false);
  const displayLimit = 12;
  const hasMore = tags.length > displayLimit;
  const displayTags = expanded ? tags : tags.slice(0, displayLimit);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          Tags
        </span>
        {selectedTags.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {displayTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                isSelected
                  ? 'bg-[var(--color-primary)] text-black font-medium'
                  : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-deep)]'
              }`}
            >
              {tag}
            </button>
          );
        })}
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-2 py-1 text-xs rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-0.5"
          >
            {expanded ? 'Show less' : `+${tags.length - displayLimit}`}
            <ChevronDown
              size={12}
              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>
    </div>
  );
}
