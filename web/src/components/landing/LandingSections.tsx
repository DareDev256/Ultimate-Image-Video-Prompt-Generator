'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Wand2, Zap, Database, ArrowRight, Sparkles, Film, Clapperboard,
  Video, Aperture, Cpu, Box, Layers,
} from 'lucide-react';
import { MODEL_NAMES, MODEL_PROVIDERS, MODEL_KIND } from '@/lib/models';
import type { ModelType } from '@/context/WizardContext';

const STEPS = [
  {
    n: '01',
    title: 'Pick the engine',
    body: 'Nine models. Two image, seven video. Proprietary heavyweights and open-source picks side by side. Free tier on Gemini, BYOK on the rest.',
    icon: Wand2,
  },
  {
    n: '02',
    title: 'Build the prompt',
    body: '13 guided categories. 7,000+ curated suggestions per field. Or skip the wizard and remix anything in the feed with one click.',
    icon: Database,
  },
  {
    n: '03',
    title: 'Ship the shot',
    body: 'Live preview, copy, save, image-to-prompt reverse. No blank boxes. No guessing. Done.',
    icon: Zap,
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

const MODEL_ORDER: ModelType[] = [
  'nano-banana', 'openai',
  'seedance', 'veo', 'kling',
  'hunyuan', 'wan', 'ltx', 'mochi',
];

export function LandingSections() {
  return (
    <>
      <HowItWorks />
      <ModelsShowcase />
      <ReadDeeper />
    </>
  );
}

/* ───────────────────────── How it works ───────────────────────── */
function HowItWorks() {
  return (
    <section
      className="relative"
      style={{
        background: 'var(--paper)',
        padding: 'clamp(80px, 10vw, 160px) var(--gutter)',
      }}
    >
      <div className="mx-auto max-w-7xl">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
          className="section-meta"
        >
          <span className="meta-bullet">◆</span>How it works
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.55, delay: 0.05 }}
          className="max-w-4xl"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.25rem, 6vw, 5.5rem)',
            lineHeight: 0.92,
            letterSpacing: '-0.025em',
            fontWeight: 900,
            textTransform: 'uppercase',
            color: 'var(--ink)',
            margin: '0 0 4rem',
          }}
        >
          Three steps. <br />
          <span className="highlight">zero blank boxes</span>.
        </motion.h2>

        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.55, delay: idx * 0.08 }}
                className="card group p-6 md:p-8"
              >
                <div className="flex items-start justify-between">
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--ink)',
                      fontSize: '2.75rem',
                      fontWeight: 500,
                      lineHeight: 1,
                    }}
                  >
                    {step.n}
                  </span>
                  <Icon size={22} style={{ color: 'var(--ink-2)' }} />
                </div>
                <h3
                  className="mt-8"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.375rem',
                    letterSpacing: '-0.01em',
                    textTransform: 'uppercase',
                    fontWeight: 800,
                    color: 'var(--ink)',
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="mt-3"
                  style={{
                    color: 'var(--ink-2)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.55,
                  }}
                >
                  {step.body}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Models showcase ───────────────────────── */
