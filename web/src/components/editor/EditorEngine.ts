/**
 * Canvas engine for the photo editor. All pixels stay on this device.
 *
 * Model: an immutable `base` canvas (the photo, possibly cropped) plus two
 * mask canvases (blur, pixelate). The visible image is always composited
 * from the base: blurred copy shown through the blur mask, pixelated copy
 * shown through the pixelate mask. So strength changes and repeated strokes
 * never degrade the photo. History stores only the masks (1 byte/pixel) and a
 * reference to the base canvas.
 */
import { boxBlurRGBA } from '@/lib/editor/blur';
import {
  blockSizeFor,
  blurRadiusFor,
  type Rect,
} from '@/lib/editor/geometry';
import { alphaToRgba, extractAlpha, hasAnyAlpha } from '@/lib/editor/mask';
import { HistoryStack } from '@/lib/editor/history';

const MASK_MAX_EDGE = 1280;
const DISPLAY_MAX_EDGE = 1800;

export type PaintMode = 'blur' | 'pixelate';

interface Snapshot {
  base: HTMLCanvasElement;
  mw: number;
  mh: number;
  blur: Uint8Array;
  pix: Uint8Array;
}

function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

export class EditorEngine {
  readonly display: HTMLCanvasElement;
  private base!: HTMLCanvasElement;
  private blurMask!: HTMLCanvasElement;
  private pixMask!: HTMLCanvasElement;
  private blurLayer: HTMLCanvasElement | null = null;
  private pixLayer: HTMLCanvasElement | null = null;
  private blurDirty = true;
  private pixDirty = true;
  private hasBlur = false;
  private hasPix = false;
  private scratch: HTMLCanvasElement | null = null;
  private history = new HistoryStack<Snapshot>(30);
  private blurStrength = 70;
  private pixStrength = 50;
  private raf = 0;
  private comparing = false;
  /** Called after every history / size change so React can refresh buttons. */
  onChange: () => void = () => {};

  constructor(display: HTMLCanvasElement) {
    this.display = display;
  }

  // ---- state -------------------------------------------------------------
  get width(): number {
    return this.base?.width ?? 0;
  }
  get height(): number {
    return this.base?.height ?? 0;
  }
  get loaded(): boolean {
    return !!this.base;
  }
  get canUndo(): boolean {
    return this.history.canUndo;
  }
  get canRedo(): boolean {
    return this.history.canRedo;
  }
  get isEdited(): boolean {
    return this.hasBlur || this.hasPix || (this.history.first?.base !== this.base);
  }
  /** Source canvas for face detection (never mutated). */
  get source(): HTMLCanvasElement {
    return this.base;
  }

  load(source: HTMLCanvasElement): void {
    this.base = source;
    const ms = Math.min(1, MASK_MAX_EDGE / Math.max(source.width, source.height));
    this.blurMask = makeCanvas(source.width * ms, source.height * ms);
    this.pixMask = makeCanvas(source.width * ms, source.height * ms);
    this.hasBlur = this.hasPix = false;
    this.blurDirty = this.pixDirty = true;
    this.history.clear();
    this.history.push(this.snapshot());
    this.syncDisplaySize();
    this.requestRender();
    this.onChange();
  }

  setStrength(mode: PaintMode, v: number): void {
    if (mode === 'blur') {
      this.blurStrength = v;
      this.blurDirty = true;
    } else {
      this.pixStrength = v;
      this.pixDirty = true;
    }
    this.requestRender();
  }

  setComparing(v: boolean): void {
    this.comparing = v;
    this.requestRender();
  }

  // ---- painting ----------------------------------------------------------
  private maskScale(): number {
    return this.blurMask.width / this.base.width;
  }

  /** Soft round stamps along a segment, in image px. */
  stroke(mode: PaintMode, from: { x: number; y: number }, to: { x: number; y: number }, diameter: number): void {
    const mask = mode === 'blur' ? this.blurMask : this.pixMask;
    const ctx = mask.getContext('2d')!;
    const s = this.maskScale();
    const r = Math.max(1, (diameter * s) / 2);
    const dist = Math.hypot(to.x - from.x, to.y - from.y) * s;
    const step = Math.max(1, r * 0.25);
    const n = Math.max(1, Math.ceil(dist / step));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = (from.x + (to.x - from.x) * t) * s;
      const y = (from.y + (to.y - from.y) * t) * s;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.7, 'rgba(255,255,255,0.9)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (mode === 'blur') this.hasBlur = true;
    else this.hasPix = true;
    this.requestRender();
  }

