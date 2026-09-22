---
name: clear-screenshots
description: Delete all screenshot files from temp output folders. Placeholder, not set up in this repo yet.
argument-hint: ""
disable-model-invocation: true
---

# Clear Screenshots

This skill came from the template project and has no cleanup procedure for this repo yet. Screenshots here live in
task directories (an `outputs/` child under `.claude/temp/workspace/tasks/`), and root `AGENTS.md` §Temporary work
(Codex and Claude Code) owns their cleanup: clean only a recorded task directory, never a shared parent, because
other sessions keep evidence there. When Kevin invokes this skill, tell him it isn't set up, list the screenshot
locations you find, and delete only what he confirms. A fuller version lives in
`../NextJs-SkarAudioV3/.claude/skills/clear-screenshots/`; port it here only when he asks.
