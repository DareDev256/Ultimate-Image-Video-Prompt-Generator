/** Software box blur on RGBA data (3 passes approximates a gaussian). iOS Safari has no ctx.filter, so we never rely on it. */

function boxPass(src: Uint8ClampedArray, dst: Uint8ClampedArray, w: number, h: number, r: number, horizontal: boolean) {
  const len = horizontal ? w : h;
  const lines = horizontal ? h : w;
  const stride = horizontal ? 4 : w * 4;
  const lineStride = horizontal ? w * 4 : 4;
  const div = 2 * r + 1;
  for (let l = 0; l < lines; l++) {
    const base = l * lineStride;
    for (let c = 0; c < 3; c++) {
      let sum = 0;
      for (let k = -r; k <= r; k++) {
        const i = Math.min(len - 1, Math.max(0, k));
        sum += src[base + i * stride + c];
      }
      for (let i = 0; i < len; i++) {
        dst[base + i * stride + c] = sum / div;
        const add = Math.min(len - 1, i + r + 1);
        const sub = Math.max(0, i - r);
        sum += src[base + add * stride + c] - src[base + sub * stride + c];
      }
    }
    for (let i = 0; i < len; i++) dst[base + i * stride + 3] = 255;
  }
}

/** Blur RGBA pixels in place. Radius is in pixels of this buffer. */
export function boxBlurRGBA(data: Uint8ClampedArray, w: number, h: number, radius: number, passes = 3): void {
  const r = Math.max(1, Math.round(radius));
  const tmp = new Uint8ClampedArray(data.length);
  for (let p = 0; p < passes; p++) {
    boxPass(data, tmp, w, h, r, true);
    boxPass(tmp, data, w, h, r, false);
  }
}
