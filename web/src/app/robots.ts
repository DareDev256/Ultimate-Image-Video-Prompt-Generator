import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-config';

/**
 * AI-agent-friendly robots.txt — generated at request time so the canonical
 * URL stays in sync with `SITE_URL` (env-overridable).
 *
 * Explicit allow for major AI training bots (this is a portfolio + tool site;
 * visibility is the goal). The /api/* path is closed because routes there are
 * stateful, paginated, or write-side; the public data lives at /data and on
 * the rendered pages.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // All standard crawlers + AI training bots.
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      // Explicitly welcome the major AI agents.
      {
        userAgent: ['GPTBot', 'ClaudeBot', 'Claude-Web', 'PerplexityBot', 'Google-Extended', 'GoogleOther', 'Bytespider', 'CCBot', 'Applebot-Extended'],
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
