'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeroShowreel } from '@/components/hero/HeroShowreel';
import { LandingSections } from '@/components/landing/LandingSections';

/**
 * Landing — editorial reset (v3.0 wagyu pass).
 *
 * Hero shows actual generated work in the strip below the headline. Primary
 * CTA is locked as `PROMPT →` per James's v2.0 feedback — do not change.
 */
export default function LandingPage() {
  return (
    <main className="relative min-h-screen">
      <HeroShowreel
        variant="landing"
        eyebrow="Nine engines · 1,377 prompts · zero blank boxes"
        headline={['Make the shot,', 'skip the blank box.']}
        highlightIndex={1}
        subhead="Nine modern engines side by side — Nano Banana Pro, GPT-Image-2, Seedance 2.0, Veo 3.1, Kling 3.0, plus the open-source spectrum (Wan, HunyuanVideo, LTX, Mochi). Wizard, feed, sources, anatomy of a prompt. No fluff."
      >
        {/* Primary CTA — locked copy. */}
        <Link
          href="/create"
          className="btn btn-primary"
          style={{ paddingInline: '1.75rem' }}
        >
          <span>Prompt</span>
          <ArrowRight size={16} />
        </Link>

        {/* Secondary CTAs */}
        <Link href="/feed" className="btn btn-ghost">
          The feed
        </Link>
        <Link href="/anatomy" className="btn btn-ghost">
          Anatomy of a prompt
        </Link>
      </HeroShowreel>

      <LandingSections />
    </main>
  );
}
