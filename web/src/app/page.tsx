'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Particles } from '@/components/effects/Particles';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

export default function IntroPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<'loading' | 'reveal' | 'ready'>('loading');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [hasVisited, setHasVisited] = useState(false);

  // Check if user has visited before
  useEffect(() => {
    const visited = localStorage.getItem('hasVisited');
    setHasVisited(visited === 'true');

    const soundPref = localStorage.getItem('soundEnabled');
    setSoundEnabled(soundPref === 'true');
  }, []);

  // Theatrical loading sequence
  useEffect(() => {
    const loadingDuration = 2500; // 2.5 seconds of drama
    const interval = 50;
    const steps = loadingDuration / interval;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      // Eased progress - starts slow, speeds up, then slows at end
      const eased = 1 - Math.pow(1 - step / steps, 3);
      setLoadingProgress(Math.min(eased * 100, 100));

      if (step >= steps) {
        clearInterval(timer);
        setPhase('reveal');
        // Transition to ready after reveal animation
        setTimeout(() => setPhase('ready'), 1500);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const handleEnter = () => {
    localStorage.setItem('hasVisited', 'true');
    router.push('/create');
  };

  const handleSkip = () => {
    localStorage.setItem('hasVisited', 'true');
    router.push('/create');
  };

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('soundEnabled', String(newValue));
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Particle Background */}
      <Particles />

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
            top: '10%',
            left: '10%',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 0, 170, 0.15) 0%, transparent 70%)',
            bottom: '10%',
            right: '10%',
          }}
          animate={{
            x: [0, -80, 0],
            y: [0, -60, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255, 204, 0, 0.1) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Skip button - visible for returning users */}
      {hasVisited && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={handleSkip}
          className="absolute top-6 right-6 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] text-sm font-medium tracking-wider transition-colors z-20"
        >
          SKIP →
        </motion.button>
      )}

      {/* Sound toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={toggleSound}
        className="absolute top-6 left-6 p-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors z-20"
        title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
      >
        {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </motion.button>

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Loading Phase */}
          {phase === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              {/* Animated logo placeholder */}
              <motion.div
                className="w-24 h-24 mx-auto relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                <div className="absolute inset-0 rounded-full border-2 border-[var(--color-primary)] opacity-30" />
                <motion.div
                  className="absolute inset-2 rounded-full border-2 border-t-[var(--color-secondary)] border-r-transparent border-b-transparent border-l-transparent"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-4 rounded-full border-2 border-t-transparent border-r-[var(--color-accent)] border-b-transparent border-l-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
                <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-[var(--color-primary)]" />
              </motion.div>

              {/* Loading text */}
              <div className="space-y-2">
                <p className="text-[var(--color-text-muted)] text-sm tracking-[0.3em] uppercase font-medium">
                  Initializing Dream Machine
                </p>
                <motion.p
                  className="text-lcd"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  {Math.floor(loadingProgress)}%
                </motion.p>
              </div>

              {/* Progress bar */}
              <div className="max-w-md mx-auto">
                <div className="progress-container">
                  <motion.div
                    className="progress-bar progress-bar-animated"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
              </div>

              {/* Loading messages */}
              <div className="h-6">
                <motion.p
                  className="text-[var(--color-text-muted)] text-sm"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {loadingProgress < 30 && 'Calibrating neural pathways...'}
                  {loadingProgress >= 30 && loadingProgress < 60 && 'Loading imagination modules...'}
                  {loadingProgress >= 60 && loadingProgress < 90 && 'Syncing with creative engines...'}
                  {loadingProgress >= 90 && 'Almost ready...'}
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* Reveal & Ready Phase */}
          {(phase === 'reveal' || phase === 'ready') && (
            <motion.div
              key="content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              {/* Main title */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-4">
                  ULTIMATE
                  <br />
                  <span className="text-[var(--color-secondary)]">IMAGE</span>
                  <br />
                  GENERATOR
                </h1>
              </motion.div>

              {/* Tagline */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="text-xl md:text-2xl text-[var(--color-text-secondary)] font-light tracking-wide"
              >
                Image of your dreams
                <span className="text-[var(--color-accent)]">,</span> we walk you through it
              </motion.p>

              {/* Feature badges */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="flex flex-wrap justify-center gap-3 my-8"
              >
                {['NANO BANANA', 'DALL-E 3', 'KLING VIDEO'].map((badge, i) => (
                  <motion.span
                    key={badge}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1, type: 'spring', stiffness: 200 }}
                    className="px-4 py-2 text-xs font-bold tracking-wider bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-full text-[var(--color-text-secondary)]"
                  >
                    {badge}
                  </motion.span>
                ))}
              </motion.div>

              {/* Enter button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <motion.button
                  onClick={handleEnter}
                  className="btn btn-primary text-lg px-12 py-4 animate-pulse-glow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={phase !== 'ready'}
                >
                  <span>ENTER</span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </motion.button>
              </motion.div>

              {/* Decorative line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="max-w-xs mx-auto h-px bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent mt-12"
              />

              {/* Version badge */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="text-[var(--color-text-muted)] text-xs tracking-widest"
              >
                v2.0 • POWERED BY AI
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[var(--color-border)] opacity-30" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-[var(--color-border)] opacity-30" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-[var(--color-border)] opacity-30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[var(--color-border)] opacity-30" />

      {/* Scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none scanlines opacity-50" />
    </div>
  );
}
