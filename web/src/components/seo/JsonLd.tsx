import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, AUTHOR } from '@/lib/site-config';

/**
 * JSON-LD structured-data blocks. Server-rendered so AI crawlers and search
 * engines see them without JS. Compact — only the schema.org fields that
 * actually drive results / agent discoverability.
 */

export function WebsiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'en',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/feed?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    author: {
      '@type': 'Person',
      name: AUTHOR.name,
      url: AUTHOR.url,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface BlogPostingJsonLdProps {
  title: string;
  description: string;
  datePublished: string;
  slug: string;
  imagePath: string;
  tags: string[];
}

export function BlogPostingJsonLd({
  title,
  description,
  datePublished,
  slug,
  imagePath,
  tags,
}: BlogPostingJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: `${SITE_URL}${imagePath}`,
    datePublished,
    dateModified: datePublished,
    author: {
      '@type': 'Person',
      name: AUTHOR.name,
      url: AUTHOR.url,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${slug}`,
    },
    keywords: tags.join(', '),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function CollectionPageJsonLd({
  name,
  description,
  url,
  itemCount,
}: {
  name: string;
  description: string;
  url: string;
  itemCount: number;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url,
    isPartOf: { '@type': 'WebSite', url: SITE_URL, name: SITE_NAME },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: itemCount,
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
