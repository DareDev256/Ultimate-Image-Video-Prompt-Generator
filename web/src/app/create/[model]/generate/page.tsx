'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { Particles } from '@/components/effects/Particles';
import { ModelType } from '@/context/WizardContext';

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

  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

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

  const generate = useCallback(async () => {
    const prompt = localStorage.getItem('generatingPrompt');
    const apiKey = localStorage.getItem(`${modelId}ApiKey`);

    if (!prompt) {
      setError('No prompt found. Please go back and create one.');
      setIsGenerating(false);
      return;
    }

    if (!apiKey) {
      setError('No API key configured. Please add your API key in settings.');
      setIsGenerating(false);
      return;
    }

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
          apiKey,
        }),
      });

      clearInterval(progressInterval);
      clearInterval(messageInterval);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Generation failed');
      }

      const data = await response.json();

      // Store result and navigate
      localStorage.setItem('generationResult', JSON.stringify({
        prompt,
        result: data,
        model: modelId,
        timestamp: Date.now(),
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
  }, [modelId, router]);

  useEffect(() => {
    generate();
  }, [generate]);

  // If no API key or prompt, show error state
  useEffect(() => {
    const prompt = localStorage.getItem('generatingPrompt');
    const apiKey = localStorage.getItem(`${modelId}ApiKey`);

    if (!prompt || !apiKey) {
      setIsGenerating(false);
      if (!prompt) {
        setError('No prompt found. Please go back and create one.');
      } else if (!apiKey) {
        setError('No API key configured. Please add your API key in settings.');
      }
    }
  }, [modelId]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Particle Background */}
      <Particles />

      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            `radial-gradient(circle at 50% 50%, ${modelColors[modelId]}20 0%, transparent 50%)`,
            `radial-gradient(circle at 30% 70%, ${modelColors[modelId]}30 0%, transparent 50%)`,
            `radial-gradient(circle at 70% 30%, ${modelColors[modelId]}20 0%, transparent 50%)`,
            `radial-gradient(circle at 50% 50%, ${modelColors[modelId]}20 0%, transparent 50%)`,
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
                  style={{ borderColor: `${modelColors[modelId]}40` }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />

                {/* Middle ring */}
                <motion.div
                  className="absolute inset-4 rounded-full border-4 border-t-transparent border-l-transparent"
                  style={{ borderColor: modelColors[modelId] }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />

                {/* Inner ring */}
                <motion.div
                  className="absolute inset-8 rounded-full border-4 border-r-transparent border-b-transparent"
                  style={{ borderColor: `${modelColors[modelId]}80` }}
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
                    style={{ color: modelColors[modelId] }}
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
                  style={{ color: modelColors[modelId] }}
                >
                  {modelNames[modelId]}
                </h2>
              </div>

              {/* Progress bar */}
              <div className="progress-container">
                <motion.div
                  className="progress-bar"
                  style={{
                    background: `linear-gradient(90deg, ${modelColors[modelId]} 0%, ${modelColors[modelId]}80 100%)`,
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
