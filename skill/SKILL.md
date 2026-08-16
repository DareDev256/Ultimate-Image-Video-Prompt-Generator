---
name: shot-grammar
description: Search, score and direct AI image and video prompts. Use when the user asks for an image or video prompt, wants a draft prompt improved or critiqued, asks "is this prompt any good", "why does this look AI", "make this more cinematic", wants prompts for Nano Banana Pro / GPT-Image-2 / Seedance / Veo / Kling / Wan / HunyuanVideo / LTX / Mochi, or wants to find a working reference prompt for a look. Scores a draft on six axes (subject, setting, light, camera, grade, mood) before anything is rendered, so weak prompts get fixed instead of paid for. Every corpus prompt carries its author credit.
---

# Shot Grammar

Most prompt tooling hands you text and leaves you to find out whether it was
any good by paying for a render. This one grades the prompt first, names the
axis that is weakest, and tells you what to add.

## The six axes

A prompt is scored 0–5 on each, out of 30:

| Axis | What it wants |
|------|---------------|
| **Subject** | Who or what is in frame, and what they are doing |
| **Setting** | Where this happens |
| **Light** | Source *and* quality. The single biggest knob between "looks AI" and "looks real" |
| **Camera** | Lens, angle, distance, depth of field |
| **Grade** | How colour behaves — teal-orange, bleach bypass, film stock |
| **Mood** | The feeling or the reference |

Tiers: **FLAT** (0–8) · **WORKABLE** (9–16) · **STRONG** (17–23) · **DIRECTED** (24–30).

Calibrated, not asserted: 85% of the 1,070 known-good prompts in the corpus
score workable or better (median 22/30), while junk like
`8k masterpiece highly detailed` tops out at 2.

## Score a draft

```bash
bun run skill/scripts/score.ts "your prompt here"
bun run skill/scripts/score.ts --json "your prompt here"   # machine-readable
```

Prints each axis, which terms matched, every modifier that moved the score
and why, and the single highest-leverage next addition.

Use this **before** rendering, and again after editing. If the user gives you
a prompt and asks for a render, score it first and say what you found — a
5/30 prompt is worth thirty seconds of fixing before it is worth money.

## Find a reference prompt

```bash
bun run skill/scripts/search.ts "neon portrait"
bun run skill/scripts/search.ts --video --limit 10 "drone shot"
bun run skill/scripts/search.ts --json "film grain"
```

Searches 1,427 prompts that are known to work. Title and tag matches outrank
body matches. Each result carries its shot score, so you can see at a glance
which references are actually well-built.

**Every result carries its author.** Keep the credit line when you reuse one.
These were written by named people, and two of the upstream repos carry
licence terms that require attribution to travel with the text. Stripping it
launders someone else's work.

## Writing a prompt from scratch

Work the six axes in order. Do not stop at Subject, which is where almost
every weak prompt stops.

A prompt that scores DIRECTED reads roughly like:

> A weathered fisherman mending nets on a rain-slicked harbour wall at dawn,
> backlit by low golden hour sun with a soft rim on his shoulders, shot on
> 85mm with shallow depth of field and heavy bokeh behind him, muted teal and
> orange grade on Kodak Portra film grain, quiet nostalgic documentary mood.

Every clause after the first is doing work. Note what is *not* in it.

## What not to append

`8k` · `masterpiece` · `best quality` · `highly detailed` · `award winning` ·
`trending on artstation` · `unreal engine` · `octane render` · `stunning` ·
`beautiful` · `hyperrealistic`

These read as effort and steer nothing. They have been trained through, and
they compete for attention with the tokens that actually carry the shot. The
scorer penalises them, capped, because their presence usually means the rest
of the prompt is thin — the fix is to specify an axis, not to delete a word.

A **negative prompt** is worth more than any of them and most people skip it.
The scorer rewards one.

## Choosing an engine

Nine are supported. Match the engine to the job rather than defaulting.

**Image**
- **Nano Banana Pro** (Gemini 3 Pro) — world-knowledge grounded, best-in-class
  text rendered *inside* the image, up to 4K. Free tier, 25/day, no key.
- **GPT-Image-2** — bring your own key.

**Video, proprietary**
- **Seedance 2.0** — multi-shot from one prompt, phoneme-level lip-sync
- **Veo 3.1** — native 4K@60, synced audio, best dialogue
- **Kling 3.0** — subject continuity across 3–15s, multi-character audio

**Video, open-source** — Wan, HunyuanVideo, LTX, Mochi.

Video prompts need two axes the image ones do not: **camera movement** and
**subject movement**. A static description rendered as video gives you a
still that drifts.

## Rendering

The generation routes live under `web/src/app/api/generate/<engine>/`. Start
the app with `cd web && npm run dev`, or use the hosted build at
<https://prompts.tdotssolutionsz.com>.

Do not spend a paid generation on a prompt you have not scored.

## Sources and credit

The corpus is assembled from five upstream repositories and the X creator
community, with per-prompt attribution down to individual handles — 387
distinct credited authors. Full breakdown, with live repo metadata, at
`/sources` on the site.

- **YouMind-OpenLab/awesome-nano-banana-pro-prompts** — CC BY 4.0
- **ZeroLu/awesome-gpt-image** — MIT
- **ImgEdify/Awesome-GPT4o-Image-Prompts** — MIT
- **songguoxs/gpt4o-image-prompts** and **songguoxs/awesome-video-prompts** — no
  stated licence; used with attribution pending a response from the author
- **Anil-matcha/Awesome-GPT-Image-2-API-Prompts** — no stated licence, same

Titles were translated from Chinese, patterns extracted, and preview images
generated — changes were made to the CC BY 4.0 material.
