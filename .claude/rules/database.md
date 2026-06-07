---
paths:
  - "lib/mysql/**/*.mjs"
  - "lib/mysql/**/*.js"
  - "**/*.sql"
---

# Database Standards

**Read this file when:** Working with database queries, MySQL, SQL, schema, or migrations.

---

## Database: tariff_refund_helper_site

### Tables (schema in `.claude/temp/workspace/migrations/create-database.mjs`)

| Table               | Key columns                                                                                          |
|---------------------|------------------------------------------------------------------------------------------------------|
| `entry_summaries`   | id, entry_number, filer_code, upload_hash (UNIQUE), ip_address, uploaded_at, total_refund_amount, hts_codes_found (JSON), status (enum: processing/eligible/not_eligible/error), raw_extracted_text |
| `tariff_line_items` | id, entry_summary_id (FK → entry_summaries, ON DELETE CASCADE), hts_code, duty_amount, description    |
| `site_stats`        | id, stat_key (UNIQUE), stat_value — seeded keys: `total_entries_processed`, `eligible_entries`, `total_refund_amount` |

There is no `importer_name` column. Verify columns against the migration file before assuming a field exists.

### Connection

`getDB()` is **synchronous and takes no arguments** — it returns a pooled `MysqlConnector` bound to the
`tariff_refund_helper_site` database (`lib/mysql/db.mjs`). Do **not** `await getDB()` and do not pass a name.

### Preferred: Table Helpers (object conditions, auto-parameterized)

`db.mjs` exposes one helper per table. Prefer these over hand-written SQL — they build parameterized
queries from plain-object conditions via `MysqlTable` (`select`, `selectOne`, `insert`, `update`,
`insertUpdate`, `deleteOne`):

```js
import { getEntrySummariesTable, getTariffLineItemsTable } from '@/lib/mysql/db.mjs';

const entry = await getEntrySummariesTable().selectOne({ upload_hash: hash });
const items = await getTariffLineItemsTable().select({ entry_summary_id: entry.id });
await getEntrySummariesTable().insert({ entry_number, upload_hash, status });
```

### Raw SQL: only when a helper can't express it

Use `getDB().query(sql, params)` for aggregates / `UPDATE ... SET col = col + ?` (e.g. `site_stats`).
Always parameterized — never string interpolation:

```js
// CORRECT — parameterized
await getDB().query(
  `UPDATE site_stats SET stat_value = stat_value + ? WHERE stat_key = 'total_refund_amount'`,
  [amount]
);

// NEVER — string interpolation
const sql = `SELECT * FROM tariff_line_items WHERE entry_summary_id = ${id}`; // VULNERABLE
```

---

## Core Rules

- Parameterized queries always (the table helpers do this for you)
- Use `getDB().transaction(cb)` for multi-table writes that must be atomic
- Object conditions for table helpers; explicit column names in any hand-written SQL

---

## Always Verify Schema First

```sql
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'tariff_refund_helper_site'
  AND TABLE_NAME = 'table_name';
```

---

## Migration Scripts

**Claude-generated migration scripts go in:** `.claude/temp/workspace/migrations/`

**NEVER put migration scripts in `scripts/`, `.claude/scripts/`, or any other project folder.** Those folders are for
production scripts checked into git. Claude-generated migrations are workspace files that get reviewed and applied
manually.

---

## Running SQL

Always run SQL via JS files, not raw bash commands.

**Config files:** `lib/mysql/`
