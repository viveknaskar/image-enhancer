import { useState, useCallback } from 'react';
import { ResizeMode, ResizeUnit } from '../types';

export function useResize() {
  const [enabled, setEnabled] = useState(false);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [unit, setUnit] = useState<ResizeUnit>('px');
  const [mode, setMode] = useState<ResizeMode>('fit');
  const [lockAspect, setLockAspect] = useState(true);
  const [originalDimensions, setOriginalDimensions] = useState<{ w: number; h: number } | null>(null);

  /** Call when a new image is loaded to set baseline dimensions. */
  const init = useCallback((w: number, h: number) => {
    setOriginalDimensions({ w, h });
    setWidth(w);
    setHeight(h);
    setEnabled(false);
  }, []);

  const reset = useCallback(() => {
    setEnabled(false);
    setOriginalDimensions((dims) => {
      if (dims) { setWidth(dims.w); setHeight(dims.h); }
      return dims;
    });
  }, []);

  const handleWidthChange = useCallback((val: number) => {
    setWidth(val);
    setOriginalDimensions((dims) => {
      if (lockAspect && dims && val > 0) {
        setHeight(unit === '%' ? val : Math.round((val * dims.h) / dims.w));
      }
      return dims;
    });
  }, [lockAspect, unit]);

  const handleHeightChange = useCallback((val: number) => {
    setHeight(val);
    setOriginalDimensions((dims) => {
      if (lockAspect && dims && val > 0) {
        setWidth(unit === '%' ? val : Math.round((val * dims.w) / dims.h));
      }
      return dims;
    });
  }, [lockAspect, unit]);

  const handleUnitChange = useCallback((newUnit: ResizeUnit) => {
    setUnit(newUnit);
    if (newUnit === '%') {
      setWidth(100);
      setHeight(100);
    } else {
      setOriginalDimensions((dims) => {
        if (dims) { setWidth(dims.w); setHeight(dims.h); }
        return dims;
      });
    }
  }, []);

  const getOutputDimensions = useCallback((rotation: number) => {
    if (!originalDimensions) return null;
    let outW = originalDimensions.w;
    let outH = originalDimensions.h;

    if (enabled) {
      if (unit === '%') {
        outW = Math.round(originalDimensions.w * width / 100);
        outH = Math.round(originalDimensions.h * height / 100);
      } else {
        const tw = width || originalDimensions.w;
        const th = height || originalDimensions.h;
        if (mode === 'stretch' || mode === 'crop') {
          outW = tw; outH = th;
        } else {
          const scale = Math.min(tw / originalDimensions.w, th / originalDimensions.h);
          outW = Math.round(originalDimensions.w * scale);
          outH = Math.round(originalDimensions.h * scale);
        }
      }
    }

    return rotation === 90 || rotation === 270 ? { w: outH, h: outW } : { w: outW, h: outH };
  }, [originalDimensions, enabled, unit, width, height, mode]);

  return {
    enabled, setEnabled,
    width, height, unit, mode, setMode,
    lockAspect, setLockAspect,
    originalDimensions,
    init, reset,
    handleWidthChange, handleHeightChange, handleUnitChange,
    getOutputDimensions,
  };
}
