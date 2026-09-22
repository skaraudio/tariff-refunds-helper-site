---
name: optimize
description: Run a safe efficiency audit on a Node.js file and its dependency tree.
argument-hint: "[file-to-optimize] [test-file?]"
disable-model-invocation: true
allowed-tools: Bash(node *)
---

# Optimize

Audit the file named in the first argument, and the local modules it imports, for wasted work, then apply only
changes that keep its behavior identical: same inputs, return values, thrown errors, ordering and side effects.
Typical finds here are sequential `await`s that could run together and array scans a `Map` would serve (the
Performance Patterns section of `.claude/rules/code-standards.md`), duplicate round-trips through the
`lib/mysql/db.mjs` table helpers, and avoidable React re-renders.

- Read the target and every dependency you may change in full, and grep the callers of any export you touch.
- If a second argument names a test or verification script, read it before running it. `POST /api/upload` and
  anything that writes through `lib/mysql/` reach the shared `tariff_refund_helper_site` database, so run such a
  script only with Kevin's go-ahead. Otherwise run it with `node` before and after the change.
- Without a usable script, write a throwaway check in the task directory's `self-tests/` child (root `AGENTS.md`
  §Temporary work (Codex and Claude Code)) that compares old and new output on a normal, a boundary and a failure
  input.
- Done when each applied change is listed with the check that shows behavior is unchanged; list anything you
  could not verify and leave it as it was.
