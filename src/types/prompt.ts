/**
 * Camera configuration for shot framing and lens behavior.
 * Maps to the "Camera" category in the CLI wizard and web wizard step.
 *
 * @example
 * ```ts
 * const cam: Camera = { position: 'low angle', lens_mm: '35mm', aperture: 'f/1.4' };
 * ```
 */
export interface Camera {
  /** Camera position relative to subject — e.g. "eye level", "low angle", "overhead" */
  position?: string;
  /** Direction the camera faces — e.g. "facing subject", "profile shot" */
  direction?: string;
  /** Focal length — e.g. "35mm", "85mm", "200mm". Used in {@link cameraSection} output */
  lens_mm?: string;
  /** Aperture setting — e.g. "f/1.4" (shallow DOF) or "f/11" (deep focus) */
  aperture?: string;
  /** Camera angle descriptor — e.g. "dutch angle", "bird's eye" */
  angle?: string;
  /** Reference point for the angle — what the angle is measured against */
  angle_reference?: string;
  /** Emotional intent of the camera choice — e.g. "voyeuristic", "intimate", "heroic" */
  psychological_intent?: string;
  /** Physical lens traits — e.g. "vintage swirl bokeh", "anamorphic flare" */
  lens_characteristics?: string;
}

/**
 * Hair styling details for the subject.
 * Supports both the visible style and underlying structure/engineering.
 */
export interface Hair {
  /** Overall hair look — e.g. "slicked back undercut", "box braids" */
  style?: string;
  /** Structural description — e.g. "layered", "asymmetric". Skipped if identical to style */
  structure?: string;
  /** How the hair moves — e.g. "wind-swept", "static", "bouncing" */
  behavior?: string;
  /** Technical hair construction — e.g. "heat-set curls", "micro-links" */
  engineering?: string;
}

/** Facial features, makeup, and expression for the subject. */
export interface Face {
  /** Makeup description — e.g. "bold red lip, smoky eye" */
  makeup?: string;
  /** Physical facial features — e.g. "sharp jawline, high cheekbones" */
  features?: string;
  /** Facial expression — e.g. "smirking", "contemplative", "mid-laugh" */
  expression?: string;
}

/** Primary clothing/garment configuration. */
export interface Clothing {
  /** The main garment — e.g. "oversized leather jacket", "silk gown". Core of {@link clothingSection} */
  main_garment?: string;
  /** Garment structure — e.g. "tailored", "deconstructed", "boxy" */
  structure?: string;
  /** Metal/hardware details — e.g. "silver zippers", "gold clasps" */
  hardware?: string;
  /** Surface finish — e.g. "matte", "patent", "distressed" */
  finish?: string;
}

/** Accessories worn by the subject (hands, feet, jewelry). */
export interface Accessories {
  /** What's in/on the hands — e.g. "holding a cigarette", "leather gloves" */
  hands?: string;
  /** Jewelry description — e.g. "layered gold chains", "single silver ring" */
  jewelry?: string;
  /** Ankle accessories — e.g. "anklet", "ankle monitor" */
  ankles?: string;
  /** Footwear — e.g. "combat boots", "barefoot", "stilettos" */
  footwear?: string;
}

/**
 * The primary subject of the image prompt.
 * This is the most important section — almost every prompt starts here.
 *
 * Note: `action` takes precedence over `body_position` in the generator pipeline.
 * If both are set, only `action` appears in the natural language output.
 * See {@link actionSection} for the precedence logic.
 */
export interface Subject {
  /** Free-text description of the subject — the seed of the entire prompt */
  description?: string;
  hair?: Hair;
  face?: Face;
  /** Active verb/action — e.g. "leaning against a wall", "running". Takes precedence over body_position */
  action?: string;
  /** Static pose — e.g. "seated cross-legged". Only used if `action` is not set */
  body_position?: string;
  clothing?: Clothing;
  accessories?: Accessories;
  /** Movement description — e.g. "mid-stride", "frozen in motion" */
  movement?: string;
}

/**
 * Physical environment and location details.
 * Sets the scene around the subject — interiors, exteriors, and their elements.
 */
