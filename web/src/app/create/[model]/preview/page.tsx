'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Copy,
  Check,
  Sparkles,
  Zap,
  AlertCircle,
} from 'lucide-react';
import { Particles } from '@/components/effects/Particles';
import { WizardProvider, useWizard, ModelType } from '@/context/WizardContext';

function PreviewContent() {
  const router = useRouter();
  const params = useParams();
  const modelId = params.model as ModelType;

  const { state, setModel, restoreState, getFormattedPrompt, reset } = useWizard();
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    if (modelId && ['nano-banana', 'openai', 'kling'].includes(modelId)) {
      // Load wizard state from localStorage if available
      const savedState = localStorage.getItem('wizardState');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.model === modelId && Object.keys(parsed.formData || {}).length > 0) {
          // Restore full state including formData
          restoreState(parsed);
        } else {
          setModel(modelId);
        }
      } else {
        setModel(modelId);
      }

      // Check for API key
      const apiKey = localStorage.getItem(`${modelId}ApiKey`);
      setHasApiKey(!!apiKey);
    } else {
      router.push('/create');
    }
  }, [modelId, setModel, restoreState, router]);

  // Save state to localStorage on changes
  useEffect(() => {
    if (state.model && Object.keys(state.formData).length > 0) {
      localStorage.setItem('wizardState', JSON.stringify(state));
    }
  }, [state]);

  const prompt = getFormattedPrompt();
  const isJson = modelId === 'nano-banana';

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

    setIsGenerating(true);
    // Navigate to generation page with state
    localStorage.setItem('generatingPrompt', prompt);
    router.push(`/create/${modelId}/generate`);
  };

  const handleEdit = () => {
    router.push(`/create/${modelId}`);
  };

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

  const filledFields = Object.values(state.formData).filter(Boolean).length;
  const totalFields = state.categories.reduce((acc, cat) => acc + cat.fields.length, 0);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Particle Background */}
      <Particles />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium tracking-wider">EDIT</span>
          </button>

          <h1 className="text-xl font-bold">Preview Your Prompt</h1>

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
      <main className="flex-1 relative z-10 px-6 py-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-center gap-8"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--color-primary)]">
                {filledFields}
              </div>
              <div className="text-sm text-[var(--color-text-muted)]">
                Fields filled
              </div>
            </div>
            <div className="w-px h-12 bg-[var(--color-border)]" />
            <div className="text-center">
              <div className="text-3xl font-bold text-[var(--color-text-secondary)]">
                {prompt.length}
              </div>
              <div className="text-sm text-[var(--color-text-muted)]">
                Characters
              </div>
            </div>
          </motion.div>

          {/* Prompt Display */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-[var(--color-text-muted)] tracking-wider">
                {isJson ? 'JSON PROMPT' : 'NATURAL LANGUAGE PROMPT'}
              </h2>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-surface)] transition-colors"
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

            <div className="relative">
              <pre
                className={`
                  p-4 rounded-lg overflow-x-auto
                  bg-[var(--color-bg-deep)] border border-[var(--color-border)]
                  ${isJson ? 'text-sm font-mono' : 'text-base whitespace-pre-wrap'}
                  text-[var(--color-text-secondary)]
                `}
                style={{ maxHeight: '400px' }}
              >
                {prompt || (
                  <span className="text-[var(--color-text-muted)] italic">
                    No prompt data yet. Go back and fill in some fields!
                  </span>
                )}
              </pre>
            </div>
          </motion.div>

          {/* API Key Warning */}
          {!hasApiKey && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-start gap-4 p-4 rounded-lg bg-[var(--color-accent)]10 border border-[var(--color-accent)]40"
            >
              <AlertCircle className="w-5 h-5 text-[var(--color-accent)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-[var(--color-text-primary)]">
                  No API key configured for {modelNames[modelId]}
                </p>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  You can still copy the prompt, or{' '}
                  <button
                    onClick={() => router.push('/settings')}
                    className="text-[var(--color-primary)] hover:underline"
                  >
                    add your API key
                  </button>{' '}
                  to generate directly.
                </p>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              onClick={handleEdit}
              className="btn btn-ghost w-full sm:w-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft size={18} />
              <span>Edit Prompt</span>
            </motion.button>

            <motion.button
              onClick={handleGenerate}
              className="btn btn-primary w-full sm:w-auto px-8 animate-pulse-glow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isGenerating || !prompt}
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles size={18} />
                  </motion.div>
                  <span>Preparing...</span>
                </>
              ) : (
                <>
                  <Zap size={18} />
                  <span>{hasApiKey ? 'Generate' : 'Configure API Key'}</span>
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-4 text-sm"
          >
            <button
              onClick={() => reset()}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-secondary)] transition-colors"
            >
              Start Fresh
            </button>
            <span className="text-[var(--color-border)]">|</span>
            <button
              onClick={() => router.push('/create')}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
            >
              Change Model
            </button>
          </motion.div>
        </div>
      </main>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[var(--color-border)] opacity-20" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[var(--color-border)] opacity-20" />
    </div>
  );
}

export default function PreviewPage() {
  return (
    <WizardProvider>
      <PreviewContent />
    </WizardProvider>
  );
}
