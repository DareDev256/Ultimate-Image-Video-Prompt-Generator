'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Key,
  Eye,
  EyeOff,
  Check,
  ExternalLink,
  Trash2,
  AlertCircle,
  Gift,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { useFreeTier } from '@/hooks/useFreeTier';
import { useUserSettings } from '@/hooks/useUserSettings';
import {
  MODEL_NAMES,
  MODEL_COLORS,
  MODEL_PROVIDERS,
  MODEL_KIND,
  isVideoModel,
} from '@/lib/models';
import { OPTIONS, type ImageModelDefaults, type VideoModelDefaults } from '@/lib/user-settings';
import type { ModelType } from '@/context/WizardContext';

interface ApiKeyConfig {
  id: string;
  name: string;
  description: string;
  placeholder: string;
  docsUrl: string;
  color: string;
  unlocks?: string;
}

const API_KEYS: ApiKeyConfig[] = [
  {
    id: 'nano-banana',
    name: 'Google Gemini',
    description: 'Unlocks Nano Banana Pro (Gemini 3 Pro Image) — also enables free tier',
    placeholder: 'AIza...',
    docsUrl: 'https://ai.google.dev/tutorials/setup',
    color: '#00d4ff',
    unlocks: 'Nano Banana Pro',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-Image-2 image generation',
    placeholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
    color: '#00ff88',
    unlocks: 'GPT-Image-2',
  },
  {
    id: 'fal',
    name: 'fal.ai',
    description: 'Single key unlocks 6 video models — Seedance, Veo, Wan, Hunyuan, LTX, Mochi',
    placeholder: 'Enter your fal.ai key',
    docsUrl: 'https://fal.ai/dashboard/keys',
    color: '#ffb300',
    unlocks: 'Seedance 2.0, Veo 3.1, Wan 2.6, HunyuanVideo, LTX-Video, Mochi 1',
  },
  {
    id: 'kling',
    name: 'Kling AI',
    description: 'Direct Kling API (skip if you only use fal.ai for video)',
    placeholder: 'Enter your Kling API key',
    docsUrl: 'https://klingai.com',
    color: '#ff00aa',
    unlocks: 'Kling 3.0 (direct)',
  },
];

const MODEL_ORDER: ModelType[] = [
  'nano-banana',
  'openai',
  'seedance',
  'veo',
  'kling',
  'hunyuan',
  'wan',
  'ltx',
  'mochi',
];

