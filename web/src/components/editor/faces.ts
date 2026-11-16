/**
 * Face detection, fully in the browser.
 *
 * Model: BlazeFace short-range (face_detector/blaze_face_short_range/float16/1)
 * from Google's mediapipe-models bucket, vendored at /models/. Licence:
 * Apache-2.0 (MediaPipe + model card). The WASM runtime loads from jsDelivr,
 * pinned to the same @mediapipe/tasks-vision version as package.json. Only
 * the runtime and model are downloaded; the photo is never sent anywhere.
 */
import { mergeBoxes, tileRects, type Rect } from '@/lib/editor/geometry';

const MP_VERSION = '1.2.0';
const WASM_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MP_VERSION}/wasm`;
const MODEL_URL = '/models/blaze_face_short_range.tflite';
const TILE_TARGET = 640;

type Detector = {
  detect: (img: HTMLCanvasElement) => {
    detections: { boundingBox?: { originX: number; originY: number; width: number; height: number } }[];
  };
};

let detectorPromise: Promise<Detector> | null = null;

export function loadFaceDetector(): Promise<Detector> {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      const { FaceDetector, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
      return (await FaceDetector.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' },
        runningMode: 'IMAGE',
        minDetectionConfidence: 0.55,
      })) as unknown as Detector;
    })().catch((e) => {
      detectorPromise = null;
      throw e;
    });
  }
  return detectorPromise;
}

/**
 * Detect on the whole image plus 2x2 and 3x3 overlapping tiles (each scaled
 * up), because the short-range model misses small faces in group shots.
 * Returns merged boxes in source pixel coordinates.
 */
export async function detectFaces(source: HTMLCanvasElement): Promise<Rect[]> {
  const detector = await loadFaceDetector();
  const size = { w: source.width, h: source.height };
  const passes: Rect[] = [
    { x: 0, y: 0, w: size.w, h: size.h },
    ...tileRects(size, 2, 2, 0.3),
    ...tileRects(size, 3, 3, 0.3),
  ];
  const found: Rect[] = [];
  const work = document.createElement('canvas');
  for (const p of passes) {
    const k = TILE_TARGET / Math.max(p.w, p.h);
    work.width = Math.max(1, Math.round(p.w * k));
    work.height = Math.max(1, Math.round(p.h * k));
    const ctx = work.getContext('2d')!;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(source, p.x, p.y, p.w, p.h, 0, 0, work.width, work.height);
    // let the UI paint between passes
    await new Promise((r) => setTimeout(r, 0));
    const res = detector.detect(work);
    for (const d of res.detections) {
      const b = d.boundingBox;
      if (!b) continue;
      found.push({ x: p.x + b.originX / k, y: p.y + b.originY / k, w: b.width / k, h: b.height / k });
    }
  }
  return mergeBoxes(found, { iouThreshold: 0.3, containment: 0.7 });
}
