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
