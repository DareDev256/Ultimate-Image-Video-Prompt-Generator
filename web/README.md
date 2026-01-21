# Ultimate Image Prompt Generator

A modern web application for generating AI image prompts using a guided wizard interface. Create stunning prompts for image generation models with an intuitive step-by-step process.

## Features

- **Guided Prompt Wizard**: Step-by-step interface to craft perfect prompts
- **Multiple AI Models**: Support for Nano Banana (Gemini), DALL-E 3, and Kling
- **Inspiration Gallery**: Browse 1000+ curated prompts for images and videos
- **Free Tier**: Try 10 free generations per day with Nano Banana - no API key required!
- **Beautiful UI**: Cyberpunk-inspired design with smooth animations

## Try It Free

You can generate images **without an API key** using our free tier:

- **10 free generations per day** with Nano Banana (Google Gemini)
- No sign-up required
- Just create your prompt and generate!

For unlimited generations or to use other models (DALL-E 3, Kling), add your own API keys in Settings.

## Getting Started

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Environment Variables

For self-hosting with free tier support, create a `.env.local` file:

```bash
# Required for Free Tier feature (server-side)
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your Gemini API key from: https://ai.google.dev/tutorials/setup

### Deployment to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add the `GEMINI_API_KEY` environment variable in Project Settings > Environment Variables
4. Deploy!

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Image Generation**: Google Gemini, OpenAI DALL-E 3, Kling AI

## API Keys

The app supports multiple AI models. Configure your keys in the Settings page:

| Model | Provider | Get API Key |
|-------|----------|-------------|
| Nano Banana | Google Gemini | [ai.google.dev](https://ai.google.dev/tutorials/setup) |
| DALL-E 3 | OpenAI | [platform.openai.com](https://platform.openai.com/api-keys) |
| Kling | Kling AI | [klingai.com](https://klingai.com) |

API keys are stored locally in your browser and never sent to our servers (except when using the free tier, which uses a server-side key).

## Privacy

- User API keys are stored in browser localStorage only
- No account required
- No data collection
- Free tier uses IP-based rate limiting (no personal data stored)

## License

MIT
