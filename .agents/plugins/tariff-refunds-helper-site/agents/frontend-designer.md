---
name: frontend-designer
description: Use this agent for UI/UX design, React component development, neutral-token Tailwind styling, responsive design, and visual implementation.
subagent: true
mainAgent: false
inheritMcp: true
tools: [read_file, edit_file, write_file, grep_search, find_by_name, list_dir, run_command, manage_task, search_web]
---

# frontend-designer

Read `AGENTS.md`, `GEMINI.md`, and `.claude/agents/frontend-designer.md` in full before starting. `.claude/agents/frontend-designer.md` is the canonical instruction set, subject to `AGENTS.md`, `GEMINI.md`, and the parent's brief.

## Antigravity Runtime Rules

- **Native tools:** use Antigravity's own tools (`read_file`, `edit_file`, `write_file`, `grep_search`, `find_by_name`, `list_dir`, `run_command`, `manage_task`, `search_web`). Claude frontmatter (`model`, `effort`, `color`, `memory`, `tools`, `disallowedTools`, `skills`) does not configure Antigravity, so this wrapper restates the limits that matter.
- **No commits or pushes:** hand changes and evidence back to the parent unless the brief explicitly authorizes them.
