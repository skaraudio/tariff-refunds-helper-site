---
paths:
  - "test/**/*.js"
  - "test/**/*.mjs"
  - "tests/**/*.js"
  - "tests/**/*.mjs"
  - ".claude/**/*.js"
  - ".claude/**/*.mjs"
---

# Test / Verification Script Conventions (Blocking)

**Read this before writing or modifying any test or throwaway verification script.** These rules are
non-negotiable.

**Note on harness:** this repo has **no `test/` directory and no `test/bootstrap.js` / `runTest()` yet.**
Put Claude-authored verification and DB-poking scripts under `.claude/temp/workspace/` (gitignored), run
them with `node`, and load env from `.env` yourself if needed. If a real `runTest()` harness is later added
under `test/`, follow it. Until then the five rules below apply to any script you write here.

## Five Non-Negotiable Rules

1. **Arrow function syntax only** — `const fnName = async () => { ... }`. NEVER `async function fnName() { }`. Applies to primary helper AND every sub-helper.
2. **`runTest()` is a thin wrapper** — holds ONLY a `config` object and ONE call to the primary helper function. All logic (fetches, DB queries, loops, branching, error handling) lives in helper functions defined BELOW `runTest()`.
3. **Minimize comments** — no decorative dividers, no redundant labels, no commentary that restates the next line of code. Only keep comments that explain non-obvious constraints, workarounds, invariants, or gotchas.
4. **Colored console logging via `chalk`** — banner = `chalk.cyan.bold`, in-progress = `chalk.yellow`, success = `chalk.green`, errors = `chalk.red`. One line per phase.
5. **Progress indicators for any loop > 3 items** — format `[N/total]` per item or `Page N/total` per batch.

## Anti-Pattern (DO NOT DO)

```js
runTest(async () => {
    const records = await fetch('...').then(r => r.json());
    for (const r of records) {
        console.log('Processing', r.id);
        await doWork(r);
    }
});

async function doWork(r) { /* ... */ }
```

## Correct Pattern

```js
runTest(async () => {
    const config = { input: 'value', limit: 10 };
    await runFlow(config);
});

const runFlow = async (config) => {
    console.log(chalk.cyan.bold(`=== Flow: ${config.input} ===`));
    const records = await fetchRecords(config);
    console.log(chalk.green(`Done — ${records.length} records`));
};

const fetchRecords = async (config) => { /* ... */ };
```
