'use client';

/**
 * Swipe feed (v2.3.0, plan A1): one real output per screen, the phrase that
 * made it highlighted, one line on why it works, and a Remix sheet that turns
 * the move into your own prompt in three taps. Built for a thumb: scroll-snap,
 * 44px targets, nothing to read before the first swipe.
 */

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { SwipeCard } from '@/lib/swipe-types';

const ONBOARD_KEY = 'uivpg.swipe.onboarded.v1';
const LIGHT = ['soft window light', 'hard top key light with rim lights', 'neon reflections on wet streets', 'golden hour backlight'];
const LENS = ['35mm film, slight grain', '85mm lens, shallow depth of field', 'wide 24mm lens', 'overhead flat lay'];

function readFlag(key: string): boolean {
  try {
    return window.localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}
const noSubscribe = () => () => {};
function writeFlag(key: string) {
  try {
    window.localStorage.setItem(key, '1');
  } catch {
    /* private mode: the overlay just shows again next time */
  }
}

const Icon = {
  remix: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4v6h6" /><path d="M20 20v-6h-6" /><path d="M20 10a8 8 0 0 0-14-3L4 10" /><path d="M4 14a8 8 0 0 0 14 3l2-3" /></svg>
  ),
  copy: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a1 1 0 0 1 1-1h10" /></svg>
  ),
  full: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14" /><path d="M5 12h14" /><path d="M5 18h9" /></svg>
  ),
  credit: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
  ),
};

type Sheet = { kind: 'remix'; i: number; picks: string[] } | { kind: 'full'; i: number } | null;

