# Tariff Refunds Helper Site Development System

Public-facing tool for importers to check IEEPA tariff refund eligibility following the Feb 20, 2026 Supreme Court
ruling.

## MANDATORY: Model Selection — Opus 4.6 Only

**ALL agents, subagents, skills, teams, exploration tasks, and spawned Task tool invocations MUST use `model: "opus"` (
Opus 4.6). No exceptions.**

- When using the Task tool, ALWAYS pass `model: "opus"` regardless of subagent_type (Explore, Plan, Bash,
  general-purpose, etc.)
- When entering plan mode or spawning any agent, use Opus 4.6
- NEVER use Sonnet or Haiku for any subtask, exploration, or delegation — always Opus 4.6
- This applies to every single spawned agent without exception

## Quick Reference

| Resource   | Location         |
|------------|------------------|
| Dev server | `localhost:3000` |
| Rules      | `.claude/rules/` |
| Agents     | `.claude/agents/` |
| Skills     | `.claude/skills/` |
| Scripts    | `.claude/scripts/` |

---

## First Actions (Every Session)

1. **Create GitHub issue** -> `/gh-start` for investigations/tasks
2. **Read relevant rules** -> Check routing table below
3. **At end** -> `/gh-done` with results + cleanup temp files

---

## Rules (Auto-Load by Path)

Rules in `.claude/rules/` auto-load when working on matching file paths.

