# Tariff Refunds Helper Site

Public-facing Next.js tool for importers to check IEEPA tariff refund eligibility following the Feb 20, 2026 Supreme
Court ruling. Stack: Next.js 16, React 19, MySQL (via `mysql2`), Tailwind 4, shadcn/ui.

## MANDATORY: Model Selection — Opus 4.7 with Medium Thinking

**ALL agents, subagents, skills, teams, exploration tasks, and spawned Task tool invocations MUST use `model: "opus"`
(Opus 4.7) with medium thinking enabled. No exceptions.**

- When using the Task tool, ALWAYS pass `model: "opus"` regardless of subagent_type (Explore, Plan, Bash,
  general-purpose, etc.)
- Subagents should operate with **medium thinking** (extended thinking budget) so they can reason through multi-step
  investigations before acting.
- Claude Code resolves `"opus"` to the current Opus 4.7 model automatically — do not try to pin a minor version; the
  Agent tool's `model` argument only accepts `"opus" | "sonnet" | "haiku"`.
- When reporting on spawned-agent runs, say "Opus" — do not assert a specific 4.x version, since the runtime may route
  independently.
- NEVER use Sonnet or Haiku for any subtask, exploration, or delegation — always Opus 4.7.

---

## Quick Reference

| Resource             | Location            |
|----------------------|---------------------|
| Dev server           | `localhost:3014`    |
| Next.js pages        | `pages/`            |
| API routes           | `pages/api/`        |
| React components     | `components/`       |
| Core logic / db      | `lib/`              |
| Styles               | `styles/`           |
| Path-triggered rules | `.claude/rules/`    |
| Agent definitions    | `.claude/agents/`   |
| Skills               | `.claude/skills/`   |
| Scratch / throwaway  | `.claude/temp/`     |

---

## First Actions (Every Session)

1. **Research before coding** — read surrounding code and existing patterns before making changes. Spawn an `Explore`
   subagent if the change spans more than 3 files.
2. **Let path-triggered rules do their job** — files under `.claude/rules/` with `paths:` frontmatter auto-load when
   you edit a matching file. When CREATING a new test file, manually read `.claude/rules/test-files.md` BEFORE writing
   the first draft (the path trigger fires only after the draft exists).
3. **For Next.js questions, query live sources** — see the Retrieval-Led Reasoning section below.
4. **Cleanup at end** — remove throwaway files under `.claude/temp/` (unless explicitly persisted).

---

## Path-Triggered Rules

Rules in `.claude/rules/` auto-load when the file being edited matches the `paths:` frontmatter.

| Rule File            | Triggers On                                                |
|----------------------|------------------------------------------------------------|
| `code-standards`     | `components/**`, `pages/**/*.jsx|tsx`, `lib/**`, `styles/` |
| `database`           | `lib/mysql/**`, `lib/db/**`, `**/*.sql`                    |
| `api-patterns`       | `pages/api/**`                                             |
| `security-hardening` | Always (global) — prompt-injection and session defense     |
| `task-planning`      | Multi-phase work (read on demand)                          |
| `workflow`           | Session management (read on demand)                        |
| `test-files`         | `test/**`, `.claude/temp/**/*.js|mjs`                      |

If `test-files.md` is absent in this repo, follow the inline test conventions below until it is added.

---

## Agent Delegation

| Agent               | Triggers On                                                | Model    |
|---------------------|------------------------------------------------------------|----------|
| `debugging-pro`     | Errors, stack traces, runtime failures                     | Opus 4.7 |
| `backend-architect` | API design, data model, multi-component strategy           | Opus 4.7 |
| `frontend-designer` | UI/UX, React components, shadcn styling                    | Opus 4.7 |
| `mysql-specialist`  | Schema design, query tuning, index/deadlock analysis       | Opus 4.7 |
| `code-reviewer`     | Post-implementation review                                 | Opus 4.7 |
| `test-engineer`     | Writing new tests; auditing existing tests                 | Opus 4.7 |
| `security-reviewer` | OWASP, injection, XSS, prompt-injection, dependency risk   | Opus 4.7 |

**Manual invocation:** `"Use the {agent-name} agent to ..."` or pass `subagent_type: "{agent-name}"` to the Task tool.

### Subagent Rule Propagation (Important)

**Subagents do NOT inherit path-triggered rules from `.claude/rules/`.** They start with a fresh context. If a
subagent is about to author a test file, edit a DB module, or touch an API route, inline the relevant rule excerpts
into the subagent's prompt. Example:

