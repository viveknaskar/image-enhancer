# Enhancr

![Visitors](https://visitor-badge.laobi.icu/badge?page_id=viveknaskar.enhancr)

A browser-based image editor with real-time filter previews, visual crop, transforms, and non-blocking export. No uploads, no server, everything runs locally in your browser.

**Live demo:** https://viveknaskar.github.io/enhancr/

---

## Features

| Category | Controls |
|---|---|
| Color Adjustments | Brightness, Contrast, Saturation, Sepia, Grayscale (0–200%) |
| Enhancement | Sharpen, Noise Reduction, Blur |
| Transform | Rotate 90° left/right, Flip horizontal/vertical |
| Crop | Interactive crop box with 8 handles and rule-of-thirds grid |
| Resize | Custom dimensions (px or %), fit / stretch / crop modes, aspect ratio lock |
| Export | Format (Auto / JPG / PNG / WebP), JPEG quality, custom filename, background color |

- **Real-time preview** — filters, transforms, and crop overlay update instantly
- **Visual crop tool** — drag the crop box to position, drag handles to resize; the area outside the selection is dimmed and a live pixel-dimension label updates as you adjust
- **Noise reduction off the main thread** — runs in a Web Worker so the UI never freezes
- **Smart export format** — PNG/WebP/GIF/AVIF/TIFF inputs export as PNG (preserves transparency); JPEG inputs export as JPEG with adjustable quality
- **Drag and drop** — drop an image anywhere in the upload zone, or click to browse

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Usage

1. **Upload** — drag and drop an image or click the upload zone (JPEG, PNG, WebP, GIF, AVIF, TIFF)
2. **Adjust** — move the sliders to tune brightness, contrast, saturation, sharpness, noise reduction, and blur
3. **Crop** — click **Crop** in the Transform panel, drag the handles to select a region, then proceed to download
4. **Transform** — rotate or flip the image using the buttons in the Transform panel
5. **Resize** — enable resize, set target dimensions (px or %), and choose fit / stretch / crop mode
6. **Export** — choose format, set JPEG quality and background color if needed, enter a filename, then click **Download Image**

## Tech Stack

- [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide React](https://lucide.dev) icons
- Canvas API for full-resolution, single-pass export (crop + resize + rotate + filter in one `drawImage` call)
- Web Workers API for off-thread noise reduction

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on reporting bugs, requesting features, and submitting pull requests.

## License

MIT © 2026 Vivek Naskar
