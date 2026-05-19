import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { loadImagePrompts, loadVideoPrompts, type RawImagePrompt, type RawVideoPrompt } from '@/lib/server/prompt-data';

export const runtime = 'nodejs';
export const revalidate = 86400; // Per-prompt OG cards rarely change — cache 24h.

const SIZE = { width: 1200, height: 630 } as const;

const MODEL_COLOR_MAP: Record<string, string> = {
  'Nano Banana Pro': '#00d4ff',
  'GPT-Image-2': '#00ff88',
  'GPT-4o Image': '#00ff88',
  'GPT-Image-2 / Nano Banana 2': '#00ff88',
  Kling: '#ff00aa',
  'Kling 3.0': '#ff00aa',
  'Seedance 2.0': '#ffb300',
  'Veo 3.1': '#7c4dff',
};

function modelColor(model: string): string {
  return MODEL_COLOR_MAP[model] ?? '#00d4ff';
}

/** GET /api/og/prompt?id=123&type=image → 1200×630 PNG OG card. */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get('id') || '', 10);
  const type = (searchParams.get('type') || 'image') as 'image' | 'video';

  if (!id) {
    return fallbackCard('Ultimate Image & Video Prompt Generator', 'prompts.tdotssolutionsz.com');
  }

  let prompt: RawImagePrompt | RawVideoPrompt | undefined;
  if (type === 'video') {
    prompt = loadVideoPrompts().find((p) => p.id === id);
  } else {
    prompt = loadImagePrompts().find((p) => p.id === id);
  }

  if (!prompt) {
    return fallbackCard('Ultimate Image & Video Prompt Generator', 'prompts.tdotssolutionsz.com');
  }

  const isImage = type === 'image';
  const imagePrompt = prompt as RawImagePrompt;
  const videoPrompt = prompt as RawVideoPrompt;

  const cover = isImage
    ? imagePrompt.coverImage || imagePrompt.images?.[0] || imagePrompt.generatedImage || null
    : null;
  const model = isImage ? imagePrompt.model : 'Video';
  const accent = modelColor(model);
  const sourceName = prompt.source?.name ?? '';
  const title = prompt.title.length > 90 ? prompt.title.slice(0, 87) + '…' : prompt.title;

  const promptText = isImage
    ? imagePrompt.prompts?.[0] ?? ''
    : videoPrompt.promptEn || videoPrompt.promptZh || '';
  const promptPreview = promptText.length > 140 ? promptText.slice(0, 137) + '…' : promptText;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: '#0a0a12',
          position: 'relative',
        }}
      >
        {/* Cover image — left 55% */}
        {cover ? (
          <div
            style={{
              display: 'flex',
              width: '55%',
              height: '100%',
              backgroundImage: `url(${cover})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              width: '55%',
              height: '100%',
              background: `linear-gradient(135deg, ${accent}33 0%, #0a0a12 60%)`,
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              color: accent,
              fontFamily: 'monospace',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
            }}
          >
            {isImage ? '◇ Prompt' : '▶ Video'}
          </div>
        )}

        {/* Right pane — text */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '45%',
            height: '100%',
            padding: '48px 44px',
            background: '#0a0a12',
            color: 'white',
            position: 'relative',
            justifyContent: 'space-between',
          }}
        >
          {/* Top — model badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                display: 'flex',
                width: 12,
                height: 12,
                borderRadius: 12,
                background: accent,
                boxShadow: `0 0 16px ${accent}`,
              }}
            />
            <div
              style={{
                display: 'flex',
                fontSize: 16,
                color: accent,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
              }}
            >
              {model}
            </div>
          </div>

          {/* Middle — title + prompt preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div
              style={{
                display: 'flex',
                fontSize: title.length > 50 ? 42 : 56,
                lineHeight: 1.05,
                fontWeight: 900,
                letterSpacing: '-0.02em',
                color: '#ffffff',
                textShadow: '0 2px 24px rgba(0,0,0,0.6)',
              }}
            >
              {title}
            </div>
            {promptPreview && (
              <div
                style={{
                  display: 'flex',
                  fontSize: 18,
                  lineHeight: 1.4,
                  color: '#a0a0b0',
                }}
              >
                {promptPreview}
              </div>
            )}
          </div>

          {/* Bottom — attribution + brand */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              borderTop: '1px solid rgba(255,255,255,0.1)',
              paddingTop: 18,
            }}
          >
            {sourceName && (
              <div
                style={{
                  display: 'flex',
                  fontSize: 16,
                  color: '#a0a0b0',
                  fontFamily: 'monospace',
                }}
              >
                via {sourceName}
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 14,
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase',
                  color: '#00ff88',
                  fontFamily: 'monospace',
                }}
              >
                ULTIMATE.IPG · v2.0
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 14,
                  color: '#606070',
                  fontFamily: 'monospace',
                }}
              >
                prompts.tdotssolutionsz.com
              </div>
            </div>
          </div>
        </div>

        {/* Cyan vertical accent line at split */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            left: '55%',
            top: 0,
            bottom: 0,
            width: 2,
            background: `linear-gradient(180deg, transparent 0%, ${accent} 30%, ${accent} 70%, transparent 100%)`,
            boxShadow: `0 0 20px ${accent}`,
          }}
        />
      </div>
    ),
    SIZE
  );
}

function fallbackCard(title: string, subtitle: string) {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background:
            'radial-gradient(ellipse at 25% 30%, rgba(0,212,255,0.18) 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(255,0,170,0.18) 0%, transparent 55%), #0a0a12',
          color: '#ffffff',
          padding: 60,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 22,
            color: '#00ff88',
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            marginBottom: 28,
            fontFamily: 'monospace',
          }}
        >
          ◆ Ultimate.IPG · v2.0
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 76,
            fontWeight: 900,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 32,
            fontSize: 22,
            color: '#a0a0b0',
            fontFamily: 'monospace',
          }}
        >
          {subtitle}
        </div>
      </div>
    ),
    SIZE
  );
}
