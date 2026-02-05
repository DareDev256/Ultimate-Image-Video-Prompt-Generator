import { NextRequest, NextResponse } from 'next/server';

// Kling API configuration
// Note: Kling's API may vary - this is a general implementation
// You may need to adjust based on their actual API documentation

// Valid Kling video durations (in seconds)
const VALID_DURATIONS = [5, 10] as const;
type ValidDuration = (typeof VALID_DURATIONS)[number];

// Valid Kling aspect ratios
const VALID_ASPECT_RATIOS = ['16:9', '9:16', '1:1'] as const;
type ValidAspectRatio = (typeof VALID_ASPECT_RATIOS)[number];

function isValidDuration(duration: unknown): duration is ValidDuration {
  return typeof duration === 'number' && VALID_DURATIONS.includes(duration as ValidDuration);
}

function isValidAspectRatio(ratio: unknown): ratio is ValidAspectRatio {
  return typeof ratio === 'string' && VALID_ASPECT_RATIOS.includes(ratio as ValidAspectRatio);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, apiKey } = body;
    const duration = body.duration ?? 5;
    const aspectRatio = body.aspectRatio ?? '16:9';

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid prompt' },
        { status: 400 }
      );
    }

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid API key' },
        { status: 400 }
      );
    }

    if (!isValidDuration(duration)) {
      return NextResponse.json(
        { error: `Invalid duration. Must be one of: ${VALID_DURATIONS.join(', ')} seconds` },
        { status: 400 }
      );
    }

    if (!isValidAspectRatio(aspectRatio)) {
      return NextResponse.json(
        { error: `Invalid aspect ratio. Must be one of: ${VALID_ASPECT_RATIOS.join(', ')}` },
        { status: 400 }
      );
    }

    // Step 1: Start the generation task
    const createResponse = await fetch('https://api.klingai.com/v1/videos/text2video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'kling-v1',
        prompt,
        duration: String(duration),
        aspect_ratio: aspectRatio,
        cfg_scale: 0.5,
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.error('Kling API create error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to start generation' },
        { status: createResponse.status }
      );
    }

    const createData = await createResponse.json();
    const taskId = createData.data?.task_id;

    if (!taskId) {
      return NextResponse.json(
        { error: 'No task ID returned' },
        { status: 500 }
      );
    }

    // Step 2: Poll for completion
    const maxAttempts = 60; // 5 minutes max (5 second intervals)
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

      const statusResponse = await fetch(
        `https://api.klingai.com/v1/videos/text2video/${taskId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      if (!statusResponse.ok) {
        const error = await statusResponse.json();
        console.error('Kling API status error:', error);
        return NextResponse.json(
          { error: error.message || 'Failed to check status' },
          { status: statusResponse.status }
        );
      }

      const statusData = await statusResponse.json();
      const status = statusData.data?.task_status;

      if (status === 'succeed') {
        const videoUrl = statusData.data?.task_result?.videos?.[0]?.url;

        if (!videoUrl) {
          return NextResponse.json(
            { error: 'No video URL in response' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          videoUrl,
          taskId,
          duration: statusData.data?.task_result?.videos?.[0]?.duration,
        });
      }

      if (status === 'failed') {
        return NextResponse.json(
          { error: statusData.data?.task_status_msg || 'Generation failed' },
          { status: 500 }
        );
      }

      attempts++;
    }

    return NextResponse.json(
      { error: 'Generation timed out' },
      { status: 504 }
    );
  } catch (error) {
    console.error('Kling generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
