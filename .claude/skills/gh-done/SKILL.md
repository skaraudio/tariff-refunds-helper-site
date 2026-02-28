---
name: gh-done
description: Close a GitHub issue with a completion summary (success or failure).
argument-hint: "[issue-number] [success|fail]"
allowed-tools: Bash(gh issue *)
---

# Close GitHub Issue

Close the current GitHub issue with a summary of results.

## Usage

```
/gh-done [issue-number] [success|fail]
```

Arguments:

- `issue-number` - The issue to close (if not provided, will ask or use most recent)
- `success` or `fail` - Whether the task was completed successfully (defaults to success)

## Instructions

### Step 1: Determine issue number

If provided as argument, use it. Otherwise:

1. Check if an issue was created earlier in the session
2. Ask the user: "Which issue number should I close?"

### Step 2: Generate summary

Based on the conversation, generate a summary of:

- What was accomplished (or attempted)
- What changes were made (files modified, features added)
- How it was tested/verified

### Step 3: Close with appropriate status

**For successful completion:**

```bash
gh issue comment ISSUE_NUMBER --body "## :white_check_mark: Completed Successfully

### Summary
{What was done}

### Changes Made
- {List of changes}

### Testing
{How it was verified}"

gh issue close ISSUE_NUMBER
```

**For unsuccessful/blocked:**

```bash
gh issue comment ISSUE_NUMBER --body "## :x: Could Not Complete

### Attempted
{What was tried}

### Blocker
{Why it couldn't be completed}

### Next Steps
{Recommendations for future}"

gh issue close ISSUE_NUMBER --reason "not planned"
```

### Step 4: Confirm to user

```
Closed GitHub issue #NUMBER: [title]
Status: {Success/Failed}
```

---
Version: 1.0
