import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security headers middleware — OWASP A05:2021 (Security Misconfiguration)
 *
 * Applies defense-in-depth HTTP headers to every response:
 * - CSP: Restricts script/style/image/connect sources
 * - X-Frame-Options: Prevents clickjacking
 * - X-Content-Type-Options: Blocks MIME sniffing
 * - Referrer-Policy: Limits referrer leakage
 * - Permissions-Policy: Disables unnecessary browser APIs
 * - Strict-Transport-Security: Forces HTTPS (respected by browsers after first visit)
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Content Security Policy — allow self, inline styles (Tailwind), and API endpoints
  const csp = [
    "default-src 'self'",
    // Next.js requires 'unsafe-inline' for styles and 'unsafe-eval' in dev; nonce-based would be ideal but needs custom server
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://raw.githubusercontent.com https://cms-assets.youmind.com",
    "connect-src 'self' https://generativelanguage.googleapis.com https://api.openai.com https://api.klingai.com",
    "media-src 'self' blob: data:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  return response;
}

export const config = {
  // Apply to all routes except static files and Next.js internals
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|wav)$).*)'],
};
