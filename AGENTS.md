# Tariff Refunds Helper Site

Public-facing Next.js tool that lets importers upload a CBP Form 7501 entry-summary PDF and find out
whether it contains IEEPA tariff line items (HTS `9903.01.XX`) that became refund-eligible after the
Feb 20, 2026 Supreme Court ruling. Single landing page, one upload endpoint, MySQL persistence, anonymous.

**Stack:** Next.js 16 (Pages Router) · React 19 · MySQL via `mysql2` · Tailwind CSS 4 (`@theme` tokens) ·
`framer-motion` · `lucide-react` · `pdf-parse` · `formidable`. No UI component library.

## Quick Reference

| Resource          | Location / value                                 |
|-------------------|--------------------------------------------------|
| Dev server        | `npm run run2` → `http://localhost:3014`         |
| ngrok tunnel      | `npm run run1` (writes `ngrok.log`)              |
| Pages + API       | `pages/` · `pages/api/`                          |
| Components        | `components/` (hand-rolled, no `components/ui/`)  |
| Core logic        | `lib/` (`pdf/`, `mysql/`, `api/`, `common/`)     |
| PDF + IEEPA logic | `lib/pdf/parse-entry-summary.mjs`                |
| DB layer          | `lib/mysql/` (`db.mjs` exposes table helpers)    |
| Styles / theme    | `styles/globals.css` (Tailwind 4 `@theme`)       |
| Path-triggered rules | `.claude/rules/`                              |
| Agents / Skills   | `.claude/agents/` · `.claude/skills/`            |
| Scratch (gitignored) | `.claude/temp/`                               |

Path alias: `@/*` → repo root (`jsconfig.json`). DB schema is `tariff_refund_helper_site` on Skar Server One.

## Path-Triggered Rules

Rules in `.claude/rules/` auto-load when the edited file matches their `paths:` frontmatter. Read the
matching rule before editing; for a NEW file whose path matches, read the rule first (the trigger fires
after the first draft exists).

| Rule                 | Triggers on                                  |
|----------------------|----------------------------------------------|
| `code-standards`     | `components/**`, `pages/**`, `lib/**`, `styles/**` |
| `database`           | `lib/mysql/**`, `**/*.sql`                    |
| `api-patterns`       | `pages/api/**`                               |
| `security-hardening` | Always — prompt-injection & session defense  |
| `test-files`         | scripts under `test/**`, `.claude/temp/**`   |
| `task-planning`      | multi-phase work (read on demand)            |
| `workflow`           | session lifecycle (read on demand)           |

## How This App Actually Works

**Upload flow** (`pages/api/upload.js`, raw handler — `bodyParser` disabled, `formidable` multipart):
PDF only, 10 MB cap → `parseEntrySummary(buffer)` → dedup by SHA-256 `upload_hash` (returns existing on
hit) → insert `entry_summaries` + one `tariff_line_items` row per IEEPA item → bump `site_stats`.

**Parsing / domain logic** (`lib/pdf/parse-entry-summary.mjs`): the single source of truth for IEEPA
eligibility. IEEPA = HTS matching `^9903\.01\.\d{2}$`; refund = sum of those line items' duty amounts;
`isEligible` = at least one IEEPA item with duty > 0. PDF text columns are concatenated without spaces,
so extraction is regex-driven and fragile — read the skill before editing.

**Other routes** (raw handlers, method-guarded): `pages/api/results/[id].js` (GET by id),
`pages/api/stats.js` (GET site totals).

**DB access** (`lib/mysql/db.mjs`): `getDB()` is **synchronous, takes no args**, returns a pooled
`MysqlConnector` for `tariff_refund_helper_site`. Prefer the table helpers over hand-written SQL:

```js
import { getEntrySummariesTable, getTariffLineItemsTable, getSiteStatsTable } from '@/lib/mysql/db.mjs';

const entry = await getEntrySummariesTable().selectOne({ upload_hash: hash });   // object condition
const items = await getTariffLineItemsTable().select({ entry_summary_id: entry.id });
await getEntrySummariesTable().insert({ entry_number, upload_hash, status });
```