function ModelsShowcase() {
  return (
    <section
      className="relative"
      style={{
        background: 'var(--paper-soft)',
        padding: 'clamp(80px, 10vw, 160px) var(--gutter)',
        borderTop: '1px solid var(--rule-strong)',
        borderBottom: '1px solid var(--rule-strong)',
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5 }}
              className="section-meta"
            >
              <span className="meta-bullet">◆</span>Nine modern engines
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="max-w-3xl"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.25rem, 6vw, 5.5rem)',
                lineHeight: 0.92,
                letterSpacing: '-0.025em',
                fontWeight: 900,
                textTransform: 'uppercase',
                color: 'var(--ink)',
                margin: 0,
              }}
            >
              Every model that <br />
              <span className="highlight">actually matters</span> in 2026.
            </motion.h2>
          </div>
          <Link
            href="/create"
            className="text-xs tracking-[0.25em] uppercase font-bold"
            style={{
              color: 'var(--ink)',
              fontFamily: 'var(--font-display)',
              textDecoration: 'underline',
              textUnderlineOffset: '6px',
            }}
          >
            Start generating →
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {MODEL_ORDER.map((id, idx) => {
            const Icon = MODEL_ICONS[id];
            const badge = MODEL_BADGES[id];
            const kind = MODEL_KIND[id];
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5, delay: idx * 0.04 }}
              >
                <Link
                  href={`/create/${id}`}
                  className="card group relative flex h-full flex-col p-6"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex h-11 w-11 items-center justify-center"
                      style={{
                        background: 'var(--paper)',
                        border: '1px solid var(--rule-strong)',
                        color: 'var(--ink)',
                        borderRadius: 2,
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 text-[9px] uppercase tracking-[0.18em]"
                        style={{
                          border: '1px solid var(--rule-strong)',
                          color: 'var(--ink-2)',
                          fontFamily: 'var(--font-mono)',
                          borderRadius: 2,
                        }}
                      >
                        {kind}
                      </span>
                      {badge && (
                        <span
                          className="px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] font-bold"
                          style={{
                            background: 'var(--accent)',
                            color: 'var(--paper)',
                            fontFamily: 'var(--font-display)',
                            borderRadius: 2,
                          }}
                        >
                          {badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3
                    className="mt-5"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '1.5rem',
                      letterSpacing: '-0.01em',
                      textTransform: 'uppercase',
                      fontWeight: 800,
                      color: 'var(--ink)',
                    }}
                  >
                    {MODEL_NAMES[id]}
                  </h3>
                  <p
                    className="mt-1 text-[10px] uppercase tracking-[0.22em]"
                    style={{
                      color: 'var(--ink-3)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {MODEL_PROVIDERS[id]}
                  </p>

                  <p
                    className="mt-4 flex-1"
                    style={{
                      color: 'var(--ink-2)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.875rem',
                      lineHeight: 1.55,
                    }}
                  >
                    {MODEL_TAGLINES[id]}
                  </p>

                  <div
                    className="mt-6 flex items-center gap-2 text-xs uppercase tracking-[0.2em] transition-all group-hover:gap-3"
                    style={{ color: 'var(--ink)', fontFamily: 'var(--font-display)', fontWeight: 700 }}
                  >
                    <span>Generate</span>
                    <ArrowRight size={14} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Read deeper (anatomy + blog) ───────────────────────── */
function ReadDeeper() {
  return (
    <section
      className="relative"
      style={{
        background: 'var(--paper)',
        padding: 'clamp(80px, 10vw, 160px) var(--gutter)',
      }}
    >
      <div className="mx-auto max-w-7xl grid gap-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="section-meta"
          >
            <span className="meta-bullet">◆</span>Read the breakdowns
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="max-w-4xl"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.25rem, 6vw, 5.25rem)',
              lineHeight: 0.92,
              letterSpacing: '-0.025em',
              fontWeight: 900,
              textTransform: 'uppercase',
              color: 'var(--ink)',
              margin: '0 0 1.5rem',
            }}
          >
            Director&apos;s commentary <br />
            <span className="highlight">on prompts that hit</span>.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="body-editorial mb-10 max-w-3xl"
          >
            Five editorial breakdowns of standout prompts — Helmut Newton portrait,
            brutalist fashion, vintage Hollywood, avant-garde editorial, synthwave
            retro. Why they work. What to swap. How to remix. Plus full per-source
            credit so the creators get theirs.
          </motion.p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/anatomy" className="btn btn-primary">
              <span>Anatomy of a prompt</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="/blog" className="btn btn-ghost">
              Read the blog
            </Link>
            <Link href="/sources" className="btn btn-ghost">
              Sources &amp; credit
            </Link>
          </div>
        </div>

        <div className="md:col-span-5">
          <div
            className="grid grid-cols-2 gap-3"
            style={{ alignContent: 'start' }}
          >
            {[
              '/showcase/01-neon-noir.png',
              '/showcase/04-brutalist-fashion.png',
              '/showcase/06-vintage-hollywood.png',
              '/showcase/08-avant-garde-editorial.png',
            ].map((src, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className="duotone-soft relative aspect-[4/5] overflow-hidden"
                style={{
                  borderRadius: 2,
                  border: '1px solid var(--rule)',
                }}
              >
                <img
                  src={src}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
