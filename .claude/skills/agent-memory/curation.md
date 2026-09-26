# Curating agent memory

Run from the repository root, for one agent (`/agent-memory curate <agent>`) or all of them.
`S` = `node .claude/scripts/agent-memory.mjs`.

The stores are shared and committed, so be conservative with notes other people's agents wrote. A
stale note costs little; deleting a load-bearing one costs a lot. When unsure, keep it and leave its
`verified` date alone.

1. **Baseline.** Run `S check <agent> --verify` and save the output to your task workspace, never
   inside a store. `W_VERIFY_FAIL` lines are where to look first.
2. **Classify every topic file,** one row per file in a decisions table in your task workspace:
   `file`, `action`, `evidence`, `renamed_to`. Facts that live only in `MEMORY.md` get rows too
   (step 3).
   - **KEEP:** meets the SKILL.md §3 tests. Set `verified` to today's date only if you re-checked the
     fact itself, not merely that `verify` still finds a symbol.
   - **FIX:**
     - neutralise environment details (absolute paths become repo-relative; machine-only facts are
       removed);
     - fill a missing `verify` or `source`;
     - swap line numbers for symbols and make dates absolute;
     - split a file into one fact per file;
     - trim task-status sentences;
     - move protocol fields under `metadata:`.

     A FIX that didn't re-check the fact keeps the old date. A legacy note without one gets the date
     the fact was first recorded: the observation date in its body, else the commit that added the
     file (`git log --diff-filter=A --format=%cs -- <file> | tail -1`). Never use a later
     edit/redaction commit or today's date. A merged note keeps the oldest date among its sources.
   - **DROP,** only with evidence:
     - the fact is false (`verify` fails and the command itself is right);
     - it is derivable (cite where it can be read);
     - it duplicates another memory (merge into the survivor, cite it);
     - its core only holds on one machine;
     - it is pure task state;
     - it contains a secret. First salvage its non-secret facts into clean notes. Then remove it, and
       report the file name (never the value) for rotation. The secret may also sit in the store's
       git history.
   - **PROMOTE:** a rule every contributor must follow, or a fact every agent needs. Propose the text
     and the target maintained doc. Keep the memory until the doc has it.
   - **Citations:** before a DROP or rename, run `git grep -n "<file name>" -- . ':(exclude)*.claude/agent-memory/*'`.
     Update each live citation in the same commit (docs; comment-only edits in code) or keep the note.
     Dated records (audits, inventories, archives, applied migrations) stay as they are.
3. **Legacy notes and strays.**
   - **A `MEMORY.md` with hand-written lines** (`E_LEGACY_INDEX`: a legacy index, or facts written
     inline) is a legacy note. Give every fact in it a decisions row, including facts carried only in
     an index line's hook text, and convert each one or DROP it with evidence. Then delete that
     `MEMORY.md`; step 4 regenerates it. `S index` refuses to overwrite it before then.
   - **Conversion:** convert each fact that passes §3 into a `<type>_<slug>.md` file. Keep the old
     name when it already fits `<type>_<slug>`. Record every rename, so citations can be updated.
   - **Stray stores** (`E_STRAY`): move each note into the real store beside `.claude/agents/`. Re-root
     its paths: notes from `site/.claude/agent-memory/` were written relative to `site/`, so `lib/x`
     becomes `site/lib/x`. Delete only the stray folders you migrated.
4. **Index and check.** Run `S index <agent>`, then `S check <agent>`. It must report 0 errors. Review
   each warning: fix it or note why it stays. Keep each agent under 60 memories.
5. **Commit** (main session only; a subagent curating a shard skips this and reports), per
   `.claude/rules/agent-memory.md`. Subject: `chore(agent-memory): curate <agent|all>`. The body gives
   counts per action, renames, PROMOTE proposals and secret file names.
