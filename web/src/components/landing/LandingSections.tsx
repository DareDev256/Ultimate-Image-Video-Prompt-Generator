'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Wand2, Zap, Database, ArrowRight, Sparkles, Film, Clapperboard, Video, Aperture, Cpu, Box, Layers } from 'lucide-react';
import { MODEL_NAMES, MODEL_COLORS, MODEL_PROVIDERS, MODEL_KIND } from '@/lib/models';
import type { ModelType } from '@/context/WizardContext';

const STEPS = [
  {
    n: '01',
    title: 'Pick the engine',
    body: 'Nine models. Two image, seven video. Proprietary heavyweights and open-source picks side by side. Free tier on Gemini, BYOK on the rest.',
    icon: Wand2,
    color: 'var(--color-primary)',
  },
  {
    n: '02',
    title: 'Build the prompt',
    body: '13 guided categories. 7,000+ curated suggestions per field. Or skip the wizard and remix anything in the feed with one click.',
    icon: Database,
    color: 'var(--color-secondary)',
  },
  {
    n: '03',
    title: 'Ship the shot',
    body: 'Live preview, copy, save, image-to-prompt reverse. No blank boxes. No guessing. Done.',
    icon: Zap,
    color: 'var(--color-accent)',
  },
] as const;

const MODEL_ICONS: Record<ModelType, React.ComponentType<{ size?: number; className?: string }>> = {
  'nano-banana': Sparkles,
  openai: Wand2,
  seedance: Film,
  veo: Clapperboard,
  kling: Video,
  wan: Aperture,
  hunyuan: Cpu,
  ltx: Layers,
  mochi: Box,
};

const MODEL_BADGES: Partial<Record<ModelType, string>> = {
  'nano-banana': 'NEW',
  openai: 'NEW',
  seedance: 'HOT',
  veo: 'NEW',
  ltx: 'CHEAP',
  mochi: 'OPEN',
  hunyuan: 'OPEN',
  wan: 'OPEN',
};

const MODEL_TAGLINES: Record<ModelType, string> = {
  'nano-banana': 'Gemini 3 Pro · 25/day free · text-in-image SOTA',
  openai: 'Broke the arena leaderboard by 242 pts · up to 4K',
  seedance: '$0.022/sec · multi-shot · phoneme-level lip-sync',
  veo: 'Native 4K@60 · synced audio · best dialogue clarity',
  kling: 'Multi-shot 3–15s · subject continuity · multi-character audio',
  wan: 'Alibaba MoE · open-source · ~$0.05/sec · 720p',
  hunyuan: '13B Tencent · open-source · prosumer-runnable · stable text alignment',
  ltx: 'Lightricks · cheapest hosted at ~$0.04/sec · 1080p–4K',
  mochi: '10B · Apache 2.0 license · strong prompt-following · self-host friendly',
};

// Order: image first, proprietary video second, open-source video third.
const MODEL_ORDER: ModelType[] = [
  'nano-banana',
  'openai',
  'seedance',
  'veo',
  'kling',
  'hunyuan',
  'wan',
  'ltx',
  'mochi',
];

