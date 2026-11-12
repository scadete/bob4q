# Lightweight Workshop Mode

Facilitator guide for running the Quantum Experience Lab in **one hour** with an
audience that **cannot download anything** and **cannot create IBMid accounts**
during the session.

Default design: **guided replay.** Participants open one URL, predict what Bob
will do, watch a *real recorded* Bob session replayed step by step beside the
matching animations, then take home everything needed to repeat the experience
at their own pace with their own account. Nothing live depends on IBM, on a
shared key, or on a model server.

Status (2026-11-12): **replay player and seven recordings exist; no dry run with
participants yet.** Section 4.4 lists exactly what is recorded and what is not.
Statements about IBM tooling are marked *documented* (from IBM docs) or *must
test*. Unmarked statements describe this repository as it is today.

Reference workshop: <https://ibm.github.io/intro-bob-workshop/> (Lab 1 team and
no-device format, Lab 6 external audience, Lab 6c Bob Shell agent, Lab 7
rules/skills/MCP).

---

## 1. Decisions that shape this mode

| Constraint or answer | Consequence |
|---|---|
| Participants cannot download or create IBMid accounts. Invitees to IBM plans cannot skip the IBMid; the Bob IDE cannot be installed. | Participants never run Bob. They watch recorded sessions. |
| The facilitator has a Bob API key. | The key is used **once, before the event**, to record real sessions with `bob run`. Optionally it runs one live prompt from the facilitator laptop. Participants never see it. |
| No server for Ollama. No local LLM in this mode. | Explanations come from the official Qiskit docs MCP server in a recorded session, plus Bob itself. No model hosting anywhere. |
| Only limit is available tokens. | Recording cost is small and one-off (see 6). No per-participant spend. |
| Session length is 1 hour. | Four use cases of about 10 minutes each (see 3). |
| Goal: feel the experience, then replicate later on their own accounts. | Every replay ends in a take-home card, and a "Do this at home" page and kit ship with the frontend (see 5). |

Why replay and not a live shared key: a shared key readable by a room needs
IBM's agreement and a team-container host. Replay needs neither, cannot fail
mid-session, and is also the take-home version. Live mode is kept as an
optional appendix (section 9).

---

## 2. What the participant experiences

Every use case has the same five beats, which keeps a 10-minute slot predictable.

| Beat | Time | What happens |
|---|---|---|
| **Predict** | 1.5 min | The slide asks a question ("Which gate makes a fair coin?"). Teams of 3–4 agree on a prompt or an answer from three choices. This is the interaction: the Lab 1 team-prompting pattern, without needing the tool. |
| **Replay** | 3.5 min | A terminal player replays a real recorded Bob session: the prompt, Bob's reasoning summary, the rules and skills it loads, each tool call (docs lookups, file writes, code runs) and the result. Steps advance with a click, or play automatically. |
| **Visual** | in parallel | The existing React animations follow the replay: the circuit draws as Bob writes it, the histogram fills when the code runs. This ties the abstract Qiskit result to the picture. |
| **What if?** | 3 min | A toggle swaps in a second recorded run that changes one variable (entangled coins, the docs tool switched off, the skill removed). Teams predict first, then reveal. This is where the effect of the MCP server or the skill becomes visible. |
| **Take-home card** | 1.5 min | The exact prompt, the file Bob produced, and the rule or skill responsible. Screenshot-friendly. |

Participants use their own phones or laptops in a browser. A projector shows the
same page driven by the facilitator for the shared moments.

---

## 3. One-hour run sheet

