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

---

## Problem Solving

1. **Stop** - Don't spiral into complexity
2. **Delegate** - Spawn agents for investigation
3. **Simplify** - Simple solution is usually correct
4. **Ask** - "I see [A] vs [B]. Which do you prefer?"

---

*Version: 1.0 - Tariff Refunds Helper Site*
*Rules: `.claude/rules/` | Agents: `.claude/agents/` | Skills: `.claude/skills/`*
