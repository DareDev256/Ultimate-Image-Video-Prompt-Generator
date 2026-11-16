/** Decode a data: URL into a Blob without any network call. Returns null if malformed. */
export function dataUrlToBlob(url: string): Blob | null {
  const m = /^data:([^;,]*)((?:;[^;,]*)*),([\s\S]*)$/.exec(url);
  if (!m) return null;
  const mime = m[1] || 'application/octet-stream';
  const isB64 = /;base64/i.test(m[2]);
  try {
    if (isB64) {
      const bin = atob(m[3]);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new Blob([bytes], { type: mime });
    }
    return new Blob([decodeURIComponent(m[3])], { type: mime });
  } catch {
    return null;
  }
}

/** Pull `result.imageUrl` out of the generate page's stored JSON. */
export function imageUrlFromGenerationResult(json: string | null): string | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json) as { result?: { imageUrl?: unknown } };
    const u = parsed?.result?.imageUrl;
    return typeof u === 'string' && (u.startsWith('data:') || u.startsWith('https://')) ? u : null;
  } catch {
    return null;
  }
}
