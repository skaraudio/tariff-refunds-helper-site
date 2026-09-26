# Agent memory (shared, committed)

**Main session only.** Subagents don't commit or push memory, unless their task brief explicitly
assigns them commits. They end their report with a `MEMORY:` line. A subagent that delegates, such as
an orchestrator, relays its children's `MEMORY:` lines and `MEMORY_PROPOSALS` to its own parent
verbatim.

Memory-enabled agents (`memory: project` plus `skills: [agent-memory]` in `.claude/agents/`) keep a
shared store in `.claude/agent-memory/<agent>/`. It is committed to git, so every teammate's agents
on every machine learn from it. The `agent-memory` skill is the protocol. `S` =
`node .claude/scripts/agent-memory.mjs`.

- **Start sessions from the repository root.** From a subdirectory, agents are pointed at a stray
  store. The skill corrects the write path, but the index isn't preloaded.
- **The main session doesn't load agent memory.** Before working in an agent's domain without
  delegating, read `.claude/agent-memory/<agent>/MEMORY.md`.
- **Vet memory changes.** After a memory agent returns, review what changed:
  - uncommitted changes: `git status --porcelain -- '*.claude/agent-memory*'` and `git diff`;
  - committed but not yet pushed, e.g. by an auto-committer: `git log -p @{u}.. -- '*.claude/agent-memory*'`.

  Every change must pass the skill's §3 tests, and `S check <agent>` must report 0 errors for each
  changed agent. For a deleted or renamed note, run the `curation.md` citation grep and fix what it
  finds. Fix forward anything that fails.
- **Apply read-only lanes' `MEMORY_PROPOSALS`** in the same turn they arrive: vet each, write the
  files, and run `S index <agent>`. Writer lanes write their own memory and report a `MEMORY:` line;
  vet those changes the same way. A review-gate record lists `MEMORY_PROPOSALS: applied <n> /
  rejected <n> (<reason>)` and the writer lanes' `MEMORY:` lines.
- **Commit memory changes, unless Kevin said not to commit in this session.** They go in with the
  task's commit, or alone:

  ```
  git add -A -- .claude/agent-memory/<agent>/
  git commit -m "chore(agent-memory): <agent>: <summary>" -- .claude/agent-memory/<agent>/
  ```

  That leaves other staged work out. Kevin gave standing permission for memory-only commits on
  2026-09-26. They are pushed with the branch's next push.
- **Review gates and snapshots ignore `.claude/agent-memory/**`.** A memory change doesn't invalidate
  a reviewed code snapshot. Snapshot with
  `git status --porcelain -- . ':(exclude)*.claude/agent-memory/*'` and
  `git log --oneline -1 -- . ':(exclude)*.claude/agent-memory/*'`.
- **After any pull or merge that touches agent memory,** run `S index`, then `S check`, and vet what
  arrived as above; commit if the index changed. `MEMORY.md` merges with `merge=union`, which can leave
  duplicate lines until regenerated; `index` names any line it drops for a missing topic file, and such
  a line from an old index may be a fact's only copy: restore it as a topic file. On a machine whose clone had ignored legacy notes, they now show
  as untracked: curate them (`/agent-memory curate`) and never commit a note `check` rejects.
- **Route knowledge to the right place.** Personal or machine-specific facts go to your own auto
  memory; must-always rules go to maintained docs.
- **Curate** with `/agent-memory curate` when an agent passes about 60 memories, and at least
  quarterly.
