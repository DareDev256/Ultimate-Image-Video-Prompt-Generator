'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, ChevronDown, Sparkles } from 'lucide-react';
import { WizardCategory } from '@/lib/categories';
import { useWizard } from '@/context/WizardContext';

interface WizardStepProps {
  category: WizardCategory;
  direction: number;
}

export function WizardStep({ category, direction }: WizardStepProps) {
  const { state, updateField } = useWizard();
  const [expandedField, setExpandedField] = useState<string | null>(null);

  const handleSuggestionClick = (fieldKey: string, suggestion: string) => {
    updateField(fieldKey, suggestion);
    setExpandedField(null);
  };

  const handleRandomize = (fieldKey: string, suggestions: string[]) => {
    const random = suggestions[Math.floor(Math.random() * suggestions.length)];
    updateField(fieldKey, random);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      custom={direction}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
      className="w-full"
    >
      {/* Category Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
          style={{
            background: 'linear-gradient(135deg, var(--color-bg-elevated) 0%, var(--color-bg-card) 100%)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 0 30px var(--color-primary-glow)',
          }}
        >
          <span className="text-3xl">{category.emoji}</span>
        </motion.div>
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white mb-2"
        >
          {category.name}
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[var(--color-text-secondary)]"
        >
          {category.description}
        </motion.p>
      </div>

      {/* Fields */}
      <div className="space-y-6">
        {category.fields.map((field, index) => (
          <motion.div
            key={field.key}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="relative"
          >
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              {field.label}
            </label>

            <div className="relative">
              {/* Input field */}
              <input
                type="text"
                value={state.formData[field.key] || ''}
                onChange={(e) => updateField(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="input pr-24"
              />

              {/* Action buttons */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {/* Suggestions dropdown toggle */}
                <button
                  type="button"
                  onClick={() => setExpandedField(expandedField === field.key ? null : field.key)}
                  className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors rounded"
                  title="Show suggestions"
                >
                  <motion.div
                    animate={{ rotate: expandedField === field.key ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </button>

                {/* Randomize button */}
                <button
                  type="button"
                  onClick={() => handleRandomize(field.key, field.suggestions)}
                  className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors rounded"
                  title="Random inspiration"
                >
                  <Shuffle size={18} />
                </button>
              </div>
            </div>

            {/* Suggestions dropdown */}
            <AnimatePresence>
              {expandedField === field.key && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 p-4 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
                    <div className="flex items-center gap-2 mb-3 text-xs text-[var(--color-text-muted)]">
                      <Sparkles size={12} className="text-[var(--color-accent)]" />
                      <span>Click to use or get inspired</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {field.suggestions.map((suggestion, i) => (
                        <motion.button
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.02 }}
                          type="button"
                          onClick={() => handleSuggestionClick(field.key, suggestion)}
                          className={`
                            px-3 py-1.5 text-sm rounded-full
                            border transition-all duration-200
                            ${
                              state.formData[field.key] === suggestion
                                ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                                : 'bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-white'
                            }
                          `}
                        >
                          {suggestion.length > 50 ? `${suggestion.slice(0, 50)}...` : suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
