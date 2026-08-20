# test-improve-prompt-w-gemini-flash

## Overview

`test-improve-prompt-w-gemini-flash.mjs` is a Node.js developer tool that transforms raw, unstructured task descriptions into structured, verifiable work orders for autonomous coding agents (such as Claude Code). It uses Google Gemini Flash models with structured outputs (`responseJsonSchema`) and extended thinking.

The tool operates through a multi-pass pipeline: it extracts an explicit inventory of requirements, drafts an engineered work order, subjects the draft to a multi-round review ladder, runs an independent audit pass with optional targeted repairs, and persists cross-run lessons learned.

---

## How to Run

### Prerequisites
- Node.js environment supporting ES modules.
- `GEMINI_API_KEY` set in the environment or `.env` file.

### Execution
Run the script directly with Node.js:

```bash
node test-improve-prompt-w-gemini-flash.mjs
```

The script invokes `runTest` with the configuration object declared at the top of `test-improve-prompt-w-gemini-flash.mjs`.

---

## Architecture and Pipeline

1. **Configuration Validation**: Asserts valid ranges, enum values, output directories, and API key presence.
2. **Model Resolution**: Depending on `modelSelection`, checks for newer Gemini Flash models via `models.list()` or uses the pinned model. Caches resolutions to disk.
3. **Bootstrap**: When enabled and missing, automatically distills repository context and generates/audits `README.md` against source code.
4. **Repo Context Resolution**: Reads project laws, rules, reference docs, agent profiles, skills, and probes local CLI tools, distilling them into a cached brief.
5. **Run Initialization**: Creates an output folder (initially prefixed with `pending_` and a timestamp) and writes an initial checkpointed `run_state.json` before making model calls.
6. **Pass 1 - Analysis**: Analyzes the input prompt to generate a requirement inventory, implied mechanics, failure modes, ambiguities, repo mechanisms, and perishable version identifiers. Adopts a permanent directory name using the generated `file_slug`.
7. **Pass 2 - Draft**: Produces the initial work order satisfying all extracted requirements.
8. **Pass 3 - Review Ladder**: Runs up to `reviewRounds` sequential critique-and-revision passes (`coverage_and_fidelity`, `mechanism_and_verification`, `execution_simulation`). Early exit can occur starting from round 2 (`index >= 1`) if the target score is achieved with zero uncovered requirements and zero lint issues.
9. **Pass 4 - Independent Final Audit & Targeted Repair**: An independent audit pass scores the final draft across all 13 dimensions. If requirements remain uncovered, triggers up to `maxRepairRounds` repair passes followed by re-auditing.
10. **Artifact Selection**: Chooses the final artifact, or an earlier iteration if a previous draft scored higher by more than a 2-point margin.
11. **Lesson Distillation**: Distills defects and lint findings from the run into `_context/prompt-lessons.json` for future runs.
12. **Closeout**: Writes `improved_prompt_<slug>.txt`, `original_prompt.txt`, `run_state.json`, and optionally `run_summary.md`.

---

## Configuration Reference

All settings are defined inside the `config` object in `test-improve-prompt-w-gemini-flash.mjs`:

