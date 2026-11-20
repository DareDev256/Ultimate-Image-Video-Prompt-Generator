# Prompt generator on Cloudflare Workers (since 2026-11-19)

Live: https://prompts.tdotssolutionsz.com (Workers custom domain on Worker `prompt-generator`,
OpenNext) and https://prompt-generator.mini-outage-watch.workers.dev.
Moved off Vercel when the Hobby team was paused for CPU use. Deploy from web/: `npm run cf:deploy`.
Secret: GEMINI_API_KEY (`wrangler secret put`, from ~/.secrets/gemini-api-key).
DNS rollback: ~/.local/state/cf-migrate-rollback-2026-11-19/prompts.tdotssolutionsz.com.json.

No filesystem on Workers:
- Prerendered pages (home, feed, swipe, sources, blog, llms.txt, prompts meta) are served from
  the build output (open-next.config.ts: static assets incremental cache). They reflect
  public/data as of the last build, so a data refresh needs a deploy (it already did on Vercel).
- Request-time routes (/api/prompts, /api/og/prompt) read public/data through the ASSETS
  binding (src/lib/server/public-data.ts); outside Workers it falls back to the disk.

Spend (free tier on the site's Gemini key, /api/generate/nano-banana with useFreeMode):
- Shared caps in Workers KV (FREE_TIER_KV, src/lib/server/free-tier-kv.ts): 25 per client IP per
  UTC day and 100 per UTC day overall (FREE_TIER_GLOBAL_DAILY), counted across every isolate. The
  in-memory limiter in free-tier.ts still runs first. Client IP = cf-connecting-ip.
- Proven 2026-11-19 without spending: a refused request counted in KV, and with the day count
  forced to 100 the route answered 429 "used up for today" before calling Gemini.
- FREE_TIER_ENABLED=false (a Worker var) turns the free tier off without a code change.
- The other generators only run with the visitor's own key.
