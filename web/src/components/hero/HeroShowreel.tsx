'use client';

import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * Showreel hero — full-bleed cycling background with massive Orbitron headline overlay.
 *
 * **Background pipeline:**
 *   1. If `videoSrc` is provided → use a `<video autoplay muted loop>` element.
 *      This is the production state once James drops his Seedance hero footage.
 *   2. Otherwise → cycle through `images` at `cycleMs` cadence with Ken Burns zoom +
 *      flash-cut transitions. Used as the placeholder until real video lands.
 *
 * **Scroll bindings (Framer Motion useScroll):**
 *   - Background: opacity 1 → 0.25, scale 1 → 1.12 over the hero's height
 *   - Headline: y 0 → -80px, opacity 1 → 0
 *   - Eyebrow: opacity 1 → 0 faster than headline (out at 60% scroll)
 *
 * **Reduced motion:** transforms are bypassed; placeholder still cycles images
 * but at 6s cadence instead of 2.4s, with crossfade only (no Ken Burns scale).
 */

export interface HeroShowreelProps {
  /** Eyebrow label above the headline (small caps, mono font). */
  eyebrow: string;
  /** Multi-line headline. Pass an array; the component stacks them. */
  headline: string[];
  /** Subhead paragraph below the headline. */
  subhead?: string;
  /** Image paths used in placeholder cycle. Ignored when `videoSrc` is set. */
  images?: string[];
  /** Cadence (ms) between flash-cuts in placeholder mode. Default 2400. */
  cycleMs?: number;
  /** When set, replaces the image carousel with a looping video (the final state). */
  videoSrc?: string;
  /** Optional poster image while video loads. */
  posterSrc?: string;
  /** 'landing' = full 92vh hero with subhead; 'feed' = compact 70vh, no subhead. */
  variant?: 'landing' | 'feed';
  /** Extra content slotted below the headline (CTA buttons, stats counter, etc). */
  children?: React.ReactNode;
}

const DEFAULT_PLACEHOLDER_IMAGES = [
  '/showcase/01-neon-noir.png',
  '/showcase/04-brutalist-fashion.png',
  '/showcase/06-vintage-hollywood.png',
  '/showcase/11-cyberpunk-vendor.png',
  '/showcase/14-synthwave-retro.png',
  '/showcase/03-golden-hour-ethereal.png',
  '/showcase/13-underwater-dream.png',
  '/showcase/08-avant-garde-editorial.png',
];

export function HeroShowreel({
  eyebrow,
  headline,
  subhead,
  images = DEFAULT_PLACEHOLDER_IMAGES,
  cycleMs = 2400,
  videoSrc,
  posterSrc,
  variant = 'landing',
  children,
}: HeroShowreelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const bgOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.25]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.85, 1], [1, 0.2, 0]);
  const eyebrowOpacity = useTransform(scrollYProgress, [0, 0.5, 0.7], [1, 0.4, 0]);

  // Image cycle state for placeholder mode.
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    if (videoSrc) return;
    const cadence = reduce ? 6000 : cycleMs;
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % images.length);
    }, cadence);
    return () => clearInterval(id);
  }, [videoSrc, images.length, cycleMs, reduce]);

  const heroHeight = variant === 'feed' ? 'h-[70vh] min-h-[480px]' : 'h-[100vh] min-h-[640px]';

  return (
    <section
      ref={ref}
      className={`relative ${heroHeight} w-full overflow-hidden`}
      style={{
        background: 'var(--color-bg-deep)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Layer 0 — background carousel or video */}
      <motion.div
        className="absolute inset-0 z-0"
        style={reduce ? undefined : { opacity: bgOpacity, scale: bgScale }}
      >
        {videoSrc ? (
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={posterSrc}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <ImageCarousel images={images} activeIdx={activeIdx} reduceMotion={reduce ?? false} />
        )}
      </motion.div>

      {/* Layer 1 — color scrim + flash-cut white pulse on each image change */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            'radial-gradient(ellipse at 25% 30%, rgba(0,212,255,0.12) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(255,0,170,0.14) 0%, transparent 55%), linear-gradient(180deg, rgba(10,10,18,0.35) 0%, rgba(10,10,18,0.55) 50%, rgba(10,10,18,0.92) 100%)',
        }}
        aria-hidden="true"
      />
      {!videoSrc && !reduce && (
        <FlashOverlay key={activeIdx} />
      )}

      {/* Layer 2 — scanlines + grain (existing brand motif) */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-25"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent 0 2px, rgba(0,0,0,0.18) 2px 4px)',
        }}
        aria-hidden="true"
      />

      {/* Layer 3 — content */}
      <motion.div
        className="relative z-20 flex h-full flex-col justify-between px-6 py-10 md:px-16 md:py-14"
        style={reduce ? undefined : { y: titleY, opacity: titleOpacity }}
      >
        {/* Top meta strip */}
        <motion.div
          className="flex items-center justify-between text-[10px] tracking-[0.4em] uppercase opacity-90"
          style={reduce ? undefined : { opacity: eyebrowOpacity }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-success)' }}>
            ◆ {eyebrow}
          </span>
          <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            v2.0 · TORONTO
          </span>
        </motion.div>

        {/* Center stack */}
        <div className="flex flex-col items-start gap-6 md:gap-8">
          <h1
            className="text-nebula-glow"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: variant === 'feed'
                ? 'clamp(2.5rem, 8vw, 6.5rem)'
                : 'clamp(3rem, 11vw, 11rem)',
              lineHeight: 0.88,
              letterSpacing: '-0.025em',
              fontWeight: 900,
              textTransform: 'uppercase',
            }}
          >
            {headline.map((line, i) => (
              <motion.span
                key={`${line}-${i}`}
                className="block"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                {line}
              </motion.span>
            ))}
          </h1>

          {subhead && variant === 'landing' && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="max-w-2xl text-base md:text-lg"
              style={{
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.55,
              }}
            >
              {subhead}
            </motion.p>
          )}

          {children && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-wrap items-center gap-3"
            >
              {children}
            </motion.div>
          )}
        </div>

        {/* Bottom scroll cue */}
        <motion.div
          className="flex items-center gap-3 text-[10px] tracking-[0.4em] uppercase"
          style={reduce ? undefined : { opacity: eyebrowOpacity }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
            scroll
          </span>
          <span
            className="block h-px w-10 origin-left animate-pulse"
            style={{ background: 'var(--color-primary)', boxShadow: '0 0 8px var(--color-primary-glow)' }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>↓</span>
        </motion.div>
      </motion.div>
    </section>
  );
}

/** Cross-faded carousel with Ken Burns zoom on the active image. */
function ImageCarousel({
  images,
  activeIdx,
  reduceMotion,
}: {
  images: string[];
  activeIdx: number;
  reduceMotion: boolean;
}) {
  return (
    <div className="relative h-full w-full">
      {images.map((src, i) => {
        const isActive = i === activeIdx;
        return (
          <motion.div
            key={src}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{
              opacity: isActive ? 1 : 0,
              scale: reduceMotion ? 1 : isActive ? 1.08 : 1,
            }}
            transition={{
              opacity: { duration: 0.35, ease: 'easeOut' },
              scale: { duration: 4.5, ease: 'linear' },
            }}
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              willChange: 'opacity, transform',
            }}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}

/** Brief white-flash bloom on every image change — flash-cut moment. */
function FlashOverlay() {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-10"
      initial={{ opacity: 0.55 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        background:
          'radial-gradient(ellipse at center, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 25%, transparent 60%)',
        mixBlendMode: 'screen',
      }}
      aria-hidden="true"
    />
  );
}
