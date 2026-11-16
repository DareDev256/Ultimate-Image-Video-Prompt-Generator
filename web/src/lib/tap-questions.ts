/**
 * Tap wizard (v2.4.0, plan P2): the five choices that change a picture most,
 * one per screen, answered with a tap. Options come from the same field
 * definitions the detailed wizard uses (src/lib/categories.ts), and answers
 * land in the same formData keys, so preview, generate and result pages read
 * them unchanged.
 */
import { wizardCategories, videoCategories, type WizardField } from './categories';

export interface TapQuestion {
  key: string;
  eyebrow: string;
  ask: string;
  teach: string;
  placeholder: string;
  options: string[];
}

interface QuestionCopy {
  key: string;
  eyebrow: string;
  ask: string;
  teach: string;
}

const IMAGE_COPY: QuestionCopy[] = [
  {
    key: 'subject.description',
    eyebrow: 'Subject',
    ask: 'Who is in the shot?',
    teach: 'The model draws this first. One concrete detail, like age, hair or a scar, beats three adjectives.',
  },
  {
    key: 'environment.location',
    eyebrow: 'Place',
    ask: 'Where are they?',
    teach: 'A real place with a texture (grimy, rain-wet, sun-bleached) does more than a pretty word.',
  },
  {
    key: 'lighting.source',
    eyebrow: 'Light',
    ask: 'Where does the light come from?',
    teach: 'Name the source, not the mood. "Soft window light from left" tells the model where the shadows fall.',
  },
  {
    key: 'camera.lens',
    eyebrow: 'Lens',
    ask: 'What lens is it shot on?',
    teach: 'Wide pulls the room in, 85mm flattens a face, macro shows skin. The lens sets the distance.',
  },
  {
    key: 'color.grade',
    eyebrow: 'Colour',
    ask: 'What colour is it?',
    teach: 'A grade ties the frame together. Name a film stock or two colours.',
  },
];

const MOTION_COPY: QuestionCopy = {
  key: 'motion.camera',
  eyebrow: 'Camera move',
  ask: 'How does the camera move?',
  teach: 'Video models need one clear move. "Slow push in" beats "cinematic".',
};

const FIELDS: Map<string, WizardField> = new Map(
  [...wizardCategories, ...videoCategories].flatMap((c) => c.fields.map((f) => [f.key, f] as const)),
);

/** The questions for an image or video engine, in the order they are asked. */
export function tapQuestions(type: 'image' | 'video'): TapQuestion[] {
  const copy = type === 'video' ? [...IMAGE_COPY.slice(0, 4), MOTION_COPY, IMAGE_COPY[4]] : IMAGE_COPY;
  return copy.map((q) => {
    const field = FIELDS.get(q.key);
    if (!field || field.suggestions.length === 0) {
      // Refuse rather than render an empty screen: a renamed field key must fail here.
      throw new Error(`tap question "${q.key}" has no field with suggestions in categories.ts`);
    }
    return { ...q, placeholder: field.placeholder ?? 'Type your own', options: [...field.suggestions] };
  });
}

/** First question without an answer; questions.length means every one is answered. */
export function firstOpen(questions: TapQuestion[], formData: Record<string, string>): number {
  const i = questions.findIndex((q) => !formData[q.key]?.trim());
  return i === -1 ? questions.length : i;
}

export interface SentencePart {
  text: string;
  /** Set when this text is the user's own answer, so the UI can highlight it. */
  key?: string;
}

const LEAD: Record<string, string> = {
  'subject.description': '',
  'environment.location': 'in ',
  'lighting.source': 'lit by ',
  'camera.lens': 'using ',
  'motion.camera': 'camera: ',
  'color.grade': '',
};
const TAIL: Record<string, string> = { 'color.grade': ' color grade' };

/** Lower-case the first letter unless the word is an acronym ("NYC") or a single capital ("I"). */
function soften(text: string, first: boolean): string {
  if (first || text.length < 2) return text;
  return text[1] === text[1].toLowerCase() ? text[0].toLowerCase() + text.slice(1) : text;
}

/**
 * The answers so far as one readable line, using the same connectors the
 * natural-language prompt uses ("in", "lit by", "using"), split into parts so
 * each answer can be highlighted where it landed.
 */
export function tapSentence(questions: TapQuestion[], formData: Record<string, string>): SentencePart[] {
  const parts: SentencePart[] = [];
  for (const q of questions) {
    const value = formData[q.key]?.trim();
    if (!value) continue;
    if (parts.length > 0) parts.push({ text: ', ' });
    const lead = LEAD[q.key] ?? '';
    if (lead) parts.push({ text: lead });
    parts.push({ text: soften(value, parts.length === 0), key: q.key });
    const tail = TAIL[q.key];
    if (tail) parts.push({ text: tail });
  }
  if (parts.length > 0) parts.push({ text: '.' });
  return parts;
}
