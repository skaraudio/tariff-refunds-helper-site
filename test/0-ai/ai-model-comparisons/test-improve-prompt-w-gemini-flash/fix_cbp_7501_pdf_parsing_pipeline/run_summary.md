# fix_cbp_7501_pdf_parsing_pipeline

Generated 2026-08-20T15:03:51.056Z by `test-improve-prompt-w-gemini-flash.mjs`

| | |
|---|---|
| Final score | **98%** (excellent) — shipped `review 3`, +12 pts vs the draft |
| Model | `gemini-3.7-flash` (thinking `high`, depth `engineered`, cap 32768) — pin confirmed present in models.list() |
| Ladder | 3 review round(s) of 3 · target 95% · 10 checkpoints |
| Calls | 7 in 137.4s |
| Tokens | in 141425 · out 77085 |
| Cost | $0.3951 at the repo's charged rate |
| Length | 1594 → 14504 chars |
| Requirements | 12 extracted · all covered |
| Lint | clean |
| Target agent | Claude Code — an autonomous coding agent working in tariff-refunds-helper-site, a public Next.js 16 Pages Router + MySQL site where importers upload CBP Form 7501 PDFs to find IEEPA tariff refunds |
| Repo context | 28 docs · fingerprint `511d47eaffc4` |
| Prior runs | none on disk |

## Review progression

Each artifact is scored once, by the round that received it — the final artifact by an independent audit pass.

| artifact | score | Δ | chars | lint | uncovered | |
|---|---|---|---|---|---|---|
| `draft` | 86% strong | — | 12329 | — | R8 |  |
| `review 1` | 84% adequate | -2 | 12696 | — | — |  |
| `review 2` | 89% strong | +5 | 16497 | — | — |  |
| `review 3` | 98% excellent | +9 | 14504 | — | — | **shipped** |

**Verdict** — Hand off immediately: the work order provides complete, phased, robustly gated, and repo-accurate instructions for autonomous execution.

## Requirement inventory

**Objective** — Harden the CBP Form 7501 PDF parsing and database ingestion pipeline to accurately extract IEEPA line items and duty amounts from unspaced concatenated text, record parse confidence and status metrics in MySQL, and surface parsing degradation states cleanly in the UI.

| id | kind | requirement |
|---|---|---|
| R1 | explicit | Audit the end-to-end upload flow starting at pages/api/upload.js (with bodyParser disabled and Formidable multipart handling) through lib/pdf/parse-entry-summary.mjs (parseEntrySummary) and into entry_summaries and tariff_line_items inserts plus site_stats incrementing to identify every failure mode where a line item is silently dropped or a duty_amount is misread. |
| R2 | explicit | Fix the PDF text extraction and regex parsing logic in lib/pdf/parse-entry-summary.mjs so that concatenated column text produced by pdf-parse without spaces does not cause regexes to miss 9903.01.xx IEEPA line items, miscalculate duty amounts, or incorrectly store isEligible as false for eligible entries. |
| R3 | explicit | Store a parse confidence / quality signal on the entry_summaries table row so that low-confidence or degraded uploads can be identified and re-processed later. |
| R4 | explicit | Update the status enum column on entry_summaries so that it reflects meaningful distinct processing states rather than assigning the same static value to every row. |
| R5 | explicit | Update RefundResults.jsx and the results view to explicitly inform the user when a PDF cannot be parsed cleanly instead of showing a false $0.00 refund. |
| R6 | explicit | Style the updated RefundResults.jsx and results view strictly in neutral black, white, and gray using the Tailwind 4 @theme design tokens in styles/globals.css, without using blue or green Tailwind palette colors. |
| R7 | explicit | Use the mysql-specialist subagent for all tasks modifying files or schema under lib/mysql. |
| R8 | explicit | Use the test-engineer subagent for creating and executing verification scripts. |
| R9 | explicit | Do not run npm run build; verify changes against the local dev server running on port 3014. |
| R10 | explicit | Prove the parser fixes using throwaway scripts under .claude/temp/workspace/ against sample CBP Form 7501 PDFs before altering any database code or schema. |
| R11 | implied | Inspect the live schema via INFORMATION_SCHEMA.COLUMNS where TABLE_SCHEMA = 'tariff_refund_helper_site' before writing database migration scripts or modifying table helper insert queries. |
| R12 | implied | Wrap multi-table database operations across entry_summaries, tariff_line_items, and site_stats inside getDB().transaction(cb) to maintain transactional atomicity during file upload processing. |

