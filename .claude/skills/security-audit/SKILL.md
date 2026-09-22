---
name: security-audit
description: Comprehensive security audit - checks settings, prompt injection vectors, credential exposure, and session integrity. Placeholder, not set up in this repo yet.
argument-hint: "[quick|full]"
disable-model-invocation: true
---

# Security Audit

This skill came from the template project and has no audit procedure for this repo yet. When Kevin invokes it,
tell him that. A review of application code belongs to the `security-reviewer` agent, and this repo's session
defenses are in `.claude/rules/security-hardening.md`. A working harness audit, with the evidence-handling rules
that keep credentials out of its report, lives in `../NextJs-SkarAudioV3/.claude/skills/security-audit/`; port it
here only when he asks.
