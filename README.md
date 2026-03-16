# Image Enhancer Pro

A modern, web-based image enhancement tool built with React and TypeScript. Features a dark glassmorphism UI with real-time filter previews and non-blocking export processing.

## Features

### Basic Adjustments
- **Brightness Control**: Adjust image brightness from 0% to 200%
- **Contrast Enhancement**: Fine-tune contrast levels from 0% to 200%
- **Saturation Control**: Modify color intensity from 0% to 200%

### Advanced Enhancement
- **Smart Sharpening**: SVG convolution matrix filter for crisp, professional sharpening
- **Noise Reduction**: Median filter algorithm running in a Web Worker — no UI freeze on large images
- **Blur Effect**: Precise control over image softness (0–10px)

### Export Options
- **Transparency Preserved**: PNG, WebP, and GIF inputs export as PNG to retain alpha channel; JPEG inputs export as JPEG
- **Quality Control**: Choose JPEG export quality (1–100%) for optimal file size
- **Original Resolution**: Maintains original image dimensions
- **Reset**: One-click reset to restore all sliders to their defaults

## UI

- Dark glassmorphism design with ambient background lighting
- Custom-styled sliders with violet gradient thumb and hover glow
- Real-time filter preview as sliders are adjusted
- Drag-and-drop upload zone with active state highlight
- Spinner animation and disabled state on the download button during export

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

1. **Upload Image** — drag and drop into the upload area, or click **Choose File**
2. **Adjust** — use the sliders to tune brightness, contrast, saturation, sharpen, noise reduction, and blur in real time
3. **Export** — set JPEG quality if needed, then click **Download Enhanced Image**; the button shows a spinner while processing

## Technical Details

### Built With
- React 18
- TypeScript
- Tailwind CSS
- Vite
- Lucide React Icons

### Key Implementation Details
- Real-time preview via CSS `filter` property
- Canvas API for full-resolution export
- Web Worker for off-main-thread noise reduction
- Automatic export format selection based on input type (PNG for transparency, JPEG otherwise)
- Drag-and-drop with MIME type validation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
