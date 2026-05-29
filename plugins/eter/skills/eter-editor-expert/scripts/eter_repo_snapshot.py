#!/usr/bin/env python3
"""Print a compact Eter repo snapshot for routing broad edit requests."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[5]


def run(args: list[str]) -> str:
    try:
        return subprocess.check_output(args, cwd=ROOT, text=True, stderr=subprocess.DEVNULL).strip()
    except Exception:
        return ""


def list_dirs(path: str) -> list[str]:
    target = ROOT / path
    if not target.exists():
        return []
    return sorted(p.name for p in target.iterdir() if p.is_dir() and p.name not in {"node_modules", ".next", ".git"})[:80]


def main() -> None:
    package_path = ROOT / "package.json"
    package = json.loads(package_path.read_text(encoding="utf-8")) if package_path.exists() else {}
    status = run(["git", "status", "--short"])
    changed = [line for line in status.splitlines() if line.strip()]

    print("Eter repo snapshot")
    print(f"root: {ROOT}")
    print(f"package: {package.get('name', 'unknown')} {package.get('version', '')}".strip())
    print(f"node engine: {package.get('engines', {}).get('node', 'unspecified')}")
    print(f"changed files: {len(changed)}")
    if changed[:12]:
        print("changed sample:")
        for line in changed[:12]:
            print(f"  {line}")
    print("top src app routes:", ", ".join(list_dirs("src/app")[:30]))
    print("components:", ", ".join(list_dirs("src/components")[:30]))
    print("plugins:", ", ".join(list_dirs("plugins")))
    print("local skills:", ", ".join(list_dirs(".agents/skills")[:30]))


if __name__ == "__main__":
    main()