| Config Key | Type | Default | Description |
|---|---|---|---|
| `prompt` | `string` | *(Sample prompt)* | The raw prompt text to analyze and rewrite into a work order. |
| `model` | `string` | `'gemini-3.7-flash'` | Model pin and fallback baseline. Under `latest-flash`, acts as a floor. |
| `modelSelection` | `string` | `'latest-flash'` | `'latest-flash'` queries the API for the newest Flash model at or above `model`; `'pinned'` uses `model` verbatim. |
| `modelRefreshDays` | `number` | `7` | Integer days to cache dynamic model discovery before querying `models.list()` again. |
| `thinkingLevel` | `string` | `'high'` | Thinking budget tier. Accepts `'low'`, `'medium'`, or `'high'`. |
| `maxOutputTokens` | `number` | `32768` | Total token cap per response (minimum `2048`, ceiling `65536`). Must accommodate both thinking and visible output. |
| `depth` | `string` | `'engineered'` | `'engineered'` supplies unstated execution mechanisms; `'faithful'` only structures and clarifies without adding new mechanisms. |
| `identifierPolicy` | `string` | `'resolve-at-runtime'` | `'resolve-at-runtime'` retains author literals alongside durable capability tiers and resolution instructions; `'verbatim'` leaves version strings frozen as typed. |
| `reviewRounds` | `number` | `3` | Number of sequential review ladder rounds to execute (integer between `0` and `3`). |
| `targetScore` | `number` | `95` | Ladder early-exit score threshold (integer `1` to `100`). Requires 0 uncovered requirements and 0 lint warnings. |
| `maxRepairRounds` | `number` | `1` | Maximum targeted revision passes fired if requirements remain uncovered after the review ladder. |
| `targetAgent` | `string` | *(Claude Code description)* | Brief defining the executing agent, repo type, and runtime environment targeted by the prompt. |
| `extraGuidance` | `string` | `''` | Custom instructions injected into system and user prompts to override default rewriter behaviors. |
| `includeRepoContext` | `boolean` | `true` | Whether to load and inject distilled repository documentation and installed CLI tools. |
| `refreshRepoContext` | `boolean` | `false` | Forces re-distillation of repository documentation even if file hashes match cache. |
| `bootstrapDocs` | `boolean` | `true` | If `true`, builds missing `_context/` and generates `README.md` from source on first run. |
| `regenerateReadme` | `boolean` | `false` | Forces regeneration and self-audit of `README.md` from source code on execution. |
| `learnFromPriorRuns` | `boolean` | `true` | Injects distilled defect lessons from previous runs into system prompts and records new findings. |
| `maxLessons` | `number` | `12` | Maximum number of cross-run lessons retained in `_context/prompt-lessons.json`. |
| `keepRoundSnapshots` | `boolean` | `true` | When `true`, saves the prompt output of each ladder and repair round into the `rounds/` subfolder. |
| `runName` | `string` | `''` | Custom directory and file slug. If empty, uses the model-generated `file_slug` from analysis. |
| `outputRoot` | `string` | `THIS_DIR` | Directory path where output run folders will be created. |
| `writeRunSummary` | `boolean` | `true` | When `true`, outputs a formatted markdown summary (`run_summary.md`) inside the run folder. |
| `printImprovedPrompt` | `boolean` | `true` | Whether to print the final improved prompt text to standard output upon completion. |
| `showThinkingSummary` | `boolean` | `false` | Passes `includeThoughts` to Gemini API `thinkingConfig` to return thought text parts. |
| `timeoutMs` | `number` | `300000` | AbortController timeout in milliseconds per API call (default 5 minutes). |

---

## On-Disk Layout

```
.
├── _context/
│   ├── model-resolution.json      # Cached dynamic model resolution metadata
│   ├── prompt-lessons.json        # Distilled defect lessons across runs
│   ├── repo-context.json          # Cached repository operating brief JSON
│   └── repo-context-digest.md     # Human-readable operating brief mirror
├── README.md                      # Generated and audited documentation
├── <run_slug>/                    # Created before first model call (pending_<stamp> -> <slug>)
│   ├── improved_prompt_<slug>.txt # The final shipped prompt
│   ├── original_prompt.txt        # Copy of the original input prompt
│   ├── run_state.json             # Checkpointed state, configs, scores, and tokens
│   ├── run_summary.md             # Markdown progression summary and analysis audit
│   └── rounds/                    # Created when keepRoundSnapshots is true
│       ├── 01_draft.txt
│       ├── 02_review_1.txt
│       ├── 03_review_2.txt
│       ├── 04_review_3.txt
│       └── 05_repair_1.txt
```

---

## Scoring, Review Ladder, and Selection Mechanics

### Scoring Formula
Artifact scoring is deterministic, calculated across coverage, rubric dimension scores, and deterministic linter deductions:
- **Requirement Coverage (25%)**: Percentage of requirements marked `covered` (1.0x) or `weak` (0.5x).
- **Dimension Mean (55%)**: Arithmetic mean of scores across all evaluated dimensions.
- **Worst Dimension (20%)**: Minimum score among evaluated dimensions.
- **Lint Penalty**: `-5` points per deterministic lint warning (capped at `-15` points).

If a model returns scale-slipped ratings (all dimensions <= 5), the scores are multiplied by 20 before calculation.

