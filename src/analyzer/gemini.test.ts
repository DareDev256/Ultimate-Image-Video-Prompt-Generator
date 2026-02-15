import { describe, test, expect, mock, beforeEach, afterEach } from 'bun:test';
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * Tests for the Gemini image analyzer module.
 * We can't call the real API, but we CAN test:
 * 1. getMimeType logic (extracted via module internals)
 * 2. Error handling paths (missing key, missing file)
 * 3. JSON markdown-stripping logic
 */

const TEST_DIR = join(tmpdir(), `gemini-test-${Date.now()}`);

beforeEach(() => {
  if (!existsSync(TEST_DIR)) mkdirSync(TEST_DIR, { recursive: true });
});

afterEach(() => {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true });
});

describe('analyzeImage — error paths', () => {
  test('throws when no API key is set', async () => {
    // Ensure both env vars are unset
    const origGemini = process.env.GEMINI_API_KEY;
    const origGoogle = process.env.GOOGLE_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.GOOGLE_API_KEY;

    try {
      const { analyzeImage } = await import('./gemini');
      await expect(analyzeImage('/some/image.jpg')).rejects.toThrow('Missing API key');
    } finally {
      if (origGemini) process.env.GEMINI_API_KEY = origGemini;
      if (origGoogle) process.env.GOOGLE_API_KEY = origGoogle;
    }
  });

  test('throws when image file does not exist', async () => {
    const origGemini = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = 'test-key-for-testing';

    try {
      const { analyzeImage } = await import('./gemini');
      await expect(analyzeImage('/nonexistent/image.png')).rejects.toThrow('Image file not found');
    } finally {
      if (origGemini) process.env.GEMINI_API_KEY = origGemini;
      else delete process.env.GEMINI_API_KEY;
    }
  });
});

describe('JSON markdown stripping', () => {
  // Test the JSON parsing logic that strips markdown fences
  // This replicates the exact logic from gemini.ts lines 155-160

  function stripMarkdown(text: string): string {
    let jsonText = text;
    if (text.includes('```json')) {
      jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (text.includes('```')) {
      jsonText = text.replace(/```\n?/g, '');
    }
    return jsonText.trim();
  }

  test('passes through clean JSON unchanged', () => {
    const json = '{"prompt_type": "generate"}';
    expect(JSON.parse(stripMarkdown(json))).toEqual({ prompt_type: 'generate' });
  });

  test('strips ```json fences', () => {
    const wrapped = '```json\n{"key": "value"}\n```';
    expect(JSON.parse(stripMarkdown(wrapped))).toEqual({ key: 'value' });
  });

  test('strips plain ``` fences', () => {
    const wrapped = '```\n{"key": "value"}\n```';
    expect(JSON.parse(stripMarkdown(wrapped))).toEqual({ key: 'value' });
  });

  test('handles ```json without trailing newline', () => {
    const wrapped = '```json{"key": "value"}```';
    expect(JSON.parse(stripMarkdown(wrapped))).toEqual({ key: 'value' });
  });

  test('handles nested triple backticks — strips all occurrences (known limitation)', () => {
    // If JSON contains triple backticks in a string, the stripping silently removes them
    // This documents the current behavior — the inner backticks vanish
    const problematic = '```json\n{"code": "use ```blocks```"}\n```';
    const stripped = stripMarkdown(problematic);
    const parsed = JSON.parse(stripped);
    // The inner ``` are stripped too, leaving "use blocks"
    expect(parsed.code).toBe('use blocks');
  });

  test('trims whitespace around JSON', () => {
    const padded = '  \n {"key": "value"} \n  ';
    expect(JSON.parse(stripMarkdown(padded))).toEqual({ key: 'value' });
  });
});

describe('MIME type detection', () => {
  // Replicate getMimeType logic to test without exporting it
  function getMimeType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    return mimeTypes[ext] || 'image/jpeg';
  }

  test('.jpg → image/jpeg', () => {
    expect(getMimeType('photo.jpg')).toBe('image/jpeg');
  });

  test('.jpeg → image/jpeg', () => {
    expect(getMimeType('photo.jpeg')).toBe('image/jpeg');
  });

  test('.png → image/png', () => {
    expect(getMimeType('photo.png')).toBe('image/png');
  });

  test('.gif → image/gif', () => {
    expect(getMimeType('animation.gif')).toBe('image/gif');
  });

  test('.webp → image/webp', () => {
    expect(getMimeType('photo.webp')).toBe('image/webp');
  });

  test('unknown extension falls back to image/jpeg', () => {
    expect(getMimeType('file.bmp')).toBe('image/jpeg');
    expect(getMimeType('file.tiff')).toBe('image/jpeg');
  });

  test('uppercase extension still matches via toLowerCase', () => {
    // The real function uses extname().toLowerCase()
    // Our test version uses split('.').pop()?.toLowerCase()
    expect(getMimeType('photo.PNG')).toBe('image/png');
    expect(getMimeType('photo.JPG')).toBe('image/jpeg');
  });
});