**Implied mechanics supplied**

- Execute in strict phases: Phase 1 reproduces parse issues on sample PDFs in .claude/temp/example-entry-summaries/ using throwaway test scripts in .claude/temp/workspace/; Phase 2 hardens lib/pdf/parse-entry-summary.mjs; Phase 3 migrates database schema via .claude/temp/workspace/migrations/ and updates pages/api/upload.js; Phase 4 updates RefundResults.jsx UI; Phase 5 runs full end-to-end verification.
- Spawn subagents on model: opus with inlined path-triggered rule excerpts since subagents run in fresh context without inherited rules.
- Discover real 7501 PDF samples with known 9903.01.xx HTS lines in .claude/temp/example-entry-summaries/ to benchmark extraction accuracy before and after regex refactoring.
- Ensure all test and migration scripts reside strictly under .claude/temp/workspace/ and are cleaned up at session end.

**Failure modes neutralised**

- Modifying database schema or table helper insert logic before verifying parser fixes on actual sample PDFs from .claude/temp/example-entry-summaries/.
- Hardcoding palette colors (e.g. text-red-500, bg-yellow-50, text-blue-600) in RefundResults.jsx instead of neutral @theme semantic tokens (e.g. text-destructive, border-border).
- Running npm run build during iteration, which violates repo rules and disrupts the local development environment.
- Placing verification scripts in root test/ or scripts/ directories instead of .claude/temp/workspace/.
- Writing multi-table database updates in pages/api/upload.js without getDB().transaction(cb), causing partial records on mid-insert failures.
- Assuming column names like importer_name exist on entry_summaries without checking INFORMATION_SCHEMA.COLUMNS.
- Treating low-confidence parses as 0-refund successes rather than emitting explicit degraded parse signals to both the database and the frontend.

**Ambiguities resolved**

- Parse confidence / quality representation on entry_summaries: The prompt asks for 'some kind of parse confidence / quality signal'. Safest resolution: Add a parse_confidence DECIMAL(3,2) (or FLOAT 0.00-1.00) column along with a parse_quality ENUM('high', 'medium', 'low', 'failed') and optional warnings JSON column to entry_summaries via a JavaScript migration script in .claude/temp/workspace/migrations/.
- Status enum values on entry_summaries: The prompt states the status enum needs to mean something instead of every row receiving the same value. Safest resolution: Update the status ENUM to include distinct operational states such as 'processed', 'flagged_for_review', 'partial_parse', 'parse_failed', and 'duplicate', assigned based on parse confidence and extraction success.
- Unparseable UI UX handling in RefundResults.jsx: The prompt requires telling the user when the PDF could not be parsed cleanly instead of showing $0. Safest resolution: When parse_quality is 'low', 'failed', or status is 'flagged_for_review'/'partial_parse', render a prominent degraded-state alert card with tabular-nums explaining the parse ambiguity, listing detected issues, and providing a manual review prompt, styled using neutral surface and text-destructive tokens without showing a false '$0.00 Refund' calculation.

**Repo mechanisms named**

- lib/pdf/parse-entry-summary.mjs for pure domain extraction of CBP Form 7501 line items, duty amounts, and HTS codes (^9903\.01\.\d{2}$).
- pages/api/upload.js formidable multipart upload route with bodyParser: false and 10 MB payload limit.
- lib/mysql/db.mjs synchronous getDB() pool connector, table helpers (getEntrySummariesTable, getTariffLineItemsTable, getSiteStatsTable), and getDB().transaction(cb) atomic wrapper.
- .claude/temp/example-entry-summaries/ containing 60+ sample CBP Form 7501 PDFs for parser benchmarking.
- .claude/temp/workspace/ scratchpad directory for throwaway verification scripts and .claude/temp/workspace/migrations/ for database migration scripts.
- styles/globals.css Tailwind CSS 4 @theme design tokens for neutral black/white/gray surfaces and semantic tokens.
- components/RefundResults.jsx hand-rolled React 19 component using export const RefundResults = () => {} syntax and tabular-nums.
- Subagent delegation to mysql-specialist and code-reviewer / test subagents on model: opus with inlined rules.
- Local Next.js dev server on port 3014 and next-devtools MCP for route inspection without running npm run build.

