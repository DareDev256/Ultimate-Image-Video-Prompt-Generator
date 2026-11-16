/**
 * Generated showcase images that stay off public showcase surfaces: real,
 * recognisable people (Steve Jobs, Trump, Taylor Swift…) and suggestive
 * framing. One list, read by /showcase, the desktop hero cloud manifest and
 * llms.txt. Source: src/data/held-images.json.
 */
import held from '@/data/held-images.json';

export type HoldReason = 'likeness' | 'suggestive';

export const HELD_IMAGES = held.images as Record<string, HoldReason>;

export function isHeldImage(path: string | null | undefined): boolean {
  return !!path && Object.prototype.hasOwnProperty.call(HELD_IMAGES, path);
}
