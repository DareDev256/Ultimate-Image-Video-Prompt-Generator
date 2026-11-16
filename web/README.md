# Ultimate Image Prompt Generator

A free, open-source web app for crafting AI image prompts with a guided wizard interface. Generate images with Google Gemini for free - no API key required!

**[Try it Live](https://prompts.tdotssolutionsz.com)** | [Report Bug](https://github.com/DareDev256/Ultimate-Image-Video-Prompt-Generator/issues) | [Request Feature](https://github.com/DareDev256/Ultimate-Image-Video-Prompt-Generator/issues)

## What is This?

This app helps you create better prompts for AI image (and video) generators. Instead of staring at a blank text box, you're guided through **11 categories** of curated suggestions — for example:

- **Subject** - What to generate (person, landscape, object, etc.)
- **Style** - Art style (photorealistic, anime, oil painting, etc.)
- **Lighting** - Mood and atmosphere
- **Composition** - Camera angle and framing
- **Details** - Colors, textures, and extras

Then it combines your choices into an optimized prompt and generates the image (or video) for you across **9 models**.

## Free Tier

**25 free image generations per day** using Nano Banana (Google Gemini). No sign-up, no API key needed - just start creating!

### How It Works

| Aspect | Details |
|--------|---------|
| Daily Limit | 25 generations per user |
| Model | Google Gemini (gemini-3-pro-image-preview) |
| Reset Time | Midnight (your local time) |
| Rate Limiting | Per visitor IP, plus a daily ceiling per server and an off switch (`FREE_TIER_GLOBAL_DAILY`, `FREE_TIER_ENABLED`) |
| Cost to You | Free |

### Why Free?

I'm covering the API costs from my own pocket to let people try AI image generation without barriers. Every image is billed on the Gemini API, so the free tier has a per-visitor limit and a daily ceiling.

For unlimited generations, you can add your own API keys in Settings.

## Features

- **Tap Wizard** - Five one-tap questions build the prompt in front of you; all nine steps are one tap away
- **Quick Mode** - Describe your idea, AI generates the full prompt
- **Swipe feed** - The phone home page: one real output per screen, the phrase that made it highlighted, remix it in three taps
- **Blur Face in Photo** - Blur or pixelate faces and crop a photo in the browser; nothing is uploaded
- **Inspiration Gallery** - The full prompt library from five open-source repos, every prompt credited
- **AI-Generated Examples** - Showcase prompts with the image each one made
- **9 Models** - Nano Banana (Gemini), GPT-Image-2, Kling, Seedance, Veo, Wan, HunyuanVideo, LTX-Video, and Mochi
- **No Account Required** - Everything stored locally in your browser
- **Night look** - True black, white type, one hot pink accent

## Inspiration Data Attribution

The inspiration gallery includes prompts curated by:

- **[YouMind-OpenLab/awesome-nano-banana-pro-prompts](https://github.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts)** - Nano Banana Pro prompts ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/))
- **[ZeroLu/awesome-gpt-image](https://github.com/ZeroLu/awesome-gpt-image)** and **[ImgEdify/Awesome-GPT4o-Image-Prompts](https://github.com/ImgEdify/Awesome-GPT4o-Image-Prompts)** - GPT image prompts (MIT)
- **[Anil-matcha/Awesome-GPT-Image-2-API-Prompts](https://github.com/Anil-matcha/Awesome-GPT-Image-2-API-Prompts)** - GPT-Image-2 prompts (no licence: shown with credit only)
- **[songguoxs/awesome-video-prompts](https://github.com/songguoxs/awesome-video-prompts)** - Video prompts (no licence: shown with credit only)

Live counts and each repo's licence are on the [Sources page](https://prompts.tdotssolutionsz.com/sources).

Thank you to these open-source contributors!

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org) | React framework with App Router |
| [Tailwind CSS](https://tailwindcss.com) | Styling |
| [Framer Motion](https://www.framer.com/motion/) | Animations |
| [Google Gemini](https://ai.google.dev) | Free tier image generation |
| [Vercel](https://vercel.com) | Hosting |

## Self-Hosting

### Prerequisites

- Node.js 18+
- npm or yarn
- (Optional) Gemini API key for free tier

### Setup

```bash
# Clone the repo
git clone https://github.com/DareDev256/Ultimate-Image-Video-Prompt-Generator.git
cd Ultimate-Image-Video-Prompt-Generator/web

# Install dependencies
npm install

# (Optional) Add your Gemini key for free tier
cp .env.example .env.local
# Edit .env.local with your GEMINI_API_KEY

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | No* | Enables free tier for users without their own keys |

*Without this, users must provide their own API keys to generate images.

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/DareDev256/Ultimate-Image-Video-Prompt-Generator&root-directory=web)

1. Click the button above
2. Add `GEMINI_API_KEY` in Environment Variables (optional)
3. Deploy!

## API Key Options

Users can bring their own keys for unlimited generations:

| Model | Provider | Cost | Get Key |
|-------|----------|------|---------|
| Nano Banana | Google Gemini | Per image, see [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) | [ai.google.dev](https://ai.google.dev/tutorials/setup) |
| GPT-Image-2 | OpenAI | ~$0.04-0.12/image | [platform.openai.com](https://platform.openai.com/api-keys) |
| Kling | Kling AI | Varies | [klingai.com](https://klingai.com) |
| Seedance · Veo · Wan · Hunyuan · LTX · Mochi | via [fal.ai](https://fal.ai) | Varies | [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys) |

User-provided keys are stored in browser localStorage and sent directly to the respective APIs - never to our servers.

## Privacy

- **No accounts** - No sign-up required
- **No tracking** - No analytics or cookies
- **Local storage only** - API keys and preferences stored in your browser
- **IP rate limiting** - Free tier uses IP for rate limits (not stored permanently)
- **Open source** - Audit the code yourself

## Known Limitations

- Free tier only works with Nano Banana (Gemini)
- Rate limiting resets at midnight local time (may vary by timezone)
- Server-side rate limiter uses in-memory storage (resets on deployment)
- Generated images are base64 data URLs (no cloud storage)

## Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT - do whatever you want with it.

## Acknowledgments

- Built with [Claude Code](https://claude.ai/claude-code)
- Prompt data from the open-source community
- Powered by Google Gemini, OpenAI, Kling AI, and fal.ai (Seedance, Veo, Wan, HunyuanVideo, LTX-Video, Mochi)

---

If you find this useful, consider starring the repo!
