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
