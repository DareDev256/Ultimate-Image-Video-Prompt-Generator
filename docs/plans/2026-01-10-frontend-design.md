# Ultimate Image Generator - Frontend Design

## Overview

A Flash-era styled web frontend for the Ultimate Image Prompt Generator. Transforms the CLI tool into a guided "Full Generation Hub" where users build prompts step-by-step and generate images/videos directly.

**Tagline:** "Image of your dreams, we walk you through it"

## Core Decisions

| Decision | Choice |
|----------|--------|
| Framework | Next.js (App Router) |
| User Flow | Step-by-step wizard |
| Model Selection | Upfront (first screen) |
| Aesthetic | Flash Site Era (loading bars, animations, sound effects, interactive) |
| Result Flow | Iterate Loop (Love it / Tweak it / Remix) |
| API Access | Hybrid (free tier with daily limits + BYOK for unlimited) |
| Intro | Skip-able animated intro |
| Sound | Off by default, toggle to enable |

## Supported Models

| Model | Type | Notes |
|-------|------|-------|
| Nano Banana (Gemini) | Image | JSON prompts, existing skill |
| OpenAI (DALL-E 3) | Image | Natural language prompts |
| Kling | Video | Async generation with polling |

## User Flow

```
[Intro Screen] → [Model Selection] → [Step Wizard] → [Preview] → [Generate] → [Result Loop]
```

### 1. Intro Screen
- Animated sequence: Logo builds in, tagline fades
- Loading bar fills (theatrical, even if fake)
- "Enter" button pulses when ready
- "Skip" link in corner for returning users
- Background: Animated Flash-style gradients or particle effects

### 2. Model Selection
- Three big interactive cards with hover effects:
  - Image (Nano Banana) - "Gemini-powered, JSON precision"
  - Image (DALL-E) - "OpenAI natural language"
  - Video (Kling) - "Bring your vision to motion"
- Clicking triggers transition sound (if enabled)
- Selection animates and zooms before transitioning

### 3. Step Wizard
- Progress bar at top showing all steps
- One category per screen (Subject → Setting → Lighting → etc.)
- Each step has: field inputs, helpful tips, "inspiration" button
- Animated transitions between steps (slide, fade, Flash-style wipes)
- Back/Next buttons with hover sound effects

### 4. Preview Screen
- Show assembled prompt before spending credits
- Split view: "Your Prompt" + "Raw Output"
- Edit button to jump back to any step
- Big "Generate" button with animated glow
- Estimated cost/credits shown

### 5. Generation State
- Full-screen Flash-era loading animation
- Fake processing steps: "Analyzing vision...", "Crafting pixels..."
- Progress bar with tension-building sound (if enabled)

### 6. Result Screen
- Generated image/video displays prominently
- Three action buttons:
  - "Love it" → Download + save to gallery
  - "Tweak it" → Return to wizard with fields preserved
  - "Remix" → Randomize select fields and regenerate
- Prompt used shown below
- "Start Fresh" link

### 7. Gallery
- Grid of past generations (localStorage)
- Thumbnail, date, model used
- Click to view full + original prompt
- Delete option per item

## Technical Architecture

```
ultimate-image-generator/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Intro screen
│   │   ├── create/
│   │   │   ├── page.tsx        # Model selection
│   │   │   └── [model]/
│   │   │       └── page.tsx    # Wizard for that model
│   │   ├── gallery/
│   │   │   └── page.tsx        # Saved generations
│   │   └── api/
│   │       ├── generate/
│   │       │   ├── nano-banana/route.ts
│   │       │   ├── openai/route.ts
│   │       │   └── kling/route.ts
│   │       └── usage/route.ts  # Free tier tracking
│   ├── components/
│   │   ├── wizard/             # Step components
│   │   ├── ui/                 # Retro UI primitives
│   │   └── effects/            # Flash-style animations
│   ├── lib/
│   │   ├── generators/         # Reuse existing TS logic
│   │   ├── storage.ts          # localStorage helpers
│   │   └── sounds.ts           # Audio manager
│   └── styles/
│       └── retro.css           # Y2K Flash aesthetic
├── public/
│   ├── sounds/                 # Click, whoosh, chime
│   └── assets/                 # Animated GIFs, textures
```

## Aesthetic System

### Color Palette
```
Primary:    #00d4ff (electric cyan)
Secondary:  #ff00aa (hot pink)
Accent:     #ffcc00 (gold/yellow)
Background: #0a0a12 (deep space)
Surface:    #1a1a2e (dark purple-gray)
Success:    #00ff88 (neon green)
```

### Visual Elements
- **Backgrounds:** Animated gradients, particle effects, dark base
- **Buttons:** Glossy, beveled edges, glow on hover, 3D push on click
- **Cards:** Metallic borders, inner shadows, shimmer on hover
- **Typography:** Pixel fonts for headers, clean sans-serif for body
- **Progress bars:** Chunky, segmented, animated fill with glow
- **Transitions:** Slide, zoom, fade combos - no instant cuts
- **Cursor:** Custom pointer for interactive elements

### Sound Library
- `click.mp3` - Soft UI click
- `whoosh.mp3` - Step transitions
- `processing.mp3` - Looping generation ambient
- `success.mp3` - Generation complete fanfare
- `hover.mp3` - Subtle hover feedback

## API Integration

### Nano Banana
```typescript
POST /api/generate/nano-banana
Body: { prompt: GeneratedPrompt, apiKey: string }
Response: { imageUrl: string, seed: number }
```

### OpenAI (DALL-E 3)
```typescript
POST /api/generate/openai
Body: { prompt: string, size: "1024x1024" | "1792x1024", apiKey: string }
Response: { imageUrl: string, revisedPrompt: string }
```

### Kling
```typescript
POST /api/generate/kling
Body: { prompt: string, duration: 5 | 10, aspectRatio: string, apiKey: string }
Response: { videoUrl: string, taskId: string }
```

### Free Tier Logic
```typescript
{
  dailyGenerations: 3,
  usedToday: number,
  resetAt: ISO timestamp,
  hasOwnKeys: boolean
}
```

## Key Principles

- Reuse existing generator logic from CLI
- API routes keep keys server-side safe
- localStorage for wizard state + gallery persistence
- Sound off by default, respects user preference
- Mobile-responsive despite retro aesthetic
