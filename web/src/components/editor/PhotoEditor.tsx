'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Crop as CropIcon,
  Download,
  Eye,
  Grid3x3,
  Droplet,
  ImagePlus,
  Loader2,
  Redo2,
  RotateCcw,
  ScanFace,
  Share2,
  Undo2,
  X,
} from 'lucide-react';
import { EditorEngine, type PaintMode } from './EditorEngine';
import { CropOverlay } from './CropOverlay';
import {
  brushPx,
  clientToImage,
  containSize,
  downscaleSize,
  fitRectToAspect,
  padRect,
  type Rect,
} from '@/lib/editor/geometry';
import { dataUrlToBlob, imageUrlFromGenerationResult } from '@/lib/editor/files';

const MAX_EDGE = 2560;
const PINK = '#ff2d7a';
const PRIVACY = 'Runs in your browser. Your photo never leaves this device.';

type Tool = 'faces' | 'blur' | 'pixelate' | 'crop';

const RATIOS: { key: string; label: string; ratio: number | null }[] = [
  { key: 'free', label: 'Free', ratio: null },
  { key: '1:1', label: '1:1', ratio: 1 },
  { key: '4:5', label: '4:5', ratio: 4 / 5 },
  { key: '9:16', label: '9:16', ratio: 9 / 16 },
  { key: '16:9', label: '16:9', ratio: 16 / 9 },
];

const display = { fontFamily: 'var(--font-display)' } as const;
const mono = { fontFamily: 'var(--font-mono)' } as const;
const body = { fontFamily: 'var(--font-body)' } as const;

