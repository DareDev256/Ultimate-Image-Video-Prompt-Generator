'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  Heart,
  ExternalLink,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Video,
} from 'lucide-react';
import type { ImagePrompt, VideoPrompt } from '@/hooks/useInspirationData';

interface PromptDetailProps {
  prompt: ImagePrompt | VideoPrompt;
  type: 'image' | 'video';
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
  onUseAsTemplate?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export function PromptDetail({
  prompt,
  type,
  isFavorite,
  onToggleFavorite,
  onClose,
  onUseAsTemplate,
  onNext,
  onPrev,
}: PromptDetailProps) {
  const [copied, setCopied] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const isImage = type === 'image';
  const imagePrompt = prompt as ImagePrompt;
  const videoPrompt = prompt as VideoPrompt;

  const images = isImage ? imagePrompt.images : [];
  const currentImage = images[currentImageIndex] || (isImage ? imagePrompt.coverImage : null);
  const promptTexts = isImage ? imagePrompt.prompts : [videoPrompt.promptEn, videoPrompt.promptZh].filter(Boolean);

  const handleCopy = async () => {
    const textToCopy = promptTexts.join('\n\n---\n\n');
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageNav = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      setCurrentImageIndex((i) => (i + 1) % images.length);
    } else {
      setCurrentImageIndex((i) => (i - 1 + images.length) % images.length);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-[var(--color-bg-card)] rounded-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X size={18} />
          </button>

          {/* Navigation arrows for prompts */}
          {onPrev && (
            <button
              onClick={onPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors md:right-[calc(40%+12px)]"
            >
              <ChevronRight size={20} />
            </button>
          )}

          <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
            {/* Image section */}
            <div className="relative md:w-3/5 aspect-square md:aspect-auto bg-black flex-shrink-0">
              {currentImage && !imageError ? (
                <Image
                  src={currentImage}
                  alt={prompt.title}
                  fill
                  className="object-contain"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {isImage ? (
                    <ImageIcon size={48} className="text-[var(--color-text-muted)]" />
                  ) : (
                    <Video size={48} className="text-[var(--color-text-muted)]" />
                  )}
                </div>
              )}

              {/* Image navigation for multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageNav('prev')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => handleImageNav('next')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full bg-black/50 text-white text-xs">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Details section */}
            <div className="md:w-2/5 p-4 overflow-y-auto">
              <div className="space-y-4">
                {/* Type & Source */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-xs font-bold uppercase rounded ${
                      isImage
                        ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                        : 'bg-[var(--color-secondary)]/20 text-[var(--color-secondary)]'
                    }`}
                  >
                    {isImage ? 'Image' : 'Video'}
                  </span>
                  {isImage && imagePrompt.model && (
                    <span className="px-2 py-0.5 text-xs rounded bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]">
                      {imagePrompt.model}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                  {prompt.title}
                </h2>

                {/* Source link */}
                {prompt.source && (
                  <a
                    href={prompt.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    <span>{prompt.source.name}</span>
                    <ExternalLink size={12} />
                  </a>
                )}

                {/* Tags */}
                {isImage && imagePrompt.tags && imagePrompt.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {imagePrompt.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Prompt text */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-[var(--color-text-muted)]">
                      Prompt
                    </h3>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check size={12} className="text-green-500" />
                          <span className="text-green-500">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto p-3 rounded-lg bg-[var(--color-bg-deep)] text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">
                    {promptTexts.map((text, i) => (
                      <div key={i} className={i > 0 ? 'mt-3 pt-3 border-t border-[var(--color-border)]' : ''}>
                        {text}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-2">
                  {onUseAsTemplate && (
                    <button
                      onClick={onUseAsTemplate}
                      className="btn btn-primary w-full"
                    >
                      <Sparkles size={16} />
                      <span>Use as Template</span>
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="btn btn-ghost flex-1"
                    >
                      <Copy size={16} />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={onToggleFavorite}
                      className={`btn flex-1 ${
                        isFavorite ? 'btn-danger' : 'btn-ghost'
                      }`}
                    >
                      <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                      <span>{isFavorite ? 'Saved' : 'Save'}</span>
                    </button>
                  </div>
                </div>

                {/* Attribution */}
                <p className="text-[10px] text-[var(--color-text-muted)] text-center pt-2 border-t border-[var(--color-border)]">
                  Curated by{' '}
                  <a
                    href="https://github.com/songguoxs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[var(--color-primary)]"
                  >
                    songguoxs
                  </a>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
