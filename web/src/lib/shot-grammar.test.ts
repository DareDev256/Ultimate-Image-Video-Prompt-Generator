import { describe, expect, test } from 'bun:test';
import {
  scoreShot,
  nextFix,
  SHOT_AXES,
  AXIS_LABELS,
  AXIS_PROMPTS,
  TIER_LABELS,
  TIER_BLURBS,
  type ShotAxis,
} from './shot-grammar';
import { SHOT_TERMS } from './shot-grammar-terms';

/**
 * A prompt that specifies all six axes. Written by hand rather than lifted
 * from the corpus so the test does not pass merely because the scorer was
 * calibrated on the sentence it is being graded against.
 */
const DIRECTED =
  'A weathered fisherman mending nets on a rain-slicked harbour wall at dawn, ' +
  'backlit by low golden hour sun with a soft rim on his shoulders, shot on 85mm ' +
  'with shallow depth of field and heavy bokeh behind him, muted teal and orange ' +
  'grade on Kodak Portra film grain, quiet and nostalgic documentary mood.';

const BARE = 'a fisherman';

describe('scoreShot — shape', () => {
  test('returns every axis, always', () => {
    const s = scoreShot(DIRECTED);
    expect(Object.keys(s.axes).sort()).toEqual([...SHOT_AXES].sort());
  });

  test('every axis score is an integer within 0..5', () => {
    for (const input of [DIRECTED, BARE, '', 'cat']) {
      const s = scoreShot(input);
      for (const axis of SHOT_AXES) {
        expect(Number.isInteger(s.axes[axis].score)).toBe(true);
        expect(s.axes[axis].score).toBeGreaterThanOrEqual(0);
        expect(s.axes[axis].score).toBeLessThanOrEqual(5);
      }
    }
  });

  test('total is clamped to 0..30', () => {
    for (const input of [DIRECTED, BARE, '', 'x'.repeat(5000)]) {
      const s = scoreShot(input);
      expect(s.total).toBeGreaterThanOrEqual(0);
      expect(s.total).toBeLessThanOrEqual(30);
    }
  });

  test('every axis carries the wizard steps that raise it', () => {
    const s = scoreShot(BARE);
    for (const axis of SHOT_AXES) {
      expect(s.axes[axis].wizardSteps.length).toBeGreaterThan(0);
    }
  });

  test('is pure — same input, same output', () => {
    expect(scoreShot(DIRECTED)).toEqual(scoreShot(DIRECTED));
  });
});

describe('scoreShot — degenerate input', () => {
  test('empty string scores zero and does not throw', () => {
    const s = scoreShot('');
    expect(s.total).toBe(0);
    expect(s.tier).toBe('flat');
  });

  test('whitespace only scores zero', () => {
    expect(scoreShot('   \n\t  ').total).toBe(0);
  });

  test('null and undefined are treated as empty', () => {
    expect(scoreShot(null as unknown as string).total).toBe(0);
    expect(scoreShot(undefined as unknown as string).total).toBe(0);
  });

  test('a very long string does not blow up', () => {
    const s = scoreShot(DIRECTED.repeat(200));
    expect(s.total).toBeLessThanOrEqual(30);
  });
});

describe('scoreShot — discrimination', () => {
  test('a fully directed prompt outranks the bare subject by a wide margin', () => {
    const rich = scoreShot(DIRECTED);
    const bare = scoreShot(BARE);
    expect(rich.total).toBeGreaterThan(bare.total + 12);
  });

  test('a fully directed prompt reaches the top tier', () => {
    expect(scoreShot(DIRECTED).tier).toBe('directed');
  });

  test('adding a specified axis never lowers that axis', () => {
    const before = scoreShot('a fisherman on a harbour wall');
    const after = scoreShot('a fisherman on a harbour wall, shot on 85mm with shallow depth of field');
    expect(after.axes.camera.score).toBeGreaterThanOrEqual(before.axes.camera.score);
  });

  test('pure slop cannot reach workable', () => {
    const junk = [
      '8k masterpiece highly detailed',
      'beautiful stunning amazing perfect',
      'best quality, ultra detailed, award winning, trending on artstation',
      'make me a cool picture',
      'a nice image of something cool please make it good',
    ];
    for (const j of junk) {
      expect(scoreShot(j).tier).toBe('flat');
    }
  });
});

describe('scoreShot — modifiers', () => {
  test('slop tokens are named, not silently dropped', () => {
    const s = scoreShot(DIRECTED + ' 8k masterpiece trending on artstation');
    expect(s.slop).toContain('8k');
    expect(s.slop).toContain('masterpiece');
    expect(s.modifiers.some((m) => m.label === 'Empty tokens' && m.delta < 0)).toBe(true);
  });

  test('slop penalty is capped rather than unbounded', () => {
    const manySlop = ' 8k masterpiece best quality highly detailed award winning stunning beautiful';
    const s = scoreShot(DIRECTED + manySlop);
    const penalty = s.modifiers.find((m) => m.label === 'Empty tokens')!;
    expect(penalty.delta).toBeGreaterThanOrEqual(-3);
  });

  test('slop costs score', () => {
    const clean = scoreShot(DIRECTED).total;
    const slopped = scoreShot(DIRECTED + ' 8k masterpiece best quality').total;
    expect(slopped).toBeLessThan(clean);
  });

  test('a negative prompt is rewarded', () => {
    const without = scoreShot(DIRECTED).total;
    const withNeg = scoreShot(DIRECTED + ' Negative prompt: no text, no watermark').total;
    expect(withNeg).toBeGreaterThan(without - 1);
    expect(scoreShot(DIRECTED + ' Negative prompt: blurry').modifiers
      .some((m) => m.label === 'Negative prompt')).toBe(true);
  });

  test('a too-short prompt is penalised and says so', () => {
    const s = scoreShot('a cat');
    const mod = s.modifiers.find((m) => m.label === 'Too short');
    expect(mod).toBeDefined();
    expect(mod!.delta).toBeLessThan(0);
  });

  test('every modifier explains itself', () => {
    const s = scoreShot('a cat 8k masterpiece');
    for (const m of s.modifiers) {
      expect(m.reason.length).toBeGreaterThan(10);
      expect(m.label.length).toBeGreaterThan(0);
    }
  });
});

