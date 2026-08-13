# Project Overview

TanStack Start / React 19 / FSD template repository. Includes a domain-agnostic sample compatibility-check feature (under `/sample/match`, all slices prefixed `sample-`) demonstrating the FSD layer conventions — no external API dependency, safe to delete wholesale when building a real app on top of this template.

# Setup and Basic Usage

Setup instructions and basic usage are documented in [README.md](./README.md).

# Work Rules
1. Propose implementation plan
2. Wait for approval
3. Start implementation

# Tool Usage Policy
**Prefer dedicated tools for file operations by default** (not enforced via `permissions.deny` — occasional Bash use is fine when it's genuinely more convenient):
- `ls`, `find` → `Glob` tool
- `cat`, `head`, `tail` → `Read` tool
- `grep` → `Grep` tool
- `sed`, `awk` → `Edit` tool
- File writing → `Write` tool
- `curl` → `WebFetch` tool## Task Runner

# Coding Standards

@.claude/rules/workflow.md
@.claude/rules/architecture.md
@.claude/rules/typescript.md
@.claude/rules/server-functions.md
@.claude/rules/naming.md
@.claude/rules/styling.md

# Language Settings
- Responses: `.claude/settings.json` - `language`
- Thinking: English (for token reduction)