| Min | Block | Who | Content |
|---|---|---|---|
| 0–5 | Arrival and frame | Facilitator | URL on screen. What Bob is, what you will see, "everything you see is a real recorded Bob session". Teams form. |
| 5–15 | Foundations | Facilitator | `/demo` slides, shortened: qubit, superposition, gates, and one slide on the agentic loop. Animations carry this block. |
| 15–25 | Use case 1: idea to circuit | Teams | Predict, replay, visual: the quantum coin from plain English (skill `qiskit-beginner-circuit` plus the rules). What if: two coins that always match (entanglement), also recorded. |
| 25–35 | Use case 2: circuit explanation grounded in the docs | Teams | Bob reads `bell.py`, calls the **Qiskit docs MCP** (`search_docs_tool`, `get_page_tool`) and explains each gate with a link to the docs page it fetched. What if: the same request with the docs MCP off. Bob answers from memory with links it never opened (old `docs.quantum.ibm.com` addresses). |
| 35–45 | Use case 3: migrate old Qiskit code to 2.x | Teams | A small Qiskit 1.x Deutsch-Jozsa script that fails on 2.x (the V1 `Sampler` is gone). Main run: skill `migrate-qiskit-ibm-runtime` (from Qiskit/skills). What if: Bob plus the docs MCP, no skill. Both make the same edit. The skill costs about five times more and states that the script is outside its scope (see 4.4). Predict: "what changes?" Answer: only the Sampler call and how results are read. |
| 45–55 | Use case 4: from simulated code to a real quantum computer | Teams | The same Deutsch-Jozsa script, now a 2.x simulator script. Bob adapts it to run on `ibm_kingston` through `qiskit-ibm-runtime` (job mode, token from an environment variable, `generate_preset_pass_manager`) and prints simulator and hardware counts side by side. The hardware shows about 98% and 95% correct, with noise. The Managed Workflows skill is **not** used: the free Open Plan is not entitled to it (see 5.6). |
| 55–60 | Wrap-up | Facilitator | Bobalytics-style scorecard slide, the "Do this at home" page and QR code, questions. **Reserve:** if time remains, run one live prompt from the room on the facilitator laptop (appendix 9.1). |

Time boxes are tight. If a block overruns, drop its "What if?" beat, never the
Replay. Notebooks 02 to 04 are not part of the hour; they are in the take-home
kit.

---

## 4. Recording the sessions (before the event)

The replays are real sessions, captured once with your API key. They are not
mocked, and the player labels them "Recorded session, Bob <version>, <date>".

### 4.1 Prepare a recording workspace

1. Install Node 24 and Bob Shell: `npm install -g @ibm/bob` (*documented*).
2. Set the key as an environment variable: `export BOB_API_KEY=...`
   (*documented*; key-only `bob run` worked in testing with no IBMid prompt).
   **Never write a key into the repo, a config file, a prompt or a recording.**
   Pass it inline for one command or from a script outside the repo, and rotate
   it after recording. The same goes for `QISKIT_IBM_TOKEN`.
3. Clone this repo, add `.bob/mcp.json` and `.bob/skills/` (section 5). Pass
   `--trust --accept-license --workspace <dir>` on every `bob run`; this worked
   unattended in testing.
4. Install the official skills and MCP servers (section 5.6). The repo's own
   `mcp-server/` (Qiskit Code Assistant through Ollama) is **not** used in this
   mode.

### 4.2 Record each prompt

```bash
bob run --format stream-json --max-turns 12 --max-cost 0.50 \
  "<prompt text>" > recordings/uc1-coin.jsonl
```

- `--format stream-json` emits every message, tool call and result
  (*documented*). `--max-cost` and `--max-turns` cap the spend per run.
  Observed in testing:
  - Writes outside `--workspace` are blocked. Save outputs inside it.
  - Assistant text arrives in about 200 small chunks; the converter joins them.
  - The stream does not report which rules were loaded, so replays cannot show
    a "rule loaded" step from a recording alone.
  - Runs sometimes stall until the timeout with no output (2 of 5 attempts for
    use case 1). Set a timeout and retry.
  - A skill that reads a large registry can exceed a 0.50 cap before it edits
    anything (the migration skill used 0.58, then 1.17 with the cap raised to
    1.50). Set the cap per use case.
- **Isolate each variable.** For a "without X" variant, record in a temp
  workspace outside the repo that lacks X (no `.bob/mcp.json` for the no-docs
  run, no `.bob/skills/` for the no-skill run). The skills are auto-loaded by
  description, so a skill can trigger on its own if it is present.
- Record **two or three takes** per prompt and keep the cleanest. Real sessions
  wander; do not edit content, only choose.
- Replay ids: `uc1_coin` (+ what-if `uc1_coin_two_qubits`), `uc2_explain_docs`
  (+ what-if `uc2_no_docs`), `uc3_migrate_skill` (+ what-if `uc3_migrate_docs`),
  `uc4_sim_to_qpu`.
- After each run, execute the file Bob wrote and capture its real output
  (counts, text). Embed that output in the replay so the visual matches the
  recording, not a new run.
- Strip anything private: paths under your home directory, the keys, job ids,
  account identifiers. Use `scripts/recording_to_replay.py` (below), which
  rewrites paths and refuses to write if a `bob_prod_` key, or any literal in the
  `REDACT_LITERALS` environment variable, appears in the recording or the
  output. Raw streams are kept in `recordings/raw/` after the same scrub, so
  scan them too.

