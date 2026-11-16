/**
 * Merge freshly parsed prompts into the existing library without ever
 * reusing an id.
 *
 * Why this exists: the fetcher used to number prompts `10000 + No.` from
 * the upstream README. Upstream lists newest first, so every refresh handed
 * already-taken ids to different prompts. Ten ids (10001 to 10010) ended up
 * on two prompts each, and the generated showcase images attached to them
 * showed the wrong prompt (fixed 2026-11-16, v2.3.0).
 *
 * Rules: a prompt already in the library (same youmindId, or same prompt
 * text) is skipped; a new one gets the next free id in the range; the
 * result must have unique ids and slugs or the merge refuses.
 */

export interface MergeablePrompt {
  id: number;
  slug?: string;
  prompts?: string[];
  youmindId?: string | number | null;
  [key: string]: unknown;
}

export const textKey = (p: MergeablePrompt): string =>
  (p.prompts?.[0] ?? '').replace(/\s+/g, ' ').trim().slice(0, 240).toLowerCase();

export function mergePrompts<T extends MergeablePrompt>(
  fresh: T[],
  existing: T[],
  opts: { rangeStart: number; rangeEnd: number; slugPrefix: string },
): { merged: T[]; added: T[] } {
  const seenText = new Set(existing.map(textKey).filter(Boolean));
  const seenYoumind = new Set(
    existing.map((p) => p.youmindId).filter((v) => v !== undefined && v !== null && v !== '').map(String),
  );
  const inRange = existing.map((p) => p.id).filter((id) => id >= opts.rangeStart && id < opts.rangeEnd);
  let next = (inRange.length ? Math.max(...inRange) : opts.rangeStart) + 1;

  const added: T[] = [];
  for (const p of fresh) {
    const key = textKey(p);
    if (!key) continue;
    const ym = p.youmindId === undefined || p.youmindId === null || p.youmindId === '' ? null : String(p.youmindId);
    if (seenText.has(key) || (ym && seenYoumind.has(ym))) continue;
    if (next >= opts.rangeEnd) throw new Error(`id range ${opts.rangeStart}-${opts.rangeEnd} is full`);
    const id = next++;
    added.push({ ...p, id, slug: `${opts.slugPrefix}${id - opts.rangeStart}` });
    seenText.add(key);
    if (ym) seenYoumind.add(ym);
  }

  const merged = [...added, ...existing];
  const ids = new Set<number>();
  const slugs = new Set<string>();
  for (const p of merged) {
    if (ids.has(p.id)) throw new Error(`refusing to write: duplicate id ${p.id}`);
    ids.add(p.id);
    if (p.slug) {
      if (slugs.has(p.slug)) throw new Error(`refusing to write: duplicate slug ${p.slug}`);
      slugs.add(p.slug);
    }
  }
  return { merged, added };
}
