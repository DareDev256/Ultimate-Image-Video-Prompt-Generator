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
    vibes: ['Sebastiao Salgado', 'Mary Ellen Mark', 'documentary']
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
    vibes: ['Rene Magritte', 'Salvador Dali', 'dream logic']
  }
];

export function getTemplate(name: string): Template | undefined {
  return builtInTemplates.find(t => t.name === name);
}

export function listTemplates(): { name: string; description: string }[] {
  return builtInTemplates.map(t => ({ name: t.name, description: t.description }));
}
