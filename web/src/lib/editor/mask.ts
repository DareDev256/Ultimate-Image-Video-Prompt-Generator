/** Mask helpers: masks are stored in history as 1 byte per pixel (alpha only). */

export function extractAlpha(rgba: Uint8ClampedArray): Uint8Array {
  const out = new Uint8Array(rgba.length / 4);
  for (let i = 0; i < out.length; i++) out[i] = rgba[i * 4 + 3];
  return out;
}

export function alphaToRgba(alpha: Uint8Array): Uint8ClampedArray {
  const out = new Uint8ClampedArray(alpha.length * 4);
  for (let i = 0; i < alpha.length; i++) {
    out[i * 4] = 255;
    out[i * 4 + 1] = 255;
    out[i * 4 + 2] = 255;
    out[i * 4 + 3] = alpha[i];
  }
  return out;
}

export function hasAnyAlpha(alpha: Uint8Array): boolean {
  for (let i = 0; i < alpha.length; i++) if (alpha[i] > 0) return true;
  return false;
}