### 4.2a Converting a recording

```bash
REDACT_LITERALS='<ibm-key>,<bob-key>' python3 scripts/recording_to_replay.py \
  recordings/raw/<name>.jsonl frontend/content/replays/<id>.json \
  --id <id> --predict-answer <0-2> --bob-version 2.0.9 \
  --pin qiskit=2.6.2 --prompt "<prompt as shown to participants>" \
  [--what-if <id>] [--no-auto-animation] [--redact '<regex>'] [--strip <abs prefix>]
```

The converter joins streamed chunks, drops `mkdir` noise and to-do list updates,
shows edits as diffs, reduces docs searches and page fetches to titles and URLs,
and drops Python logging lines from shell output. Nothing is invented. Use
`--no-auto-animation` when the output is deterministic, because the histogram
animation loops a random 50/50 coin and would mislead.

### 4.3 Storage

`frontend/content/replays/<id>.json`, one file per recording, validated at load
time with a `zod` schema (a project rule for runtime validation). A replay is:
metadata (Bob version, date, model if reported, cost), an ordered list of steps
(`prompt`, `assistant_text`, `rule_loaded`, `skill_loaded`, `tool_call`,
`tool_result`, `file_written`, `run_output`), and per-step hooks to animations.

Estimated recording cost: about 8 recordings, 2–3 takes each, a handful of tool
calls per run. Record a single run first with `--format json` and read
`stats.session_costs` to price the whole set before running the rest.

### 4.4 Recording status (2026-11-12)

All recordings: Bob 2.0.9, Qiskit 2.6.2, single take, qiskit-docs-mcp-server
0.3.0, skills from Qiskit/skills at `d031f75`. Raw streams in `recordings/raw/`.

| Replay | What it shows | Source | Cost | Notes |
|---|---|---|---|---|
| `uc1_coin` | Skill `qiskit-beginner-circuit` writes and runs a quantum coin | recorded | 0.21 Bobcoins, 20 s | Counts `{'1': 522, '0': 478}`. 2 of 5 attempts stalled. |
| `uc1_coin_two_qubits` | Entangled coins (what-if), same skill | recorded | 0.21, 19 s | Counts `{'00': 492, '11': 508}`. Docs search returned an off-topic first hit (a hardware tutorial); kept as recorded. |
| `uc2_explain_docs` | Gate-by-gate explanation of `bell.py` using docs MCP | recorded | 0.21, 33 s | 5 links, all fetched. |
| `uc2_no_docs` | Same request, docs MCP off | recorded | 0.09, 17 s | 4 links from memory on the old docs domain; none fetched. |
| `uc3_migrate_skill` | `migrate-qiskit-ibm-runtime` on a Qiskit 1.x script | recorded | 1.17, 48 s | The skill says the script is outside its Runtime scope, then makes the equivalent change. Output `{'000': 1024}` and `{'111': 1024}`. |
| `uc3_migrate_docs` | Same migration, docs MCP, no skill (what-if) | recorded | 0.23, 23 s | Same edit and same output. |
| `uc4_sim_to_qpu` | Simulator script adapted to run on `ibm_kingston` | recorded, real QPU | 0.42, 65 s | Two jobs of 1024 shots. Constant: 1002 of 1024 correct. Balanced: 974 of 1024. Uses a few seconds of the free 10 minutes. |

Fixtures (copied or authored, with their READMEs):
`recordings/fixtures/bell.py`, `legacy-qiskit-1.x/deutsch_jozsa.py` (runs on
Qiskit 1.4.2, fails on 2.6.2 with `ImportError: cannot import name 'Sampler'`),
`sim-to-qpu/dj_sim.py`, and `legacy-qiskit-0.43/` (a real 2023 notebook, kept as
an optional harder example; not used in the hour).

What the use case 3 comparison says: the skill is built for `qiskit-ibm-runtime`
and says so; for this reference-primitive migration the docs MCP alone gave the
same result at about a fifth of the cost. Present it that way. Do not claim the
skill is needed.

---

## 5. What to build in the repository

### 5.1 The player (first engineering task)

- `frontend/src/components/ReplayPlayer.tsx`: terminal-style player. Controls:
  play, pause, next step, previous step, speed. Keyboard: space and arrows.
  Works at phone width with no horizontal scroll.
- `frontend/src/lib/replays.ts`: schema, loader, and the list of replay ids per
  use case, using named exports.