## draft — 86% (strong)

28.7s · out 9372 tokens (thinking 5557) · 12329 chars · `rounds/01_draft.txt`

| dimension | score | finding |
|---|---|---|
| coverage | 82/100 | R8 is weak because test-engineer is mentioned in Governing Rules but not explicitly dispatched in Phase 1, Phase 2, and Phase 5 where benchmark and verification scripts are authored and executed. |
| fidelity | 83/100 | The prompt softens the author's instruction to 'use the test-engineer agent for the verification scripts' by treating script authoring as lead actions in Phases 1 and 5 rather than delegating them to test-engineer. |
| durability | 84/100 | Model opus is specified with fallback instructions in Governing Rules, but the individual phase dispatch instructions do not restate the durable capability tier resolution for spawned agents. |
| mechanism | 84/100 | Verification script delegation mechanics under .claude/temp/workspace/ need explicit dispatch blocks defining inputs, self-contained rule excerpts, and return artifacts. |
| delegation | 80/100 | mysql-specialist, code-reviewer, and security-reviewer are explicitly dispatched in later phases, but test-engineer is omitted from active delegation in Phases 1, 2, and 5. |
| verification | 82/100 | Verification scripts are defined, but the gate mechanics need clear assertions on pre- and post-migration execution against dev server port 3014 and sample PDFs. |
| checkability | 84/100 | Definition of done checklist is present, but success criteria for the degraded state alert threshold in RefundResults.jsx need tighter mapping to status enum values. |
| failure_modes | 83/100 | Failure mode where test-engineer modifies production code instead of creating throwaway scripts exclusively in .claude/temp/workspace/ is not guarded against. |
| invented_scope | 84/100 | Phase 5 adds security-reviewer audit which was not directly requested by the author; while useful for the subagent review gate, test-engineer was the author's explicit test delegation target. |
| structure | 84/100 | Phases are cleanly structured, but subagent dispatch instructions should be consistently declared at the start of each phase requiring specialized roles. |
| concision | 84/100 | Governing rules and DoD are comprehensive but have minor redundancies regarding port 3014 and color token restrictions across sections. |
| environment_fit | 84/100 | Uses verified repo landmarks and constraints, but must strictly enforce that test-engineer only writes throwaway scripts in .claude/temp/workspace/. |
| execution_readiness | 81/100 | An agent executing the draft would write tests directly as the lead agent rather than dispatching test-engineer as instructed by the author. |

**Coverage gaps**

- R8 (weak) — Governing Rules mentions test-engineer, but Phases 1, 2, and 5 direct script creation without explicitly dispatching test-engineer subagents for script authoring and execution.

**Changes made in this revision**

- Converted unstructured debugging prompt into a 5-phase work order with strict phase gates and throwaway benchmark requirements.
- Defined explicit database schema additions (parse_confidence, parse_quality, parse_warnings, and meaningful status enum values) with a required migration script under .claude/temp/workspace/migrations/.
- Specified exact parse quality telemetry calculation mechanics (confidence float, quality enum, warnings array, reconciliation checksum against Block 39).
- Added transactional atomicity requirement using getDB().transaction(cb) in pages/api/upload.js across entry_summaries, tariff_line_items, and site_stats.
- Specified exact UX behavior for degraded/failed parses in RefundResults.jsx to prevent deceptive $0.00 refund displays, enforcing neutral Tailwind 4 @theme tokens and tabular-nums.
- Delegated database tasks to mysql-specialist and auditing tasks to code-reviewer/security-reviewer subagents on model: opus with inlined rules.
- Enforced environment rules: testing on dev server port 3014, banning npm run build, placing all scripts in .claude/temp/workspace/, and requiring a zero-blocker subagent review gate.

