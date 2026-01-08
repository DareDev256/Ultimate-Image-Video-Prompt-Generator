# Ultimate Image Prompt Generator - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a CLI tool that walks users through comprehensive image prompt creation, generating both JSON and natural language outputs.

**Architecture:** Bun-based TypeScript CLI using @clack/prompts for interactive input. Modular category system with packs, templates stored as JSON, favorites learned from usage. Outputs both structured JSON (Nano Banana) and flowing natural language (ChatGPT/DALL-E).

**Tech Stack:** Bun, TypeScript, @clack/prompts, picocolors, clipboardy

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `src/index.ts`

**Step 1: Initialize Bun project**

Run:
```bash
cd "/Users/t./Documents/Ultimate Image Prompt Generator"
bun init -y
```

**Step 2: Update package.json with dependencies and scripts**

Replace `package.json` with:
```json
{
  "name": "prompt-gen",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "prompt-gen": "./src/index.ts"
  },
  "scripts": {
    "dev": "bun run src/index.ts",
    "test": "bun test",
    "build": "bun build src/index.ts --outdir dist --target node"
  },
  "dependencies": {
    "@clack/prompts": "^0.7.0",
    "picocolors": "^1.0.0",
    "clipboardy": "^4.0.0"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^5.0.0"
  }
}
```

**Step 3: Install dependencies**

Run:
```bash
bun install
```

**Step 4: Create basic entry point**

Create `src/index.ts`:
```typescript
#!/usr/bin/env bun
import * as p from '@clack/prompts';
import pc from 'picocolors';

async function main() {
  p.intro(pc.bgCyan(pc.black(' Ultimate Image Prompt Generator ')));

  p.outro('Ready to build prompts!');
}

main().catch(console.error);
```

**Step 5: Test the CLI runs**

Run:
```bash
bun run dev
```
Expected: See intro and outro messages

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: initialize project with Bun and @clack/prompts"
```

---

## Task 2: Define TypeScript Types

**Files:**
- Create: `src/types/prompt.ts`
- Create: `src/types/index.ts`

**Step 1: Create prompt type definitions**

Create `src/types/prompt.ts`:
```typescript
// Camera types
export interface Camera {
  position?: string;
  direction?: string;
  lens_mm?: string;
  aperture?: string;
  angle?: string;
  angle_reference?: string;
  psychological_intent?: string;
  lens_characteristics?: string;
}

// Subject types
export interface Hair {
  style?: string;
  structure?: string;
  behavior?: string;
  engineering?: string;
}

export interface Face {
  makeup?: string;
  features?: string;
  expression?: string;
}

export interface Clothing {
  main_garment?: string;
  structure?: string;
  hardware?: string;
  finish?: string;
}

export interface Accessories {
  hands?: string;
  jewelry?: string;
  ankles?: string;
  footwear?: string;
}

export interface Subject {
  description?: string;
  hair?: Hair;
  face?: Face;
  action?: string;
  body_position?: string;
  clothing?: Clothing;
  accessories?: Accessories;
  movement?: string;
}

// Environment types
export interface Environment {
  location?: string;
  lighting_fixtures?: string;
  surfaces?: string;
  seating?: string;
  signage?: string;
  windows?: string;
  condition?: string;
}

// Crowd types
export interface CrowdElements {
  description?: string;
  foreground_left?: string;
  foreground_right?: string;
  lower_left?: string;
  foreground_mass?: string;
  behavior?: string;
}

// Lighting types
export interface Lighting {
  primary_source?: string;
  primary_effect?: string;
  secondary_source?: string;
  secondary_effect?: string;
  ambient?: string;
  direction?: string;
  quality?: string;
}

// Atmosphere types
export interface Atmosphere {
  elements?: string;
  behavior?: string;
  air_quality?: string;
  mood?: string;
}

// Composition types
export interface Composition {
  foreground?: string;
  midground?: string;
  background?: string;
  depth_layers?: string;
  framing_notes?: string;
}

// Color types
export interface Color {
  grade?: string;
  highlights?: string;
  skin_tone?: string;
  blacks?: string;
  palette?: string[];
}

// Film texture types
export interface FilmTexture {
  grain?: string;
  flash_artifacts?: string;
  motion?: string;
  lens_quality?: string;
  date_stamp?: string;
  format?: string;
}

// Technical types
export interface Technical {
  aspect_ratio?: string;
  realism_note?: string;
}

// Scene wrapper
export interface Scene {
  effect_type?: string;
  camera?: Camera;
}

// Full prompt structure
export interface ImagePrompt {
  prompt_type: 'generate' | 'edit';
  scene?: Scene;
  subject?: Subject;
  crowd_elements?: CrowdElements;
  environment?: Environment;
  lighting?: Lighting;
  atmosphere?: Atmosphere;
  composition?: Composition;
  color?: Color;
  film_texture?: FilmTexture;
  technical?: Technical;
  vibes?: string[];
  semantic_negatives?: string;
}

// Template type
export interface Template extends Partial<ImagePrompt> {
  name: string;
  description: string;
}

// Pack configuration
export type PackName =
  | 'core'
  | 'camera'
  | 'subject-detail'
  | 'fashion'
  | 'environment'
  | 'crowd'
  | 'lighting'
  | 'atmosphere'
  | 'composition'
  | 'color'
  | 'film'
  | 'technical';

export type PresetPackName = 'quick' | 'standard' | 'full' | 'fashion' | 'street';
```

**Step 2: Create index export**

Create `src/types/index.ts`:
```typescript
export * from './prompt';
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add TypeScript type definitions for prompt structure"
```

---

## Task 3: Define Categories and Fields

**Files:**
- Create: `src/core/categories.ts`

**Step 1: Create category definitions with field schemas**

Create `src/core/categories.ts`:
```typescript
export interface FieldDefinition {
  key: string;
  label: string;
  placeholder?: string;
  suggestions?: string[];
}

export interface CategoryDefinition {
  name: string;
  emoji: string;
  fields: FieldDefinition[];
  subCategories?: CategoryDefinition[];
}

// Core category (always asked)
export const coreCategory: CategoryDefinition = {
  name: 'core',
  emoji: '🎯',
  fields: [
    {
      key: 'prompt_type',
      label: 'Prompt Type',
      placeholder: 'generate',
      suggestions: ['generate', 'edit']
    },
    {
      key: 'subject.description',
      label: 'Subject Description',
      placeholder: 'A striking person in an urban environment',
      suggestions: [
        'striking Black woman, early 20s, rich dark skin with golden undertones',
        'weathered man in his 50s, salt-and-pepper beard, deep-set eyes',
        'androgynous model with sharp cheekbones and platinum buzzcut'
      ]
    }
  ]
};

// Camera category
export const cameraCategory: CategoryDefinition = {
  name: 'camera',
  emoji: '📷',
  fields: [
    {
      key: 'scene.camera.position',
      label: 'Camera Position',
      placeholder: 'eye level, centered',
      suggestions: [
        'waist height shooting upward through gap between bodies',
        'eye level, straight on',
        'overhead bird\'s eye looking down',
        'low angle from ground looking up',
        'over-the-shoulder from behind secondary subject'
      ]
    },
    {
      key: 'scene.camera.direction',
      label: 'Camera Direction',
      placeholder: 'straight on',
      suggestions: [
        'three-quarter low angle, camera tilted',
        'frontal, dead center',
        'profile, 90 degrees to subject',
        'three-quarter from left'
      ]
    },
    {
      key: 'scene.camera.lens_mm',
      label: 'Lens (mm)',
      placeholder: '50mm',
      suggestions: ['24mm wide', '35mm', '50mm standard', '85mm portrait', '135mm telephoto']
    },
    {
      key: 'scene.camera.aperture',
      label: 'Aperture',
      placeholder: 'f/2.8',
      suggestions: ['f/1.4 (very shallow)', 'f/2.8 (shallow)', 'f/4.0', 'f/8.0 (deep)', 'f/16 (everything sharp)']
    },
    {
      key: 'scene.camera.angle',
      label: 'Camera Angle Style',
      placeholder: 'natural handheld',
      suggestions: [
        'low voyeur through crowd, slight dutch tilt',
        'stable tripod, perfectly level',
        'dutch tilt 15 degrees',
        'canted angle suggesting unease'
      ]
    },
    {
      key: 'scene.camera.psychological_intent',
      label: 'Psychological Intent',
      placeholder: 'neutral observation',
      suggestions: [
        'photographer hiding in crowd, stolen image energy',
        'intimate closeness, subject trusts photographer',
        'surveillance, clinical detachment',
        'voyeuristic, forbidden capture'
      ]
    },
    {
      key: 'scene.camera.lens_characteristics',
      label: 'Lens Characteristics',
      placeholder: 'clean modern glass',
      suggestions: [
        'compact camera softness, chromatic aberration at edges',
        'vintage lens flare and warm rendering',
        'clinical sharpness, no character',
        'anamorphic horizontal flare'
      ]
    }
  ]
};