- Animation hooks: each step may name an animation key and parameters (for
  example `ResultsHistogramAnimation` with the recorded counts). Reuse the
  existing registry in `frontend/src/lib/animations.ts`; do not add a new video
  pipeline.
- A `/replay/[id]` route, or a slide type in `/demo`, plus `en` and `pt-BR`
  strings for every UI label (`frontend/messages/*.json`). Recorded Bob output
  stays in English and says so on screen.
- Predict and What-if UI: a three-choice question per replay, with the recorded
  answer revealed after the team commits.

### 5.2 Configuration and skills

Use the official packages wherever they exist; write our own only for use case 1.

- `.bob/mcp.json` for recording (project config; the repo's current
  `bob.mcpServers` snippet does not match Bob's documented format):

  ```json
  {
    "mcpServers": {
      "qiskit-docs": {
        "command": "uvx",
        "args": ["qiskit-docs-mcp-server"],
        "alwaysAllow": ["search_docs_tool", "get_page_tool"]
      }
    }
  }
  ```
  The docs server is public and needs no token.
- Skills in `.bob/skills/<name>/SKILL.md`, each with `name` and `description`
  (a skill with no `description` is ignored, *documented*):
  - `migrate-qiskit-ibm-runtime` (use case 3) and `managed-workflows-quickstart`
    (shown in the take-home kit only; see 5.6): **copied** from
    <https://github.com/Qiskit/skills> into `.bob/skills/` (not symlinks; they
    break on Windows), with `UPSTREAM.md` recording the commit. Do not edit them.
  - `qiskit-beginner-circuit`: ours, for use case 1.
  - `.bob/settings/mcp_settings.json` is kept identical to `.bob/mcp.json`. It
    was invalid JSON before (comments and a missing comma).
- Update `docs/i18n/{en,pt-BR}/bob-setup.md` to the documented MCP format and
  add a "Bob Shell with an API key" section.

### 5.3 Take-home ("Do this at home")

Built. The route `/[locale]/at-home` (English and pt-BR) lists what you need
(an IBM Bob account, Node 24 and Python with uv, and for the last example an
IBM Quantum token), the install and run commands, and the four prompts exactly
as recorded, each with a link to its replay. It is linked from the home page
and from every replay's take-home card.

The kit is `frontend/public/kit/bob4q-kit.zip` (about 120 KB), served at
`/kit/bob4q-kit.zip`. It holds `.bob/mcp.json`, the three skills with the
upstream licence and `UPSTREAM.md`, a beginner-mentoring rule, the three example
scripts, the five lab notebooks, and `README-HOME.md` (the same steps as the
page). It is offered after the session, so it does not conflict with the
no-download rule during the event.

- Sources live in `kit/` (`README-HOME.md`, `rules-agent-AGENTS.md`,
  `examples/`). Rebuild after changing any of them, the skills, `.bob/mcp.json`
  or the notebooks: `python3 scripts/build_kit.py`. The script refuses to build
  if a file contains a `bob_prod_` key or a home path.
- The kit omits the repo's own rules file, which mixes in project-specific
  Manim and MCP-server rules.
- Not yet checked: the kit unzipped on a clean machine, with a real Bob trial
  account, following only the page. Do this before the event.

### 5.6 Official skills and MCP servers: pins and access

**Version rule:** all new code that Bob writes, and every migration target, uses the latest Qiskit (2.6.2 on 2026-11-12; `qiskit-ibm-runtime` 0.52.1). Run recorded code unpinned with `uv run --with qiskit python <file>` and put the resolved versions in the replay `pins`. The five lab notebooks, the `/lab` command, the walkthrough and the docs now use 2.x as well (all notebook cells ran with no failures under 2.6.2). Older Qiskit appears only in migration fixtures.

| Item | Used in | Needs | Pin |
|---|---|---|---|
| `qiskit-docs-mcp-server` | 2, 3 | internet only | PyPI version |
| `migrate-qiskit-ibm-runtime` skill | 3 | The migration **target is the latest release**: `qiskit-ibm-runtime` 0.52.1 (checked 2026-11-12), which is past the 0.50.0 needed for the client-side primitives hop. The skill covers `qiskit-ibm-runtime` only; the recorded use case 3 is a Qiskit-core migration (4.4) | Qiskit/skills commit SHA |
| `managed-workflows-quickstart` skill | none in the hour | `qiskit-ibm-catalog>=0.22`, API key, instance CRN, and a plan entitled to Qiskit Functions. **Tested 2026-11-12 on a free Open Plan instance: HTTP 401 "Your instance's resource plan is not entitled to use Qiskit Functions."** `compute_profiles()` never returns. Use case 4 therefore uses the simulator-to-QPU adaptation instead. | Qiskit/skills commit SHA |
| `qiskit-ibm-runtime` (library, not the MCP server) | 4 | `QISKIT_IBM_TOKEN` in the environment; Open Plan gives 10 min QPU per 28 days, jobs and batches only; a free-plan key listed `ibm_fez`, `ibm_kingston` and `ibm_marrakesh` (156 qubits) | PyPI version (0.52.1 used) |

