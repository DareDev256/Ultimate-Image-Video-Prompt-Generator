import { NextRequest, NextResponse } from 'next/server';
import { validatePrompt, validateApiKey } from '@/lib/validation';
import { checkRateLimit, freeTierEnabled, getClientIdentifier } from '@/lib/server/free-tier';

// Free tier limits live in lib/server/free-tier.ts (kill switch, per-IP,
// per-instance daily ceiling).
const GEMINI_MODEL_ID = 'gemini-3-pro-image-preview';

export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey, useFreeMode } = await request.json();

    let finalApiKey = apiKey;

    if (useFreeMode) {
      // Use server-side API key for free tier
      const serverApiKey = process.env.GEMINI_API_KEY;
      if (!serverApiKey || !freeTierEnabled()) {
        return NextResponse.json(
          { error: 'Free tier is temporarily unavailable. Please use your own API key.' },
          { status: 503 }
        );
      }

      // Check rate limit for free tier
      const clientId = getClientIdentifier(request);
      const { allowed, remaining, reason } = checkRateLimit(clientId);

      if (!allowed) {
        return NextResponse.json(
          {
            error:
              reason === 'global'
                ? 'The free tier is used up for today. Add your own API key to keep going.'
                : 'Daily free tier limit reached. Please try again tomorrow or use your own API key.',
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
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_ID}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': keyResult.key,
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
      const error = await response.json().catch(() => ({}));
      console.error('Nano Banana API error:', error);
      // Return generic message — don't leak upstream API error details to client
      const status = response.status === 401 ? 401 : response.status === 429 ? 429 : 502;
      const msg = status === 401 ? 'Invalid API key' : status === 429 ? 'Rate limit exceeded' : 'Upstream generation failed';
      return NextResponse.json({ error: msg }, { status });
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
