import { describe, expect, test } from 'bun:test';
import { firstOpen, tapQuestions, tapSentence } from './tap-questions';

describe('tap questions', () => {
  test('image engines get five questions, video engines add the camera move', () => {
    expect(tapQuestions('image').map((q) => q.key)).toEqual([
      'subject.description',
      'environment.location',
      'lighting.source',
      'camera.lens',
      'color.grade',
    ]);
    expect(tapQuestions('video').map((q) => q.key)).toContain('motion.camera');
    expect(tapQuestions('video')).toHaveLength(6);
  });

  test('every question offers at least six real options to tap', () => {
    for (const q of [...tapQuestions('image'), ...tapQuestions('video')]) {
      expect(q.options.length).toBeGreaterThanOrEqual(6);
      expect(q.options.every((o) => o.trim().length > 0)).toBe(true);
    }
  });

  test('firstOpen resumes at the first unanswered question, and past the end when all are answered', () => {
    const qs = tapQuestions('image');
    expect(firstOpen(qs, {})).toBe(0);
    expect(firstOpen(qs, { 'subject.description': 'a', 'environment.location': '  ' })).toBe(1);
    const all = Object.fromEntries(qs.map((q) => [q.key, 'x']));
    expect(firstOpen(qs, all)).toBe(qs.length);
  });

  test('the sentence uses the prompt connectors and marks each answer', () => {
    const qs = tapQuestions('image');
    const parts = tapSentence(qs, {
      'subject.description': 'Weathered man in his 50s',
      'environment.location': 'Grimy NYC subway car interior',
      'camera.lens': '85mm portrait',
      'color.grade': 'Warm orange and teal blockbuster',
    });
    expect(parts.map((p) => p.text).join('')).toBe(
      'Weathered man in his 50s, in grimy NYC subway car interior, using 85mm portrait, warm orange and teal blockbuster color grade.',
    );
    expect(parts.filter((p) => p.key).map((p) => p.key)).toEqual([
      'subject.description',
      'environment.location',
      'camera.lens',
      'color.grade',
    ]);
    expect(tapSentence(qs, {})).toEqual([]);
  });

  test('acronyms keep their capitals mid-sentence', () => {
    const qs = tapQuestions('image');
    const text = tapSentence(qs, { 'subject.description': 'A cat', 'environment.location': 'NYC rooftop' })
      .map((p) => p.text)
      .join('');
    expect(text).toBe('A cat, in NYC rooftop.');
  });
});
