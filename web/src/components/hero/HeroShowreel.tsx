'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

/**
 * Editorial hero — cream paper, ink black, ONE cobalt accent.
 *
 * Replaces the v2.0 Flash-era scrolling video showreel. The product is an
 * image generator; the hero now shows actual outputs (work strip) instead
 * of a cycling background. Headline gets a marker-highlight on the phrase
 * indexed by `highlightIndex` — the AYNEB / Areeba signature move.
 *
 * Legacy props (videoSrc, posterSrc, cycleMs) are kept in the interface as
 * `unknown` so existing call sites compile, but are ignored in render.
 */

export interface HeroShowreelProps {
  /** Tiny ◆ label above the headline. */
  eyebrow: string;
  /** Multi-line headline. Each entry becomes one stacked line. */
  headline: string[];
  /** Which headline line gets the marker-highlight swipe. Default: last line. */
  highlightIndex?: number;
  /** Subhead paragraph below the headline. */
  subhead?: string;
  /** Thumbnail paths shown in the work strip below the CTAs. Defaults to a
   *  curated 6 from /showcase. Pass `[]` to hide the strip. */
  images?: string[];
  /** 'landing' = full hero with work strip; 'feed' = compact, no work strip. */
  variant?: 'landing' | 'feed';
  /** CTA buttons + secondary actions slot. */
  children?: React.ReactNode;
  /** Live location/time meta city label. Default 'TORONTO'. */
  city?: string;

  /* Deprecated v2.0 props — accepted but no-op. */
  cycleMs?: number;
  videoSrc?: string;
  posterSrc?: string;
}

const DEFAULT_WORK_STRIP = [
  '/showcase/01-neon-noir.png',
  '/showcase/03-golden-hour-ethereal.png',
  '/showcase/04-brutalist-fashion.png',
  '/showcase/06-vintage-hollywood.png',
  '/showcase/08-avant-garde-editorial.png',
  '/showcase/14-synthwave-retro.png',
];

export function HeroShowreel({
  eyebrow,
  headline,
  highlightIndex,
  subhead,
  images = DEFAULT_WORK_STRIP,
  variant = 'landing',
  children,
  city = 'TORONTO',
}: HeroShowreelProps) {
  const reduce = useReducedMotion();
  const markIdx = highlightIndex ?? headline.length - 1;
  const heroMinHeight = variant === 'feed' ? 'min-h-[60vh]' : 'min-h-[92vh]';
  const showWorkStrip = variant === 'landing' && images.length > 0;

  return (
    <section
      className={`relative w-full ${heroMinHeight} overflow-hidden`}
      style={{
        background: 'var(--paper)',
        borderBottom: '1px solid var(--rule-strong)',
      }}
    >
      <div
        className="relative z-10 flex h-full min-h-inherit flex-col justify-between"
        style={{ padding: 'clamp(20px, 3.5vw, 56px) var(--gutter)' }}
      >
        {/* ── Top meta strip ── */}
        <motion.div
          className="flex items-start justify-between gap-6"
          initial={reduce ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="section-meta" style={{ marginBottom: 0 }}>
            <span className="meta-bullet">◆</span>
            {eyebrow}
          </span>
          <LiveClock city={city} />
        </motion.div>

        {/* ── Hero lockup ── */}
        <div className="flex flex-col items-start gap-8 md:gap-10 py-8 md:py-12">
          <h1 className="hero-lockup">
            {headline.map((line, i) => {
              const isMarked = i === markIdx;
              return (
                <motion.span
                  key={`${line}-${i}`}
                  className="block"
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.2 + i * 0.08,
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {isMarked ? <span className="highlight">{line}</span> : line}
                </motion.span>
              );
            })}
          </h1>

          {subhead && variant === 'landing' && (
            <motion.p
              className="body-editorial max-w-2xl"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
            >
              {subhead}
            </motion.p>
          )}

          {children && (
            <motion.div
              className="flex flex-wrap items-center gap-3 mt-2"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.6 }}
            >
              {children}
            </motion.div>
          )}
        </div>

        {/* ── Work strip — the meh fix ── */}
        {showWorkStrip && (
          <motion.div
            className="flex flex-col gap-3"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.6 }}
          >
            <div className="flex items-center gap-4">
              <span className="section-meta" style={{ marginBottom: 0 }}>
                <span className="meta-bullet">◆</span>
                Recent work
              </span>
              <span className="rule-h flex-1" />
              <span className="meta-clock">{images.length} of 133</span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
              {images.map((src) => (
                <div
                  key={src}
                  className="duotone-soft relative aspect-[4/5] overflow-hidden"
                  style={{ borderRadius: 2 }}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 33vw, 16vw"
                    style={{ objectFit: 'cover' }}
                    priority={false}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

/** Live "BASED IN [CITY], HH:MM" meta — updates every 30s. */
function LiveClock({ city }: { city: string }) {
  const [time, setTime] = useState<string>(() => formatTime(new Date()));
  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(new Date())), 30_000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="meta-clock whitespace-nowrap">
      BASED IN {city}, {time}
    </span>
  );
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
