'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, ImageIcon, Video } from 'lucide-react';
import type { ImagePrompt, VideoPrompt } from '@/hooks/useInspirationData';

interface PromptCardProps {
  prompt: ImagePrompt | VideoPrompt;
  type: 'image' | 'video';
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
}

export function PromptCard({
  prompt,
  type,
  isFavorite,
  onToggleFavorite,
  onClick,
}: PromptCardProps) {
  const [imageError, setImageError] = useState(false);

  const isImage = type === 'image';
  const imagePrompt = prompt as ImagePrompt;
  const videoPrompt = prompt as VideoPrompt;

  const coverImage = isImage ? imagePrompt.coverImage : null;
  const title = prompt.title;
  const tags = isImage ? imagePrompt.tags : [videoPrompt.category];

  return (
    <div
      onClick={onClick}
      className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-[var(--color-bg-elevated)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors"
    >
      {/* Image or placeholder */}
      {coverImage && !imageError ? (
        <Image
          src={coverImage}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 33vw"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--color-bg-elevated)] to-[var(--color-bg-deep)]">
          {isImage ? (
            <ImageIcon size={24} className="text-[var(--color-text-muted)]" />
          ) : (
            <Video size={24} className="text-[var(--color-text-muted)]" />
          )}
        </div>
      )}

      {/* Type badge */}
      <div className="absolute top-2 left-2">
        <span
          className={`px-1.5 py-0.5 text-[10px] font-bold uppercase rounded ${
            isImage
              ? 'bg-[var(--color-primary)]/80 text-black'
              : 'bg-[var(--color-secondary)]/80 text-black'
          }`}
        >
          {isImage ? 'IMG' : 'VID'}
        </span>
      </div>

      {/* Favorite button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className={`absolute top-2 right-2 p-1.5 rounded-full transition-all ${
          isFavorite
            ? 'bg-red-500 text-white'
            : 'bg-black/50 text-white opacity-0 group-hover:opacity-100'
        }`}
      >
        <Heart size={12} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <h3 className="text-xs font-medium text-white line-clamp-2 mb-1">
            {title}
          </h3>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-1 py-0.5 text-[9px] rounded bg-white/20 text-white/80"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="px-1 py-0.5 text-[9px] rounded bg-white/20 text-white/80">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
