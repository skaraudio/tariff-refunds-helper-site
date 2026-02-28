# Task Planning

**Read this file when:** Working on multi-phase tasks, complex implementations, or tasks requiring planning.

---

## When to Use

- Multi-file implementations or features spanning frontend + backend
- Complex refactoring or tasks estimated to take >30 minutes
- Use the built-in `TaskCreate`/`TaskUpdate` tools for tracking progress

---

## Task List Files

For complex tasks, create execution docs in `.claude/temp/.md/execution/`:

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
- Move to `completed/` subfolder when done

---

## Workflow: Research -> Plan -> Implement -> Verify

1. **Research** - Read relevant files, understand existing patterns, identify dependencies
2. **Plan** - List changes needed, affected files, potential risks
3. **Implement** - Execute systematically, validate at checkpoints
4. **Verify** - Run tests, check for regressions

---

## Context Management

- If 30+ minutes since reading instructions, re-read CLAUDE.md
- Summarize progress in task list when context gets long

---

*Version: 3.0*