// Subject detail category
export const subjectDetailCategory: CategoryDefinition = {
  name: 'subject-detail',
  emoji: '👤',
  fields: [
    {
      key: 'subject.hair.style',
      label: 'Hair Style',
      placeholder: 'natural',
      suggestions: [
        'elaborate sculptural loc braids in gravity-defying formation',
        'slicked back, wet look',
        'wild and untamed, wind-blown',
        'shaved sides with long top'
      ]
    },
    {
      key: 'subject.hair.structure',
      label: 'Hair Structure',
      placeholder: 'loose',
      suggestions: [
        'six thick rope braids radiating outward from skull',
        'tight curls close to scalp',
        'pin-straight sheets',
        'voluminous waves'
      ]
    },
    {
      key: 'subject.face.makeup',
      label: 'Makeup',
      placeholder: 'natural',
      suggestions: [
        'glitter pigment scattered across eyelids and cheekbones',
        'bold graphic eyeliner',
        'no makeup, raw skin',
        'smudged dark eye makeup, lived-in look'
      ]
    },
    {
      key: 'subject.face.expression',
      label: 'Expression',
      placeholder: 'neutral',
      suggestions: [
        'unbothered and distant, not posing, caught mid-thought',
        'direct challenge to camera, confrontational',
        'soft smile, genuine warmth',
        'thousand-yard stare, disconnected'
      ]
    },
    {
      key: 'subject.action',
      label: 'Action',
      placeholder: 'standing',
      suggestions: [
        'standing gripping overhead rail with chrome-gloved hand',
        'walking toward camera mid-stride',
        'seated, leaning forward',
        'frozen mid-gesture'
      ]
    },
    {
      key: 'subject.body_position',
      label: 'Body Position',
      placeholder: 'standing straight',
      suggestions: [
        'standing, weight on one leg, body slightly twisted, arm raised',
        'slouched against wall',
        'powerful wide stance',
        'curled into self, protective'
      ]
    },
    {
      key: 'subject.movement',
      label: 'Movement',
      placeholder: 'still',
      suggestions: [
        'frozen by flash mid-natural-moment',
        'motion blur on limbs suggesting movement',
        'perfectly still, posed',
        'caught between movements'
      ]
    }
  ]
};

// Fashion category
export const fashionCategory: CategoryDefinition = {
  name: 'fashion',
  emoji: '👗',
  fields: [
    {
      key: 'subject.clothing.main_garment',
      label: 'Main Garment',
      placeholder: 'casual clothing',
      suggestions: [
        'high-gloss cherry red latex catsuit with front zipper',
        'oversized vintage band tee',
        'tailored black suit, impeccable fit',
        'flowing white linen, ethereal'
      ]
    },
    {
      key: 'subject.clothing.structure',
      label: 'Clothing Structure',
      placeholder: 'relaxed fit',
      suggestions: [
        'structured shoulder points extending past natural shoulder line',
        'draped and flowing, no structure',
        'skin-tight, revealing form',
        'architectural, geometric shapes'
      ]
    },
    {
      key: 'subject.clothing.hardware',
      label: 'Hardware/Details',
      placeholder: 'none',
      suggestions: [
        'chrome silver D-rings at hips, buckle straps down thighs',
        'gold zippers and buttons',
        'punk safety pins throughout',
        'minimal, no hardware'
      ]
    },
    {
      key: 'subject.clothing.finish',
      label: 'Material Finish',
      placeholder: 'matte cotton',
      suggestions: [
        'high-gloss reflective latex catching flash',
        'matte cotton, absorbs light',
        'satin sheen, subtle reflection',
        'distressed denim texture'
      ]
    },
    {
      key: 'subject.accessories.hands',
      label: 'Hand Accessories',
      placeholder: 'none',
      suggestions: [
        'chrome skeletal-finger gloves',
        'chunky silver rings on every finger',
        'black leather driving gloves',
        'bare hands, visible veins'
      ]
    },
    {
      key: 'subject.accessories.jewelry',
      label: 'Jewelry',
      placeholder: 'none',
      suggestions: [
        'chunky gold nameplate necklace, gold hoop earrings',
        'delicate silver chain, single pendant',
        'layered pearls, maximalist',
        'no jewelry, clean'
      ]
    },
    {
      key: 'subject.accessories.footwear',
      label: 'Footwear',
      placeholder: 'appropriate shoes',
      suggestions: [
        'red patent leather platform boots',
        'worn white sneakers',
        'stiletto heels, impossible height',
        'barefoot'
      ]
    }
  ]
};

// Environment category
export const environmentCategory: CategoryDefinition = {
  name: 'environment',
  emoji: '🏙️',
  fields: [
    {
      key: 'environment.location',
      label: 'Location',
      placeholder: 'urban setting',
      suggestions: [
        'grimy NYC subway car interior',
        'pristine white studio',
        'abandoned warehouse with broken windows',
        'neon-lit Tokyo alley at night'
      ]
    },
    {
      key: 'environment.surfaces',
      label: 'Surfaces',
      placeholder: 'neutral',
      suggestions: [
        'scratched plexiglass, grime on metal, fingerprints on poles',
        'seamless white paper backdrop',
        'crumbling brick and peeling paint',
        'wet asphalt reflecting lights'
      ]
    },
    {
      key: 'environment.lighting_fixtures',
      label: 'Lighting Fixtures',
      placeholder: 'natural',
      suggestions: [
        'overhead fluorescent tubes with sickly green-yellow cast',
        'professional softboxes',
        'single bare bulb swinging',
        'neon signs in multiple colors'
      ]
    },
    {
      key: 'environment.condition',
      label: 'Condition',
      placeholder: 'normal',
      suggestions: [
        'dirty, heavily used, authentic grime',
        'pristine, sterile, perfect',
        'decayed and abandoned',
        'lived-in but maintained'
      ]
    }
  ]
};

// Crowd category
export const crowdCategory: CategoryDefinition = {
  name: 'crowd',
  emoji: '👥',
  fields: [
    {
      key: 'crowd_elements.description',
      label: 'Crowd Description',
      placeholder: 'empty, no crowd',
      suggestions: [
        'anonymous commuter body fragments at frame edges, none facing camera',
        'blurred party crowd in background',
        'single other figure in distance',
        'packed bodies pressing in from all sides'
      ]
    },
    {
      key: 'crowd_elements.foreground_mass',
      label: 'Foreground Elements',
      placeholder: 'clear foreground',
      suggestions: [
        'businessman shoulder in charcoal suit creating dark shape',
        'out-of-focus hand holding phone',
        'sleeve of coat cutting into frame',
        'back of head with headphones'
      ]
    },
    {
      key: 'crowd_elements.behavior',
      label: 'Crowd Behavior',
      placeholder: 'static',
      suggestions: [
        'motion blur on background passengers, flash freezing subject sharp',
        'frozen mid-movement',
        'looking toward subject',
        'completely oblivious, in their own worlds'
      ]
    }
  ]
};

