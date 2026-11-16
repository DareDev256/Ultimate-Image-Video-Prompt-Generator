/**
 * Pure geometry for the photo editor: rects, crop clamping, box merging,
 * coordinate mapping and the strength -> pixel maths. No DOM access here so
 * everything is unit-testable with `bun test`.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Size {
  w: number;
  h: number;
}

export type Handle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** Clamp a rect so its size is within [minSize, bounds] and it lies inside bounds. */
export function clampRect(r: Rect, bounds: Size, minSize = 1): Rect {
  const w = clamp(r.w, Math.min(minSize, bounds.w), bounds.w);
  const h = clamp(r.h, Math.min(minSize, bounds.h), bounds.h);
  return {
    x: clamp(r.x, 0, bounds.w - w),
    y: clamp(r.y, 0, bounds.h - h),
    w,
    h,
  };
}

export function moveRect(r: Rect, dx: number, dy: number, bounds: Size): Rect {
  return clampRect({ ...r, x: r.x + dx, y: r.y + dy }, bounds);
}

/**
 * Resize a crop rect by dragging one handle by (dx, dy), in image pixels.
 * Corner handles honour an aspect `ratio` (w / h) when given; edge handles
 * are free-form only (a no-op when a ratio is locked).
 */
export function resizeRect(
  r: Rect,
  handle: Handle,
  dx: number,
  dy: number,
  bounds: Size,
  minSize = 24,
  ratio: number | null = null,
): Rect {
  const isCorner = handle.length === 2;

  if (isCorner) {
    const east = handle.includes('e');
    const south = handle.includes('s');
    const ax = east ? r.x : r.x + r.w; // anchor = opposite corner
    const ay = south ? r.y : r.y + r.h;
    const mx = (east ? r.x + r.w : r.x) + dx;
    const my = (south ? r.y + r.h : r.y) + dy;
    const sx = east ? 1 : -1;
    const sy = south ? 1 : -1;
    const availW = east ? bounds.w - ax : ax;
    const availH = south ? bounds.h - ay : ay;

    let w = Math.max(0, sx * (mx - ax));
    let h = Math.max(0, sy * (my - ay));

    if (ratio && ratio > 0) {
      w = Math.max(w, h * ratio);
      const minW = Math.max(minSize, minSize * ratio);
      w = Math.max(w, minW);
      h = w / ratio;
      if (w > availW) {
        w = availW;
        h = w / ratio;
      }
      if (h > availH) {
        h = availH;
        w = h * ratio;
      }
    } else {
      w = clamp(Math.max(w, minSize), 0, availW);
      h = clamp(Math.max(h, minSize), 0, availH);
    }
    return { x: east ? ax : ax - w, y: south ? ay : ay - h, w, h };
  }

  if (ratio && ratio > 0) return r;
  let left = r.x;
  let top = r.y;
  let right = r.x + r.w;
  let bottom = r.y + r.h;
  if (handle === 'w') left = clamp(left + dx, 0, right - minSize);
  if (handle === 'e') right = clamp(right + dx, left + minSize, bounds.w);
  if (handle === 'n') top = clamp(top + dy, 0, bottom - minSize);
  if (handle === 's') bottom = clamp(bottom + dy, top + minSize, bounds.h);
  return { x: left, y: top, w: right - left, h: bottom - top };
}

/** Largest centred rect of aspect `ratio` (w / h) that fits in bounds. */
export function fitRectToAspect(bounds: Size, ratio: number): Rect {
  let w = bounds.w;
  let h = w / ratio;
  if (h > bounds.h) {
    h = bounds.h;
    w = h * ratio;
  }
  return { x: (bounds.w - w) / 2, y: (bounds.h - h) / 2, w, h };
}

function area(r: Rect): number {
  return Math.max(0, r.w) * Math.max(0, r.h);
}

export function intersectionArea(a: Rect, b: Rect): number {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}

export function iou(a: Rect, b: Rect): number {
  const inter = intersectionArea(a, b);
  const union = area(a) + area(b) - inter;
  return union > 0 ? inter / union : 0;
}

function union(a: Rect, b: Rect): Rect {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    w: Math.max(a.x + a.w, b.x + b.w) - x,
    h: Math.max(a.y + a.h, b.y + b.h) - y,
  };
}