export function SwipeFeed({ cards, totalPrompts, framed = false }: { cards: SwipeCard[]; totalPrompts: number; framed?: boolean }) {
  const router = useRouter();
  const scroller = useRef<HTMLDivElement>(null);
  // Seen-before flag read without a setState-in-effect: the server snapshot
  // says "seen" so the overlay never flashes for returning visitors.
  const seen = useSyncExternalStore(noSubscribe, () => readFlag(ONBOARD_KEY), () => true);
  const [dismissed, setDismissed] = useState(false);
  const onboard = !seen && !dismissed;
  const [sheet, setSheet] = useState<Sheet>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const say = useCallback((t: string) => {
    setToast(t);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1600);
  }, []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        say('Prompt copied');
      } catch {
        say('Copy is blocked here');
      }
    },
    [say],
  );

  const start = () => {
    writeFlag(ONBOARD_KEY);
    setDismissed(true);
    scroller.current?.focus({ preventScroll: true });
  };

  // Keyboard: arrows / j k move one card; Escape closes a sheet.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSheet(null);
        return;
      }
      if (sheet || onboard) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      const el = scroller.current;
      if (!el) return;
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        el.scrollBy({ top: el.clientHeight, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        el.scrollBy({ top: -el.clientHeight, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheet, onboard]);

  const built = (c: SwipeCard, picks: string[]) => {
    const [subject, light, lens] = picks;
    return [subject ?? '…', c.hit, [light ?? '…', lens ?? '…'].join(', ')].join('. ') + '.';
  };

  const makeIt = (prompt: string) => {
    try {
      window.localStorage.setItem('generatingPrompt', prompt);
    } catch {
      say('Storage is blocked here, so copy it instead');
      return;
    }
    router.push('/create/nano-banana/generate');
  };

  return (
    <div className={`swipe-root ${framed ? 'swipe-framed' : ''}`}>
      <div className="swipe-device">
        <div
          ref={scroller}
          className="swipe-scroller"
          tabIndex={0}
          aria-label="Prompt feed. Swipe up or use the arrow keys for the next card."
        >
          {cards.map((c, i) => (
            <article key={c.id} className="swipe-card" aria-label={`Card ${i + 1} of ${cards.length}: ${c.ing}`}>
              <Image src={c.img} alt="" fill sizes="64px" className="swipe-backdrop" aria-hidden="true" />
              <Image
                src={c.img}
                alt={`AI image made with ${c.model}. The prompt's key phrase: ${c.hit}`}
                fill
                sizes="(max-width: 520px) 100vw, 520px"
                className="swipe-photo"
                priority={i === 0}
              />
              <div className="swipe-shade" aria-hidden="true" />

              <div className="swipe-rail">
                <button type="button" className="swipe-act is-primary" onClick={() => setSheet({ kind: 'remix', i, picks: [] })}>
                  <span className="swipe-ic">{Icon.remix}</span>Remix
                </button>
                <button type="button" className="swipe-act" onClick={() => copy(c.full)}>
                  <span className="swipe-ic">{Icon.copy}</span>Copy
                </button>
                <button type="button" className="swipe-act" onClick={() => setSheet({ kind: 'full', i })}>
                  <span className="swipe-ic">{Icon.full}</span>Prompt
                </button>
                <a className="swipe-act" href={c.byUrl} target="_blank" rel="noopener noreferrer">
                  <span className="swipe-ic">{Icon.credit}</span>Creator
                </a>
              </div>

              <div className="swipe-teach">
                <span className="swipe-ing">{c.ing}</span>
                <p className="swipe-pr">
                  “{c.pre}
                  <mark>{c.hit}</mark>
                  {c.post}”
                </p>
                <p className="swipe-why">{c.why}</p>
                <span className="swipe-by">
                  {c.by} · {c.model} · {i + 1}/{cards.length}
                </span>
              </div>
            </article>
          ))}

          <article className="swipe-card swipe-end" aria-label="End of the feed">
            <div className="swipe-end-inner">
              <span className="swipe-ing">That is {cards.length} moves</span>
              <h2>Now make your own.</h2>
              <p>The full library holds {totalPrompts.toLocaleString('en-US')} prompts, every one credited to its creator.</p>
              <Link href="/create/nano-banana" className="swipe-btn">Prompt</Link>
              <Link href="/feed" className="swipe-btn is-ghost">Browse every prompt</Link>
              <Link href="/blur-face-in-photo" className="swipe-btn is-ghost">Blur a face in a photo</Link>
            </div>
          </article>
        </div>

        <nav className="swipe-top" aria-label="Sections">
          <Link href="/create/nano-banana">Prompt</Link>
          <span className="is-on" aria-current="page">Learn</span>
          <Link href="/blur-face-in-photo">Blur</Link>
        </nav>

        {onboard && (
          <div className="swipe-onboard" role="dialog" aria-modal="true" aria-labelledby="swipe-onboard-h">
            <h2 id="swipe-onboard-h">Swipe a shot to learn the move</h2>
            <p>Every card is a real AI output with the one phrase that made it. Tap Remix to make your own in three taps.</p>
            <button type="button" className="swipe-btn" onClick={start} autoFocus>
              Start swiping
            </button>
          </div>
        )}

        {sheet && (
          <SheetView
            sheet={sheet}
            cards={cards}
            built={built}
            onPick={(v) => sheet.kind === 'remix' && setSheet({ ...sheet, picks: [...sheet.picks, v] })}
            onClose={() => setSheet(null)}
            onCopy={copy}
            onMake={makeIt}
          />
        )}

        {toast && (
          <div className="swipe-toast" role="status">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

function SheetView({
  sheet,
  cards,
  built,
  onPick,
  onClose,
  onCopy,
  onMake,
}: {
  sheet: NonNullable<Sheet>;
  cards: SwipeCard[];
  built: (c: SwipeCard, picks: string[]) => string;
  onPick: (v: string) => void;
  onClose: () => void;
  onCopy: (t: string) => void;
  onMake: (t: string) => void;
}) {
  const c = cards[sheet.i];
  const first = useRef<HTMLButtonElement>(null);
  const step = sheet.kind === 'remix' ? sheet.picks.length : 0;
  useEffect(() => {
    first.current?.focus({ preventScroll: true });
  }, [step, sheet.kind]);

  if (sheet.kind === 'full') {
    return (
      <>
        <button type="button" className="swipe-scrim" aria-label="Close" onClick={onClose} />
        <div className="swipe-sheet" role="dialog" aria-modal="true" aria-label="The full prompt">
          <div className="swipe-grab" />
          <div className="swipe-step"><span>The full prompt</span><span>{c.by}</span></div>
          <p className="swipe-built is-tall">{c.full}</p>
          <div className="swipe-row2">
            <button ref={first} type="button" className="swipe-btn" onClick={() => onCopy(c.full)}>Copy</button>
            <button type="button" className="swipe-btn is-ghost" onClick={onClose}>Close</button>
          </div>
        </div>
      </>
    );
  }

  const picks = sheet.picks;
  const questions: [string, string, string[]][] = [
    ['Subject', 'What is in the shot?', c.subj],
    ['Light', 'How is it lit?', LIGHT],
    ['Lens', 'What is it shot on?', LENS],
  ];
  const prompt = built(c, picks);
  return (
    <>
      <button type="button" className="swipe-scrim" aria-label="Close" onClick={onClose} />
      <div className="swipe-sheet" role="dialog" aria-modal="true" aria-label="Remix this card">
        <div className="swipe-grab" />
        {step < 3 ? (
          <>
            <div className="swipe-step">
              <span>Tap {step + 1} of 3</span>
              <span>{questions[step][0]}</span>
            </div>
            <h3>{questions[step][1]}</h3>
            <div className="swipe-chips">
              {questions[step][2].map((o, k) => (
                <button key={o} ref={k === 0 ? first : undefined} type="button" onClick={() => onPick(o)}>
                  {o}
                </button>
              ))}
            </div>
            <p className="swipe-built">{prompt}</p>
          </>
        ) : (
          <>
            <div className="swipe-step">
              <span>3 taps</span>
              <span>{c.ing} move kept</span>
            </div>
            <h3>Your prompt</h3>
            <p className="swipe-built">{prompt}</p>
            <button ref={first} type="button" className="swipe-btn" onClick={() => onMake(prompt)}>
              Make it with Nano Banana
            </button>
            <div className="swipe-row2">
              <button type="button" className="swipe-btn is-ghost" onClick={() => onCopy(prompt)}>Copy</button>
              <button type="button" className="swipe-btn is-ghost" onClick={onClose}>Close</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