### Deterministic Linter
Runs locally without model calls to flag:
- Weasel phrases: `"best practices"`, `"as needed"`, `"where appropriate"`, `"ensure quality"`, `"make sure it looks good"`, `"properly implement"`, `"high-quality code"`.
- Preamble introductions (`"Here is..."`, `"Below is..."`) or leading Markdown code fences.
- References to `"operating context"`.
- Missing literal identifiers found in the input (counts, table names, paths).
- Perishable identifiers lacking runtime resolution clauses (when `identifierPolicy === 'resolve-at-runtime'`).

### Review Ladder Mandates
1. `coverage_and_fidelity`: Checks requirement coverage id-by-id, fidelity of literals, durability of perishable identifiers, and strips invented scope.
2. `mechanism_and_verification`: Evaluates execution readiness, batch delegation mechanics, non-overlapping subagent lanes, verification commands, and failure mode neutralizations.
3. `execution_simulation`: Adversarial simulation identifying stall points, objective positioning, concision, and environmental tool fit.

### Artifact Selection
By default, the latest artifact produced is shipped. An earlier artifact is selected only if its overall score exceeds the latest artifact by more than a 2-point selection margin (`SELECTION_MARGIN = 2`).

---

## Operating Context and Cross-Run Memory

### Repository Context (`repo-context.mjs`)
When `includeRepoContext` is enabled, the tool discovers the repo root by walking upwards for `AGENTS.md`, `CLAUDE.md`, or `.git`. It reads:
- `AGENTS.md` and `.claude/rules/**/*.md` (full text up to 12,000 bytes per file).
- `.claude/reference`, `.claude/agents`, and `.claude/skills` (first 3,500 bytes per file).
- Probed CLI versions (`git`, `gh`, `aws`, `vercel`, `gcloud`, `ngrok`, `node`, `npm`, `python`, `docker`).

The content is hashed into a SHA-1 fingerprint (`BRIEF_VERSION:extract_text`). If cached in `_context/repo-context.json` and CLI probe data is under 14 days old, it is read from disk without an API call. Otherwise, Gemini distills the files into structured sections, which are saved to `_context/repo-context.json` and `_context/repo-context-digest.md`.

### Cross-Run Memory (`prompt-lessons.json`)
When `learnFromPriorRuns` is enabled, findings from drafts scoring under 90, uncovered requirements, and lint issues are collected. A structured model call merges and deduplicates them into at most `maxLessons` imperative rules. These lessons are injected into the system instructions of subsequent runs.

---

## Provider Gotchas and Constraints

- **Thinking Token Accounting**: Gemini bills thinking tokens as output tokens. Thinking tokens and the final generated output share the single `maxOutputTokens` cap. If `maxOutputTokens` is exceeded, Gemini halts with `finishReason === 'MAX_TOKENS'`, which throws an error.
- **Thinking Level Limitations**: Gemini 3.7 Flash supports only `'low'`, `'medium'`, and `'high'` thinking levels. Passing `'minimal'` results in a `400 INVALID_ARGUMENT` API rejection.
- **Deprecated Sampling Parameters**: `temperature`, `top_p`, and `top_k` are omitted in accordance with Google Gemini 3.x guidelines. Sending them alongside thinking configurations causes errors.
- **Candidate Count**: `candidate_count` is unsupported on Gemini 3.x.
- **Model Listing vs Get**: `models.get()` resolves retired tombstone IDs, making it unreliable for presence verification. Dynamic resolution uses `models.list()` to confirm `generateContent` capability.
- **Dead Model Fallback**: If a dynamically resolved model ID returns a `404` or `NOT_FOUND` error during generation, the tool invalidates `_context/model-resolution.json` and falls back to the pinned `config.model` for all remaining passes in the run.
- **Structured Output Generation Ordering**: Gemini Structured Output (`responseJsonSchema`) uses `propertyOrdering` to guarantee reasoning and requirement coverage arrays are generated before `improved_prompt`. This enforces in-band reasoning before the prompt text is written.
- **Transient Error Retries**: HTTP statuses `429`, `500`, `502`, `503`, `504` and rate limit messages are retried up to 3 total attempts (2 retries) with linear backoff (base 4000ms: 4s, 8s). Execution timeouts controlled by `timeoutMs` are not retried.