export function LandingSections() {
  return (
    <>
      {/* ───────────────────────── How it works ───────────────────────── */}
      <section
        className="relative px-6 py-24 md:px-16 md:py-32"
        style={{ background: 'var(--color-bg-deep)' }}
      >
        <div className="mx-auto max-w-7xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="mb-3 text-xs tracking-[0.4em] uppercase"
            style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}
          >
            ◆ How it works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="text-nebula-glow mb-16 max-w-4xl"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 4.5rem)',
              lineHeight: 0.92,
              letterSpacing: '-0.02em',
              fontWeight: 900,
              textTransform: 'uppercase',
            }}
          >
            Three steps. <br />Zero blank boxes.
          </motion.h2>

          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="group relative overflow-hidden rounded-lg border p-6 md:p-8 transition-all"
                  style={{
                    background: 'linear-gradient(145deg, var(--color-bg-card), var(--color-bg-surface))',
                    borderColor: 'var(--color-border)',
                  }}
                  whileHover={{
                    y: -4,
                    boxShadow: `0 14px 40px rgba(0,0,0,0.5), 0 0 24px ${step.color}33`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-5xl font-black"
                      style={{ fontFamily: 'var(--font-mono)', color: step.color, opacity: 0.85 }}
                    >
                      {step.n}
                    </span>
                    <Icon size={28} style={{ color: step.color }} />
                  </div>
                  <h3
                    className="mt-6 text-2xl"
                    style={{
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="mt-3 text-sm leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
                  >
                    {step.body}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Models showcase ───────────────────────── */}
      <section
        className="relative px-6 py-24 md:px-16 md:py-32"
        style={{
          background: 'linear-gradient(180deg, var(--color-bg-deep) 0%, var(--color-bg-surface) 100%)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5 }}
                className="mb-3 text-xs tracking-[0.4em] uppercase"
                style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}
              >
                ◆ Five modern engines
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.55, delay: 0.05 }}
                className="text-nebula-glow max-w-3xl"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                  lineHeight: 0.92,
                  letterSpacing: '-0.02em',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                }}
              >
                Every model that <br />actually matters in 2026.
              </motion.h2>
            </div>
            <Link
              href="/create"
              className="text-xs tracking-[0.3em] uppercase opacity-80 transition-opacity hover:opacity-100"
              style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}
            >
              Start generating →
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {MODEL_ORDER.map((id, idx) => {
              const Icon = MODEL_ICONS[id];
              const color = MODEL_COLORS[id];
              const badge = MODEL_BADGES[id];
              const kind = MODEL_KIND[id];
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.55, delay: idx * 0.07 }}
                >
                  <Link
                    href={`/create/${id}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-lg border p-6 transition-all"
                    style={{
                      background: 'var(--color-bg-card)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    {/* Top — icon + badge */}
                    <div className="flex items-center justify-between">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-md"
                        style={{
                          background: `${color}15`,
                          border: `1px solid ${color}55`,
                          color,
                          boxShadow: `0 0 20px ${color}33`,
                        }}
                      >
                        <Icon size={22} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.2em]"
                          style={{
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-muted)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {kind}
                        </span>
                        {badge && (
                          <span
                            className="rounded px-2 py-0.5 text-[9px] uppercase tracking-[0.2em] font-bold"
                            style={{
                              background: color,
                              color: '#0a0a12',
                              fontFamily: 'var(--font-display)',
                            }}
                          >
                            {badge}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Name */}
                    <h3
                      className="mt-5"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.6rem',
                        letterSpacing: '0.01em',
                        textTransform: 'uppercase',
                        fontWeight: 800,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {MODEL_NAMES[id]}
                    </h3>
                    <p
                      className="mt-1 text-[11px] uppercase tracking-[0.25em]"
                      style={{ color, fontFamily: 'var(--font-mono)', opacity: 0.85 }}
                    >
                      {MODEL_PROVIDERS[id]}
                    </p>

                    {/* Tagline */}
                    <p
                      className="mt-4 flex-1 text-sm leading-relaxed"
                      style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
                    >
                      {MODEL_TAGLINES[id]}
                    </p>

                    {/* Bottom CTA */}
                    <div
                      className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.25em] transition-all group-hover:gap-3"
                      style={{ color, fontFamily: 'var(--font-display)' }}
                    >
                      <span>Generate</span>
                      <ArrowRight size={14} />
                    </div>

                    {/* Hover glow */}
                    <motion.div
                      className="pointer-events-none absolute inset-0 rounded-lg"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      style={{
                        boxShadow: `inset 0 0 60px ${color}22, 0 0 30px ${color}33`,
                      }}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────────────── Blog + Sources duo (replaces redundant feed CTA) ───────────────────────── */}
      <section
        className="relative px-6 py-24 md:px-16 md:py-32"
        style={{ background: 'var(--color-bg-deep)' }}
      >
        <div className="mx-auto max-w-7xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="mb-3 text-xs tracking-[0.4em] uppercase"
            style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}
          >
            ◆ Read the breakdowns
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="text-nebula-glow mb-8 max-w-4xl"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 4.5rem)',
              lineHeight: 0.92,
              letterSpacing: '-0.02em',
              fontWeight: 900,
              textTransform: 'uppercase',
            }}
          >
            Director&apos;s commentary <br />on prompts that hit.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mb-10 max-w-3xl text-base md:text-lg"
            style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}
          >
            Five editorial breakdowns of standout prompts — Helmut Newton portrait,
            brutalist fashion, vintage Hollywood, avant-garde editorial, synthwave
            retro. Why they work. What to swap. How to remix. Plus full per-source
            credit so the creators get theirs.
          </motion.p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/blog"
              className="btn btn-primary inline-flex items-center gap-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span>Read the blog</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/sources"
              className="btn btn-ghost inline-flex items-center gap-2"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span>Sources &amp; credit</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