/**
 * Merge detections from overlapping passes. Two boxes merge when their IoU
 * reaches `iouThreshold`, or when one is mostly inside the other
 * (intersection / smaller area >= `containment`). Repeats until stable.
 */
export function mergeBoxes(
  boxes: Rect[],
  opts: { iouThreshold?: number; containment?: number } = {},
): Rect[] {
  const iouThreshold = opts.iouThreshold ?? 0.3;
  const containment = opts.containment ?? 0.7;
  let list = boxes.map((b) => ({ ...b }));
  let changed = true;
  while (changed) {
    changed = false;
    outer: for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const inter = intersectionArea(list[i], list[j]);
        const smaller = Math.min(area(list[i]), area(list[j]));
        const contained = smaller > 0 && inter / smaller >= containment;
        if (iou(list[i], list[j]) >= iouThreshold || contained) {
          const merged = union(list[i], list[j]);
          list = list.filter((_, k) => k !== i && k !== j);
          list.push(merged);
          changed = true;
          break outer;
        }
      }
    }
  }
  return list;
}

/** Grow a rect by `pct` of its size on every side, clipped to bounds. */
export function padRect(r: Rect, pct: number, bounds: Size): Rect {
  const px = r.w * pct;
  const py = r.h * pct;
  const x = clamp(r.x - px, 0, bounds.w);
  const y = clamp(r.y - py, 0, bounds.h);
  const right = clamp(r.x + r.w + px, 0, bounds.w);
  const bottom = clamp(r.y + r.h + py, 0, bounds.h);
  return { x, y, w: right - x, h: bottom - y };
}

/** Fit an image inside a box (contain), never upscaling past `maxScale`. */
export function containSize(img: Size, box: Size, maxScale = Infinity): Size {
  if (img.w <= 0 || img.h <= 0 || box.w <= 0 || box.h <= 0) return { w: 0, h: 0 };
  const s = Math.min(box.w / img.w, box.h / img.h, maxScale);
  return { w: Math.floor(img.w * s), h: Math.floor(img.h * s) };
}

/** Scale so the long edge is at most `maxEdge`. Returns the new size. */
export function downscaleSize(img: Size, maxEdge: number): Size {
  const long = Math.max(img.w, img.h);
  if (long <= maxEdge) return { w: img.w, h: img.h };
  const s = maxEdge / long;
  return { w: Math.max(1, Math.round(img.w * s)), h: Math.max(1, Math.round(img.h * s)) };
}

/** Map a pointer position (client px) onto image pixels. */
export function clientToImage(
  clientX: number,
  clientY: number,
  el: { left: number; top: number; width: number; height: number },
  img: Size,
): { x: number; y: number } {
  if (el.width <= 0 || el.height <= 0) return { x: 0, y: 0 };
  return {
    x: ((clientX - el.left) / el.width) * img.w,
    y: ((clientY - el.top) / el.height) * img.h,
  };
}

/**
 * Overlapping cols x rows grid of tiles covering the image. `overlap` is the
 * fraction of a tile shared with its neighbour (0.25 = quarter-tile).
 */
export function tileRects(img: Size, cols: number, rows: number, overlap = 0.25): Rect[] {
  // tile size t satisfies: cols*t - (cols-1)*overlap*t = img.w
  const tw = img.w / (cols - (cols - 1) * overlap);
  const th = img.h / (rows - (rows - 1) * overlap);
  const out: Rect[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = cols === 1 ? 0 : c * tw * (1 - overlap);
      const y = rows === 1 ? 0 : r * th * (1 - overlap);
      out.push({ x, y, w: Math.min(tw, img.w - x), h: Math.min(th, img.h - y) });
    }
  }
  return out;
}

/** Brush diameter in image px from a 1..100 slider. */
export function brushPx(longEdge: number, slider: number): number {
  const v = clamp(slider, 1, 100) / 100;
  return Math.max(4, longEdge * (0.012 + 0.16 * v * v));
}

/** Pixelate block size in image px from a 1..100 slider. */
export function blockSizeFor(longEdge: number, slider: number): number {
  const v = clamp(slider, 1, 100) / 100;
  return Math.max(2, Math.round(longEdge * (0.004 + 0.046 * v)));
}

/** Blur radius in image px from a 1..100 slider. */
export function blurRadiusFor(longEdge: number, slider: number): number {
  const v = clamp(slider, 1, 100) / 100;
  return Math.max(2, longEdge * (0.004 + 0.036 * v));
}
