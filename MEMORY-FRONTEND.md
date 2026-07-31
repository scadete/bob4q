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
- Animations are **CSS/JS React components**, not video (`manim/scenes/*.py` = reference spec)
- Registry in `frontend/src/lib/animations.ts`: `animations` map keyed by `AnimationName`
- `SlideShow` looks up the component by the slide's `animation` key; unregistered names render a placeholder
- Validate each animation's concept with the user before building it

## Routing
- `/` → workshop home / landing
- `/lab` → notebook index; `/lab/[slug]` → read-only notebook reader (JupyterLite removed)
- `/docs/[locale]/[slug]` → workshop documentation (Markdown rendered)
- `/demo` → presenter slideshow (full-screen Carbon layout, keyboard navigation, CSS/JS animations)

## Notebook Presentation (`/lab`)
- Read-only: `frontend/src/lib/notebooks.ts` is the registry + loader (reads `../notebooks/*.ipynb`)
- Renders markdown cells (KaTeX) + code cells as `<pre>`; a "Run locally" panel shows the `uv run … jupyter lab` command
- Notebooks are run locally by developers, not in the browser

## Demo Route (`/demo`)
- Full-screen Carbon `g100` layout, minimal chrome (Home button in the control bar)
- Slide state in URL (`/demo?slide=3`) so facilitator can deep-link
- Keyboard: ArrowRight/ArrowLeft to navigate; `F` for fullscreen
- Each slide can render a CSS/JS animation component or a Carbon data viz component
- [ ] JupyterLite build step: integrate into `pnpm build` or separate script?
