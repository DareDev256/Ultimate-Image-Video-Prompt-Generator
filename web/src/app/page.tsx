import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeroShowreel } from '@/components/hero/HeroShowreel';
import { LandingSections } from '@/components/landing/LandingSections';
import { loadImagePrompts, loadVideoPrompts } from '@/lib/server/prompt-data';
import { loadSwipeCards } from '@/lib/server/swipe-cards';
import { SwipeFeed } from '@/components/swipe/SwipeFeed';

/**
 * Landing — editorial reset (v3.0 wagyu pass).
 *
 * Hero shows actual generated work in the strip below the headline. Primary
 * CTA is locked as `PROMPT →` per James's v2.0 feedback — do not change.
 */
export default function LandingPage() {
  // Counted from the bundled data at build time, never typed (the eyebrow
  // said 1,377 while the library held 1,427).
  const promptCount = loadImagePrompts().length + loadVideoPrompts().length;
  return (
    <main className="relative min-h-screen">
      {/* Phones get the swipe feed as the home page (plan A1, 2026-11-16):
          one card per screen instead of 7 screens of scroll. Desktop keeps
          the 3D showreel; the cloud only mounts when it is visible. */}
      <div className="md:hidden">
        <SwipeFeed cards={loadSwipeCards()} totalPrompts={promptCount} />
      </div>
      <div className="hidden md:block">
      <HeroShowreel
        variant="landing"
        eyebrow={`Nine engines · ${promptCount.toLocaleString('en-US')} prompts · zero blank boxes`}
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
        <Link href="/swipe" className="btn btn-ghost">
          Swipe and learn
        </Link>
        <Link href="/feed" className="btn btn-ghost">
          The feed
        </Link>
        <Link href="/anatomy" className="btn btn-ghost">
          Anatomy of a prompt
        </Link>
      </HeroShowreel>

      <LandingSections />
      </div>
    </main>
  );
}