The Runtime MCP server is **not** used: the recording ran the script from the
shell with the token in the environment, which keeps the token out of any MCP
config.

Both repos change often. Record every SHA and version, show them in the replay
banner (`pins` field), and re-record before reuse. Strip tokens, the CRN and
account ids from every recording.

### 5.4 Notebook outputs

`/lab` renders notebooks read-only and strips outputs today. Keep the code cells
unchanged and show the recorded outputs (counts, histograms) under each cell, so
teams see results without running Python. Notebook 04 has no real-QPU cell and
notebook 05 is the riddle, not Grover: the Grover slides stay narrated and a
Grover notebook is optional take-home work, not part of the hour.

### 5.5 Deploying

The only runtime is the frontend (`output: "standalone"` Next.js, or any host
that runs it). No VPS sizing, containers for participants, or model server. Any
free or low-cost tier works. Use HTTPS, test the QR code, and keep a copy of the
build on the facilitator laptop as the offline fallback.

---

## 6. Preparation timeline

| When | Task |
|---|---|
| T-21 d | Confirm Bob Shell works with the API key on your machine (checklist items 1–3). |
| T-18 d | Done: `.bob/mcp.json`, copied skills, one test recording. |
| T-14 d | Re-record any replay you are not happy with, 2 to 3 takes each (section 4.2). |
| T-12 d | Build `ReplayPlayer` and the replay schema. Load each recording. |
| T-10 d | Wire animations to replay steps. Add predict and what-if UI. Add notebook outputs. |
| T-7 d | Strings in both locales. "Do this at home" page and kit. |
| T-5 d | Full 60-minute rehearsal with 3–4 volunteers on phones and laptops. Time each block. |
| T-2 d | Deploy. Test the URL and QR on venue-like networks. Save the offline build. |
| T-0 | Open the page 30 minutes before. Warm the facilitator laptop live-prompt seat if you plan one. |
| T+0 | Send the take-home link. If you ran a live prompt, check the key's usage. |

---

## 7. Go / no-go checklist

| # | Check | Pass criterion |
|---|---|---|
| 1 | `bob run` authenticates with the API key alone, and returns an answer | No browser login or IBMid prompt. |
| 2 | Licence and trust prompts do not block `bob run` | The run completes unattended with `--accept-license --trust`. |
| 3 | Project MCP and skills load during recording | The stream shows `search_docs_tool` calls and a skill load for each skill prompt. |
| 4 | Rules apply; the docs MCP changes the answer | Recorded runs contain no `execute()` and include measurement. `uc2_no_docs` demonstrably lacks the doc links. |
| 5 | All recordings stored, validated, free of private data | Schema passes (`pnpm test`); `scripts/recording_to_replay.py` ran with `REDACT_LITERALS`; grep of `frontend/content/replays/` and `recordings/raw/` for the home path, both keys, the CRN and job ids returns nothing. |
| 6 | Player runs every replay with its animation on a phone and a laptop | Steps advance, no horizontal scroll, animation matches the recorded counts. |
| 7 | A 60-minute rehearsal fits | Each block within its time box with real participants. |
| 8 | Both locales complete | No missing keys in `messages/en.json` or `messages/pt-BR.json`. |
| 9 | Take-home link and QR work | Opens on a phone; the kit contains `.bob/`, notebooks, prompts. |
| 10 | Offline fallback works | Local build served from the laptop with the venue Wi-Fi off. |

Items 1–3 decide whether the recordings can contain MCP and skills at all. If
item 3 fails for skills, record the skill prompts as plain `bob run` prompts that
inline the skill body, and mark them as such in the card.

---

## 8. Risks

- **Recorded is not live.** Say so on the first slide and on every replay. The
  honest line is: "This is a real session, replayed, so we can focus on what
  it does."
