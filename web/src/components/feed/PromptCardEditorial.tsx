'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Copy, Check, Wand2, ExternalLink, Maximize2 } from 'lucide-react';
import { useState } from 'react';
import { MODEL_COLORS, MODEL_NAMES, isValidModel } from '@/lib/models';
import type { ModelType } from '@/context/WizardContext';
import type { FeedItem, FeedImagePrompt, FeedVideoPrompt } from '@/hooks/useFeedPrompts';

interface PromptCardEditorialProps {
  item: FeedItem;
  /** Visual variant — drives card size in the asymmetric grid. */
  variant?: 'standard' | 'tall' | 'feature';
  index: number;
}

/**
 * Editorial prompt card with full attribution + collapsible breakdown.
 *
 * Variants:
 *   - 'standard' : single column, image on top, prompt + meta below
 *   - 'tall'     : same width, taller image — for portrait-orientation covers
 *   - 'feature'  : double-column, image left, full prompt visible right (every 5th card)
 */
export function PromptCardEditorial({ item, variant = 'standard', index }: PromptCardEditorialProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const isImage = item._type === 'image';
  const cover = isImage
    ? (item as FeedImagePrompt).coverImage || (item as FeedImagePrompt).images?.[0] || (item as FeedImagePrompt).generatedImage
    : null;
  const promptText = isImage
    ? (item as FeedImagePrompt).prompts?.[0] ?? ''
    : (item as FeedVideoPrompt).promptEn || (item as FeedVideoPrompt).promptZh || '';
  const truncated = promptText.length > 200 ? promptText.slice(0, 200) + '…' : promptText;

  // Map source-repo origin to a wizard ModelType when possible (for "Use as Template").
  const wizardModelId = mapToWizardModel(item);

  const accentColor = wizardModelId ? MODEL_COLORS[wizardModelId] : 'var(--color-primary)';
  const modelName = isImage ? (item as FeedImagePrompt).model : 'Video';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore; copy isn't critical
    }
  };

  // Source attribution chip — link to original creator (Twitter etc), not just repo.
  const repoShort = isImage && (item as FeedImagePrompt).origin?.repo
    ? shortRepo((item as FeedImagePrompt).origin!.repo)
    : null;

  const isFeature = variant === 'feature';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.03, 0.4) }}
      className={`group relative overflow-hidden rounded-lg border transition-all ${
        isFeature ? 'md:col-span-2 md:row-span-2 md:flex' : ''
      }`}
      style={{
        background: 'linear-gradient(145deg, var(--color-bg-card), var(--color-bg-surface))',
        borderColor: 'var(--color-border)',
      }}
      whileHover={{
        y: -4,
        boxShadow: `0 14px 40px rgba(0,0,0,0.5), 0 0 24px ${accentColor}33`,
      }}
    >
      {/* Cover — image or video poster */}
      <div
        className={`relative overflow-hidden ${
          isFeature ? 'md:w-1/2 md:aspect-auto' : ''
        } ${variant === 'tall' ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}
        style={{ background: 'var(--color-bg-deep)' }}
      >
        {cover ? (
          <Image
            src={cover}
            alt={item.title}
            fill
            sizes={isFeature ? '50vw' : '(max-width: 768px) 100vw, 33vw'}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            unoptimized
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-xs uppercase tracking-widest opacity-40"
            style={{ color: accentColor, fontFamily: 'var(--font-mono)' }}
          >
            {isImage ? 'NO IMAGE' : '▶ VIDEO PROMPT'}
          </div>
        )}

        {/* Top-right: model badge */}
        <div
          className="absolute top-3 right-3 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] backdrop-blur"
          style={{
            background: 'rgba(10,10,18,0.7)',
            borderColor: `${accentColor}66`,
            color: accentColor,
            fontFamily: 'var(--font-mono)',
            boxShadow: `0 0 14px ${accentColor}44`,
          }}
        >
          {modelName}
        </div>

        {/* Bottom-left: source attribution */}
        <div
          className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md border px-2 py-1 text-[10px] backdrop-blur"
          style={{
            background: 'rgba(10,10,18,0.65)',
            borderColor: 'var(--color-border)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <a
            href={item.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 transition-colors hover:text-[var(--color-primary)]"
            style={{ color: 'var(--color-text-secondary)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <span>{item.source.name}</span>
            <ExternalLink size={9} />
          </a>
          {repoShort && (
            <>
              <span style={{ color: 'var(--color-text-muted)' }}>via</span>
              <span style={{ color: 'var(--color-text-muted)' }}>{repoShort}</span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-3 p-4 ${isFeature ? 'md:w-1/2 md:p-6' : ''}`}>
        <h3
          className="text-base leading-tight md:text-lg"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text-primary)',
            letterSpacing: '0.02em',
          }}
        >
          {item.title}
        </h3>

        <p
          className="text-xs leading-relaxed md:text-sm"
          style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
        >
          {expanded ? promptText : truncated}
        </p>

        {/* Tags */}
        {isImage && (item as FeedImagePrompt).tags?.length ? (
          <div className="flex flex-wrap gap-1">
            {((item as FeedImagePrompt).tags ?? []).slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider"
                style={{
                  background: 'var(--color-bg-elevated)',
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}

        {/* Action row */}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          {promptText.length > 200 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-[10px] uppercase tracking-wider transition-colors"
              style={{
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-display)',
              }}
            >
              <Maximize2 size={11} />
              {expanded ? 'Less' : 'Full prompt'}
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded border px-2 py-1 text-[10px] uppercase tracking-wider transition-all"
            style={{
              borderColor: copied ? 'var(--color-success)' : 'var(--color-border)',
              color: copied ? 'var(--color-success)' : 'var(--color-text-secondary)',
              fontFamily: 'var(--font-display)',
              boxShadow: copied ? '0 0 10px var(--color-success-glow)' : 'none',
            }}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          {wizardModelId && (
            <Link
              href={`/create/${wizardModelId}/quick?prompt=${encodeURIComponent(promptText.slice(0, 1500))}`}
              className="ml-auto flex items-center gap-1.5 rounded px-2.5 py-1 text-[10px] uppercase tracking-wider transition-all"
              style={{
                background: accentColor,
                color: '#0a0a12',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                boxShadow: `0 0 14px ${accentColor}66`,
              }}
            >
              <Wand2 size={11} />
              Use template
            </Link>
          )}
        </div>

        {/* Expanded breakdown placeholder — Act 2 polish lands the 13-cat parser here */}
        <AnimatePresence>
          {expanded && isImage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t pt-3"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <p
                className="text-[10px] uppercase tracking-[0.3em] mb-1"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
              >
                ◆ 13-cat breakdown
              </p>
              <p
                className="text-xs italic"
                style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
              >
                Auto-decompose coming soon — for now click &ldquo;Use template&rdquo; to remix in
                the wizard, where each category is editable.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

function shortRepo(repo: string): string {
  const parts = repo.split('/');
  if (parts.length !== 2) return repo;
  const [owner, name] = parts;
  const shortName = name
    .toLowerCase()
    .replace(/^awesome-?/, '')
    .replace(/-?prompts?$/, '')
    .replace(/-api$/, '');
  const shortOwner = owner.toLowerCase().replace(/-openlab$/, '');
  return `${shortOwner}/${shortName || name.toLowerCase()}`;
}

/**
 * Best-effort mapping from a feed item's source model to a wizard ModelType.
 * If we can't map cleanly, return null and hide the "Use template" CTA.
 */
function mapToWizardModel(item: FeedItem): ModelType | null {
  if (item._type === 'video') return 'kling'; // any video → kling wizard for now
  const model = item.model.toLowerCase();
  if (model.includes('nano banana') || model.includes('gemini')) return 'nano-banana';
  if (model.includes('gpt-image') || model.includes('gpt-4o')) return 'openai';
  return isValidModel(model) ? (model as ModelType) : 'nano-banana';
}