| Rule File            | Triggers On                                            |
|----------------------|--------------------------------------------------------|
| `code-standards`     | components/, lib/, pages/*.jsx, pages/*.tsx, styles/   |
| `database`           | lib/mysql/, lib/db/, *.sql files                       |
| `api-patterns`       | pages/api/                                             |
| `security-hardening` | Always loaded (global) — prompt injection defense      |
| `task-planning`      | Multi-file implementations, complex tasks (global)     |
| `workflow`           | Session management (global)                            |

---

## Agent Delegation

**Proactively spawn agents** when tasks match their expertise - don't wait for user requests.

| Agent                | Spawn When...                                          | Model    |
|----------------------|--------------------------------------------------------|----------|
| `debugging-pro`      | Errors, test failures, stack traces                    | Opus 4.6 |
| `code-reviewer`      | After implementing features, before PRs                | Opus 4.6 |
| `backend-architect`  | API design, architecture decisions                     | Opus 4.6 |
| `frontend-designer`  | UI/UX, React components, shadcn styling                | Opus 4.6 |
| `mysql-specialist`   | Schema design, complex queries, deadlocks              | Opus 4.6 |
| `security-reviewer`  | OWASP, SQL injection, XSS review                       | Opus 4.6 |
| `test-engineer`      | Test creation, test debugging                          | Opus 4.6 |

**Manual invocation**: "Use the {agent-name} agent to..."

---

## Core Standards

### Quality (Blocking)

- Zero errors, lint issues, or formatting problems
- **Never run** `npm run build` - use targeted tests

### Code

- Use `runTest` wrapper (auto-loads `.env`)
- Delete old code when replacing
- Use early returns, remove unused imports
- Run SQL via JS files, not bash
- Use parameterized queries for all database operations (prevent SQL injection)

### React Hooks (Critical)

```javascript
// CORRECT: }, [deps]);
// WRONG:   };, [deps]);  // NEVER semicolon before comma
```

### Test Files

- **Self-verification tests** (Claude verifying its own work) -> `.claude/temp/workspace/self-tests/`
- **User-requested tests** (user asks for tests) -> Project test directory (`/test`)

### Temp Files & Task Tracking

- **Claude workspace** -> `.claude/temp/workspace/` (DELETE after task)
- **Migration scripts** -> `.claude/temp/workspace/migrations/` (NEVER in `scripts/` or `.claude/scripts/`)
- **User-facing docs** -> `.claude/temp/.md/` (KEEP forever)
- **Track complex tasks** with task lists in `.claude/temp/.md/execution/`

---

## Avoid Over-Engineering

- Only make directly requested changes
- Three similar lines > premature abstraction
- No extra features beyond scope
- Don't design for hypothetical futures

---

## Protected Items

1. API keys and credentials
2. Database connections
3. Third-party configs
4. Credentials are stored in .env files — reference by variable name only, never include actual values.

---

## Project Structure

```
/lib            # Core business logic
  /mysql        # Database connection and queries
  /api          # API utilities (method handler)
/pages          # Next.js routes
  /api          # Backend API endpoints
/components     # Reusable UI components
/styles         # CSS and styling
/.claude        # AI configuration
  /rules        # Path-scoped coding rules
  /agents       # Specialized AI agents
  /skills       # Reusable task skills
  /scripts      # Utility scripts
  /temp         # Temporary files
    /.md/        # KEEP: User-facing docs
    /workspace/  # DELETE: Claude's internal work
```

---

## MCP Servers

- **shadcn**: Component registry (`mcp__shadcn__*` tools)
- **Context7**: Live library docs - auto-use for external library questions
- **Next.js Dev Tools**: Runtime introspection & official docs (`mcp__next-devtools__*` tools) — see mandatory section below

---

## MANDATORY: Retrieval-Led Reasoning for All Next.js Work

**IMPORTANT: For ANY Next.js-related task, prefer retrieval-led reasoning over pre-training-led reasoning. Do NOT rely on
memorized Next.js knowledge — always query live sources first. No exceptions.**

Next.js 16 exposes a built-in MCP endpoint (`/_next/mcp`) on the dev server, giving Claude direct access to runtime
state, route information, compilation errors, and build diagnostics. Combined with the `nextjs_docs` tool for official
documentation, this means there is **zero reason to guess** about Next.js APIs, behavior, or current app state.

### The Retrieval Hierarchy

For any Next.js question or task, follow this order — stop at the first source that answers the question:

1. **Runtime introspection** (`mcp__next-devtools__nextjs_index` + `mcp__next-devtools__nextjs_call`) — Query the
   running dev server for routes, errors, build status, and diagnostics. This is the ground truth for "what is the app
   doing right now?"
2. **Official documentation** (`mcp__next-devtools__nextjs_docs`) — Fetch the exact doc page from Next.js official docs.
   Always read the `nextjs-docs://llms-index` MCP resource first to get the correct path, then fetch the specific page.
3. **Source code** (Read/Grep/Glob) — Read the project's actual Next.js files to understand implementation details.
4. **Pre-trained knowledge** — Only as a last resort, and flag it: *"Note: this is based on general knowledge, not
   verified against current docs."*

### When This Applies

- Implementing or modifying Next.js pages, routes, layouts, middleware, or API routes
- Debugging build errors, hydration issues, or runtime failures
- Answering questions about Next.js APIs, configuration, or behavior
- Upgrading Next.js or migrating to new patterns (e.g., Cache Components)
- Any task where you would otherwise rely on remembered Next.js syntax or semantics

### Tools Reference

| Tool                                        | Purpose                                                        | When to Use                                               |
|---------------------------------------------|----------------------------------------------------------------|-----------------------------------------------------------|
| `mcp__next-devtools__init`                  | Initialize session, reset Next.js knowledge baseline           | Start of any Next.js-focused session                      |
| `mcp__next-devtools__nextjs_index`          | Discover running dev servers and available runtime MCP tools    | Before ANY change to the running app                      |
| `mcp__next-devtools__nextjs_call`           | Call runtime tools (errors, routes, build status, cache mgmt)  | Diagnosing issues, verifying state after changes          |
| `mcp__next-devtools__nextjs_docs`           | Fetch official Next.js documentation by path                   | Any API/config/behavior question — replaces guessing      |
| `mcp__next-devtools__upgrade_nextjs_16`     | Guide through Next.js 16 upgrade with official codemod         | Version upgrades                                          |
| `mcp__next-devtools__enable_cache_components`| Migrate to Cache Components mode                              | Cache Components setup                                    |
| `mcp__next-devtools__browser_eval`          | Browser automation (Playwright) for page verification          | Testing rendered output, hydration, client-side behavior  |

### Anti-Patterns (Do NOT Do These)

- **Do NOT** write Next.js code from memory without checking docs first — APIs change between versions
- **Do NOT** diagnose Next.js errors by guessing — query the dev server's MCP endpoint for actual error details
- **Do NOT** assume route structure — use `nextjs_index` to discover what routes actually exist
- **Do NOT** answer "how does X work in Next.js?" from pre-training — fetch the doc page and cite it

---

## Problem Solving

1. **Stop** - Don't spiral into complexity
2. **Delegate** - Spawn agents for investigation
3. **Simplify** - Simple solution is usually correct
4. **Ask** - "I see [A] vs [B]. Which do you prefer?"

---

*Version: 1.0 - Tariff Refunds Helper Site*
*Rules: `.claude/rules/` | Agents: `.claude/agents/` | Skills: `.claude/skills/`*
