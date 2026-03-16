import React, { useState, useCallback } from 'react';
import { Upload, Sliders, Download, Image as ImageIcon, ZoomIn, Sparkles } from 'lucide-react';

interface ImageState {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  sharpen: number;
  denoise: number;
  quality: number;
}

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string>('image/jpeg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [filters, setFilters] = useState<ImageState>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    sharpen: 0,
    denoise: 0,
    quality: 90
  });

  const loadImageFromFile = (file: File) => {
    setImageType(file.type);
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) loadImageFromFile(file);
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) loadImageFromFile(file);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleFilterChange = (filter: keyof ImageState, value: number) => {
    setFilters(prev => ({ ...prev, [filter]: value }));
  };

  const getFilterStyle = () => {
    // Convert sharpen value to a matrix filter
    const sharpenMatrix = filters.sharpen > 0 ? `url(data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg">
        <filter id="sharpen">
          <feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="
            0 -${filters.sharpen} 0
            -${filters.sharpen} ${1 + 4 * filters.sharpen} -${filters.sharpen}
            0 -${filters.sharpen} 0
          "/>
        </filter>
      </svg>
    `)}#sharpen)` : '';

    return {
      filter: `
        brightness(${filters.brightness}%)
        contrast(${filters.contrast}%)
        saturate(${filters.saturation}%)
        blur(${filters.blur}px)
        ${sharpenMatrix}
      `
    };
  };

  const applyDenoiseInWorker = (imageData: ImageData, strength: number): Promise<ImageData> => {
    return new Promise((resolve) => {
      const worker = new Worker(new URL('./denoise.worker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = (e) => {
        resolve(new ImageData(e.data.data, imageData.width, imageData.height));
        worker.terminate();
      };
      // Transfer buffer to avoid copying
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

      ctx.filter = getFilterStyle().filter;
      ctx.drawImage(img, 0, 0);
      ctx.filter = 'none';

      if (filters.denoise > 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const denoised = await applyDenoiseInWorker(imageData, filters.denoise / 100);
        ctx.putImageData(denoised, 0, 0);
      }

      // Preserve transparency for PNG/WebP/GIF; use JPEG for everything else
      const supportsAlpha = ['image/png', 'image/webp', 'image/gif'].includes(imageType);
      const mimeType = supportsAlpha ? 'image/png' : 'image/jpeg';
      const quality = supportsAlpha ? undefined : filters.quality / 100;
      const ext = supportsAlpha ? 'png' : 'jpg';

      const enhancedImage = canvas.toDataURL(mimeType, quality);
      const link = document.createElement('a');
      link.download = `enhanced-image.${ext}`;
      link.href = enhancedImage;
      link.click();

      setIsProcessing(false);
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Image Enhancer Pro</h1>
          <p className="text-purple-200">Upload an image and enhance it with advanced filters</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-xl">
            <div
              className="border-2 border-dashed border-purple-300 rounded-lg h-96 flex flex-col items-center justify-center p-4"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {selectedImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="w-full h-full object-contain rounded"
                    style={getFilterStyle()}
                  />
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Drag and drop your image here</p>
                  <p className="text-gray-400 text-sm">or</p>
                  <label className="mt-4 inline-block">
                    <span className="bg-purple-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-700 transition">
                      Choose File
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Sliders className="w-5 h-5 mr-2" />
                Image Enhancement
              </h2>
              
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Basic Adjustments
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        Brightness ({filters.brightness}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={filters.brightness}
                        onChange={(e) => handleFilterChange('brightness', Number(e.target.value))}
                        className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        Contrast ({filters.contrast}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={filters.contrast}
                        onChange={(e) => handleFilterChange('contrast', Number(e.target.value))}
                        className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        Saturation ({filters.saturation}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={filters.saturation}
                        onChange={(e) => handleFilterChange('saturation', Number(e.target.value))}
                        className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <ZoomIn className="w-4 h-4 mr-2" />
                    Advanced Enhancement
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        Sharpen ({filters.sharpen.toFixed(2)})
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={filters.sharpen}
                        onChange={(e) => handleFilterChange('sharpen', Number(e.target.value))}
                        className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        Noise Reduction ({filters.denoise}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={filters.denoise}
                        onChange={(e) => handleFilterChange('denoise', Number(e.target.value))}
                        className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        Blur ({filters.blur}px)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.1"
                        value={filters.blur}
                        onChange={(e) => handleFilterChange('blur', Number(e.target.value))}
                        className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export Quality
                  </h3>
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">
                      JPEG Quality ({filters.quality}%)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={filters.quality}
                      onChange={(e) => handleFilterChange('quality', Number(e.target.value))}
                      className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={downloadImage}
              disabled={!selectedImage || isProcessing}
              className={`w-full py-3 rounded-lg flex items-center justify-center space-x-2 ${
                selectedImage && !isProcessing
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              } transition`}
            >
              <Download className="w-5 h-5" />
              <span>{isProcessing ? 'Processing…' : 'Download Enhanced Image'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;