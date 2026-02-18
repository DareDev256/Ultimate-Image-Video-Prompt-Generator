'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Heart,
  Wrench,
  Shuffle,
  Download,
  Share2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Sparkles,
  Twitter,
  Link2,
  MessageCircle,
} from 'lucide-react';
import { Particles } from '@/components/effects/Particles';
import { ModelType } from '@/context/WizardContext';
import { MODEL_NAMES, MODEL_COLORS } from '@/lib/models';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

interface GenerationResult {
  prompt: string;
  result: {
    imageUrl?: string;
    videoUrl?: string;
    revisedPrompt?: string;
    seed?: number;
  };
  model: ModelType;
  timestamp: number;
}

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const modelId = params.model as ModelType;

  const [result, setResult] = useState<GenerationResult | null>(null);
  const [showPrompt, setShowPrompt] = useState(true);
  const { copied, copy: copyPrompt } = useCopyToClipboard();
  const { copied: linkCopied, copy: copyLink } = useCopyToClipboard();
  const [saved, setSaved] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const storedResult = localStorage.getItem('generationResult');
    if (storedResult) {
      const parsed = JSON.parse(storedResult) as GenerationResult;
      setResult(parsed);
    } else {
      // No result, redirect back
      router.push(`/create/${modelId}`);
    }
  }, [modelId, router]);

  const handleLoveIt = () => {
    if (!result) return;

    // Save to gallery
    const gallery = JSON.parse(localStorage.getItem('gallery') || '[]');
    const newItem = {
      id: Date.now().toString(),
      ...result,
      savedAt: Date.now(),
    };
    gallery.unshift(newItem);
    localStorage.setItem('gallery', JSON.stringify(gallery));
    setSaved(true);

    // Download
    handleDownload();
  };

  const handleTweakIt = () => {
    // Go back to wizard with same data
    router.push(`/create/${modelId}`);
  };

  const handleRemix = () => {
    // Randomize some fields and regenerate
    // For now, just go back to preview with a note to randomize
    localStorage.setItem('remixMode', 'true');
    router.push(`/create/${modelId}`);
  };

  const handleDownload = async () => {
    if (!result) return;

    const url = result.result.imageUrl || result.result.videoUrl;
    if (!url) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `generation-${result.timestamp}.${result.model === 'kling' ? 'mp4' : 'png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch {
      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  };

  const handleCopyPrompt = () => {
    if (!result) return;
    copyPrompt(result.prompt);
  };

  const handleShareToTwitter = () => {
    if (!result) return;
    const promptSnippet = result.prompt.length > 100
      ? result.prompt.substring(0, 100) + '...'
      : result.prompt;
    const text = `Just generated this with AI! 🎨\n\nPrompt: "${promptSnippet}"\n\nMade with Ultimate Image Generator`;
    const url = 'https://web-ten-vert-46.vercel.app';
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const handleShareToReddit = () => {
    if (!result) return;
    const title = `AI Generated Image - ${MODEL_NAMES[modelId]}`;
    const url = 'https://web-ten-vert-46.vercel.app';
    window.open(
      `https://reddit.com/submit?title=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  const handleCopyLink = () => {
    copyLink('https://web-ten-vert-46.vercel.app');
  };

  const handleStartFresh = () => {
    localStorage.removeItem('wizardState');
    localStorage.removeItem('generatingPrompt');
    localStorage.removeItem('generationResult');
    router.push('/create');
  };

  if (!result) {
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

  const mediaUrl = result.result.imageUrl || result.result.videoUrl;
  const isVideo = result.model === 'kling';

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Particle Background */}
      <Particles />

      {/* Success glow effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          background: `radial-gradient(circle at 50% 30%, ${MODEL_COLORS[modelId]}15 0%, transparent 50%)`,
        }}
      />

      {/* Header */}
      <header className="relative z-10 px-6 py-4 border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: MODEL_COLORS[modelId] }}
            />
            <span className="text-sm text-[var(--color-text-muted)]">
              Generated with {MODEL_NAMES[modelId]}
            </span>
          </motion.div>

          <motion.button
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            onClick={handleStartFresh}
            className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <Plus size={18} />
            <span className="text-sm font-medium tracking-wider">NEW</span>
          </motion.button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 px-6 py-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Result Display */}
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-xl overflow-hidden mb-8"
            style={{
              boxShadow: `0 0 60px ${MODEL_COLORS[modelId]}30`,
            }}
          >
            {isVideo ? (
              <video
                src={mediaUrl}
                controls
                autoPlay
                loop
                className="w-full aspect-video object-cover"
              />
            ) : (
              <div className="relative aspect-square w-full max-w-2xl mx-auto">
                {mediaUrl ? (
                  <Image
                    src={mediaUrl}
                    alt="Generated image"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--color-bg-surface)] flex items-center justify-center">
                    <p className="text-[var(--color-text-muted)]">
                      Image preview not available
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quick actions overlay */}
            <div className="absolute top-4 right-4 flex gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleDownload}
                className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
                title="Download"
              >
                <Download size={18} />
              </motion.button>
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
                  title="Share"
                >
                  <Share2 size={18} />
                </motion.button>

                {/* Share menu dropdown */}
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute top-full right-0 mt-2 w-48 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-xl overflow-hidden"
                  >
                    <button
                      onClick={() => { handleShareToTwitter(); setShowShareMenu(false); }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--color-bg-elevated)] transition-colors text-left"
                    >
                      <Twitter size={18} className="text-[#1DA1F2]" />
                      <span className="text-sm">Share to X</span>
                    </button>
                    <button
                      onClick={() => { handleShareToReddit(); setShowShareMenu(false); }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--color-bg-elevated)] transition-colors text-left"
                    >
                      <MessageCircle size={18} className="text-[#FF4500]" />
                      <span className="text-sm">Share to Reddit</span>
                    </button>
                    <button
                      onClick={() => { handleCopyLink(); setShowShareMenu(false); }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--color-bg-elevated)] transition-colors text-left"
                    >
                      {linkCopied ? (
                        <>
                          <Check size={18} className="text-[var(--color-success)]" />
                          <span className="text-sm text-[var(--color-success)]">Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Link2 size={18} className="text-[var(--color-text-muted)]" />
                          <span className="text-sm">Copy Link</span>
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            {saved && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-[var(--color-success)] text-white text-sm font-medium flex items-center gap-2"
              >
                <Check size={14} />
                Saved to Gallery
              </motion.div>
            )}
          </motion.div>

          {/* Action Buttons - The Main Event */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          >
            {/* Love It */}
            <motion.button
              onClick={handleLoveIt}
              className="relative group p-6 rounded-xl bg-[var(--color-bg-card)] border-2 border-[var(--color-success)] hover:bg-[var(--color-success)]10 transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                boxShadow: '0 0 30px rgba(0, 255, 136, 0.2)',
              }}
            >
              <div className="flex flex-col items-center gap-3">
                <Heart
                  size={32}
                  className="text-[var(--color-success)] group-hover:scale-110 transition-transform"
                  fill="currentColor"
                />
                <span className="text-lg font-bold text-[var(--color-success)]">
                  Love It
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  Download & save to gallery
                </span>
              </div>
            </motion.button>

            {/* Tweak It */}
            <motion.button
              onClick={handleTweakIt}
              className="relative group p-6 rounded-xl bg-[var(--color-bg-card)] border-2 border-[var(--color-primary)] hover:bg-[var(--color-primary)]10 transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                boxShadow: '0 0 30px rgba(0, 212, 255, 0.2)',
              }}
            >
              <div className="flex flex-col items-center gap-3">
                <Wrench
                  size={32}
                  className="text-[var(--color-primary)] group-hover:rotate-12 transition-transform"
                />
                <span className="text-lg font-bold text-[var(--color-primary)]">
                  Tweak It
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  Edit and regenerate
                </span>
              </div>
            </motion.button>

            {/* Remix */}
            <motion.button
              onClick={handleRemix}
              className="relative group p-6 rounded-xl bg-[var(--color-bg-card)] border-2 border-[var(--color-accent)] hover:bg-[var(--color-accent)]10 transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                boxShadow: '0 0 30px rgba(255, 204, 0, 0.2)',
              }}
            >
              <div className="flex flex-col items-center gap-3">
                <Shuffle
                  size={32}
                  className="text-[var(--color-accent)] group-hover:rotate-180 transition-transform duration-300"
                />
                <span className="text-lg font-bold text-[var(--color-accent)]">
                  Remix
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  Randomize & regenerate
                </span>
              </div>
            </motion.button>
          </motion.div>

          {/* Prompt Details (Collapsible) */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="card"
          >
            <button
              onClick={() => setShowPrompt(!showPrompt)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                View Prompt Used
              </span>
              <motion.div
                animate={{ rotate: showPrompt ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={20} className="text-[var(--color-text-muted)]" />
              </motion.div>
            </button>

            {showPrompt && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 pb-4"
              >
                <div className="relative">
                  <pre className="p-4 rounded-lg bg-[var(--color-bg-deep)] text-sm text-[var(--color-text-secondary)] overflow-x-auto whitespace-pre-wrap">
                    {result.prompt}
                  </pre>
                  <button
                    onClick={handleCopyPrompt}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-card)] transition-colors"
                  >
                    {copied ? (
                      <Check size={14} className="text-[var(--color-success)]" />
                    ) : (
                      <Copy size={14} className="text-[var(--color-text-muted)]" />
                    )}
                  </button>
                </div>

                {result.result.revisedPrompt && (
                  <div className="mt-4">
                    <p className="text-xs text-[var(--color-text-muted)] mb-2">
                      AI Revised Prompt:
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {result.result.revisedPrompt}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4 border-t border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-4 text-sm">
          <button
            onClick={() => router.push('/gallery')}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            View Gallery
          </button>
          <span className="text-[var(--color-border)]">|</span>
          <button
            onClick={handleStartFresh}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-secondary)] transition-colors"
          >
            Start Fresh
          </button>
        </div>
      </footer>
    </div>
  );
}
