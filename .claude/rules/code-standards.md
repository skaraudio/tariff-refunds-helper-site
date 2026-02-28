---
paths:
  - "components/**/*.jsx"
  - "components/**/*.tsx"
  - "pages/**/*.jsx"
  - "pages/**/*.tsx"
  - "lib/**/*.js"
  - "lib/**/*.mjs"
  - "lib/**/*.ts"
  - "styles/**/*.css"
---

# Code Standards

**Read this file when:** Writing/modifying JavaScript, TypeScript, React code, imports, functions, or components.

---

## JavaScript/TypeScript

- Use `const` arrow functions
- Prefer destructuring, optional chaining (`?.`), and nullish coalescing (`??`)
- Match existing JS/TS file type when modifying

---

## Import Organization

**Order (add blank line between groups):**

1. CSS/Side-effect imports - `import './styles.css'`
2. Default imports from external packages - `import React from 'react'`
3. Default imports from local files - `import helper from './utils'`
4. Named imports from external packages - `import {useState} from 'react'`
5. Named imports from local files - `import {getDB} from '../../lib/mysql/db.mjs'`

---

## React Standards

- Functional components only
- Use `useState`, `useEffect`, `useCallback`, `useMemo` as needed
- No ReactIcons library - use custom SVGs or lucide-react icons

**Critical Hook Syntax:**

```javascript
// CORRECT: }, [deps]);
// WRONG:   };, [deps]);  // NEVER semicolon before comma
```

---

## Export Standards

**Components:** Use `export const ComponentName = () => {}`

**Pages (`pages/`):** Use `export default function` (Next.js requirement)

**Never create barrel files (index.jsx re-exports)** - import directly from source files.

---

## UI Component Standards - shadcn/ui

**All React UI must use shadcn/ui components exclusively.**

### Color Philosophy

**shadcn uses NEUTRAL, BLACK & WHITE with minimal color accents.**

| Element        | Correct                       | Wrong                       |
|----------------|-------------------------------|-----------------------------|
| Buttons        | `variant="default"` (black)   | `className="bg-blue-600"`   |
| Links          | Inherits foreground (dark)    | `className="text-blue-600"` |
| Badges         | `variant` props               | Custom color classes        |
| Secondary text | `text-muted-foreground`       | `text-gray-500`             |
| Icons          | `text-muted-foreground`       | `text-green-500`            |
| Errors only    | `variant="destructive"` (red) | N/A                         |

### Allowed Color Tokens

```
text-foreground          # Main text (black/dark)
text-muted-foreground    # Secondary text (gray)
text-destructive         # Errors only (red)
bg-background            # Page background
bg-card                  # Card background
bg-muted                 # Muted background
bg-secondary             # Secondary background
border / border-input    # Borders (light gray)
```

---

## Data Structures: Maps for O(1) Lookups

```js
// CORRECT: Build Map for O(1) lookups
const dataByKey = new Map();
for (const row of rows) {
  dataByKey.set(row.key, row);
}

// WRONG: Array with find() - O(n) each lookup
const found = dataArray.find(item => item.key === searchKey);
```

---

## Performance Patterns

### Async Waterfall Prevention (CRITICAL)

```javascript
// WRONG: Sequential waterfalls
const user = await fetchUser()
const posts = await fetchPosts()

// CORRECT: Parallel execution
const [user, posts] = await Promise.all([fetchUser(), fetchPosts()])
```

### Dynamic Imports

```javascript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(
  () => import('./heavy-component').then(m => m.HeavyComponent),
  { ssr: false }
)
```

---

## Comment Formatting

**Comments go to the RIGHT of the line, not above it:**

```js
// CORRECT
const config = {
    maxRetries: 3,              // Number of retry attempts
    cacheEnabled: true,         // Enable result caching
};

// WRONG
const config = {
    // Number of retry attempts
    maxRetries: 3,
};
```

---

## Prohibited Practices

1. Hardcoded colors (`text-green-600`, `bg-blue-500`)
2. Bypassing semantic components with custom divs
3. `font-bold` instead of `font-semibold` for metrics
4. Missing `tabular-nums` on numbers
5. Custom CSS classes or inline styles
6. Mixing other UI libraries with shadcn

---

*Version: 1.0*
