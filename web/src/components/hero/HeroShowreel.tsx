'use client';

import { motion, useReducedMotion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { HOLO_CARDS } from './holo-cards-manifest';

/**
 * Holo hero — near-black stage, 110 photo cards scattered in 3D, cursor
 * parallax, depth-of-field, iridescent rim shader. The product is an image
 * generator; the hero shows the actual library floating through space. No
 * curated thumbnail strip — the cloud IS the strip.
 *
 * Legacy v2.0 props (videoSrc, posterSrc, cycleMs, images) are still in the
 * interface as no-ops so existing call sites keep compiling.
 */

const HoloCardCloud = dynamic(
  () => import('./HoloCardCloud').then((m) => m.HoloCardCloud),
  { ssr: false }
);

export interface HeroShowreelProps {
  eyebrow: string;
  headline: string[];
  highlightIndex?: number;
  subhead?: string;
  variant?: 'landing' | 'feed';
  children?: React.ReactNode;
  city?: string;
  /** Max cards in the cloud. Smaller for `feed` variant. */
  cardLimit?: number;

  /* Deprecated v2.0 props — accepted but no-op. */
  images?: string[];
  cycleMs?: number;
  videoSrc?: string;
  posterSrc?: string;
}

export function HeroShowreel({
  eyebrow,
  headline,
  highlightIndex,
  subhead,
  variant = 'landing',
  children,
  city = 'TORONTO',
  cardLimit,
}: HeroShowreelProps) {
  const reduce = useReducedMotion();
  const markIdx = highlightIndex ?? headline.length - 1;
  const heroMinHeight = variant === 'feed' ? 'min-h-[60vh]' : 'min-h-[92vh]';
  const limit = cardLimit ?? (variant === 'feed' ? 36 : 110);

  return (
    <section
      className={`relative isolate w-full ${heroMinHeight} overflow-hidden`}
      style={{
        background: 'var(--ink)',
        borderBottom: '1px solid var(--rule-strong)',
      }}
    >
      {/* ── Cloud canvas — fills the section, sits behind text ── */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <HoloCardCloud cardLimit={limit} />
      </div>

      {/* ── Floor gradient — sells the depth, tucks the cards' bottom edge ── */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40"
        style={{
          background: 'linear-gradient(to top, var(--ink) 5%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* ── Left wash — keeps the headline readable against the bright cloud
            without sparsing out the field. Cobalt accent bleeds in for color
            so the wash is "lit", not just black. ── */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[62%]"
        style={{
          background:
            'linear-gradient(to right, var(--ink) 0%, rgba(6, 6, 8, 0.92) 30%, rgba(6, 6, 8, 0.55) 55%, transparent 100%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[40%]"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 0% 50%, var(--accent-soft), transparent 70%)',
        }}
        aria-hidden="true"
      />

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

        {/* ── Bottom meta ── */}
        <motion.div
          className="flex items-center gap-4"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.6 }}
        >
          <span className="section-meta" style={{ marginBottom: 0 }}>
            <span className="meta-bullet">◆</span>
            {HOLO_CARDS.length} pieces in the field
          </span>
          <span className="rule-h flex-1" />
          <span className="meta-clock">move mouse · scroll to dive in</span>
        </motion.div>
      </div>

      {/* Hidden DOM mirror — a11y + SEO. The WebGL canvas is invisible to
          crawlers and screen readers, so the same images render as a hidden
          list. */}
      <ul className="sr-only">
        {HOLO_CARDS.slice(0, limit).map((src) => (
          <li key={src}>
            <img src={src} alt="" />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Live "BASED IN [CITY], HH:MM" meta — updates every 30s.
 *  Initialized to an empty time slot on SSR so hydration stays stable; the
 *  client fills it in via useEffect. suppressHydrationWarning catches the
 *  millisecond-tick gap in case Date.now drifts between render and mount. */
function LiveClock({ city }: { city: string }) {
  const [time, setTime] = useState<string>('');
  useEffect(() => {
    setTime(formatTime(new Date()));
    const id = setInterval(() => setTime(formatTime(new Date())), 30_000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="meta-clock whitespace-nowrap" suppressHydrationWarning>
      BASED IN {city}{time && `, ${time}`}
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