export interface Environment {
  /** Primary location — e.g. "neon-lit Tokyo alley", "abandoned warehouse". Core of {@link environmentSection} */
  location?: string;
  /** Light sources in the environment — e.g. "flickering fluorescents", "neon signs" */
  lighting_fixtures?: string;
  /** Surface materials — e.g. "wet asphalt", "marble floor", "rust-streaked walls" */
  surfaces?: string;
  /** Seating/furniture — e.g. "plastic chairs", "velvet booth" */
  seating?: string;
  /** Signs and text in scene — e.g. "Korean BBQ sign", "graffiti tags" */
  signage?: string;
  /** Window descriptions — e.g. "rain-streaked glass", "floor-to-ceiling" */
  windows?: string;
  /** Environmental condition — e.g. "after rain", "dusty", "pristine" */
  condition?: string;
}

/**
 * Background crowd or bystander elements for street/event photography prompts.
 * Uses positional descriptors to place people in the frame composition.
 */
export interface CrowdElements {
  /** General crowd description — e.g. "dense crowd of festival-goers" */
  description?: string;
  /** Element in the foreground left — e.g. "blurred figure with umbrella" */
  foreground_left?: string;
  /** Element in the foreground right */
  foreground_right?: string;
  /** Element in the lower-left corner */
  lower_left?: string;
  /** Mass of people in the foreground */
  foreground_mass?: string;
  /** What the crowd is doing — e.g. "dancing", "walking past", "watching" */
  behavior?: string;
}

/**
 * Lighting setup controlling the mood and dimensionality of the image.
 * Supports primary + secondary light sources with their visual effects.
 */
export interface Lighting {
  /** Main light source — e.g. "golden hour sun", "single overhead spotlight" */
  primary_source?: string;
  /** Visual effect of primary light — e.g. "rim lighting", "Rembrandt triangle" */
  primary_effect?: string;
  /** Fill or accent light — e.g. "blue neon bounce", "candlelight" */
  secondary_source?: string;
  /** Effect of secondary light — e.g. "cool fill on shadow side" */
  secondary_effect?: string;
  /** Ambient/environmental light — e.g. "dim ambient glow" */
  ambient?: string;
  /** Light direction relative to subject — e.g. "backlit", "side-lit", "top-down" */
  direction?: string;
  /** Overall light quality — e.g. "soft diffused", "harsh direct", "dappled" */
  quality?: string;
}

/** Atmospheric conditions and emotional tone of the scene. */
export interface Atmosphere {
  /** Physical atmospheric elements — e.g. "light fog", "dust particles", "steam" */
  elements?: string;
  /** How atmospheric elements move — e.g. "swirling", "settling", "rising" */
  behavior?: string;
  /** Air clarity — e.g. "hazy", "crystal clear", "smoky" */
  air_quality?: string;
  /** Emotional mood/tone — e.g. "melancholic", "electric", "serene" */
  mood?: string;
}

/**
 * Composition and spatial layering of the image.
 * Controls depth and framing — the photographer's eye.
 */
export interface Composition {
  /** What occupies the foreground — e.g. "blurred flowers", "subject's hand" */
  foreground?: string;
  /** Middle ground elements */
  midground?: string;
  /** Background elements — e.g. "out-of-focus city lights" */
  background?: string;
  /** Depth layer description — e.g. "shallow DOF with 3 distinct planes" */
  depth_layers?: string;
  /** Framing notes — e.g. "rule of thirds, subject left", "centered symmetry" */
  framing_notes?: string;
}

/**
 * Color grading and palette configuration.
 * Controls the post-processing color feel of the image.
 */
export interface Color {
  /** Overall color grade — e.g. "warm amber tones", "desaturated teal". Core of {@link colorSection} */
  grade?: string;
  /** Highlight color character — e.g. "blown-out warm highlights" */
  highlights?: string;
  /** Skin tone rendering — e.g. "rich warm skin tones", "porcelain" */
  skin_tone?: string;
  /** Shadow/black level — e.g. "crushed blacks", "lifted shadows" */
  blacks?: string;
  /** Explicit color palette list — e.g. ["#FF4500", "deep teal", "ivory"] */
  palette?: string[];
}

/**
 * Film stock and analog texture simulation.
 * Adds that coveted analog/vintage feel to digital prompts.
 */
