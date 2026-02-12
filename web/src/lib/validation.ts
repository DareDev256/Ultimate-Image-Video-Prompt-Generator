import { NextResponse } from 'next/server';

const MAX_PROMPT_LENGTH = 10_000;
const MAX_API_KEY_LENGTH = 256;

/** Strip control characters (except newlines/tabs) that have no business in prompts */
function stripControlChars(input: string): string {
  // Keep \n \r \t, strip everything else in C0/C1 range
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
}

export function validatePrompt(prompt: unknown): { valid: true; sanitized: string } | { valid: false; error: NextResponse } {
  if (!prompt || typeof prompt !== 'string') {
    return { valid: false, error: NextResponse.json({ error: 'Missing or invalid prompt' }, { status: 400 }) };
  }

  const trimmed = prompt.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: NextResponse.json({ error: 'Prompt cannot be empty' }, { status: 400 }) };
  }

  if (trimmed.length > MAX_PROMPT_LENGTH) {
    return { valid: false, error: NextResponse.json({ error: `Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters` }, { status: 400 }) };
  }

  return { valid: true, sanitized: stripControlChars(trimmed) };
}

export function validateApiKey(apiKey: unknown): { valid: true; key: string } | { valid: false; error: NextResponse } {
  if (!apiKey || typeof apiKey !== 'string') {
    return { valid: false, error: NextResponse.json({ error: 'Missing or invalid API key' }, { status: 400 }) };
  }

  const trimmed = apiKey.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_API_KEY_LENGTH) {
    return { valid: false, error: NextResponse.json({ error: 'Invalid API key format' }, { status: 400 }) };
  }

  // API keys should be alphanumeric with limited special chars (hyphens, underscores, dots, colons)
  if (!/^[\w\-./:=+]+$/.test(trimmed)) {
    return { valid: false, error: NextResponse.json({ error: 'Invalid API key format' }, { status: 400 }) };
  }

  return { valid: true, key: trimmed };
}
