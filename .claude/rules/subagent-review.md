# Subagent Review Policy

**Read this file when:** Always (global rule). Governs the mandatory post-implementation review gate before
any commit.

**Owns:** the gate — its sequencing, the four lanes and their mandates, the evidence a finding must carry,
severity, and the pass/fail bar. **Does not own:** the standing subagent-delegation request, the fresh-context
rule-propagation requirement, or the `model: opus` default (`AGENTS.md` → *Agent Delegation*); the UX rubric,
score bar, and write-safety boundary (`.claude/skills/ux-score-gate/SKILL.md`); the path-triggered rule content
each lane must inline (`.claude/rules/api-patterns.md`, `database.md`, `code-standards.md`).

---

## Scope — When This Policy Applies (BLOCKING)

Triggered automatically when implementation work touches ANY of:

- 2+ files, OR
- any route under `pages/api/**`, OR
- `lib/mysql/**`, any `.sql`, or a migration under `.claude/temp/workspace/migrations/`, OR
- `lib/pdf/parse-entry-summary.mjs` — the single source of truth for IEEPA eligibility, OR
- any form-facing or user-data-rendering component in `components/**`, OR
- server-side input validation on `pages/api/upload.js` (mimetype/size/PDF-only guards).

**Exempt** (single-agent work is fine): doc-only edits and comment changes; formatting/lint-only diffs; a
single-file UI tweak with no logic change and no new interaction; config or dependency version bumps with no
code change. An exempt UI tweak is exempt from the gate, not from checking the responsive classes it touches
still hold at narrow widths — there is no browser tool here to screenshot it (see UX lane, below).

---

## Sequencing (BLOCKING — the order is load-bearing)

The UX lane **writes** code; the other three **read** it. Running them together makes the read lanes audit a
moving target.

1. **Converge the UX lane first**, when it triggers (`.claude/skills/ux-score-gate/SKILL.md`).
2. **Freeze the tree.** Stop editing. Record `git status --porcelain` + `git log --oneline -1`.
3. **Run Security, Efficacy and Completeness in parallel** against that frozen tree.
4. Any fix un-freezes it → re-snapshot and re-review.

---

## The Lanes (BLOCKING)

**Every spawn prompt carries:** the changed-file list, the original request or issue verbatim, and any
path-triggered rule the subagent will not inherit — subagents start fresh and do not inherit path-triggered
rules (`AGENTS.md` → *Agent Delegation*). **Do NOT include your own account of what you built or why it is
correct** — that anchors the reviewer to your model of the code instead of the code.

### Security · `security-reviewer`

Runs on **every** in-scope diff, not only the obviously sensitive ones. This is a public, anonymous, unauthenticated
tool whose only write path ingests an untrusted PDF — an exposure usually arrives inside a change nobody classified
as security work.

- **Opening move:** name the three most likely ways *this specific diff* creates an exposure, then hunt each, and
  report all three with their outcomes in `AREAS REVIEWED`.
- **Scale, don't skip.** With no untrusted input, no SQL, and no new response path in the diff, the pass is a short
  explicit confirmation of exactly that, naming what established it.

### Efficacy · `code-reviewer`

Does it work, and does it do **nothing else**. Three parts, all required.

- **Correct.** Walk each changed function with concrete values — empty upload, non-PDF, zero-byte, a PDF over 10 MB,
  a duplicate `upload_hash`, malformed HTS text, a duty amount of `0` or negative, concurrent uploads of the same
  file. Read the error branches. Confirm every response shape against what `RefundResults.jsx` / the caller
  destructures.
- **What the diff REMOVED.** Read the deletion hunks on their own — a dropped `await`, a deleted mimetype/size guard,
  a collapsed error branch, a removed parameterization.
- **Blast radius.** Grep every caller of every changed export/route/table helper and read each one. Then, for every
  write: is the `entry_summaries` + `tariff_line_items` insert atomic (`getDB().transaction(cb)`, or a partial
  commit on a mid-loop failure)? Is the `site_stats` counter bump idempotent on retry? Double-counted on a
  client-side double-submit? Anything reaching the shared `tariff_refund_helper_site` database on Skar Server One.

### Completeness & Soundness · `backend-architect` (routes & parsing logic) · `mysql-specialist` (schema/SQL) · `frontend-designer` (UI)

The other lanes audit what *is* there. This one audits what **is not** — and what is there nobody asked for.

- **Requirement → code.** Write the acceptance criteria as a numbered list from the request, before opening the
  diff. Point each at the `file:line` satisfying it. No line is a gap; "partially" is a gap.
