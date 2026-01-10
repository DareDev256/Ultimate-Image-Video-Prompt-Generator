'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Particles } from '@/components/effects/Particles';
import {
  ImageIcon,
  Video,
  Sparkles,
  Zap,
  Wand2,
  ArrowLeft,
  Settings
} from 'lucide-react';

type ModelType = 'nano-banana' | 'openai' | 'kling';

interface ModelOption {
  id: ModelType;
  name: string;
  type: 'image' | 'video';
  icon: React.ReactNode;
  description: string;
  features: string[];
  color: string;
  glowColor: string;
}

const models: ModelOption[] = [
  {
    id: 'nano-banana',
    name: 'Nano Banana',
    type: 'image',
    icon: <Sparkles className="w-8 h-8" />,
    description: 'Gemini-powered precision with JSON control',
    features: ['Structured prompts', 'Fine-grained control', 'Consistent output'],
    color: '#00d4ff',
    glowColor: 'rgba(0, 212, 255, 0.5)',
  },
  {
    id: 'openai',
    name: 'DALL-E 3',
    type: 'image',
    icon: <Wand2 className="w-8 h-8" />,
    description: 'OpenAI natural language generation',
    features: ['Natural prompts', 'Creative interpretation', 'High detail'],
    color: '#00ff88',
    glowColor: 'rgba(0, 255, 136, 0.5)',
  },
  {
    id: 'kling',
    name: 'Kling',
    type: 'video',
    icon: <Video className="w-8 h-8" />,
    description: 'Bring your vision to motion',
    features: ['5-10 sec videos', 'Multiple aspect ratios', 'Smooth motion'],
    color: '#ff00aa',
    glowColor: 'rgba(255, 0, 170, 0.5)',
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
        className="text-center mb-8 z-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Choose Your Canvas
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg">
          Select the AI model that matches your vision
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

      {/* Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full z-10">
        {models.map((model, index) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
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

      {/* Helper text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-[var(--color-text-muted)] text-sm mt-8 z-10"
      >
        Don&apos;t have API keys?{' '}
        <button
          onClick={() => router.push('/settings')}
          className="text-[var(--color-primary)] hover:underline"
        >
          Configure them in settings
        </button>
      </motion.p>

      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 border-l border-t border-[var(--color-border)] opacity-20" />
      <div className="absolute bottom-0 right-0 w-64 h-64 border-r border-b border-[var(--color-border)] opacity-20" />
    </div>
  );
}
