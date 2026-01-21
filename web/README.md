# Ultimate Image Prompt Generator

A free, open-source web app for crafting AI image prompts with a guided wizard interface. Generate images with Google Gemini for free - no API key required!

**[Try it Live](https://web-ten-vert-46.vercel.app)** | [Report Bug](https://github.com/DareDev256/Ultimate-Image-Video-Prompt-Generator/issues) | [Request Feature](https://github.com/DareDev256/Ultimate-Image-Video-Prompt-Generator/issues)

## What is This?

This app helps you create better prompts for AI image generators. Instead of staring at a blank text box, you're guided through choosing:

- **Subject** - What to generate (person, landscape, object, etc.)
- **Style** - Art style (photorealistic, anime, oil painting, etc.)
- **Lighting** - Mood and atmosphere
- **Composition** - Camera angle and framing
- **Details** - Colors, textures, and extras

Then it combines your choices into an optimized prompt and generates the image for you.

## Free Tier

**10 free image generations per day** using Nano Banana (Google Gemini). No sign-up, no API key needed - just start creating!

### How It Works

| Aspect | Details |
|--------|---------|
| Daily Limit | 10 generations per user |
| Model | Google Gemini (gemini-2.0-flash-exp-image-generation) |
| Reset Time | Midnight (your local time) |
| Rate Limiting | IP-based (no account needed) |
| Cost to You | Free |

### Why Free?

I'm covering the API costs from my own pocket to let people try AI image generation without barriers. The Gemini API is affordable (~$0.03 per image), so offering 10 free generations daily is sustainable for a hobby project.

For unlimited generations, you can add your own API keys in Settings.

## Features

- **Guided Wizard** - Step-by-step prompt building
- **Quick Mode** - Describe your idea, AI generates the full prompt
- **Inspiration Gallery** - 1000+ curated prompts from the community
- **30 Curated Examples** - Hand-picked showcase with generated images
- **113 AI-Generated Examples** - Diverse prompts with sample outputs
- **Multiple Models** - Support for Gemini, DALL-E 3, and Kling
- **No Account Required** - Everything stored locally in your browser
- **Dark Mode** - Cyberpunk-inspired UI

## Inspiration Data Attribution

The inspiration gallery includes prompts curated by:

- **[songguoxs/ai-image-prompt-ideas](https://github.com/songguoxs/ai-image-prompt-ideas)** - Image prompt collection
- **[Sora Prompts](https://github.com/youmind-com/sora-prompts)** - Video prompt collection

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
| Nano Banana | Google Gemini | ~$0.03/image | [ai.google.dev](https://ai.google.dev/tutorials/setup) |
| DALL-E 3 | OpenAI | ~$0.04-0.12/image | [platform.openai.com](https://platform.openai.com/api-keys) |
| Kling | Kling AI | Varies | [klingai.com](https://klingai.com) |

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
- Powered by Google Gemini, OpenAI, and Kling AI

---

If you find this useful, consider starring the repo!
