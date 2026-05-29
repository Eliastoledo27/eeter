# Eter Agent Operating Guide

Use this file as the shared root instruction layer for Antigravity, Codex, Gemini CLI, and other AGENTS.md-aware tools working in this repository.

## Project Context

- Product: Eter Store, a premium commerce and content system built on Next.js, Supabase, Tailwind CSS, and AI-assisted workflows.
- Primary app code lives in `src/`.
- Local reusable agent skills live in `.agents/skills/`.
- Repo-local plugin scaffolds live in `plugins/`.
- Treat `.env*`, deployment output, generated build folders, and `node_modules/` as local-only artifacts.

## Skill Loading Protocol

1. Before substantial work, inspect `.agents/skills/SKILL_MANIFEST.md` and select the smallest useful set of skills.
2. For a named skill, read only `.agents/skills/<skill>/SKILL.md` first.
3. Load `references/`, `scripts/`, or `assets/` inside a skill only when the task needs that detail.
4. Prefer the repo-local `skill-creator` skill when creating or repairing skills.
5. Prefer the repo-local `plugin-creator` skill when creating or repairing plugins.
6. Do not bulk-load every skill body into context. Use frontmatter names and descriptions as the routing layer.

## Core Skills

- `.agents/skills/eter_mastery/SKILL.md`: Eter architecture, product rules, and brand defaults.
- `.agents/skills/autonomous_planning_flow/SKILL.md`: Decompose large tasks and keep execution ordered.
- `.agents/skills/code_quality_automation/SKILL.md`: Run focused quality checks before finishing code changes.
- `.agents/skills/git_flow_excellence/SKILL.md`: Use disciplined branch, diff, and commit hygiene.
- `.agents/skills/skill-creator/SKILL.md`: Create, update, validate, and package agent skills.
- `.agents/skills/plugin-creator/SKILL.md`: Scaffold and maintain Codex-style local plugins.

## Engineering Rules

- Preserve user changes. Do not reset, checkout, or delete unrelated work.
- Use existing patterns before adding new abstractions.
- Keep edits scoped to the requested behavior.
- Validate with the narrowest meaningful command first, then broader checks when risk justifies it.
- For frontend work, verify responsive layout and avoid overlapping text, oversized decorative cards, and one-color themes.
- For database or auth changes, inspect schema, RLS policies, and call sites before editing.

## Antigravity Workflow

- Start each task by identifying the relevant files and skills.
- State the intended plan briefly before large edits.
- Keep artifacts discoverable in the repo: update skills, plugin metadata, or manifests when adding reusable procedures.
- Use `GEMINI.md` as the Antigravity/Gemini-specific mirror of this root policy.
- Use `plugins/eter-antigravity-toolkit/` as the local plugin package for professionalized Antigravity operation.

