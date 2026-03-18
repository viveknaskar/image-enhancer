import React, { useState, useCallback, useRef } from 'react';
import {
  Upload, Sliders, Download, ZoomIn, Sparkles,
  RotateCcw, RotateCw, FlipHorizontal, FlipVertical,
  Lock, Unlock, Maximize2,
} from 'lucide-react';

type ResizeMode = 'fit' | 'stretch' | 'crop';
type ResizeUnit = 'px' | '%';
type ExportFormat = 'auto' | 'jpg' | 'png' | 'webp';

interface FilterState {
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

const DEFAULTS: FilterState = {
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

function SliderRow({
  label,
  value,
  displayValue,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-xs font-mono bg-white/10 text-violet-300 px-2 py-0.5 rounded-md min-w-[52px] text-center">
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step ?? 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="text-violet-400">{icon}</div>
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</span>
      <div className="flex-1 h-px bg-white/5" />
    </div>
  );
}

function IconBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs transition-colors ${
        active
          ? 'bg-violet-600 text-white'
          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function App() {
  // Core image state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string>('image/jpeg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filters
  const [filters, setFilters] = useState<FilterState>(DEFAULTS);

  // Transform
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Resize
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [resizeWidth, setResizeWidth] = useState(0);
  const [resizeHeight, setResizeHeight] = useState(0);
  const [resizeUnit, setResizeUnit] = useState<ResizeUnit>('px');
  const [resizeMode, setResizeMode] = useState<ResizeMode>('fit');
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [originalDimensions, setOriginalDimensions] = useState<{ w: number; h: number } | null>(null);

  // Export
  const [exportFormat, setExportFormat] = useState<ExportFormat>('auto');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fileName, setFileName] = useState('enhanced-image');

  // ── Helpers ──────────────────────────────────────────────────────────────

  const buildFilterString = (f: FilterState = filters) => {
    const sharpen =
      f.sharpen > 0
        ? `url(data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg">
        <filter id="sharpen">
          <feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="
            0 -${f.sharpen} 0
            -${f.sharpen} ${1 + 4 * f.sharpen} -${f.sharpen}
            0 -${f.sharpen} 0
          "/>
        </filter>
      </svg>
    `)}#sharpen)`
        : '';
    return `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) sepia(${f.sepia}%) grayscale(${f.grayscale}%) blur(${f.blur}px) ${sharpen}`.trim();
  };

  const getOutputMimeType = (): string => {
    if (exportFormat === 'jpg') return 'image/jpeg';
    if (exportFormat === 'png') return 'image/png';
    if (exportFormat === 'webp') return 'image/webp';
    return ['image/png', 'image/webp', 'image/gif', 'image/avif', 'image/tiff'].includes(imageType)
      ? 'image/png'
      : 'image/jpeg';
  };

  const getOutputExtension = () => {
    const m = getOutputMimeType();
    if (m === 'image/jpeg') return 'jpg';
    if (m === 'image/webp') return 'webp';
    return 'png';
  };

  const getOutputDimensions = () => {
    if (!originalDimensions) return null;
    let outW = originalDimensions.w;
    let outH = originalDimensions.h;

    if (resizeEnabled) {
      if (resizeUnit === '%') {
        outW = Math.round(originalDimensions.w * resizeWidth / 100);
        outH = Math.round(originalDimensions.h * resizeHeight / 100);
      } else {
        const tw = resizeWidth || originalDimensions.w;
        const th = resizeHeight || originalDimensions.h;
        if (resizeMode === 'stretch' || resizeMode === 'crop') {
          outW = tw; outH = th;
        } else {
          const scale = Math.min(tw / originalDimensions.w, th / originalDimensions.h);
          outW = Math.round(originalDimensions.w * scale);
          outH = Math.round(originalDimensions.h * scale);
        }
      }
    }

    return rotation === 90 || rotation === 270
      ? { w: outH, h: outW }
      : { w: outW, h: outH };
  };

  // ── Image loading ─────────────────────────────────────────────────────────

