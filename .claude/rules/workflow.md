# Workflow & Session Management

**Read this file when:** Starting a session, using custom commands, or managing context.

---

## Session Lifecycle

1. **Start** -> `/gh-start` to create a GitHub issue for the task
2. **Work** -> Read relevant rules from CLAUDE.md routing table
3. **End** -> `/gh-done` to close the issue with results + cleanup temp files

---

## When to Create an Issue

**Create for:** Bug fixes, new features, refactoring, multi-step tasks

**Skip for:** Simple questions, reading/exploring code, quick one-liner fixes

---

## End of Task (REQUIRED)

### 1. Close GitHub Issue

Use `/gh-done` skill with a summary of what was done (or why it couldn't be done).

### 2. Temp File Cleanup

Follow root `AGENTS.md` §Temporary work (Codex and Claude Code). Allocate and verify an ignored task directory
before writing scratch, then clean only that recorded directory. Preserve tracked files, retained deliverables,
and other sessions' artifacts; never clear a shared scratch parent.

---

## Validation Checkpoints

**Stop and validate:**

- After implementing a feature
- Before starting major components
- When something feels wrong
- Before declaring "done"

**Recovery Protocol:**

- When interrupted by failure, maintain awareness of original task
- After fixing, continue from where you left off
- Use task list to track both fix and original task
