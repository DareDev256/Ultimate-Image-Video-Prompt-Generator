'use client';

import { useRef } from 'react';
import { moveRect, resizeRect, type Handle, type Rect, type Size } from '@/lib/editor/geometry';

interface Props {
  rect: Rect;
  img: Size;
  /** css px per image px */
  k: number;
  ratio: number | null;
  onChange: (r: Rect) => void;
}

type Drag = { kind: 'move' } | { kind: 'resize'; handle: Handle };

const PINK = '#ff2d7a';

const corners: { h: Handle; style: React.CSSProperties; mark: React.CSSProperties }[] = [
  { h: 'nw', style: { left: -22, top: -22 }, mark: { left: 22, top: 22, borderLeft: `3px solid ${PINK}`, borderTop: `3px solid ${PINK}` } },
  { h: 'ne', style: { right: -22, top: -22 }, mark: { right: 22, top: 22, borderRight: `3px solid ${PINK}`, borderTop: `3px solid ${PINK}` } },
  { h: 'sw', style: { left: -22, bottom: -22 }, mark: { left: 22, bottom: 22, borderLeft: `3px solid ${PINK}`, borderBottom: `3px solid ${PINK}` } },
  { h: 'se', style: { right: -22, bottom: -22 }, mark: { right: 22, bottom: 22, borderRight: `3px solid ${PINK}`, borderBottom: `3px solid ${PINK}` } },
];

const edges: { h: Handle; style: React.CSSProperties; pill: React.CSSProperties }[] = [
  { h: 'n', style: { left: '50%', top: -22, marginLeft: -22 }, pill: { width: 26, height: 4 } },
  { h: 's', style: { left: '50%', bottom: -22, marginLeft: -22 }, pill: { width: 26, height: 4 } },
  { h: 'w', style: { top: '50%', left: -22, marginTop: -22 }, pill: { width: 4, height: 26 } },
  { h: 'e', style: { top: '50%', right: -22, marginTop: -22 }, pill: { width: 4, height: 26 } },
];

export function CropOverlay({ rect, img, k, ratio, onChange }: Props) {
  const start = useRef<{ x: number; y: number; rect: Rect; drag: Drag } | null>(null);

  const down = (drag: Drag) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY, rect, drag };
  };
  const move = (e: React.PointerEvent) => {
    const s = start.current;
    if (!s) return;
    const dx = (e.clientX - s.x) / k;
    const dy = (e.clientY - s.y) / k;
    if (s.drag.kind === 'move') onChange(moveRect(s.rect, dx, dy, img));
    else onChange(resizeRect(s.rect, s.drag.handle, dx, dy, img, 24, ratio));
  };
  const up = () => {
    start.current = null;
  };

  const common = { onPointerMove: move, onPointerUp: up, onPointerCancel: up };

  return (
    <div
      data-testid="crop-box"
      className="absolute"
      style={{
        left: rect.x * k,
        top: rect.y * k,
        width: rect.w * k,
        height: rect.h * k,
        boxShadow: '0 0 0 9999px rgba(0,0,0,0.62)',
        outline: '1px solid rgba(255,255,255,0.85)',
        backgroundImage:
          'linear-gradient(to right, transparent 33.2%, rgba(255,255,255,.28) 33.3%, transparent 33.5%, transparent 66.5%, rgba(255,255,255,.28) 66.6%, transparent 66.8%), linear-gradient(to bottom, transparent 33.2%, rgba(255,255,255,.28) 33.3%, transparent 33.5%, transparent 66.5%, rgba(255,255,255,.28) 66.6%, transparent 66.8%)',
        touchAction: 'none',
        cursor: 'move',
      }}
      onPointerDown={down({ kind: 'move' })}
      {...common}
    >
      {!ratio &&
        edges.map((e) => (
          <div
            key={e.h}
            aria-label={`Crop ${e.h} edge`}
            className="absolute flex items-center justify-center"
            style={{ ...e.style, width: 44, height: 44, touchAction: 'none' }}
            onPointerDown={down({ kind: 'resize', handle: e.h })}
            {...common}
          >
            <span className="rounded-full bg-white" style={e.pill} />
          </div>
        ))}
      {corners.map((c) => (
        <div
          key={c.h}
          aria-label={`Crop ${c.h} corner`}
          className="absolute"
          style={{ ...c.style, width: 44, height: 44, touchAction: 'none' }}
          onPointerDown={down({ kind: 'resize', handle: c.h })}
          {...common}
        >
          <span className="absolute" style={{ width: 18, height: 18, ...c.mark }} />
        </div>
      ))}
    </div>
  );
}
