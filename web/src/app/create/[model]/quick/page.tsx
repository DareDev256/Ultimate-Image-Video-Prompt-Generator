'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Zap,
  Shuffle,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { Particles } from '@/components/effects/Particles';
import { InspirationButton } from '@/components/inspiration';
import { ModelType } from '@/context/WizardContext';
import { wizardCategories } from '@/lib/categories';
import { useDiversePick } from '@/hooks/useDiversePick';
import type { ImagePrompt, VideoPrompt } from '@/hooks/useInspirationData';

export default function QuickModePage() {
  const router = useRouter();
  const params = useParams();
  const modelId = params.model as ModelType;

  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  const modelNames: Record<ModelType, string> = {
    'nano-banana': 'Nano Banana',
    openai: 'DALL-E 3',
    kling: 'Kling',
  };

  const modelColors: Record<ModelType, string> = {
    'nano-banana': '#00d4ff',
    openai: '#00ff88',
    kling: '#ff00aa',
  };

  const diversePick = useDiversePick();

  useEffect(() => {
    const apiKey = localStorage.getItem(`${modelId}ApiKey`);
    setHasApiKey(!!apiKey);
  }, [modelId]);

  const handleRandomize = () => {
    const randomPrompt: Record<string, Record<string, string>> = {};

    wizardCategories.forEach((category) => {
      const categoryData: Record<string, string> = {};
      category.fields.forEach((field) => {
        const keyParts = field.key.split('.');
        const lastKey = keyParts[keyParts.length - 1];
        categoryData[lastKey] = diversePick(field.key, field.suggestions);
      });
      const categoryKey = category.fields[0]?.key.split('.')[0] || category.id;
      randomPrompt[categoryKey] = categoryData;
    });

    if (modelId === 'nano-banana') {
      setPrompt(JSON.stringify(randomPrompt, null, 2));
    } else {
      const parts: string[] = [];
      Object.entries(randomPrompt).forEach(([, fields]) => {
        Object.values(fields).forEach((value) => {
          if (value) parts.push(value);
        });
      });
      setPrompt(parts.join(', '));
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = () => {
    if (!hasApiKey) {
      router.push('/settings');
      return;
    }

    if (!prompt.trim()) {
      return;
    }

    localStorage.setItem('generatingPrompt', prompt);
    router.push(`/create/${modelId}/generate`);
  };

  const isJson = modelId === 'nano-banana';

  // Handle using a prompt from the inspiration panel
  const handleUseAsTemplate = useCallback(
    (inspirationPrompt: ImagePrompt | VideoPrompt, type: 'image' | 'video') => {
      if (type === 'image') {
        const imgPrompt = inspirationPrompt as ImagePrompt;
        // Use the first prompt text
        const promptText = imgPrompt.prompts?.[0] || '';
        setPrompt(promptText);
      } else {
        const vidPrompt = inspirationPrompt as VideoPrompt;
        // Use the English prompt
        setPrompt(vidPrompt.promptEn || vidPrompt.promptZh || '');
      }
    },
    []
  );

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <Particles />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/create')}
            className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium tracking-wider">MODELS</span>
          </button>

          <div className="flex items-center gap-2">
            <Zap size={16} style={{ color: modelColors[modelId] }} />
            <span className="text-sm font-bold tracking-wider">QUICK MODE</span>
          </div>

          <div
            className="px-3 py-1 text-xs font-bold tracking-wider rounded-full"
            style={{
              backgroundColor: `${modelColors[modelId]}20`,
              color: modelColors[modelId],
              border: `1px solid ${modelColors[modelId]}40`,
            }}
          >
            {modelNames[modelId]}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 px-6 py-8 flex flex-col">
        <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="text-2xl font-bold mb-2">Direct Prompt</h1>
            <p className="text-[var(--color-text-secondary)]">
              Skip the wizard - paste or type your prompt directly
            </p>
          </motion.div>

          {/* Prompt Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[var(--color-text-muted)]">
                {isJson ? 'JSON Prompt' : 'Natural Language Prompt'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRandomize}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-surface)] transition-colors"
                >
                  <Shuffle size={14} />
                  <span>Randomize</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-surface)] transition-colors"
                  disabled={!prompt}
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-[var(--color-success)]" />
                      <span className="text-[var(--color-success)]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                isJson
                  ? '{\n  "subject": {\n    "description": "Your subject here..."\n  },\n  ...\n}'
                  : 'Describe your image in natural language...'
              }
              className={`
                flex-1 min-h-[300px] p-4 rounded-xl
                bg-[var(--color-bg-deep)] border border-[var(--color-border)]
                text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]
                focus:outline-none focus:border-[var(--color-primary)]
                resize-none transition-colors
                ${isJson ? 'font-mono text-sm' : 'text-base'}
              `}
            />

            <p className="text-xs text-[var(--color-text-muted)] mt-2 text-right">
              {prompt.length} characters
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6"
          >
            <motion.button
              onClick={() => router.push(`/create/${modelId}`)}
              className="btn btn-ghost w-full sm:w-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles size={18} />
              <span>Use Wizard Instead</span>
            </motion.button>

            <motion.button
              onClick={handleGenerate}
              disabled={!prompt.trim()}
              className="btn btn-primary w-full sm:w-auto px-8 animate-pulse-glow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: prompt.trim()
                  ? `linear-gradient(135deg, ${modelColors[modelId]} 0%, ${modelColors[modelId]}cc 100%)`
                  : undefined,
              }}
            >
              <Zap size={18} />
              <span>{hasApiKey ? 'Generate' : 'Configure API Key'}</span>
            </motion.button>
          </motion.div>
        </div>
      </main>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[var(--color-border)] opacity-20" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[var(--color-border)] opacity-20" />

      {/* Inspiration Panel */}
      <InspirationButton onUseAsTemplate={handleUseAsTemplate} />
    </div>
  );
}