export default function SettingsPage() {
  const router = useRouter();
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const { remaining, limit, used, isLoaded } = useFreeTier();
  const { hydrated, get, update, reset } = useUserSettings();

  useEffect(() => {
    const loaded: Record<string, string> = {};
    API_KEYS.forEach((c) => {
      const v = localStorage.getItem(`${c.id}ApiKey`);
      if (v) loaded[c.id] = v;
    });
    setKeys(loaded);
  }, []);

  const handleSaveKey = (id: string) => {
    const k = keys[id];
    if (!k) return;
    localStorage.setItem(`${id}ApiKey`, k);
    setSaved((p) => ({ ...p, [id]: true }));
    setTimeout(() => setSaved((p) => ({ ...p, [id]: false })), 1800);
  };

  const handleDeleteKey = (id: string) => {
    localStorage.removeItem(`${id}ApiKey`);
    setKeys((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const toggle = (id: string) => setShowKey((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="relative min-h-screen" style={{ background: 'var(--color-bg-deep)' }}>
      {/* Top bar */}
      <div
        className="sticky top-0 z-30 border-b backdrop-blur-md"
        style={{ background: 'rgba(10,10,18,0.85)', borderColor: 'var(--color-border)' }}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 md:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] opacity-80 hover:opacity-100"
            style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-display)' }}
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.3em] opacity-80 hover:opacity-100"
            style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}
          >
            Home →
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-12 md:px-8 md:py-16">
        {/* Header */}
        <header className="mb-12">
          <p
            className="mb-3 text-xs tracking-[0.4em] uppercase"
            style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}
          >
            ◆ Settings
          </p>
          <h1
            className="text-nebula-glow mb-4"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.25rem, 5vw, 4rem)',
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              fontWeight: 900,
              textTransform: 'uppercase',
            }}
          >
            Keys &amp; defaults
          </h1>
          <p
            className="max-w-2xl text-base"
            style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}
          >
            One key per provider, generation defaults per model. Everything stays
            in your browser — keys are never sent to our server.
          </p>
        </header>

        {/* Free tier strip */}
        <section
          className="mb-10 rounded-lg border p-5 md:p-6"
          style={{
            background:
              'linear-gradient(135deg, rgba(0,212,255,0.08) 0%, rgba(255,204,0,0.05) 100%)',
            borderColor: 'var(--color-border)',
          }}
        >
          <div className="flex flex-wrap items-center gap-4">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-md"
              style={{ background: 'rgba(255,204,0,0.15)', color: 'var(--color-accent)' }}
            >
              <Gift size={18} />
            </div>
            <div className="flex-1">
              <p
                className="text-[10px] uppercase tracking-[0.35em] mb-1"
                style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}
              >
                Free tier · Nano Banana Pro
              </p>
              <p
                className="text-base"
                style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)' }}
              >
                {isLoaded ? (
                  <>
                    <span className="font-bold" style={{ color: 'var(--color-primary)' }}>
                      {remaining}
                    </span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      &nbsp;/ {limit} generations remaining today · {used} used
                    </span>
                  </>
                ) : (
                  <span style={{ color: 'var(--color-text-muted)' }}>Loading…</span>
                )}
              </p>
            </div>
          </div>
          {isLoaded && (
            <div className="mt-4 h-1.5 overflow-hidden rounded-full" style={{ background: 'var(--color-bg-surface)' }}>
              <motion.div
                className="h-full"
                style={{
                  background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(remaining / limit) * 100}%` }}
                transition={{ duration: 0.5, delay: 0.1 }}
              />
            </div>
          )}
        </section>

        {/* API Keys */}
        <section className="mb-12">
          <div className="mb-5 flex items-baseline justify-between">
            <h2
              className="text-2xl"
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                fontWeight: 800,
              }}
            >
              ◆ API keys
            </h2>
            <p
              className="text-[10px] uppercase tracking-[0.3em]"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              Stored in localStorage only
            </p>
          </div>
          <div className="space-y-3">
            {API_KEYS.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05 * i }}
                className="rounded-lg border p-5 md:p-6"
                style={{
                  background: 'linear-gradient(145deg, var(--color-bg-card), var(--color-bg-surface))',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-md"
                      style={{ background: `${c.color}1f`, color: c.color }}
                    >
                      <Key size={18} />
                    </div>
                    <div>
                      <h3
                        className="text-base font-bold"
                        style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.01em' }}
                      >
                        {c.name}
                      </h3>
                      <p
                        className="text-xs"
                        style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
                      >
                        {c.description}
                      </p>
                    </div>
                  </div>
                  <a
                    href={c.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] opacity-70 hover:opacity-100"
                    style={{ color: c.color, fontFamily: 'var(--font-display)' }}
                  >
                    Get key
                    <ExternalLink size={10} />
                  </a>
                </div>

                {c.unlocks && (
                  <p
                    className="mb-3 text-[10px] uppercase tracking-[0.3em]"
                    style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                  >
                    Unlocks: {c.unlocks}
                  </p>
                )}

                <div className="flex items-stretch gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKey[c.id] ? 'text' : 'password'}
                      value={keys[c.id] || ''}
                      onChange={(e) => setKeys((p) => ({ ...p, [c.id]: e.target.value }))}
                      placeholder={c.placeholder}
                      className="w-full rounded-md border bg-transparent py-2.5 pl-3 pr-20 text-sm outline-none transition-colors focus:border-[var(--color-primary)]"
                      style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0">
                      <button
                        type="button"
                        onClick={() => toggle(c.id)}
                        className="p-1.5 opacity-60 transition-opacity hover:opacity-100"
                        style={{ color: 'var(--color-text-secondary)' }}
                        aria-label={showKey[c.id] ? 'Hide' : 'Show'}
                      >
                        {showKey[c.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      {keys[c.id] && (
                        <button
                          type="button"
                          onClick={() => handleDeleteKey(c.id)}
                          className="p-1.5 opacity-60 transition-opacity hover:opacity-100 hover:text-red-400"
                          style={{ color: 'var(--color-text-secondary)' }}
                          aria-label="Delete key"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSaveKey(c.id)}
                    disabled={!keys[c.id]}
                    className="rounded-md px-4 text-xs uppercase tracking-[0.25em] transition-all disabled:opacity-40"
                    style={{
                      background: saved[c.id] ? 'var(--color-success)' : c.color,
                      color: '#0a0a12',
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      boxShadow: saved[c.id]
                        ? '0 0 16px var(--color-success-glow)'
                        : keys[c.id]
                        ? `0 0 16px ${c.color}66`
                        : 'none',
                    }}
                  >
                    {saved[c.id] ? <Check size={14} /> : 'Save'}
                  </button>
                </div>

                <div className="mt-3">
                  {keys[c.id] ? (
                    <span
                      className="flex items-center gap-1 text-[10px] uppercase tracking-[0.3em]"
                      style={{ color: 'var(--color-success)', fontFamily: 'var(--font-mono)' }}
                    >
                      <Check size={10} />
                      Configured
                    </span>
                  ) : (
                    <span
                      className="flex items-center gap-1 text-[10px] uppercase tracking-[0.3em]"
                      style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
                    >
                      <AlertCircle size={10} />
                      Not configured
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Generation Defaults */}
        <section className="mb-12">
          <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
            <h2
              className="flex items-center gap-2 text-2xl"
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                fontWeight: 800,
              }}
            >
              <Sliders size={20} />
              Generation defaults
            </h2>
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] opacity-70 hover:opacity-100"
              style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-display)' }}
            >
              <RotateCcw size={10} />
              Reset all
            </button>
          </div>
          <p
            className="mb-6 max-w-2xl text-sm"
            style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
          >
            Your defaults pre-fill the wizard for each model. Override per-shot
            in the wizard itself if needed.
          </p>

          {hydrated && (
            <div className="grid gap-3 md:grid-cols-2">
              {MODEL_ORDER.map((id) => {
                const isVideo = isVideoModel(id);
                const opts = OPTIONS[id];
                const color = MODEL_COLORS[id];
                const defaults = get(id);
                return (
                  <motion.div
                    key={id}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="rounded-lg border p-4"
                    style={{
                      background: 'var(--color-bg-card)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className="block h-2 w-2 rounded-full"
                        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
                      />
                      <h3
                        className="text-sm"
                        style={{
                          fontFamily: 'var(--font-display)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          fontWeight: 700,
                        }}
                      >
                        {MODEL_NAMES[id]}
                      </h3>
                      <span
                        className="ml-auto rounded border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.2em]"
                        style={{
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-muted)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {MODEL_KIND[id]}
                      </span>
                    </div>
                    <p
                      className="mb-4 text-[10px] uppercase tracking-[0.25em]"
                      style={{ color, fontFamily: 'var(--font-mono)', opacity: 0.75 }}
                    >
                      {MODEL_PROVIDERS[id]}
                    </p>

                    <div className="space-y-3">
                      {Object.entries(opts).map(([field, choices]) => {
                        const fieldChoices = choices as readonly (string | number | boolean)[];
                        if (fieldChoices.length <= 1) return null; // Single-option fields are not user-tunable.
                        const current = (defaults as unknown as Record<string, unknown>)[field];
                        return (
                          <DefaultSelect
                            key={field}
                            label={fieldLabel(field)}
                            value={current}
                            choices={fieldChoices}
                            accent={color}
                            onChange={(v) => {
                              const patch = { [field]: v } as Partial<
                                ImageModelDefaults | VideoModelDefaults
                              >;
                              update(id, patch);
                            }}
                          />
                        );
                      })}
                      {Object.values(opts).every((c) => (c as readonly unknown[]).length <= 1) && (
                        <p
                          className="text-xs italic"
                          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
                        >
                          {isVideo
                            ? 'Single-option model — no defaults to set.'
                            : 'No tunable fields exposed yet.'}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function fieldLabel(key: string): string {
  switch (key) {
    case 'aspectRatio':
      return 'Aspect ratio';
    case 'generateAudio':
      return 'Generate audio';
    case 'tier':
      return 'Tier';
    default:
      return key.replace(/^./, (c) => c.toUpperCase());
  }
}

interface DefaultSelectProps {
  label: string;
  value: unknown;
  choices: readonly (string | number | boolean)[];
  accent: string;
  onChange: (next: string | number | boolean) => void;
}

function DefaultSelect({ label, value, choices, accent, onChange }: DefaultSelectProps) {
  return (
    <div>
      <p
        className="mb-1.5 text-[9px] uppercase tracking-[0.3em]"
        style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-1">
        {choices.map((c) => {
          const active = value === c;
          const display =
            typeof c === 'boolean' ? (c ? 'On' : 'Off') : String(c);
          return (
            <button
              key={display}
              onClick={() => onChange(c)}
              className="rounded border px-2 py-0.5 text-[11px] uppercase tracking-wider transition-all"
              style={{
                borderColor: active ? accent : 'var(--color-border)',
                background: active ? `${accent}25` : 'transparent',
                color: active ? accent : 'var(--color-text-secondary)',
                fontFamily: 'var(--font-display)',
                fontWeight: active ? 700 : 500,
                boxShadow: active ? `0 0 10px ${accent}55` : 'none',
              }}
            >
              {display}
            </button>
          );
        })}
      </div>
    </div>
  );
}
