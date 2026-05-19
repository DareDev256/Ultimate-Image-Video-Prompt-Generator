# Cloudflare Runbook — DNS + AutoRAG + Workers AI

What's possible to integrate with Cloudflare's Apr 2026 agent stack, ranked by
effort-to-value. Everything below assumes you have a Cloudflare account
holding the `tdotssolutionsz.com` zone (you do — Vercel reports your
nameservers as `dylan.ns.cloudflare.com` / `kelly.ns.cloudflare.com`).

---

## §1. The 30-second path: just get the domain live

If you only do one thing, do this. It unblocks the v2.0 deploy and stops
everyone seeing `web-ten-vert-46.vercel.app`.

```bash
# Create token at https://dash.cloudflare.com/profile/api-tokens
# Scope: Zone → DNS → Edit (for tdotssolutionsz.com)
export CLOUDFLARE_API_TOKEN=<your-token>

cd "/Users/t./Documents/Projects/Ultimate Image Prompt Generator"
./scripts/cloudflare-bootstrap.sh
```

That's it. The script:
1. Verifies the token
2. Finds your zone
3. Sets `A prompts.tdotssolutionsz.com → 76.76.21.21` (proxy off, so Vercel can issue TLS)
4. Asks Vercel to re-verify
5. Optionally provisions AutoRAG if the token has that scope

Vercel will flip from ✘ to ✓ within ~60s of the DNS write. After that,
`https://prompts.tdotssolutionsz.com` serves the v2.0 site.

---

## §2. The valuable add: AutoRAG hybrid search

Cloudflare's **AutoRAG** (Mar 2026) is the killer integration for this
project. Drop in the prompt corpus JSON, get hybrid semantic + keyword search
for free, replace our current substring filter with real vector matching.

### What changes

Currently `/api/prompts?search=foo` does naive `.toLowerCase().includes()` on
the title + prompt text. That's fine for exact phrase matches, useless for
intent ("portraits of women in red" won't find "cherry latex catsuit").

With AutoRAG:
- Same endpoint, same response shape
- New filter behind `?ai=1` flag → forwards to AutoRAG `search.aiSearch()`
- Hybrid: BM25 + vector run in parallel, results fused
- 1,377 prompts indexed once, re-indexed when scrape script appends

### To enable

Re-run the bootstrap script with a broader token:

```bash
export CLOUDFLARE_API_TOKEN=<token-with-AutoRAG-Edit-scope>
SKIP_AUTORAG=0 ./scripts/cloudflare-bootstrap.sh
```

Then patch `web/src/app/api/prompts/route.ts` — add an `aiSearch()` branch
behind a feature flag (~30 lines). Will write the patch when you give the
green light.

---

## §3. Free image tier via Workers AI

We currently rate-limit free Nano Banana Pro to 25/day per IP, eating your
Gemini quota. Cloudflare Workers AI offers free-tier image generation
on `@cf/black-forest-labs/flux-1-schnell` (and related Flux variants) with
generous neuron-day limits.

Trade-off: Flux Schnell is good but not Gemini 3 Pro Image. Quality drop in
exchange for:
- ✅ no quota burn on your Gemini account
- ✅ <1s edge latency from CF's global network
- ✅ scales without you paying per generation

If you want a "free tier (Cloudflare Flux)" + "premium tier (Nano Banana
Pro, requires Gemini key)" split, this is the cleanest path. Wireup is a new
route at `/api/generate/cf-flux/route.ts` plus a new model card on `/create`.

---

## §4. The full Cloudflare agent stack (forward-looking)

These are slower wins worth knowing about for v2.2+:

| Feature | What it gets us | Effort |
|---------|-----------------|--------|
| **Agents SDK** (`cloudflare/agents`) | Stateful "Prompt Coach" agent that walks users through the 13-category wizard via chat instead of forms | Medium — new route, new agent class on Durable Object |
| **AI Search primitive** | Replace `/api/prompts/meta` filter discovery with semantic similar-prompt suggestions | Low after AutoRAG is in |
| **Browser Rendering API** | Auto-screenshot every newly-added prompt for the feed cover when no image is provided | Medium |
| **Redirects for AI Training** | One-toggle bot-friendly canonical redirects | Trivial — Dashboard checkbox |
| **Web Bot Auth** | Verified-bot allowlist on `/api/prompts` to keep abusive scrapers out without blocking real AI agents | Medium |

---

## §5. AI-agent discoverability (already done)

For context — we shipped these in this session, no Cloudflare token needed:

- ✅ `web/public/llms.txt` — Markdown index of pages and key facts (per [llmstxt.org](https://llmstxt.org))
- ✅ `web/src/app/robots.ts` — explicit allow for GPTBot / ClaudeBot / PerplexityBot / Google-Extended / Bytespider / CCBot / Applebot-Extended
- ✅ `web/src/app/sitemap.ts` — auto-generated XML sitemap including all 5 blog posts
- ✅ JSON-LD on layout + blog posts (`WebSite`, `BlogPosting`, `Person`)
- ✅ Open Graph + Twitter card metadata in `layout.tsx`

All five are live in dev right now. After the domain goes live, run
[isitagentready.com](https://isitagentready.com) against
`https://prompts.tdotssolutionsz.com` for a score.

---

## §6. Token scopes cheat sheet

Tokens here: https://dash.cloudflare.com/profile/api-tokens

| Goal | Required scopes |
|------|-----------------|
| Just the DNS step | Zone → DNS → Edit (for `tdotssolutionsz.com`) |
| + AutoRAG provisioning | Above + Account → AutoRAG → Edit |
| + Workers AI inference | Above + Account → Workers AI → Read |
| Full bootstrap | Above + Account → Workers Scripts → Edit (for the future Agents SDK piece) |

The bootstrap script is graceful — if a scope is missing it skips that step
and tells you what to add. You can run it 3 times with progressively broader
tokens as you adopt features.

---

## Status as of 2026-04-30

- ✅ Vercel domain claim — done
- ✅ DNS bootstrap script — written, ready to run
- ⏳ DNS A record — pending your token paste
- ⏳ AutoRAG — opt-in after DNS works
- ⏳ Workers AI free image tier — separate decision (Flux quality trade-off)