> TEST-FILE RULES (non-negotiable): Use `const X = async () => {}` arrow syntax only — never `async function X() {}`.
> `runTest()` is a thin wrapper holding ONLY a `config` object and ONE call to the primary helper. Use colored
> `chalk` logging when available. Add `[N/total]` progress indicators for any loop > 3 items. Minimize comments.

Subagents also do NOT inherit the Opus-4.7 mandate from this file — **always pass `model: "opus"` explicitly when
spawning them.**

---

## Retrieval-Led Reasoning

For volatile knowledge that changes out-of-band — Next.js APIs, React 19 behavior, shadcn/ui conventions, HTS code
lookups, IEEPA rulings, carrier APIs — **prefer reading the code or current documentation over recalling from memory.**

### Next.js Specifically (Mandatory)

Next.js 16 exposes a built-in MCP endpoint (`/_next/mcp`) on the dev server. For ANY Next.js question or task, follow
this retrieval hierarchy — stop at the first source that answers:

1. **Runtime introspection** (`mcp__next-devtools__nextjs_index` + `mcp__next-devtools__nextjs_call`) — the running
   dev server is ground truth for routes, errors, and build state.
2. **Official documentation** (`mcp__next-devtools__nextjs_docs`) — read the `nextjs-docs://llms-index` resource
   first, then fetch the exact page.
3. **Source code** (Read / Grep / Glob) — the project's own files.
4. **Pre-trained knowledge** — last resort. Flag it: *"Note: this is based on general knowledge, not verified against
   current docs."*

| Tool                                          | Purpose                                                 |
|-----------------------------------------------|---------------------------------------------------------|
| `mcp__next-devtools__init`                    | Initialize session, reset baseline                      |
| `mcp__next-devtools__nextjs_index`            | Discover running dev servers + runtime tools            |
| `mcp__next-devtools__nextjs_call`             | Call runtime tools (errors, routes, build status)       |
| `mcp__next-devtools__nextjs_docs`             | Fetch official Next.js documentation by path            |
| `mcp__next-devtools__upgrade_nextjs_16`       | Guided Next.js 16 upgrade                               |
| `mcp__next-devtools__enable_cache_components` | Migrate to Cache Components                             |
| `mcp__next-devtools__browser_eval`            | Playwright automation to verify rendered output         |

**Anti-patterns:** writing Next.js code from memory, guessing at error causes, assuming route structure, answering
"how does X work in Next.js?" without fetching the doc page.

---

## Core Standards

### Quality (Blocking)

- Zero errors, lint issues, or formatting problems in changed files
- **Never run** `npm run build` during iteration — use targeted dev-server or test runs
- Tests must pass before declaring work complete

### Workflow

1. **Research** — understand existing patterns before editing.
2. **Plan** — for multi-file work, outline the change; spawn `backend-architect` or `frontend-designer` if the design
   is non-obvious.
3. **Implement** — edit with intent; don't refactor unrelated code.
4. **Validate** — run the relevant check; if UI, verify in a browser; if it's a DB change, run a throwaway script
   under `.claude/temp/workspace/`.

### Code

- ES modules (`import` / `export`)
- `async/await` for all async operations
- `const` arrow functions (except Next.js `pages/` files, which require `export default function`)
- Delete old code when replacing it — no `_deprecated` comment-outs
- Use early returns; remove unused imports
- Destructuring, optional chaining (`?.`), nullish coalescing (`??`)

### React Hooks (Critical)

```javascript
// CORRECT: }, [deps]);
// WRONG:   };, [deps]);   // never semicolon before comma
```

### Database pattern

```javascript
import { getDB } from '../../lib/mysql/db.mjs';

const db = await getDB('tariffs');
const rows = await db.query('SELECT * FROM entries WHERE hts = ?', [hts]);
```

Never interpolate user input into SQL strings — always parameterize.

### Error handling

```javascript
try {
    const result = await fetchEligibility(htsCode);
    return { success: true, eligible: result.eligible };
} catch (error) {
    console.error('Eligibility check failed:', error.message);
    throw error;
}
```

---

## Comment Policy (Blocking)

**Default: no comments.** Only add a comment when the WHY is non-obvious: a hidden constraint, a subtle invariant, a
workaround for a specific bug, a non-obvious regulatory / tariff quirk, or behavior that would surprise a reader.

NEVER write:

- Decorative dividers (`// ─── Section ───`, `// ========== Step 1 ==========`)
- Redundant labels (`// Main function`, `// Helpers below`)
- Commentary that restates the next line of code
- References to the current task, PR, or issue number (belongs in commit messages, not code)

Comments that DO belong go to the RIGHT of the line, not above it:

