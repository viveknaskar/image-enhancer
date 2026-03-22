import { useState, useRef, useCallback } from 'react';
import type { MouseEvent } from 'react';
import { CropRect, CropHandle, DEFAULT_CROP } from '../types';

const MIN_SIZE = 0.02;

export interface ImageBounds { x: number; y: number; w: number; h: number; }

interface DragState { mx: number; my: number; crop: CropRect; }

export function useCrop() {
  const [cropMode, setCropMode] = useState(false);
  const [crop, setCropState] = useState<CropRect>(DEFAULT_CROP);
  const [isDragging, setIsDragging] = useState(false);

  // Mirror of crop state in a ref so event handlers always see the latest value
  // without needing it as a useCallback dependency.
  const cropRef = useRef<CropRect>(DEFAULT_CROP);
  const dragging = useRef<CropHandle | null>(null);
  const dragStart = useRef<DragState | null>(null);

  const setCrop = useCallback((next: CropRect) => {
    cropRef.current = next;
    setCropState(next);
  }, []);

  const toggleCropMode = useCallback(() => {
    setCrop(DEFAULT_CROP);
    setCropMode((v) => !v);
  }, [setCrop]);

  /** Reset crop selection and exit crop mode. Call on new image load and global reset. */
  const resetCrop = useCallback(() => {
    setCrop(DEFAULT_CROP);
    setCropMode(false);
  }, [setCrop]);

  const onHandleMouseDown = useCallback((handle: CropHandle, e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = handle;
    dragStart.current = { mx: e.clientX, my: e.clientY, crop: { ...cropRef.current } };
    setIsDragging(true);
  }, []);

  const onMouseMove = useCallback((e: MouseEvent, imageBounds: ImageBounds) => {
    if (!dragging.current || !dragStart.current || imageBounds.w === 0 || imageBounds.h === 0) return;

    const fdx = (e.clientX - dragStart.current.mx) / imageBounds.w;
    const fdy = (e.clientY - dragStart.current.my) / imageBounds.h;

    const s = dragStart.current.crop;
    let x = s.x, y = s.y, w = s.w, h = s.h;

    switch (dragging.current) {
      case 'move': x += fdx; y += fdy; break;
      case 'n':    y += fdy; h -= fdy; break;
      case 's':    h += fdy; break;
      case 'w':    x += fdx; w -= fdx; break;
      case 'e':    w += fdx; break;
      case 'nw':   x += fdx; y += fdy; w -= fdx; h -= fdy; break;
      case 'ne':   y += fdy; w += fdx; h -= fdy; break;
      case 'sw':   x += fdx; w -= fdx; h += fdy; break;
      case 'se':   w += fdx; h += fdy; break;
    }

    // Enforce minimum size
    if (w < MIN_SIZE) w = MIN_SIZE;
    if (h < MIN_SIZE) h = MIN_SIZE;

    // Clamp to image bounds [0, 1]
    x = Math.max(0, Math.min(x, 1 - w));
    y = Math.max(0, Math.min(y, 1 - h));
    w = Math.min(w, 1 - x);
    h = Math.min(h, 1 - y);

    setCrop({ x, y, w, h });
  }, [setCrop]);

  const onMouseUp = useCallback(() => {
    dragging.current = null;
    dragStart.current = null;
    setIsDragging(false);
  }, []);

  return { cropMode, toggleCropMode, crop, resetCrop, onHandleMouseDown, onMouseMove, onMouseUp, isDragging };
}