  /** Soft-edged ellipses into the blur mask. Boxes are in image px. */
  stampEllipses(boxes: Rect[]): void {
    const ctx = this.blurMask.getContext('2d')!;
    const s = this.maskScale();
    for (const b of boxes) {
      const cx = (b.x + b.w / 2) * s;
      const cy = (b.y + b.h / 2) * s;
      const rx = (b.w / 2) * s * 1.08;
      const ry = (b.h / 2) * s * 1.08;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(rx, ry);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.78, 'rgba(255,255,255,1)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(-1, -1, 2, 2);
      ctx.restore();
    }
    if (boxes.length) this.hasBlur = true;
    this.requestRender();
  }

  /** Call when a stroke / action finishes: records an undo step. */
  commit(): void {
    this.history.push(this.snapshot());
    this.onChange();
  }

  // ---- crop --------------------------------------------------------------
  crop(rect: Rect): void {
    const r = {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      w: Math.max(1, Math.round(rect.w)),
      h: Math.max(1, Math.round(rect.h)),
    };
    const s = this.maskScale();
    const nb = makeCanvas(r.w, r.h);
    nb.getContext('2d')!.drawImage(this.base, r.x, r.y, r.w, r.h, 0, 0, r.w, r.h);
    const cropMask = (m: HTMLCanvasElement) => {
      const n = makeCanvas(r.w * s, r.h * s);
      n.getContext('2d')!.drawImage(m, r.x * s, r.y * s, r.w * s, r.h * s, 0, 0, n.width, n.height);
      return n;
    };
    const bm = cropMask(this.blurMask);
    const pm = cropMask(this.pixMask);
    this.base = nb;
    this.blurMask = bm;
    this.pixMask = pm;
    this.hasBlur = this.readAlpha(bm).some((v) => v > 0);
    this.hasPix = this.readAlpha(pm).some((v) => v > 0);
    this.blurDirty = this.pixDirty = true;
    this.history.push(this.snapshot());
    this.syncDisplaySize();
    this.requestRender();
    this.onChange();
  }

  // ---- history -----------------------------------------------------------
  undo(): void {
    const s = this.history.undo();
    if (s) this.restore(s);
  }
  redo(): void {
    const s = this.history.redo();
    if (s) this.restore(s);
  }
  /** Back to the untouched photo. Recorded as a step, so it can be undone. */
  reset(): void {
    const first = this.history.first;
    if (!first) return;
    this.restore(first);
    this.history.push(this.snapshot());
    this.onChange();
  }

  private readAlpha(c: HTMLCanvasElement): Uint8Array {
    return extractAlpha(c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data);
  }

  private snapshot(): Snapshot {
    return {
      base: this.base,
      mw: this.blurMask.width,
      mh: this.blurMask.height,
      blur: this.readAlpha(this.blurMask),
      pix: this.readAlpha(this.pixMask),
    };
  }

  private restore(s: Snapshot): void {
    const sameBase = this.base === s.base;
    this.base = s.base;
    const put = (alpha: Uint8Array) => {
      const c = makeCanvas(s.mw, s.mh);
      const id = new ImageData(alphaToRgba(alpha) as Uint8ClampedArray<ArrayBuffer>, s.mw, s.mh);
      c.getContext('2d')!.putImageData(id, 0, 0);
      return c;
    };
    this.blurMask = put(s.blur);
    this.pixMask = put(s.pix);
    this.hasBlur = hasAnyAlpha(s.blur);
    this.hasPix = hasAnyAlpha(s.pix);
    if (!sameBase) this.blurDirty = this.pixDirty = true;
    this.syncDisplaySize();
    this.requestRender();
    this.onChange();
  }

