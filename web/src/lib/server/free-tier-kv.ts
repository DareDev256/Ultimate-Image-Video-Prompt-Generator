// Shared free-tier caps in Workers KV, added 2026-11-19 when the site moved from Vercel to
// Cloudflare Workers. The in-memory limiter in free-tier.ts is per isolate, and Workers spread
// requests across many isolates, so on its own it no longer bounds the site's Gemini key.
// Same limits, now shared by every isolate: FREE_TIER_DAILY_LIMIT per client IP per UTC day and
// FREE_TIER_GLOBAL_DAILY (default 100) across everyone. KV is eventually consistent, so a burst
// can overshoot by a few images; the Google Cloud budget alert and cap are the hard backstop.
// Outside Workers (bun test, next dev) there is no binding and this is a no-op.
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { FREE_TIER_DAILY_LIMIT, globalDailyCap } from './free-tier';

type KV = { get(k: string): Promise<string | null>; put(k: string, v: string, o?: { expirationTtl?: number }): Promise<void> };

function kv(): KV | null {
  try {
    const env = getCloudflareContext().env as unknown as { FREE_TIER_KV?: KV };
    return env.FREE_TIER_KV ?? null;
  } catch {
    return null;
  }
}

export async function checkSharedFreeTier(clientId: string): Promise<{ allowed: boolean; reason?: 'visitor' | 'global' }> {
  const store = kv();
  if (!store) return { allowed: true };
  const day = Math.floor(Date.now() / 86_400_000);
  const ipKey = `ip:${clientId}:${day}`;
  const dayKey = `day:${day}`;
  const [ipRaw, dayRaw] = await Promise.all([store.get(ipKey), store.get(dayKey)]);
  const ipCount = Number(ipRaw ?? 0);
  const dayCount = Number(dayRaw ?? 0);
  if (dayCount >= globalDailyCap()) return { allowed: false, reason: 'global' };
  if (ipCount >= FREE_TIER_DAILY_LIMIT) return { allowed: false, reason: 'visitor' };
  await Promise.all([
    store.put(ipKey, String(ipCount + 1), { expirationTtl: 172800 }),
    store.put(dayKey, String(dayCount + 1), { expirationTtl: 172800 }),
  ]);
  return { allowed: true };
}
