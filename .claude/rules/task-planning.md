# Task Planning

**Read this file when:** Working on multi-phase tasks, complex implementations, or tasks requiring planning.

---

## When to Use

- Multi-file implementations or features spanning frontend + backend
- Complex refactoring or tasks estimated to take >30 minutes
- Use the built-in `TaskCreate`/`TaskUpdate` tools for tracking progress

---

## Task List Files

For complex tasks, create the execution doc in the task directory's `notes/` child, following root
`AGENTS.md` §Temporary work (Codex and Claude Code):

```markdown
# {Task Name}
**Created:** YYYY-MM-DD | **Status:** In Progress

### Phase 1: {Phase Name}
- [x] Completed task
- [ ] Pending task

### Phase 2: {Phase Name}
- [ ] Future task

## Notes
{Blockers, decisions, changes}
```

- Create BEFORE starting complex work
- Update `[ ]` -> `[x]` as tasks complete
- Mark the doc complete; retention and task-owned cleanup follow root `AGENTS.md` §Temporary work.

---

## Workflow: Research -> Plan -> Implement -> Verify

1. **Research** - Read relevant files, understand existing patterns, identify dependencies
2. **Plan** - List changes needed, affected files, potential risks
3. **Implement** - Execute systematically, validate at checkpoints
4. **Verify** - Run tests, check for regressions

---

## Context Management

- After a context compaction, re-read the task doc and the original request before continuing; Claude Code
  re-injects `AGENTS.md` (through `CLAUDE.md`) on its own, so re-reading it on a timer adds nothing
- Summarize progress in task list when context gets long
