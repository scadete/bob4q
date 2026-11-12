# Repeat the workshop at home

This kit holds everything used in the recorded Bob sessions. The sessions ran on
IBM Bob 2.0.9 and Qiskit 2.6.2 (November 2026). Expect different wording from Bob
and the same results.

## What you need

- An IBM Bob account. IBM lists a 30-day trial with 50 Bobcoins, which needs an
  IBMid. Check <https://www.ibm.com/products/ai-coding-agent/pricing> for current terms.
- Node.js 24 or later, and Python with [uv](https://docs.astral.sh/uv/).
- For the last example only: a free IBM Quantum account (the Open Plan gives 10
  minutes of QPU time per 28 days) and its API token.

## Set up

1. Install Bob Shell: `npm install -g @ibm/bob`
   (<https://bob.ibm.com/docs/shell/getting-started/install-and-setup>).
2. Put your Bob API key in the environment: `export BOB_API_KEY=...`. Never write
   a key into a file or a prompt.
3. Unzip this kit and open a terminal in the folder. It contains `.bob/` with the
   MCP server config (`.bob/mcp.json`), three skills and the rules, plus `examples/`.
4. Start Bob in that folder with `bob chat`, or run one prompt with
   `bob run --trust --accept-license "<prompt>"`.

The Qiskit docs MCP server starts with `uvx qiskit-docs-mcp-server`; `uv` fetches it.

## The four prompts

| # | Prompt | Needs |
|---|---|---|
| 1 | `/qiskit-beginner-circuit a coin that lands heads or tails with equal chance` | nothing else |
| 2 | `Explain what examples/bell.py does, gate by gate, for a complete beginner. Use the Qiskit documentation to check each gate, and link the docs page you used for each one. Do not edit any file.` | the docs MCP (in `.bob/mcp.json`) |
| 3 | `/migrate-qiskit-ibm-runtime Migrate examples/deutsch_jozsa_qiskit1x.py to the latest Qiskit release. Then run it.` | nothing else. Try it again without the skill: `Migrate examples/deutsch_jozsa_qiskit1x.py to the latest Qiskit release (2.x). Use the Qiskit documentation to find the replacement APIs. Then run it.` |
| 4 | `examples/dj_sim.py runs Deutsch-Jozsa on a local simulator. Adapt it to run on a real IBM quantum computer with qiskit-ibm-runtime. Use the Qiskit documentation to check the current API. Read the API token only from the environment variable QISKIT_IBM_TOKEN, never write it to a file or print it; use job mode, no sessions; transpile with generate_preset_pass_manager; keep 1024 shots. Save the result as dj_qpu.py, run it, and print the simulator and QPU counts side by side.` | an IBM Quantum token in `QISKIT_IBM_TOKEN`, and a backend name (the recording used `ibm_kingston`; list yours with `QiskitRuntimeService().backends()`) |

Run Python files with `uv run --with qiskit python <file>` (add
`--with qiskit-ibm-runtime` for prompt 4).

## Expected results

1. Counts close to 500 and 500 for `0` and `1`.
2. A gate-by-gate explanation with links to `quantum.cloud.ibm.com` pages.
3. The script runs on Qiskit 2.x and prints `constant -> constant {'000': 1024}`
   and `balanced -> balanced {'111': 1024}`. Only the Sampler call and the way
   results are read change.
4. The simulator gives exactly `000` (constant) and `111` (balanced). The real
   machine gives mostly the same answers with a few wrong bitstrings: noise.

## Notes

- `migrate-qiskit-ibm-runtime` and `managed-workflows-quickstart` come from
  <https://github.com/Qiskit/skills> (Apache-2.0, commit `d031f75`). Update them
  from there. `managed-workflows-quickstart` needs an IBM Quantum plan that
  includes Qiskit Functions; the free Open Plan does not.
- `notebooks/` holds the five lab notebooks. Run one with:
  `uv run --with jupyterlab --with qiskit --with matplotlib --with pylatexenc --with httpx jupyter lab notebooks/01-hello-quantum-with-bob.ipynb`
