# HyperFrames and Remotion Skills Plan

Updated: 2026-05-15

## Purpose

This document defines the skill stack, evaluation criteria, production metrics, and continuous training plan for improving HyperFrames and Remotion usage in Eter production workflows.

The goal is to standardize high-quality video generation practices across HTML/GSAP-based HyperFrames compositions and React/Remotion programmatic video workflows.

## Selected Skills

| Priority | Skill | Source | Why selected | Adoption |
| --- | --- | --- | --- | --- |
| P0 | `heygen-com/hyperframes@hyperframes` | https://skills.sh/heygen-com/hyperframes/hyperframes | Official HyperFrames skill. Strong fit for HTML video composition, timelines, captions, voiceovers, audio-reactive visuals, scene transitions, layout discipline, and quality gates. | Use immediately. Already available through the installed HyperFrames plugin cache. |
| P0 | `heygen-com/hyperframes@hyperframes-cli` | https://skills.sh/heygen-com/hyperframes/hyperframes-cli | Official CLI workflow for scaffold, lint, inspect, preview, render, transcribe, TTS, doctor, benchmark, and troubleshooting. | Use immediately for all HyperFrames production work. |
| P0 | `heygen-com/hyperframes@gsap` | https://skills.sh/heygen-com/hyperframes/gsap | Official GSAP reference for HyperFrames animation. Covers timelines, easing, stagger, transforms, performance, and animation cleanup. | Use whenever writing or reviewing HyperFrames animation. |
| P0 | `remotion_video_generator` | Local repo skill | Existing Eter-specific Remotion skill aligned to premium product videos, Reels/Stories output, Remotion Player previews, CLI rendering, and Windows memory constraints. | Keep as the project baseline. |
| P1 | `supercent-io/skills-template@remotion-video-production` | https://skills.sh/supercent-io/skills-template/remotion-video-production | Strong install signal for Remotion production workflows. Useful as a broader production companion to the local Eter Remotion skill. | Candidate for installation after review. |
| P1 | `inference-sh-skills/skills@remotion-render` | https://skills.sh/inference-sh-skills/skills/remotion-render | High install signal for Remotion rendering workflows. Useful if the team needs render automation beyond local CLI conventions. | Candidate for targeted render-pipeline review. |
| P2 | `sickn33/antigravity-awesome-skills@remotion-best-practices` | https://skills.sh/sickn33/antigravity-awesome-skills/remotion-best-practices | Relevant Remotion best-practices result, but lower direct install signal than the P1 Remotion production candidates. | Optional reference only. |
| P2 | `nexu-io/open-design@hyperframes` and `nexu-io/open-design@remotion` | https://skills.sh/nexu-io/open-design/hyperframes | Useful design-production references, but lower direct install counts for these specific skills. | Use only if design-system integration becomes the focus. |

## Search and Verification Notes

External skill search was performed with:

- `skills find hyperframes --limit 10`
- `skills find hyperframes cli render inspect --limit 10`
- `skills find remotion --limit 10`
- `skills find remotion production render optimization --limit 10`
- `skills find video production animation react --limit 10`

Current selection favors skills with:

- Official source or source strongly tied to the tool.
- Clear production workflow coverage.
- High install count where available.
- Repository reputation or clear operational fit.
- Compatibility with the existing Eter skill ecosystem.

## Technical and Functional Requirements

### HyperFrames Baseline

Team members should be able to:

- Create a composition from a defined visual identity, using `DESIGN.md` or an explicit style brief before writing HTML.
- Author composition structure with correct `data-composition-id`, `data-start`, `data-duration`, `data-track-index`, and media attributes.
- Separate muted video from audio tracks.
- Build final static layout first, then animate into that layout.
- Register GSAP timelines synchronously through `window.__timelines`.
- Use finite repeats instead of `repeat: -1`.
- Avoid `Math.random()`, `Date.now()`, async timeline construction, and direct media playback calls.
- Add entrance animations to every scene and transitions between scenes.
- Run `npx hyperframes lint`, `npx hyperframes validate`, and `npx hyperframes inspect` before final render.
- Use `npx hyperframes doctor`, `info`, and `benchmark` for environment or performance issues.

### HyperFrames Advanced

Advanced users should be able to:

- Design multi-scene timelines with readable labels and non-conflicting animation properties.
- Use GSAP transforms, stagger, easing variation, and timeline position parameters intentionally.
- Produce captions, subtitles, TTS narration, and audio-reactive visuals.
- Prevent text overflow with responsive CSS and `window.__hyperframes.fitTextFontSize`.
- Use animation maps to inspect choreography, collisions, invisible elements, dead zones, and pacing.
- Choose render settings by delivery stage: draft, standard, high, MP4, WebM, GPU, Docker, strict mode.

### Remotion Baseline

Team members should be able to:

- Define Remotion compositions with clear `id`, `durationInFrames`, `fps`, `width`, `height`, and `defaultProps`.
- Use `useCurrentFrame`, `useVideoConfig`, `spring`, and `interpolate` for deterministic animation.
- Integrate `@remotion/player` for internal previews.
- Render with the CLI using explicit composition IDs and output paths.
- Maintain fixed delivery formats such as 1080x1920 at 30fps for Reels and Stories.
- Use `--concurrency=1` on Windows or memory-constrained environments when needed.
- Avoid infinite CSS animations and nondeterministic runtime behavior.

### Remotion Advanced

Advanced users should be able to:

- Build reusable, typed React composition components.
- Define validated input props for catalog-driven video generation.
- Optimize image/video assets before render.
- Profile render performance and isolate slow frames or heavy assets.
- Design preview-to-render parity checks between `@remotion/player` and CLI output.
- Create repeatable export conventions for marketing, product, and reseller variants.

## Candidate Evaluation Criteria

Each external skill or team member competency should be evaluated with this rubric:

| Area | Weight | Evidence |
| --- | ---: | --- |
| Tool specificity | 25% | Direct HyperFrames or Remotion coverage rather than generic video advice. |
| Production proof | 20% | Real project usage, examples, CLI workflows, render guidance, or install signal. |
| Best practices | 20% | Determinism, validation, layout checks, accessibility, media handling, and performance discipline. |
| Integration value | 15% | Fits Eter workflows, Next.js, catalog media, social exports, and premium brand output. |
| Maintainability | 10% | Clear conventions, reusable patterns, low ambiguity, and reviewable outputs. |
| Trust signal | 10% | Official source, reputable repository, active maintenance, or high adoption. |

Recommended adoption threshold:

- `85+`: Adopt as standard.
- `70-84`: Adopt for a specific workflow with review.
- `50-69`: Use as reference only.
- `<50`: Do not adopt.

## Production Quality Metrics

Track these metrics per video/composition:

| Metric | Target |
| --- | --- |
| HyperFrames lint result | 0 errors before preview or render. |
| HyperFrames inspect result | 0 unreviewed overflow/collision issues. |
| Contrast warnings | 0 unresolved warnings for production assets. |
| Render success rate | 95%+ successful renders without manual intervention. |
| Re-render rate caused by layout/text bugs | Reduce by 50% after two training cycles. |
| Average draft render turnaround | Baseline, then reduce by 20%. |
| Average final render turnaround | Baseline, then reduce by 15%. |
| Preview-to-final discrepancy | 0 critical mismatches. |
| Reusable component coverage | 70%+ of repeated video sections implemented as reusable templates/components. |
| Review checklist completion | 100% before final delivery. |

## Standard Production Workflow

1. Define brief: objective, audience, format, duration, CTA, required media, brand constraints.
2. Select tool:
   - HyperFrames for HTML/GSAP video, kinetic typography, captions, voiceover, audio-reactive visuals, and fast agent-authored compositions.
   - Remotion for React-driven programmatic video, catalog variants, preview components, and typed data-driven rendering.
3. Define visual identity before composition work.
4. Build static hero frames and layout.
5. Add deterministic animation.
6. Run local preview.
7. Run quality gates:
   - HyperFrames: `lint`, `validate`, `inspect`, optional animation map.
   - Remotion: typecheck, focused component checks, preview render, CLI render.
8. Render draft.
9. Review video for text safety, timing, brand fidelity, audio sync, CTA clarity, and compression artifacts.
10. Render final and archive source, input data, and output metadata.

## Continuous Training Plan

### Week 1: Foundations

- HyperFrames composition model, `data-*` timing, tracks, media rules, and CLI workflow.
- Remotion composition model, frames, FPS, props, `spring`, `interpolate`, and CLI rendering.
- Exercise: recreate one 5-second Eter product promo in both tools.

### Week 2: Layout and Motion Discipline

- Layout-before-animation practice.
- GSAP timelines, labels, stagger, easing variation, and transform-only animation.
- Remotion animation primitives and deterministic motion.
- Exercise: create a three-scene vertical story with transitions and no text overflow.

### Week 3: Production Quality Gates

- HyperFrames `lint`, `validate`, `inspect`, `doctor`, `benchmark`.
- Remotion preview-to-render checks, memory controls, asset optimization.
- Exercise: fix a deliberately flawed composition until all gates pass.

### Week 4: Advanced Media Workflows

- Captions, TTS, audio-reactive visuals, product media, reusable templates, and data-driven variants.
- Exercise: generate three catalog-driven variants from one source template.

### Ongoing Monthly Practice

- Review one shipped video and one failed/slow render.
- Update reusable templates and checklists.
- Re-run `skills find hyperframes remotion video production` to detect new candidate skills.
- Compare render metrics month over month.

## Installation Recommendations

Already available locally:

- `find-skills`
- `remotion_video_generator`
- HyperFrames plugin skills: `hyperframes`, `hyperframes-cli`, `gsap`

Recommended optional installs:

```bash
skills add supercent-io/skills-template --skill remotion-video-production -g -y
skills add inference-sh-skills/skills --skill remotion-render -g -y
```

Install optional skills only after reviewing their `SKILL.md` files and confirming they add value beyond the local Eter Remotion baseline.
