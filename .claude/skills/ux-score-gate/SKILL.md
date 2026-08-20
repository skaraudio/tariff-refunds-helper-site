---
name: ux-score-gate
description: >
   The scored UX/UI iteration loop that the commit gate's UX lane runs on this site's single page — grade a UI
   change across Functionality, Usability, Ease and Workflow, fix the weakest dimension, re-grade with a fresh
   grader, and repeat until every dimension scores 90+. No browser-automation MCP is wired into this repo, so
   every check is scored from the code path and the running dev server's API responses, capped at partial
   credit; that cap is the point of this skill. Load whenever a diff changes something a person sees or
   operates (a component, `pages/index.jsx`, `styles/globals.css`), or on "grade this UI", "iterate on the
   upload flow until it's good".
---

# UX Score Gate — Grade, Fix, Re-grade Until It Clears

**Owns:** the rubric, the score bar, the scoring mechanics, the write-safety boundary, the iteration loop, and
the anti-gaming rules. **Does not own:** when the lane triggers or what a miss means for the commit
(`.claude/rules/subagent-review.md`); the design-token rules being checked against
(`.claude/rules/code-standards.md`).

> **THE BAR: every dimension scores ≥ 90.** Four dimensions, unweighted and independently gated —
> **Functionality · Usability · Ease · Workflow.** There is no total to hide behind: one weak dimension blocks
> the lane.

---

## 0. Before the first round — read this, it changes what "evidence" means here

**No browser-automation MCP is registered in this repo.** `.mcp.json` configures only `next-devtools` (Next.js
build/runtime diagnostics — not interactive page control). `.claude/skills/chrome-devtools/SKILL.md` describes
a Chrome DevTools MCP workflow, but no such server is connected (`claude mcp list` shows no `chrome-devtools`
entry, project or global). **`claude-in-chrome` is connected, at the account level** rather than in this repo's
`.mcp.json` — but every action it takes requires `AskUserQuestion` first, and a spawned subagent does not have
that tool. So the autonomous grader genuinely cannot click, screenshot, or measure a rendered page; a
human-attended round, with `claude-in-chrome` already connected, can.

**Consequence (BLOCKING):** per §1, a check scored from the code path alone caps at **0.5**. Every check below
is, at best, code-path evidence — so no check in this repo can currently score a genuine 1, and a dimension
built entirely from 0.5s tops out at 50. **State this in the scorecard rather than rounding up:** report the
real fractional score, mark every check `NOT EXERCISED`, and let the lane report `BLOCKED — code-path ceiling
(§0); escalate: ask the human to run an attended round with the connected Chrome browser` if that is the honest
verdict. Do not award pass credit for a plausible read.

**Verification route actually available here:**

1. Start the dev server if it isn't running: `npm run run2` → `http://localhost:3014`.
2. Read the full source of the changed surface — the component(s) in `components/`, `pages/index.jsx`,
   `styles/globals.css` — end to end, not just the diff hunk.
3. For the two **read-only** routes (`GET /api/stats`, `GET /api/results/[id]`), hit the running dev server
   freely with `curl` or a throwaway Node script — these are safe to call as many times as needed.
4. For the **one write route** (`POST /api/upload`), follow the write-safety boundary below.
5. `mcp__next-devtools__nextjs_index` / `nextjs_call` for build or hydration errors if something looks broken.

**Name the task, from the request.** One sentence describing the operator's complete job on this surface — e.g.
"drop a 7501 PDF and learn the refund verdict." Take it from the original request or issue; only when neither
states one, derive it from the page's primary write path. **State it in the scorecard.**

### Write-safety boundary (BLOCKING)

`POST /api/upload` writes real rows into the shared `tariff_refund_helper_site` database on Skar Server One
and bumps the shared `site_stats` counters — not a sandbox. **Never** fire it speculatively "to see what
happens."

In order of preference:

1. Read `pages/api/upload.js` and `lib/pdf/parse-entry-summary.mjs` and score the check from the code path —
   capped at 0.5. This is the default for every interaction check below; there is no browser here to stub
   `fetch` via an initScript, so that first-choice option from a browser-driven gate is not available.
