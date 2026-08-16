/**
 * Shot Grammar — scores an image or video prompt before you spend money on it.
 *
 * Why this exists
 * ---------------
 * The wizard builds prompts and the /create route runs them against nine
 * engines. Between those two steps there was nothing telling you whether the
 * prompt was any good. You found out from the render, after paying for it.
 *
 * The scoring shape (six axes, 0–5 each, 30 total, four tiers) is lifted from
 * the COSTAR engine in DareDev256/prompt-craft, which grades *text* prompts
 * for LLMs. The axes are not: "write a formal summary in bullet points" is a
 * good text prompt and describes no shot at all. Context/Objective/Style/
 * Tone/Audience/Format became Subject/Setting/Light/Camera/Grade/Mood, which
 * are the wizard's own eleven categories collapsed to six.
 *
 * That collapse is the point. Every axis maps back to the wizard steps that
 * fix it, so a score is not a grade — it is an instruction to go back to a
 * specific step.
 *
 * The vocabulary is generated, never hand-written: see
 * scripts/build-shot-grammar-terms.ts. 589 terms, part seeded from the
 * pattern dictionary and part mined out of the 1,070 Latin-script prompts in
 * the corpus, each weighted by how often it actually appears there.
 *
 * Calibration, measured rather than asserted: of those 1,070 known-good
 * prompts, 85% score workable or better (median 21/30), while every junk
 * string in the test suite tops out at 2. A scorer that cannot separate the
 * corpus it was built from is not measuring anything.
 */

import { SHOT_TERMS, AXIS_MARKER_SOURCES, type ShotTerm } from './shot-grammar-terms';

export type ShotAxis = 'subject' | 'setting' | 'light' | 'camera' | 'grade' | 'mood';

export const SHOT_AXES: ShotAxis[] = ['subject', 'setting', 'light', 'camera', 'grade', 'mood'];

export type ShotTier = 'flat' | 'workable' | 'strong' | 'directed';

export interface AxisResult {
  axis: ShotAxis;
  /** 0–5. */
  score: number;
  /** Terms from the corpus that were found, strongest first. */
  matched: string[];
  /** Wizard category ids that raise this axis, for the "fix this" link. */
  wizardSteps: string[];
}

export interface ShotScore {
  axes: Record<ShotAxis, AxisResult>;
  /** 0–30, after modifiers. */
  total: number;
  tier: ShotTier;
  /** Signed adjustments applied on top of the axis sum, each explained. */
  modifiers: { label: string; delta: number; reason: string }[];
  /** The weakest axes, worst first — what to fix, in order. */
  weakest: ShotAxis[];
  /** Empty-calorie tokens found. These cost you nothing and buy you nothing. */
  slop: string[];
}

/**
 * Which wizard categories raise which axis.
 *
 * Source of truth for the ids is web/src/lib/categories.ts. Kept as a literal
 * rather than derived so the scorer stays importable from a test or a CLI
 * without pulling the whole wizard config in.
 */
const AXIS_TO_WIZARD: Record<ShotAxis, string[]> = {
  subject: ['subject'],
  setting: ['setting', 'style'],
  light: ['lighting'],
  camera: ['camera', 'motion'],
  grade: ['color', 'film'],
  mood: ['mood', 'vibes'],
};

export const AXIS_LABELS: Record<ShotAxis, string> = {
  subject: 'SUBJECT',
  setting: 'SETTING',
  light: 'LIGHT',
  camera: 'CAMERA',
  grade: 'GRADE',
  mood: 'MOOD',
};

/** What each axis is asking for, shown under a weak score. */
export const AXIS_PROMPTS: Record<ShotAxis, string> = {
  subject: 'Name who or what is in frame, and what they are doing.',
  setting: 'Say where this happens. A room, a street, a void — but somewhere.',
  light: 'Name the source and its quality. This is the biggest single knob between "looks AI" and "looks real."',
  camera: 'Give it a lens, an angle, or a distance. "Close-up, 85mm, shallow depth of field" is a different image than no camera at all.',
  grade: 'Say how the colour behaves. Teal-orange, bleach bypass, muted pastel — anything beats leaving it to the model.',
  mood: 'Name the feeling or the reference. This is the axis that survives when the others are already specified.',
};

export const TIER_LABELS: Record<ShotTier, string> = {
  flat: 'FLAT',
  workable: 'WORKABLE',
  strong: 'STRONG',
  directed: 'DIRECTED',
};

export const TIER_BLURBS: Record<ShotTier, string> = {
  flat: 'The model is making most of this up. Expect a generic result.',
  workable: 'Enough to render something recognisable. Still leaving the look to chance.',
  strong: 'Specified where it counts. Small gaps left.',
  directed: 'You are directing the shot, not describing it.',
};

/**
 * Tokens that read as effort and contribute nothing.
 *
 * Every model card and prompt guide of the last two years tells people to
 * append these, and they have been trained-through — "8k" in a prompt for a
 * model that renders at fixed resolution is noise competing for attention
 * with the tokens that matter. Penalised rather than ignored, because their
 * presence usually means the rest of the prompt is thin.
 */
const SLOP_TOKENS = [
  '8k', '4k uhd', 'ultra hd', 'masterpiece', 'best quality', 'highly detailed',
  'ultra detailed', 'super detailed', 'high quality', 'award winning',
  'award-winning', 'trending on artstation', 'artstation', 'unreal engine',
  'octane render', 'hyperrealistic', 'photorealism', 'stunning', 'beautiful',
  'gorgeous', 'perfect', 'amazing', 'intricate details', 'sharp focus',
];