export interface FilmTexture {
  /** Film grain description — e.g. "heavy Kodak Portra 400 grain", "fine grain" */
  grain?: string;
  /** Flash artifacts — e.g. "on-camera flash hotspot", "red-eye" */
  flash_artifacts?: string;
  /** Motion artifacts — e.g. "slight motion blur", "frozen action" */
  motion?: string;
  /** Lens quality simulation — e.g. "soft vintage lens", "tack sharp modern glass" */
  lens_quality?: string;
  /** Date stamp overlay — set to "none" to explicitly omit. e.g. "'98 12 25" */
  date_stamp?: string;
  /** Film/sensor format — e.g. "35mm film", "medium format", "Polaroid" */
  format?: string;
}

/** Technical output parameters for the generated image. */
export interface Technical {
  /** Image aspect ratio — e.g. "16:9", "1:1", "4:5". Core of {@link technicalSection} */
  aspect_ratio?: string;
  /** Realism guidance — e.g. "photorealistic", "hyper-detailed", "painterly" */
  realism_note?: string;
}

/**
 * Scene-level wrapper grouping the camera with global scene effects.
 * Sits one level above individual categories.
 */
export interface Scene {
  /** Global effect type — e.g. "double exposure", "long exposure", "tilt-shift" */
  effect_type?: string;
  /** Camera configuration for this scene */
  camera?: Camera;
}

/**
 * The root data structure for a complete image/video prompt.
 *
 * Every field (except `prompt_type`) is optional — users fill in only what matters.
 * This interface flows through the entire pipeline:
 *
 * 1. **CLI wizard** or **web wizard** → populates fields interactively
 * 2. **Section generators** (`sections.ts`) → extract fragments per category
 * 3. **Output generators** → assemble into natural language or JSON
 *
 * The natural language generator processes sections in the order defined by
 * {@link PROMPT_SECTIONS} in `sections.ts`. The JSON generator recursively
 * strips all undefined/null fields before serialization.
 *
 * @example
 * ```ts
 * const prompt: ImagePrompt = {
 *   prompt_type: 'generate',
 *   subject: { description: 'A woman in her 30s', action: 'walking' },
 *   environment: { location: 'rain-soaked Tokyo street at night' },
 *   lighting: { primary_source: 'neon signs', primary_effect: 'colorful rim light' },
 *   vibes: ['cyberpunk', 'film noir'],
 * };
 * ```
 */
export interface ImagePrompt {
  /** Whether this is a new generation or an edit of an existing image */
  prompt_type: 'generate' | 'edit';
  /** Scene-level camera and effect settings */
  scene?: Scene;
  /** Primary subject — person, object, or concept */
  subject?: Subject;
  /** Background crowd or bystander elements */
  crowd_elements?: CrowdElements;
  /** Physical environment and location */
  environment?: Environment;
  /** Light sources and their visual effects */
  lighting?: Lighting;
  /** Atmospheric conditions and mood */
  atmosphere?: Atmosphere;
  /** Spatial layering and framing */
  composition?: Composition;
  /** Color grading and palette */
  color?: Color;
  /** Analog film stock and texture simulation */
  film_texture?: FilmTexture;
  /** Output format and realism parameters */
  technical?: Technical;
  /** Aesthetic influences — e.g. ["cyberpunk", "Y2K", "cottagecore"] */
  vibes?: string[];
  /** Things to avoid in generation — e.g. "no text, no watermarks" */
  semantic_negatives?: string;
}

/**
 * A reusable prompt template with a name and description.
 * Extends `ImagePrompt` with all fields optional (via Partial)
 * so templates can define only the fields they care about.
 *
 * @example
 * ```ts
 * const template: Template = {
 *   name: 'Street Fashion',
 *   description: 'Urban fashion photography with moody lighting',
 *   lighting: { primary_source: 'neon signs' },
 *   vibes: ['streetwear', 'urban'],
 * };
 * ```
 */
export interface Template extends Partial<ImagePrompt> {
  /** Display name for the template — must be unique */
  name: string;
  /** Human-readable description of what this template produces */
  description: string;
}

/**
 * Category pack names — each maps to a group of related wizard categories.
 * Used by the CLI to control which prompt fields are shown to the user.
 */
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

/**
 * Preset pack names — curated bundles of category packs for common workflows.
 * - `quick`: Core only — fastest path to a prompt
 * - `standard`: Core + camera + lighting + atmosphere
 * - `full`: All categories
 * - `fashion`: Core + subject-detail + fashion + lighting + color + film
 * - `street`: Core + environment + crowd + lighting + atmosphere
 */
export type PresetPackName = 'quick' | 'standard' | 'full' | 'fashion' | 'street';
