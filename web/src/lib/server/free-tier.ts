import type { NextRequest } from 'next/server';

// Free tier limiter. Best effort only: the Maps live in one serverless
// instance's memory, so a cold start resets them and each warm instance
// counts on its own. A shared store (KV/Upstash) is the real fix and needs
// a new service; until then three bounds hold the spend on the site's key:
//   1. FREE_TIER_ENABLED=false turns the free tier off without a deploy.
//   2. Per visitor: keyed on the client IP only. The old key added the first
//      50 characters of the user agent, so changing the UA got a fresh 25.
//   3. Per instance per day: FREE_TIER_GLOBAL_DAILY (default 100) across all
//      visitors, so one warm instance cannot drain the key.
// Gemini 3 Pro Image is billed per image on the API; the old comment here
// called it a free tier, which it is not.
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
export const FREE_TIER_DAILY_LIMIT = 25;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const globalWindow = { count: 0, resetTime: 0 };

export function freeTierEnabled(): boolean {
  return (process.env.FREE_TIER_ENABLED ?? 'true').toLowerCase() !== 'false';
}

export function globalDailyCap(): number {
  const n = Number.parseInt(process.env.FREE_TIER_GLOBAL_DAILY ?? '', 10);
  return Number.isFinite(n) && n >= 0 ? n : 100;
}

export function getClientIdentifier(request: NextRequest): string {
  // Vercel sets x-real-ip to the connecting client; x-forwarded-for's first
  // hop is the fallback for other hosts.
  const real = request.headers.get('x-real-ip')?.trim();
  if (real) return real;
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

export function checkRateLimit(
  clientId: string,
  now: number = Date.now()
): { allowed: boolean; remaining: number; reason?: 'visitor' | 'global' } {
  if (now > globalWindow.resetTime) {
    globalWindow.count = 0;
    globalWindow.resetTime = now + RATE_LIMIT_WINDOW_MS;
  }
  if (globalWindow.count >= globalDailyCap()) {
    return { allowed: false, remaining: 0, reason: 'global' };
  }

  const entry = rateLimitMap.get(clientId);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    globalWindow.count += 1;
    return { allowed: true, remaining: FREE_TIER_DAILY_LIMIT - 1 };
  }

  if (entry.count >= FREE_TIER_DAILY_LIMIT) {
    return { allowed: false, remaining: 0, reason: 'visitor' };
  }

  entry.count += 1;
  globalWindow.count += 1;
  return { allowed: true, remaining: FREE_TIER_DAILY_LIMIT - entry.count };
}

/** Test hook: clears both windows. */
export function __resetFreeTierForTests(): void {
  rateLimitMap.clear();
  globalWindow.count = 0;
  globalWindow.resetTime = 0;
}

