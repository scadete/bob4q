# MEMORY.md
> Simplified annotation format. Update on every significant decision.

## Project
- Name: bob4q
- Goal: quantum dev workshop lab — IBM Bob + Qiskit MCP → full-stack demo
- Audience: workshop participants (beginner→intermediate quantum devs)
- Constraint: must work on fresh machines + containers

## Key Decisions
- [STACK] Next.js 14 App Router + Carbon Design System → workshop-friendly, IBM-native UI
- [STACK] FastAPI → Python-native, matches Qiskit ecosystem
- [STACK] pnpm workspaces → single `pnpm install` at root for all JS
- [STACK] uv per Python pkg → fast installs, reproducible envs
- [MCP] Custom Python MCP server wraps Qiskit + Qiskit Code Assistant
- [MCP] Dual transport: stdio (local Bob) + HTTP SSE (remote/container demo)
- [MATH] Manim pre-render pipeline → no runtime Manim dependency on server
- [i18n] Two i18n systems: next-intl (UI) + Markdown folders (workshop docs)
- [DEPLOY] Docker Compose for full stack; single image for MCP server published to ghcr.io
- [SECURITY] No cloud API for Qiskit Code Assistant — local model only

## Status
- [ ] Repo initialized
- [ ] Folder scaffolding created
- [ ] Frontend bootstrapped
- [ ] MCP server implementation started
- [ ] Backend API started
- [ ] First Manim scene created
- [ ] Docker Compose working
- [ ] Docs/i18n structure created
- [ ] Workshop setup scripts created
- [ ] First end-to-end demo working

## Blockers / Open Questions
- ghcr.io org name TBD → placeholder `YOUR_ORG` used
- Qiskit Code Assistant local model size/requirements → need to document min hardware
- Workshop target locales TBD → starting with en, pt-BR

## References
- Carbon DS: https://github.com/carbon-design-system/carbon
- Manim: https://github.com/3b1b/manim
- Qiskit: https://github.com/Qiskit/qiskit
- next-intl: https://next-intl-docs.vercel.app
