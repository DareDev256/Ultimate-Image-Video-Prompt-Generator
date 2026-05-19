'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Particles } from '@/components/effects/Particles';
import { InspirationButton } from '@/components/inspiration';
import {
  ImageIcon,
  Video,
  Sparkles,
  Zap,
  Wand2,
  Film,
  Clapperboard,
  Aperture,
  Cpu,
  Box,
  Layers,
  ArrowLeft,
  Settings
} from 'lucide-react';
import type { ModelType } from '@/context/WizardContext';

interface ModelOption {
  id: ModelType;
  name: string;
  type: 'image' | 'video';
  icon: React.ReactNode;
  description: string;
  features: string[];
  color: string;
  glowColor: string;
  badge?: string;
}

const models: ModelOption[] = [
  {
    id: 'nano-banana',
    name: 'Nano Banana Pro',
    type: 'image',
    icon: <Sparkles className="w-8 h-8" />,
    description: 'Gemini 3 Pro Image — text-in-image SOTA + free tier',
    features: ['4K capable', 'World-knowledge grounded', '25/day free'],
    color: '#00d4ff',
    glowColor: 'rgba(0, 212, 255, 0.5)',
    badge: 'NEW',
  },
  {
    id: 'openai',
    name: 'GPT-Image-2',
    type: 'image',
    icon: <Wand2 className="w-8 h-8" />,
    description: 'OpenAI flagship — broke arena leaderboard by 242 pts',
    features: ['Up to 4K', 'Photorealistic', 'Style transfer'],
    color: '#00ff88',
    glowColor: 'rgba(0, 255, 136, 0.5)',
    badge: 'NEW',
  },
  {
    id: 'seedance',
    name: 'Seedance 2.0',
    type: 'video',
    icon: <Film className="w-8 h-8" />,
    description: 'ByteDance — best image-to-video, $0.022/sec Fast tier',
    features: ['Multi-shot from 1 prompt', 'Phoneme-level lip-sync', '20s coherent'],
    color: '#ffb300',
    glowColor: 'rgba(255, 179, 0, 0.5)',
    badge: 'HOT',
  },
  {
    id: 'veo',
    name: 'Veo 3.1',
    type: 'video',
    icon: <Clapperboard className="w-8 h-8" />,
    description: 'Google DeepMind — only model with native 4K@60 + audio',
    features: ['Native synced audio', '1080p / 4K', 'Best dialogue clarity'],
    color: '#7c4dff',
    glowColor: 'rgba(124, 77, 255, 0.5)',
    badge: 'NEW',
  },
  {
    id: 'kling',
    name: 'Kling 3.0',
    type: 'video',
    icon: <Video className="w-8 h-8" />,
    description: 'Multi-shot subject consistency 3–15s',
    features: ['5/10 sec', 'Subject continuity', 'Multi-character audio'],
    color: '#ff00aa',
    glowColor: 'rgba(255, 0, 170, 0.5)',
  },
  {
    id: 'hunyuan',
    name: 'HunyuanVideo',
    type: 'video',
    icon: <Cpu className="w-8 h-8" />,
    description: 'Tencent · 13B open-source · prosumer-runnable',
    features: ['Strong text alignment', '720p · 5s/10s', 'Self-hostable on 24GB+ GPU'],
    color: '#3acaff',
    glowColor: 'rgba(58, 202, 255, 0.5)',
    badge: 'OPEN',
  },
  {
    id: 'wan',
    name: 'Wan 2.6',
    type: 'video',
    icon: <Aperture className="w-8 h-8" />,
    description: 'Alibaba · open-source · MoE architecture',
    features: ['~$0.05/sec hosted', '480p · 720p', 'High-noise + low-noise experts'],
    color: '#ff7e29',
    glowColor: 'rgba(255, 126, 41, 0.5)',
    badge: 'OPEN',
  },
  {
    id: 'ltx',
    name: 'LTX-Video 2.0',
    type: 'video',
    icon: <Layers className="w-8 h-8" />,
    description: 'Lightricks · cheapest hosted at ~$0.04/sec',
    features: ['1080p · 4K', 'DiT architecture', 'Built for speed'],
    color: '#a3ff5b',
    glowColor: 'rgba(163, 255, 91, 0.5)',
    badge: 'CHEAP',
  },
  {
    id: 'mochi',
    name: 'Mochi 1',
    type: 'video',
    icon: <Box className="w-8 h-8" />,
    description: 'Genmo AI · 10B Apache 2.0 · self-host friendly',
    features: ['Apache 2.0 license', 'Strong prompt-following', 'Asymmetric DiT'],
    color: '#ff5cc0',
    glowColor: 'rgba(255, 92, 192, 0.5)',
    badge: 'OPEN',
  },
];

