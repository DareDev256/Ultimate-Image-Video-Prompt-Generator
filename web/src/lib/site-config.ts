/**
 * Single source of truth for the site URL — flip when the custom domain
 * goes live so OG cards, sitemap, JSON-LD, and llms.txt all swap in lockstep.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://prompts.tdotssolutionsz.com';

export const SITE_NAME = 'Ultimate Image & Video Prompt Generator';
export const SITE_TAGLINE = 'Make the shot. Skip the blank box.';
export const SITE_DESCRIPTION =
  // No counts here: this string is typed, so a number in it goes stale (it
  // said 1,377 for months). Counted figures live in page metadata instead.
  'Swipe real AI images and learn the one phrase that made each one. Curated prompts for Nano Banana Pro, GPT-Image-2, Seedance 2.0, Veo 3.1, Kling 3.0 and open-source video, every one credited, plus a free on-device face blur.';

export const AUTHOR = {
  name: 'James "DareDev256" Olusoga',
  url: 'https://tdotssolutionsz.com',
  social: 'https://github.com/DareDev256',
};