- **Code → requirement.** Every hunk no criterion asked for — unrequested features, speculative abstractions,
  back-compat shims, dead code, a helper generalized for one caller.
- **Targeted.** The right layer, and the smallest change that works. A UI patch over a parser bug is unsound even
  when it looks correct.
- **Dynamic, not baked.** Copy and thresholds come from `styles/globals.css` `@theme` tokens or one constant, never
  repeated per call site; the IEEPA HTS pattern and the 10 MB cap have exactly one definition each.
- **Sound.** Uses the existing primitive — the table helpers in `lib/mysql/db.mjs`, `lib/common/formatters.mjs`,
  `lib/common/error.mjs` — instead of a parallel one. A second way to do something the repo already does is a
  finding.

### UX/UI Score Loop · `frontend-designer`

**Triggers mechanically** — the diff touches any `components/**/*.jsx`, `pages/**/*.jsx` (excluding
`pages/api/**`), or `styles/**/*.css`. **Record the decision either way** in the gate report ("UX lane: triggered"
/ "not triggered — no rendered-surface file in the diff"); an unrecorded decision is itself a blocker.

The rubric, the score bar, the write-safety boundary against the shared production DB, the anti-gaming rules, the
round cap, and the evidence cap — code-only checks remain capped; observed checks depend on the active client's
authorized browser capability — are all owned by **`.claude/skills/ux-score-gate/SKILL.md`**.
Load it when this lane triggers. A miss after its cap is a **blocker**, reported with the scorecard and the §0
escalation, never rounded up.

---

## Evidence Standard (BLOCKING)

- **A blocker** carries a failure trace: concrete input or state → the `file:line` mishandling it → the wrong
  observable result. *"Could break"* is not a blocker.
- **A non-blocker** carries `file:line` plus the concrete cost of leaving it.
- **A "clean"** on a high-risk category carries the act that established it — the path traced, the grep run, the
  query read, the state exercised. *"No issues found"* with nothing behind it reads as **not reviewed**.

Tag every finding **CONFIRMED** or **PLAUSIBLE**. A PLAUSIBLE blocker is confirmed or **falsified** — naming the
check that shows it cannot happen — before it gates a commit. *"Could not confirm"* stays a blocker.

**Read every changed file in full before judging it.** Never flag or clear code you have not opened.
**Re-verify immediately before reporting:** re-grep each finding's anchor text and re-snapshot `git status` /
`git log` at the end of the pass.

---

## Severity, Convergence, and the Commit Gate (BLOCKING)

- **Blocker** — wrong behavior, regression, security exposure, broken contract, an unmet requirement, an
  unrequested change, missing error handling that matters, or a UX score under the bar.
- **Non-blocker** — style, naming, an optional refactor. Fixed inline or left as a `TODO`; backlog-worthy ones get
  filed via `/gh-start` (`.claude/rules/workflow.md`).

**Commit only after a CLEAN ROUND:** one round in which every lane reports zero blockers **and every lane's
`SNAPSHOT` names the same tree state as the one about to be committed.** A PASS citing an older snapshot is
stale — re-run that lane.

**On a blocker:** fix it, re-snapshot, re-spawn the lane that found it scoped to the fix and its blast radius. If
the fix touched a file another lane cleared, that lane runs again too.

**Three gate rounds is the cap** (the UX lane's own grade→fix rounds are the skill's own and do not count). Not
converged after three → stop and hand the standing blockers to Kevin. **Low confidence on any lane counts as a
blocker.**

---

## Reviewer Output Format

```
LANE:           [Security | Efficacy | Completeness | UX]
VERDICT:        [PASS | BLOCKED]
BLOCKERS:       [each: file:line · failure trace · CONFIRMED|PLAUSIBLE]   — or "none"
NON-BLOCKERS:   [each: file:line · concrete cost]                        — or "none"
AREAS REVIEWED: [each file + the act performed on it]                    — UX lane returns its scorecard instead
NOT REVIEWED:   [anything in scope you could not reach, and why]         — or "none"
SNAPSHOT:       [git sha at END of pass; anything still dirty]
CONFIDENCE:     [high | medium | low + one-line reason if not high]
```

`NOT REVIEWED` is mandatory — an unstated coverage gap is how a clean verdict ships a bug.

---
*Version: 1.0 (2026-08-20) — New rule: a four-lane commit gate (Security · Efficacy · Completeness & Soundness ·
conditional UX) replacing no prior review gate, with the evidence standard and snapshot-matched clean round.
History: `git log -- .claude/rules/subagent-review.md`.*