/** Signals the author wrote a negative prompt, which most people skip. */
const NEGATIVE_MARKERS = [
  'negative prompt', 'negative_prompt', 'avoid:', 'no text', 'no watermark',
  'without text', 'do not include', "don't include", 'exclude:',
];

/**
 * Compiled once. The generated file ships regex sources rather than literals
 * so the vocabulary and its markers stay in one artifact.
 */
const AXIS_MARKERS: Record<ShotAxis, RegExp> = Object.fromEntries(
  SHOT_AXES.map((a) => [a, new RegExp(AXIS_MARKER_SOURCES[a], 'i')]),
) as Record<ShotAxis, RegExp>;

function matchAxis(haystack: string, terms: ShotTerm[], marker: RegExp): { score: number; matched: string[] } {
  const hits = terms.filter((t) => haystack.includes(t.term));

  if (hits.length === 0) {
    // The vocabulary is a closed list of 589 phrases. A prompt can specify an
    // axis perfectly in words nobody mined — "a rain-slicked harbour wall"
    // names a setting and matches no setting term. Falling to 0 there would
    // tell the user to go fix the one thing they already did.
    //
    // A broad category word is weak evidence, and scores like weak evidence:
    // a floor of 2, never more, never outranking a real term match.
    const m = haystack.match(marker);
    return m ? { score: 2, matched: [m[0].toLowerCase()] } : { score: 0, matched: [] };
  }

  hits.sort((a, b) => b.weight - a.weight);

  // Score on accumulated evidence, not raw hit count. One strong, specific
  // term ("shallow depth of field", weight ~6.2) is worth more than three
  // weak ones, and stacking synonyms stops paying after the third.
  const evidence = hits.slice(0, 4).reduce((sum, t, i) => sum + t.weight / (i + 1), 0);

  // Thresholds are on log-weighted evidence: ~4 = one common term present,
  // ~11 = two or three specified dimensions within the axis.
  const score =
    evidence >= 11 ? 5 :
    evidence >= 8 ? 4 :
    evidence >= 5.5 ? 3 :
    evidence >= 3 ? 2 :
    1;

  return { score, matched: hits.slice(0, 6).map((t) => t.term) };
}

/**
 * Score a prompt. Pure, synchronous, no network — safe to run on every
 * keystroke and safe to run before the user has spent anything.
 */
export function scoreShot(input: string): ShotScore {
  const text = (input ?? '').toLowerCase();

  const axes = {} as Record<ShotAxis, AxisResult>;
  for (const axis of SHOT_AXES) {
    const { score, matched } = matchAxis(text, SHOT_TERMS[axis] ?? [], AXIS_MARKERS[axis]);
    axes[axis] = { axis, score, matched, wizardSteps: AXIS_TO_WIZARD[axis] };
  }

  const axisSum = SHOT_AXES.reduce((n, a) => n + axes[a].score, 0);

  const modifiers: ShotScore['modifiers'] = [];

  // Length stands in for specificity. A 15-character prompt cannot have
  // specified six axes no matter which words it used.
  const len = input?.trim().length ?? 0;
  if (len === 0) {
    modifiers.push({ label: 'Empty', delta: -axisSum, reason: 'Nothing to score.' });
  } else if (len < 25) {
    modifiers.push({ label: 'Too short', delta: -2, reason: 'Under 25 characters. There is no room for a shot in there.' });
  } else if (len > 220) {
    modifiers.push({ label: 'Specific', delta: 1, reason: 'Long enough to carry real direction.' });
  }

  const slop = SLOP_TOKENS.filter((t) => text.includes(t));
  if (slop.length > 0) {
    // Capped: five slop tokens is not five times worse than one, it is the
    // same mistake made five times.
    const delta = -Math.min(3, slop.length);
    modifiers.push({
      label: 'Empty tokens',
      delta,
      reason: `${slop.join(', ')} — these read as effort and steer nothing.`,
    });
  }

  if (NEGATIVE_MARKERS.some((m) => text.includes(m))) {
    modifiers.push({ label: 'Negative prompt', delta: 2, reason: 'Says what to keep out, which most prompts never do.' });
  }

  const total = Math.max(0, Math.min(30, axisSum + modifiers.reduce((n, m) => n + m.delta, 0)));

  const tier: ShotTier =
    total >= 24 ? 'directed' :
    total >= 17 ? 'strong' :
    total >= 9 ? 'workable' :
    'flat';

  const weakest = [...SHOT_AXES]
    .sort((a, b) => axes[a].score - axes[b].score || SHOT_AXES.indexOf(a) - SHOT_AXES.indexOf(b))
    .filter((a) => axes[a].score < 4);

  return { axes, total, tier, modifiers, weakest, slop };
}

/**
 * One line of advice: the single highest-leverage thing to add next.
 * Returns null when there is nothing worth saying.
 */
export function nextFix(score: ShotScore): { axis: ShotAxis; advice: string; wizardSteps: string[] } | null {
  const axis = score.weakest[0];
  if (!axis) return null;
  return { axis, advice: AXIS_PROMPTS[axis], wizardSteps: AXIS_TO_WIZARD[axis] };
}
