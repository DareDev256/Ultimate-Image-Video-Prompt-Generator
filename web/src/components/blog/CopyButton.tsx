'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyButton({ text, accent }: { text: string; accent: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs uppercase tracking-wider transition-all"
      style={{
        borderColor: copied ? 'var(--color-success)' : 'var(--color-border)',
        color: copied ? 'var(--color-success)' : 'var(--color-text-secondary)',
        fontFamily: 'var(--font-display)',
        boxShadow: copied ? '0 0 12px var(--color-success-glow)' : 'none',
      }}
      aria-label={copied ? 'Copied' : 'Copy prompt'}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
      <span className="sr-only">{accent}</span>
    </button>
  );
}
