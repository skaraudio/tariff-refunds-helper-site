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

## What to verify

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
