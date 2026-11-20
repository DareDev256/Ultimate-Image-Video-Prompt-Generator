// Read a JSON file from public/ on any host. Since 2026-11-19 the site runs on Cloudflare
// Workers (OpenNext), where there is no filesystem: public/ is served by the ASSETS binding, so
// the file is fetched from it. Under next build, next dev and bun test there is no Cloudflare
// context and it falls back to reading the file from disk, as before.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getCloudflareContext } from '@opennextjs/cloudflare';

type Assets = { fetch(req: Request): Promise<Response> };
const memo = new Map<string, Promise<unknown>>();

function assetsBinding(): Assets | undefined {
  try {
    return (getCloudflareContext().env as unknown as { ASSETS?: Assets }).ASSETS;
  } catch {
    return undefined;
  }
}

/** `rel` is relative to public/, e.g. "data/image-prompts.json". Cached per isolate. */
export function readPublicJson<T>(rel: string): Promise<T> {
  let p = memo.get(rel);
  if (!p) {
    p = (async () => {
      const assets = assetsBinding();
      if (assets) {
        const res = await assets.fetch(new Request(`https://assets.local/${rel}`));
        if (!res.ok) throw new Error(`public asset ${rel}: HTTP ${res.status}`);
        return res.json();
      }
      return JSON.parse(readFileSync(join(process.cwd(), 'public', rel), 'utf-8'));
    })();
    p.catch(() => memo.delete(rel));
    memo.set(rel, p);
  }
  return p as Promise<T>;
}
