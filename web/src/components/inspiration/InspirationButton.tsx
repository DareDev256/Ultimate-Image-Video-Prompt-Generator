'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { InspirationPanel } from './InspirationPanel';
import type { ImagePrompt, VideoPrompt } from '@/hooks/useInspirationData';

interface InspirationButtonProps {
  onUseAsTemplate?: (prompt: ImagePrompt | VideoPrompt, type: 'image' | 'video') => void;
}

export function InspirationButton({ onUseAsTemplate }: InspirationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-black font-semibold shadow-lg hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Sparkles size={18} />
        <span className="hidden sm:inline">Inspiration</span>
      </motion.button>

      {/* Panel */}
      <InspirationPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onUseAsTemplate={onUseAsTemplate}
      />
    </>
  );
}
