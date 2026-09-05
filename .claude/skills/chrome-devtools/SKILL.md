---
name: chrome-devtools
description: Use when visually verifying or debugging this site's UI in a real browser — confirming the landing page, the PDF drag-and-drop upload flow, the animated results panel, or the stats counter render correctly. Drives the running dev server on http://localhost:3014 via the Chrome DevTools MCP for screenshots, DOM/console inspection, and interaction. Prefer the next-devtools MCP for routing/build/runtime questions; use this for pixel-level and end-to-end click-through checks.
allowed-tools: Bash(npm run *), Bash(curl *)
---

# Chrome DevTools — Visual Verification

Use the Chrome DevTools MCP to drive a real browser against this app's dev server.

## Setup

1. Start the dev server if it isn't running: `npm run run2` → serves `http://localhost:3014`.
2. Point the Chrome DevTools MCP at `http://localhost:3014` (the home page renders the full single-page
   experience: Hero → StatsCounter → HowItWorks → FileUpload → TariffCodesInfo → Footer).

## Efficient browser work in Codex and Claude Code

- Discover the attached tool names and schemas once; Codex may normalize `chrome-devtools` to
  `chrome_devtools`. Use the attached schema instead of assuming the MCP is registered from this doc.
  Retain the page ID from `new_page` and pass `pageId` where exposed; reserve `list_pages` for recovery
  and cleanup. Reuse one page during a related inspection/edit/capture loop and serialize its actions.
- This site is anonymous: keep `http://localhost:3014` and do not add another app's screenshot token.
  After navigation/refresh, require the expected origin, pathname and relevant query parameters,
  a visible page-specific heading, and loaded data or an explicit empty state for the feature under
  test. Judge the results panel only after its result state appears; a landing-page heading does not
  prove upload completion. A stats fallback is not a successful stats load.
- Use bounded read-only readiness polling with a total deadline and short calls. When the live
  `evaluate_script` schema supports `waitForStableDom`, set it to `false` for these checks only.
  Diagnose the destination, console and failed requests before extending a deadline; fixed sleeps or
  an absent spinner alone do not prove readiness. Uploading a PDF persists data, so timing-only
  comparisons must use read-only page inspection, not repeated submissions.
- Take a fresh snapshot after navigation, refresh or a DOM-changing interaction before using UIDs.
  A successful readiness poll does not refresh an old snapshot. Combine related read-only DOM checks
  into one compact result instead of repeated round trips or a full DOM dump.
- Reuse the ready page for inline screenshots during iteration when supported. Save required evidence
  under `.claude/temp/screenshots/<unique-task-id>/` with viewport names and inspect each image.
  Recheck readiness after resizing. Close only pages you opened; delete only your task child after
  verifying its resolved absolute path is within this repo. Shared cleanup remains a separate action.
- Measure complete tool-call times separately from renderer/navigation times. Keep the route, viewport,
  data state and capture type fixed; separate cold loads, take at least three warm samples, and report
  medians, outliers and failed checks. Compare one workflow change at a time. Do not present another
  repository's browser timings as measurements of this app.

## What to verify

Before exercising the upload flow, read `.claude/skills/ux-score-gate/SKILL.md` §Write-safety boundary.
Browser availability does not authorize speculative writes to the shared database.

- **Neutral design holds** — page is black/white/gray on `bg-background`; no stray colored buttons/links.
  Numbers use `tabular-nums`; headings/metrics are `font-semibold`, not `font-bold`.
- **Upload flow** (`components/FileUpload.jsx`): drag-and-drop or click-to-browse a PDF from
  `.claude/temp/example-entry-summaries/`; confirm the Uploading → Processing → Success transition and the
  animated `RefundResults` panel (eligible shows refund total + line items; ineligible shows the no-codes
  state). Non-PDF and >10 MB inputs must surface the client-side error state.
- **Stats counter** (`components/StatsCounter.jsx`) — pulls `/api/stats`; verify the three counters render
  non-zero data, not the all-zero fallback.

## Notes

- For "how does this route/build work" questions use the `next-devtools` MCP instead (port 3014).
- Capture a screenshot for any UI change before reporting it done; check the browser console for errors.
