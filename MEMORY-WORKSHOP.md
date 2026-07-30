# MEMORY-WORKSHOP.md
> Workshop content and UX domain memory.

## Audience
- Beginner→intermediate quantum devs
- Mix of IBM employees and external attendees
- Fresh laptops or workshop-provided VMs

## Setup Requirements (per participant)
- Docker (preferred) OR Python 3.11+ + Node 20+ + pnpm
- 8GB+ RAM (Qiskit Code Assistant model)
- `scripts/setup.sh` → one-shot local setup
- `scripts/setup-docker.sh` → Docker-only path

## Workshop Modules (planned)
1. Intro to quantum computing concepts (Manim animations)
2. First Qiskit circuit with IBM Bob assistance
3. Running on simulator vs real backend
4. Exploring results with visualizations
5. Advanced: Variational algorithms with AI assistance

## Documentation i18n
- Docs source: `docs/i18n/{locale}/{module}.md`
- Supported locales: `en`, `pt-BR`
- All new doc content must have both locales at minimum
- Rendered as web pages under `/docs/[locale]/[slug]`

## Content Principles
- Explanatory first — every code sample has a prose explanation
- Manim animation precedes code introduction (visual → concrete)
- IBM Bob interactions shown as annotated screenshots or live demo
- No jargon without definition

## Open Questions
- [ ] Workshop duration (half-day vs full-day format affects module depth)
- [ ] VM provisioning strategy for large groups
- [ ] Recording/async version of workshop content