**Risks & assumptions**

- Assumed specific operational enum values ('processed', 'flagged_for_review', 'partial_parse', 'parse_failed', 'duplicate') for the status column to replace static defaults.
- Assumed confidence score is derived from Form 7501 Block 39 grand total duty reconciliation, header completeness, and unparseable line block frequency.
- Assumed database migrations are executed via standalone Node.js JavaScript scripts placed in .claude/temp/workspace/migrations/ as established in repository conventions.

## review 1 — 84% (adequate)

19.3s · out 9191 tokens (thinking 4274) · 12696 chars · `rounds/02_review_1.txt`

| dimension | score | finding |
|---|---|---|
| coverage | 88/100 | All 12 explicit and implied requirements (R1 through R12) are present in the work order across the governing rules and 5 execution phases. |
| fidelity | 86/100 | Literal paths, HTS regex pattern (^9903\.01\.\d{2}$), model tiers, database references, and port 3014 are preserved verbatim. |
| durability | 85/100 | Model routing references 'model: opus' as the primary tier and includes standing fallback instructions to resolve to the frontier tier if superseded. |
| mechanism | 74/100 | Tokenization strategies for fused columns in Box 27-34, parseConfidence scoring formulas, and exact artifact shapes between phase gates are under-specified, risking shallow parsing heuristics. |
| delegation | 72/100 | Subagents are invoked sequentially without defining explicit batch dispatches, self-contained rule inlining packages, strict read-only/write file boundaries, or standard reviewer finding schemas. |
| verification | 75/100 | Phase 5 testing asks to upload '5+ representative PDFs' but lacks an enumerated test matrix of distinct failure modes, CLI invocation commands, expected HTTP status codes, and DB state assertions. |
| checkability | 76/100 | Criteria such as 'handle unspaced and concatenated text' lack concrete test inputs and output reconciliation formulas, making incomplete extraction hard to falsify. |
| failure_modes | 78/100 | Transaction failure testing does not explicitly require mid-insert multi-line rollbacks, and schema discovery does not explicitly mandate asserting against create-database.mjs. |
| invented_scope | 92/100 | Strictly adheres to author's requested pipeline hardening, schema telemetry, upload route transactionality, and UI degraded states without unrequested abstractions or dependencies. |
| structure | 86/100 | Follows a logical 5-phase waterfall with explicit gates preventing database changes before parser verification. |
| concision | 88/100 | Commands are direct and imperative without meta-commentary or extraneous prose. |
| environment_fit | 87/100 | Accurately targets Next.js 16 Pages Router, Tailwind 4 @theme tokens, Skar Server One MySQL pool, and .claude/temp/workspace/ scratchpad constraints. |
| execution_readiness | 76/100 | An agent executing the current draft would have to invent test harness scripts, parser reconciliation math, and parallel review gate briefs from scratch. |

**Changes made in this revision**

- Explicitly delegated all verification and benchmark script authoring (in Phase 1, Phase 2, Phase 3 Gate, and Phase 5) to the test-engineer subagent on model: opus (with capability tier fallback), fully satisfying R8.
- Explicitly aligned subagent delegation across all phases to mysql-specialist (for DB/migration tasks), test-engineer (for verification/benchmark scripts), and code-reviewer (for final audit gates).
- Tightened durability instructions across all subagent dispatch points to ensure model tier fallbacks and runtime disclosure requirements are clear.
- Ensured all durable literals (paths, table names, regexes, port numbers) remain verbatim from the author's prompt and operating context.

**Risks & assumptions**

- PDF-parse output structure on heavily corrupted or multi-page 7501 forms may contain non-standard field ordering that requires iterative regex adjustments during Phase 1 benchmarking.
- Dev server on port 3014 must remain active and healthy across test-engineer script execution runs.

## review 2 — 89% (strong)

30.5s · out 10881 tokens (thinking 4760) · 16497 chars · `rounds/03_review_2.txt`

