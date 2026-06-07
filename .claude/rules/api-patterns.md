---
paths:
  - "pages/api/**/*.js"
  - "pages/api/**/*.mjs"
  - "pages/api/**/*.ts"
---

# API Patterns

**Read this file when:** Creating/modifying routes under `pages/api/`.

---

## Current Reality

All three existing routes (`upload.js`, `results/[id].js`, `stats.js`) are **raw Next.js handlers**: a
single `export default async function handler(req, res)` that guards the method, validates input, and
returns JSON via `res.status(...).json(...)` inside a `try/catch`. Match this style.

```js
import { getEntrySummariesTable } from '@/lib/mysql/db.mjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid entry ID' });
  }

  try {
    const entry = await getEntrySummariesTable().selectOne({ id: parseInt(id) });
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    return res.status(200).json({ id: entry.id, entryNumber: entry.entry_number });
  } catch (error) {
    console.error('[API] Results error:', error?.message);
    return res.status(500).json({ error: 'Failed to fetch results' });
  }
}
```

**Conventions:**

- `@/` path aliases; `export default function` (Next.js Pages Router requirement).
- Guard the method first (return `405`), validate inputs next (return `400`), then `try/catch` the work.
- Validate everything at the boundary — never trust `req.query` / `req.body`.
- File uploads: disable the body parser (`export const config = { api: { bodyParser: false } }`) and parse
  with `formidable`; enforce mimetype and size limits server-side (see `upload.js`, 10 MB cap, PDF only).
- DB access goes through the table helpers (see `.claude/rules/database.md`); parameterized always.

---

## Optional: `methodHandler`

`lib/api/method-handler.mjs` provides a multi-method wrapper (method map + CORS + central error catch where
handlers `throw` and return `{ status, result }`). It exists but **no current route uses it.** Use it only
for a genuinely multi-method endpoint; for single-method routes the raw guard above is the established style.