// Lighting category
export const lightingCategory: CategoryDefinition = {
  name: 'lighting',
  emoji: '💡',
  fields: [
    {
      key: 'lighting.primary_source',
      label: 'Primary Light Source',
      placeholder: 'natural light',
      suggestions: [
        'harsh built-in camera flash, direct and unmodified',
        'soft window light from left',
        'overhead sun at noon',
        'ring light creating circular catchlights'
      ]
    },
    {
      key: 'lighting.primary_effect',
      label: 'Primary Light Effect',
      placeholder: 'even illumination',
      suggestions: [
        'blown highlights on latex and chrome, hard shadows behind subject',
        'soft gradual falloff',
        'harsh contrast, deep shadows',
        'flat and even, shadowless'
      ]
    },
    {
      key: 'lighting.secondary_source',
      label: 'Secondary Light',
      placeholder: 'none',
      suggestions: [
        'overhead fluorescent tubes',
        'fill card bouncing main light',
        'practical lamps in scene',
        'neon signs providing color'
      ]
    },
    {
      key: 'lighting.ambient',
      label: 'Ambient Light',
      placeholder: 'neutral',
      suggestions: [
        'underground murk, zero natural light',
        'bright daylight fill',
        'dim, moody, barely visible',
        'golden hour warmth everywhere'
      ]
    },
    {
      key: 'lighting.direction',
      label: 'Light Direction',
      placeholder: 'frontal',
      suggestions: [
        'frontal flash from camera position',
        'side light from 90 degrees',
        'backlit, subject silhouetted',
        'overhead, dramatic shadows under features'
      ]
    },
    {
      key: 'lighting.quality',
      label: 'Light Quality',
      placeholder: 'soft',
      suggestions: [
        'harsh direct flash, unflattering but authentic',
        'beautifully soft and diffused',
        'mixed quality, hard and soft sources',
        'dappled, broken up by elements'
      ]
    }
  ]
};

// Atmosphere category
export const atmosphereCategory: CategoryDefinition = {
  name: 'atmosphere',
  emoji: '🌫️',
  fields: [
    {
      key: 'atmosphere.elements',
      label: 'Atmospheric Elements',
      placeholder: 'clear',
      suggestions: [
        'motion blur on background, condensation and body heat haze',
        'fog rolling through',
        'dust particles visible in light beams',
        'rain drops on lens'
      ]
    },
    {
      key: 'atmosphere.air_quality',
      label: 'Air Quality',
      placeholder: 'clear',
      suggestions: [
        'humid, packed, underground staleness',
        'crisp and clean',
        'smoky, hazy',
        'thick with moisture'
      ]
    },
    {
      key: 'atmosphere.mood',
      label: 'Mood',
      placeholder: 'neutral',
      suggestions: [
        'tension and urban alienation',
        'serene calm',
        'chaotic energy',
        'melancholic longing'
      ]
    }
  ]
};

// Composition category
export const compositionCategory: CategoryDefinition = {
  name: 'composition',
  emoji: '🖼️',
  fields: [
    {
      key: 'composition.foreground',
      label: 'Foreground',
      placeholder: 'clear',
      suggestions: [
        'out-of-focus commuter body parts framing shot',
        'leading lines drawing to subject',
        'nothing, clean foreground',
        'debris and texture'
      ]
    },
    {
      key: 'composition.midground',
      label: 'Midground',
      placeholder: 'subject centered',
      suggestions: [
        'subject standing sharp, frozen by flash',
        'subject off-center using rule of thirds',
        'multiple subjects at same depth',
        'subject partially obscured'
      ]
    },
    {
      key: 'composition.background',
      label: 'Background',
      placeholder: 'neutral backdrop',
      suggestions: [
        'packed subway car, passengers, scratched windows, tunnel darkness',
        'completely blown out white',
        'bokeh blur of city lights',
        'detailed environment in focus'
      ]
    },
    {
      key: 'composition.depth_layers',
      label: 'Depth Layers',
      placeholder: 'flat',
      suggestions: [
        'commuter fragments soft → subject sharp → crowd with motion drag → tunnel void',
        'single plane, everything same focus',
        'gradual blur front to back',
        'sharp throughout, deep focus'
      ]
    },
    {
      key: 'composition.framing_notes',
      label: 'Framing Notes',
      placeholder: 'standard framing',
      suggestions: [
        'shot through gap in crowd, bodies intruding from edges',
        'perfectly clean frame, nothing cut off',
        'tight crop, claustrophobic',
        'lots of negative space around subject'
      ]
    }
  ]
};

// Color category
export const colorCategory: CategoryDefinition = {
  name: 'color',
  emoji: '🎨',
  fields: [
    {
      key: 'color.grade',
      label: 'Color Grade',
      placeholder: 'natural',
      suggestions: [
        'flash-blown center with sickly green-yellow fluorescent falloff',
        'warm orange and teal blockbuster',
        'desaturated, almost monochrome',
        'vibrant and oversaturated'
      ]
    },
    {
      key: 'color.highlights',
      label: 'Highlights Treatment',
      placeholder: 'preserved',
      suggestions: [
        'nuclear white flash bounce, blown and harsh',
        'soft and preserved, no clipping',
        'warm, creamy highlights',
        'cool blue in highlights'
      ]
    },
    {
      key: 'color.skin_tone',
      label: 'Skin Tone Treatment',
      placeholder: 'natural',
      suggestions: [
        'rich deep brown with golden warmth, slight shine on forehead',
        'pale and porcelain',
        'warm and healthy',
        'stylized, non-natural'
      ]
    },
    {
      key: 'color.blacks',
      label: 'Blacks Treatment',
      placeholder: 'natural blacks',
      suggestions: [
        'crushed in shadows, lifted in lit areas revealing grime',
        'deep true blacks',
        'lifted and milky',
        'tinted with color'
      ]
    }
  ]
};

// Film texture category
export const filmCategory: CategoryDefinition = {
  name: 'film',
  emoji: '🎞️',
  fields: [
    {
      key: 'film_texture.grain',
      label: 'Film Grain',
      placeholder: 'none',
      suggestions: [
        'visible high ISO grain from low-light conditions',
        'fine grain, subtle texture',
        'heavy grain, degraded look',
        'clean digital, no grain'
      ]
    },
    {
      key: 'film_texture.flash_artifacts',
      label: 'Flash/Light Artifacts',
      placeholder: 'none',
      suggestions: [
        'hotspot in center, falloff toward edges, red-eye on background',
        'subtle lens flare',
        'no artifacts, clean',
        'heavy flare and ghosting'
      ]
    },
    {
      key: 'film_texture.lens_quality',
      label: 'Lens Quality Feel',
      placeholder: 'sharp modern',
      suggestions: [
        'point-and-shoot softness, chromatic aberration at edges',
        'tack sharp, clinical',
        'vintage soft glow',
        'intentionally degraded'
      ]
    },
    {
      key: 'film_texture.date_stamp',
      label: 'Date Stamp',
      placeholder: 'none',
      suggestions: [
        '01.06.26 burned into lower right corner in orange digital text',
        'none',
        'vintage 90s style red numbers',
        'subtle watermark'
      ]
    },
    {
      key: 'film_texture.format',
      label: 'Format Feel',
      placeholder: 'digital',
      suggestions: [
        '4:3 native compact camera ratio',
        '3:2 full frame',
        '16:9 cinematic',
        '1:1 square medium format'
      ]
    }
  ]
};

// Technical category
export const technicalCategory: CategoryDefinition = {
  name: 'technical',
  emoji: '⚙️',
  fields: [
    {
      key: 'technical.aspect_ratio',
      label: 'Aspect Ratio',
      placeholder: '16:9',
      suggestions: ['4:3 horizontal', '3:2', '16:9', '1:1 square', '9:16 vertical', '2.35:1 cinemascope']
    },
    {
      key: 'technical.realism_note',
      label: 'Realism Style',
      placeholder: 'photorealistic',
      suggestions: [
        'NOT editorial, NOT posed — candid flash capture, point-and-shoot aesthetic',
        'high fashion editorial, perfectly lit',
        'documentary authenticity',
        'hyperreal, enhanced beyond reality'
      ]
    }
  ]
};

