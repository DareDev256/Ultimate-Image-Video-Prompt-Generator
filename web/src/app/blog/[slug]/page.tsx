import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ArrowLeft, ArrowRight, Wand2, Copy } from 'lucide-react';
import { getPostBySlug, getAllPosts, type BlogPost } from '@/lib/blog';
import { CopyButton } from '@/components/blog/CopyButton';
import { BlogPostingJsonLd } from '@/components/seo/JsonLd';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Not found' };

  return {
    title: `${post.title} — Ultimate Image & Video Prompt Generator`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [`/showcase/${post.showcaseSlug}.png`],
      type: 'article',
    },
  };
}

interface ShowcaseBreakdown {
  [category: string]: { [field: string]: string };
}

function loadBreakdown(slug: string): ShowcaseBreakdown | null {
  try {
    const path = join(process.cwd(), 'public', 'showcase', `${slug}.json`);
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, 'utf-8')) as ShowcaseBreakdown;
  } catch {
    return null;
  }
}

function loadPromptText(slug: string): string | null {
  try {
    const path = join(process.cwd(), 'public', 'showcase', `${slug}.txt`);
    if (!existsSync(path)) return null;
    return readFileSync(path, 'utf-8');
  } catch {
    return null;
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const breakdown = loadBreakdown(post.showcaseSlug);
  const promptText = loadPromptText(post.showcaseSlug);
  const allPosts = getAllPosts();
  const idx = allPosts.findIndex((p) => p.slug === post.slug);
  const prevPost = idx > 0 ? allPosts[idx - 1] : null;
  const nextPost = idx < allPosts.length - 1 ? allPosts[idx + 1] : null;

  return (
    <main className="relative min-h-screen" style={{ background: 'var(--color-bg-deep)' }}>
      <BlogPostingJsonLd
        title={post.title}
        description={post.excerpt}
        datePublished={post.publishedAt}
        slug={post.slug}
        imagePath={`/showcase/${post.showcaseSlug}.png`}
        tags={post.tags}
      />
      {/* Top bar */}
      <div
        className="sticky top-0 z-30 border-b backdrop-blur-md"
        style={{ background: 'rgba(10,10,18,0.85)', borderColor: 'var(--color-border)' }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 md:px-8">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] opacity-80 hover:opacity-100"
            style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-display)' }}
          >
            <ArrowLeft size={14} />
            All posts
          </Link>
          <Link
            href="/feed"
            className="text-xs uppercase tracking-[0.3em] opacity-80 hover:opacity-100"
            style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}
          >
            Feed →
          </Link>
        </div>
      </div>

      <article className="mx-auto max-w-5xl px-6 py-16 md:px-8 md:py-24">
        {/* Header */}
        <header className="mb-12 md:mb-16">
          <p
            className="mb-4 text-[11px] uppercase tracking-[0.4em]"
            style={{ color: post.modelColor, fontFamily: 'var(--font-mono)' }}
          >
            ◆ {post.publishedAt} · {post.model}
          </p>
          <h1
            className="text-nebula-glow mb-4"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.25rem, 6vw, 5rem)',
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              fontWeight: 900,
              textTransform: 'uppercase',
            }}
          >
            {post.title}
          </h1>
          <p
            className="max-w-3xl text-lg md:text-xl"
            style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.45 }}
          >
            {post.subtitle}
          </p>
        </header>

        {/* Hero image */}
        <div
          className="relative mb-16 aspect-[16/10] w-full overflow-hidden rounded-lg border"
          style={{ background: 'var(--color-bg-deep)', borderColor: 'var(--color-border)' }}
        >
          <Image
            src={`/showcase/${post.showcaseSlug}.png`}
            alt={post.title}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            priority
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Why It Works callout */}
        <aside
          className="mb-12 rounded-lg border-l-4 p-6 md:p-8"
          style={{
            background: 'rgba(0, 212, 255, 0.05)',
            borderColor: post.modelColor,
            borderLeftColor: post.modelColor,
          }}
        >
          <p
            className="mb-3 text-[11px] uppercase tracking-[0.35em]"
            style={{ color: post.modelColor, fontFamily: 'var(--font-mono)' }}
          >
            ◇ Why it works
          </p>
          <p
            className="text-base md:text-lg leading-relaxed"
            style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}
          >
            {post.whyItWorks}
          </p>
        </aside>

        {/* Body paragraphs */}
        <div className="mb-16 space-y-6">
          {post.body.map((para, i) => (
            <p
              key={i}
              className="text-base md:text-lg leading-relaxed"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}
            >
              {para}
            </p>
          ))}
        </div>

        {/* Techniques */}
        <section className="mb-16">
          <h2
            className="mb-6 text-2xl md:text-3xl"
            style={{
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.01em',
              textTransform: 'uppercase',
              fontWeight: 800,
            }}
          >
            ◆ Techniques inside this prompt
          </h2>
          <ul className="space-y-3">
            {post.techniques.map((t, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-md border p-4"
                style={{
                  borderColor: 'var(--color-border)',
                  background: 'var(--color-bg-card)',
                }}
              >
                <span
                  className="text-sm font-bold"
                  style={{ color: post.modelColor, fontFamily: 'var(--font-mono)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  className="text-base leading-relaxed"
                  style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}
                >
                  {t}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* 13-cat breakdown */}
        {breakdown && (
          <section className="mb-16">
            <h2
              className="mb-6 text-2xl md:text-3xl"
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.01em',
                textTransform: 'uppercase',
                fontWeight: 800,
              }}
            >
              ◆ Full category breakdown
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(breakdown).map(([category, fields]) => (
                <div
                  key={category}
                  className="rounded-md border p-4"
                  style={{
                    background: 'var(--color-bg-card)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <p
                    className="mb-2 text-[10px] uppercase tracking-[0.35em]"
                    style={{ color: post.modelColor, fontFamily: 'var(--font-mono)' }}
                  >
                    {category}
                  </p>
                  <dl className="space-y-2">
                    {Object.entries(fields).map(([key, value]) => (
                      <div key={key}>
                        <dt
                          className="text-[11px] uppercase tracking-wider"
                          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                        >
                          {key}
                        </dt>
                        <dd
                          className="text-sm"
                          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}
                        >
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Prompt block + CTAs */}
        {promptText && (
          <section className="mb-16">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2
                className="text-2xl md:text-3xl"
                style={{
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.01em',
                  textTransform: 'uppercase',
                  fontWeight: 800,
                }}
              >
                ◆ The prompt
              </h2>
              <div className="flex items-center gap-2">
                <CopyButton text={promptText} accent={post.modelColor} />
                <Link
                  href={`/create/nano-banana/quick?prompt=${encodeURIComponent(promptText.slice(0, 1500))}`}
                  className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs uppercase tracking-wider transition-all"
                  style={{
                    background: post.modelColor,
                    color: '#0a0a12',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    boxShadow: `0 0 14px ${post.modelColor}66`,
                  }}
                >
                  <Wand2 size={12} />
                  Remix in wizard
                </Link>
              </div>
            </div>
            <pre
              className="overflow-x-auto rounded-md border p-5 text-sm leading-relaxed whitespace-pre-wrap"
              style={{
                borderColor: 'var(--color-border)',
                background: 'var(--color-bg-card)',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {promptText.trim()}
            </pre>
          </section>
        )}

        {/* Prev / next */}
        <nav className="grid gap-4 border-t pt-8 md:grid-cols-2" style={{ borderColor: 'var(--color-border)' }}>
          {prevPost ? <PostNavLink post={prevPost} dir="prev" /> : <div />}
          {nextPost ? <PostNavLink post={nextPost} dir="next" /> : <div />}
        </nav>
      </article>
    </main>
  );
}

function PostNavLink({ post, dir }: { post: BlogPost; dir: 'prev' | 'next' }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group flex flex-col rounded-lg border p-5 transition-colors hover:border-[${post.modelColor}] ${dir === 'next' ? 'md:items-end md:text-right' : ''}`}
      style={{
        background: 'var(--color-bg-card)',
        borderColor: 'var(--color-border)',
      }}
    >
      <span
        className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.35em]"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
      >
        {dir === 'prev' ? (
          <>
            <ArrowLeft size={11} />
            Previous
          </>
        ) : (
          <>
            Next
            <ArrowRight size={11} />
          </>
        )}
      </span>
      <span
        className="text-base"
        style={{
          fontFamily: 'var(--font-display)',
          textTransform: 'uppercase',
          letterSpacing: '0.01em',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
        }}
      >
        {post.title}
      </span>
    </Link>
  );
}
