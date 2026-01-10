'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useWizard } from '@/context/WizardContext';

export function WizardProgress() {
  const { state, totalSteps, goToStep } = useWizard();
  const { currentStep, categories } = state;

  // Show condensed view on mobile
  return (
    <div className="w-full">
      {/* Desktop: Full progress with dots */}
      <div className="hidden md:flex items-center justify-center gap-2">
        {categories.map((cat, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;

          return (
            <div key={cat.id} className="flex items-center">
              {/* Step dot */}
              <motion.button
                onClick={() => goToStep(index)}
                className={`
                  relative flex items-center justify-center
                  w-10 h-10 rounded-full
                  transition-all duration-300
                  ${isCompleted || isActive ? 'cursor-pointer' : 'cursor-default'}
                `}
                style={{
                  background: isActive
                    ? 'var(--color-primary)'
                    : isCompleted
                    ? 'var(--color-success)'
                    : 'var(--color-bg-surface)',
                  border: `2px solid ${
                    isActive
                      ? 'var(--color-primary)'
                      : isCompleted
                      ? 'var(--color-success)'
                      : 'var(--color-border)'
                  }`,
                  boxShadow: isActive
                    ? '0 0 20px var(--color-primary-glow)'
                    : isCompleted
                    ? '0 0 15px var(--color-success-glow)'
                    : 'none',
                }}
                whileHover={{ scale: isCompleted || isActive ? 1.1 : 1 }}
                whileTap={{ scale: isCompleted || isActive ? 0.95 : 1 }}
              >
                {isCompleted ? (
                  <Check size={16} className="text-white" />
                ) : (
                  <span className="text-xs">{cat.emoji}</span>
                )}

                {/* Tooltip */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  <span className="text-xs text-[var(--color-text-muted)]">{cat.name}</span>
                </div>
              </motion.button>

              {/* Connector line */}
              {index < categories.length - 1 && (
                <div className="w-4 h-0.5 mx-1">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: index < currentStep
                        ? 'var(--color-success)'
                        : 'var(--color-border)',
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.05 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: Condensed progress bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[var(--color-text-muted)]">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-sm font-medium text-[var(--color-primary)]">
            {categories[currentStep]?.name}
          </span>
        </div>
        <div className="progress-container h-3">
          <motion.div
            className="progress-bar"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}
