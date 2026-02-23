---
name: gh-start
description: Create a GitHub issue to track the current investigation or task.
argument-hint: "[optional title]"
allowed-tools: Bash(gh issue *)
---

# Start GitHub Issue Tracking

Create a GitHub issue to track the current task or investigation.

## Usage

```
/gh-start [optional title]
```

## Instructions

### Step 1: Determine issue title

If a title was provided as an argument, use it. Otherwise, generate a brief title from the current conversation context.

### Step 2: Create the issue

```bash
gh issue create \
  --title "[Investigation] {TITLE}" \
  --body "## Task
{Summary of what we're working on}

## Status
:mag: **In Progress** - Started investigation

## Notes
- Session started: {current date/time}
- Updates will be added as comments"
```

### Step 3: Store issue number

After creating, note the issue number and inform the user:

```
Created GitHub issue #NUMBER: [title]
Use /gh-done when finished to close with results.
```

## Labels to Consider

- `bug` - For bug fixes
- `enhancement` - For new features
- `investigation` - For research/debugging
- `database` - For MySQL/schema work

---
Version: 1.0
