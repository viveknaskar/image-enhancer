export type ResizeMode = 'fit' | 'stretch' | 'crop';
export type ResizeUnit = 'px' | '%';
export type ExportFormat = 'auto' | 'jpg' | 'png' | 'webp';

export interface FilterState {
  brightness: number;
  contrast: number;
  saturation: number;
  sepia: number;
  grayscale: number;
  blur: number;
  sharpen: number;
  denoise: number;
  quality: number;
}

export const FILTER_DEFAULTS: FilterState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sepia: 0,
  grayscale: 0,
  blur: 0,
  sharpen: 0,
  denoise: 0,
  quality: 90,
};

/** MIME types that support transparency — exported as PNG in auto mode */
export const TRANSPARENT_MIME_TYPES = new Set([
  'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/tiff',
]);
