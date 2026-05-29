# Antigravity Integration

## Repository Anchors

- `AGENTS.md` is the shared root policy for SKILL.md-aware coding agents.
- `GEMINI.md` mirrors the Antigravity/Gemini-specific load order.
- `.agents/skills/` contains the local skill library for this repository.
- `plugins/eter-antigravity-toolkit/` packages the professional Antigravity workflow as a repo-local plugin.

## Setup Check

1. Open the repository root in Antigravity.
2. Confirm the agent can see `AGENTS.md` and `GEMINI.md`.
3. Ask the agent to list `.agents/skills` by skill name and description only.
4. Ask the agent to use one specific skill by path before a real task.
5. If skill discovery fails, invoke `.agents/skills/skill-creator/SKILL.md` directly by path and repair frontmatter.

## Maintenance Rules

- Keep skill frontmatter concise and trigger-focused.
- Keep detailed workflows in `references/` files.
- Keep reusable scripts inside a skill's `scripts/` folder.
- Keep plugin UI and marketplace metadata in sync after plugin changes.
- Validate edited skills with the `skill-creator` quick validator when naming rules allow it.