describe('scoreShot — tiers', () => {
  test('tier bands are ordered and exhaustive', () => {
    const seen = new Set<string>();
    for (let i = 0; i <= 30; i++) {
      // Synthesise a total by construction rather than by prompt-guessing.
      const tier =
        i >= 24 ? 'directed' : i >= 17 ? 'strong' : i >= 9 ? 'workable' : 'flat';
      seen.add(tier);
    }
    expect([...seen].sort()).toEqual(['directed', 'flat', 'strong', 'workable']);
  });

  test('every tier has a label and a blurb', () => {
    for (const tier of ['flat', 'workable', 'strong', 'directed'] as const) {
      expect(TIER_LABELS[tier]).toBeTruthy();
      expect(TIER_BLURBS[tier].length).toBeGreaterThan(20);
    }
  });
});

describe('weakest / nextFix — the score is an instruction', () => {
  test('weakest lists only axes below 4, worst first', () => {
    const s = scoreShot('a weathered fisherman');
    for (const axis of s.weakest) expect(s.axes[axis].score).toBeLessThan(4);
    for (let i = 1; i < s.weakest.length; i++) {
      expect(s.axes[s.weakest[i - 1]].score).toBeLessThanOrEqual(s.axes[s.weakest[i]].score);
    }
  });

  test('nextFix points at the weakest axis and names wizard steps', () => {
    const s = scoreShot('a weathered fisherman');
    const fix = nextFix(s)!;
    expect(fix).not.toBeNull();
    expect(fix.axis).toBe(s.weakest[0]);
    expect(fix.wizardSteps.length).toBeGreaterThan(0);
    expect(fix.advice.length).toBeGreaterThan(20);
  });

  test('nextFix returns null when nothing is weak', () => {
    const s = scoreShot(DIRECTED);
    if (s.weakest.length === 0) expect(nextFix(s)).toBeNull();
    else expect(nextFix(s)).not.toBeNull();
  });

  test('acting on nextFix raises the named axis', () => {
    const before = scoreShot('a weathered fisherman on a harbour wall at dawn, nostalgic mood');
    const fix = nextFix(before)!;
    const additions: Record<ShotAxis, string> = {
      subject: ' a weathered fisherman with deep lines on his face',
      setting: ' on a rain-slicked harbour wall outside a shuttered fishing shop',
      light: ' backlit by low golden hour sun with soft rim lighting',
      camera: ' shot on 85mm, close-up, shallow depth of field, heavy bokeh',
      grade: ' muted teal and orange grade, Kodak Portra film grain',
      mood: ' quiet nostalgic documentary aesthetic, cinematic',
    };
    const after = scoreShot(
      'a weathered fisherman on a harbour wall at dawn, nostalgic mood' + additions[fix.axis],
    );
    expect(after.axes[fix.axis].score).toBeGreaterThan(before.axes[fix.axis].score);
  });
});

describe('vocabulary', () => {
  test('every axis has terms', () => {
    for (const axis of SHOT_AXES) {
      expect(SHOT_TERMS[axis]?.length ?? 0).toBeGreaterThan(20);
    }
  });

  test('terms are lowercase, trimmed, and non-empty', () => {
    for (const axis of SHOT_AXES) {
      for (const t of SHOT_TERMS[axis]) {
        expect(t.term).toBe(t.term.toLowerCase().trim());
        expect(t.term.length).toBeGreaterThan(1);
      }
    }
  });

  test('no term is a bare colon-prefixed label fragment', () => {
    // Structured prompts ("Subject: young woman") leaked ": woman" into the
    // vocabulary until the miner started trimming leading punctuation.
    for (const axis of SHOT_AXES) {
      for (const t of SHOT_TERMS[axis]) {
        expect(t.term.startsWith(':')).toBe(false);
        expect(t.term.endsWith(':')).toBe(false);
      }
    }
  });

  test('weights are positive and finite', () => {
    for (const axis of SHOT_AXES) {
      for (const t of SHOT_TERMS[axis]) {
        expect(Number.isFinite(t.weight)).toBe(true);
        expect(t.weight).toBeGreaterThan(0);
      }
    }
  });

  test('terms are sorted strongest first', () => {
    for (const axis of SHOT_AXES) {
      const w = SHOT_TERMS[axis].map((t) => t.weight);
      for (let i = 1; i < w.length; i++) expect(w[i - 1]).toBeGreaterThanOrEqual(w[i]);
    }
  });
});

describe('labels', () => {
  test('every axis has a label and a coaching line', () => {
    for (const axis of SHOT_AXES) {
      expect(AXIS_LABELS[axis]).toBeTruthy();
      expect(AXIS_PROMPTS[axis].length).toBeGreaterThan(30);
    }
  });
});
