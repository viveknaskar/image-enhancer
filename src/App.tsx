import React, { useState, useCallback, useRef } from 'react';
import { Upload, Sliders, Download, ZoomIn, Sparkles, ImageIcon } from 'lucide-react';

interface ImageState {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  sharpen: number;
  denoise: number;
  quality: number;
}

const DEFAULTS: ImageState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
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

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string>('image/jpeg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('enhanced-image');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filters, setFilters] = useState<ImageState>(DEFAULTS);

  const loadImageFromFile = (file: File) => {
    setImageType(file.type);
    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) loadImageFromFile(file);
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) loadImageFromFile(file);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleFilterChange = (filter: keyof ImageState, value: number) => {
    setFilters(prev => ({ ...prev, [filter]: value }));
  };

  const getFilterStyle = (): React.CSSProperties => {
    const sharpenMatrix =
      filters.sharpen > 0
        ? `url(data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg">
        <filter id="sharpen">
          <feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="
            0 -${filters.sharpen} 0
            -${filters.sharpen} ${1 + 4 * filters.sharpen} -${filters.sharpen}
            0 -${filters.sharpen} 0
          "/>
        </filter>
      </svg>
    `)}#sharpen)`
        : '';

    return {
      filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) blur(${filters.blur}px) ${sharpenMatrix}`,
    };
  };

  const applyDenoiseInWorker = (imageData: ImageData, strength: number): Promise<ImageData> => {
    return new Promise((resolve) => {
      const worker = new Worker(new URL('./denoise.worker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = (e) => {
        resolve(new ImageData(e.data.data, imageData.width, imageData.height));
        worker.terminate();
      };
      const copy = new Uint8ClampedArray(imageData.data);
      worker.postMessage({ data: copy, width: imageData.width, height: imageData.height, strength }, [copy.buffer]);
    });
  };

  const downloadImage = async () => {
    if (!selectedImage) return;
    setIsProcessing(true);

    const canvas = document.createElement('canvas');
    const img = new Image();
    img.src = selectedImage;

    img.onload = async () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;

      ctx.filter = getFilterStyle().filter as string;
      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none';

      if (filters.denoise > 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const denoised = await applyDenoiseInWorker(imageData, filters.denoise / 100);
        ctx.putImageData(denoised, 0, 0);
      }

      const supportsAlpha = ['image/png', 'image/webp', 'image/gif'].includes(imageType);
      const mimeType = supportsAlpha ? 'image/png' : 'image/jpeg';
      const quality = supportsAlpha ? undefined : filters.quality / 100;
      const ext = supportsAlpha ? 'png' : 'jpg';

      const link = document.createElement('a');
      const safeName = fileName.trim() || 'enhanced-image';
      link.download = `${safeName}.${ext}`;
      link.href = canvas.toDataURL(mimeType, quality);
      link.click();

      setIsProcessing(false);
    };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-purple-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 mb-4">
            <ImageIcon className="w-6 h-6 text-violet-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Image Enhancer Pro</h1>
          <p className="mt-1 text-slate-400 text-sm">Upload an image and enhance it with real-time filters</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview panel */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Preview</p>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`flex-1 min-h-80 rounded-xl border-2 border-dashed flex items-center justify-center transition-colors duration-200 cursor-pointer ${
                isDragging
                  ? 'border-violet-500 bg-violet-500/10'
                  : 'border-white/10 bg-black/20 hover:border-violet-500/50 hover:bg-violet-500/5'
              }`}
            >
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-full h-full object-contain rounded-xl"
                  style={getFilterStyle()}
                />
              ) : (
                <div className="text-center px-6 pointer-events-none">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-4">
                    <Upload className="w-7 h-7 text-slate-400" />
                  </div>
                  <p className="text-slate-300 font-medium mb-1">Drop your image here</p>
                  <p className="text-slate-500 text-sm mb-5">PNG, JPG, WebP, GIF supported</p>
                  <span className="inline-block bg-violet-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg">
                    Choose File
                  </span>
                </div>
              )}
            </div>

            {selectedImage && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 text-center text-xs text-slate-400 hover:text-violet-400 cursor-pointer transition-colors underline underline-offset-2"
              >
                Replace image
              </button>
            )}
          </div>

          {/* Controls panel */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex flex-col gap-6">
            <div>
              <SectionHeader icon={<Sparkles className="w-3.5 h-3.5" />} label="Basic Adjustments" />
              <div className="space-y-5">
                <SliderRow label="Brightness" value={filters.brightness} displayValue={`${filters.brightness}%`} min={0} max={200} onChange={v => handleFilterChange('brightness', v)} />
                <SliderRow label="Contrast" value={filters.contrast} displayValue={`${filters.contrast}%`} min={0} max={200} onChange={v => handleFilterChange('contrast', v)} />
                <SliderRow label="Saturation" value={filters.saturation} displayValue={`${filters.saturation}%`} min={0} max={200} onChange={v => handleFilterChange('saturation', v)} />
              </div>
            </div>

            <div>
              <SectionHeader icon={<ZoomIn className="w-3.5 h-3.5" />} label="Advanced Enhancement" />
              <div className="space-y-5">
                <SliderRow label="Sharpen" value={filters.sharpen} displayValue={filters.sharpen.toFixed(2)} min={0} max={1} step={0.01} onChange={v => handleFilterChange('sharpen', v)} />
                <SliderRow label="Noise Reduction" value={filters.denoise} displayValue={`${filters.denoise}%`} min={0} max={100} onChange={v => handleFilterChange('denoise', v)} />
                <SliderRow label="Blur" value={filters.blur} displayValue={`${filters.blur}px`} min={0} max={10} step={0.1} onChange={v => handleFilterChange('blur', v)} />
              </div>
            </div>

            <div>
              <SectionHeader icon={<Sliders className="w-3.5 h-3.5" />} label="Export Quality" />
              <SliderRow label="JPEG Quality" value={filters.quality} displayValue={`${filters.quality}%`} min={1} max={100} onChange={v => handleFilterChange('quality', v)} />
            </div>

            <div>
              <SectionHeader icon={<Download className="w-3.5 h-3.5" />} label="File Name" />
              <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-xl px-3 py-2 focus-within:border-violet-500/60 transition-colors">
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="enhanced-image"
                  className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
                />
                <span className="text-xs text-slate-500 shrink-0">
                  .{['image/png', 'image/webp', 'image/gif'].includes(imageType) ? 'png' : 'jpg'}
                </span>
              </div>
            </div>

            <div className="mt-auto flex gap-3">
              <button
                onClick={() => setFilters(DEFAULTS)}
                className="px-4 py-3 rounded-xl text-sm font-medium border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors"
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
                    Download Enhanced Image
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
