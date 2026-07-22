# Cab Timer design

Date: 2026-07-22
Branch: `feat/cab-timer` (worktree `.claude/worktrees/pitch-timer`, PRs into `dev`)

## Purpose

A decorative 30 second countdown inside the portfolio modal. It simulates
the elevator pitch premise (you have 30 seconds of my visitor's attention)
without saying so anywhere. It does nothing functional: no navigation, no
gating, no sound. It is theater.

## Behavior

- Starts at `0:30` when the portfolio modal content is shown, counting down
  to `0:00`.
- Timing is driven by a start timestamp captured on mount, rendered via
  `requestAnimationFrame` (or a 250ms interval reading the timestamp), so
  displayed seconds track real elapsed time instead of accumulating
  interval drift. A backgrounded tab therefore skips ahead on return,
  which fits the fiction: real seconds passed.
- At zero it holds `0:00` for about 1 second, then fades out over about
  1.5 seconds (opacity transition) and stops rendering its visuals.
- The component mounts and unmounts with the modal, so every open of the
  portfolio restarts the countdown at `0:30`. No session persistence.

## Placement

Rendered inside `site-header` in `PortfolioModal.jsx`, right aligned
opposite the "Edward Kiboma" brand, like the position indicator above an
elevator cab door. `PortfolioModal.jsx` changes by one placement line
(plus import); everything else lives in the new component.

## Look

- Seven segment LED digits rendered as inline SVG. Each digit draws all
  seven segments; lit segments glow warm amber (tuned to the hall's
  lighting palette, not alarm red), unlit segments remain as faint ghost
  segments the way a dark LED shows its off segments.
- Format `M:SS` (`0:30` down to `0:00`), colon rendered as two small
  lit dots in the same style.
- The readout sits on a near black inset "display window" so it reads as
  cab hardware, sized small enough not to compete with the brand.
- No label text of any kind on or near the timer.

## Components

- `src/components/CabTimer.jsx`: self contained component owning the
  countdown state, the SVG digit rendering, and the fade out lifecycle.
- `src/components/CabTimer.css`: display window, glow, ghost segments,
  fade transition.
- `src/components/PortfolioModal.jsx`: one line to place `<CabTimer />`
  in the header.

Digit rendering choice: SVG over a seven segment font (avoids bundling a
font file for four glyphs and makes ghost segments trivial) and over
styled numerals (which read as glowing text, not an elevator fixture).

## Accessibility

- Purely decorative: the whole component is `aria-hidden="true"` and is
  skipped by assistive tech.
- The fade is an opacity transition only, safe under
  `prefers-reduced-motion`; the once per second digit change is content
  update, not motion.

## Error handling

None needed beyond lifecycle hygiene: cancel the animation frame or
interval and any pending timeouts on unmount so closing the modal mid
countdown leaks nothing.

## Verification

No test suite in this repo. `npm run lint && npm run build`, then a
browser pass (`npm run dev`): open the portfolio, watch a full 0:30 to
0:00 run and fade, close and reopen to confirm the restart, and check
the header layout at narrow widths. Before/after media per the PR
template.
