import { useRef, useState, useLayoutEffect, useCallback } from 'react';
import type { MouseEvent } from 'react';
import { CropRect, CropHandle } from '../types';
import { ImageBounds } from '../hooks/useCrop';

interface CropOverlayProps {
  crop: CropRect;
  naturalWidth: number;
  naturalHeight: number;
  onHandleMouseDown: (handle: CropHandle, e: MouseEvent) => void;
  onMouseMove: (e: MouseEvent, bounds: ImageBounds) => void;
  onMouseUp: () => void;
  isDragging: boolean;
}

const HANDLES: CropHandle[] = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];

const HANDLE_POS: Record<string, { left: string; top: string }> = {
  nw: { left: '0%',   top: '0%'   },
  n:  { left: '50%',  top: '0%'   },
  ne: { left: '100%', top: '0%'   },
  w:  { left: '0%',   top: '50%'  },
  e:  { left: '100%', top: '50%'  },
  sw: { left: '0%',   top: '100%' },
  s:  { left: '50%',  top: '100%' },
  se: { left: '100%', top: '100%' },
};

const HANDLE_CURSOR: Record<string, string> = {
  nw: 'nwse-resize', n: 'ns-resize',  ne: 'nesw-resize',
  w:  'ew-resize',                    e:  'ew-resize',
  sw: 'nesw-resize', s: 'ns-resize',  se: 'nwse-resize',
};

function getImageBounds(container: HTMLDivElement, natW: number, natH: number): ImageBounds {
  const cW = container.clientWidth;
  const cH = container.clientHeight;
  if (natW === 0 || natH === 0) return { x: 0, y: 0, w: cW, h: cH };
  const scale = Math.min(cW / natW, cH / natH);
  const rW = natW * scale;
  const rH = natH * scale;
  return { x: (cW - rW) / 2, y: (cH - rH) / 2, w: rW, h: rH };
}

export function CropOverlay({
  crop, naturalWidth, naturalHeight,
  onHandleMouseDown, onMouseMove, onMouseUp, isDragging,
}: CropOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<ImageBounds>({ x: 0, y: 0, w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setBounds(getImageBounds(el, naturalWidth, naturalHeight));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [naturalWidth, naturalHeight]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    onMouseMove(e, bounds);
  }, [onMouseMove, bounds]);

  // Crop box position/size in px within the container
  const boxLeft   = bounds.x + crop.x * bounds.w;
  const boxTop    = bounds.y + crop.y * bounds.h;
  const boxWidth  = crop.w * bounds.w;
  const boxHeight = crop.h * bounds.h;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 select-none"
      style={{ cursor: isDragging ? 'crosshair' : 'default' }}
      onMouseMove={handleMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Dark overlay outside the crop box via box-shadow */}
      <div
        style={{
          position: 'absolute',
          left: boxLeft,
          top: boxTop,
          width: boxWidth,
          height: boxHeight,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
          border: '1.5px solid rgba(255,255,255,0.85)',
          boxSizing: 'content-box',
          cursor: 'move',
        }}
        onMouseDown={(e) => onHandleMouseDown('move', e)}
      >
        {/* Rule-of-thirds grid */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', left: 0, right: 0, top: '33.33%', height: 1, background: 'rgba(255,255,255,0.35)' }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: '66.66%', height: 1, background: 'rgba(255,255,255,0.35)' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '33.33%', width: 1, background: 'rgba(255,255,255,0.35)' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '66.66%', width: 1, background: 'rgba(255,255,255,0.35)' }} />
        </div>

        {/* 8 resize handles */}
        {HANDLES.map((handle) => (
          <div
            key={handle}
            onMouseDown={(e) => { e.stopPropagation(); onHandleMouseDown(handle, e); }}
            style={{
              position: 'absolute',
              left: HANDLE_POS[handle].left,
              top: HANDLE_POS[handle].top,
              transform: 'translate(-50%, -50%)',
              width: 10,
              height: 10,
              background: 'white',
              border: '2px solid #7c3aed',
              borderRadius: 2,
              cursor: HANDLE_CURSOR[handle],
            }}
          />
        ))}
      </div>

      {/* Dimension label */}
      <div
        style={{
          position: 'absolute',
          left: boxLeft,
          top: Math.max(0, boxTop - 26),
          pointerEvents: 'none',
        }}
        className="text-xs font-mono text-white bg-black/60 px-2 py-0.5 rounded"
      >
        {Math.round(crop.w * naturalWidth)} × {Math.round(crop.h * naturalHeight)} px
      </div>
    </div>
  );
}
