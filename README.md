# Image Enhancer Pro

A powerful web-based image enhancement tool built with React and TypeScript that allows users to improve their images with professional-grade filters and adjustments.

## Features

### Basic Adjustments
- **Brightness Control**: Adjust image brightness from 0% to 200%
- **Contrast Enhancement**: Fine-tune contrast levels from 0% to 200%
- **Saturation Control**: Modify color intensity from 0% to 200%

### Advanced Enhancement
- **Smart Sharpening**: Professional-grade sharpening using SVG convolution matrix filters
- **Noise Reduction**: Median filter algorithm running off the main thread via Web Worker — no UI freeze on large images
- **Blur Effect**: Precise control over image softness (0-10px)

### Export Options
- **Transparency Preserved**: PNG, WebP, and GIF inputs export as PNG to retain alpha channel; JPEG inputs export as JPEG
- **Quality Control**: Choose JPEG export quality (1-100%) for optimal file size
- **Original Resolution**: Maintains original image dimensions
- **Processing Indicator**: Button shows "Processing…" and is disabled while export is in progress

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

```bash
npm install
npm run dev
```

## Usage

1. **Upload Image**
   - Drag and drop an image into the upload area
   - Or click "Choose File" to select from your device

2. **Apply Enhancements**
   - Use the sliders in the right panel to adjust image properties
   - Changes are previewed in real-time

3. **Export**
   - Set your desired export quality (applies to JPEG exports)
   - Click "Download Enhanced Image" to save your work
   - The button will show "Processing…" while the image is being prepared

## Technical Details

### Built With
- React 18
- TypeScript
- Tailwind CSS
- Vite
- Lucide React Icons

### Key Components
- Real-time image processing via CSS filters
- Canvas-based rendering for export
- Web Worker for non-blocking noise reduction
- Drag-and-drop file handling
- Automatic export format selection based on input type

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
