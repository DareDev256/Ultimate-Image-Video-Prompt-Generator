'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle, ArrowLeft, Gift } from 'lucide-react';
import { Particles } from '@/components/effects/Particles';
import { ModelType } from '@/context/WizardContext';
import { MODEL_NAMES, MODEL_COLORS } from '@/lib/models';
import { useFreeTier } from '@/hooks/useFreeTier';

const loadingMessages = [
  'Initializing creative engine...',
  'Analyzing your vision...',
  'Consulting the muse...',
  'Mixing the perfect pixels...',
  'Adding a dash of magic...',
  'Rendering your dreams...',
  'Applying artistic touches...',
  'Finalizing masterpiece...',
  'Almost there...',
];

export default function GeneratePage() {
  const router = useRouter();
  const params = useParams();
  const modelId = params.model as ModelType;
  const { canUseFreeTier, remaining, incrementUsage, isLoaded } = useFreeTier();

  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [usingFreeTier, setUsingFreeTier] = useState(false);

  const generate = useCallback(async () => {
    const prompt = localStorage.getItem('generatingPrompt');
    const apiKey = localStorage.getItem(`${modelId}ApiKey`);
    const willUseFreeMode = !apiKey && modelId === 'nano-banana' && canUseFreeTier;

    if (!prompt) {
      setError('No prompt found. Please go back and create one.');
      setIsGenerating(false);
      return;
    }

    // Check if we can proceed with generation
    if (!apiKey && !willUseFreeMode) {
      if (modelId === 'nano-banana' && !canUseFreeTier) {
        setError('Daily free tier limit reached. Please add your own API key in settings or try again tomorrow.');
      } else if (modelId !== 'nano-banana') {
        setError('No API key configured. Free tier is only available for Nano Banana. Please add your API key in settings.');
      } else {
        setError('No API key configured. Please add your API key in settings.');
      }
      setIsGenerating(false);
      return;
    }

    setUsingFreeTier(willUseFreeMode);

    try {
      // Simulate progress while waiting for API
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);

      // Message cycling
      const messageInterval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);

      // Make API call
      const response = await fetch(`/api/generate/${modelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          apiKey: apiKey || undefined,
          useFreeMode: willUseFreeMode,
        }),
      });

      clearInterval(progressInterval);
      clearInterval(messageInterval);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Generation failed');
      }

      const data = await response.json();

      // Increment free tier usage if used
      if (willUseFreeMode) {
        incrementUsage();
      }

      // Store result and navigate
      localStorage.setItem('generationResult', JSON.stringify({
        prompt,
        result: data,
        model: modelId,
        timestamp: Date.now(),
        usedFreeTier: willUseFreeMode,
      }));

      setProgress(100);

      // Dramatic pause before showing result
      setTimeout(() => {
        router.push(`/create/${modelId}/result`);
      }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      setIsGenerating(false);
    }
  }, [modelId, router, canUseFreeTier, incrementUsage]);

  useEffect(() => {
    generate();
  }, [generate]);

  // Wait for free tier data to load before starting generation
  useEffect(() => {
    if (!isLoaded) return;

    const prompt = localStorage.getItem('generatingPrompt');
    const apiKey = localStorage.getItem(`${modelId}ApiKey`);
    const canUseFree = modelId === 'nano-banana' && canUseFreeTier;

    if (!prompt) {
      setIsGenerating(false);
      setError('No prompt found. Please go back and create one.');
    } else if (!apiKey && !canUseFree) {
      setIsGenerating(false);
      if (modelId === 'nano-banana') {
        setError('Daily free tier limit reached. Please add your own API key or try again tomorrow.');
      } else {
        setError('Free tier is only available for Nano Banana. Please add your API key in settings.');
      }
    }
  }, [modelId, isLoaded, canUseFreeTier]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Particle Background */}
      <Particles />

      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            `radial-gradient(circle at 50% 50%, ${MODEL_COLORS[modelId]}20 0%, transparent 50%)`,
            `radial-gradient(circle at 30% 70%, ${MODEL_COLORS[modelId]}30 0%, transparent 50%)`,
            `radial-gradient(circle at 70% 30%, ${MODEL_COLORS[modelId]}20 0%, transparent 50%)`,
            `radial-gradient(circle at 50% 50%, ${MODEL_COLORS[modelId]}20 0%, transparent 50%)`,
          ],
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-md w-full">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Animated spinner */}
              <div className="relative w-32 h-32 mx-auto">
                {/* Outer ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-4"
                  style={{ borderColor: `${MODEL_COLORS[modelId]}40` }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />

                {/* Middle ring */}
                <motion.div
                  className="absolute inset-4 rounded-full border-4 border-t-transparent border-l-transparent"
                  style={{ borderColor: MODEL_COLORS[modelId] }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />

                {/* Inner ring */}
                <motion.div
                  className="absolute inset-8 rounded-full border-4 border-r-transparent border-b-transparent"
                  style={{ borderColor: `${MODEL_COLORS[modelId]}80` }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />

                {/* Center icon */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Sparkles
                    className="w-8 h-8"
                    style={{ color: MODEL_COLORS[modelId] }}
                  />
                </motion.div>
              </div>

              {/* Model name */}
              <div>
                <motion.p
                  className="text-sm tracking-[0.3em] text-[var(--color-text-muted)] mb-2"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  GENERATING WITH
                </motion.p>
                <h2
                  className="text-2xl font-bold tracking-wide"
                  style={{ color: MODEL_COLORS[modelId] }}
                >
                  {MODEL_NAMES[modelId]}
                </h2>
                {usingFreeTier && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-1.5 mt-2"
                  >
                    <Gift size={14} className="text-[var(--color-accent)]" />
                    <span className="text-xs text-[var(--color-accent)]">
                      Free tier ({remaining} left today)
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Progress bar */}
              <div className="progress-container">
                <motion.div
                  className="progress-bar"
                  style={{
                    background: `linear-gradient(90deg, ${MODEL_COLORS[modelId]} 0%, ${MODEL_COLORS[modelId]}80 100%)`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Loading message */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={messageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-[var(--color-text-secondary)] h-6"
                >
                  {loadingMessages[messageIndex]}
                </motion.p>
              </AnimatePresence>

              {/* Progress percentage */}
              <p className="text-lcd text-xl">
                {Math.floor(progress)}%
              </p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 100, 100, 0.1)' }}
              >
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Generation Failed
                </h2>
                <p className="text-[var(--color-text-secondary)]">{error}</p>
              </div>

              <div className="flex flex-col gap-3">
                <motion.button
                  onClick={() => router.push(`/create/${modelId}/preview`)}
                  className="btn btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowLeft size={18} />
                  <span>Back to Preview</span>
                </motion.button>

                <motion.button
                  onClick={() => router.push('/settings')}
                  className="btn btn-ghost"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Configure API Keys
                </motion.button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[var(--color-border)] opacity-20" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[var(--color-border)] opacity-20" />
    </div>
  );
}
