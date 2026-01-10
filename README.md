# Ultimate Image & Prompt Walkthrough Generator

> A Flash-era styled wizard that walks you through building the perfect AI image prompt, then generates it with your choice of model.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-ff69b4?style=flat-square&logo=framer)

## Screenshots

### Landing Page
![Landing Page](./screenshots/intro-loading.png)

### Model Selection
![Model Selection](./screenshots/model-selection.png)

### Wizard Interface
![Wizard](./screenshots/wizard-step.png)

## Features

**Step-by-Step Wizard**

- 9 guided categories: Subject, Setting, Style, Lighting, Camera, Mood, Color, Film Look, Vibes
- Click-to-use suggestions or type your own
- Randomize button for instant inspiration
- Keyboard navigation (arrow keys)

**Multi-Model Support**

- **Nano Banana (Gemini)** - Google's image generation with structured JSON prompts
- **DALL-E 3 (OpenAI)** - Natural language prompts with revised prompt feedback
- **Kling** - AI video generation with motion controls

**Flash Site Era Aesthetic (2002-2006)**

- Theatrical animated intro with skip option
- Glossy buttons with gradient effects  
- Floating particle background
- Cyan/pink/gold/green neon color palette
- Orbitron + Exo 2 typography

**Generation Flow**

- Live preview of assembled prompt (JSON or natural language)
- Animated generation progress
- Love It / Tweak It / Remix result actions
- Gallery to save and revisit creations

**Inspiration Gallery**

- 1,050+ curated image prompts from the community
- 50+ video prompts for Veo3/Kling/Hailuo
- Search and filter by tags (fashion, portrait, 3D, anime, etc.)
- Save favorites for quick access
- "Use as Template" to jumpstart your creation
- Pattern library with extracted lighting, cameras, moods, and styles

**Privacy First**

- BYOK (Bring Your Own Keys) - API keys stored in localStorage only
- No server-side storage of prompts or images
- Direct API calls from your browser

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| State | React Context + localStorage |
| APIs | Google Gemini, OpenAI, Kling |

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- API keys for the models you want to use:
  - [Google AI Studio](https://ai.google.dev/tutorials/setup) (Gemini/Nano Banana)
  - [OpenAI Platform](https://platform.openai.com/api-keys) (DALL-E 3)
  - [Kling AI](https://klingai.com) (Video)

### Installation

```bash
# Clone the repository
git clone https://github.com/DareDev256/Ultimate-Image-Video-Prompt-Generator.git
cd ultimate-image-prompt-generator

# Install dependencies
cd web
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Configure API Keys

1. Click the gear icon or go to `/settings`
2. Enter your API keys for each model
3. Keys are stored locally in your browser - never sent to any server

## Project Structure

```
.
├── web/                    # Next.js frontend
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   │   ├── page.tsx           # Intro screen
│   │   │   ├── create/            # Model selection + wizard
│   │   │   ├── settings/          # API key configuration
│   │   │   ├── gallery/           # Saved creations
│   │   │   └── api/generate/      # API routes for each model
│   │   ├── components/
│   │   │   ├── wizard/            # WizardStep, WizardProgress
│   │   │   └── effects/           # Particles background
│   │   ├── context/               # WizardContext, SoundContext
│   │   └── lib/                   # Categories, sounds
│   └── ...
├── src/                   # CLI tool (Bun)
└── docs/                  # Design documents
```

## CLI Tool

There's also a command-line version for quick prompt generation:

```bash
# Install dependencies
bun install

# Run interactive CLI
bun run index.ts

# Analyze an existing image to reverse-engineer its prompt
bun run index.ts --analyze path/to/image.png
```

## Design Philosophy

This project embraces the **Flash Site Era** aesthetic (2002-2006) - a time when websites were experiences, not just pages. Features include:

- **Theatrical Loading** - Animated intro with progress bar
- **Glossy Everything** - Buttons with gradients, shadows, and hover effects
- **Particle Systems** - Canvas-based floating particles
- **Sound Design** - (Optional) Click sounds and transitions
- **Over-the-top Transitions** - Page slides, scale animations, staggered reveals

## Challenges & Solutions

Building this project involved several interesting technical challenges:

**State Persistence Across Animated Page Transitions**
- Problem: Framer Motion page transitions unmount components, losing wizard state
- Solution: Used React Context with localStorage sync to persist selections across route changes while maintaining smooth animations

**Keyboard Navigation in Dynamic Content**
- Problem: Arrow key navigation conflicted with text input in suggestion fields
- Solution: Implemented focus detection to disable keyboard shortcuts when users are typing, with automatic re-enabling on blur

**Performance with Canvas Particle Systems**
- Problem: Initial particle implementation caused frame drops on lower-end devices
- Solution: Reduced particle count, implemented requestAnimationFrame throttling, and added `will-change` hints for GPU acceleration

**Multi-Model API Abstraction**
- Problem: Each AI model (Gemini, DALL-E, Kling) has different prompt formats and response structures
- Solution: Created a unified generation interface with model-specific adapters that transform wizard output into the appropriate format

## Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest features
- Submit pull requests

## Community Prompts Attribution

The Inspiration Gallery includes curated prompts from [@songguoxs](https://github.com/songguoxs):

- **[gpt4o-image-prompts](https://github.com/songguoxs/gpt4o-image-prompts)** - 1,050+ GPT-4o/Nano Banana image prompts
- **[awesome-video-prompts](https://github.com/songguoxs/awesome-video-prompts)** - 50+ Veo3/Kling video prompts

Thank you for sharing these amazing resources with the community!

## License

MIT License - feel free to use this for your own projects!

---

Built with caffeine and nostalgia for the early 2000s web.