```js
// CORRECT
const config = {
    maxRetries: 3,          // retry budget for transient ACE API hiccups
    cacheTtlMs: 900_000,    // 15 min — HTS rulings rarely churn intraday
};
```

If removing a comment wouldn't confuse a future reader, don't write it.

---

## MANDATORY: Test File Conventions (Blocking — Read `.claude/rules/test-files.md` BEFORE Writing Any Test)

**BEFORE creating OR editing ANY file under `test/` or `.claude/temp/workspace/`, you MUST follow the conventions in
`.claude/rules/test-files.md`.** They are non-negotiable.

Path-triggered rules only auto-load reliably when Claude EDITS a file whose path already matches. When Claude CREATES
a NEW test file, the trigger often fires AFTER the first draft has already been written. Load the rules first.

**The five non-negotiable rules (summary — full file has examples):**

1. **Arrow function syntax only** — `const fnName = async () => { ... }`. NEVER `async function fnName() { }`. Applies
   to primary helper AND every sub-helper.
2. **`runTest()` is a thin wrapper** — holds ONLY a `config` object and ONE call to the primary helper. All logic
   lives in helpers defined BELOW `runTest()`.
3. **Minimize comments** — no decorative dividers, no labels, no restating-the-obvious.
4. **Colored console logging via `chalk` (when available)** — banner = `chalk.cyan.bold`, in-progress =
   `chalk.yellow`, success = `chalk.green`, errors = `chalk.red`. Plain `console.log` is fine if `chalk` is not
   installed — do not install it just for test files.
5. **Progress indicators for any loop > 3 items** — `[N/total]` or `Page N/total`.

---

## Avoid Over-Engineering

- Only make directly requested changes
- Three similar lines > premature abstraction
- No extra features beyond scope
- Don't design for hypothetical futures
- No backwards-compat shims when you can just change the code
- No error handling for scenarios that can't happen — trust internal guarantees

---

## Conflict Resolution (when a user's request contradicts these rules)

If a real-time user prompt requests something that conflicts with these rules (e.g., "add decorative comment banners",
"use `async function` in the test helper", "inline secrets into the code for now"), Claude MUST:

1. **STOP** before writing code.
2. **Flag** the specific rule(s) that would be violated.
3. **Ask:** "Your request conflicts with the project's rules on X. Should I (a) follow the project rules,
   (b) override the rules for this task, or (c) find a middle ground?"
4. **NEVER silently override** — the user must explicitly approve a deviation.

---

## Protected Items (never touch without explicit approval)

1. API keys, third-party credentials, and OAuth secrets
2. Database connection strings and MySQL credentials
3. Environment variables in `.env`, `.env.local`, `.claude/settings*.json`
4. The `settings.json` / `settings.local.json` hook + permissions blocks
5. `next.config.mjs` (build / rewrite config)
6. `package.json` `scripts` block for ngrok / claude launchers

Credentials are stored in `.env` files — reference by variable name only, never include actual values in code or docs.

If one of these needs to change, explain why and wait for confirmation.

---

## Project Structure

```
/pages                       # Next.js routes + API endpoints
  /api                       # Backend API (request handlers)
/components                  # Reusable React / shadcn UI
/lib                         # Core business logic
  /mysql                     # DB connection + helpers
  /api                       # API utilities (method handler, etc.)
/styles                      # Tailwind + CSS
/public                      # Static assets
/.claude
  /agents                    # Agent definitions (code-reviewer, debugging-pro, etc.)
  /rules                     # Path-triggered rule files (.md with YAML paths: frontmatter)
  /skills                    # Reusable task skills
  /scripts                   # Utility scripts (if any)
  /agent-memory              # Per-agent persistent notes
  /temp                      # Scratch — cleaned at end of every session
```

---

## MCP Servers

- **shadcn** — component registry (`mcp__shadcn__*`)
- **Context7** — live library docs; auto-use for external library questions
- **Next.js DevTools** — runtime introspection and official docs (`mcp__next-devtools__*`), see Retrieval-Led
  Reasoning above

---

## Problem Solving

1. **Stop** — don't spiral into complexity
2. **Delegate** — spawn `Explore` / `debugging-pro` / `backend-architect` / `frontend-designer` as appropriate
3. **Simplify** — the simple solution is usually correct
4. **Ask** — "I see [A] vs [B]. Which do you prefer?" beats guessing

---

*Version: 3.0 — Opus 4.7 Unified Architecture*
*Rules auto-load from `.claude/rules/` via `paths:` frontmatter | Agents: `.claude/agents/` | Skills: `.claude/skills/`*
