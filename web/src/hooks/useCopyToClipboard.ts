import { useState, useCallback, useRef } from 'react';

/**
 * Copies text to the clipboard and tracks a transient `copied` state
 * that resets after `timeout` ms (default 2 000).
 */
export function useCopyToClipboard(timeout = 2000) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const copy = useCallback(
    async (text: string) => {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), timeout);
    },
    [timeout],
  );

  return { copied, copy } as const;
}