// Vibes and negatives (always in core but special handling)
export const vibesCategory: CategoryDefinition = {
  name: 'vibes',
  emoji: '✨',
  fields: [
    {
      key: 'vibes',
      label: 'Vibes / Reference Artists',
      placeholder: 'modern photography',
      suggestions: [
        'Juergen Teller fashion-meets-mundane',
        'Bruce Davidson subway documentation',
        'Thierry Mugler on the L train',
        'Harmony Korine grime aesthetic',
        'Helmut Newton powerful women',
        'Nan Goldin intimate snapshot',
        'Terry Richardson flash aesthetic',
        'Wolfgang Tillmans casual beauty'
      ]
    },
    {
      key: 'semantic_negatives',
      label: 'Semantic Description (What This IS)',
      placeholder: 'describe the essence',
      suggestions: [
        'single striking subject in crowded subway, candid flash through crowd, no eye contact, no posing, no studio',
        'intimate portrait, direct connection, quiet moment',
        'chaotic street scene, multiple subjects, decisive moment'
      ]
    }
  ]
};

// All categories in order
export const allCategories: CategoryDefinition[] = [
  coreCategory,
  cameraCategory,
  subjectDetailCategory,
  fashionCategory,
  environmentCategory,
  crowdCategory,
  lightingCategory,
  atmosphereCategory,
  compositionCategory,
  colorCategory,
  filmCategory,
  technicalCategory,
  vibesCategory
];

// Map for lookup
export const categoryMap = new Map<string, CategoryDefinition>(
  allCategories.map(cat => [cat.name, cat])
);
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add comprehensive category definitions with field schemas"
```

---

## Task 4: Define Packs Configuration

**Files:**
- Create: `src/core/packs.ts`

**Step 1: Create pack configurations**

Create `src/core/packs.ts`:
```typescript
import type { PackName, PresetPackName } from '../types';

// Which categories are included in each pack
export const packContents: Record<PackName, string[]> = {
  'core': ['core', 'vibes'],
  'camera': ['camera'],
  'subject-detail': ['subject-detail'],
  'fashion': ['fashion'],
  'environment': ['environment'],
  'crowd': ['crowd'],
  'lighting': ['lighting'],
  'atmosphere': ['atmosphere'],
  'composition': ['composition'],
  'color': ['color'],
  'film': ['film'],
  'technical': ['technical']
};

// Preset pack combinations
export const presetPacks: Record<PresetPackName, PackName[]> = {
  'quick': ['core'],
  'standard': ['core', 'camera', 'lighting', 'atmosphere'],
  'full': ['core', 'camera', 'subject-detail', 'fashion', 'environment', 'crowd', 'lighting', 'atmosphere', 'composition', 'color', 'film', 'technical'],
  'fashion': ['core', 'camera', 'subject-detail', 'fashion', 'lighting'],
  'street': ['core', 'camera', 'environment', 'crowd', 'atmosphere', 'film']
};

// Get all category names for a preset
export function getCategoriesForPreset(preset: PresetPackName): string[] {
  const packs = presetPacks[preset];
  const categories = new Set<string>();

  for (const pack of packs) {
    for (const cat of packContents[pack]) {
      categories.add(cat);
    }
  }

  return Array.from(categories);
}