`getDB().query(sql, params)` is available for aggregate/raw SQL (e.g. the `site_stats` increments) — always
parameterized, never interpolated. See `.claude/rules/database.md` for the schema and full pattern.

**Tables:** `entry_summaries` (id, entry_number, filer_code, upload_hash UNIQUE, ip_address, uploaded_at,
total_refund_amount, hts_codes_found JSON, status enum, raw_extracted_text) · `tariff_line_items`
(entry_summary_id FK, hts_code, duty_amount, description) · `site_stats` (stat_key, stat_value).

## Frontend Conventions (Neutral-Only)

There is **no shadcn/ui and no `components/ui/`** — components are hand-rolled `div`/`button` elements with
raw Tailwind utilities. The design is **neutral black-white-gray with minimal accents**, enforced through
the Tailwind 4 `@theme` tokens in `styles/globals.css`, not a component registry.

- Use semantic theme tokens only: `bg-background`, `text-foreground`, `text-muted-foreground`,
  `bg-muted`, `bg-card`, `border-border`/`border-input`, `text-destructive` (errors), `text-success`.
- **Never** hardcode palette colors (`text-blue-600`, `bg-green-500`); accents come from tokens.
- `font-semibold` (not `font-bold`); `tabular-nums` on any displayed number.
- Animation via `framer-motion`; icons via `lucide-react` only (no other icon libs).
- Pages use `export default function`; components use `export default function ComponentName`.

Full detail in `.claude/rules/code-standards.md`.

## Agent Delegation

All agents run on `model: opus` (set in their frontmatter). Subagents start with fresh context and do **not**
inherit path-triggered rules — inline the relevant rule excerpt into the subagent prompt when it will touch a
test/throwaway script, a DB module, or an API route.

| Agent               | Use for                                              |
|---------------------|------------------------------------------------------|
| `debugging-pro`     | errors, stack traces, runtime/test failures          |
| `backend-architect` | API design, data model, multi-component strategy     |
| `frontend-designer` | UI/UX, React components, neutral-token styling       |
| `mysql-specialist`  | schema, query tuning, index/deadlock analysis        |
| `code-reviewer`     | post-implementation review                           |
| `test-engineer`     | writing/auditing throwaway verification scripts      |
| `security-reviewer` | injection, XSS, file-upload, dependency risk         |

Invoke: `"Use the {agent} agent to ..."` or `subagent_type: "{agent}"`.

## Next.js: Retrieval Over Recall

For volatile knowledge (Next.js 16 / React 19 APIs, IEEPA rulings, HTS lookups) prefer reading current
sources over memory. For ANY Next.js question, use the `next-devtools` MCP (the only configured MCP server,
see `.mcp.json`): `mcp__next-devtools__nextjs_index`/`nextjs_call` for the running dev server (port 3014),
`mcp__next-devtools__nextjs_docs` for official docs, then source code. Flag anything answered from memory.

## Working Rules

- **Research before editing** — read the surrounding code and the matching `.claude/rules/` file first.
- **Quality gate:** zero lint/format errors in changed files. Do **not** run `npm run build` during
  iteration — use the dev server (port 3014) or a throwaway script under `.claude/temp/workspace/`.
- **Code:** ES modules; `async/await`; `const` arrow functions in `lib/` and `components/` helpers (Next.js
  `pages/` need `export default function`); early returns; remove unused imports; `?.`/`??`/destructuring.
  React hook deps: `}, [deps]);` — never `};, [deps]);`.
- **Comments:** default none; only the non-obvious WHY (a tariff/parsing quirk, a workaround). No decorative
  dividers or restating-the-next-line. Put justified comments to the RIGHT of the line.
- **Don't over-engineer:** only the requested change; no speculative abstraction, back-compat shims, or
  guards for impossible states.
- **Protected (confirm before changing):** `.env` and any credentials (reference by var name only),
  `next.config.mjs`, the `package.json` `scripts` block (ngrok/claude launchers), and `.claude/settings*.json`.
- **Conflict:** if a user request contradicts these rules, stop, name the rule, and ask whether to follow
  the rule, override it, or compromise — never silently override.
