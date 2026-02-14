# Ultimate Image & Video Prompt Generator

> Dual-platform AI prompt builder — a Flash-era web wizard **and** a powerful CLI — that walks you through crafting hyper-detailed image and video prompts, then generates them with your choice of model.

**[Try the Live Demo](https://web-ten-vert-46.vercel.app)** · [Report Bug](https://github.com/DareDev256/Ultimate-Image-Video-Prompt-Generator/issues) · [Request Feature](https://github.com/DareDev256/Ultimate-Image-Video-Prompt-Generator/issues)

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-ff69b4?style=flat-square&logo=framer)
![Bun](https://img.shields.io/badge/Bun-runtime-f9f1e1?style=flat-square&logo=bun)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## Screenshots

| Landing Page | Model Selection | Wizard |
|:---:|:---:|:---:|
| ![Landing](./screenshots/intro-loading.png) | ![Models](./screenshots/model-selection.png) | ![Wizard](./screenshots/wizard-step.png) |

## Two Ways to Create

### Web App — Visual Wizard

A step-by-step guided experience with a Flash Site Era (2002-2006) aesthetic. Choose your model, walk through 9-11 categories, preview your assembled prompt, and generate — all in the browser.

### CLI Tool — Terminal Power

An interactive terminal interface for rapid prompt building with presets, templates, favorites, and image-to-prompt reverse engineering. Built on Bun with `@clack/prompts`.

## Features

### Guided Prompt Building

- **13 deep categories** with 3-7 fields each: Subject, Camera, Fashion, Environment, Lighting, Atmosphere, Composition, Color, Film, Technical, Vibes, and more
- **Curated suggestions** per field (8-10 hyper-specific options like "six thick rope braids radiating outward from skull")
- **Randomize** button for instant inspiration
- **Keyboard navigation** with smart focus detection

### Multi-Model Generation

| Model | Type | Prompt Format | Free Tier |
|-------|------|--------------|-----------|
| **Nano Banana** (Gemini) | Image | Structured JSON | 10/day |
| **DALL-E 3** (OpenAI) | Image | Natural language | BYOK only |
| **Kling** | Video (5s/10s) | Natural language | BYOK only |

- **Free Tier** — Try Nano Banana without an API key (10 generations/day, server-side Gemini)
- **BYOK** — Bring Your Own Keys for unlimited use (keys stored in localStorage only)

### Inspiration Gallery

- **1,180+ curated image prompts** from the community
- **50+ video prompts** for Veo3/Kling/Hailuo
- Search and filter by tags (fashion, portrait, 3D, anime, etc.)
- Save favorites for quick access
- **"Use as Template"** to pre-fill the wizard
- **Pattern library** — extracted lighting setups, camera angles, moods, and styles from across all 1,180+ prompts

### Generation Flow

- Live preview of assembled prompt (JSON or natural language depending on model)
- Animated generation progress
- **Love It / Tweak It / Remix** result actions
- Gallery to save and revisit creations
- 30 pre-generated **Showcase** examples

### CLI Power Features

```bash
bun run index.ts                          # Interactive wizard
bun run index.ts --analyze photo.png      # Reverse-engineer a prompt from an image
bun run index.ts --template "Subway Flash" # Start from a built-in template
bun run index.ts --preset fashion         # Use a category pack (quick/standard/full/fashion/street)
bun run index.ts --load my-preset         # Load a saved preset
bun run index.ts --list-templates         # Browse available templates
bun run index.ts --favorites list         # Manage favorite suggestions
```

### API Key Pricing

| Model | Provider | Cost per Image | Get a Key |
|-------|----------|---------------|-----------|
| Nano Banana | Google Gemini | ~$0.03 | [ai.google.dev](https://ai.google.dev/tutorials/setup) |
| DALL-E 3 | OpenAI | ~$0.04–0.12 | [platform.openai.com](https://platform.openai.com/api-keys) |
| Kling | Kling AI | Varies | [klingai.com](https://klingai.com) |

### Privacy & Security

- API keys stored in `localStorage` only — never sent to any server
- No server-side storage of prompts or images
- Direct API calls from your browser (except free tier)
- Server-side input validation: prompt length limits, control character stripping, API key format validation
- Rate limiting on free tier (10 generations/day per client)

## Tech Stack

| Layer | Web App | CLI |
|-------|---------|-----|
| Framework | Next.js 16 (App Router) | Bun runtime |
| Language | TypeScript 5 | TypeScript 5 |
| Styling | Tailwind CSS v4 | picocolors |
| Animations | Framer Motion 12 | — |
| UI | React 19 + Lucide icons | @clack/prompts |
| State | React Context + localStorage | File-based storage |
| APIs | Gemini, OpenAI, Kling | Gemini Vision (analyzer) |

## Getting Started

### Prerequisites

- **Node.js 18+** (web) or **Bun** (CLI + web)
- API keys (optional — free tier available for Nano Banana):
  - [Google AI Studio](https://ai.google.dev/tutorials/setup) — Gemini / Nano Banana
  - [OpenAI Platform](https://platform.openai.com/api-keys) — DALL-E 3
  - [Kling AI](https://klingai.com) — Video

### Web App

```bash
git clone https://github.com/DareDev256/Ultimate-Image-Video-Prompt-Generator.git
cd Ultimate-Image-Video-Prompt-Generator/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Configure API keys at `/settings` or just try the free tier.

### CLI Tool

```bash
cd Ultimate-Image-Video-Prompt-Generator
bun install
bun run index.ts
```

### Environment Variables

| Variable | Required | Scope | Description |
|----------|----------|-------|-------------|
| `GEMINI_API_KEY` | No | Server | Enables the free tier (10 generations/day) for users without their own keys |

User-provided API keys (Gemini, OpenAI, Kling) are entered in the browser at `/settings` and stored in `localStorage` only — they never touch the server.

### Deploy Your Own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/DareDev256/Ultimate-Image-Video-Prompt-Generator&root-directory=web)

Or manually:

```bash
cd web && npm run build && npx vercel --prod
```

Add `GEMINI_API_KEY` as an environment variable in your Vercel dashboard to enable the free tier for your users.

## Project Structure

```
.
├── web/                          # Next.js web app
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Theatrical intro screen
│   │   │   ├── create/           # Model selection → wizard → preview → generate → result
│   │   │   ├── gallery/          # Saved creations
│   │   │   ├── showcase/         # 30 pre-generated examples
│   │   │   ├── settings/         # API key configuration
│   │   │   └── api/generate/     # API routes (nano-banana, openai, kling)
│   │   ├── components/
│   │   │   ├── wizard/           # WizardStep, WizardProgress
│   │   │   ├── effects/          # Canvas particle system
│   │   │   └── inspiration/      # Gallery panel, search, filters, cards
│   │   ├── context/              # WizardContext (state + persistence), SoundContext
│   │   ├── hooks/                # useFavorites, useFreeTier, useInspirationData, usePatterns
│   │   └── lib/                  # Categories, sounds
│   └── public/data/              # Prompt library, patterns, showcase metadata
│
├── src/                          # CLI tool (Bun)
│   ├── index.ts                  # Entry point with arg parsing
│   ├── analyzer/                 # Gemini Vision — reverse-engineer prompts from images
│   ├── cli/                      # Terminal UI (prompts, display, menus, args)
│   ├── core/                     # 13 categories (1,019 lines), preset packs, templates
│   ├── generators/               # Composable section pipeline
│   │   ├── sections.ts           # 13 pure section generators
│   │   ├── natural.ts            # Natural language assembly (flatMap pipeline)
│   │   └── json.ts               # JSON output with recursive cleanup
│   ├── lib/                      # Shared utilities
│   │   └── json-store.ts         # Generic typed JSON file storage
│   ├── storage/                  # Config, presets, favorites (via JsonStore)
│   └── types/                    # ImagePrompt interface (12 nested types)
│
├── scripts/                      # Data pipeline (fetch, extract, translate, generate)
└── docs/                         # Design documents and plans
```

## Architecture

### Composable Section Pipeline

The prompt generator uses a **functional pipeline** architecture. Each prompt section is an independent pure function that extracts and formats one concern:

```
ImagePrompt → [subjectSection, hairSection, clothingSection, ...13 total] → flatMap → join → final prompt
```

Sections can be composed, reordered, or extended without touching other sections. The natural language generator is just 18 lines — a `flatMap` over the section array.

### Web App Page Flow

```
/ (Intro) → /create (Model Selection) → /create/[model] (Wizard Steps)
                                          ├── /quick (Freeform mode)
                                          ├── /preview (Assembled prompt)
                                          ├── /generate (API call + progress)
                                          └── /result (Love It / Tweak It / Remix)
```

State persists across all page transitions via React Context + localStorage sync, surviving Framer Motion route animations.

## Testing

```bash
bun test
```

149 tests across 8 test files covering:
- Section ordering and output formatting
- Action/body_position precedence logic
- Deep nesting cleanup in JSON output
- Unicode handling
- Generator consistency between JSON and natural language modes
- Storage layer (config, presets, favorites)
- CLI argument parser (flags, shorthands, packs, presets, favorites subcommands)
- JsonStore persistence (file I/O, defaults, deep-clone isolation, roundtripping)
- Pack composition and preset expansion (deduplication, always-core invariant, full coverage)
- Template registry (lookup, listing, data integrity, uniqueness constraints)

## Design Philosophy

This project embraces the **Flash Site Era** aesthetic (2002-2006) — when websites were *experiences*, not just pages:

- **Theatrical Loading** — Animated intro with progress bar and skip option
- **Glossy Everything** — Buttons with gradients, shadows, and glow effects
- **Particle Systems** — Canvas-based floating particles with GPU acceleration
- **Sound Design** — Optional click sounds and transitions
- **Over-the-top Transitions** — Page slides, scale animations, staggered reveals
- **Neon Palette** — Cyan `#00d4ff`, pink `#ff00aa`, green `#00ff88`, gold `#ffd700`
- **Typography** — Orbitron (headings) + Exo 2 (body)

## Challenges & Solutions

**State Persistence Across Animated Page Transitions**
Framer Motion page transitions unmount components, losing wizard state. Solved with React Context + localStorage sync to persist selections across route changes while maintaining smooth animations.

**Keyboard Navigation in Dynamic Content**
Arrow key navigation conflicted with text input in suggestion fields. Implemented focus detection to disable keyboard shortcuts when users are typing, with automatic re-enabling on blur.

**Performance with Canvas Particle Systems**
Initial particle implementation caused frame drops on lower-end devices. Reduced particle count, implemented `requestAnimationFrame` throttling, and added `will-change` hints for GPU acceleration.

**Multi-Model API Abstraction**
Each AI model has different prompt formats and response structures. Created a unified generation interface with model-specific adapters that transform wizard output into the appropriate format (JSON for Nano Banana, natural language for DALL-E/Kling).

## Community Prompts Attribution

The Inspiration Gallery includes curated prompts from [@songguoxs](https://github.com/songguoxs):

- **[gpt4o-image-prompts](https://github.com/songguoxs/gpt4o-image-prompts)** — Image prompt collection (1,180+ curated prompts)
- **[awesome-video-prompts](https://github.com/songguoxs/awesome-video-prompts)** — 50+ Veo3/Kling video prompts

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines. Bug reports, feature suggestions, and pull requests are welcome.

## License

[MIT](./LICENSE)

---

Built with caffeine and nostalgia for the early 2000s web.
