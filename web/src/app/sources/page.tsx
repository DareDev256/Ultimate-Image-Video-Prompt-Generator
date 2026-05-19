import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ExternalLink, Star, Database, Github } from 'lucide-react';
import { buildSourceSummaries, fetchGithubMeta, loadImagePrompts, loadVideoPrompts } from '@/lib/server/prompt-data';

export const metadata: Metadata = {
  title: 'Sources & Credit — Ultimate Image & Video Prompt Generator',
  description:
    'Every prompt in the feed is sourced from open-source repos and X creators. Full attribution per repo, per author, per model. Credit kept.',
};

export const revalidate = 3600;

export default async function SourcesPage() {
  const summaries = buildSourceSummaries();
  const totalImages = loadImagePrompts().length;
  const totalVideos = loadVideoPrompts().length;

  // Fetch GitHub metadata for all sources in parallel.
  const githubData = await Promise.all(
    summaries.map((s) => fetchGithubMeta(s.repo))
  );

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
          style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}
        >
          ◆ Sources &amp; Credit
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
          Credit kept. <br />Always.
        </h1>
        <p
          className="max-w-2xl text-base md:text-lg"
          style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}
        >
          {totalImages.toLocaleString()} image prompts and {totalVideos} video prompts curated from
          {' '}{summaries.length} open-source repos and the X creator community. Every card in the
          feed links back to its original creator. If you contribute to one of
          these collections, your work is credited here too.
        </p>
      </header>

      {/* Source cards */}
      <section className="mx-auto max-w-7xl px-6 pb-20 md:px-12 md:pb-32">
        <div className="space-y-6">
          {summaries.map((source, idx) => {
            const gh = githubData[idx];
            const stars = gh?.stargazers_count ?? null;
            const lastPush = gh?.pushed_at ? new Date(gh.pushed_at) : null;
            const avatar = gh?.owner?.avatar_url ?? null;

            return (
              <article
                key={source.repo}
                className="overflow-hidden rounded-lg border transition-all hover:border-[var(--color-primary)]"
                style={{
                  background: 'linear-gradient(145deg, var(--color-bg-card), var(--color-bg-surface))',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="grid gap-6 p-6 md:grid-cols-[auto_1fr_auto] md:gap-8 md:p-8">
                  {/* Left — avatar */}
                  <div className="flex md:flex-col md:items-center md:gap-3">
                    {avatar ? (
                      <Image
                        src={avatar}
                        alt={source.owner}
                        width={64}
                        height={64}
                        className="rounded-md border"
                        style={{ borderColor: 'var(--color-border)' }}
                        unoptimized
                      />
                    ) : (
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-md border"
                        style={{
                          background: 'var(--color-bg-elevated)',
                          borderColor: 'var(--color-border)',
                        }}
                      >
                        <Github size={28} style={{ color: 'var(--color-text-muted)' }} />
                      </div>
                    )}
                  </div>

                  {/* Middle — name + description + tags */}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3">
                      <p
                        className="text-xs uppercase tracking-[0.25em]"
                        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                      >
                        {source.owner}
                      </p>
                    </div>
                    <h2
                      className="mt-1 break-all text-2xl md:text-3xl"
                      style={{
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '0.01em',
                        textTransform: 'uppercase',
                        fontWeight: 800,
                      }}
                    >
                      {source.name}
                    </h2>

                    {gh?.description && (
                      <p
                        className="mt-3 text-sm leading-relaxed"
                        style={{
                          color: 'var(--color-text-secondary)',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        {gh.description}
                      </p>
                    )}

                    {/* Top contributors */}
                    {source.topAuthors.length > 0 && (
                      <div className="mt-4">
                        <p
                          className="mb-2 text-[10px] uppercase tracking-[0.3em]"
                          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                        >
                          Top contributors
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {source.topAuthors.map((author) => (
                            <span
                              key={author.name}
                              className="rounded-full border px-2 py-0.5 text-[11px]"
                              style={{
                                borderColor: 'var(--color-border)',
                                color: 'var(--color-text-secondary)',
                                fontFamily: 'var(--font-body)',
                              }}
                            >
                              {author.name}
                              <span className="ml-1 opacity-60" style={{ fontFamily: 'var(--font-mono)' }}>
                                ×{author.count}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Models breakdown */}
                    {source.models.length > 0 && (
                      <div className="mt-4">
                        <p
                          className="mb-2 text-[10px] uppercase tracking-[0.3em]"
                          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                        >
                          Models
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {source.models.map((m) => (
                            <span
                              key={m.name}
                              className="rounded px-2 py-0.5 text-[10px] uppercase tracking-wider"
                              style={{
                                background: 'var(--color-bg-elevated)',
                                color: 'var(--color-text-secondary)',
                                fontFamily: 'var(--font-mono)',
                              }}
                            >
                              {m.name} <span className="opacity-50">({m.count})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right — stats + actions */}
                  <div className="flex flex-row items-start gap-4 md:flex-col md:items-end md:gap-2 md:text-right">
                    <Stat label="Prompts" value={source.count.toLocaleString()} icon={Database} />
                    {stars !== null && (
                      <Stat label="Stars" value={formatStars(stars)} icon={Star} />
                    )}
                    {lastPush && (
                      <p
                        className="text-[10px] uppercase tracking-[0.25em]"
                        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                      >
                        Updated {relativeDate(lastPush)}
                      </p>
                    )}

                    <div className="mt-3 flex w-full flex-col gap-2 md:items-end">
                      <a
                        href={source.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] transition-opacity hover:opacity-80"
                        style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}
                      >
                        <Github size={12} />
                        View repo
                        <ExternalLink size={11} />
                      </a>
                      <Link
                        href={`/feed?source=${encodeURIComponent(source.repo)}`}
                        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] transition-opacity hover:opacity-80"
                        style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-display)' }}
                      >
                        Filter feed by this →
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Footer note */}
      <footer
        className="border-t px-6 py-12 md:px-12 md:py-16"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="mx-auto max-w-7xl">
          <p
            className="text-xs leading-relaxed"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
          >
            If you're a creator credited here and want a different attribution
            style — or if your work appears uncredited — open an issue on{' '}
            <a
              href="https://github.com/DareDev256/Ultimate-Image-Video-Prompt-Generator"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[var(--color-primary)]"
            >
              the GitHub repo
            </a>
            . The feed is rebuilt from these sources hourly.
          </p>
        </div>
      </footer>
    </main>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number }>;
}) {
  return (
    <div className="flex items-center gap-2 md:flex-col md:items-end md:gap-0">
      <Icon size={12} />
      <div className="md:flex md:flex-col md:items-end">
        <span
          className="text-2xl font-bold leading-none md:text-3xl"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
        >
          {value}
        </span>
        <span
          className="ml-1 text-[10px] uppercase tracking-[0.3em] md:ml-0 md:mt-1"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function relativeDate(d: Date): string {
  const ms = Date.now() - d.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days < 1) return 'today';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
