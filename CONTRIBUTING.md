# Contributing to Enhancr

Thank you for your interest in contributing! All contributions — bug reports, feature requests, and pull requests — are welcome.

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Setting Up

1. **Fork the repository** and clone your fork

   ```bash
   git clone https://github.com/YOUR_USERNAME/enhancr.git
   cd enhancr
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open http://localhost:5173 in your browser.

## Project Structure

```
enhancr/
├── src/
│   ├── hooks/               # Custom React hooks (filters, transform, resize, crop, export)
│   ├── components/          # Reusable UI components (SliderRow, IconBtn, CropOverlay, …)
│   ├── App.tsx              # Root component — wires hooks together and owns download logic
│   ├── types.ts             # Shared TypeScript types and constants
│   └── denoise.worker.ts    # Web Worker for off-thread noise reduction
├── public/                  # Static assets (logo, favicon)
└── index.html
```

## Development Workflow

### Branch Naming

| Prefix | Use for |
|---|---|
| `feature/` | New features or enhancements |
| `fix/` | Bug fixes |
| `docs/` | Documentation only |
| `refactor/` | Code cleanup with no behaviour change |

### Making Changes

1. **Create a branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** — follow the patterns in the existing hooks and components

3. **Run checks before committing**

   ```bash
   npm run build   # must pass with zero TypeScript errors
   npm run lint    # must pass with zero errors
   ```

4. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/)

   ```bash
   git commit -m "feat: add brightness histogram overlay"
   git commit -m "fix: crop box drifting on fast drag"
   git commit -m "docs: update usage steps in README"
   ```

   Common prefixes: `feat`, `fix`, `docs`, `refactor`, `chore`

5. **Push and open a Pull Request**

   ```bash
   git push origin feature/your-feature-name
   ```

## Types of Contributions

### Bug Reports

Please include:

- Steps to reproduce
- Expected vs actual behaviour
- Browser + OS
- A screenshot or screen recording if the issue is visual

### Feature Requests

Please describe:

- The problem you want to solve
- Your proposed solution
- Any alternatives you considered

### Pull Requests

Before submitting, make sure:

- [ ] `npm run build` passes with no TypeScript errors
- [ ] `npm run lint` passes with no errors
- [ ] New logic that lives in a hook is kept separate from rendering (follow the existing `hooks/` pattern)
- [ ] No new runtime dependencies are added without discussion

#### PR description template

```markdown
## What does this PR do?

Brief description.

## Changes

- …

## How was it tested?

…

## Related issues

Closes #…
```

## Code Style

- **TypeScript** — explicit types on all function parameters and return values
- **Hooks** — one concern per hook (`useFilters`, `useCrop`, etc.); keep DOM side-effects out of hooks and in components or `App.tsx`
- **Components** — presentational components receive data and callbacks via props; no internal state beyond UI-only state (hover, focus)
- **No new dependencies** for things the browser already provides (Canvas API, Web Workers, ResizeObserver, etc.)

## Getting Help

Open a [GitHub Issue](https://github.com/viveknaskar/enhancr/issues) for bugs or questions.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