  // ---- layers + render ---------------------------------------------------
  private buildBlurLayer(): HTMLCanvasElement {
    const w = this.base.width;
    const h = this.base.height;
    const long = Math.max(w, h);
    const radius = blurRadiusFor(long, this.blurStrength);
    const f = Math.max(1, radius / 6);
    const sw = Math.max(1, Math.round(w / f));
    const sh = Math.max(1, Math.round(h / f));
    const small = makeCanvas(sw, sh);
    const sctx = small.getContext('2d', { willReadFrequently: true })!;
    sctx.imageSmoothingQuality = 'high';
    sctx.drawImage(this.base, 0, 0, sw, sh);
    const id = sctx.getImageData(0, 0, sw, sh);
    boxBlurRGBA(id.data, sw, sh, radius / f);
    sctx.putImageData(id, 0, 0);
    const out = makeCanvas(w, h);
    const octx = out.getContext('2d')!;
    octx.imageSmoothingEnabled = true;
    octx.imageSmoothingQuality = 'high';
    octx.drawImage(small, 0, 0, w, h);
    return out;
  }

  private buildPixLayer(): HTMLCanvasElement {
    const w = this.base.width;
    const h = this.base.height;
    const b = blockSizeFor(Math.max(w, h), this.pixStrength);
    const small = makeCanvas(Math.ceil(w / b), Math.ceil(h / b));
    const sctx = small.getContext('2d')!;
    sctx.imageSmoothingQuality = 'high';
    sctx.drawImage(this.base, 0, 0, small.width, small.height);
    const out = makeCanvas(w, h);
    const octx = out.getContext('2d')!;
    octx.imageSmoothingEnabled = false;
    octx.drawImage(small, 0, 0, small.width, small.height, 0, 0, small.width * b, small.height * b);
    return out;
  }

  private composeTo(ctx: CanvasRenderingContext2D, w: number, h: number, effects: boolean): void {
    ctx.clearRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(this.base, 0, 0, w, h);
    if (!effects) return;
    const layers: [boolean, () => HTMLCanvasElement, HTMLCanvasElement][] = [];
    if (this.hasBlur) {
      if (this.blurDirty || !this.blurLayer) {
        this.blurLayer = this.buildBlurLayer();
        this.blurDirty = false;
      }
      layers.push([true, () => this.blurLayer!, this.blurMask]);
    }
    if (this.hasPix) {
      if (this.pixDirty || !this.pixLayer) {
        this.pixLayer = this.buildPixLayer();
        this.pixDirty = false;
      }
      layers.push([true, () => this.pixLayer!, this.pixMask]);
    }
    if (!layers.length) return;
    if (!this.scratch) this.scratch = makeCanvas(w, h);
    if (this.scratch.width !== w || this.scratch.height !== h) {
      this.scratch.width = w;
      this.scratch.height = h;
    }
    const sctx = this.scratch.getContext('2d')!;
    for (const [, layer, mask] of layers) {
      sctx.globalCompositeOperation = 'source-over';
      sctx.clearRect(0, 0, w, h);
      sctx.drawImage(layer(), 0, 0, w, h);
      sctx.globalCompositeOperation = 'destination-in';
      sctx.drawImage(mask, 0, 0, w, h);
      ctx.drawImage(this.scratch, 0, 0);
    }
  }

  private syncDisplaySize(): void {
    const long = Math.max(this.base.width, this.base.height);
    const k = Math.min(1, DISPLAY_MAX_EDGE / long);
    const w = Math.max(1, Math.round(this.base.width * k));
    const h = Math.max(1, Math.round(this.base.height * k));
    if (this.display.width !== w) this.display.width = w;
    if (this.display.height !== h) this.display.height = h;
  }

  requestRender(): void {
    if (this.raf || typeof window === 'undefined') return;
    this.raf = window.requestAnimationFrame(() => {
      this.raf = 0;
      this.render();
    });
  }

  render(): void {
    if (!this.base) return;
    const ctx = this.display.getContext('2d')!;
    this.composeTo(ctx, this.display.width, this.display.height, !this.comparing);
  }

  /** Full-resolution composite, re-encoded from pixels (no metadata survives). */
  async exportBlob(): Promise<Blob> {
    const out = makeCanvas(this.base.width, this.base.height);
    this.composeTo(out.getContext('2d')!, out.width, out.height, true);
    return new Promise((resolve, reject) =>
      out.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode image'))), 'image/png'),
    );
  }

  destroy(): void {
    if (this.raf) window.cancelAnimationFrame(this.raf);
  }
}
