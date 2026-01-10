'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Key,
  Eye,
  EyeOff,
  Check,
  ExternalLink,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Particles } from '@/components/effects/Particles';

interface ApiKeyConfig {
  id: string;
  name: string;
  description: string;
  placeholder: string;
  docsUrl: string;
  color: string;
}

const apiKeys: ApiKeyConfig[] = [
  {
    id: 'nano-banana',
    name: 'Nano Banana (Gemini)',
    description: 'Google Gemini API key for image generation',
    placeholder: 'AIza...',
    docsUrl: 'https://ai.google.dev/tutorials/setup',
    color: '#00d4ff',
  },
  {
    id: 'openai',
    name: 'OpenAI (DALL-E 3)',
    description: 'OpenAI API key for DALL-E image generation',
    placeholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
    color: '#00ff88',
  },
  {
    id: 'kling',
    name: 'Kling',
    description: 'Kling AI API key for video generation',
    placeholder: 'Enter your Kling API key',
    docsUrl: 'https://klingai.com',
    color: '#ff00aa',
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  // Load keys from localStorage
  useEffect(() => {
    const loadedKeys: Record<string, string> = {};
    apiKeys.forEach((config) => {
      const key = localStorage.getItem(`${config.id}ApiKey`);
      if (key) {
        loadedKeys[config.id] = key;
      }
    });
    setKeys(loadedKeys);
  }, []);

  const handleSave = (id: string) => {
    const key = keys[id];
    if (key) {
      localStorage.setItem(`${id}ApiKey`, key);
      setSaved((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setSaved((prev) => ({ ...prev, [id]: false }));
      }, 2000);
    }
  };

  const handleDelete = (id: string) => {
    localStorage.removeItem(`${id}ApiKey`);
    setKeys((prev) => {
      const newKeys = { ...prev };
      delete newKeys[id];
      return newKeys;
    });
  };

  const toggleShowKey = (id: string) => {
    setShowKey((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Particle Background */}
      <Particles />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 border-b border-[var(--color-border)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium tracking-wider">BACK</span>
          </button>

          <h1 className="text-xl font-bold">Settings</h1>

          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 px-6 py-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Info Banner */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-start gap-4 p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]"
          >
            <Key className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-[var(--color-text-primary)] mb-1">
                Your API keys are stored locally in your browser
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Keys are never sent to our servers. They&apos;re used only to make
                direct API calls from your browser to the respective services.
              </p>
            </div>
          </motion.div>

          {/* API Key Cards */}
          <div className="space-y-4">
            {apiKeys.map((config, index) => (
              <motion.div
                key={config.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: `${config.color}20`,
                      }}
                    >
                      <Key size={20} style={{ color: config.color }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{config.name}</h3>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {config.description}
                      </p>
                    </div>
                  </div>

                  <a
                    href={config.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                  >
                    Get key
                    <ExternalLink size={12} />
                  </a>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type={showKey[config.id] ? 'text' : 'password'}
                      value={keys[config.id] || ''}
                      onChange={(e) =>
                        setKeys((prev) => ({
                          ...prev,
                          [config.id]: e.target.value,
                        }))
                      }
                      placeholder={config.placeholder}
                      className="input pr-24"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleShowKey(config.id)}
                        className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                      >
                        {showKey[config.id] ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                      {keys[config.id] && (
                        <button
                          type="button"
                          onClick={() => handleDelete(config.id)}
                          className="p-2 text-[var(--color-text-muted)] hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {keys[config.id] ? (
                        <span className="flex items-center gap-1 text-xs text-[var(--color-success)]">
                          <Check size={12} />
                          Key configured
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                          <AlertCircle size={12} />
                          No key set
                        </span>
                      )}
                    </div>

                    <motion.button
                      onClick={() => handleSave(config.id)}
                      disabled={!keys[config.id]}
                      className="btn btn-primary text-sm px-4 py-2"
                      style={{
                        background: saved[config.id]
                          ? 'var(--color-success)'
                          : undefined,
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {saved[config.id] ? (
                        <>
                          <Check size={14} />
                          Saved
                        </>
                      ) : (
                        'Save'
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Free Tier Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-xl bg-gradient-to-r from-[var(--color-primary)]10 to-[var(--color-secondary)]10 border border-[var(--color-border)]"
          >
            <h3 className="font-bold text-white mb-2">About Free Tier</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              This app offers a hybrid model: use your own API keys for unlimited
              generations, or enjoy 3 free generations per day using our shared
              quota.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-[var(--color-bg-surface)]">
                <div className="text-2xl font-bold text-[var(--color-primary)]">3</div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  Free daily
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-bg-surface)]">
                <div className="text-2xl font-bold text-[var(--color-success)]">∞</div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  With your keys
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-bg-surface)]">
                <div className="text-2xl font-bold text-[var(--color-accent)]">0</div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  Data stored
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[var(--color-border)] opacity-20" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[var(--color-border)] opacity-20" />
    </div>
  );
}
