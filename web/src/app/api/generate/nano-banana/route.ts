import { NextRequest, NextResponse } from 'next/server';
import { validatePrompt, validateApiKey } from '@/lib/validation';

// Simple in-memory rate limiting for server-side protection
// In production, consider using Redis or a proper rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const FREE_TIER_DAILY_LIMIT = 10;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

function getClientIdentifier(request: NextRequest): string {
  // Use a combination of IP and user agent for basic fingerprinting
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `${ip}-${userAgent.slice(0, 50)}`;
}

function checkRateLimit(clientId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(clientId);

  if (!entry || now > entry.resetTime) {
    // New entry or expired, reset count
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: FREE_TIER_DAILY_LIMIT - 1 };
  }

  if (entry.count >= FREE_TIER_DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: FREE_TIER_DAILY_LIMIT - entry.count };
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey, useFreeMode } = await request.json();

    let finalApiKey = apiKey;

    if (useFreeMode) {
      // Use server-side API key for free tier
      const serverApiKey = process.env.GEMINI_API_KEY;
      if (!serverApiKey) {
        return NextResponse.json(
          { error: 'Free tier is temporarily unavailable. Please use your own API key.' },
          { status: 503 }
        );
      }

      // Check rate limit for free tier
      const clientId = getClientIdentifier(request);
      const { allowed, remaining } = checkRateLimit(clientId);

      if (!allowed) {
        return NextResponse.json(
          {
            error: 'Daily free tier limit reached. Please try again tomorrow or use your own API key.',
            remaining: 0
          },
          { status: 429 }
        );
      }

      finalApiKey = serverApiKey;

      // Include remaining count in successful responses (will be added to response below)
      request.headers.set('x-free-tier-remaining', remaining.toString());
    }

    const promptResult = validatePrompt(prompt);
    if (!promptResult.valid) return promptResult.error;

    const keyResult = validateApiKey(finalApiKey);
    if (!keyResult.valid) return keyResult.error;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${keyResult.key}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: promptResult.sanitized,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE'],
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Nano Banana API error:', error);
      return NextResponse.json(
        { error: error.error?.message || 'Generation failed' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract image from response
    const imagePart = data.candidates?.[0]?.content?.parts?.find(
      (part: { inlineData?: { mimeType: string; data: string } }) => part.inlineData?.mimeType?.startsWith('image/')
    );

    if (!imagePart?.inlineData) {
      return NextResponse.json(
        { error: 'No image generated' },
        { status: 500 }
      );
    }

    // Convert base64 to data URL
    const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

    return NextResponse.json({
      imageUrl,
      seed: Date.now(), // Gemini doesn't provide seeds, use timestamp
    });
  } catch (error) {
    console.error('Nano Banana generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
