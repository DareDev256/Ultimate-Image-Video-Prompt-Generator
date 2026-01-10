import { NextRequest, NextResponse } from 'next/server';

// Kling API configuration
// Note: Kling's API may vary - this is a general implementation
// You may need to adjust based on their actual API documentation

export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey, duration = 5, aspectRatio = '16:9' } = await request.json();

    if (!prompt || !apiKey) {
      return NextResponse.json(
        { error: 'Missing prompt or API key' },
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
