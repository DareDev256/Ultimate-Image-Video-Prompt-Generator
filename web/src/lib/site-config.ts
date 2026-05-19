/**
 * Single source of truth for the site URL — flip when the custom domain
 * goes live so OG cards, sitemap, JSON-LD, and llms.txt all swap in lockstep.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://prompts.tdotssolutionsz.com';

export const SITE_NAME = 'Ultimate Image & Video Prompt Generator';
export const SITE_TAGLINE = 'Make the shot. Skip the blank box.';
export const SITE_DESCRIPTION =
  'Nine modern AI engines side by side — Nano Banana Pro, GPT-Image-2, Seedance 2.0, Veo 3.1, Kling 3.0, plus open-source video (Wan, HunyuanVideo, LTX, Mochi). 1,377 curated prompts. Wizard, feed, blog, sources — all stitched.';

export const AUTHOR = {
  name: 'James "DareDev256" Olusoga',
  url: 'https://tdotssolutionsz.com',
  social: 'https://github.com/DareDev256',
};