// Get categories for custom pack selection
export function getCategoriesForPacks(packs: PackName[]): string[] {
  const categories = new Set<string>();

  // Always include core
  for (const cat of packContents['core']) {
    categories.add(cat);
  }

  for (const pack of packs) {
    for (const cat of packContents[pack]) {
      categories.add(cat);
    }
  }

  return Array.from(categories);
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add pack configuration and preset combinations"
```

---

## Task 5: Create Built-in Templates

**Files:**
- Create: `src/core/templates.ts`
- Create: `templates/street-photo.json`
- Create: `templates/studio-portrait.json`
- Create: `templates/cinematic.json`
- Create: `templates/fashion-editorial.json`

**Step 1: Create template loader**

Create `src/core/templates.ts`:
```typescript
import type { Template } from '../types';

export const builtInTemplates: Template[] = [
  {
    name: 'street-photo',
    description: 'Gritty urban, flash, candid energy',
    prompt_type: 'generate',
    scene: {
      effect_type: 'candid street capture',
      camera: {
        position: 'waist height',
        lens_mm: '35mm',
        aperture: 'f/4.0',
        angle: 'slight dutch tilt from handheld',
        psychological_intent: 'stolen moment, voyeuristic',
        lens_characteristics: 'compact camera softness'
      }
    },
    subject: {
      movement: 'frozen by flash mid-moment',
      body_position: 'natural, unposed'
    },
    environment: {
      location: 'urban street or transit',
      condition: 'authentic grime and wear'
    },
    lighting: {
      primary_source: 'harsh direct flash',
      quality: 'harsh, unflattering but authentic',
      ambient: 'available light, often dim'
    },
    atmosphere: {
      mood: 'tension and urban alienation',
      air_quality: 'city air, maybe humid'
    },
    film_texture: {
      grain: 'visible high ISO grain',
      lens_quality: 'point-and-shoot softness',
      format: '4:3'
    },
    technical: {
      aspect_ratio: '4:3',
      realism_note: 'candid, not editorial, not posed'
    },
    vibes: ['Bruce Davidson', 'Juergen Teller', 'Nan Goldin']
  },
  {
    name: 'studio-portrait',
    description: 'Controlled lighting, clean, professional',
    prompt_type: 'generate',
    scene: {
      effect_type: 'controlled studio portrait',
      camera: {
        position: 'eye level, tripod',
        lens_mm: '85mm',
        aperture: 'f/2.8',
        angle: 'perfectly level',
        psychological_intent: 'intimate connection, trust',
        lens_characteristics: 'sharp portrait lens, beautiful bokeh'
      }
    },
    subject: {
      movement: 'still, posed',
      body_position: 'intentional, directed'
    },
    environment: {
      location: 'studio',
      surfaces: 'seamless backdrop',
      condition: 'pristine'
    },
    lighting: {
      primary_source: 'softbox key light',
      quality: 'soft, flattering',
      direction: 'Rembrandt or loop',
      secondary_source: 'fill card or second light'
    },
    atmosphere: {
      mood: 'calm, focused',
      air_quality: 'clean'
    },
    composition: {
      background: 'clean, out of focus or seamless',
      framing_notes: 'tight framing on face and shoulders'
    },
    color: {
      grade: 'neutral or warm',
      skin_tone: 'warm and healthy'
    },
    film_texture: {
      grain: 'minimal or none',
      lens_quality: 'tack sharp'
    },
    technical: {
      aspect_ratio: '3:2',
      realism_note: 'professional editorial quality'
    },
    vibes: ['Peter Lindbergh', 'Annie Leibovitz']
  },
  {
    name: 'cinematic',
    description: 'Wide lens, dramatic lighting, film look',
    prompt_type: 'generate',
    scene: {
      effect_type: 'cinematic still frame',
      camera: {
        position: 'dynamic, film-like',
        lens_mm: '24mm or 35mm',
        aperture: 'f/2.8',
        angle: 'motivated by narrative',
        psychological_intent: 'viewer as invisible observer',
        lens_characteristics: 'anamorphic characteristics, horizontal flare'
      }
    },
    environment: {
      lighting_fixtures: 'practical lights in scene',
      condition: 'production designed, intentional'
    },
    lighting: {
      primary_source: 'motivated by scene',
      quality: 'dramatic contrast',
      direction: 'side or back light for depth'
    },
    atmosphere: {
      elements: 'atmosphere (haze, smoke, dust) visible',
      mood: 'narrative tension'
    },
    composition: {
      depth_layers: 'distinct foreground, mid, background',
      framing_notes: 'widescreen framing'
    },
    color: {
      grade: 'teal and orange or stylized',
      blacks: 'lifted slightly, filmic'
    },
    film_texture: {
      grain: 'fine cinematic grain',
      format: '2.35:1 or 16:9'
    },
    technical: {
      aspect_ratio: '2.35:1',
      realism_note: 'cinematic, not documentary'
    },
    vibes: ['Roger Deakins', 'Emmanuel Lubezki', 'film still']
  },
  {
    name: 'fashion-editorial',
    description: 'High-gloss, detailed styling, bold',
    prompt_type: 'generate',
    scene: {
      effect_type: 'high fashion editorial',
      camera: {
        position: 'varies for impact',
        lens_mm: '50mm to 85mm',
        aperture: 'f/4 to f/8 for detail',
        psychological_intent: 'clothing and styling as hero',
        lens_characteristics: 'high-end medium format feel'
      }
    },
    subject: {
      body_position: 'dynamic, fashion pose',
      movement: 'frozen at peak of gesture'
    },
    lighting: {
      primary_source: 'large modifiers or dramatic hard light',
      quality: 'either very soft or intentionally hard',
      primary_effect: 'emphasizes texture and form'
    },
    color: {
      grade: 'bold and intentional',
      highlights: 'controlled, not blown'
    },
    film_texture: {
      grain: 'minimal, clean',
      lens_quality: 'razor sharp'
    },
    technical: {
      aspect_ratio: '3:2 or 4:5',
      realism_note: 'editorial, highly produced'
    },
    vibes: ['Steven Meisel', 'Mario Testino', 'Helmut Newton']
  },
  {
    name: 'documentary',
    description: 'Natural light, authentic, observational',
    prompt_type: 'generate',
    scene: {
      effect_type: 'documentary observation',
      camera: {
        position: 'unobtrusive observer position',
        lens_mm: '35mm or 50mm',
        aperture: 'f/2.8 to f/5.6',
        angle: 'natural, not stylized',
        psychological_intent: 'fly on wall, unnoticed',
        lens_characteristics: 'honest rendering, no tricks'
      }
    },
    subject: {
      action: 'engaged in real activity',
      movement: 'natural, unposed'
    },
    environment: {
      condition: 'as-found, not art directed'
    },
    lighting: {
      primary_source: 'available natural light',
      quality: 'as-is, not modified'
    },
    atmosphere: {
      mood: 'authenticity',
      air_quality: 'real conditions'
    },
    color: {
      grade: 'natural, minimal grading'
    },
    film_texture: {
      grain: 'appropriate to conditions',
      lens_quality: 'functional, not stylized'
    },
    technical: {
      aspect_ratio: '3:2',
      realism_note: 'documentary truth'
    },
    vibes: ['Sebastião Salgado', 'Mary Ellen Mark', 'documentary']
  },
  {
    name: 'surreal',
    description: 'Impossible elements, dreamlike',
    prompt_type: 'generate',
    scene: {
      effect_type: 'surreal dreamscape',
      camera: {
        angle: 'impossible or disorienting',
        psychological_intent: 'viewer questioning reality'
      }
    },
    environment: {
      location: 'impossible or transformed space',
      condition: 'dreamlike, non-physical rules'
    },
    lighting: {
      primary_source: 'impossible or multiple light sources',
      quality: 'otherworldly'
    },
    atmosphere: {
      elements: 'surreal elements (floating objects, impossible scale)',
      mood: 'dreamlike wonder or unease'
    },
    color: {
      grade: 'stylized, non-realistic'
    },
    technical: {
      realism_note: 'surreal, impossible, dreamlike'
    },
    vibes: ['René Magritte', 'Salvador Dalí', 'dream logic']
  }
];

export function getTemplate(name: string): Template | undefined {
  return builtInTemplates.find(t => t.name === name);
}

export function listTemplates(): { name: string; description: string }[] {
  return builtInTemplates.map(t => ({ name: t.name, description: t.description }));
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add built-in templates with comprehensive defaults"
```

---

## Task 6: Implement CLI Argument Parsing

**Files:**
- Create: `src/cli/args.ts`
- Modify: `src/index.ts`

**Step 1: Create argument parser**

Create `src/cli/args.ts`:
```typescript
import type { PackName, PresetPackName } from '../types';

export interface CliArgs {
  template?: string;
  load?: string;
  packs?: PackName[];
  preset?: PresetPackName;
  full?: boolean;
  quick?: boolean;
  help?: boolean;
  listTemplates?: boolean;
  favorites?: {
    action: 'add' | 'list' | 'remove';
    field?: string;
    value?: string;
  };
}

const presetFlags: PresetPackName[] = ['quick', 'standard', 'full', 'fashion', 'street'];

export function parseArgs(args: string[]): CliArgs {
  const result: CliArgs = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else if (arg === '--list-templates' || arg === '-l') {
      result.listTemplates = true;
    } else if (arg === '--template' || arg === '-t') {
      result.template = args[++i];
    } else if (arg === '--load') {
      result.load = args[++i];
    } else if (arg === '--pack' || arg === '-p') {
      const packArg = args[++i];
      result.packs = packArg.split(',') as PackName[];
    } else if (arg === '--full') {
      result.preset = 'full';
    } else if (arg === '--quick') {
      result.preset = 'quick';
    } else if (arg === '--standard') {
      result.preset = 'standard';
    } else if (arg === '--fashion') {
      result.preset = 'fashion';
    } else if (arg === '--street') {
      result.preset = 'street';
    } else if (arg === 'favorites') {
      const action = args[++i] as 'add' | 'list' | 'remove';
      result.favorites = { action };
      if (action === 'add' || action === 'remove') {
        result.favorites.field = args[++i];
        if (action === 'add') {
          result.favorites.value = args[++i];
        }
      }
    }
  }

  return result;
}

export function printHelp() {
  console.log(`
Ultimate Image Prompt Generator

Usage:
  prompt-gen [options]
  prompt-gen favorites <action> [field] [value]

Options:
  -t, --template <name>   Start with a built-in template
  --load <name>           Load a saved preset
  -p, --pack <packs>      Use specific packs (comma-separated)
  --quick                 Quick mode (core categories only)
  --standard              Standard mode (core + camera + lighting + atmosphere)
  --full                  Full mode (all categories)
  --fashion               Fashion-focused mode
  --street                Street photography mode
  -l, --list-templates    List available templates
  -h, --help              Show this help

Favorites Commands:
  favorites list                    List all favorites
  favorites add <field> <value>     Add a favorite value
  favorites remove <field> <value>  Remove a favorite value

Examples:
  prompt-gen --template street-photo
  prompt-gen --full
  prompt-gen --pack camera,lighting,film
  prompt-gen --load my-saved-preset
  prompt-gen favorites add camera.position "through window"
`);
}
```

**Step 2: Update index.ts to use args**

Replace `src/index.ts`:
```typescript
#!/usr/bin/env bun
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { parseArgs, printHelp } from './cli/args';
import { listTemplates } from './core/templates';

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  if (args.listTemplates) {
    console.log('\nAvailable Templates:\n');
    for (const t of listTemplates()) {
      console.log(`  ${pc.cyan(t.name.padEnd(20))} ${pc.dim(t.description)}`);
    }
    console.log('');
    return;
  }

  p.intro(pc.bgCyan(pc.black(' Ultimate Image Prompt Generator ')));

  // TODO: Implement main flow
  console.log('Args:', args);

  p.outro('Ready to build prompts!');
}

main().catch(console.error);
```

**Step 3: Test CLI arguments**

Run:
```bash
bun run dev --help
bun run dev --list-templates
```
Expected: See help text and template list

**Step 4: Commit**

```bash
git add -A
git commit -m "feat: add CLI argument parsing with help and template listing"
```

---

## Task 7: Implement Storage System

**Files:**
- Create: `src/storage/config.ts`
- Create: `src/storage/presets.ts`
- Create: `src/storage/favorites.ts`
- Create: `src/storage/index.ts`

**Step 1: Create config management**

Create `src/storage/config.ts`:
```typescript
import { homedir } from 'os';
import { join } from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

export interface Config {
  defaultPreset: string;
  lastUsedTemplate: string;
}

const CONFIG_DIR = join(homedir(), '.prompt-gen');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  const presetsDir = join(CONFIG_DIR, 'presets');
  if (!existsSync(presetsDir)) {
    mkdirSync(presetsDir, { recursive: true });
  }
}

export function loadConfig(): Config {
  ensureConfigDir();
  if (!existsSync(CONFIG_FILE)) {
    return { defaultPreset: 'standard', lastUsedTemplate: '' };
  }
  return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
}

