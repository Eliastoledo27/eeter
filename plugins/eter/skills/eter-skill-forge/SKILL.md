---
name: eter-skill-forge
description: "Eter-specific skill and plugin creation workflow. Use when creating, repairing, upgrading, validating, packaging, or documenting Eter agent skills, Codex plugins, marketplace entries, plugin manifests, skill manifests, or reusable agent procedures for future Eter editing."
---

# Eter Skill Forge

Use this skill when Eter needs durable agent memory: new skills, plugin capabilities, marketplace metadata, or repairs to existing `.agents/skills/` and `plugins/` content.

## Quick Start

1. Read the system `skill-creator` or `plugin-creator` skill requested by the user, then use this Eter layer for repo-specific choices.
2. Prefer updating `plugins/eter` for Eter operating memory and `plugins/eter-antigravity-toolkit` for Antigravity/Gemini-oriented workflows.
3. For repo-global skills, update `.agents/skills/` and `.agents/skills/SKILL_MANIFEST.md` only when the skill should be available outside the plugin.
4. For plugin-backed skills, create them under `plugins/eter/skills/<skill-name>/`.
5. Validate every changed skill/plugin before finishing.

## Skill Creation Rules

- Use lowercase hyphen-case names under 64 characters.
- Start from `python .agents\skills\skill-creator\scripts\init_skill.py <name> --path <target>`.
- Keep `SKILL.md` concise and procedural; put larger maps, schemas, and examples in `references/`.
- Include scripts only when they prevent repeated manual work or provide deterministic checks.
- Do not leave TODO placeholders.
- Keep frontmatter to `name` and `description`.
- Create `agents/openai.yaml` with display name, short description, and a useful default prompt.

## Plugin Creation Rules

- Use `plugins/eter` for the main Eter complement unless the user explicitly asks for a new separate plugin.
- Keep `.codex-plugin/plugin.json` aligned with actual folders. Include `skills` only when a skills folder exists.
- Keep marketplace entries in `.agents/plugins/marketplace.json` with `policy.installation`, `policy.authentication`, and `category`.
- Avoid removing existing plugin entries or changing install policy unless requested.
- Validate with the system plugin validator after manifest edits.

## Eter Memory Policy

Add durable knowledge when it meets at least one condition:

- It prevents a repeated Eter bug or build failure.
- It captures a stable schema, route, brand rule, deployment rule, or catalog rule.
- It improves future routing when the user says "Eter" without naming files.
- It turns a fragile manual sequence into a script or focused checklist.

Do not add transient task notes, one-off implementation details, or secrets.

## References

- Read `references/eter-skill-plugin-standards.md` before creating or repairing Eter skills/plugins.
- Run `scripts/eter_skill_audit.py <path>` to catch TODOs, missing frontmatter, and missing UI metadata.
