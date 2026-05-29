#!/usr/bin/env python3
"""Audit an Eter skill or plugin folder for common packaging mistakes."""

from __future__ import annotations

import json
import sys
from pathlib import Path


def fail(message: str) -> None:
    print(f"FAIL: {message}")
    raise SystemExit(1)


def audit_skill(path: Path) -> None:
    skill = path / "SKILL.md"
    if not skill.exists():
        fail(f"missing SKILL.md in {path}")
    text = skill.read_text(encoding="utf-8")
    if "[TODO:" in text:
        fail(f"TODO placeholder remains in {skill}")
    if not text.startswith("---\n"):
        fail(f"missing YAML frontmatter in {skill}")
    frontmatter = text.split("---", 2)[1]
    if "name:" not in frontmatter or "description:" not in frontmatter:
        fail(f"frontmatter must include name and description in {skill}")
    openai = path / "agents" / "openai.yaml"
    if not openai.exists():
        fail(f"missing agents/openai.yaml in {path}")
    print(f"OK skill: {path}")


def audit_plugin(path: Path) -> None:
    manifest = path / ".codex-plugin" / "plugin.json"
    if not manifest.exists():
        fail(f"missing .codex-plugin/plugin.json in {path}")
    data = json.loads(manifest.read_text(encoding="utf-8"))
    if data.get("name") != path.name:
        fail(f"plugin name {data.get('name')!r} must match folder {path.name!r}")
    if "skills" in data and not (path / str(data["skills"]).replace("./", "")).exists():
        fail("plugin manifest points to missing skills folder")
    print(f"OK plugin: {path}")


def main() -> None:
    if len(sys.argv) != 2:
        fail("usage: eter_skill_audit.py <skill-or-plugin-path>")
    path = Path(sys.argv[1]).resolve()
    if not path.exists():
        fail(f"path does not exist: {path}")
    if (path / ".codex-plugin").exists():
        audit_plugin(path)
    else:
        audit_skill(path)


if __name__ == "__main__":
    main()
