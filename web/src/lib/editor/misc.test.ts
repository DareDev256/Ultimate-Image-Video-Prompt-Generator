import { describe, expect, test } from 'bun:test';
import { boxBlurRGBA } from './blur';
import { alphaToRgba, extractAlpha, hasAnyAlpha } from './mask';
import { HistoryStack } from './history';
import { dataUrlToBlob, imageUrlFromGenerationResult } from './files';

describe('boxBlurRGBA', () => {
  test('smooths a hard edge and keeps a flat area flat', () => {
    const w = 20, h = 4;
    const d = new Uint8ClampedArray(w * h * 4);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const v = x < 10 ? 0 : 255;
      d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
    }
    boxBlurRGBA(d, w, h, 3);
    const at = (x: number) => d[(1 * w + x) * 4];
    expect(at(9)).toBeGreaterThan(20);
    expect(at(10)).toBeLessThan(235);
    expect(at(0)).toBe(0);
    expect(at(19)).toBe(255);
    expect(d[3]).toBe(255);
  });
});

describe('mask', () => {
  test('alpha round trip', () => {
    const a = new Uint8Array([0, 10, 255, 0]);
    expect(Array.from(extractAlpha(alphaToRgba(a)))).toEqual([0, 10, 255, 0]);
    expect(hasAnyAlpha(a)).toBe(true);
    expect(hasAnyAlpha(new Uint8Array(4))).toBe(false);
  });
});

describe('HistoryStack', () => {
  test('keeps at least 20 undo steps', () => {
    const h = new HistoryStack<number>(25);
    for (let i = 0; i <= 22; i++) h.push(i);
    let n = 0;
    while (h.undo() !== undefined) n++;
    expect(n).toBeGreaterThanOrEqual(20);
  });
  test('undo, redo, and a new push drops the redo branch', () => {
    const h = new HistoryStack<string>();
    h.push('a'); h.push('b'); h.push('c');
    expect(h.undo()).toBe('b');
    expect(h.redo()).toBe('c');
    h.undo(); h.push('d');
    expect(h.canRedo).toBe(false);
    expect(h.current).toBe('d');
    expect(h.first).toBe('a');
  });
  test('cannot undo past the baseline', () => {
    const h = new HistoryStack<number>();
    h.push(1);
    expect(h.canUndo).toBe(false);
    expect(h.undo()).toBeUndefined();
  });
});

describe('files', () => {
  test('dataUrlToBlob decodes base64 without fetch', async () => {
    const b = dataUrlToBlob('data:image/png;base64,aGVsbG8=');
    expect(b?.type).toBe('image/png');
    expect(await b!.text()).toBe('hello');
    expect(dataUrlToBlob('nope')).toBeNull();
  });
  test('imageUrlFromGenerationResult', () => {
    expect(imageUrlFromGenerationResult(JSON.stringify({ result: { imageUrl: 'https://x/y.png' } }))).toBe('https://x/y.png');
    expect(imageUrlFromGenerationResult(JSON.stringify({ result: { imageUrl: 'http://x/y.png' } }))).toBeNull();
    expect(imageUrlFromGenerationResult('{bad')).toBeNull();
    expect(imageUrlFromGenerationResult(null)).toBeNull();
  });
});
