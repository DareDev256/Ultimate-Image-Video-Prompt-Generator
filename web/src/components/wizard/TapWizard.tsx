'use client';

/**
 * Tap wizard (v2.4.0, plan P2): five questions, one per screen, each answered
 * with one tap. The answer lands in the sentence at the bottom the moment it
 * is picked, so the person sees which words their tap added. The nine-step
 * detailed wizard stays one tap away for people who want every field.
 */

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useWizard, type ModelType } from '@/context/WizardContext';
import { useDiversePick } from '@/hooks/useDiversePick';
import { MODEL_KIND, MODEL_NAMES } from '@/lib/models';
import { firstOpen, tapQuestions, tapSentence } from '@/lib/tap-questions';

const ADVANCE_MS = 170;

export function TapWizard({ modelId, onDetail }: { modelId: ModelType; onDetail: () => void }) {
  const router = useRouter();
  const { state, updateField } = useWizard();
  const pickDiverse = useDiversePick();
  const questions = useMemo(() => tapQuestions(MODEL_KIND[modelId]), [modelId]);
  const [step, setStep] = useState(() => firstOpen(questions, state.formData));
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState('');
  const [flash, setFlash] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  const done = step >= questions.length;
  const q = done ? null : questions[step];
  const sentence = tapSentence(questions, state.formData);

  // Move focus to the new question so screen readers and keyboards follow along.
  // A long option list leaves the page scrolled down; each question starts at the top.
  useEffect(() => {
    window.scrollTo({ top: 0 });
    heading.current?.focus({ preventScroll: true });
  }, [step]);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const go = (to: number) => {
    setTyping(false);
    setDraft('');
    setFlash(null);
    setStep(Math.max(0, Math.min(to, questions.length)));
  };

  const answer = (value: string) => {
    if (!q) return;
    updateField(q.key, value);
    setFlash(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => go(step + 1), ADVANCE_MS);
  };

  const back = () => (step === 0 ? router.push('/create') : go(step - 1));

  const startOver = () => {
    for (const item of questions) updateField(item.key, '');
    go(0);
  };

  return (
    <div className="tap-root">
      <header className="tap-top">
        <button type="button" className="tap-link" onClick={back}>
          ← {step === 0 ? 'Engines' : 'Back'}
        </button>
        <span className="tap-model">{MODEL_NAMES[modelId]}</span>
        <button type="button" className="tap-link" onClick={onDetail}>
          All 9 steps
        </button>
      </header>

      <nav className="tap-progress" aria-label="Questions">
        {questions.map((item, i) => (
          <button
            key={item.key}
            type="button"
            className={`tap-seg ${state.formData[item.key]?.trim() ? 'is-set' : ''} ${i === step ? 'is-on' : ''}`}
            aria-label={`${i + 1}. ${item.eyebrow}${state.formData[item.key]?.trim() ? ', answered' : ''}`}
            aria-current={i === step ? 'step' : undefined}
            onClick={() => go(i)}
          >
            <span />
          </button>
        ))}
      </nav>

      {q ? (
        <main className="tap-q" key={q.key}>
          <span className="tap-eyebrow">
            {step + 1} of {questions.length} · {q.eyebrow}
          </span>
          <h1 ref={heading} tabIndex={-1}>
            {q.ask}
          </h1>
          <p className="tap-teach">{q.teach}</p>

          {/* Above the options so Skip and Surprise are in reach without scrolling;
              at the bottom the live prompt bar cut them in half. */}
          <div className="tap-more">
            <button type="button" onClick={() => answer(pickDiverse(q.key, q.options))}>
              Surprise me
            </button>
            <button type="button" onClick={() => setTyping((t) => !t)}>
              {typing ? 'Show the options' : 'Type my own'}
            </button>
            <button type="button" onClick={() => go(step + 1)}>
              Skip
            </button>
          </div>

          {typing ? (
            <form
              className="tap-own"
              onSubmit={(e) => {
                e.preventDefault();
                if (draft.trim()) answer(draft.trim());
              }}
            >
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={q.placeholder}
                aria-label={q.ask}
                enterKeyHint="next"
              />
              <button type="submit" className="tap-btn" disabled={!draft.trim()}>
                Use it
              </button>
            </form>
          ) : (
            <div className="tap-options">
              {q.options.map((o) => {
                const current = (flash ?? state.formData[q.key]) === o;
                return (
                  <button key={o} type="button" aria-pressed={current} className={current ? 'is-picked' : ''} onClick={() => answer(o)}>
                    {o}
                  </button>
                );
              })}
            </div>
          )}
        </main>
      ) : (
        <main className="tap-q tap-done" key="done">
          <span className="tap-eyebrow">
            {questions.filter((item) => state.formData[item.key]?.trim()).length} of {questions.length} answered
          </span>
          <h1 ref={heading} tabIndex={-1}>
            Your prompt
          </h1>
          {sentence.length === 0 ? (
            <p className="tap-teach">You skipped every question. Go back and tap one answer, or open all 9 steps.</p>
          ) : (
            <p className="tap-sentence is-big">
              {sentence.map((p, i) => (p.key ? <mark key={i}>{p.text}</mark> : <span key={i}>{p.text}</span>))}
            </p>
          )}
          <button
            type="button"
            className="tap-btn"
            disabled={sentence.length === 0}
            onClick={() => router.push(`/create/${modelId}/preview`)}
          >
            See it and make it
          </button>
          <div className="tap-row2">
            <button type="button" className="tap-btn is-ghost" onClick={onDetail}>
              Add more detail
            </button>
            <button type="button" className="tap-btn is-ghost" onClick={startOver}>
              Start over
            </button>
          </div>
        </main>
      )}

      {!done && (
        <footer className="tap-live" aria-live="polite">
          <span className="tap-eyebrow">Your prompt so far</span>
          <p className="tap-sentence">
            {sentence.length === 0
              ? 'Tap an answer and it lands here.'
              : sentence.map((p, i) => (p.key ? <mark key={i}>{p.text}</mark> : <span key={i}>{p.text}</span>))}
          </p>
        </footer>
      )}
    </div>
  );
}
