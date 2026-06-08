# API Reference

> Generation endpoints, CLI commands, and integration patterns for the Ultimate Image & Video Prompt Generator.

## Table of Contents

- [Web API Endpoints](#web-api-endpoints)
  - [POST /api/generate/nano-banana](#post-apigeneratenano-banana)
  - [POST /api/generate/openai](#post-apigenerateopenai)
  - [POST /api/generate/kling](#post-apigeneratekling)
  - [fal.ai video endpoints (seedance, veo, wan, hunyuan, ltx, mochi)](#falai-video-endpoints)
- [CLI Commands](#cli-commands)
- [Validation Rules](#validation-rules)
- [Error Codes](#error-codes)

---

## Web API Endpoints

All endpoints are Next.js Route Handlers under `web/src/app/api/generate/`. They accept `POST` requests with JSON bodies and return JSON responses.

### POST /api/generate/nano-banana

Generate an image using Google's Gemini image generation model. Supports a **free tier** (25 generations/day) using the server-side API key.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | `string` | ✅ | The image generation prompt (max 10,000 chars) |
| `apiKey` | `string` | ❌ | Your Gemini API key. Omit when using free mode |
| `useFreeMode` | `boolean` | ❌ | Set `true` to use the server's `GEMINI_API_KEY` (rate-limited) |

**Success Response** `200`:
```json
{
  "imageUrl": "data:image/png;base64,iVBOR...",
  "seed": 1739654400000
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `400` | Missing/invalid prompt or API key |
| `429` | Free tier daily limit (25) exhausted |
| `503` | Free tier unavailable (no server key configured) |
| `500` | No image in API response or internal error |

**Rate Limiting:** Free tier uses in-memory tracking per IP + user-agent fingerprint. Resets every 24 hours. Bring-your-own-key requests are not rate-limited.

---

### POST /api/generate/openai

Generate an image using OpenAI's GPT-Image-2 model. Always requires your own API key.

**Request Body:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `prompt` | `string` | ✅ | — | The image generation prompt (max 10,000 chars) |
| `apiKey` | `string` | ✅ | — | Your OpenAI API key |
| `size` | `string` | ❌ | `"1024x1024"` | Image dimensions |

**Valid sizes:** `1024x1024`, `1536x1024`, `1024x1536`, `2048x2048`, `auto`

**Success Response** `200`:
```json
{
  "imageUrl": "data:image/png;base64,iVBOR...",
  "revisedPrompt": "A cinematic photograph of..."
}
```

> **Note:** GPT-Image-2 returns base64-encoded images (`b64_json`), which the endpoint wraps as a `data:` URL. It may also revise your prompt for safety/quality — the `revisedPrompt` field shows what was actually used.

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `400` | Missing/invalid prompt, API key, or unsupported size |
| `500` | No image in API response or internal error |

---

### POST /api/generate/kling

Generate a video using Kling AI's text-to-video model. Uses async polling — the endpoint blocks until the video is ready (up to 5 minutes).

**Request Body:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `prompt` | `string` | ✅ | — | The video generation prompt (max 10,000 chars) |
| `apiKey` | `string` | ✅ | — | Your Kling AI API key |
| `duration` | `number` | ❌ | `5` | Video length in seconds |
| `aspectRatio` | `string` | ❌ | `"16:9"` | Output aspect ratio |

**Valid durations:** `5`, `10`
**Valid aspect ratios:** `16:9`, `9:16`, `1:1`

**Success Response** `200`:
```json
{
  "videoUrl": "https://cdn.klingai.com/...",
  "taskId": "task_abc123",
  "duration": 5
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `400` | Missing/invalid prompt, API key, duration, or aspect ratio |
| `500` | Task creation failed, no video URL, or generation failed |
| `504` | Generation timed out (exceeded 5-minute polling limit) |

**Polling Behavior:** The server polls Kling's API every 5 seconds for up to 60 attempts. The client receives a single response when complete — no streaming or progress updates at the HTTP level.

---

## fal.ai video endpoints

In addition to Kling, six more text-to-video models are exposed under `web/src/app/api/generate/`, each routed through [fal.ai](https://fal.ai). All six are **bring-your-own-key only** (no free tier), accept a `POST` with a JSON body, use async queue polling with a server-side `maxDuration` of 300s, and return a `videoUrl`. Provide your fal.ai key via `apiKey`.

| Endpoint | Model | Provider | Valid durations (s) | Valid resolutions |
|----------|-------|----------|---------------------|-------------------|
| `POST /api/generate/seedance` | Seedance 2.0 | ByteDance · via fal.ai | `5`, `10` | `720p`, `1080p` |
| `POST /api/generate/veo` | Veo 3.1 | Google DeepMind · via fal.ai | `4`, `6`, `8` | `720p`, `1080p` |
| `POST /api/generate/wan` | Wan 2.6 | Alibaba (open-source) · via fal.ai | `5` | `480p`, `720p` |
| `POST /api/generate/hunyuan` | HunyuanVideo | Tencent (open-source) · via fal.ai | `5`, `10` | `540p`, `720p` |
| `POST /api/generate/ltx` | LTX-Video 2.0 | Lightricks (open-source) · via fal.ai | model default | `720p`, `1080p` |
| `POST /api/generate/mochi` | Mochi 1 | Genmo (Apache 2.0) · via fal.ai | model default | model default |

**Request Body (common):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | `string` | ✅ | The video generation prompt (max 10,000 chars) |
| `apiKey` | `string` | ✅ | Your fal.ai API key |
| `duration` | `number` | ❌ | Video length in seconds (see valid values per model above) |
| `resolution` | `string` | ❌ | Output resolution (see valid values per model above) |
| `aspectRatio` | `string` | ❌ | Output aspect ratio (e.g. `16:9`, `9:16`, `1:1`) |

**Success Response** `200`:
```json
{
  "videoUrl": "https://fal.media/files/..."
}
```

**Error Responses:**

| Status | Condition |
|--------|-----------|
| `400` | Missing/invalid prompt, API key, duration, resolution, or aspect ratio |
| `500` | Task creation failed, no video URL, or generation failed |
| `504` | Generation timed out |

---

## CLI Commands

Run via `bun run src/index.ts` or the `prompt-gen` binary after build.

### Interactive Wizard (default)

```bash
prompt-gen                        # Launch interactive wizard
prompt-gen --quick                # Core categories only
prompt-gen --standard             # Core + camera + lighting + atmosphere
prompt-gen --full                 # All 13 categories
prompt-gen --fashion              # Fashion-focused categories
prompt-gen --street               # Street photography categories
```

### Templates & Presets

```bash
prompt-gen --template <name>      # Start from a built-in template
prompt-gen -t street-photo        # Shorthand
prompt-gen --load <name>          # Load a saved user preset
prompt-gen --list-templates       # List all available templates
prompt-gen -l                     # Shorthand
```

### Category Packs

```bash
prompt-gen --pack camera,lighting,film    # Use specific category packs
prompt-gen -p camera,lighting             # Shorthand (comma-separated)
```

### Image Analysis

```bash
prompt-gen --analyze ./photo.jpg  # Reverse-engineer a prompt from an image
prompt-gen -a ./photo.jpg         # Shorthand
```

Requires `GEMINI_API_KEY` or `GOOGLE_API_KEY` environment variable.

### Favorites

```bash
prompt-gen favorites list                        # List all saved favorites
prompt-gen favorites add camera.position "low angle"    # Save a suggestion
prompt-gen favorites remove camera.position "low angle" # Remove a favorite
```

---

## Validation Rules

All API endpoints apply these rules before forwarding to external APIs:

| Rule | Limit | Behavior |
|------|-------|----------|
| Prompt length | 10,000 chars max | Returns `400` if exceeded |
| Empty prompt | Not allowed | Returns `400` |
| Control characters | Stripped silently | C0/C1 range removed (except `\n`, `\r`, `\t`) |
| API key length | 256 chars max | Returns `400` if exceeded |
| API key format | `[\w\-./:=+]+` | Returns `400` if invalid characters detected |

---

## Error Codes

Standard error response format across all endpoints:

```json
{
  "error": "Human-readable error message"
}
```

| HTTP Status | Meaning |
|-------------|---------|
| `400` | Invalid request (bad prompt, key, or parameters) |
| `429` | Rate limit exceeded (free tier only) |
| `500` | Generation failed or internal server error |
| `503` | Service unavailable (free tier not configured) |
| `504` | Generation timed out (Kling only) |
