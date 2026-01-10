'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface SoundContextType {
  enabled: boolean;
  toggle: () => void;
  play: (sound: string) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [audioElements, setAudioElements] = useState<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    // Load preference from localStorage
    const stored = localStorage.getItem('soundEnabled');
    setEnabled(stored === 'true');

    // Pre-load audio elements
    const sounds = new Map<string, HTMLAudioElement>();
    const soundFiles = ['click', 'whoosh', 'hover', 'success', 'processing'];

    soundFiles.forEach((name) => {
      const audio = new Audio(`/sounds/${name}.mp3`);
      audio.preload = 'auto';
      audio.volume = name === 'hover' ? 0.2 : 0.5;
      sounds.set(name, audio);
    });

    setAudioElements(sounds);
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('soundEnabled', String(next));
      return next;
    });
  }, []);

  const play = useCallback(
    (sound: string) => {
      if (!enabled) return;

      const audio = audioElements.get(sound);
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {
          // Ignore autoplay errors
        });
      }
    },
    [enabled, audioElements]
  );

  return (
    <SoundContext.Provider value={{ enabled, toggle, play }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider');
  }
  return context;
}
