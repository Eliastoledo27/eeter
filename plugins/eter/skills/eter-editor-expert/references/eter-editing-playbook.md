# Eter Editing Playbook

## Broad Request Flow

1. Convert the user request into the smallest affected surface.
2. Load `eter-context` and one domain skill.
3. Inspect current implementation and nearby tests/data contracts.
4. Make scoped edits.
5. Run targeted validation.
6. Add durable lessons to `plugins/eter` only when they will help future Eter work.

## UI Flow

- Check the first viewport, mobile layout, and repeated states.
- Prefer dense, useful commerce surfaces over marketing filler.
- Use existing UI primitives and icon libraries.
- Keep cards functional, not decorative; avoid nested cards.
- Make product/place/brand visible early when the screen is public-facing.

## Data Flow

- Start from actual schema and migrations.
- Check both reads and writes.
- Treat arrays, JSONB, and RPC response shapes carefully.
- For admin flows, confirm the UI only reports success after the backend response proves success.

## Agent Memory Flow

- If the task reveals a stable rule, place it in the most specific Eter skill.
- If the rule spans many domains, place it in `eter-context`.
- If it is about creating future skills/plugins, place it in `eter-skill-forge`.
