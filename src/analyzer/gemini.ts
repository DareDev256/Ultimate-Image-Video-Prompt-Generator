import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync, existsSync } from 'fs';
import { extname } from 'path';
import type { ImagePrompt } from '../types';

const ANALYSIS_PROMPT = `Analyze this image and extract detailed information to recreate it as an AI image generation prompt.

Return a JSON object with ONLY the fields that are clearly visible or can be confidently inferred. Do not guess or make up details that aren't apparent in the image.

Use this exact structure (omit any fields you can't determine):

{
  "prompt_type": "generate",
  "scene": {
    "effect_type": "describe the overall style/effect",
    "camera": {
      "position": "camera position relative to subject",
      "direction": "angle/direction camera is pointing",
      "lens_mm": "estimated focal length (e.g., '35mm', '85mm')",
      "aperture": "estimated aperture based on depth of field",
      "angle": "camera angle style",
      "psychological_intent": "what feeling does the camera position create",
      "lens_characteristics": "any visible lens qualities (softness, flare, etc.)"
    }
  },
  "subject": {
    "description": "detailed description of main subject",
    "hair": {
      "style": "hair style",
      "structure": "hair structure/texture"
    },
    "face": {
      "makeup": "visible makeup",
      "expression": "facial expression"
    },
    "action": "what subject is doing",
    "body_position": "pose/stance",
    "clothing": {
      "main_garment": "primary clothing item",
      "structure": "clothing structure/fit",
      "hardware": "visible hardware/details",
      "finish": "material finish"
    },
    "accessories": {
      "hands": "hand accessories",
      "jewelry": "visible jewelry",
      "footwear": "shoes if visible"
    },
    "movement": "sense of movement"
  },
  "environment": {
    "location": "setting/location",
    "lighting_fixtures": "visible light sources",
    "surfaces": "notable surface textures",
    "condition": "environment condition (clean, gritty, etc.)"
  },
  "crowd_elements": {
    "description": "other people in frame",
    "foreground_mass": "foreground elements",
    "behavior": "crowd behavior if applicable"
  },
  "lighting": {
    "primary_source": "main light source",
    "primary_effect": "how main light affects scene",
    "secondary_source": "fill/secondary light",
    "ambient": "ambient light quality",
    "direction": "light direction",
    "quality": "hard/soft light"
  },
  "atmosphere": {
    "elements": "atmospheric elements (fog, dust, etc.)",
    "air_quality": "air quality/haze",
    "mood": "overall mood"
  },
  "composition": {
    "foreground": "foreground elements",
    "midground": "midground/subject placement",
    "background": "background elements",
    "depth_layers": "depth layering",
    "framing_notes": "framing style"
  },
  "color": {
    "grade": "color grading style",
    "highlights": "highlight treatment",
    "skin_tone": "skin tone rendering",
    "blacks": "shadow/black treatment"
  },
  "film_texture": {
    "grain": "visible grain",
    "flash_artifacts": "flash effects if visible",
    "lens_quality": "lens quality feel",
    "date_stamp": "any date stamp visible",
    "format": "aspect ratio/format feel"
  },
  "technical": {
    "aspect_ratio": "image aspect ratio",
    "realism_note": "style (candid, editorial, etc.)"
  },
  "vibes": ["list", "of", "artist/style", "references"],
  "semantic_negatives": "what this image IS (for negative prompt guidance)"
}

Be specific and descriptive. For vibes, suggest 2-4 photographers or artistic styles that match this image's aesthetic.

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no explanation text.`;

function getMimeType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  return mimeTypes[ext] || 'image/jpeg';
}

export async function analyzeImage(imagePath: string): Promise<ImagePrompt> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error(
      'Missing API key. Set GEMINI_API_KEY or GOOGLE_API_KEY in your environment.\n' +
      'You can create one at: https://makersuite.google.com/app/apikey'
    );
  }

  if (!existsSync(imagePath)) {
    throw new Error(`Image file not found: ${imagePath}`);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  // Read and encode image
  const imageBuffer = readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const mimeType = getMimeType(imagePath);

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: base64Image,
      },
    },
    { text: ANALYSIS_PROMPT },
  ]);

  const response = result.response;
  const text = response.text();

  // Parse JSON from response (handle potential markdown wrapping)
  let jsonText = text;
  if (text.includes('```json')) {
    jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  } else if (text.includes('```')) {
    jsonText = text.replace(/```\n?/g, '');
  }

  try {
    const parsed = JSON.parse(jsonText.trim());
    return parsed as ImagePrompt;
  } catch (e) {
    throw new Error(`Failed to parse Gemini response as JSON:\n${text}`);
  }
}
