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

## UI Standards — Hand-Rolled Tailwind 4, Neutral-Only

**There is no shadcn/ui and no `components/ui/` in this repo.** Components are hand-rolled `div`/`button`
elements styled with raw Tailwind 4 utilities. The neutral palette is enforced through the `@theme` tokens
in `styles/globals.css`, not a component library. Build new UI the same way; do not add shadcn or any other
UI library.

### Color Philosophy — Neutral Black/White/Gray + Minimal Accent

| Element        | Correct                                | Wrong                       |
|----------------|----------------------------------------|-----------------------------|
| Buttons        | neutral: `bg-foreground text-background` / `border border-border` | `className="bg-blue-600"` |
| Links          | inherit foreground, `hover:underline`  | `className="text-blue-600"` |
| Secondary text | `text-muted-foreground`                | `text-gray-500`             |
| Icons          | `text-muted-foreground`                | `text-green-500`            |
| Errors only    | `text-destructive`                     | N/A                         |
| Success only   | `text-success`                         | `text-green-600`            |

### Allowed Theme Tokens (defined in `styles/globals.css`)

```
bg-background / text-foreground          # page bg + main text (white / near-black)
text-muted-foreground                    # secondary text (gray)
bg-muted / bg-card / bg-secondary        # surfaces
border-border / border-input             # borders (light gray)
text-destructive                         # errors only (red)
text-success                             # positive / eligible only (green)
```

Animation: `framer-motion`. Icons: `lucide-react` only.

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

1. Hardcoded palette colors (`text-green-600`, `bg-blue-500`) — use theme tokens
2. `font-bold` instead of `font-semibold` for metrics/headings
3. Missing `tabular-nums` on displayed numbers
4. Adding shadcn/ui or any other UI component library
5. New global CSS classes when a Tailwind utility will do
