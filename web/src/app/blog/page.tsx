import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getAllPosts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog — Ultimate Image & Video Prompt Generator',
  description:
    'Editorial breakdowns of standout AI prompts. Why they work, what to swap, how to remix them. One prompt, deep coverage.',
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <main className="relative min-h-screen" style={{ background: 'var(--color-bg-deep)' }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-30 border-b backdrop-blur-md"
        style={{ background: 'rgba(10,10,18,0.85)', borderColor: 'var(--color-border)' }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] opacity-80 hover:opacity-100"
            style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-display)' }}
          >
            <ArrowLeft size={14} />
            Home
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

      {/* Header */}
      <header className="mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-32">
        <p
          className="mb-4 text-xs tracking-[0.45em] uppercase"
          style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}
        >
          ◆ The blog
        </p>
        <h1
          className="text-nebula-glow mb-6 max-w-4xl"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 8vw, 7rem)',
            lineHeight: 0.92,
            letterSpacing: '-0.025em',
            fontWeight: 900,
            textTransform: 'uppercase',
          }}
        >
          One prompt. <br />Deep coverage.
        </h1>
        <p
          className="max-w-2xl text-base md:text-lg"
          style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}
        >
          Editorial breakdowns of standout prompts — why they work, the techniques
          inside them, and how to swap parts to make them yours. Less list-of-prompts,
          more director&apos;s commentary.
        </p>
      </header>

      {/* Post list */}
      <section className="mx-auto max-w-7xl px-6 pb-24 md:px-12 md:pb-32">
        <div className="space-y-6">
          {posts.map((post, idx) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group relative grid gap-6 overflow-hidden rounded-lg border p-5 transition-all md:grid-cols-[280px_1fr] md:gap-8 md:p-6"
              style={{
                background: 'linear-gradient(145deg, var(--color-bg-card), var(--color-bg-surface))',
                borderColor: 'var(--color-border)',
              }}
            >
              <div
                className="relative aspect-[4/3] w-full overflow-hidden rounded-md md:aspect-auto"
                style={{ background: 'var(--color-bg-deep)' }}
              >
                <Image
                  src={`/showcase/${post.showcaseSlug}.png`}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 280px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  unoptimized
                />
              </div>
              <div className="flex flex-col">
                <p
                  className="mb-2 text-[10px] uppercase tracking-[0.3em]"
                  style={{ color: post.modelColor, fontFamily: 'var(--font-mono)' }}
                >
                  {idx === 0 ? '◆ Latest · ' : '◇ '}
                  {post.publishedAt} · {post.model}
                </p>
                <h2
                  className="text-2xl md:text-3xl"
                  style={{
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '0.01em',
                    textTransform: 'uppercase',
                    fontWeight: 800,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {post.title}
                </h2>
                <p
                  className="mt-2 text-sm md:text-base"
                  style={{
                    color: 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-body)',
                    lineHeight: 1.5,
                  }}
                >
                  {post.subtitle}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {post.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border px-2 py-0.5 text-[10px]"
                      style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-muted)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
                <div
                  className="mt-auto flex items-center gap-2 pt-4 text-xs uppercase tracking-[0.3em] transition-all group-hover:gap-3"
                  style={{ color: post.modelColor, fontFamily: 'var(--font-display)' }}
                >
                  Read full breakdown
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