export function saveConfig(config: Config) {
  ensureConfigDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getConfigDir() {
  return CONFIG_DIR;
}
```

**Step 2: Create presets management**

Create `src/storage/presets.ts`:
```typescript
import { join } from 'path';
import { existsSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from 'fs';
import { getConfigDir, ensureConfigDir } from './config';
import type { ImagePrompt } from '../types';

const PRESETS_DIR = join(getConfigDir(), 'presets');

export function savePreset(name: string, prompt: ImagePrompt) {
  ensureConfigDir();
  const filePath = join(PRESETS_DIR, `${name}.json`);
  writeFileSync(filePath, JSON.stringify(prompt, null, 2));
}

export function loadPreset(name: string): ImagePrompt | null {
  const filePath = join(PRESETS_DIR, `${name}.json`);
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

export function listPresets(): string[] {
  ensureConfigDir();
  if (!existsSync(PRESETS_DIR)) {
    return [];
  }
  return readdirSync(PRESETS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

export function deletePreset(name: string): boolean {
  const filePath = join(PRESETS_DIR, `${name}.json`);
  if (!existsSync(filePath)) {
    return false;
  }
  unlinkSync(filePath);
  return true;
}
```

**Step 3: Create favorites management**

Create `src/storage/favorites.ts`:
```typescript
import { join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { getConfigDir, ensureConfigDir } from './config';

const FAVORITES_FILE = join(getConfigDir(), 'favorites.json');

export type Favorites = Record<string, string[]>;

export function loadFavorites(): Favorites {
  ensureConfigDir();
  if (!existsSync(FAVORITES_FILE)) {
    return {};
  }
  return JSON.parse(readFileSync(FAVORITES_FILE, 'utf-8'));
}

export function saveFavorites(favorites: Favorites) {
  ensureConfigDir();
  writeFileSync(FAVORITES_FILE, JSON.stringify(favorites, null, 2));
}

export function addFavorite(field: string, value: string) {
  const favorites = loadFavorites();
  if (!favorites[field]) {
    favorites[field] = [];
  }
  if (!favorites[field].includes(value)) {
    favorites[field].unshift(value); // Add to front
    if (favorites[field].length > 10) {
      favorites[field] = favorites[field].slice(0, 10); // Keep max 10
    }
    saveFavorites(favorites);
  }
}

export function removeFavorite(field: string, value: string) {
  const favorites = loadFavorites();
  if (favorites[field]) {
    favorites[field] = favorites[field].filter(v => v !== value);
    saveFavorites(favorites);
  }
}

export function getFavoritesForField(field: string): string[] {
  const favorites = loadFavorites();
  return favorites[field] || [];
}
```

**Step 4: Create storage index**

Create `src/storage/index.ts`:
```typescript
export * from './config';
export * from './presets';
export * from './favorites';
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add storage system for config, presets, and favorites"
```

---

## Task 8: Implement Interactive Prompts

**Files:**
- Create: `src/cli/prompts.ts`

**Step 1: Create interactive prompt system**

Create `src/cli/prompts.ts`:
```typescript
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { allCategories, categoryMap, type CategoryDefinition, type FieldDefinition } from '../core/categories';
import { getFavoritesForField, addFavorite } from '../storage/favorites';
import type { ImagePrompt } from '../types';

// Set a nested value in an object using dot notation
function setNestedValue(obj: any, path: string, value: any) {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part]) {
      current[part] = {};
    }
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
}

// Get a nested value from an object using dot notation
function getNestedValue(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }

  return current;
}

export async function promptForField(
  field: FieldDefinition,
  currentValue?: string
): Promise<string | undefined> {
  const favorites = getFavoritesForField(field.key);
  const defaultValue = currentValue || field.placeholder || '';

  // Build hint showing favorites if any
  let hint = '';
  if (favorites.length > 0) {
    hint = pc.dim(` (type ? for favorites)`);
  }

  const result = await p.text({
    message: `${field.label}${hint}`,
    placeholder: defaultValue,
    defaultValue: defaultValue,
  });

  if (p.isCancel(result)) {
    p.cancel('Cancelled');
    process.exit(0);
  }

  // Handle ? for favorites
  if (result === '?') {
    return await showFavoritesAndSuggestions(field, currentValue);
  }

  // Handle skip
  if (result === 'skip' || result === '') {
    return currentValue || undefined;
  }

  // Auto-add frequently used values to favorites
  if (result && result !== defaultValue) {
    addFavorite(field.key, result);
  }

  return result || undefined;
}

async function showFavoritesAndSuggestions(
  field: FieldDefinition,
  currentValue?: string
): Promise<string | undefined> {
  const favorites = getFavoritesForField(field.key);
  const suggestions = field.suggestions || [];

  const options: { value: string; label: string; hint?: string }[] = [];

  // Add favorites first
  if (favorites.length > 0) {
    for (const fav of favorites) {
      options.push({
        value: fav,
        label: `★ ${fav}`,
        hint: 'favorite'
      });
    }
  }

  // Add suggestions (excluding any that are already favorites)
  for (const sug of suggestions) {
    if (!favorites.includes(sug)) {
      options.push({
        value: sug,
        label: sug
      });
    }
  }

  // Add custom option
  options.push({
    value: '__custom__',
    label: 'Enter custom value...'
  });

  const selected = await p.select({
    message: `${field.label} - Choose or enter custom:`,
    options
  });

  if (p.isCancel(selected)) {
    p.cancel('Cancelled');
    process.exit(0);
  }

  if (selected === '__custom__') {
    return await promptForField(field, currentValue);
  }

  return selected as string;
}

export async function promptForCategory(
  category: CategoryDefinition,
  currentPrompt: Partial<ImagePrompt>
): Promise<void> {
  p.log.step(pc.cyan(`${category.emoji} ${category.name.toUpperCase()}`));

  for (const field of category.fields) {
    const currentValue = getNestedValue(currentPrompt, field.key);
    const value = await promptForField(field, currentValue);

    if (value !== undefined) {
      setNestedValue(currentPrompt, field.key, value);
    }
  }
}

export async function askToRefineCategory(categoryName: string): Promise<boolean> {
  const category = categoryMap.get(categoryName);
  if (!category) return false;

  const refine = await p.confirm({
    message: `Refine ${category.name} details?`,
    initialValue: false
  });

  if (p.isCancel(refine)) {
    p.cancel('Cancelled');
    process.exit(0);
  }

  return refine;
}

export async function runPromptWalkthrough(
  categoriesToShow: string[],
  initialPrompt: Partial<ImagePrompt> = {}
): Promise<ImagePrompt> {
  const prompt: Partial<ImagePrompt> = {
    prompt_type: 'generate',
    ...initialPrompt
  };

  for (const catName of categoriesToShow) {
    const category = categoryMap.get(catName);
    if (!category) continue;

    await promptForCategory(category, prompt);
  }

  return prompt as ImagePrompt;
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: implement interactive prompt system with favorites support"
```

---

## Task 9: Implement JSON Output Generator

**Files:**
- Create: `src/generators/json.ts`

**Step 1: Create JSON output generator**

Create `src/generators/json.ts`:
```typescript
import type { ImagePrompt } from '../types';

// Remove undefined values recursively
function cleanObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return undefined;
  }

  if (Array.isArray(obj)) {
    const cleaned = obj.filter(item => item !== undefined && item !== null);
    return cleaned.length > 0 ? cleaned : undefined;
  }

  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = cleanObject(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  return obj;
}

export function generateJSON(prompt: ImagePrompt): string {
  const cleaned = cleanObject(prompt);
  return JSON.stringify(cleaned, null, 2);
}

export function generateCompactJSON(prompt: ImagePrompt): string {
  const cleaned = cleanObject(prompt);
  return JSON.stringify(cleaned);
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add JSON output generator with cleanup"
```

---

## Task 10: Implement Natural Language Generator

**Files:**
- Create: `src/generators/natural.ts`

**Step 1: Create natural language generator**

Create `src/generators/natural.ts`:
```typescript
import type { ImagePrompt } from '../types';

export function generateNaturalLanguage(prompt: ImagePrompt): string {
  const parts: string[] = [];

  // Subject description (most important, first)
  if (prompt.subject?.description) {
    parts.push(prompt.subject.description);
  }

  // Hair details
  if (prompt.subject?.hair) {
    const hair = prompt.subject.hair;
    if (hair.style) {
      parts.push(`with ${hair.style}`);
    }
    if (hair.structure && hair.structure !== hair.style) {
      parts.push(`(${hair.structure})`);
    }
  }

  // Clothing
  if (prompt.subject?.clothing?.main_garment) {
    parts.push(`wearing ${prompt.subject.clothing.main_garment}`);
    if (prompt.subject.clothing.hardware) {
      parts.push(`with ${prompt.subject.clothing.hardware}`);
    }
  }

  // Action and position
  if (prompt.subject?.action) {
    parts.push(prompt.subject.action);
  } else if (prompt.subject?.body_position) {
    parts.push(prompt.subject.body_position);
  }

  // Environment
  if (prompt.environment?.location) {
    parts.push(`in ${prompt.environment.location}`);
  }

  // Accessories
  if (prompt.subject?.accessories) {
    const acc = prompt.subject.accessories;
    const accParts: string[] = [];
    if (acc.hands) accParts.push(acc.hands);
    if (acc.jewelry) accParts.push(acc.jewelry);
    if (acc.footwear) accParts.push(acc.footwear);
    if (accParts.length > 0) {
      parts.push(`with ${accParts.join(', ')}`);
    }
  }

  // Camera details
  if (prompt.scene?.camera) {
    const cam = prompt.scene.camera;
    const camParts: string[] = [];
    if (cam.position) camParts.push(`shot from ${cam.position}`);
    if (cam.lens_mm) camParts.push(`${cam.lens_mm} lens`);
    if (camParts.length > 0) {
      parts.push(camParts.join(', '));
    }
  }

  // Lighting
  if (prompt.lighting) {
    const light = prompt.lighting;
    if (light.primary_source) {
      parts.push(light.primary_source);
    }
    if (light.primary_effect) {
      parts.push(light.primary_effect);
    }
  }

  // Atmosphere
  if (prompt.atmosphere?.mood) {
    parts.push(prompt.atmosphere.mood);
  }
  if (prompt.atmosphere?.elements) {
    parts.push(prompt.atmosphere.elements);
  }

  // Film texture
  if (prompt.film_texture) {
    const film = prompt.film_texture;
    const filmParts: string[] = [];
    if (film.grain) filmParts.push(film.grain);
    if (film.lens_quality) filmParts.push(film.lens_quality);
    if (film.date_stamp && film.date_stamp !== 'none') {
      filmParts.push(`date stamp ${film.date_stamp}`);
    }
    if (filmParts.length > 0) {
      parts.push(filmParts.join(', '));
    }
  }

  // Vibes
  if (prompt.vibes && prompt.vibes.length > 0) {
    if (prompt.vibes.length === 1) {
      parts.push(`${prompt.vibes[0]} aesthetic`);
    } else if (prompt.vibes.length === 2) {
      parts.push(`${prompt.vibes[0]} meets ${prompt.vibes[1]} energy`);
    } else {
      parts.push(`${prompt.vibes.slice(0, -1).join(', ')} and ${prompt.vibes[prompt.vibes.length - 1]} influences`);
    }
  }

  // Technical at end
  if (prompt.technical?.aspect_ratio) {
    parts.push(`${prompt.technical.aspect_ratio} aspect ratio`);
  }

  // Color grade
  if (prompt.color?.grade) {
    parts.push(prompt.color.grade);
  }

  // Join into flowing text
  let text = parts.join('. ').replace(/\.\./g, '.');

  // Capitalize first letter
  text = text.charAt(0).toUpperCase() + text.slice(1);

  // Ensure ends with period
  if (!text.endsWith('.')) {
    text += '.';
  }

  return text;
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add natural language generator"
```

---

## Task 11: Implement Display and Menu

**Files:**
- Create: `src/cli/display.ts`
- Create: `src/cli/menu.ts`

**Step 1: Create display utilities**

Create `src/cli/display.ts`:
```typescript
import pc from 'picocolors';
import type { ImagePrompt } from '../types';
import { generateJSON } from '../generators/json';
import { generateNaturalLanguage } from '../generators/natural';

const LINE = '━'.repeat(50);

export function displayOutput(prompt: ImagePrompt) {
  const json = generateJSON(prompt);
  const natural = generateNaturalLanguage(prompt);

  console.log('');
  console.log(pc.cyan(LINE));
  console.log(pc.cyan(pc.bold(' 📋 JSON OUTPUT (for Nano Banana)')));
  console.log(pc.cyan(LINE));
  console.log('');
  console.log(json);
  console.log('');
  console.log(pc.green(LINE));
  console.log(pc.green(pc.bold(' 📝 NATURAL LANGUAGE (for ChatGPT/DALL-E)')));
  console.log(pc.green(LINE));
  console.log('');
  console.log(wrapText(natural, 60));
  console.log('');
  console.log(pc.dim(LINE));
}

function wrapText(text: string, width: number): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= width) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines.join('\n');
}
```

**Step 2: Create post-generation menu**

Create `src/cli/menu.ts`:
```typescript
import * as p from '@clack/prompts';
import pc from 'picocolors';
import clipboard from 'clipboardy';
import type { ImagePrompt } from '../types';
import { generateJSON, generateCompactJSON } from '../generators/json';
import { generateNaturalLanguage } from '../generators/natural';
import { savePreset } from '../storage/presets';

export async function showPostGenerationMenu(prompt: ImagePrompt): Promise<'regenerate' | 'done'> {
  const action = await p.select({
    message: 'What would you like to do?',
    options: [
      { value: 'copy-json', label: '[c] Copy JSON', hint: 'for Nano Banana' },
      { value: 'copy-natural', label: '[n] Copy Natural Language', hint: 'for ChatGPT' },
      { value: 'copy-both', label: '[b] Copy Both' },
      { value: 'save', label: '[s] Save as Preset' },
      { value: 'regenerate', label: '[r] Regenerate', hint: 'start over' },
      { value: 'done', label: '[d] Done', hint: 'exit' }
    ]
  });

  if (p.isCancel(action)) {
    return 'done';
  }

  switch (action) {
    case 'copy-json':
      await clipboard.write(generateJSON(prompt));
      p.log.success('JSON copied to clipboard!');
      return await showPostGenerationMenu(prompt);

    case 'copy-natural':
      await clipboard.write(generateNaturalLanguage(prompt));
      p.log.success('Natural language copied to clipboard!');
      return await showPostGenerationMenu(prompt);

    case 'copy-both':
      const both = `JSON:\n${generateJSON(prompt)}\n\nNatural Language:\n${generateNaturalLanguage(prompt)}`;
      await clipboard.write(both);
      p.log.success('Both formats copied to clipboard!');
      return await showPostGenerationMenu(prompt);

    case 'save':
      const name = await p.text({
        message: 'Preset name:',
        placeholder: 'my-awesome-prompt'
      });
      if (!p.isCancel(name) && name) {
        savePreset(name, prompt);
        p.log.success(`Saved as "${name}"!`);
      }
      return await showPostGenerationMenu(prompt);

    case 'regenerate':
      return 'regenerate';

    default:
      return 'done';
  }
}
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: add display utilities and post-generation menu"
```

---

## Task 12: Wire Up Main Flow

**Files:**
- Modify: `src/index.ts`

**Step 1: Implement complete main flow**

Replace `src/index.ts`:
```typescript
#!/usr/bin/env bun
import * as p from '@clack/prompts';
import pc from 'picocolors';
import { parseArgs, printHelp } from './cli/args';
import { listTemplates, getTemplate, builtInTemplates } from './core/templates';
import { getCategoriesForPreset, getCategoriesForPacks, presetPacks } from './core/packs';
import { runPromptWalkthrough } from './cli/prompts';
import { displayOutput } from './cli/display';
import { showPostGenerationMenu } from './cli/menu';
import { loadPreset, listPresets } from './storage/presets';
import { loadFavorites, addFavorite, removeFavorite } from './storage/favorites';
import type { ImagePrompt, PresetPackName } from './types';

async function main() {
  const args = parseArgs(process.argv.slice(2));

  // Handle help
  if (args.help) {
    printHelp();
    return;
  }

  // Handle list templates
  if (args.listTemplates) {
    console.log('\nAvailable Templates:\n');
    for (const t of listTemplates()) {
      console.log(`  ${pc.cyan(t.name.padEnd(20))} ${pc.dim(t.description)}`);
    }
    console.log('');
    return;
  }

  // Handle favorites commands
  if (args.favorites) {
    const { action, field, value } = args.favorites;
    if (action === 'list') {
      const favorites = loadFavorites();
      console.log('\nYour Favorites:\n');
      for (const [f, values] of Object.entries(favorites)) {
        console.log(`  ${pc.cyan(f)}:`);
        for (const v of values) {
          console.log(`    ★ ${v}`);
        }
      }
      console.log('');
    } else if (action === 'add' && field && value) {
      addFavorite(field, value);
      console.log(pc.green(`✓ Added favorite for ${field}`));
    } else if (action === 'remove' && field && value) {
      removeFavorite(field, value);
      console.log(pc.green(`✓ Removed favorite from ${field}`));
    }
    return;
  }

  // Start main flow
  p.intro(pc.bgCyan(pc.black(' Ultimate Image Prompt Generator ')));

  let shouldContinue = true;

  while (shouldContinue) {
    // Determine initial prompt and categories
    let initialPrompt: Partial<ImagePrompt> = {};
    let categories: string[] = [];

    // Load from preset if specified
    if (args.load) {
      const loaded = loadPreset(args.load);
      if (loaded) {
        initialPrompt = loaded;
        p.log.info(`Loaded preset: ${args.load}`);
      } else {
        p.log.warn(`Preset "${args.load}" not found`);
      }
    }

    // Load template if specified
    if (args.template) {
      const template = getTemplate(args.template);
      if (template) {
        initialPrompt = { ...initialPrompt, ...template };
        p.log.info(`Using template: ${args.template}`);
      } else {
        p.log.warn(`Template "${args.template}" not found`);
      }
    }

    // If no template specified via args, ask user
    if (!args.template && !args.load) {
      const templateChoice = await p.select({
        message: 'Start with a template?',
        options: [
          { value: 'none', label: 'Blank (start from scratch)' },
          ...builtInTemplates.map(t => ({
            value: t.name,
            label: t.name,
            hint: t.description
          }))
        ]
      });

      if (p.isCancel(templateChoice)) {
        p.cancel('Cancelled');
        return;
      }

      if (templateChoice !== 'none') {
        const template = getTemplate(templateChoice as string);
        if (template) {
          initialPrompt = template;
        }
      }
    }

    // Determine categories based on args or ask user
    if (args.preset) {
      categories = getCategoriesForPreset(args.preset);
    } else if (args.packs) {
      categories = getCategoriesForPacks(args.packs);
    } else {
      // Ask user which mode
      const mode = await p.select({
        message: 'Which mode?',
        options: [
          { value: 'quick', label: 'Quick', hint: 'Core categories only' },
          { value: 'standard', label: 'Standard', hint: 'Core + Camera + Lighting + Atmosphere' },
          { value: 'full', label: 'Full', hint: 'All categories' },
          { value: 'fashion', label: 'Fashion', hint: 'Fashion-focused' },
          { value: 'street', label: 'Street', hint: 'Street photography' }
        ]
      });

      if (p.isCancel(mode)) {
        p.cancel('Cancelled');
        return;
      }

      categories = getCategoriesForPreset(mode as PresetPackName);
    }

    // Run the walkthrough
    const prompt = await runPromptWalkthrough(categories, initialPrompt);

    // Display output
    displayOutput(prompt);

    // Show menu
    const menuResult = await showPostGenerationMenu(prompt);

    if (menuResult === 'done') {
      shouldContinue = false;
    }
    // If regenerate, loop continues
  }

  p.outro(pc.green('Happy prompting! 🎨'));
}

main().catch(console.error);
```

**Step 2: Test full flow**

Run:
```bash
bun run dev
```
Expected: Full interactive walkthrough works

**Step 3: Commit**

```bash
git add -A
git commit -m "feat: wire up complete main flow with template and mode selection"
```

---

## Task 13: Add Vibes as Multi-Select

**Files:**
- Modify: `src/cli/prompts.ts`

**Step 1: Add special handling for vibes field**

In `src/cli/prompts.ts`, add this function and update `promptForCategory`:

```typescript
// Add this function before promptForCategory
async function promptForVibes(
  field: FieldDefinition,
  currentValue?: string[]
): Promise<string[] | undefined> {
  const favorites = getFavoritesForField(field.key);
  const suggestions = field.suggestions || [];

  const allOptions = [...new Set([...favorites, ...suggestions])];

  const selected = await p.multiselect({
    message: `${field.label} (select multiple with space, enter when done)`,
    options: allOptions.map(opt => ({
      value: opt,
      label: favorites.includes(opt) ? `★ ${opt}` : opt
    })),
    initialValues: currentValue || []
  });

  if (p.isCancel(selected)) {
    p.cancel('Cancelled');
    process.exit(0);
  }

  // Allow adding custom vibe
  const addCustom = await p.confirm({
    message: 'Add a custom vibe?',
    initialValue: false
  });

  if (p.isCancel(addCustom)) {
    p.cancel('Cancelled');
    process.exit(0);
  }

  let result = selected as string[];

  if (addCustom) {
    const custom = await p.text({
      message: 'Enter custom vibe:',
      placeholder: 'Artist or style reference'
    });

    if (!p.isCancel(custom) && custom) {
      result = [...result, custom];
      addFavorite(field.key, custom);
    }
  }

  return result.length > 0 ? result : undefined;
}

// Update promptForCategory to handle vibes specially
export async function promptForCategory(
  category: CategoryDefinition,
  currentPrompt: Partial<ImagePrompt>
): Promise<void> {
  p.log.step(pc.cyan(`${category.emoji} ${category.name.toUpperCase()}`));

  for (const field of category.fields) {
    const currentValue = getNestedValue(currentPrompt, field.key);

    // Special handling for vibes (array field)
    if (field.key === 'vibes') {
      const value = await promptForVibes(field, currentValue);
      if (value !== undefined) {
        setNestedValue(currentPrompt, field.key, value);
      }
    } else {
      const value = await promptForField(field, currentValue);
      if (value !== undefined) {
        setNestedValue(currentPrompt, field.key, value);
      }
    }
  }
}
```

**Step 2: Commit**

```bash
git add -A
git commit -m "feat: add multi-select for vibes with custom option"
```

---

## Task 14: Final Testing and Polish

**Files:**
- Modify: `package.json` (for global install)

**Step 1: Update package.json for global install**

Update the bin field and add shebang:
```json
{
  "name": "prompt-gen",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "prompt-gen": "./src/index.ts"
  },
  "scripts": {
    "dev": "bun run src/index.ts",
    "test": "bun test",
    "link": "bun link"
  },
  "dependencies": {
    "@clack/prompts": "^0.7.0",
    "picocolors": "^1.0.0",
    "clipboardy": "^4.0.0"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^5.0.0"
  }
}
```

**Step 2: Test global install**

Run:
```bash
bun link
prompt-gen --help
prompt-gen --list-templates
```

**Step 3: Test full workflow**

Run:
```bash
prompt-gen --template street-photo --quick
prompt-gen --full
prompt-gen favorites add camera.position "through dirty window glass"
prompt-gen favorites list
```

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: finalize CLI with global install support"
```

---

## Summary

This plan implements:

1. **Project setup** with Bun and @clack/prompts
2. **TypeScript types** for the complete prompt structure
3. **Category definitions** with all fields and suggestions
4. **Pack system** for quick/standard/full/custom modes
5. **Built-in templates** (street, studio, cinematic, fashion, documentary, surreal)
6. **Storage system** for config, presets, and favorites
7. **Interactive prompts** with favorites and suggestions
8. **JSON generator** for Nano Banana
9. **Natural language generator** for ChatGPT/DALL-E
10. **Post-generation menu** with copy/save options
11. **Multi-select vibes** with custom additions
12. **Global CLI install** via `bun link`

Total: ~14 tasks, each with multiple small steps following TDD principles.
