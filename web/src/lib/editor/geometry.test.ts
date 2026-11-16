import { describe, expect, test } from 'bun:test';
import {
  blockSizeFor, blurRadiusFor, brushPx, clampRect, clientToImage, containSize, downscaleSize,
  fitRectToAspect, iou, mergeBoxes, moveRect, padRect, resizeRect, tileRects,
} from './geometry';

const B = { w: 1000, h: 800 };

describe('clampRect', () => {
  test('pulls an out-of-bounds rect back inside', () => {
    expect(clampRect({ x: -50, y: 700, w: 200, h: 200 }, B)).toEqual({ x: 0, y: 600, w: 200, h: 200 });
  });
  test('caps oversize and enforces min size', () => {
    expect(clampRect({ x: 0, y: 0, w: 5000, h: 5000 }, B)).toEqual({ x: 0, y: 0, w: 1000, h: 800 });
    expect(clampRect({ x: 10, y: 10, w: 2, h: 2 }, B, 24)).toMatchObject({ w: 24, h: 24 });
  });
  test('moveRect never leaves the image', () => {
    const r = moveRect({ x: 800, y: 600, w: 200, h: 200 }, 500, 500, B);
    expect(r.x + r.w).toBe(1000);
    expect(r.y + r.h).toBe(800);
  });
});

describe('resizeRect', () => {
  const r = { x: 100, y: 100, w: 400, h: 300 };
  test('free se drag grows and clamps to bounds', () => {
    expect(resizeRect(r, 'se', 50, 50, B)).toEqual({ x: 100, y: 100, w: 450, h: 350 });
    const big = resizeRect(r, 'se', 5000, 5000, B);
    expect(big.x + big.w).toBe(1000);
    expect(big.y + big.h).toBe(800);
  });
  test('min size holds when dragged past the anchor', () => {
    const s = resizeRect(r, 'se', -900, -900, B, 24);
    expect(s.w).toBe(24);
    expect(s.h).toBe(24);
  });
  test('ratio lock keeps aspect for corner drags, even at the bounds', () => {
    const sq = { x: 100, y: 100, w: 300, h: 300 };
    const a = resizeRect(sq, 'se', 120, 20, B, 24, 1);
    expect(a.w).toBeCloseTo(a.h, 6);
    const b = resizeRect(sq, 'nw', -5000, -5000, B, 24, 1);
    expect(b.w).toBeCloseTo(b.h, 6);
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.y).toBeGreaterThanOrEqual(0);
    const c = resizeRect(sq, 'se', 5000, 5000, B, 24, 9 / 16);
    expect(c.w / c.h).toBeCloseTo(9 / 16, 6);
    expect(c.x + c.w).toBeLessThanOrEqual(1000.0001);
    expect(c.y + c.h).toBeLessThanOrEqual(800.0001);
  });
  test('edge handles move one side; ignored under ratio lock', () => {
    expect(resizeRect(r, 'e', 100, 999, B)).toEqual({ x: 100, y: 100, w: 500, h: 300 });
    expect(resizeRect(r, 'w', 50, 0, B)).toEqual({ x: 150, y: 100, w: 350, h: 300 });
    expect(resizeRect(r, 'e', 100, 0, B, 24, 1)).toEqual(r);
  });
});

describe('fitRectToAspect', () => {
  test('1:1 on landscape is centred', () => {
    expect(fitRectToAspect(B, 1)).toEqual({ x: 100, y: 0, w: 800, h: 800 });
  });
  test('9:16 on landscape is height limited', () => {
    const r = fitRectToAspect(B, 9 / 16);
    expect(r.h).toBe(800);
    expect(r.w / r.h).toBeCloseTo(9 / 16, 6);
  });
  test('16:9 on portrait is width limited', () => {
    const r = fitRectToAspect({ w: 400, h: 900 }, 16 / 9);
    expect(r.w).toBe(400);
    expect(r.h).toBeCloseTo(225, 6);
  });
});

describe('iou + mergeBoxes', () => {
  const a = { x: 0, y: 0, w: 100, h: 100 };
  test('iou basics', () => {
    expect(iou(a, a)).toBe(1);
    expect(iou(a, { x: 200, y: 0, w: 100, h: 100 })).toBe(0);
    expect(iou(a, { x: 50, y: 0, w: 100, h: 100 })).toBeCloseTo(1 / 3, 6);
  });
  test('duplicate detections from overlapping tiles collapse to one', () => {
    const out = mergeBoxes([a, { x: 5, y: 4, w: 102, h: 98 }, { x: -3, y: 2, w: 100, h: 101 }]);
    expect(out).toHaveLength(1);
    expect(out[0].x).toBe(-3);
  });
  test('distinct faces stay distinct', () => {
    expect(mergeBoxes([a, { x: 300, y: 0, w: 100, h: 100 }])).toHaveLength(2);
  });
  test('a small box inside a big one is absorbed (containment)', () => {
    expect(mergeBoxes([a, { x: 20, y: 20, w: 30, h: 30 }])).toHaveLength(1);
  });
  test('merging chains: A~B and B~C gives one box', () => {
    const out = mergeBoxes([
      { x: 0, y: 0, w: 100, h: 100 },
      { x: 40, y: 0, w: 100, h: 100 },
      { x: 80, y: 0, w: 100, h: 100 },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].w).toBe(180);
  });
});

describe('padRect / sizes / mapping', () => {
  test('padRect grows 20% per side and clips to bounds', () => {
    expect(padRect({ x: 100, y: 100, w: 100, h: 100 }, 0.2, B)).toEqual({ x: 80, y: 80, w: 140, h: 140 });
    const edge = padRect({ x: 0, y: 0, w: 100, h: 100 }, 0.2, B);
    expect(edge.x).toBe(0);
    expect(edge.w).toBe(120);
  });
  test('containSize and downscaleSize', () => {
    expect(containSize({ w: 4000, h: 3000 }, { w: 390, h: 600 })).toEqual({ w: 390, h: 292 });
    expect(downscaleSize({ w: 5120, h: 2560 }, 2560)).toEqual({ w: 2560, h: 1280 });
    expect(downscaleSize({ w: 800, h: 600 }, 2560)).toEqual({ w: 800, h: 600 });
  });
  test('clientToImage maps css px to image px', () => {
    const el = { left: 10, top: 20, width: 200, height: 100 };
    expect(clientToImage(110, 70, el, { w: 2000, h: 1000 })).toEqual({ x: 1000, y: 500 });
  });
  test('tileRects 2x2 covers the image with overlap', () => {
    const t = tileRects({ w: 1000, h: 800 }, 2, 2, 0.25);
    expect(t).toHaveLength(4);
    expect(Math.max(...t.map((r) => r.x + r.w))).toBeCloseTo(1000, 6);
    expect(Math.max(...t.map((r) => r.y + r.h))).toBeCloseTo(800, 6);
    expect(t[0].x + t[0].w).toBeGreaterThan(t[1].x); // overlap
  });
  test('strength maths is monotonic', () => {
    expect(blockSizeFor(2000, 80)).toBeGreaterThan(blockSizeFor(2000, 20));
    expect(blurRadiusFor(2000, 80)).toBeGreaterThan(blurRadiusFor(2000, 20));
    expect(brushPx(2000, 80)).toBeGreaterThan(brushPx(2000, 20));
  });
});