2. Only if a live round-trip is genuinely necessary to resolve a specific doubt: drive it from a throwaway
   script under `.claude/temp/workspace/` (`.claude/rules/test-files.md` conventions) using one sample PDF from
   `.claude/temp/example-entry-summaries/`, then **delete the row(s) it created** (`entry_summaries` by the
   returned id — `tariff_line_items` cascades) and note in the scorecard exactly what was created and cleaned
   up. The `site_stats` bump this causes is not reversible; account for it, do not hide it.
3. Never fabricate a mocked "success" payload and present it as observed behavior — this repo has no
   frontend-mocking vehicle for it, and an invented result is worse than an honest `NOT EXERCISED`.

---

## 1. The rubric

Score each check **pass (1) · partial (0.5) · fail (0)**. Dimension score = `sum ÷ scored-checks × 100`.

- **A check scored from the code path alone caps at 0.5.** Reading the handler is evidence it should work,
  never evidence that it does. List it under `NOT EXERCISED` with the reason (per §0, that is currently every
  interaction check in this repo).
- **A check marked N/A leaves the denominator**, but needs a structural reason ("no destructive action exists
  on this surface") stated in the scorecard; the scorecard reports `scored X of N`.
- **A gating check scored below 1 blocks the lane outright**, whatever the averages say. Gating checks are
  marked **[G]**.
- There is only one viewport lane here (no browser to emulate a second), so unlike a browser-driven gate,
  scores are **not** the lower-of-two-viewports — they are single-source code-path scores, which is a weaker
  standard, not a stronger one. Say so plainly in the scorecard.

### Functionality

1. **[G]** Every control the diff added or changed performs its stated action — traced against the API route
   it calls and what that route actually returns.
2. **[G]** Every server-side throw in a changed route is caught by its `try/catch` and returns a JSON error, not
   an unhandled 500 with a stack trace.
3. Loading, empty, and error states each have a distinct render branch (e.g. `FileUpload.jsx` in-flight state,
   `RefundResults.jsx` not-eligible vs. eligible vs. error) — trace the conditional, don't assume it exists.
4. Validation (non-PDF, >10 MB) fires server-side and the message the component renders matches what the route
   actually sends — trace `pages/api/upload.js` error branches against what the component destructures.
5. Interactive elements are real `<button>`/`<input>` (not a `<div onClick>`) with a visible focus style class.
6. The shown result clears or updates correctly when a second file is chosen without a page refresh.

### Usability

1. The upload control is visually dominant on the page; nothing competes with it for the primary action.
2. Labels are plain language, never a raw `status` enum value (`not_eligible`, `error`) surfaced verbatim.
3. The upload button/spinner shows feedback while `POST /api/upload` is in flight (trace the loading-state
   wiring in `FileUpload.jsx`).
4. N/A — no destructive or irreversible action exists on this surface (uploads are additive, deduped by
   `upload_hash`). Leave scored, mark N/A with this reason.
5. Every error path renders a plain-language message, never a raw `{error}` object or stack text.
6. No dead end — a not-eligible or error result still offers a way to try another file.
7. **[G]** Design tokens honored — `.claude/rules/code-standards.md` (neutral `@theme` tokens only, no
   hardcoded palette classes, `font-semibold` not `font-bold`, `tabular-nums` on displayed numbers). Grep the
   changed files for violations; this check is a static source read, not code-path-capped.
8. Eligible vs. not-eligible is distinguished by text/icon, not color alone.

### Ease

1. Count the interactions the task from §0 actually takes (drop file → see verdict) against the fewest the
   flow allows. Report both numbers.
2. Nothing the system already knows (e.g. a value already in the parsed PDF) is re-asked of the user.
3. **[G]** No fixed-width element in the changed files would force horizontal scroll at a 390px viewport —
   trace the Tailwind classes; capped at 0.5 without an actual narrow-viewport render.
4. The drop zone and buttons meet a 44px minimum tap target — trace the Tailwind sizing classes.
5. No fixed-`px` truncation hides a full value (entry number, HTS code) with no way to read it in full.
6. The refund-eligibility verdict is high in `RefundResults.jsx`'s render tree, not below the fold.

### Workflow

1. The task from §0 completes entirely on `pages/index.jsx` with no navigation away and back.
2. After upload, the UI advances to a result, not merely an "uploaded" acknowledgement.
3. Uploading a second file works without a manual page refresh.
4. N/A — no multi-step form exists to lose on an accidental refresh (upload is single-shot). Mark N/A with
   this reason.
5. The flow is reachable directly from `/` — this is the entire page.
6. `StatsCounter` reflects the effect of a new upload (trace whether it refetches or is static per page load,
   and state which).

---

## 2. The loop

Each round is **grade → fix → re-verify → re-grade**. The grader and the fixer are **separate spawns, every
round**.

1. **Grade.** A fresh `frontend-designer`, given the diff, the task sentence, this rubric, and
   `.claude/rules/code-standards.md` verbatim — none of which a subagent inherits. It does not edit code, and
   it is not told the previous round's score or which checks were failing.
2. **Decide.** Every scored dimension ≥ 90 and no gating check below 1 → the lane **PASSES**. Given §0, expect
   this to mean "BLOCKED, capped by NOT EXERCISED evidence" under the autonomous loop — record that verdict
   honestly rather than inflating scores to close the gate, and escalate per §0: ask the human to run an
   attended round with the connected Chrome browser for uncapped evidence.
3. **Fix.** Lowest-scoring dimension first, only its failed checks. No opportunistic restyling.
4. **Re-verify** the fixed checks against the code path (or a cleaned-up live round-trip per the write-safety
   boundary), then re-grade.

**You — not the grader — hold the prior scorecards** and diff them. A check that flips pass → fail is a
**regression: a blocker in its own right**, reported even if the round otherwise clears. It does not extend the
cap.

**Cap: three grade→fix rounds** (separate from the gate's own three). Still short → stop, report the scorecard,
the failed/capped checks, and what each would take — usually: a human-attended round with the connected Chrome
browser (§0), not "wire up" a browser MCP; one is already connected. Never round up.

---

## 3. Anti-gaming rules (BLOCKING)

- **Grader never edits; fixer never scores.** Different spawns, every round.
- **A dimension score with no per-check evidence is void** — that dimension is 0 until evidence exists.
- **The check set may grow between rounds, never shrink.** A score that rises because a check disappeared is
  void.
- **`NOT EXERCISED` is not a pass** — it caps at 0.5 (§1), and per §0 that is the ceiling for every interaction
  check in this repo today.
- Never present a code-path read as if it were an observed result — say "traced" or "read", never "verified in
  the browser," unless a human-attended round with the connected Chrome browser actually produced that result.

---

## 4. Scorecard format

Returned in place of `AREAS REVIEWED` in the gate's output block (`.claude/rules/subagent-review.md` §Reviewer
Output Format):

```
TASK:     [the operator's complete job, one sentence, from the request]
ROUND:    [n of 3]           SCORED: [x of N checks; N/A: ...]

Functionality   __   (scored __)
Usability       __   (scored __)
Ease            __   (scored __)
Workflow        __   (scored __)
                                        bar: every row >=90; no live-browser evidence exists (see §0)

GATING:         [any [G] check below 1 — blocks regardless of scores]    — or "none"
FAILED CHECKS:  [dimension · check · evidence · what it would take]      — or "none"
NOT EXERCISED:  [check · why · capped at 0.5]                            — or "none" (see §0 for escalation)
REGRESSIONS:    [check that flipped pass -> fail vs the prior round]     — or "none"
VERDICT:        [PASS | BLOCKED — lowest row __, round __ of 3]
```

---
*Version: 1.1 (2026-08-20) — Fix round: the escalation path was stated as a permanent dead end ("until a
browser tool/MCP exists"). `claude-in-chrome` is already connected at the account level; it is `AskUserQuestion`
— unavailable to a spawned subagent — that keeps the autonomous loop code-path-only, not the absence of a
browser. §0, §2 and §3 rewritten so the 0.5 cap stays correct for the autonomous loop while the live escalation
is named: ask the human to run an attended round with the connected Chrome browser. Cap, arithmetic, and rubric
unchanged.

Version: 1.0 (2026-08-20) — New skill carrying the commit gate's UX lane for this repo: four unweighted
dimensions gated at 90, gating checks, the shared-DB write-safety boundary, and a code-path evidence cap
because no browser-automation MCP is wired in. History: `git log -- .claude/skills/ux-score-gate/SKILL.md`.*
