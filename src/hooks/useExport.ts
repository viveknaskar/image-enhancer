import { useState, useCallback } from 'react';
import { ExportFormat, TRANSPARENT_MIME_TYPES } from '../types';

export function useExport(imageType: string) {
  const [format, setFormat] = useState<ExportFormat>('auto');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fileName, setFileName] = useState('enhanced-image');

  const getMimeType = useCallback((): string => {
    if (format === 'jpg') return 'image/jpeg';
    if (format === 'png') return 'image/png';
    if (format === 'webp') return 'image/webp';
    return TRANSPARENT_MIME_TYPES.has(imageType) ? 'image/png' : 'image/jpeg';
  }, [format, imageType]);

  const getExtension = useCallback((): string => {
    const mime = getMimeType();
    if (mime === 'image/jpeg') return 'jpg';
    if (mime === 'image/webp') return 'webp';
    return 'png';
  }, [getMimeType]);

  return { format, setFormat, bgColor, setBgColor, fileName, setFileName, getMimeType, getExtension };
}