  const loadImageFromFile = (file: File) => {
    setImageType(file.type);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setResizeEnabled(false);

    const reader = new FileReader();
    reader.onloadend = () => {
      const src = reader.result as string;
      setSelectedImage(src);
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ w: img.width, h: img.height });
        setResizeWidth(img.width);
        setResizeHeight(img.height);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImageFromFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) loadImageFromFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  // ── Filter helpers ─────────────────────────────────────────────────────────

  const handleFilterChange = (key: keyof FilterState, value: number) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  // ── Resize helpers ─────────────────────────────────────────────────────────

  const handleResizeWidthChange = (val: number) => {
    setResizeWidth(val);
    if (lockAspectRatio && originalDimensions && val > 0) {
      if (resizeUnit === '%') {
        setResizeHeight(val);
      } else {
        setResizeHeight(Math.round((val * originalDimensions.h) / originalDimensions.w));
      }
    }
  };

  const handleResizeHeightChange = (val: number) => {
    setResizeHeight(val);
    if (lockAspectRatio && originalDimensions && val > 0) {
      if (resizeUnit === '%') {
        setResizeWidth(val);
      } else {
        setResizeWidth(Math.round((val * originalDimensions.w) / originalDimensions.h));
      }
    }
  };

  const handleUnitChange = (unit: ResizeUnit) => {
    setResizeUnit(unit);
    if (unit === '%') {
      setResizeWidth(100);
      setResizeHeight(100);
    } else if (originalDimensions) {
      setResizeWidth(originalDimensions.w);
      setResizeHeight(originalDimensions.h);
    }
  };

  // ── Transform helpers ─────────────────────────────────────────────────────

  const rotateLeft = () => setRotation((r) => ((r - 90 + 360) % 360) as typeof rotation);
  const rotateRight = () => setRotation((r) => ((r + 90) % 360) as typeof rotation);

  const getPreviewTransform = () => {
    const parts: string[] = [];
    if (rotation) parts.push(`rotate(${rotation}deg)`);
    if (flipH) parts.push('scaleX(-1)');
    if (flipV) parts.push('scaleY(-1)');
    return parts.join(' ') || undefined;
  };

  // ── Denoise worker ─────────────────────────────────────────────────────────

  const applyDenoiseInWorker = (imageData: ImageData, strength: number): Promise<ImageData> =>
    new Promise((resolve) => {
      const worker = new Worker(new URL('./denoise.worker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = (e) => {
        resolve(new ImageData(e.data.data, imageData.width, imageData.height));
        worker.terminate();
      };
      const copy = new Uint8ClampedArray(imageData.data);
      worker.postMessage({ data: copy, width: imageData.width, height: imageData.height, strength }, [copy.buffer]);
    });

  // ── Download ───────────────────────────────────────────────────────────────

  const downloadImage = async () => {
    if (!selectedImage) return;
    setIsProcessing(true);

    const canvas = document.createElement('canvas');
    const img = new Image();
    img.src = selectedImage;

    img.onload = async () => {
      // Compute source crop region and output size
      let srcX = 0, srcY = 0, srcW = img.width, srcH = img.height;
      let outW = img.width, outH = img.height;

      if (resizeEnabled) {
        if (resizeUnit === '%') {
          outW = Math.round(img.width * resizeWidth / 100);
          outH = Math.round(img.height * resizeHeight / 100);
        } else {
          const tw = resizeWidth || img.width;
          const th = resizeHeight || img.height;
          if (resizeMode === 'stretch') {
            outW = tw; outH = th;
          } else if (resizeMode === 'fit') {
            const scale = Math.min(tw / img.width, th / img.height);
            outW = Math.round(img.width * scale);
            outH = Math.round(img.height * scale);
          } else {
            // crop: scale to fill, then crop center
            outW = tw; outH = th;
            const scale = Math.max(tw / img.width, th / img.height);
            srcW = tw / scale;
            srcH = th / scale;
            srcX = (img.width - srcW) / 2;
            srcY = (img.height - srcH) / 2;
          }
        }
      }

      const isSwapped = rotation === 90 || rotation === 270;
      canvas.width = isSwapped ? outH : outW;
      canvas.height = isSwapped ? outW : outH;

      const ctx = canvas.getContext('2d')!;

      // Background fill for JPEG (no alpha)
      const mime = getOutputMimeType();
      if (mime === 'image/jpeg') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Transform + draw
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      if (flipH) ctx.scale(-1, 1);
      if (flipV) ctx.scale(1, -1);
      ctx.filter = buildFilterString();
      ctx.drawImage(img, srcX, srcY, srcW, srcH, -outW / 2, -outH / 2, outW, outH);
      ctx.filter = 'none';
      ctx.restore();

      // Denoise
      if (filters.denoise > 0) {
        const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const denoised = await applyDenoiseInWorker(id, filters.denoise / 100);
        ctx.putImageData(denoised, 0, 0);
      }

      // Export
      const ext = getOutputExtension();
      const quality = (mime === 'image/jpeg' || mime === 'image/webp')
        ? filters.quality / 100
        : undefined;
      const link = document.createElement('a');
      link.download = `${fileName.trim() || 'enhanced-image'}.${ext}`;
      link.href = canvas.toDataURL(mime, quality);
      link.click();
      setIsProcessing(false);
    };
  };

  // ── UI helpers ─────────────────────────────────────────────────────────────

  const outDims = getOutputDimensions();
  const outputMime = getOutputMimeType();
  const showBgColor = outputMime === 'image/jpeg';
  const showQuality = outputMime === 'image/jpeg' || outputMime === 'image/webp';

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-purple-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <img src="/enhancr/logo.svg" alt="Enhancr" className="h-14" />
          </div>
          <p className="text-slate-400 text-sm">Upload an image and enhance it with real-time filters</p>
        </div>

        {/* ── Upload / Preview ── */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 mb-5">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/tiff"
            onChange={handleImageUpload}
          />

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`h-56 sm:h-72 md:h-80 rounded-xl border-2 border-dashed flex items-center justify-center transition-colors duration-200 cursor-pointer overflow-hidden ${
              isDragging
                ? 'border-violet-500 bg-violet-500/10'
                : 'border-white/10 bg-black/20 hover:border-violet-500/50 hover:bg-violet-500/5'
            }`}
          >
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Preview"
                className="w-full h-full object-contain"
                style={{ filter: buildFilterString(), transform: getPreviewTransform() }}
              />
            ) : (
              <div className="text-center pointer-events-none">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-4">
                  <Upload className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-300 font-medium mb-1">Drop your image here</p>
                <p className="text-slate-500 text-sm mb-5">PNG, JPG, WebP, GIF, AVIF, TIFF supported</p>
                <span className="inline-block bg-violet-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg">
                  Choose File
                </span>
              </div>
            )}
          </div>

          {selectedImage && (
            <div className="flex items-center justify-between mt-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-slate-400 hover:text-violet-400 transition-colors underline underline-offset-2"
              >
                Replace image
              </button>
              {outDims && (
                <span className="text-xs text-slate-500 font-mono">
                  {originalDimensions?.w} × {originalDimensions?.h}
                  {(resizeEnabled || rotation % 180 !== 0) && (
                    <span className="text-violet-400 ml-1">→ {outDims.w} × {outDims.h}</span>
                  )}
                  {' '}px
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Feature cards grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">

          {/* Column 1: Transform + Resize */}
          <div className="flex flex-col gap-5">

            {/* Transform */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
              <SectionHeader icon={<RotateCw className="w-3.5 h-3.5" />} label="Transform" />
              <div className="grid grid-cols-4 gap-2">
                <IconBtn onClick={rotateLeft} title="Rotate 90° left">
                  <RotateCcw className="w-4 h-4" />
                  <span>Left</span>
                </IconBtn>
                <IconBtn onClick={rotateRight} title="Rotate 90° right">
                  <RotateCw className="w-4 h-4" />
                  <span>Right</span>
                </IconBtn>
                <IconBtn onClick={() => setFlipH((v) => !v)} active={flipH} title="Flip horizontal">
                  <FlipHorizontal className="w-4 h-4" />
                  <span>Flip H</span>
                </IconBtn>
                <IconBtn onClick={() => setFlipV((v) => !v)} active={flipV} title="Flip vertical">
                  <FlipVertical className="w-4 h-4" />
                  <span>Flip V</span>
                </IconBtn>
              </div>
            </div>

            {/* Resize */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="text-violet-400"><Maximize2 className="w-3.5 h-3.5" /></div>
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Resize</span>
                <div className="flex-1 h-px bg-white/5" />
                <button
                  onClick={() => setResizeEnabled((v) => !v)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    resizeEnabled ? 'bg-violet-600 text-white' : 'bg-white/10 text-slate-400 hover:bg-white/15'
                  }`}
                >
                  {resizeEnabled ? 'On' : 'Off'}
                </button>
              </div>

              {resizeEnabled ? (
                <div className="space-y-3">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 mb-1 block">Width</label>
                      <input
                        type="number" min={1} value={resizeWidth}
                        onChange={(e) => handleResizeWidthChange(Number(e.target.value))}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500/60 transition-colors"
                      />
                    </div>
                    <button
                      onClick={() => setLockAspectRatio((v) => !v)}
                      title={lockAspectRatio ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
                      className={`p-2 rounded-lg transition-colors ${lockAspectRatio ? 'text-violet-400 bg-violet-500/15' : 'text-slate-500 bg-white/5 hover:bg-white/10'}`}
                    >
                      {lockAspectRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 mb-1 block">Height</label>
                      <input
                        type="number" min={1} value={resizeHeight}
                        onChange={(e) => handleResizeHeightChange(Number(e.target.value))}
                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-500/60 transition-colors"
                      />
                    </div>
                    <select
                      value={resizeUnit}
                      onChange={(e) => handleUnitChange(e.target.value as ResizeUnit)}
                      className="bg-black/30 border border-white/10 rounded-lg px-2 py-2 text-sm text-slate-300 outline-none focus:border-violet-500/60 transition-colors"
                    >
                      <option value="px">px</option>
                      <option value="%">%</option>
                    </select>
                  </div>

                  {resizeUnit === 'px' && (
                    <div className="flex gap-2">
                      {(['fit', 'stretch', 'crop'] as ResizeMode[]).map((mode) => (
                        <button
                          key={mode} onClick={() => setResizeMode(mode)}
                          className={`flex-1 py-1.5 text-xs rounded-lg capitalize transition-colors ${resizeMode === mode ? 'bg-violet-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  )}

                  {outDims && (
                    <p className="text-xs text-slate-500">
                      Output: <span className="text-violet-300 font-mono">{outDims.w} × {outDims.h} px</span>
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-600">Enable to set custom dimensions.</p>
              )}
            </div>
          </div>

          {/* Column 2: Color Adjustments */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
            <SectionHeader icon={<Sparkles className="w-3.5 h-3.5" />} label="Color Adjustments" />
            <div className="space-y-5">
              <SliderRow label="Brightness" value={filters.brightness} displayValue={`${filters.brightness}%`} min={0} max={200} onChange={(v) => handleFilterChange('brightness', v)} />
              <SliderRow label="Contrast"   value={filters.contrast}   displayValue={`${filters.contrast}%`}   min={0} max={200} onChange={(v) => handleFilterChange('contrast', v)} />
              <SliderRow label="Saturation" value={filters.saturation} displayValue={`${filters.saturation}%`} min={0} max={200} onChange={(v) => handleFilterChange('saturation', v)} />
              <SliderRow label="Sepia"      value={filters.sepia}      displayValue={`${filters.sepia}%`}      min={0} max={100} onChange={(v) => handleFilterChange('sepia', v)} />
              <SliderRow label="Grayscale"  value={filters.grayscale}  displayValue={`${filters.grayscale}%`}  min={0} max={100} onChange={(v) => handleFilterChange('grayscale', v)} />
            </div>
          </div>

          {/* Column 3: Enhancement + Export */}
          <div className="flex flex-col gap-5 md:col-span-2 xl:col-span-1">

            {/* Enhancement */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
              <SectionHeader icon={<ZoomIn className="w-3.5 h-3.5" />} label="Enhancement" />
              <div className="space-y-5">
                <SliderRow label="Sharpen"         value={filters.sharpen} displayValue={filters.sharpen.toFixed(2)} min={0} max={1}   step={0.01} onChange={(v) => handleFilterChange('sharpen', v)} />
                <SliderRow label="Noise Reduction" value={filters.denoise} displayValue={`${filters.denoise}%`}     min={0} max={100}            onChange={(v) => handleFilterChange('denoise', v)} />
                <SliderRow label="Blur"            value={filters.blur}   displayValue={`${filters.blur}px`}       min={0} max={10}  step={0.1}  onChange={(v) => handleFilterChange('blur', v)} />
              </div>
            </div>

            {/* Export */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
              <SectionHeader icon={<Sliders className="w-3.5 h-3.5" />} label="Export" />
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-300 mb-2">Format</p>
                  <div className="flex gap-2">
                    {(['auto', 'jpg', 'png', 'webp'] as ExportFormat[]).map((fmt) => (
                      <button
                        key={fmt} onClick={() => setExportFormat(fmt)}
                        className={`flex-1 py-1.5 text-xs rounded-lg uppercase font-medium transition-colors ${exportFormat === fmt ? 'bg-violet-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {showBgColor && (
                  <div>
                    <p className="text-sm text-slate-300 mb-2">Background Color</p>
                    <div className="flex items-center gap-3 bg-black/20 border border-white/10 rounded-xl px-3 py-2">
                      <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                        className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0" />
                      <span className="text-sm text-slate-300 font-mono">{bgColor}</span>
                    </div>
                  </div>
                )}

                {showQuality && (
                  <SliderRow label="Quality" value={filters.quality} displayValue={`${filters.quality}%`} min={1} max={100} onChange={(v) => handleFilterChange('quality', v)} />
                )}

                <div>
                  <p className="text-sm text-slate-300 mb-2">File Name</p>
                  <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-xl px-3 py-2 focus-within:border-violet-500/60 transition-colors">
                    <input
                      type="text" value={fileName} onChange={(e) => setFileName(e.target.value)}
                      placeholder="enhanced-image"
                      className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
                    />
                    <span className="text-xs text-slate-500 shrink-0">.{getOutputExtension()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => {
              setFilters(DEFAULTS);
              setRotation(0); setFlipH(false); setFlipV(false);
              setResizeEnabled(false);
              if (originalDimensions) { setResizeWidth(originalDimensions.w); setResizeHeight(originalDimensions.h); }
            }}
            className="px-5 py-3 rounded-xl text-sm font-medium border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors"
          >
            Reset
          </button>

          <button
            onClick={downloadImage}
            disabled={!selectedImage || isProcessing}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              selectedImage && !isProcessing
                ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40'
                : 'bg-white/5 text-slate-600 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Processing…
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download Image
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