async function decodeBlob(blob: Blob): Promise<HTMLCanvasElement> {
  let bmp: ImageBitmap | HTMLImageElement;
  try {
    // EXIF orientation is applied here, so phone photos come out upright.
    bmp = await createImageBitmap(blob, { imageOrientation: 'from-image' });
  } catch {
    const url = URL.createObjectURL(blob);
    try {
      bmp = await new Promise<HTMLImageElement>((res, rej) => {
        const im = new Image();
        im.onload = () => res(im);
        im.onerror = () => rej(new Error('decode'));
        im.src = url;
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  const sw = 'naturalWidth' in bmp ? bmp.naturalWidth : bmp.width;
  const sh = 'naturalHeight' in bmp ? bmp.naturalHeight : bmp.height;
  const { w, h } = downscaleSize({ w: sw, h: sh }, MAX_EDGE);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bmp, 0, 0, w, h);
  if ('close' in bmp) bmp.close();
  return c;
}

function IconBtn(props: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <button
      type="button"
      aria-label={props.label}
      title={props.label}
      data-testid={props.testId}
      disabled={props.disabled}
      onClick={props.onClick}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition active:bg-[#16171b] disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-[#ff2d7a]"
    >
      {props.children}
    </button>
  );
}

function SliderRow(props: { label: string; value: number; onChange: (v: number) => void; testId: string }) {
  return (
    <label className="flex h-11 items-center gap-3">
      <span className="w-[68px] shrink-0 text-[11px] uppercase tracking-wider text-white/60" style={mono}>
        {props.label}
      </span>
      <input
        type="range"
        min={1}
        max={100}
        value={props.value}
        data-testid={props.testId}
        aria-label={props.label}
        onChange={(e) => props.onChange(Number(e.target.value))}
        className="h-11 min-w-0 flex-1 cursor-pointer"
        style={{ accentColor: PINK, touchAction: 'pan-y' }}
      />
      <span className="w-8 shrink-0 text-right text-[11px] text-white/60" style={mono}>
        {props.value}
      </span>
    </label>
  );
}

export default function PhotoEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<EditorEngine | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const painting = useRef<{ x: number; y: number } | null>(null);

  const [hasImage, setHasImage] = useState(false);
  const [tool, setTool] = useState<Tool>('blur');
  const [sizeV, setSizeV] = useState(40);
  const [blurV, setBlurV] = useState(70);
  const [pixV, setPixV] = useState(50);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [, setTick] = useState(0);
  const [cropRect, setCropRect] = useState<Rect | null>(null);
  const [ratioKey, setRatioKey] = useState('free');
  const [dragOver, setDragOver] = useState(false);
  const [sheet, setSheet] = useState<{ blob: Blob | null; canShare: boolean } | null>(null);

  // ---- engine lifecycle ---------------------------------------------------
  useEffect(() => {
    const eng = new EditorEngine(canvasRef.current!);
    eng.onChange = () => setTick((t) => t + 1);
    engineRef.current = eng;
    return () => eng.destroy();
  }, []);

  // The page itself must never scroll.
  useEffect(() => {
    const b = document.body.style.overflow;
    const h = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = b;
      document.documentElement.style.overflow = h;
    };
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth - 32, h: el.clientHeight - 32 }));
    ro.observe(el);
    setBox({ w: el.clientWidth - 32, h: el.clientHeight - 32 });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    engineRef.current?.setStrength('blur', blurV);
  }, [blurV]);
  useEffect(() => {
    engineRef.current?.setStrength('pixelate', pixV);
  }, [pixV]);

  // ---- loading a photo ----------------------------------------------------
  const loadBlob = useCallback(async (blob: Blob) => {
    try {
      setBusy('Opening photo');
      setMessage('');
      const canvas = await decodeBlob(blob);
      engineRef.current!.load(canvas);
      setHasImage(true);
      setTool('blur');
      setCropRect(null);
      setSheet(null);
    } catch {
      setMessage('That file could not be opened. Try a JPG, PNG or WebP photo.');
    } finally {
      setBusy(null);
    }
  }, []);

  const loadFile = useCallback(
    (f: File | null | undefined) => {
      if (!f) return;
      if (!f.type.startsWith('image/') && !/\.(heic|heif|jpe?g|png|webp|gif|avif)$/i.test(f.name)) {
        setMessage('Please choose an image file.');
        return;
      }
      void loadBlob(f);
    },
    [loadBlob],
  );

  // ?from=result hand-over from the generate result page.
  useEffect(() => {
    let from = '';
    try {
      from = new URLSearchParams(window.location.search).get('from') ?? '';
    } catch {}
    if (from !== 'result') return;
    let raw: string | null = null;
    try {
      raw = localStorage.getItem('generationResult');
    } catch {}
    const url = imageUrlFromGenerationResult(raw);
    if (!url) {
      setMessage('No generated image found. Choose a photo instead.');
      return;
    }
    (async () => {
      try {
        // data: URLs are decoded locally. An https URL is the generated image
        // being downloaded to this device, never an upload of anything.
        const blob = url.startsWith('data:') ? dataUrlToBlob(url) : await (await fetch(url)).blob();
        if (!blob) throw new Error('bad data url');
        await loadBlob(blob);
      } catch {
        setMessage('Could not open the generated image. Choose a photo instead.');
      }
    })();
  }, [loadBlob]);

  // paste (desktop)
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const f = Array.from(e.clipboardData?.files ?? []).find((x) => x.type.startsWith('image/'));
      if (f) {
        e.preventDefault();
        loadFile(f);
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [loadFile]);

  // undo / redo shortcuts (desktop)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z') return;
      e.preventDefault();
      if (e.shiftKey) engineRef.current?.redo();
      else engineRef.current?.undo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ---- tools ----------------------------------------------------------------
  const eng = engineRef.current;
  const imgW = eng?.width ?? 0;
  const imgH = eng?.height ?? 0;
  const css = hasImage ? containSize({ w: imgW, h: imgH }, box) : { w: 0, h: 0 };
  const k = imgW ? css.w / imgW : 1;

  const runFaces = async () => {
    const e = engineRef.current;
    if (!e?.loaded || busy) return;
    setTool('faces');
    setMessage('');
    try {
      setBusy('Loading face model (first time only)');
      const { loadFaceDetector, detectFaces } = await import('./faces');
      await loadFaceDetector();
      setBusy('Finding faces');
      const found = await detectFaces(e.source);
      const padded = found.map((b) => padRect(b, 0.2, { w: e.width, h: e.height }));
      if (!padded.length) {
        setMessage('No faces found. Use the Blur brush to cover anything by hand.');
        setTool('blur');
      } else {
        e.stampEllipses(padded);
        e.commit();
        setMessage(`${padded.length} ${padded.length === 1 ? 'face' : 'faces'} blurred`);
      }
    } catch {
      setMessage('Face detection could not load. Check your connection, or use the Blur brush.');
      setTool('blur');
    } finally {
      setBusy(null);
    }
  };

  const chooseTool = (t: Tool) => {
    if (t === 'faces') {
      void runFaces();
      return;
    }
    setMessage('');
    setTool(t);
    if (t === 'crop' && eng?.loaded) {
      setRatioKey('free');
      setCropRect({ x: 0, y: 0, w: eng.width, h: eng.height });
    }
  };

  const pickRatio = (key: string, ratio: number | null) => {
    setRatioKey(key);
    if (ratio && eng) setCropRect(fitRectToAspect({ w: eng.width, h: eng.height }, ratio));
  };

  const applyCrop = () => {
    if (!eng || !cropRect) return;
    eng.crop(cropRect);
    setCropRect(null);
    setTool('blur');
    setMessage('Cropped');
  };

  // ---- painting -------------------------------------------------------------
  const paintMode: PaintMode | null = tool === 'blur' ? 'blur' : tool === 'pixelate' ? 'pixelate' : null;
  const diameter = eng?.loaded ? brushPx(Math.max(imgW, imgH), sizeV) : 0;

  const pt = (e: React.PointerEvent) =>
    clientToImage(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect(), { w: imgW, h: imgH });

  const moveRing = (e: React.PointerEvent) => {
    const ring = ringRef.current;
    if (!ring) return;
    if (e.pointerType === 'touch' || !paintMode) {
      ring.style.display = 'none';
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    ring.style.display = 'block';
    ring.style.left = `${e.clientX - r.left}px`;
    ring.style.top = `${e.clientY - r.top}px`;
  };

  const onDown = (e: React.PointerEvent) => {
    if (!paintMode || !eng?.loaded || busy) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = pt(e);
    painting.current = p;
    eng.stroke(paintMode, p, p, diameter);
    moveRing(e);
  };
  const onMove = (e: React.PointerEvent) => {
    moveRing(e);
    if (!painting.current || !paintMode || !eng) return;
    const p = pt(e);
    eng.stroke(paintMode, painting.current, p, diameter);
    painting.current = p;
  };
  const onUp = () => {
    if (painting.current && eng) {
      painting.current = null;
      eng.commit();
    }
  };

  // ---- save -------------------------------------------------------------------
  const openSave = async () => {
    if (!eng?.loaded) return;
    setSheet({ blob: null, canShare: false });
    try {
      const blob = await eng.exportBlob();
      let canShare = false;
      try {
        const f = new File([blob], 'photo.png', { type: 'image/png' });
        canShare = !!(navigator.canShare && navigator.canShare({ files: [f] }) && navigator.share);
      } catch {}
      setSheet({ blob, canShare });
    } catch {
      setSheet(null);
      setMessage('Could not export the photo.');
    }
  };

  const download = () => {
    if (!sheet?.blob) return;
    const url = URL.createObjectURL(sheet.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blurred-photo.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    setMessage('Saved as blurred-photo.png');
    setSheet(null);
  };

  const share = async () => {
    if (!sheet?.blob) return;
    try {
      const f = new File([sheet.blob], 'blurred-photo.png', { type: 'image/png' });
      await navigator.share({ files: [f] });
      setSheet(null);
    } catch (err) {
      // AbortError = user closed the share sheet; anything else falls back to download
      if ((err as Error)?.name !== 'AbortError') download();
    }
  };

  // ---- render ----------------------------------------------------------------
  const toolBtn = (t: Tool, label: string, icon: React.ReactNode, testId: string) => {
    const active = tool === t;
    return (
      <button
        key={t}
        type="button"
        data-testid={testId}
        aria-pressed={active}
        onClick={() => chooseTool(t)}
        disabled={!!busy && t !== tool}
        className="relative flex h-[60px] min-w-0 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition active:bg-[#16171b] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-[#ff2d7a]"
        style={{ ...display, color: active ? PINK : '#fff' }}
      >
        {active && <span className="absolute inset-x-5 top-0 h-[3px] rounded-b-full" style={{ background: PINK }} />}
        {icon}
        <span className="truncate">{label}</span>
      </button>
    );
  };

  const edited = !!eng?.isEdited;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-black text-white select-none"
      style={{
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        ...body,
        WebkitTouchCallout: 'none',
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        loadFile(e.dataTransfer.files?.[0]);
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        data-testid="file-input"
        onChange={(e) => {
          loadFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {/* top bar */}
      <header className="flex h-14 shrink-0 items-center gap-1 px-2" style={{ visibility: hasImage ? 'visible' : 'hidden' }}>
        <IconBtn label="Choose another photo" onClick={() => fileRef.current?.click()} testId="new-photo">
          <ImagePlus size={22} />
        </IconBtn>
        <IconBtn label="Undo" onClick={() => eng?.undo()} disabled={!eng?.canUndo} testId="undo">
          <Undo2 size={22} />
        </IconBtn>
        <IconBtn label="Redo" onClick={() => eng?.redo()} disabled={!eng?.canRedo} testId="redo">
          <Redo2 size={22} />
        </IconBtn>
        <IconBtn label="Reset to original" onClick={() => eng?.reset()} disabled={!edited} testId="reset">
          <RotateCcw size={21} />
        </IconBtn>
        <div className="flex-1" />
        <button
          type="button"
          aria-label="Hold to compare with the original"
          data-testid="compare"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white active:bg-[#16171b] focus-visible:outline-2 focus-visible:outline-[#ff2d7a]"
          style={{ touchAction: 'none' }}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            eng?.setComparing(true);
          }}
          onPointerUp={() => eng?.setComparing(false)}
          onPointerCancel={() => eng?.setComparing(false)}
        >
          <Eye size={22} />
        </button>
        <button
          type="button"
          data-testid="save"
          onClick={openSave}
          className="ml-1 flex h-11 min-w-[76px] shrink-0 items-center justify-center gap-1.5 rounded-xl px-4 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          style={{ background: PINK, ...display }}
        >
          Save
        </button>
      </header>

      {/* stage */}
      <div ref={stageRef} className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden" data-testid="stage">
        <div
          className="relative"
          data-testid="canvas-wrap"
          style={{
            width: css.w,
            height: css.h,
            display: hasImage ? 'block' : 'none',
            touchAction: 'none',
            cursor: paintMode ? 'none' : 'default',
          }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={() => {
            if (ringRef.current) ringRef.current.style.display = 'none';
          }}
        >
          <canvas
            ref={canvasRef}
            data-testid="canvas"
            className="block"
            style={{ width: css.w, height: css.h, touchAction: 'none' }}
          />
          <div
            ref={ringRef}
            className="pointer-events-none absolute hidden rounded-full"
            style={{
              width: diameter * k,
              height: diameter * k,
              transform: 'translate(-50%,-50%)',
              border: '2px solid #fff',
              boxShadow: '0 0 0 1px #000',
            }}
          />
          {tool === 'crop' && cropRect && (
            <CropOverlay
              rect={cropRect}
              img={{ w: imgW, h: imgH }}
              k={k}
              ratio={RATIOS.find((r) => r.key === ratioKey)?.ratio ?? null}
              onChange={setCropRect}
            />
          )}
        </div>

        {/* empty state */}
        {!hasImage && (
          <div className="flex w-full max-w-sm flex-col items-center px-6 text-center">
            <div
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-[#0d0e11]"
              style={{ color: PINK }}
            >
              <ScanFace size={40} />
            </div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight" style={display}>
              Blur a face in any photo
            </h1>
            <p className="mt-3 text-[15px] leading-snug text-white/70">
              Auto-blur faces, paint blur or pixels over anything else, crop, and save. Free, no sign-up.
            </p>
            <button
              type="button"
              data-testid="choose"
              onClick={() => fileRef.current?.click()}
              className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              style={{ background: PINK, ...display }}
            >
              <ImagePlus size={22} /> Choose a photo
            </button>
            <p className="mt-3 hidden text-xs text-white/45 md:block">or drop or paste an image here</p>
            <p className="mt-6 text-xs text-white/60" style={mono}>
              {PRIVACY}
            </p>
          </div>
        )}

        {/* status toast */}
        <div className="pointer-events-none absolute inset-x-0 top-2 flex justify-center px-4" aria-live="polite" role="status">
          {(busy || message) && (
            <div
              data-testid="status"
              className="flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-[#16171b] px-4 py-2 text-[13px] font-medium"
            >
              {busy ? (
                <Loader2 size={16} className="shrink-0 animate-spin" style={{ color: PINK }} />
              ) : (
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: PINK }} />
              )}
              <span className="min-w-0">{busy ? `${busy}...` : message}</span>
            </div>
          )}
        </div>

        {dragOver && (
          <div className="absolute inset-2 flex items-center justify-center rounded-2xl border-2 border-dashed text-lg font-bold" style={{ borderColor: PINK, ...display }}>
            Drop your photo
          </div>
        )}
      </div>

      {/* tools */}
      {hasImage && (
        <div className="shrink-0 border-t border-white/10 bg-[#0d0e11]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="mx-auto h-[124px] w-full max-w-xl px-4 py-2" data-testid="panel">
            {(tool === 'blur' || tool === 'pixelate') && (
              <>
                <SliderRow label="Size" value={sizeV} onChange={setSizeV} testId="size" />
                {tool === 'blur' ? (
                  <SliderRow label="Strength" value={blurV} onChange={setBlurV} testId="strength" />
                ) : (
                  <SliderRow label="Blocks" value={pixV} onChange={setPixV} testId="strength" />
                )}
                <p className="text-[11px] text-white/45" style={mono}>
                  Drag over the photo to paint
                </p>
              </>
            )}
            {tool === 'faces' && (
              <>
                <SliderRow label="Strength" value={blurV} onChange={setBlurV} testId="strength" />
                <p className="mt-1 text-[13px] text-white/70" data-testid="faces-note">
                  {busy ?? (message || 'Tap Auto-blur to find faces.')}
                </p>
                <p className="mt-1 text-[11px] text-white/45" style={mono}>
                  {PRIVACY}
                </p>
              </>
            )}
            {tool === 'crop' && (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-5 gap-1.5">
                  {RATIOS.map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      data-testid={`ratio-${r.key}`}
                      aria-pressed={ratioKey === r.key}
                      onClick={() => pickRatio(r.key, r.ratio)}
                      className="h-11 rounded-xl border text-[13px] font-semibold focus-visible:outline-2 focus-visible:outline-[#ff2d7a]"
                      style={{
                        ...display,
                        borderColor: ratioKey === r.key ? PINK : 'rgba(255,255,255,0.12)',
                        color: ratioKey === r.key ? PINK : '#fff',
                        background: '#16171b',
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    data-testid="crop-cancel"
                    onClick={() => {
                      setCropRect(null);
                      setTool('blur');
                    }}
                    className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#16171b] text-sm font-semibold focus-visible:outline-2 focus-visible:outline-[#ff2d7a]"
                    style={display}
                  >
                    <X size={18} /> Cancel
                  </button>
                  <button
                    type="button"
                    data-testid="crop-apply"
                    onClick={applyCrop}
                    className="flex h-11 items-center justify-center rounded-xl text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    style={{ background: PINK, ...display }}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
          <nav className="grid grid-cols-4" aria-label="Tools">
            {toolBtn('faces', 'Auto-blur', <ScanFace size={22} />, 'tool-faces')}
            {toolBtn('blur', 'Blur', <Droplet size={22} />, 'tool-blur')}
            {toolBtn('pixelate', 'Pixelate', <Grid3x3 size={22} />, 'tool-pixelate')}
            {toolBtn('crop', 'Crop', <CropIcon size={22} />, 'tool-crop')}
          </nav>
        </div>
      )}

      {/* save sheet */}
      {sheet && (
        <div className="absolute inset-0 z-10 flex items-end bg-black/70" onClick={() => setSheet(null)}>
          <div
            role="dialog"
            aria-label="Save photo"
            className="w-full rounded-t-3xl border-t border-white/10 bg-[#0d0e11] p-4"
            style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold" style={display}>
              Save your photo
            </h2>
            <p className="mb-4 mt-1 text-[13px] text-white/60">
              A fresh PNG is built from the pixels, so location and camera data are gone. It stays on this device.
            </p>
            {sheet.canShare && (
              <button
                type="button"
                data-testid="share"
                disabled={!sheet.blob}
                onClick={share}
                className="mb-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-bold text-white disabled:opacity-40"
                style={{ background: PINK, ...display }}
              >
                <Share2 size={20} /> Share or save to Photos
              </button>
            )}
            <button
              type="button"
              data-testid="download"
              disabled={!sheet.blob}
              onClick={download}
              className="mb-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-base font-bold text-white disabled:opacity-40"
              style={{ background: sheet.canShare ? '#16171b' : PINK, ...display }}
            >
              {sheet.blob ? <Download size={20} /> : <Loader2 size={20} className="animate-spin" />} Download PNG
            </button>
            <button
              type="button"
              onClick={() => setSheet(null)}
              className="flex h-11 w-full items-center justify-center rounded-xl text-sm text-white/70"
            >
              Close
            </button>
            <p className="mt-2 text-center text-[11px] text-white/45" style={mono}>
              {PRIVACY}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
