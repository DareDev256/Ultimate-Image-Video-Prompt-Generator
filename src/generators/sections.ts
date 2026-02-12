import type { ImagePrompt } from '../types';

/**
 * A PromptSection is a pure function that extracts and formats
 * one logical section of a prompt into natural language fragments.
 * Returns an empty array when the section has no data.
 */
export type PromptSection = (prompt: ImagePrompt) => string[];

export const subjectSection: PromptSection = (prompt) => {
  if (prompt.subject?.description) {
    return [prompt.subject.description];
  }
  return [];
};

export const hairSection: PromptSection = (prompt) => {
  const hair = prompt.subject?.hair;
  if (!hair) return [];
  const parts: string[] = [];
  if (hair.style) {
    parts.push(`with ${hair.style}`);
  }
  if (hair.structure && hair.structure !== hair.style) {
    parts.push(`(${hair.structure})`);
  }
  return parts;
};

export const clothingSection: PromptSection = (prompt) => {
  const clothing = prompt.subject?.clothing;
  if (!clothing?.main_garment) return [];
  const parts = [`wearing ${clothing.main_garment}`];
  if (clothing.hardware) {
    parts.push(`with ${clothing.hardware}`);
  }
  return parts;
};

export const actionSection: PromptSection = (prompt) => {
  if (prompt.subject?.action) {
    return [prompt.subject.action];
  }
  if (prompt.subject?.body_position) {
    return [prompt.subject.body_position];
  }
  return [];
};

export const environmentSection: PromptSection = (prompt) => {
  if (prompt.environment?.location) {
    return [`in ${prompt.environment.location}`];
  }
  return [];
};

export const accessoriesSection: PromptSection = (prompt) => {
  const acc = prompt.subject?.accessories;
  if (!acc) return [];
  const accParts: string[] = [];
  if (acc.hands) accParts.push(acc.hands);
  if (acc.jewelry) accParts.push(acc.jewelry);
  if (acc.footwear) accParts.push(acc.footwear);
  if (accParts.length > 0) {
    return [`with ${accParts.join(', ')}`];
  }
  return [];
};

export const cameraSection: PromptSection = (prompt) => {
  const cam = prompt.scene?.camera;
  if (!cam) return [];
  const camParts: string[] = [];
  if (cam.position) camParts.push(`shot from ${cam.position}`);
  if (cam.lens_mm) camParts.push(`${cam.lens_mm} lens`);
  return camParts.length > 0 ? [camParts.join(', ')] : [];
};

export const lightingSection: PromptSection = (prompt) => {
  const light = prompt.lighting;
  if (!light) return [];
  const parts: string[] = [];
  if (light.primary_source) parts.push(light.primary_source);
  if (light.primary_effect) parts.push(light.primary_effect);
  return parts;
};

export const atmosphereSection: PromptSection = (prompt) => {
  const parts: string[] = [];
  if (prompt.atmosphere?.mood) parts.push(prompt.atmosphere.mood);
  if (prompt.atmosphere?.elements) parts.push(prompt.atmosphere.elements);
  return parts;
};

export const filmTextureSection: PromptSection = (prompt) => {
  const film = prompt.film_texture;
  if (!film) return [];
  const filmParts: string[] = [];
  if (film.grain) filmParts.push(film.grain);
  if (film.lens_quality) filmParts.push(film.lens_quality);
  if (film.date_stamp && film.date_stamp !== 'none') {
    filmParts.push(`date stamp ${film.date_stamp}`);
  }
  return filmParts.length > 0 ? [filmParts.join(', ')] : [];
};

export const vibesSection: PromptSection = (prompt) => {
  if (!prompt.vibes || prompt.vibes.length === 0) return [];
  if (prompt.vibes.length === 1) {
    return [`${prompt.vibes[0]} aesthetic`];
  }
  if (prompt.vibes.length === 2) {
    return [`${prompt.vibes[0]} meets ${prompt.vibes[1]} energy`];
  }
  return [`${prompt.vibes.slice(0, -1).join(', ')} and ${prompt.vibes[prompt.vibes.length - 1]} influences`];
};

export const technicalSection: PromptSection = (prompt) => {
  if (prompt.technical?.aspect_ratio) {
    return [`${prompt.technical.aspect_ratio} aspect ratio`];
  }
  return [];
};

export const colorSection: PromptSection = (prompt) => {
  if (prompt.color?.grade) {
    return [prompt.color.grade];
  }
  return [];
};

/**
 * Ordered pipeline of all prompt sections.
 * The order here determines the output order in the natural language prompt.
 */
export const PROMPT_SECTIONS: PromptSection[] = [
  subjectSection,
  hairSection,
  clothingSection,
  actionSection,
  environmentSection,
  accessoriesSection,
  cameraSection,
  lightingSection,
  atmosphereSection,
  filmTextureSection,
  vibesSection,
  technicalSection,
  colorSection,
];
