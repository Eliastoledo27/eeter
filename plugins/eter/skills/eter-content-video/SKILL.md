---
name: eter-content-video
description: "Éter content, Remotion, Hyperframes, ads, reels, and brand video production guide. Use when creating or editing videos, motion assets, social ads, and visual campaigns."
---

# Éter Content And Video

## Video Locations

- Remotion components: `src/remotion/`.
- Main Remotion/video project: `videos/premium-footwear-ad60/`.
- Rendered Éter ecosystem reel: `videos/premium-footwear-ad60/renders/eter-ecosystem-reel.mp4`.
- Hyperframes and prior reels: `videos/eter-*`.

## Remotion Pattern

Use the Remotion skill when editing video code.

Typical checks:

```powershell
npx tsc --noEmit
npx remotion still src/Root.tsx <CompositionId> renders/<frame>.png --frame=30 --scale=0.5
npx remotion render src/Root.tsx <CompositionId> renders/<output>.mp4 --codec=h264 --crf=23 --audio-codec=aac --concurrency=1
```

Use `--concurrency=1` on this machine to avoid memory crashes.

## Brand Assets

Primary:

- `public/logo.png`
- `public/hero.png`
- `public/zapa_cat.png`
- `public/design/*`
- `public/audio/hiphop.mp3`
- `public/audio/vos_y_la_mancha.mp3`
- `public/audio/tezeta.mp3`

Copied into video project when needed:

- `videos/premium-footwear-ad60/public/assets/eter/`

## Content Direction

Éter video should feel:

- dark premium
- urban
- energetic
- system-aware
- commercial but not generic

Good themes:

- Brand + catalog + FÉter Stock + Supabase + reseller flow.
- Product drops, liquidation, flash offers.
- Revendedor onboarding.
- Behind-the-system operational videos.
- `@éter` plugin / AI operating layer.

## Output Preference

Default social format:

- 1080x1920
- 30 fps
- 20-35 seconds for quick reels
- H.264 MP4

Use direct local asset paths through `staticFile()`.
