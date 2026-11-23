---
name: test-engineer
description: Use this agent for test creation, test debugging, test strategy planning, and ensuring adequate test coverage for features. The app has no test suite, so here that means throwaway verification scripts — parser checks against sample PDFs, upload round-trips, DB checks.
subagent: true
mainAgent: false
tools: [read_file, edit_file, write_file, grep_search, find_by_name, list_dir, run_command, manage_task, search_web]
---

# test-engineer

Read `AGENTS.md`, `GEMINI.md`, and `.claude/agents/test-engineer.md` in full before starting. `.claude/agents/test-engineer.md` is the canonical instruction set, subject to `AGENTS.md`, `GEMINI.md`, and the parent's brief.

## Antigravity Runtime Rules

- **Native tools:** use Antigravity's own tools (`read_file`, `edit_file`, `write_file`, `grep_search`, `find_by_name`, `list_dir`, `run_command`, `manage_task`, `search_web`). Claude frontmatter (`model`, `effort`, `color`, `memory`, `tools`, `disallowedTools`, `skills`) does not configure Antigravity, so this wrapper restates the limits that matter.
- **No commits or pushes:** hand changes and evidence back to the parent unless the brief explicitly authorizes them.
