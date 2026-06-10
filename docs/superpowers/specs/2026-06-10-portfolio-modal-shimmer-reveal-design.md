# Portfolio Modal — Shimmer Reveal Design

**Date:** 2026-06-10
**Status:** Approved by Eddie (implementation green-lit; animation feel to be polished together in the Lighting Lab)

## Concept

After the elevator ride settles at the inside shot and the shimmer sweeps the
mirror, the shimmer "comes back" — enlarged, in screen space — sweeping across
the entire viewport from top-left to bottom-right. Its sweep wipes in the
portfolio website behind it. The fullscreen shimmer belongs to the modal layer
(DOM/CSS), not the 3D shader plane. The mirror's shimmer and the modal's
shimmer travel in opposite directions, connecting the 3D world to the website.

## Experience flow

1. Cinematic unchanged: call button → doors → ride in → camera settles →
   mirror shimmer sweep (existing `MirrorShimmerPlane` shader).
2. After `modalRevealDelay` seconds, the modal reveal starts automatically:
   a fullscreen shimmer band enters top-left, sweeps to bottom-right
   (`modalBandAngle`, default 135° in CSS terms), wiping in the website
   behind its center line.
3. The website is a fullscreen DOM layer: brand + nav (Home / About /
   Projects / Contact) + placeholder section content, natively scrollable.
4. Close (× button or Esc) runs the identical animation in reverse,
   un-revealing back to the live cabin.
5. After close, the mirror face shows a pulsing "Tap to open" hint;
   clicking the mirror reopens the modal.

## Architecture

- **`PortfolioModal`** (new, `src/components/PortfolioModal.jsx` + `.css`):
  plain DOM, rendered as a sibling of `<Canvas>` in `ElevatorExperience`.
  - One GSAP-tweened progress value (0→1) drives everything: the website
    layer's `mask-image` frontier and the shimmer band's gradient position
    both derive from a `--reveal-pos` custom property. Open = forward,
    close = the same tween toward 0.
  - Phase model owned by `ElevatorExperience`:
    `closed → opening → open → closing → closed`. The modal reports
    `onOpened`/`onClosed`; requests close via `onRequestClose` (×/Esc).
  - `prefers-reduced-motion`: crossfade instead of sweep.
- **Trigger:** `ElevatorAssetSequence` fires `onRequestModalOpen` once per
  sequence run when elapsed ≥ `turnStart + mirrorFxDelay + mirrorFxSeconds +
  modalRevealDelay` (sequence preview mode only).
- **`MirrorPortfolioPanel`** is repurposed as the mirror's face: brand teaser
  (kicker / name / tagline) plus the "Tap to open" hint when the modal is
  closed. Nav and section content move into the modal.
  Section data moves to `src/config/portfolioContent.js` (shared).
- **Performance:** Canvas `frameloop` switches to `never` while the modal is
  fully `open`; back to `always` the instant a close starts, so the cabin is
  live behind the reverse wipe.
- **Z-order:** mirror Html panel (≤12) < modal (30) < Lighting Lab (40), so
  the Lab stays usable while previewing the modal.

## Tunables (Lighting Lab → "Modal Reveal" section)

All stored in the existing tuning object (localStorage + Copy Full Setup):

| Key | Default | Meaning |
| --- | --- | --- |
| `modalRevealDelay` | 0.35 | seconds after mirror shimmer ends |
| `modalRevealSeconds` | 1.2 | open sweep duration |
| `modalCloseSeconds` | 0.9 | close sweep duration |
| `modalBandAngle` | 135 | CSS degrees; 135 = top-left → bottom-right |
| `modalBandWidth` | 10 | band core width, % of sweep line |
| `modalBandSoftness` | 6 | feather on each band edge, % |
| `modalBandOpacity` | 0.9 | band brightness |
| `modalBandColor` | #dff7ff | band color |
| `modalEase` | power2.inOut | GSAP ease (select) |

Plus **Open / Close preview buttons** so the animation can be polished without
riding the elevator each time.

## Out of scope (follow-ups)

- Real portfolio content (projects, about, contact links) inside the modal.
- Final animation choreography — to be tuned collaboratively in the Lab.

## Verification

`npm run lint`, `npm run build`, then live checks on the dev server: auto
reveal after the ride, Esc/× close, mirror-tap reopen, scrolling inside the
modal, Lab preview buttons, narrow-viewport sanity check.
