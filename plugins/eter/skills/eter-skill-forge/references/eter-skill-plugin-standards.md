# Eter Skill And Plugin Standards

## Placement

- Main Eter plugin: `plugins/eter`.
- Eter plugin skills: `plugins/eter/skills/<skill-name>/`.
- Antigravity/Gemini workflow plugin: `plugins/eter-antigravity-toolkit`.
- Repo-global skills: `.agents/skills/<skill-name>/`.
- Repo marketplace: `.agents/plugins/marketplace.json`.

## Required Skill Shape

- `SKILL.md` with YAML frontmatter containing only `name` and `description`.
- `agents/openai.yaml` with `interface.display_name`, `short_description`, and `default_prompt`.
- Optional `references/` for durable detail.
- Optional `scripts/` for repeatable checks.
- No TODO placeholders in finished skills.

## Required Plugin Shape

- `.codex-plugin/plugin.json` with matching folder/name.
- `skills` field only when `skills/` exists.
- `interface` metadata should make the plugin recognizable in Codex.
- Marketplace entry should use local source path `./plugins/<plugin-name>`.

## Validation Commands

- Skill: `python .agents\skills\skill-creator\scripts\quick_validate.py <skill-path>`.
- Plugin: `python C:\Users\Admin\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py <plugin-path>`.
- Audit helper: `python plugins\eter\skills\eter-skill-forge\scripts\eter_skill_audit.py <skill-or-plugin-path>`.

## Upgrade Heuristics

- Add a new skill only when routing or repeated execution improves.
- Update an existing skill when the knowledge belongs to a current domain.
- Add a script when the same check would otherwise be manually re-created.
- Keep skill bodies short; move maps and examples into references.
