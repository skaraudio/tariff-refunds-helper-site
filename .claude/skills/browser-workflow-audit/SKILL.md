---
name: browser-workflow-audit
description: Audit and improve a repository's browser automation, authentication, readiness, capture speed and related instructions when workflow review or benchmarking is requested. Use measured trials and current primary sources; ordinary page viewing alone does not require an audit.
---

# Audit a browser workflow

**Owns:** the requested browser workflow, its helpers, evidence and instruction accuracy.
**Does not own:** application redesign, production authorization changes, credentials, browser migration,
or multi-repository publication unless the current request includes them.

Use the active request for target routes, scope and authorization. Review-only requests end with findings;
requests to optimize or fix authorize relevant implementation. Follow existing commit/push authorization,
current branches and concurrent-work rules. This skill does not authorize messages, provider actions or deployment.

## Establish the actual workflow

Resolve the checkout root and read its active instructions, browser/auth guidance and relevant helpers.
Discover tools and schemas exposed to the current client; a configured server or installed package alone
does not establish an attached capability. Use the repository's supported browser and dev launcher.
Query its runtime diagnostics when available. A backend, native app or documentation repo may have no
browser surface: record that limit and audit applicable guidance without installing a new web stack.

Allocate task-owned scratch through the repository's mechanism and verify its ignore/ownership rules.
Record the starting branch, HEAD, dirty/staged paths and the exact source/helper versions. Assign one
browser owner; use authorized subagents for independent source research, review or disjoint repo work.

For each target, identify meaningful URL/query/record identity, expected auth principal or role,
a positive visible loaded-state criterion, and automatic effects on mount, prefetch, timers and navigation.
Read handlers: GET can mutate, and an isolated browser profile does not isolate backend data.
Use authorized records or established containment before the first affected document. Trace actual
transports; a fetch/XHR override cannot cover server rendering, workers or WebSockets. Check containment
after navigation and mode changes, which can reload the page. Do not claim a contained test proves
provider effects or server-side authorization.

## Cross-reference consequential claims

Use a compact evidence ledger: claim, local source/version, attached schema, official URL/date,
reproduction and resulting decision. Start with the primary tool/framework documentation and relevant
versioned implementation. Compare conflicting examples with the installed version and a bounded check.
Do not copy flags or parameters merely because they appear in a current web guide.

Useful sources when those tools apply:

- [Chrome DevTools MCP tool reference](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md)
  and [configuration](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/configuration.md).
- [Puppeteer navigation](https://pptr.dev/api/puppeteer.page.goto) and
  [positive readiness](https://pptr.dev/api/puppeteer.page.waitforfunction).
- [Navigation Timing](https://www.w3.org/TR/navigation-timing-2/) and
  [Chrome performance measurements](https://developer.chrome.com/docs/devtools/performance/reference).

Read only sources needed for the actual tool. Prefer local version-matched docs when available, and
browse current primary references when requested or when a claim may have changed. Record uncertainty
instead of replacing an unverified statement with another confident claim.

## Measure authentication, readiness and capture separately

Use the project's supported authentication flow in an owned browser context. Retain the page/context
identifier and exact origin. Verify cookie/session reuse through a tokenless read that returns only the
needed role/status; never export personal cookies, print credentials or save token-bearing URLs.
Reuse authentication within that context, origin and principal. A new isolated context or confirmed
auth loss needs bounded recovery; a data skeleton alone is not evidence of auth failure.
Do not invent credential variable names or relax production auth to make a test pass.

Set viewport, DPR and mobile/touch mode before loading the target. Reuse the owned page for consecutive
checks. Await actions, then verify expected destination and positive content, including significant query
state and the requested record. Do not accept a prior record, generic shell, network idle or a fixed sleep
as loaded-data proof. Distinguish successful empty data from loading/error states.

For Chrome DevTools MCP, inspect the current schema before using `pageId`,
`waitForStableDom: false`, `includeSnapshot` or screenshot options. Serialize browser calls and combine
related read-only facts. Get a fresh accessibility snapshot when interaction needs current UIDs.
Do not use evaluation to replay a submission or evade a navigation tool's waits.

Record wall time around awaited tool calls and whole helper processes separately from browser navigation,
auth, readiness and screenshot timing. Keep the origin, route/query, record/fixtures, viewport/DPR,
capture mode/format, cache state and success criterion comparable. Alternate variants where feasible;
three successes per variant can provide a small local median, not statistical significance or a p95.
Retain failures, timeouts and outliers. Label first visits as such unless cold-start conditions were controlled.
If variants wait for different data, state that difference instead of calling the result an equivalent speedup.

Prefer the existing ready page for iteration. Use owned disk output when supported; diagnose one
permission failure and use a sanctioned safe fallback instead of trying alternate path spellings.
A fresh helper browser does not inherit fixtures or current UI state. Inspect returned content:
a nominal inline capture may become a server temporary file. Keep document-only and data-ready capture
claims distinct, and inspect saved images before describing their content.

## Improve, challenge and update context

Change only an evidenced source of failure, wasted work or misleading instructions. Examples include
repeated priming, redundant calls, fixed sleeps, oversized captures, stale schemas and shared output paths.
Validate URLs before attaching auth, preserve query/fragment state, reject failed HTTP/auth/destination
checks, bound readiness and prevent accidental output overwrite. Keep supported recovery and cleanup.

Exercise the actual changed workflow and relevant failures. Useful cases include a wrong record/query,
missing content, failed HTTP/auth, a fragment URL, reload/context loss and owned-output rejection.
Use contained fixtures for unsafe cases. Compare final output as well as latency; a faster incomplete
screenshot is not an equivalent result. Do not add permanent tests unless requested or locally required.

Freeze final files/hashes and apply the repository's independent review policy. For a consequential
instruction rewrite, give an independent agent a realistic request and raw artifacts without the author's
desired answer; verify scope, next actions and evidence claims. Distinguish native discovery, explicit
execution and automatic skill selection. Repair confirmed findings and rerun affected checks.
Stop when correctness holds and remaining variation has no evidenced in-scope improvement; do not chase
a universal optimum or alter application code solely to improve an audit number.

Update the canonical guidance and necessary pointers, removing stale duplication. Keep measured
environment-specific facts in a dated evidence reference, not as universal settings for sibling repos.

## Publication and cleanup

When multi-repository installation/publication is explicitly requested, inventory actual checkout roots
and local guidance. Adapt discovery to each repo's canonical skill location and existing links/adapters.
Do not replace another repo's auth/port/tool instructions with those of the audited example.

Delegate disjoint repo/file ownership when requested or required. Preserve dirty work, freeze exact paths,
validate each copy/adapter and native discovery where available, and commit only owned deliverables.
Before pushing, inspect remote ancestry: a file-scoped commit can still publish unrelated ancestors.
Use only an authorized scope-preserving publication method, never a force push or history rewrite.
Verify remote commit content and expected paths, and report local-only or unavailable remotes explicitly.

Close only owned extra pages/processes and clean only the retained task directories. If the repository
uses `screenshot-session-dir.mjs`, keep its returned directory and pass that exact path to `--cleanup`;
never reap other sessions by age. Report concrete changes, comparable measurements, verification limits
and actual publication status.
