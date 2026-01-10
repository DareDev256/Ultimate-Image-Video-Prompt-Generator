'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Eye, Sparkles } from 'lucide-react';
import { Particles } from '@/components/effects/Particles';
import { WizardProgress } from '@/components/wizard/WizardProgress';
import { WizardStep } from '@/components/wizard/WizardStep';
import { WizardProvider, useWizard, ModelType } from '@/context/WizardContext';

function WizardContent() {
  const router = useRouter();
  const params = useParams();
  const modelId = params.model as ModelType;

  const {
    state,
    currentCategory,
    totalSteps,
    isFirstStep,
    isLastStep,
    setModel,
    nextStep,
    prevStep,
  } = useWizard();

  const [direction, setDirection] = useState(0);

  // Initialize model on mount
  useEffect(() => {
    if (modelId && ['nano-banana', 'openai', 'kling'].includes(modelId)) {
      setModel(modelId);
    } else {
      router.push('/create');
    }
  }, [modelId, setModel, router]);

  const handleNext = useCallback(() => {
    setDirection(1);
    if (isLastStep) {
      // Go to preview page
      router.push(`/create/${modelId}/preview`);
    } else {
      nextStep();
    }
  }, [isLastStep, nextStep, router, modelId]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    if (isFirstStep) {
      router.push('/create');
    } else {
      prevStep();
    }
  }, [isFirstStep, prevStep, router]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

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

  if (!currentCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-8 h-8 text-[var(--color-primary)]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Particle Background */}
      <Particles />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handlePrev}
            className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium tracking-wider">
              {isFirstStep ? 'MODELS' : 'BACK'}
            </span>
          </button>

          <div className="flex items-center gap-3">
            <span
              className="px-3 py-1 text-xs font-bold tracking-wider rounded-full"
              style={{
                backgroundColor: `${modelColors[modelId]}20`,
                color: modelColors[modelId],
                border: `1px solid ${modelColors[modelId]}40`,
              }}
            >
              {modelNames[modelId]}
            </span>
          </div>

          <button
            onClick={() => router.push(`/create/${modelId}/preview`)}
            className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <Eye size={20} />
            <span className="text-sm font-medium tracking-wider">PREVIEW</span>
          </button>
        </div>
      </header>

      {/* Progress */}
      <div className="relative z-10 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <WizardProgress />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 relative z-10 px-6 py-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="popLayout" custom={direction}>
            <WizardStep
              key={currentCategory.id}
              category={currentCategory}
              direction={direction}
            />
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="relative z-10 px-6 py-6 border-t border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Previous button */}
          <motion.button
            onClick={handlePrev}
            className="btn btn-ghost"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft size={18} />
            <span>{isFirstStep ? 'Change Model' : 'Previous'}</span>
          </motion.button>

          {/* Step indicator */}
          <div className="text-[var(--color-text-muted)] text-sm">
            Step {state.currentStep + 1} of {totalSteps}
          </div>

          {/* Next button */}
          <motion.button
            onClick={handleNext}
            className={`btn ${isLastStep ? 'btn-secondary' : 'btn-primary'}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{isLastStep ? 'Preview' : 'Next'}</span>
            {isLastStep ? <Eye size={18} /> : <ArrowRight size={18} />}
          </motion.button>
        </div>
      </footer>

      {/* Keyboard hints */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-[var(--color-text-muted)] text-xs opacity-50">
        Use ← → arrows or Enter to navigate
      </div>
    </div>
  );
}

export default function WizardPage() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
}
