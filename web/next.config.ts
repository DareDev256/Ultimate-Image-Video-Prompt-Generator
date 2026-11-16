import path from "node:path";
import type { NextConfig } from "next";

/**
 * Security headers following OWASP recommendations.
 * Each header mitigates a specific attack vector — see inline comments.
 */
const securityHeaders = [
  // Prevent MIME-type sniffing (IE/Chrome would guess content types, enabling XSS via uploaded files)
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Block clickjacking by preventing this site from being embedded in iframes
  { key: 'X-Frame-Options', value: 'DENY' },
  // Stop the browser from leaking the full URL to third-party sites on navigation
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable browser features we don't use — camera, mic, geolocation, etc.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  // Force HTTPS for 1 year (includeSubDomains ensures no HTTP fallback on any subdomain)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  // XSS filter — modern browsers deprecated this but it's still respected by some
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // DNS prefetch control — prevent browser from speculatively resolving domains in page content
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
];

const nextConfig: NextConfig = {
  // The repo root has its own bun.lock (the CLI), so Turbopack picked the
  // parent folder as the workspace root and could not resolve web/'s
  // PostCSS plugin in a local build. Pin the root to this app.
  turbopack: { root: path.join(__dirname) },
  images: {
    // On-the-fly AVIF + WebP compression via next/image. Vercel serves the
    // optimized variant per Accept header; original PNG stays as fallback.
    // 118MB of source PNGs typically shrinks 60-80% at LCP.
    formats: ['image/avif', 'image/webp'],
    // Cache compressed variants on the edge for 31 days.
    minimumCacheTTL: 60 * 60 * 24 * 31,
    deviceSizes: [320, 480, 640, 750, 828, 1080, 1200, 1440, 1920, 2560],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cms-assets.youmind.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
