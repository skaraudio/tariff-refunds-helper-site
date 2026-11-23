# Antigravity (`agy`) Adapter — tariff-refunds-helper-site

Antigravity auto-loads `AGENTS.md` and this file together (each must stay under the 24,000 B CRLF cap). **Never** add Claude at-sign imports or Markdown at-link includes here: Antigravity expands them before the cap check and loads the target twice. `AGENTS.md` is the shared policy; this file holds Antigravity-only deltas. Launch with `npm run agy1` / `agy2` / `agy3`.

> **Discovery layout:** `.gemini/config.json` (`personal_customization_dir: ".claude"`) routes Antigravity to `.claude/.agents/` (`skills.json` + `plugins.json`) with all Antigravity files consolidated inside `.claude/` (zero root `.agents/`).

## 1. What loads and what does not

- **Auto-loaded:** `AGENTS.md`, this file, the machine-local rules in `~/.gemini/config/rules/` (`kevin-global.md`, `repo-local-plans.md`). `CLAUDE.md` is a Claude-only shim that imports `AGENTS.md` and is skipped.
- **Skills:** the tracked `.claude/.agents/skills.json` maps `.claude/skills/` (no per-PC setup). Open a skill with `read_file` on `.claude/skills/<name>/SKILL.md`. Skills (8): `agent-memory`, `browser-workflow-audit`, `chrome-devtools`, `entry-summary-parser`, `gh-done`, `gh-start`, `next-partial-prefetching-optimizer`, `ux-score-gate`. User-invoked only (`disable-model-invocation`): `claude-config-audit`, `clear-screenshots`, `clear-vr`, `optimize`, `security-audit`, `sr`, `srm`, `vr`. The `agent-memory` skill is a Claude write protocol: under Antigravity treat `.claude/agent-memory/` as read-only.
- **Rules, not auto-loaded (`.claude/rules/`):** always-apply rules, `read_file` them in parallel at session start: `agent-memory.md`, `security-hardening.md`, `subagent-review.md`, `task-planning.md`, `workflow.md`, `writing-style.md`. Path-scoped rules load in Claude only on a matching file, so before reading or editing a matching file, `read_file` the rule yourself:

  | Rule | Applies to |
  | --- | --- |
  | `api-patterns.md` | `pages/api/**/*.js`, `pages/api/**/*.mjs`, `pages/api/**/*.ts` |
  | `code-standards.md` | `components/**/*.jsx`, `components/**/*.tsx`, `pages/**/*.jsx`, `pages/**/*.tsx`, `lib/**/*.js`, `lib/**/*.mjs`, `lib/**/*.ts`, `styles/**/*.css` |
  | `database.md` | `lib/mysql/**/*.mjs`, `lib/mysql/**/*.js`, `**/*.sql` |
  | `test-files.md` | `test/**/*.js`, `test/**/*.mjs`, `tests/**/*.js`, `tests/**/*.mjs`, `.claude/**/*.js`, `.claude/**/*.mjs` |

  Never mirror `.claude/rules/` into `.agents/rules/`.
- **After `/compact`:** rules, hubs and `SKILL.md` files do not reload; re-read the active ones.

## 2. Agents (`.claude/agents/`)

`.claude/agy/tariff-refunds-helper-site/agents/*.md` wraps 6 Claude agents as `invoke_subagent` specialists: `backend-architect`, `code-reviewer` (read-only), `debugging-pro`, `frontend-designer`, `mysql-specialist`, `test-engineer`. Each wrapper points at `.claude/agents/<name>.md` as canonical. Antigravity ignores Claude agent frontmatter (`model`, `effort`, `tools`, `disallowedTools`, `skills`, `memory`), so the wrappers restate the limits. `security-reviewer` is not wrapped: security reviews run only when Kevin asks in the current prompt. `invoke_subagent` `Model` accepts only `inherit`, `flash_lite`, `flash`, `pro`. After any subagent returns, run `git status --porcelain` and `git diff` over the whole tree before trusting its report.

## 3. Tool mapping

| Shared docs | Antigravity |
| --- | --- |
| `Read` | `read_file` |
| `Edit` / `MultiEdit` | `edit_file` (read the file immediately before; it replaces every occurrence of `Target` unless `AllowMultiple` is false) |
| `Write` | `write_file` |
| `Glob` / `Grep` | `grep_search` / `find_by_name`, or `run_command` with `rg --files` / `rg` |
| `Bash` / `PowerShell` | `run_command` (Windows PowerShell 5.1: no `&&`, `||`, `2>/dev/null` or heredocs; use `;`, `if ($?) { ... }`, `2>$null`; call `npm.cmd` / `npx.cmd`) |
| `WebSearch` / `WebFetch` | `search_web` |
| `Agent` / `Explore` | `invoke_subagent`, `run_workflow`, `swarm`; continue a subagent with `send_message` |

## 4. Hooks, policy and MCP

- **Hooks:** `.claude/settings.json` defines no Claude hooks, so there is no `.claude/agy/` `hooks.json`.
- **Policy, not enforced by Antigravity (`permissions.deny`):** `Bash(rm .env*)`, `Bash(rm -rf)`, `Bash(rm --force)`. Treat each as banned.
- **MCP:** `.claude/agy/tariff-refunds-helper-site/mcp_config.json` mirrors the committed `.mcp.json`; Antigravity names the servers `tariff-refunds-helper-site_next-devtools`.
- **Git and deploys:** work on the current branch and never create a branch. Commit and push as the repo instructions and Kevin's standing instructions say. Deploy commands (`clasp deploy`, `serverless deploy`, `eas build`, `vercel deploy`) wait for Kevin's explicit word.

## 5. Scratch and plans

- **Repo scratch:** follow the scratch rules in `AGENTS.md`; otherwise use `.claude/temp/`, which is git-ignored. Never leave scratch in the repo root.
- **Plans for Kevin's approval:** allocate the path with `node C:/Users/Admin/.gemini/config/scripts/agy-plan-path.mjs new <topic-slug>` and follow `~/.gemini/config/rules/repo-local-plans.md`. Reserve `~/.gemini/antigravity-cli/brain/` for user-facing Antigravity artifacts.

_Version: 1.0 (2026-11-22) — Antigravity adapter built from this repo's `.claude/` inventory (Skar-Audio/GlobalIssueTracking#6901)._