export default function CreatePage() {
  const router = useRouter();
  const [hoveredModel, setHoveredModel] = useState<ModelType | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType | null>(null);
  const [mode, setMode] = useState<'wizard' | 'quick'>('wizard');

  const handleSelectModel = (modelId: ModelType) => {
    setSelectedModel(modelId);

    // Dramatic transition delay
    setTimeout(() => {
      if (mode === 'quick') {
        router.push(`/create/${modelId}/quick`);
      } else {
        router.push(`/create/${modelId}`);
      }
    }, 600);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-12 px-4">
      {/* Particle Background */}
      <Particles />

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => router.push('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors z-20"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium tracking-wider">BACK</span>
      </motion.button>

      {/* Settings/API Keys button */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => router.push('/settings')}
        className="absolute top-6 right-6 flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors z-20"
      >
        <Settings size={20} />
        <span className="text-sm font-medium tracking-wider">API KEYS</span>
      </motion.button>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 z-10 max-w-3xl"
      >
        <p
          className="mb-3 text-[10px] tracking-[0.45em] uppercase"
          style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}
        >
          ◆ Pick the engine
        </p>
        <h1
          className="text-nebula-glow mb-4"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 6vw, 4.5rem)',
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            fontWeight: 900,
            textTransform: 'uppercase',
          }}
        >
          Nine engines. <br />Same wizard.
        </h1>
        <p
          className="text-base"
          style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}
        >
          Two image, seven video. Pick a model — every wizard step adapts to it.
        </p>
      </motion.div>

      {/* Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex items-center gap-2 mb-8 z-10 p-1 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border)]"
      >
        <button
          onClick={() => setMode('wizard')}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
            flex items-center gap-2
            ${mode === 'wizard'
              ? 'bg-[var(--color-primary)] text-black'
              : 'text-[var(--color-text-muted)] hover:text-white'
            }
          `}
        >
          <Wand2 size={14} />
          <span>Wizard Mode</span>
        </button>
        <button
          onClick={() => setMode('quick')}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
            flex items-center gap-2
            ${mode === 'quick'
              ? 'bg-[var(--color-secondary)] text-black'
              : 'text-[var(--color-text-muted)] hover:text-white'
            }
          `}
        >
          <Zap size={14} />
          <span>Quick Mode</span>
        </button>
      </motion.div>

      {/* Model section header — Images first */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="z-10 w-full max-w-5xl mb-3 flex items-center gap-3"
      >
        <span
          className="text-[10px] tracking-[0.4em] uppercase"
          style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}
        >
          ◆ Image
        </span>
        <span className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
        <span
          className="text-[10px] tracking-[0.4em] uppercase"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {models.filter((m) => m.type === 'image').length} models
        </span>
      </motion.div>

      {/* Image model cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full z-10 mb-10">
        {models.filter((m) => m.type === 'image').map((model, index) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
          >
            <motion.button
              onClick={() => handleSelectModel(model.id)}
              onMouseEnter={() => setHoveredModel(model.id)}
              onMouseLeave={() => setHoveredModel(null)}
              disabled={selectedModel !== null}
              className={`
                relative w-full text-left p-6 rounded-xl
                bg-[var(--color-bg-card)] border-2
                transition-all duration-300 ease-out
                ${selectedModel === model.id
                  ? 'scale-105 border-[var(--color-primary)]'
                  : 'border-[var(--color-border)] hover:border-opacity-50'
                }
                ${selectedModel !== null && selectedModel !== model.id
                  ? 'opacity-30 pointer-events-none'
                  : ''
                }
                group overflow-hidden
              `}
              style={{
                borderColor: hoveredModel === model.id || selectedModel === model.id
                  ? model.color
                  : undefined,
                boxShadow: hoveredModel === model.id || selectedModel === model.id
                  ? `0 0 30px ${model.glowColor}, 0 10px 40px rgba(0,0,0,0.4)`
                  : '0 4px 20px rgba(0,0,0,0.2)',
              }}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, transparent 0%, ${model.glowColor} 50%, transparent 100%)`,
                    opacity: 0.1,
                  }}
                />
              </div>

              {/* Type badge */}
              <div
                className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold tracking-wider"
                style={{
                  backgroundColor: `${model.color}20`,
                  color: model.color,
                  border: `1px solid ${model.color}40`,
                }}
              >
                {model.type === 'image' ? (
                  <span className="flex items-center gap-1">
                    <ImageIcon size={12} />
                    IMAGE
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Video size={12} />
                    VIDEO
                  </span>
                )}
              </div>

              {/* Icon */}
              <motion.div
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
                style={{
                  backgroundColor: `${model.color}15`,
                  color: model.color,
                  boxShadow: hoveredModel === model.id
                    ? `0 0 20px ${model.glowColor}`
                    : 'none',
                }}
                animate={hoveredModel === model.id ? { rotate: [0, -5, 5, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
                {model.icon}
              </motion.div>

              {/* Name */}
              <h2
                className="text-2xl font-bold mb-2 tracking-tight"
                style={{ color: hoveredModel === model.id ? model.color : 'white' }}
              >
                {model.name}
              </h2>

              {/* Description */}
              <p className="text-[var(--color-text-secondary)] text-sm mb-4">
                {model.description}
              </p>

              {/* Features */}
              <ul className="space-y-2">
                {model.features.map((feature, i) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 + i * 0.05 }}
                    className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]"
                  >
                    <Zap
                      size={12}
                      style={{ color: model.color }}
                    />
                    {feature}
                  </motion.li>
                ))}
              </ul>

              {/* Select indicator */}
              <motion.div
                className="absolute bottom-4 right-4 text-sm font-medium tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: model.color }}
              >
                SELECT →
              </motion.div>

              {/* Selection animation overlay */}
              {selectedModel === model.id && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 20, opacity: 1 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: model.color,
                    transformOrigin: 'center',
                  }}
                />
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Model section header — Video */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="z-10 w-full max-w-5xl mb-3 flex items-center gap-3"
      >
        <span
          className="text-[10px] tracking-[0.4em] uppercase"
          style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)' }}
        >
          ◆ Video
        </span>
        <span className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
        <span
          className="text-[10px] tracking-[0.4em] uppercase"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {models.filter((m) => m.type === 'video').length} models · proprietary + open-source
        </span>
      </motion.div>

      {/* Video model cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full z-10">
        {models.filter((m) => m.type === 'video').map((model, index) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 + index * 0.04, duration: 0.5 }}
          >
            <motion.button
              onClick={() => handleSelectModel(model.id)}
              onMouseEnter={() => setHoveredModel(model.id)}
              onMouseLeave={() => setHoveredModel(null)}
              disabled={selectedModel !== null}
              className={`
                relative w-full text-left p-6 rounded-xl
                bg-[var(--color-bg-card)] border-2
                transition-all duration-300 ease-out
                ${selectedModel === model.id
                  ? 'scale-105 border-[var(--color-primary)]'
                  : 'border-[var(--color-border)] hover:border-opacity-50'
                }
                ${selectedModel !== null && selectedModel !== model.id
                  ? 'opacity-30 pointer-events-none'
                  : ''
                }
                group overflow-hidden
              `}
              style={{
                borderColor: hoveredModel === model.id || selectedModel === model.id
                  ? model.color
                  : undefined,
                boxShadow: hoveredModel === model.id || selectedModel === model.id
                  ? `0 0 30px ${model.glowColor}, 0 10px 40px rgba(0,0,0,0.4)`
                  : '0 4px 20px rgba(0,0,0,0.2)',
              }}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, transparent 0%, ${model.glowColor} 50%, transparent 100%)`,
                    opacity: 0.1,
                  }}
                />
              </div>

              <div className="absolute top-4 right-4 flex items-center gap-1.5">
                {model.badge && (
                  <span
                    className="rounded px-1.5 py-0.5 text-[9px] uppercase tracking-[0.2em] font-bold"
                    style={{
                      background: model.color,
                      color: '#0a0a12',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {model.badge}
                  </span>
                )}
                <div
                  className="px-3 py-1 rounded-full text-xs font-bold tracking-wider flex items-center gap-1"
                  style={{
                    backgroundColor: `${model.color}20`,
                    color: model.color,
                    border: `1px solid ${model.color}40`,
                  }}
                >
                  <Video size={12} />
                  VIDEO
                </div>
              </div>

              <motion.div
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
                style={{
                  backgroundColor: `${model.color}15`,
                  color: model.color,
                  boxShadow: hoveredModel === model.id ? `0 0 20px ${model.glowColor}` : 'none',
                }}
                animate={hoveredModel === model.id ? { rotate: [0, -5, 5, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
                {model.icon}
              </motion.div>

              <h2
                className="text-2xl font-bold mb-2 tracking-tight"
                style={{ color: hoveredModel === model.id ? model.color : 'white' }}
              >
                {model.name}
              </h2>
              <p className="text-[var(--color-text-secondary)] mb-4 text-sm">
                {model.description}
              </p>
              <ul className="space-y-1.5 mb-4">
                {model.features.map((f) => (
                  <li key={f} className="text-xs text-[var(--color-text-muted)] flex items-center gap-2">
                    <span style={{ color: model.color }}>▸</span>
                    {f}
                  </li>
                ))}
              </ul>

              {selectedModel === model.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute bottom-4 right-4"
                  style={{ color: model.color }}
                >
                  <Zap size={20} />
                </motion.div>
              )}
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Helper text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-8 z-10 max-w-lg mx-auto space-y-2"
      >
        <p className="text-[var(--color-text-muted)] text-sm">
          <span className="text-[var(--color-text-secondary)]">Option 1:</span>{' '}
          <button
            onClick={() => router.push('/settings')}
            className="text-[var(--color-primary)] hover:underline"
          >
            Add your API keys
          </button>
          {' '}to generate directly in-app
        </p>
        <p className="text-[var(--color-text-muted)] text-sm">
          <span className="text-[var(--color-text-secondary)]">Option 2:</span>{' '}
          Use the wizard to build your prompt, copy the JSON, and paste it into any GenAI (Gemini, ChatGPT, Midjourney, Runway, etc.)
        </p>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 border-l border-t border-[var(--color-border)] opacity-20" />
      <div className="absolute bottom-0 right-0 w-64 h-64 border-r border-b border-[var(--color-border)] opacity-20" />

      {/* Inspiration Panel */}
      <InspirationButton />
    </div>
  );
}
