import { beforeEach, describe, expect, test } from 'bun:test';
import {
  FREE_TIER_DAILY_LIMIT,
  __resetFreeTierForTests,
  checkRateLimit,
  freeTierEnabled,
  getClientIdentifier,
} from './free-tier';

const req = (headers: Record<string, string>) =>
  ({ headers: new Headers(headers) }) as unknown as Parameters<typeof getClientIdentifier>[0];

describe('free tier limiter', () => {
  beforeEach(() => {
    __resetFreeTierForTests();
    delete process.env.FREE_TIER_GLOBAL_DAILY;
    delete process.env.FREE_TIER_ENABLED;
  });

  test('a new user agent does not buy a fresh allowance', () => {
    const a = getClientIdentifier(req({ 'x-forwarded-for': '1.2.3.4', 'user-agent': 'A' }));
    const b = getClientIdentifier(req({ 'x-forwarded-for': '1.2.3.4', 'user-agent': 'B' }));
    expect(a).toBe(b);
    const c = getClientIdentifier(req({ 'x-real-ip': '5.6.7.8', 'user-agent': 'A' }));
    const d = getClientIdentifier(req({ 'x-real-ip': '5.6.7.8', 'user-agent': 'B' }));
    expect(c).toBe(d);
  });

  test('x-real-ip wins over a spoofable x-forwarded-for', () => {
    expect(getClientIdentifier(req({ 'x-real-ip': '9.9.9.9', 'x-forwarded-for': '1.1.1.1' }))).toBe('9.9.9.9');
  });

  test('one visitor stops at the daily limit', () => {
    for (let i = 0; i < FREE_TIER_DAILY_LIMIT; i++) expect(checkRateLimit('ip').allowed).toBe(true);
    const r = checkRateLimit('ip');
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe('visitor');
  });

  test('the instance-wide ceiling stops many visitors', () => {
    process.env.FREE_TIER_GLOBAL_DAILY = '3';
    expect(checkRateLimit('a').allowed).toBe(true);
    expect(checkRateLimit('b').allowed).toBe(true);
    expect(checkRateLimit('c').allowed).toBe(true);
    const r = checkRateLimit('d');
    expect(r.allowed).toBe(false);
    expect(r.reason).toBe('global');
  });

  test('the window resets after a day', () => {
    process.env.FREE_TIER_GLOBAL_DAILY = '1';
    const t0 = 1_000_000;
    expect(checkRateLimit('a', t0).allowed).toBe(true);
    expect(checkRateLimit('b', t0).allowed).toBe(false);
    expect(checkRateLimit('b', t0 + 24 * 60 * 60 * 1000 + 1).allowed).toBe(true);
  });

  test('the kill switch reads FREE_TIER_ENABLED', () => {
    expect(freeTierEnabled()).toBe(true);
    process.env.FREE_TIER_ENABLED = 'false';
    expect(freeTierEnabled()).toBe(false);
  });
});

describe('getClientIdentifier on Cloudflare', () => {
  test('cf-connecting-ip wins over client-supplied x-real-ip and x-forwarded-for', () => {
    expect(getClientIdentifier(req({ 'cf-connecting-ip': '9.9.9.9', 'x-real-ip': '1.1.1.1', 'x-forwarded-for': '2.2.2.2' }))).toBe('9.9.9.9');
  });
});
