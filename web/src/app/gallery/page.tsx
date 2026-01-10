'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  ArrowLeft,
  Download,
  Trash2,
  Copy,
  Check,
  X,
  ImageIcon,
  Video,
  Sparkles,
  Plus,
} from 'lucide-react';
import { Particles } from '@/components/effects/Particles';
import { ModelType } from '@/context/WizardContext';

interface GalleryItem {
  id: string;
  prompt: string;
  result: {
    imageUrl?: string;
    videoUrl?: string;
    revisedPrompt?: string;
  };
  model: ModelType;
  timestamp: number;
  savedAt: number;
}

export default function GalleryPage() {
  const router = useRouter();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [copied, setCopied] = useState(false);

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

  useEffect(() => {
    const gallery = JSON.parse(localStorage.getItem('gallery') || '[]');
    setItems(gallery);
  }, []);

  const handleDelete = (id: string) => {
    const newItems = items.filter((item) => item.id !== id);
    setItems(newItems);
    localStorage.setItem('gallery', JSON.stringify(newItems));
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const handleDownload = async (item: GalleryItem) => {
    const url = item.result.imageUrl || item.result.videoUrl;
    if (!url) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `generation-${item.timestamp}.${item.model === 'kling' ? 'mp4' : 'png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  const handleCopyPrompt = async (prompt: string) => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Particle Background */}
      <Particles />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/create')}
            className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium tracking-wider">CREATE</span>
          </button>

          <h1 className="text-xl font-bold">Your Gallery</h1>

          <div className="text-sm text-[var(--color-text-muted)]">
            {items.length} {items.length === 1 ? 'creation' : 'creations'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 px-6 py-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {items.length === 0 ? (
            // Empty state
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-center">
                <ImageIcon size={32} className="text-[var(--color-text-muted)]" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No creations yet</h2>
              <p className="text-[var(--color-text-secondary)] mb-8">
                Start generating and save your favorites here
              </p>
              <motion.button
                onClick={() => router.push('/create')}
                className="btn btn-primary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={18} />
                <span>Create Something</span>
              </motion.button>
            </motion.div>
          ) : (
            // Gallery grid
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item, index) => {
                const mediaUrl = item.result.imageUrl || item.result.videoUrl;
                const isVideo = item.model === 'kling';

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    {/* Thumbnail */}
                    {isVideo ? (
                      <video
                        src={mediaUrl}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        onMouseOver={(e) => e.currentTarget.play()}
                        onMouseOut={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                      />
                    ) : mediaUrl ? (
                      <Image
                        src={mediaUrl}
                        alt="Generated image"
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--color-bg-surface)] flex items-center justify-center">
                        <ImageIcon className="text-[var(--color-text-muted)]" />
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="flex items-center justify-between">
                          <span
                            className="px-2 py-0.5 text-xs font-bold rounded-full"
                            style={{
                              backgroundColor: `${modelColors[item.model]}30`,
                              color: modelColors[item.model],
                            }}
                          >
                            {modelNames[item.model]}
                          </span>
                          {isVideo && (
                            <Video size={14} className="text-white" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full max-h-[90vh] bg-[var(--color-bg-card)] rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col md:flex-row h-full">
                {/* Media */}
                <div className="relative md:w-2/3 aspect-square md:aspect-auto bg-black">
                  {selectedItem.model === 'kling' ? (
                    <video
                      src={selectedItem.result.videoUrl}
                      controls
                      autoPlay
                      loop
                      className="w-full h-full object-contain"
                    />
                  ) : selectedItem.result.imageUrl ? (
                    <Image
                      src={selectedItem.result.imageUrl}
                      alt="Generated image"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  ) : null}
                </div>

                {/* Details */}
                <div className="md:w-1/3 p-6 overflow-y-auto">
                  <div className="space-y-4">
                    {/* Model badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className="px-3 py-1 text-sm font-bold rounded-full"
                        style={{
                          backgroundColor: `${modelColors[selectedItem.model]}20`,
                          color: modelColors[selectedItem.model],
                        }}
                      >
                        {modelNames[selectedItem.model]}
                      </span>
                    </div>

                    {/* Date */}
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {formatDate(selectedItem.savedAt)}
                    </p>

                    {/* Prompt */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">
                          Prompt
                        </h3>
                        <button
                          onClick={() => handleCopyPrompt(selectedItem.prompt)}
                          className="p-1.5 rounded text-[var(--color-text-muted)] hover:text-white transition-colors"
                        >
                          {copied ? (
                            <Check size={14} className="text-[var(--color-success)]" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                      <pre className="p-3 rounded-lg bg-[var(--color-bg-deep)] text-sm text-[var(--color-text-secondary)] overflow-x-auto whitespace-pre-wrap max-h-48">
                        {selectedItem.prompt}
                      </pre>
                    </div>

                    {/* Revised prompt (if available) */}
                    {selectedItem.result.revisedPrompt && (
                      <div>
                        <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                          AI Revised Prompt
                        </h3>
                        <p className="text-sm text-[var(--color-text-muted)]">
                          {selectedItem.result.revisedPrompt}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                      <motion.button
                        onClick={() => handleDownload(selectedItem)}
                        className="btn btn-primary flex-1"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Download size={16} />
                        <span>Download</span>
                      </motion.button>
                      <motion.button
                        onClick={() => handleDelete(selectedItem.id)}
                        className="btn btn-ghost text-red-400 hover:bg-red-500/10"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>

                    {/* Regenerate */}
                    <motion.button
                      onClick={() => {
                        localStorage.setItem('generatingPrompt', selectedItem.prompt);
                        router.push(`/create/${selectedItem.model}/generate`);
                      }}
                      className="btn btn-ghost w-full"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Sparkles size={16} />
                      <span>Regenerate</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[var(--color-border)] opacity-20" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[var(--color-border)] opacity-20" />
    </div>
  );
}