| dimension | score | finding |
|---|---|---|
| coverage | 92/100 | All 12 explicit and implied requirements are present across the discovery, refactoring, migration, UI, and verification sections. |
| fidelity | 92/100 | Durable literals (file paths, regex pattern ^9903\.01\.\d{2}$, port 3014, table names) are preserved verbatim, while perishable subagent model designations carry proper capability tier fallbacks. |
| durability | 90/100 | Subagent model routing explicitly names 'model: opus' while specifying fallback instructions to the highest available frontier capability tier. |
| mechanism | 88/100 | Operating mechanics for parsing tokenization, telemetry calculation, transactional atomicity, and subagent dispatch are specified in actionable detail. |
| delegation | 86/100 | Subagent roles (mysql-specialist, test-engineer, code-reviewer, security-reviewer, frontend-designer) have defined domains, self-contained rule context requirements, and output report schemas. |
| verification | 90/100 | Includes an enumerated 6-scenario end-to-end test matrix and a 4-lane parallel subagent review gate against a shared git snapshot. |
| checkability | 90/100 | All success criteria and definition of done items are checkable via workspace scripts, dev server API endpoints, and schema inspection. |
| failure_modes | 88/100 | Explicitly prevents common pitfalls such as running npm run build, guessing non-existent columns like importer_name, hardcoding palette colors, or modifying DB schema prior to parser benchmarking. |
| invented_scope | 95/100 | Remains strictly within the author's mandate of parser hardening, telemetry persistence, status enum refinement, and neutral degraded UI presentation. |
| structure | 82/100 | Redundant descriptions of database transaction rules and color prohibitions between Standing Instructions and individual phase steps create minor reading friction. |
| concision | 80/100 | Subagent dispatch boilerplate and script path parameters are repeated across multiple sections instead of being unified into concise operational rules. |
| environment_fit | 82/100 | Omits session workflow hooks (/gh-start and /gh-done) and MCP next-devtools tool invocation mechanics confirmed by the operating context. |
| execution_readiness | 81/100 | Potential stall point in Phase 3 regarding how table helpers in lib/mysql/db.mjs should handle updated column structures during auto-parameterized inserts. |

**Changes made in this revision**

- Supplied exact mechanics and JSON schema for Phase 1 baseline audit script (.claude/temp/workspace/audit-sample-pdfs.mjs).
- Defined explicit tokenization boundaries, parseConfidence formula, parseQuality thresholds, and parseWarnings enum array in Phase 2.
- Specified exact table helper updates, SHA-256 duplicate handling, and transactional rollback test in Phase 3.
- Explicitly detailed the 4 discrete parse rendering states in RefundResults.jsx (Clean Eligible, Clean Non-Eligible, Degraded / Flagged, Parse Failed) with exact neutral @theme token classes.
- Formulated an enumerated 6-scenario integration verification matrix in verify-e2e-pipeline.mjs covering clean, unspaced, degraded, non-eligible, corrupt, and duplicate uploads against port 3014.
- Restructured Phase 5 Subagent Review Gate into 4 parallel batch-dispatched lanes (Security, Efficacy, Completeness, UX) on model: opus with mandatory structured output schemas and zero-blocker pass criteria.
- Set strict read/write file access boundaries for lead agent vs. test-engineer and mysql-specialist subagents.

**Risks & assumptions**

- Some CBP Form 7501 sample PDFs in .claude/temp/example-entry-summaries/ may have unique OCR artifact corruptions or non-standard decimal formats requiring iterative regex tuning during Phase 2 benchmarking.
- The dev server on port 3014 must remain active and accessible throughout test-engineer verification script executions.

## review 3 — 98% (excellent)

19.8s · out 7348 tokens (thinking 1728) · 14504 chars · `rounds/04_review_3.txt`

