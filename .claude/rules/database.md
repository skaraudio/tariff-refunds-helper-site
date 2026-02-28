---
paths:
  - "lib/mysql/**/*.mjs"
  - "lib/mysql/**/*.js"
  - "lib/db/**/*.mjs"
  - "lib/db/**/*.js"
  - "**/*.sql"
---

# Database Standards

**Read this file when:** Working with database queries, MySQL, SQL, schema, or migrations.

---

## Database: tariff_refund_helper_site

### Tables

| Table                | Purpose                                            |
|----------------------|----------------------------------------------------|
| `entry_summaries`    | Customs entry summary records with importer info   |
| `tariff_line_items`  | Individual HTS line items within each entry         |
| `site_stats`         | Usage analytics and site statistics                 |

### Connection

```js
import { getDB } from '@/lib/mysql/db.mjs';

const db = await getDB();
const [rows] = await db.query(
  'SELECT * FROM entry_summaries WHERE entry_summaries.entry_number = ?',
  [entryNumber]
);
```

---

## Naming Conventions

**Use full table names in queries (never abbreviate):**

```js
// CORRECT
const query = `
  SELECT entry_summaries.entry_number, entry_summaries.importer_name
  FROM entry_summaries
  WHERE entry_summaries.entry_number = ?
`;

// WRONG
const query = `SELECT es.entry_number FROM entry_summaries es WHERE es.entry_number = ?`;
```

---

## Core Rules

- Use parameterized queries (prevent SQL injection)
- Use transactions for multi-table changes
- Write full table names in SELECT, FROM, WHERE, JOIN
- Use descriptive connection variable names (`db`, not `conn`)

---

## Parameterized Queries (MANDATORY)

```js
// CORRECT - parameterized
const [rows] = await db.query(
  'SELECT * FROM tariff_line_items WHERE tariff_line_items.entry_id = ?',
  [entryId]
);

// NEVER - string interpolation
const query = `SELECT * FROM tariff_line_items WHERE entry_id = '${entryId}'`; // VULNERABLE
```

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

---

*Version: 1.0*
