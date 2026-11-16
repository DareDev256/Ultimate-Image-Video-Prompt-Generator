import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadImagePrompts, loadVideoPrompts } from '@/lib/server/prompt-data';
import { BLOG_POSTS } from '@/lib/blog';
import { wizardCategories, videoCategories } from '@/lib/categories';
import feedCards from '@/data/feed-cards.json';
import { isHeldImage } from '@/lib/held-images';

// Every count below is read from the bundled data at build time. The old
// static public/llms.txt typed 1,377 prompts, 13 categories and 30 showcase
// examples while the data said otherwise.
export const dynamic = 'force-static';

export function GET() {
  const images = loadImagePrompts().length;
  const videos = loadVideoPrompts().length;
  const total = (images + videos).toLocaleString('en-US');
  const showcase = (
    JSON.parse(readFileSync(join(process.cwd(), 'public', 'data', 'generated-showcase.json'), 'utf-8')) as { image: string }[]
  ).filter((s) => !isHeldImage(s.image)).length;
  const meta = JSON.parse(readFileSync(join(process.cwd(), 'public', 'data', 'meta.json'), 'utf-8')) as {
    lastFetched: string;
  };
  const categories = new Set([...wizardCategories, ...videoCategories].map((c) => c.id)).size;
  const cards = (feedCards as { skip?: boolean }[]).filter((c) => !c.skip).length;
  const fetched = meta.lastFetched.slice(0, 10);

  const body = `# Ultimate Image & Video Prompt Generator

> Nine modern AI image and video engines side by side, with ${total} curated prompts from open-source repos and X (library fetched ${fetched}). A swipe feed that teaches one prompt move per real output, a guided wizard, per-source credit, and a photo blur tool that runs on the device. Built by [DareDev256](https://github.com/DareDev256) in Toronto.

## Highlights

- **Models wired:** Nano Banana Pro (Gemini 3 Pro Image, free daily tries), GPT-Image-2 (OpenAI), Seedance 2.0, Veo 3.1, Kling 3.0, plus the open-source spectrum: Wan 2.6, HunyuanVideo, LTX-Video 2.0, Mochi 1
- **${images.toLocaleString('en-US')} image prompts + ${videos} video prompts** from 5 open-source repos (\`YouMind-OpenLab/awesome-nano-banana-pro-prompts\` CC BY 4.0, \`ZeroLu/awesome-gpt-image\` MIT, \`ImgEdify/Awesome-GPT4o-Image-Prompts\` MIT, \`Anil-matcha/Awesome-GPT-Image-2-API-Prompts\` no licence, \`songguoxs/awesome-video-prompts\` no licence), each credited to its creator
- **Swipe feed:** ${cards} real outputs, each with the one phrase that made it highlighted and a one-line why
- **${categories}-category wizard:** subject, environment, lighting, camera, atmosphere, colour, film, composition and more
- **Blur Face in Photo:** blur or pixelate faces and crop a photo in the browser; the photo never leaves the device
- **Open source:** MIT, contributions welcome

## Pages

- [Home](/): the swipe feed on phones, the 3D showreel on desktop
- [The Feed](/feed): every prompt, filter by model, source and category, full attribution
- [The Blog](/blog): ${BLOG_POSTS.length} editorial breakdowns
- [Sources & Credit](/sources): per-repo attribution and licence
- [Create / Wizard](/create): pick a model, walk the prompt categories, ship
- [Showcase](/showcase): ${showcase} generated examples with the prompt that made each one
- [Blur Face in Photo](/blur-face-in-photo): on-device blur, pixelate and crop
- [Settings](/settings): per-provider API keys and generation defaults
- [API: List prompts](/api/prompts): paginated, filterable JSON over the corpus
- [API: Filter universe](/api/prompts/meta): models, sources, categories, tags and counts
- [API: Per-prompt OG card](/api/og/prompt?id=N&type=image|video): 1200x630 PNG

## Optional

- [Repo on GitHub](https://github.com/DareDev256/Ultimate-Image-Video-Prompt-Generator)
- [CHANGELOG](https://github.com/DareDev256/Ultimate-Image-Video-Prompt-Generator/blob/main/CHANGELOG.md)
- [DareDev256 portfolio](https://tdotssolutionsz.com)
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
