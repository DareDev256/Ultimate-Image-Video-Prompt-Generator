/**
 * Hand-curated launch posts for /blog.
 *
 * Each post pairs an existing showcase example (image + 13-cat JSON breakdown)
 * with editorial commentary on *why* the prompt works. The breakdown JSON is
 * loaded at request time from `web/public/showcase/<slug>.json`.
 *
 * To add a post: drop a new entry below, ensure the matching `<slug>.png/.json`
 * exists in `/public/showcase/`, and the route auto-picks it up.
 */

export interface BlogPost {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  showcaseSlug: string;
  publishedAt: string;
  model: string;
  modelColor: string;
  techniques: string[];
  whyItWorks: string;
  body: string[];
  tags: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'neon-noir-the-helmut-newton-trick',
    title: 'Neon Noir, the Helmut Newton trick',
    subtitle: 'Why this Tokyo-alley portrait reads as fashion editorial, not stock',
    excerpt:
      "Direct gaze + harsh neon + a cherry-red latex catsuit aren't the trick. The trick is naming the reference (Helmut Newton) so the model anchors style instead of copying surface details.",
    showcaseSlug: '01-neon-noir',
    publishedAt: '2026-04-29',
    model: 'Nano Banana Pro',
    modelColor: '#00d4ff',
    tags: ['portrait', 'cinematic', 'editorial', 'neon'],
    techniques: [
      'Anchor a *photographer*, not a style word',
      'Specify lens (85mm portrait) — model uses it as compression cue',
      'Color grade name in plain English ("warm orange and teal blockbuster")',
      'Atmospheric blocker: "rain drops on lens" — single phrase that adds depth',
    ],
    whyItWorks:
      "Most generators flatten 'cinematic' into a teal-shadow LUT. Naming Helmut Newton tells the model 'powerful women, hard light, no apology' — a vibe, not a filter. The 85mm cue plus 'eye level, straight on' kills the wide-angle hero pose default. Result: confrontation, not glamour.",
    body: [
      "Helmut Newton's portraits are confrontations. The subject doesn't perform femininity — she stares back. Most AI image models default to glamour-lit smiling fashion. To break that default, you have to name the photographer whose eye you want, then steer the camera + light around that anchor.",
      "The cherry-red latex is decoration. Swap it for any color and the photo still works because the *structure* is locked: harsh neon, deep shadows, eye-level, 85mm, direct gaze. That's what a Helmut Newton frame looks like.",
      "If you remix this prompt, swap subject + outfit but keep the camera/lighting/color stack. You'll get a series.",
    ],
  },
  {
    slug: 'brutalist-fashion-as-anti-instagram',
    title: 'Brutalist fashion as anti-Instagram',
    subtitle: 'Concrete, fluorescent, frontal — the recipe for an editorial that refuses to be cute',
    excerpt:
      "Most fashion shoots are warm. This one isn't. By naming brutalist concrete + cold fluorescent light + the photographer's frontal stance, you push the model away from sunshine-and-flowers default.",
    showcaseSlug: '04-brutalist-fashion',
    publishedAt: '2026-04-29',
    model: 'Nano Banana Pro',
    modelColor: '#00d4ff',
    tags: ['fashion', 'editorial', 'concrete', 'cold-light'],
    techniques: [
      'Architecture as wardrobe — use the building, not just behind it',
      'Cold fluorescent over warm tungsten — single change, completely different mood',
      'Frontal, symmetrical pose — refuses the dynamic editorial cliché',
      'Hard shadows on concrete = compositional gift',
    ],
    whyItWorks:
      "Fluorescent lighting on porcelain skin is the inverse of the golden-hour-Instagram default. Models trained on Instagram will fight you on this — be specific. 'Cold blue-green fluorescent strip overhead, no warm fill' wins over 'cinematic light' every time.",
    body: [
      "Fashion editorial is a balance: enough drama to read as art, enough product clarity to read as commerce. Brutalist locations give you both — the concrete is the drama, the negative space is the product showcase.",
      "Specifying 'frontal, symmetrical pose' is the hidden trick. Most fashion-trained models default to 3/4 turn with a hand on hip. Frontal-symmetrical reads architectural — the body becomes a continuation of the building's geometry.",
      "Cold light on warm skin tones creates the same contrast that drove early-2000s editorial — Mert & Marcus, David Sims. That tension is what makes the image feel intentional, not stock.",
    ],
  },
  {
    slug: 'vintage-hollywood-glamour-without-the-cheese',
    title: "Vintage Hollywood, without the cheese",
    subtitle: 'Three-point lighting, low-grain B&W, single-scene cinematic — and one detail that kills the costume-drama vibe',
    excerpt:
      "Period prompts go cheesy fast. The fix: name the *technique* (three-point key, fill, rim) instead of the era. The technique anchors the photo in craft, not nostalgia.",
    showcaseSlug: '06-vintage-hollywood',
    publishedAt: '2026-04-29',
    model: 'Nano Banana Pro',
    modelColor: '#00d4ff',
    tags: ['portrait', 'black-and-white', 'cinematic', 'classic'],
    techniques: [
      'Three-point lighting by name (key, fill, rim)',
      'Specify grain *level*, not just "film"',
      'Single-scene framing — no establishing shots',
      "Wardrobe note: 1940s silhouette, not 'vintage'",
    ],
    whyItWorks:
      'Models recognise three-point lighting as a real cinematography term and will compose accordingly. "Vintage Hollywood" alone gives you a costume — three-point lighting + 1940s silhouette + low-grain B&W gives you the shot.',
    body: [
      "There's a reason George Hurrell's portraits still feel modern: he wasn't documenting fashion, he was rendering faces. The lighting did the work. Your prompt has to do the same — name the lighting setup, not the era.",
      "Skip 'classic Hollywood glamour' as a phrase entirely. It's a costume-drama trigger. Replace with: 'three-point lighting, low-grain medium-format B&W, single-source key, soft fill, rim separation from black background.'",
      "The era reads through the wardrobe + hair. Let the lighting be timeless.",
    ],
  },
  {
    slug: 'avant-garde-editorial-the-rule-of-broken-symmetry',
    title: 'Avant-garde editorial: the rule of broken symmetry',
    subtitle: 'When the prompt is permission to be weird, the model goes weird in predictable ways. Here\'s how to steer it.',
    excerpt:
      "Avant-garde prompts go either generic-weird or generic-fashion. The escape valve: pair an unexpected material with a familiar pose. Tension > novelty.",
    showcaseSlug: '08-avant-garde-editorial',
    publishedAt: '2026-04-29',
    model: 'Nano Banana Pro',
    modelColor: '#00d4ff',
    tags: ['avant-garde', 'editorial', 'fashion'],
    techniques: [
      'Unexpected material + familiar pose = tension',
      'Asymmetric composition (subject pushed to one third)',
      'Background-as-subject rather than backdrop',
      'Specify what the subject is *not* doing',
    ],
    whyItWorks:
      "Models pattern-match 'avant-garde' to runway clichés (oversized shoulders, exaggerated makeup). Break the pattern by being *specific* about ONE non-clichéd element: a material, a colour collision, a posture choice. The familiar parts ground the weird parts.",
    body: [
      "Avant-garde reads as confidence. The least avant-garde thing you can do is try too hard. Give the model one weird anchor and let everything else stay quiet.",
      "Negative space is your friend. 'Subject pushed to right third, vast empty floor space, single overhead light pool' beats 'dramatic editorial composition' every time. The empty space IS the drama.",
      "Pro move: tell the model what the subject is NOT doing. 'Not posing, not smiling, not making eye contact' steers away from default fashion-shoot affect.",
    ],
  },
  {
    slug: 'synthwave-retro-and-the-color-cliche-trap',
    title: 'Synthwave retro and the color-cliché trap',
    subtitle: 'Pink + cyan + grid = a generic 2018 Tumblr aesthetic. Here\'s how to keep the synthwave palette but escape the cliché.',
    excerpt:
      "Synthwave is the most over-trained aesthetic in image gen. To get past the default, ground the colors in a real-world referent — VHS chroma error, 35mm cross-processing, magazine-print misregistration.",
    showcaseSlug: '14-synthwave-retro',
    publishedAt: '2026-04-29',
    model: 'Nano Banana Pro',
    modelColor: '#00d4ff',
    tags: ['synthwave', 'retro', 'cinematic', 'analog'],
    techniques: [
      'Reference an analog medium that produced the look — VHS, 35mm, halftone',
      'Add a "wrong" color (yellow shadows, green highlights)',
      'Specify resolution downgrades (slight blur, scan lines)',
      'Skip "neon" as a word — describe specific lights instead',
    ],
    whyItWorks:
      "The synthwave default is sterile because it's all digital cleanliness with neon overlay. Naming an analog source (VHS chroma bleed, expired 35mm) brings back the imperfections that made the original era feel hot. Imperfections are the style.",
    body: [
      "Synthwave isn't a colour palette. It's a memory of degraded media — VHS rolling, magazine print misregistration, cinema bulbs flickering. Recreate the medium, not the colours, and the colours come for free.",
      "If you're using 'neon' more than once in your prompt, you're flattening it. Replace with specific lights: 'red neon Pepsi script, blue tube sign for a noodle shop, single sodium streetlamp casting orange.' Now the model has to render lights, not vibes.",
      "Drop 'cyberpunk' if you want anything other than 2018 Blade Runner reruns. It's the most over-trained aesthetic in models — every output is the same wet street with the same pagoda.",
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  // Sort newest-first by publishedAt.
  return [...BLOG_POSTS].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}