- **Bob version drift.** The recordings show Bob 2.0.x behaviour. Put the version
  and date on each replay. Re-record before reuse.
- **Variance between recordings and what participants get at home.** Real runs
  differ. The take-home page says to expect different wording and the same
  result.
- **Private data in recordings.** Review every JSON before commit (check 5).
- **Over-long blocks.** The 10-minute slot has no slack. Cut the What-if beat
  first.
- **Moving upstream.** The skills and MCP servers are updated often. Pin and
  label them (5.6). A skill may behave differently on re-recording.
- **Use case 4 is a QPU run, not a Managed Workflows deployment.** The Open Plan
  is not entitled to Qiskit Functions (5.6). The replay shows real hardware with
  real noise; say "run on a real quantum computer", not "deployed as a
  function". If a plan with Managed Workflows becomes available, the skill
  `managed-workflows-quickstart` can be recorded as an extra use case. Never mock
  a deployment.
- **Queue time on real hardware.** The recorded run took 65 s because the
  `ibm_kingston` queue was empty. A busy queue can take much longer; the replay
  hides this, so say so if a participant asks.
- **Audience level.** Cases 3 and 4 are advanced. Present them as outcome demos
  (the diff, the size table, the returned result), not hands-on exercises.
- **Long sessions.** Runs with many tool calls (use case 2 has 9, use case 3 has
  16). The player collapses output longer than 12 lines; raise `--max-turns`
  when recording.
- **Keys in the transcript.** If you paste a key into a chat or terminal during
  recording, it is stored in that history. Rotate both keys afterwards.
- **Stalled recordings.** About 2 of 5 runs of the first use case hit the
  timeout with no output. Budget retries.

---

## 9. Appendix: live mode (optional)

Use this only when you want participants to type to Bob themselves and IBM has
agreed to one key serving a room.

### 9.1 One live prompt from the facilitator laptop

Zero infrastructure and no key exposure: run `bob chat` on your laptop, project
it, and take one prompt from the room in the reserve minutes. If the network or
the key fails, return to a replay. This is the recommended optional extra.

### 9.2 Shared team workspaces

A workshop host runs the frontend, a reverse proxy, JupyterHub with
DockerSpawner, and one container per team of 3–4. Each container holds Node 24,
Bob Shell, the repo clone, rules, skills and `.bob/mcp.json`, with the key in the
environment. There is no model server; the explanations use the Qiskit docs MCP server.
This costs real Bobcoins during the event, needs per-team isolation because the
key is readable inside the container, and adds the *must test* items from
section 7 (interactive `bob chat` on a key alone, trust persistence, rate limits
with many teams). Do not use it as the default. Ask IBM whether one key may serve
a room first; if not, use one key per team under an Enterprise plan.

### 9.3 Google Colab

A weak fallback, listed for completeness: `bob run` only, Node 24 reinstalled
every session, the key visible in the notebook, an MCP server that must be
publicly reachable, and participants need existing Google accounts. Untested.

---

## Sources

- IBM Bob Shell install and authentication (API key, `BOB_API_KEY`, Node 24):
  <https://bob.ibm.com/docs/shell/getting-started/install-and-setup>
- Non-interactive `bob run` (`--format json|stream-json`, `--max-cost`,
  `--max-turns`, `--accept-license`, `--trust`):
  <https://bob.ibm.com/docs/shell/getting-started/start-bobshell-non-interactive>
- Bob Shell ACP (`BOBSHELL_API_KEY`): <https://bob.ibm.com/docs/shell/features/acp>
- MCP in Bob (`.bob/mcp.json`, `mcpServers`, `alwaysAllow`):
  <https://bob.ibm.com/docs/ide/configuration/mcp/mcp-in-bob>
- Skills (`.bob/skills/<name>/SKILL.md`): <https://bob.ibm.com/docs/ide/features/skills>
- Qiskit skills: <https://github.com/Qiskit/skills>
- Qiskit MCP servers: <https://github.com/Qiskit/mcp-servers>
- Plans and Bobcoins: <https://www.ibm.com/products/ai-coding-agent/pricing>
- Reference workshop: <https://ibm.github.io/intro-bob-workshop/>
  ([Lab 1](https://ibm.github.io/intro-bob-workshop/lab-1/),
  [Lab 6](https://ibm.github.io/intro-bob-workshop/lab-6/),
  [Lab 6c](https://ibm.github.io/intro-bob-workshop/lab-6c/),
  [Lab 7](https://ibm.github.io/intro-bob-workshop/lab-7/))
