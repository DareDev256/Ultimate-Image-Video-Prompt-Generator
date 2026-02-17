import { NextRequest, NextResponse } from 'next/server';
import { validatePrompt, validateApiKey } from '@/lib/validation';

// DALL-E 3 supported image sizes
const VALID_SIZES = ['1024x1024', '1792x1024', '1024x1792'] as const;
type ValidSize = (typeof VALID_SIZES)[number];

function isValidSize(size: unknown): size is ValidSize {
  return typeof size === 'string' && VALID_SIZES.includes(size as ValidSize);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, apiKey } = body;
    const size = body.size ?? '1024x1024';

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

    // OpenAI DALL-E 3 API
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${keyResult.key}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: promptResult.sanitized,
        n: 1,
        size,
        quality: 'hd',
        response_format: 'url',
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

    if (!data.data?.[0]?.url) {
      return NextResponse.json(
        { error: 'No image generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageUrl: data.data[0].url,
      revisedPrompt: data.data[0].revised_prompt,
    });
  } catch (error) {
    console.error('OpenAI generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
