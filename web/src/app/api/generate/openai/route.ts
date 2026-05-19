import { NextRequest, NextResponse } from 'next/server';
import { validatePrompt, validateApiKey } from '@/lib/validation';

// GPT-Image-2 (OpenAI's flagship image model, launched April 2026, replaced DALL-E 3)
const VALID_SIZES = ['1024x1024', '1536x1024', '1024x1536', '2048x2048', 'auto'] as const;
const VALID_QUALITIES = ['low', 'medium', 'high', 'auto'] as const;
type ValidSize = (typeof VALID_SIZES)[number];
type ValidQuality = (typeof VALID_QUALITIES)[number];

function isValidSize(size: unknown): size is ValidSize {
  return typeof size === 'string' && VALID_SIZES.includes(size as ValidSize);
}
function isValidQuality(q: unknown): q is ValidQuality {
  return typeof q === 'string' && VALID_QUALITIES.includes(q as ValidQuality);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, apiKey } = body;
    const size = body.size ?? '1024x1024';
    const quality = body.quality ?? 'high';

    const promptResult = validatePrompt(prompt);
    if (!promptResult.valid) return promptResult.error;

    const keyResult = validateApiKey(apiKey);
    if (!keyResult.valid) return keyResult.error;

    if (!isValidSize(size)) {
      return NextResponse.json(
        { error: `Invalid size. Must be one of: ${VALID_SIZES.join(', ')}` },
        { status: 400 }
      );
    }
    if (!isValidQuality(quality)) {
      return NextResponse.json(
        { error: `Invalid quality. Must be one of: ${VALID_QUALITIES.join(', ')}` },
        { status: 400 }
      );
    }

    // GPT-Image-2 returns base64-encoded images via b64_json (URL response not supported).
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${keyResult.key}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-2',
        prompt: promptResult.sanitized,
        n: 1,
        size,
        quality,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', error);
      // Return generic message — don't leak upstream API error details to client
      const status = response.status === 401 ? 401 : response.status === 429 ? 429 : 502;
      const msg = status === 401 ? 'Invalid API key' : status === 429 ? 'Rate limit exceeded' : 'Upstream generation failed';
      return NextResponse.json({ error: msg }, { status });
    }

    const data = await response.json();
    const first = data.data?.[0];

    let imageUrl: string | null = null;
    if (first?.b64_json) {
      imageUrl = `data:image/png;base64,${first.b64_json}`;
    } else if (first?.url) {
      imageUrl = first.url;
    }

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 });
    }

    return NextResponse.json({
      imageUrl,
      revisedPrompt: first.revised_prompt,
    });
  } catch (error) {
    console.error('OpenAI generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
