'use client';

import Link from 'next/link';
import { ArrowRight, Wand2 } from 'lucide-react';
import { HeroShowreel } from '@/components/hero/HeroShowreel';
import { LandingSections } from '@/components/landing/LandingSections';

/**
 * Landing page — Seedance-style showreel hero (placeholder cycle until James
 * drops his real ambient video) + scroll-revealed below-fold sections.
 *
 * Hero CTAs follow the user's "just something that says prompt so you can
 * get straight to it" feedback — primary CTA is literally `PROMPT →`,
 * everything else is secondary.
 */
export default function LandingPage() {
  return (
    <main className="relative min-h-screen">
      <HeroShowreel
        variant="landing"
        eyebrow="Two image models · seven video models · 1,377 prompts that work"
        headline={['Make the shot.', 'Skip the blank box.']}
        subhead="Nine modern engines side by side — Nano Banana Pro, GPT-Image-2, Seedance 2.0, Veo 3.1, Kling 3.0, plus the open-source spectrum (Wan, HunyuanVideo, LTX, Mochi). Wizard, feed, blog, sources — all stitched. No fluff."
        // To swap in real Seedance hero footage:
        //   videoSrc="/hero/showreel.mp4"
        //   posterSrc="/hero/showreel-poster.jpg"
      >
        {/* Primary CTA — literally says PROMPT, max contrast, drop straight into the wizard. */}
        <Link
          href="/create"
          className="inline-flex items-center gap-3 rounded px-7 py-3.5 text-base uppercase tracking-[0.2em] transition-all hover:gap-4"
          style={{
            background: 'var(--color-primary)',
            color: '#0a0a12',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            boxShadow: '0 4px 24px var(--color-primary-glow), 0 0 60px var(--color-primary-glow)',
          }}
        >
          <Wand2 size={18} />
          <span>Prompt</span>
          <ArrowRight size={18} />
        </Link>

        {/* Secondary CTAs — feed, blog, sources */}
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 rounded border px-4 py-2.5 text-xs uppercase tracking-[0.25em] transition-all hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-display)',
            background: 'rgba(10, 10, 18, 0.4)',
            backdropFilter: 'blur(8px)',
          }}
        >
          The feed
        </Link>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 rounded border px-4 py-2.5 text-xs uppercase tracking-[0.25em] transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          style={{
            borderColor: 'var(--color-border)',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-display)',
            background: 'rgba(10, 10, 18, 0.4)',
            backdropFilter: 'blur(8px)',
          }}
        >
          Read the blog
        </Link>
      </HeroShowreel>

      <LandingSections />
    </main>
  );
}
