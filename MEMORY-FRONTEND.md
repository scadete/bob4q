# MEMORY-FRONTEND.md
> Frontend domain memory.

## Stack
- Next.js 14 App Router, TypeScript strict
- Carbon Design System: `@carbon/react` (NOT `carbon-components-react`)
- next-intl for i18n
- vitest + @testing-library/react for tests

## Carbon Conventions
- All colors/spacing via Carbon tokens (CSS custom props or JS tokens)
- Use `<Theme>` provider at root with `theme="g100"` (dark, IBM-style)
- Grid: always `<Grid>` + `<Column>` from Carbon, never custom CSS grid
- Icons: `@carbon/icons-react` only

## i18n
- Locale files: `frontend/messages/{locale}.json`
- Supported: `en`, `pt-BR` (add more as needed)
- `next-intl` config in `frontend/i18n.ts`
- Use `useTranslations('namespace')` hook — namespaces map to top-level JSON keys

## Animation Integration
- Manim renders → `frontend/public/videos/{sceneName}.mp4`
- Component `<QuantumAnimation sceneName="...">` wraps `<video>` with Carbon styling
- Scene name → file mapping in `frontend/src/lib/animations.ts`

## Routing
- `/` → workshop home / landing
- `/lab` → JupyterLite iframe (full-page embed, zero-install)
- `/docs/[locale]/[slug]` → workshop documentation (Markdown rendered)
- `/demo` → presenter slideshow (full-screen Carbon layout, keyboard navigation, Manim videos embedded)

## JupyterLite Embed
- Served as `<iframe src="/jupyterlite/index.html">` — JupyterLite built assets in `frontend/public/jupyterlite/`
- Notebooks served from `notebooks/` directory (copied into JupyterLite content at build time)
- "Run on QPU" button lives outside the iframe (in the parent Next.js page), calls FastAPI directly

## Demo Route (`/demo`)
- Full-screen Carbon `g100` layout, no navigation chrome
- Slide state in URL (`/demo?slide=3`) so facilitator can deep-link
- Keyboard: ArrowRight/ArrowLeft to navigate; `F` for fullscreen
- Each slide can embed a Manim `<video>` or a Carbon data viz component

## Open Questions
- [ ] Qiskit Aer-wasm availability in JupyterLite — verify before building lab module
- [ ] JupyterLite build step: integrate into `pnpm build` or separate script?
