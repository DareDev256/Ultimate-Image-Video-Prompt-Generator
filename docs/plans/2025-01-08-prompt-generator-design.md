# Ultimate Image Prompt Generator - Design Document

**Date:** 2025-01-08
**Status:** Approved

## Overview

A CLI tool that walks users through comprehensive image prompt creation, generating both JSON (for Nano Banana) and natural language (for ChatGPT/DALL-E) outputs. Inspired by the detailed prompt structure from @jboogx_creative.

## Core User Flow

### Starting the CLI

```bash
# Quick mode with a template
prompt-gen --template street-photo

# Full guided mode (all categories)
prompt-gen --full

# Fashion-focused pack
prompt-gen --pack fashion

# Load a saved preset and modify
prompt-gen --load "subway-latex-queen"

# Mix packs
prompt-gen --pack camera,lighting,film
```

### Interaction Loop

1. **Template Selection** - First prompt asks which base template (or "blank" for scratch). Templates pre-fill sensible defaults for all fields.

2. **Category Walk-through** - CLI walks through each category in order. Each shows the current default value:
   ```
   📷 Camera Position [waist height, shooting upward]: _
   ```
   - Press **Enter** to accept default
   - Type to override
   - Type **?** to see suggestions/favorites
   - Type **skip** to leave blank

3. **Deep Dive Option** - After each major category, asks:
   ```
   Refine camera details? (lens, aperture, angle psychology) [y/N]: _
   ```

4. **Output** - Generates both JSON and natural language, displays both, asks if you want to save as preset.

## Category Structure & Packs

### All Categories

| Pack | Categories Included |
|------|---------------------|
| **core** (always on) | prompt_type, subject.description, vibes, semantic_negatives |
| **camera** | position, direction, lens_mm, aperture, angle, psychological_intent, lens_characteristics |
| **subject-detail** | hair (style, structure, behavior), face (makeup, features, expression), body_position, movement |
| **fashion** | clothing (garment, structure, hardware, finish), accessories (hands, jewelry, footwear) |
| **environment** | location, surfaces, lighting_fixtures, signage, windows, condition |
| **crowd** | crowd_elements, foreground/background figures, their behavior |
| **lighting** | primary_source, primary_effect, secondary_source, ambient, direction, quality |
| **atmosphere** | elements, behavior, air_quality, mood |
| **composition** | foreground, midground, background, depth_layers, framing_notes |
| **color** | grade, highlights, skin_tone, blacks, palette |
| **film** | grain, artifacts, motion, lens_quality, date_stamp, format |
| **technical** | aspect_ratio, realism_note |

### Preset Pack Combos

- `--quick` = core only
- `--standard` = core + camera + lighting + atmosphere
- `--full` = everything
- `--fashion` = core + camera + subject-detail + fashion + lighting
- `--street` = core + camera + environment + crowd + atmosphere + film

## Templates, Presets & Favorites

### Built-in Templates

| Template | Description |
|----------|-------------|
| street-photo | gritty, flash, urban environment, candid energy |
| studio-portrait | controlled lighting, clean background, posed |
| cinematic | wide lens, dramatic lighting, film grain |
| fashion-editorial | high-gloss, detailed clothing, strong styling |
| documentary | natural light, authentic environment, observational |
| surreal | impossible elements, dreamlike atmosphere |

Each template pre-fills ALL fields with cohesive defaults you can override.

### Saving Presets

```bash
# After generation, prompted:
💾 Save as preset? [name]: subway-fashion-queen
✓ Saved to ~/.prompt-gen/presets/subway-fashion-queen.json

# Load later:
prompt-gen --load subway-fashion-queen
prompt-gen --load subway-fashion-queen --pack lighting  # load but re-ask lighting
```

### Favorites System

When you type `?` on any field:
```
📷 Camera Position [waist height]: ?

★ Your Favorites:
  1. waist height, shooting upward
  2. eye level, straight on
  3. overhead bird's eye

📚 Suggestions:
  4. low angle from ground
  5. dutch tilt handheld
  6. over-the-shoulder
```

Favorites are learned from saved presets OR manually added:
```bash
prompt-gen favorites add camera.position "through rain-covered window"
```

### Storage Structure

```
~/.prompt-gen/
  ├── config.json          # global settings
  ├── templates/           # built-in (don't edit)
  ├── presets/            # your saved prompts
  │   └── subway-fashion-queen.json
  └── favorites.json      # your favorite values per field
```

## Output Generation

### Display Format

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 JSON OUTPUT (for Nano Banana)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "prompt_type": "generate",
  "scene": {
    "camera": {
      "position": "waist height shooting upward",
      "lens_mm": "35mm",
      ...
    }
  },
  "subject": { ... },
  ...
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 NATURAL LANGUAGE (for ChatGPT/DALL-E)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A striking Black woman in her early 20s with rich dark skin
and golden undertones, wearing a high-gloss cherry red latex
catsuit with chrome D-rings...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[c]opy JSON  [n]atural language  [b]oth  [s]ave preset  [r]egenerate
```

### Natural Language Generation Logic

- Prioritizes: subject → action → environment → camera → lighting → atmosphere → style
- Weaves fields into flowing sentences, not just comma lists
- Includes vibes as "X meets Y energy" when set
- Appends technical specs (aspect ratio, grain) at end

## Technical Architecture

### Project Structure

```
ultimate-prompt-gen/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts              # CLI entry point, arg parsing
│   ├── cli/
│   │   ├── prompts.ts        # Interactive question logic
│   │   ├── display.ts        # Formatting, colors, output
│   │   └── menu.ts           # Post-generation menu
│   ├── core/
│   │   ├── categories.ts     # Category definitions & field schemas
│   │   ├── packs.ts          # Pack configurations
│   │   └── templates.ts      # Built-in template definitions
│   ├── generators/
│   │   ├── json.ts           # JSON output builder
│   │   └── natural.ts        # Natural language composer
│   ├── storage/
│   │   ├── config.ts         # Config file management
│   │   ├── presets.ts        # Save/load presets
│   │   └── favorites.ts      # Favorites management
│   └── types/
│       └── prompt.ts         # TypeScript interfaces for all fields
├── templates/                # Built-in template JSON files
│   ├── street-photo.json
│   ├── studio-portrait.json
│   └── ...
└── README.md
```

### Dependencies

- `@clack/prompts` - Beautiful CLI prompts
- `picocolors` - Terminal colors (tiny, fast)
- `clipboardy` - Copy to clipboard
- Bun native for everything else (file system, arg parsing)

### Tech Stack

- **Runtime:** Bun
- **Language:** TypeScript
- **CLI Framework:** @clack/prompts
