---
name: agent-memory
description: Protocol for this repository's shared, git-committed subagent memory (`.claude/agent-memory/<agent>/`) — what earns a memory, how to vet and write it so it holds on every machine, and how to use it. Preloaded into every memory-enabled agent. Invoke as `/agent-memory curate [agent]` to curate the stores.
---

# Shared agent memory

Your memory is this repository's shared record of what you learned doing your job here. It is
committed to git and loaded by every teammate's agents on every machine, so each entry must be true
for anyone who clones the repo. Where Claude Code's built-in memory instructions differ from this
protocol, this protocol wins.

## 1. Task first, memory last
Finish the assigned work and your findings before touching memory. Memory never replaces or delays
the task. You don't commit or push memory yourself; the parent vets and commits it. The exception is
a task brief that explicitly assigns you commits.

## 2. Find your real store
Your store is the `.claude/agent-memory/<your-name>/` folder beside the `.claude/agents/` folder that
defines you, normally at the repo root. The memory path you were given is wrong when the session
started in a subdirectory. Check that `<given path>/../../agents/<your-name>.md` exists. If it doesn't,
walk up from the working directory to the first folder containing `.claude/agents/<your-name>.md`. Its
`.claude/agent-memory/<your-name>/` is your store: read its `MEMORY.md` now (it wasn't loaded for you),
and write only there. Run memory commands from the repo root (`cd "$(git rev-parse --show-toplevel)"`).

## 3. What earns a memory (all six must hold)
- **Non-obvious.** A teammate couldn't find it with one or two searches of the code, schema, git log,
  or the maintained docs (CLAUDE.md, AGENTS.md, `.claude/rules/`, `.claude/reference/`, skills).
  - Good: why something is the way it is; a trap and how it fails; a constraint whose reason isn't in
    the code; a finding reviewers keep hitting; where an external system lives.
  - Not memory: structure, file maps, how code works, fix recipes, git history, what a doc already
    says.
- **Consequential.** Forgetting it would likely cause a wrong finding, a bug or wasted work again.
- **Verified.** You confirmed it against current code or data in this run. A hypothesis, suspicion or
  inference is not a memory; it goes in your report.
- **Durable.** Still true after this task. Never ongoing work, owners, deadlines, task state (in
  progress, fixed, pending, next steps), counts or statuses.
- **Environment-neutral.** True on any machine for any teammate. Use repo-relative paths with forward
  slashes. Never write:
  - drive letters, absolute paths, usernames, machine or host names;
  - a dev machine's local ports or LAN addresses;
  - install locations or personal preferences;
  - secrets, tokens, customer data.
- **Not policy.** Memory never grants permission or states a rule every contributor must follow.
  Propose such a rule to the parent for a maintained doc.

## 4. Check what's already there
Read `MEMORY.md` and every topic file that could overlap: grep your store for the key symbol or term.
- If one already covers it, update that file (merge, correct) instead of adding another.
- If one contradicts what you just verified, fix it or delete it.

One fact per file; no duplicates.

## 5. Write it
File name `<type>_<slug>.md`: lowercase, words joined by `-` or `_`, no dots, under about 4 KB.
```
---
name: <short-kebab-case-slug>
description: <one line, at most 90 characters: the fact and when it matters (it is the preloaded index hook)>
metadata:
  type: project | feedback | reference
  verify: <one read-only command, run from the repo root, that proves it still holds>
  verified: YYYY-MM-DD
  source: <commit SHA | GIT#n | PR | who stated or accepted it, YYYY-MM-DD>
  anchors: <optional: repo-relative path#symbol, …>
---
<the fact: 1–5 sentences, present tense>

**Why:** <what goes wrong without it>
**How to apply:** <what to do>
```
- **Types:**
  - `project`: durable facts and decisions about this repo.
  - `feedback`: a lesson about your own work here, with its reason.
  - `reference`: where outside information lives. It needs no `verify`.
  - Never `user`: personal matters belong in a person's own auto memory.
- **`verify`** is one read-only command with repo-root-relative paths and no shell operators
  (`| ; & < > $` or backticks). Use `git grep`, `test -e`, `test -f` or `git ls-files --error-unmatch`,
  because they **exit non-zero when the fact is false**. Bare `git ls-files`, `git log` and `git show`
  always succeed, so use them only to back up `source`.
  - The script splits it into words (quote with `"…"` or `'…'`) and runs it without a shell. It
    accepts only the read-only options in its `GIT_VERIFY` list, spelled in full, including: `git grep`
    `-n -i -l -L -w -F -E -G -P -q -c -I -h -H -v -e` (clusters like `-nF` work) and `--cached
    --untracked`; `git ls-files --error-unmatch`; `git log`/`git show` with `--oneline --stat
    --name-only --format=…` and, for log, `-n`, `-S`, `-G`, `--grep=…`, `--since=…`, `--all`. Options
    that take a value use `=` (`--format=%h`, never `--format %h`). Anything else is rejected
    (`E_VERIFY`).
  - Example: `git grep -n "applyDiscount" -- lib/pricing.mjs`.
  - For alternatives, use `-e a -e b`, not `a|b`.
  - To prove something is absent, use `git grep -L "<pattern>" -- <file>`, which prints the file
    when the pattern isn't in it.
  - For a database fact, write `verify: manual — <the read-only check to do>`. A manual check is a
    read-only query or something to read and reason about; it never asks anyone to run a command that
    starts a program or writes a file.
- **Facts about another repository** that your work here depends on: write them as `project`, with
  `source` naming that repo and commit, and `verify: manual — <check in that repo>`.
- **Anchors:** name symbols, keys or commands, never line numbers.
- **Dates:** absolute only.
- **Accepted risks:** a memory that tells a reviewer not to report something (an accepted risk, a
  known false positive) names in `source` who accepted it and when, e.g. a GIT issue or "Kevin,
  2026-09-26".

## 6. Index
Run `node "$(git rev-parse --show-toplevel)/.claude/scripts/agent-memory.mjs" index <your-name>`; the
index is generated from the files. If you can't run it, add or update one
`- [name](file.md) — description` line under the matching type heading, and the parent regenerates it.

## 7. Using a memory
Before a memory drives a decision or finding, check it with
`node "$(git rev-parse --show-toplevel)/.claude/scripts/agent-memory.mjs" check <your-name> --verify`.
Never paste a `verify` into the shell yourself: the script parses it and runs it without a shell, and
a `verify` it rejects (`E_VERIFY`) is itself a finding to report. If a `verify` fails
(`W_VERIFY_FAIL`), first check the command itself (path, spelling). Fix or delete the entry only when
the fact is false; the code wins. Update `verified` when you re-confirm the fact itself (not merely
that `verify` still finds a symbol) or correct it.

## 8. Read-only lanes
If your tools exclude Write and Edit, don't write memory. End your report with this block (write
`MEMORY_PROPOSALS: none` when you have nothing), followed by the §9 line:
```
MEMORY_PROPOSALS:
- action: add | update <file> | delete <file>
  file: <type>_<slug>.md
  content: |
    <the full file, in the format above>
```
The parent vets each proposal against this protocol and writes it. For a failed `verify` on a false
fact, propose the fix.

## 9. Report
The last line of your report is `MEMORY: added|updated|deleted <files>`, or `MEMORY: none`, so the
parent can review the diff before committing.

Curation (`/agent-memory curate`): follow `curation.md` in this folder.
