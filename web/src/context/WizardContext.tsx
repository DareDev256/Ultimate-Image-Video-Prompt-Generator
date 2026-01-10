'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { WizardCategory, getCategoriesForModel } from '@/lib/categories';

export type ModelType = 'nano-banana' | 'openai' | 'kling';

interface WizardState {
  model: ModelType;
  currentStep: number;
  formData: Record<string, string>;
  categories: WizardCategory[];
}

interface WizardContextType {
  state: WizardState;
  currentCategory: WizardCategory | null;
  totalSteps: number;
  progress: number;
  isFirstStep: boolean;
  isLastStep: boolean;

  // Actions
  setModel: (model: ModelType) => void;
  restoreState: (savedState: WizardState) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  updateField: (key: string, value: string) => void;
  reset: () => void;
  getFormattedPrompt: () => string;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

const initialState: WizardState = {
  model: 'nano-banana',
  currentStep: 0,
  formData: {},
  categories: [],
};

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WizardState>(initialState);

  const setModel = useCallback((model: ModelType) => {
    const isVideo = model === 'kling';
    const categories = getCategoriesForModel(isVideo ? 'video' : 'image');
    setState({
      model,
      currentStep: 0,
      formData: {},
      categories,
    });
  }, []);

  const restoreState = useCallback((savedState: WizardState) => {
    // Restore state from localStorage, but regenerate categories
    const isVideo = savedState.model === 'kling';
    const categories = getCategoriesForModel(isVideo ? 'video' : 'image');
    setState({
      ...savedState,
      categories,
    });
  }, []);

  const nextStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.categories.length - 1),
    }));
  }, []);

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, Math.min(step, prev.categories.length - 1)),
    }));
  }, []);

  const updateField = useCallback((key: string, value: string) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [key]: value,
      },
    }));
  }, []);

  const reset = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: 0,
      formData: {},
    }));
  }, []);

  const getFormattedPrompt = useCallback(() => {
    const { formData, model } = state;

    if (model === 'nano-banana') {
      // JSON format for Nano Banana
      const prompt: Record<string, unknown> = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          const parts = key.split('.');
          let current = prompt;
          for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
              current[parts[i]] = {};
            }
            current = current[parts[i]] as Record<string, unknown>;
          }
          current[parts[parts.length - 1]] = value;
        }
      });
      return JSON.stringify(prompt, null, 2);
    } else {
      // Natural language format for OpenAI and Kling
      const parts: string[] = [];

      // Subject
      if (formData['subject.description']) {
        parts.push(formData['subject.description']);
      }
      if (formData['subject.expression']) {
        parts.push(`with ${formData['subject.expression'].toLowerCase()} expression`);
      }

      // Style
      if (formData['clothing.main']) {
        parts.push(`wearing ${formData['clothing.main'].toLowerCase()}`);
      }
      if (formData['clothing.accessories']) {
        parts.push(`with ${formData['clothing.accessories'].toLowerCase()}`);
      }

      // Setting
      if (formData['environment.location']) {
        parts.push(`in ${formData['environment.location'].toLowerCase()}`);
      }
      if (formData['environment.condition']) {
        parts.push(`(${formData['environment.condition'].toLowerCase()})`);
      }

      // Lighting
      if (formData['lighting.source']) {
        parts.push(`lit by ${formData['lighting.source'].toLowerCase()}`);
      }
      if (formData['lighting.mood']) {
        parts.push(`with ${formData['lighting.mood'].toLowerCase()} quality`);
      }

      // Camera
      if (formData['camera.position']) {
        parts.push(`shot from ${formData['camera.position'].toLowerCase()}`);
      }
      if (formData['camera.lens']) {
        parts.push(`using ${formData['camera.lens']}`);
      }

      // Mood
      if (formData['atmosphere.mood']) {
        parts.push(`conveying ${formData['atmosphere.mood'].toLowerCase()}`);
      }
      if (formData['atmosphere.elements']) {
        parts.push(`with ${formData['atmosphere.elements'].toLowerCase()}`);
      }

      // Color
      if (formData['color.grade']) {
        parts.push(`${formData['color.grade'].toLowerCase()} color grade`);
      }

      // Film
      if (formData['film.grain']) {
        parts.push(`${formData['film.grain'].toLowerCase()}`);
      }
      if (formData['film.format']) {
        parts.push(`${formData['film.format'].toLowerCase()} format`);
      }

      // Vibes
      if (formData['vibes.reference']) {
        parts.push(`in the style of ${formData['vibes.reference']}`);
      }
      if (formData['vibes.description']) {
        parts.push(`- ${formData['vibes.description']}`);
      }

      // Video-specific (Kling)
      if (model === 'kling') {
        if (formData['motion.camera']) {
          parts.push(`camera: ${formData['motion.camera'].toLowerCase()}`);
        }
        if (formData['motion.subject']) {
          parts.push(`subject action: ${formData['motion.subject'].toLowerCase()}`);
        }
        if (formData['duration.pacing']) {
          parts.push(`${formData['duration.pacing'].toLowerCase()}`);
        }
      }

      return parts.filter(Boolean).join(', ');
    }
  }, [state]);

  const currentCategory = useMemo(() => {
    return state.categories[state.currentStep] || null;
  }, [state.categories, state.currentStep]);

  const totalSteps = state.categories.length;
  const progress = totalSteps > 0 ? ((state.currentStep + 1) / totalSteps) * 100 : 0;
  const isFirstStep = state.currentStep === 0;
  const isLastStep = state.currentStep === totalSteps - 1;

  const value: WizardContextType = {
    state,
    currentCategory,
    totalSteps,
    progress,
    isFirstStep,
    isLastStep,
    setModel,
    restoreState,
    nextStep,
    prevStep,
    goToStep,
    updateField,
    reset,
    getFormattedPrompt,
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}
