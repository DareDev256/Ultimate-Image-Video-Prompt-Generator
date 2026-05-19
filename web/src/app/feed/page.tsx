import type { Metadata } from 'next';
import { FeedClient } from '@/components/feed/FeedClient';

export const metadata: Metadata = {
  title: 'The Feed — Ultimate Image & Video Prompt Generator',
  description:
    "A scrolling timeline of 1,300+ AI prompts curated from open-source repos and X. Nano Banana Pro, GPT-Image-2, Seedance 2.0, Veo 3.1, Kling 3.0 — credit kept, prompts copyable, one-click remixable.",
  openGraph: {
    title: 'The Feed — prompts that actually work',
    description: 'Editorial timeline of working AI prompts. 5 modern models. 5 sources. Credit kept.',
    type: 'website',
  },
};

export default function FeedPage() {
  return <FeedClient />;
}