| dimension | score | finding |
|---|---|---|
| coverage | 98/100 | All 12 explicit and implied requirements are comprehensively captured with concrete operational constraints and acceptance criteria. |
| fidelity | 98/100 | Faithfully captures every nuance of the user request (fused regex parsing, parse telemetry, status enum semantics, neutral UI warnings, subagent delegation, no-build rules) without deviation. |
| durability | 97/100 | Instructions are resilient against ambiguity, specifying exact mathematical weighting for parse confidence telemetry and explicit fallback paths for subagent model naming. |
| mechanism | 98/100 | Mechanisms are grounded in repository facts: exact file paths, MCP devtools tools, getDB() transaction semantics, sample PDF directories, and migration script locations are explicitly named. |
| delegation | 97/100 | Subagent roles (mysql-specialist, test-engineer, code-reviewer, security-reviewer, frontend-designer) are properly bounded on model: opus with inlined rules and clear write-isolation rules. |
| verification | 98/100 | Features strong phased gating: baseline failure recording, parser zero-regression gate, database transaction rollback test, 4-state UI inspection, and a 6-scenario E2E test suite. |
| checkability | 98/100 | Definition of Done and Final Report Deliverables contain crisp, boolean-verifiable criteria across all touched subsystems. |
| failure_modes | 97/100 | Directly neutralizes premature DB modification, non-transactional partial writes, false $0 UI states, palette color leakage, build script execution, and nonexistent importer_name schema assumptions. |
| invented_scope | 98/100 | Telemetry metrics, status enums, and degraded UI states are natural, necessary operationalizations of requested features without introducing unrequested external dependencies or scope creep. |
| structure | 98/100 | Organized into sequential, dependency-ordered phases with explicit intermediate verification gates and clean separation of concerns. |
| concision | 96/100 | Dense, high-signal instructions that state precise rules and schemas without conversational filler. |
| environment_fit | 98/100 | Completely aligned with the environment rules: React 19 / Next.js 16 Pages router, Tailwind 4 @theme tokens, Windows dev server on port 3014, /gh-start workflow, and temporary workspace conventions. |
| execution_readiness | 98/100 | Fully ready for autonomous execution without requiring any human clarification or missing context. |

**Changes made in this revision**

- Integrated operating context session workflow hooks (/gh-start at start, /gh-done at conclusion).
- Streamlined Standing Instructions and phase descriptions to eliminate duplicated transactional and styling rules.
- Specified MCP next-devtools tool invocation mechanics (mcp__next-devtools__nextjs_index, nextjs_call) for dev server route and component inspection.
- Clarified table helper synchronization in lib/mysql/db.mjs following column additions to entry_summaries.
- Standardized subagent dispatch formatting and error reporting protocols.

**Risks & assumptions**

- Some highly malformed or scanned non-text 7501 PDFs may produce empty strings in pdf-parse; these must correctly fall into parseQuality 'failed' rather than causing unhandled runtime exceptions.

## Lessons this run reinforced

- Explicitly dispatch author-requested specialist subagents in every phase where their domain tasks occur rather than assigning those tasks to the lead agent.
- Define explicit subagent dispatch blocks specifying self-contained context excerpts, strict read-write file path boundaries, and standardized report artifact schemas.
- Constrain testing subagents to write throwaway verification scripts strictly within designated temporary scratchpad directories rather than touching production files.
- Enumerate explicit verification test matrices containing distinct failure modes, exact CLI invocation commands, expected return codes, and concrete state assertions.
- Specify exact calculation formulas, tokenization algorithms, and intermediate artifact data schemas instead of leaving complex parsing or scoring heuristics to agent interpretation.
- Prioritize author-mandated subagent roles and requirements over unrequested auxiliary review gates or invented scope.
- Provide concrete test harness scaffolding and CLI command templates directly in the prompt to prevent executing agents from inventing verification code.
- Centralize global technical constraints and prohibitions in governing rules rather than repeating identical boilerplate across individual execution phases.
- State durable capability tier resolution and fallback instructions consistently within every phase dispatch block that spawns subagents.
- Integrate confirmed environment workflow hooks and specialized tool invocations explicitly into the appropriate execution phase steps.

## Files

- `improved_prompt_fix_cbp_7501_pdf_parsing_pipeline.txt` — the shipped prompt, paste-ready
- `original_prompt.txt` — what was fed in
- `run_state.json` — checkpointed state: config, requirement inventory, every round's score, lessons, totals
- `rounds/` — the prompt text as it stood after each round
