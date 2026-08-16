#!/usr/bin/env bun
/**
 * Score a prompt with Shot Grammar and print it for an agent to read.
 *
 * Usage:
 *   bun run skill/scripts/score.ts "your prompt here"
 *   echo "your prompt" | bun run skill/scripts/score.ts
 *   bun run skill/scripts/score.ts --json "your prompt"
 *
 * Exit code is 0 for a scoreable prompt and 2 for empty input, so a caller
 * can branch without parsing.
 */

import { scoreShot, nextFix, SHOT_AXES, AXIS_LABELS, TIER_LABELS, TIER_BLURBS } from '../../web/src/lib/shot-grammar';

const argv = process.argv.slice(2);
const asJson = argv.includes('--json');
const positional = argv.filter((a) => !a.startsWith('--'));

const input = positional.length > 0
  ? positional.join(' ')
  : await Bun.stdin.text();

const prompt = input.trim();
if (!prompt) {
  console.error('No prompt given. Pass it as an argument or on stdin.');
  process.exit(2);
}

const score = scoreShot(prompt);

if (asJson) {
  console.log(JSON.stringify(score, null, 2));
  process.exit(0);
}

const bar = (n: number) => '█'.repeat(n) + '·'.repeat(5 - n);

console.log(`${score.total}/30  ${TIER_LABELS[score.tier]}`);
console.log(TIER_BLURBS[score.tier]);
console.log('');

for (const axis of SHOT_AXES) {
  const a = score.axes[axis];
  const found = a.matched.length ? `  ← ${a.matched.slice(0, 3).join(', ')}` : '';
  console.log(`  ${AXIS_LABELS[axis].padEnd(8)} ${bar(a.score)} ${a.score}/5${found}`);
}

if (score.modifiers.length) {
  console.log('');
  for (const m of score.modifiers) {
    const sign = m.delta >= 0 ? `+${m.delta}` : `${m.delta}`;
    console.log(`  ${sign.padStart(3)}  ${m.label} — ${m.reason}`);
  }
}

const fix = nextFix(score);
if (fix) {
  console.log('');
  console.log(`NEXT: ${AXIS_LABELS[fix.axis]}`);
  console.log(`  ${fix.advice}`);
  console.log(`  Wizard steps that fix it: ${fix.wizardSteps.join(', ')}`);
}
