# Eter Antigravity Instructions

This repository is prepared for Google Antigravity and other Gemini-based agent workflows.

## Load Order

1. Read `AGENTS.md` for the shared operating policy.
2. Read `.agents/skills/SKILL_MANIFEST.md` to understand the available skill ecosystem.
3. Select only the skills that match the task.
4. Read each selected `SKILL.md` before using its bundled resources.

## Required Local Skills

- Use `.agents/skills/eter_mastery/SKILL.md` for Eter project decisions.
- Use `.agents/skills/skill-creator/SKILL.md` for skill creation, repair, validation, and packaging.
- Use `.agents/skills/plugin-creator/SKILL.md` for plugin scaffolding and marketplace metadata.
- Use `plugins/eter-antigravity-toolkit/skills/antigravity-eter-operator/SKILL.md` when operating the full Eter skill system from Antigravity.

## Execution Standards

- Prefer small, reversible edits.
- Never overwrite user work without explicit instruction.
- Validate code changes with the repo's scripts in `package.json` when relevant.
- Keep new reusable agent knowledge inside `.agents/skills/` or `plugins/eter-antigravity-toolkit/`.
- Keep generated or local-only outputs out of normal app source unless they are explicitly part of the deliverable.

