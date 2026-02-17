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
  images: {
    unoptimized: true,
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
