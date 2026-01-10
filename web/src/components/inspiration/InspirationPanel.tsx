'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pin, PinOff, Image as ImageIcon, Video, Heart, Loader2, Info } from 'lucide-react';
import { useInspirationData, type ImagePrompt, type VideoPrompt } from '@/hooks/useInspirationData';
import { useFavorites } from '@/hooks/useFavorites';
import { SearchBar } from './SearchBar';
import { TagFilter } from './TagFilter';
import { PromptCard } from './PromptCard';
import { PromptDetail } from './PromptDetail';

type TabType = 'images' | 'videos' | 'saved';

interface InspirationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onUseAsTemplate?: (prompt: ImagePrompt | VideoPrompt, type: 'image' | 'video') => void;
}

export function InspirationPanel({ isOpen, onClose, onUseAsTemplate }: InspirationPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('images');
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<{
    prompt: ImagePrompt | VideoPrompt;
    type: 'image' | 'video';
    index: number;
  } | null>(null);
  const [isPinned, setIsPinned] = useState(false);

  const {
    imagePrompts,
    videoPrompts,
    allTags,
    videoCategories,
    loading,
    error,
    totalImages,
    totalVideos,
  } = useInspirationData({
    type: activeTab === 'images' ? 'images' : activeTab === 'videos' ? 'videos' : 'all',
    tags: selectedTags,
    search,
  });

  const {
    isFavorite,
    toggleFavorite,
    imageFavoriteIds,
    videoFavoriteIds,
  } = useFavorites();

  // Get favorite prompts
  const favoriteImages = useMemo(() => {
    return imagePrompts.filter((p) => imageFavoriteIds.includes(p.id));
  }, [imagePrompts, imageFavoriteIds]);

  const favoriteVideos = useMemo(() => {
    return videoPrompts.filter((p) => videoFavoriteIds.includes(p.id));
  }, [videoPrompts, videoFavoriteIds]);

  // Current display list
  const displayList = useMemo(() => {
    if (activeTab === 'images') {
      return imagePrompts.map((p) => ({ prompt: p, type: 'image' as const }));
    } else if (activeTab === 'videos') {
      return videoPrompts.map((p) => ({ prompt: p, type: 'video' as const }));
    } else {
      return [
        ...favoriteImages.map((p) => ({ prompt: p, type: 'image' as const })),
        ...favoriteVideos.map((p) => ({ prompt: p, type: 'video' as const })),
      ];
    }
  }, [activeTab, imagePrompts, videoPrompts, favoriteImages, favoriteVideos]);

  const handleTagToggle = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handlePromptClick = useCallback(
    (prompt: ImagePrompt | VideoPrompt, type: 'image' | 'video', index: number) => {
      setSelectedPrompt({ prompt, type, index });
    },
    []
  );

  const handleNavigate = useCallback(
    (direction: 'prev' | 'next') => {
      if (!selectedPrompt) return;

      const newIndex =
        direction === 'next'
          ? (selectedPrompt.index + 1) % displayList.length
          : (selectedPrompt.index - 1 + displayList.length) % displayList.length;

      const item = displayList[newIndex];
      setSelectedPrompt({
        prompt: item.prompt,
        type: item.type,
        index: newIndex,
      });
    },
    [selectedPrompt, displayList]
  );

  const handleUseAsTemplate = useCallback(() => {
    if (selectedPrompt && onUseAsTemplate) {
      onUseAsTemplate(selectedPrompt.prompt, selectedPrompt.type);
      setSelectedPrompt(null);
      if (!isPinned) onClose();
    }
  }, [selectedPrompt, onUseAsTemplate, isPinned, onClose]);

  const tags = activeTab === 'videos' ? videoCategories : allTags;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-[var(--color-bg-card)] border-l border-[var(--color-border)] shadow-2xl z-40 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="text-xl">✨</span>
                <span>Inspiration</span>
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsPinned(!isPinned)}
                  className={`p-2 rounded-lg transition-colors ${
                    isPinned
                      ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                  title={isPinned ? 'Unpin panel' : 'Pin panel open'}
                >
                  {isPinned ? <Pin size={16} /> : <PinOff size={16} />}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--color-border)]">
              {[
                { id: 'images' as const, icon: ImageIcon, label: 'Images', count: totalImages },
                { id: 'videos' as const, icon: Video, label: 'Videos', count: totalVideos },
                { id: 'saved' as const, icon: Heart, label: 'Saved', count: imageFavoriteIds.length + videoFavoriteIds.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedTags([]);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)] -mb-px'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  <tab.icon size={14} />
                  <span>{tab.label}</span>
                  <span className="text-xs opacity-60">({tab.count})</span>
                </button>
              ))}
            </div>

            {/* Search & Filters */}
            <div className="px-4 py-3 space-y-3 border-b border-[var(--color-border)]">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder={`Search ${activeTab}...`}
              />
              {tags.length > 0 && (
                <TagFilter
                  tags={tags}
                  selectedTags={selectedTags}
                  onTagToggle={handleTagToggle}
                  onClearAll={() => setSelectedTags([])}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Video prompts info banner */}
              {activeTab === 'videos' && !loading && (
                <div className="mb-3 p-2.5 rounded-lg bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/30">
                  <div className="flex items-start gap-2">
                    <Info size={14} className="text-[var(--color-secondary)] mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      These are <strong>text prompts</strong> for generating videos with AI tools like Kling, Veo3, or Hailuo. Copy and paste them into your preferred video generation tool.
                    </p>
                  </div>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="animate-spin text-[var(--color-primary)]" size={24} />
                </div>
              ) : error ? (
                <div className="text-center text-[var(--color-text-muted)] py-8">
                  <p>Failed to load prompts</p>
                  <p className="text-xs mt-1">{error}</p>
                </div>
              ) : displayList.length === 0 ? (
                <div className="text-center text-[var(--color-text-muted)] py-8">
                  {activeTab === 'saved' ? (
                    <p>No saved prompts yet. Click the heart to save!</p>
                  ) : (
                    <p>No prompts found matching your filters.</p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {displayList.map((item, index) => (
                    <PromptCard
                      key={`${item.type}-${item.prompt.id}`}
                      prompt={item.prompt}
                      type={item.type}
                      isFavorite={isFavorite(item.prompt.id, item.type)}
                      onToggleFavorite={() => toggleFavorite(item.prompt.id, item.type)}
                      onClick={() => handlePromptClick(item.prompt, item.type, index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-[var(--color-border)] text-center">
              <p className="text-[10px] text-[var(--color-text-muted)]">
                Prompts curated by{' '}
                <a
                  href="https://github.com/songguoxs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-primary)]"
                >
                  songguoxs
                </a>
                {' • '}
                <a
                  href="https://github.com/songguoxs/gpt4o-image-prompts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-primary)]"
                >
                  View on GitHub
                </a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      {selectedPrompt && (
        <PromptDetail
          prompt={selectedPrompt.prompt}
          type={selectedPrompt.type}
          isFavorite={isFavorite(selectedPrompt.prompt.id, selectedPrompt.type)}
          onToggleFavorite={() =>
            toggleFavorite(selectedPrompt.prompt.id, selectedPrompt.type)
          }
          onClose={() => setSelectedPrompt(null)}
          onUseAsTemplate={onUseAsTemplate ? handleUseAsTemplate : undefined}
          onNext={displayList.length > 1 ? () => handleNavigate('next') : undefined}
          onPrev={displayList.length > 1 ? () => handleNavigate('prev') : undefined}
        />
      )}
    </>
  );
}
