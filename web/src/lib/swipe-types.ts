/** One card in the swipe feed (built on the server, rendered on the client). */
export interface SwipeCard {
  id: string;
  img: string;
  /** The ingredient the card teaches: Camera, Light, Era… */
  ing: string;
  /** Prompt text around the highlighted phrase. */
  pre: string;
  hit: string;
  post: string;
  /** One sentence: why the phrase works. */
  why: string;
  /** Three subject swaps for the remix sheet. */
  subj: string[];
  by: string;
  byUrl: string;
  model: string;
  /** The whole prompt, template slots filled with their defaults. */
  full: string;
}
