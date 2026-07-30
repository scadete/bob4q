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
- `/lab` → interactive quantum lab
- `/docs/[locale]/[slug]` → workshop documentation
- `/demo` → presenter mode (full-screen Carbon slides)

## Open Questions
- [ ] Presenter/demo mode layout design TBD
- [ ] Video fallback for no-JS (static image from Manim?)
