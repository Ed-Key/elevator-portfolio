# Showdown Copilot Stage Backdrop (+ Media Ladder `backdrop` Tier)

**Date:** 2026-07-08
**Status:** Approved by Eddie (Approach A of three; brainstormed in chat)

## Concept

When Showdown Copilot takes the Projects stage, its demo teaser plays as a
dimmed, ambient background filling the open center region between the eight
ring cells. It reads as texture, never as a second video player. On top of
it, the framed window plays the full product demo, and everything readable
sits on a frosted glass panel strong enough that legibility never depends
on what frame the background is showing.

The mechanism is general: the media ladder gains a `backdrop` tier that any
project can adopt with a one-line config edit once it has footage. Showdown
Copilot is the first adopter.

## Layer model (back to front)

1. **Backdrop**: dimmed teaser loop, fills `.panel-stage`, dissolves into
   the void at its edges. Only rendered when the staged project defines
   `media.backdrop` and the visitor allows motion.
2. **Window** (`.stage-show__window`): the existing framed browser-chrome
   window. For Showdown it plays the full 87s walkthrough, muted, looping.
3. **Poster**: `showdown-dashboard.png` lives inside the window as the
   video's `poster` attribute. It covers buffering time and is what
   reduced-motion visitors see instead of the video. It is never a separate
   element beside the video.
4. **Text tier** (`.stage-show__text`): name, tech glyphs, caps line,
   action buttons, on a frosted blur shield (only when a backdrop is
   active).

## Config (`src/config/portfolioContent.js`)

Showdown Copilot's media entry becomes:

```js
media: {
  video: '/media/projects/showdown-demo.mp4',      // full walkthrough, audio stripped
  poster: '/media/projects/showdown-dashboard.png', // command center still
  logo: null,
  model: null,
  backdrop: '/media/projects/showdown-teaser.mp4',  // dimmed ambient loop
},
```

- `backdrop` is the one new ladder field. Documented in the media comment
  block alongside video/poster/logo/model.
- The architecture diagram (`showdown-copilot-poster.svg`) stays on disk
  but leaves the ladder.
- `status: 'private'` and empty `links` are unchanged. The cell still
  blinks and refuses on press.

## Backdrop component (`src/components/ProjectsPanel.jsx`)

New `StageBackdrop({ src })`, mounted directly inside `.panel-stage`
(sibling of `ProjectStage` / `IdlePlate`), rendered only when
`activeProject.media.backdrop && !reducedMotion`:

- `<video autoPlay loop muted playsInline>` keyed by project id, absolutely
  positioned to fill the stage, `object-fit: cover`.
- `playbackRate = 0.75` set via ref on mount, so the ambience moves slower
  than the source footage.
- Fades in over ~600ms after the first frame is ready (same `is-ready`
  pattern as `StageModel`); unmounts when the stage moves to a project
  without a backdrop or goes idle.
- Sits at `z-index: 0` under the existing `.panel-stage > * { z-index: 1 }`
  content (the stage already has `isolation: isolate`, so no new stacking
  context leaks out).

## Dimming (`src/components/ProjectsPanel.css`)

Three stacked treatments, each tunable independently:

1. Filter on the video element: starting values
   `brightness(0.32) saturate(0.65)`. The teaser is mostly the light
   Showdown UI, so brightness does the heavy lifting.
2. A scrim overlay above the video: dark fill tinted with the floor's
   existing gold radial (`rgb(240 200 112)` family) so the footage sits in
   the same atmosphere as the stage glow.
3. A radial mask on the backdrop container so the footage dissolves to
   transparent before reaching the ring cells: roughly
   `mask: radial-gradient(ellipse at 50% 50%, black 55%, transparent 80%)`.
   No hard rectangle edges anywhere.

Exact numbers land during implementation against live screenshots.

## Frosted text shield

- `ProjectStage` adds a `stage-show--backdropped` modifier when the
  backdrop actually renders (project has one AND motion is allowed), so
  reduced-motion visitors never get a frosted panel with nothing behind it.
- Under it, `.stage-show__text` gains: dark translucent fill
  (`rgb(12 10 18 / ~45%)`), `backdrop-filter: blur(32px)` (with `-webkit-`
  prefix), rounded corners, comfortable padding, and a faint gold hairline
  border consistent with the cells' engraved look.
- Projects without a backdrop render exactly as today. The blur may be
  tuned stronger; readability wins every tradeoff.

## Assets (`public/media/projects/`)

Sources live in `~/Projects/pokemon-ai/showdown-stack/docs/media/`.

| Output | Source | Treatment |
| ------ | ------ | --------- |
| `showdown-teaser.mp4` | `demo-teaser.gif` (950x617, 1.8MB) | ffmpeg gif to h264 mp4, no audio, yuv420p, target well under 1MB |
| `showdown-demo.mp4` | `demo.mp4` (1600x992, 87s, 6.2MB) | copy with audio stripped (`-an`); re-encode only if it wins meaningful bytes |
| `showdown-dashboard.png` | `dashboard.png` (1600px) | compress to poster weight (lossless or near-lossless; keep the gold crisp) |

The demo video loads only when Showdown is staged (existing behavior: only
the active project's video is ever mounted).

## Reduced motion and fallbacks

- Reduced motion: no backdrop at all, window shows the dashboard poster.
  Matches the existing video-tier policy.
- The mobile/narrow accordion layout has no `.panel-stage`; backdrop is a
  desktop-stage treatment only. The accordion's expanded window still plays
  the demo video as it does for any project with video.
- If the backdrop video fails to load, the fade-in never triggers and the
  stage simply looks as it does today.

## Verification

- Throwaway probe (`scripts/tmp-*.mjs`, gitignored) against the dev server:
  stage Showdown, assert the backdrop video is mounted with advancing
  `currentTime`, the `stage-show--backdropped` class is present, the window
  video is playing, and hovering away to a backdrop-less project unmounts
  the backdrop. Screenshot for the eyeball check.
- Re-run `scripts/verify-projects-floor.mjs` (all 9 checks) to confirm the
  floor still behaves.
- Reduced-motion pass via Playwright's `reducedMotion: 'reduce'` emulation:
  no backdrop mounts, poster shows in the window.

## Out of scope

- Backdrops for other projects (the field exists; footage does not yet).
- Publishing the showdown-stack repo or adding Showdown links.
- Any change to cells, capacity plate, idle constellation, or snap scroll.
