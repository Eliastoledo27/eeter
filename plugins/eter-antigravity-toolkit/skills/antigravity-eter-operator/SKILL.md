---
name: antigravity-eter-operator
description: "Operate the Eter repository inside Google Antigravity or another SKILL.md-aware agent environment. Use when preparing, routing, validating, or professionalizing Eter skills, AGENTS.md/GEMINI.md instructions, local plugin metadata, or multi-skill execution plans."
---

# Antigravity Eter Operator

## Overview

Use this skill as the operational bridge between Antigravity and the local Eter skill library. It keeps agent work tied to project rules, selected skills, and validation steps without loading the entire skill tree into context.

## Quick Start

1. Read repo root `AGENTS.md`.
2. Read repo root `GEMINI.md` when running inside Antigravity or Gemini tooling.
3. Read `.agents/skills/SKILL_MANIFEST.md` for the available local skills.
4. Select the smallest relevant skill set for the task.
5. Read each selected `SKILL.md` and only then load any referenced resource files.
6. Execute the task, validate the result, and update reusable skill or plugin files when the new knowledge should persist.

## Skill Routing

- For Eter architecture, brand, and product decisions, use `.agents/skills/eter_mastery/SKILL.md`.
- For new or repaired skills, use `.agents/skills/skill-creator/SKILL.md`.
- For plugin scaffolds, manifests, and marketplace metadata, use `.agents/skills/plugin-creator/SKILL.md`.
- For code quality automation, use `.agents/skills/code_quality_automation/SKILL.md`.
- For performance work, use `.agents/skills/performance_optimization/SKILL.md`.
- For UI work, combine the relevant design skill with accessibility and component catalog skills.

## Antigravity Discipline

- Keep `AGENTS.md`, `GEMINI.md`, `.agents/skills/`, and `plugins/eter-antigravity-toolkit/` aligned.
- Preserve user work and avoid broad rewrites.
- Prefer concrete file inspection over assumptions.
- Validate with the narrowest meaningful command before finishing.
- Convert repeated procedures into skills, not scattered notes.

## References

- Read `references/antigravity-integration.md` when setting up this repository in Antigravity for the first time or when repairing skill discovery.
