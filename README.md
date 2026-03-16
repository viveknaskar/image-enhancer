# Enhancr

A browser-based image enhancement tool with real-time filter previews and non-blocking export. No uploads, no server, everything runs locally in your browser.

**Live demo:** https://viveknaskar.github.io/enhancr/

---

## Features

| Category | Controls |
|---|---|
| Basic Adjustments | Brightness, Contrast, Saturation (0–200%) |
| Advanced Enhancement | Sharpen, Noise Reduction, Blur |
| Export | Custom filename, JPEG quality, auto format detection |

- **Real-time preview** — filters update instantly as you move sliders
- **Noise reduction off the main thread** — runs in a Web Worker so the UI never freezes
- **Smart export format** — PNG/WebP/GIF inputs export as PNG (preserves transparency); JPEG inputs export as JPEG with adjustable quality
- **Drag and drop** — drop an image anywhere in the upload zone, or click to browse

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Usage

1. **Upload** — drag and drop an image or click the upload zone
2. **Adjust** — move the sliders to tune brightness, contrast, saturation, sharpness, noise reduction, and blur
3. **Name** — set a custom filename (defaults to `enhanced-image`)
4. **Download** — set JPEG quality if needed, then click **Download Enhanced Image**

## Tech Stack

- [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide React](https://lucide.dev) icons
- Canvas API for full-resolution export
- Web Workers API for off-thread noise reduction

## License

MIT © 2026 Vivek Naskar
