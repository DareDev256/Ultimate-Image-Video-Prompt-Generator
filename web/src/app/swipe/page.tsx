import type { Metadata } from 'next';
import { SwipeFeed } from '@/components/swipe/SwipeFeed';
import { loadSwipeCards } from '@/lib/server/swipe-cards';
import { loadImagePrompts, loadVideoPrompts } from '@/lib/server/prompt-data';

const cards = loadSwipeCards();

export const metadata: Metadata = {
  title: 'Swipe and Learn AI Image Prompts',
  description: `${cards.length} real AI images, each with the one phrase in its prompt that made it and why it works. Swipe, then remix the move into your own prompt in three taps.`,
  alternates: { canonical: '/swipe' },
};

export default function SwipePage() {
  const total = loadImagePrompts().length + loadVideoPrompts().length;
  return (
    <main>
      <SwipeFeed cards={cards} totalPrompts={total} framed />
    </main>
  );
}
