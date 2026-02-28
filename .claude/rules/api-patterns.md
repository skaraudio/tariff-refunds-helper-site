---
paths:
  - "pages/api/**/*.js"
  - "pages/api/**/*.mjs"
  - "pages/api/**/*.ts"
---

# API Patterns

**Read this file when:** Creating/modifying API endpoints or request handlers.

---

## Standard API Endpoints

Use `methodHandler` for all endpoints:

```js
import { methodHandler } from '@/lib/api/method-handler.mjs';

export default async function handler(req, res) {
  return await methodHandler(req, res, {
    GET: handleGet,
    POST: handlePost,
  });
}

const handleGet = async (req, res) => {
  const { entry_number } = req.query;

  if (!entry_number) {
    throw new Error('Missing required parameter: entry_number');
  }

  const result = await lookupEntry(entry_number);
  return { status: 200, result };
};

const handlePost = async (req, res) => {
  const { entry_number, importer_name } = req.body;

  if (!entry_number || !importer_name) {
    throw new Error('Missing required fields');
  }

  const result = await createEntry(req.body);
  return { status: 200, result };
};
```

**Key Points:**

- Use `@/` path aliases
- `methodHandler` handles method routing and error catching
- Return `{status, result/message}` objects
- Throw errors instead of manual status codes

---

## Error Handling

**Throw errors** - methodHandler catches and handles them:

```js
// CORRECT
if (result?.affectedRows === 0) {
  throw new Error('No rows updated');
}

// WRONG
res.status(500).json({ error: 'Failed' });
```

---

## Response Format

```js
return { status: 200, result: data };   // Success with data
return { status: 200, message: 'ok' };  // Success with message
return { success: true };               // Simple success
```

---

## Input Validation

Always validate inputs at the API boundary:

```js
const handlePost = async (req, res) => {
  const { entry_number, hts_code, duty_paid } = req.body;

  // Validate required fields
  if (!entry_number) throw new Error('Missing required field: entry_number');
  if (!hts_code) throw new Error('Missing required field: hts_code');

  // Validate types
  if (typeof duty_paid !== 'number' || duty_paid < 0) {
    throw new Error('duty_paid must be a non-negative number');
  }

  // Sanitize - never trust user input in queries
  // Always use parameterized queries (see database.md)

  const result = await insertLineItem({ entry_number, hts_code, duty_paid });
  return { status: 200, result };
};
```

---

*Version: 1.0*
