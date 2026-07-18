# Hall colors: midnight espresso, phase one

Date: 2026-07-18
Status: approved direction, phase one scoped

## Decision

The elevator hall adopts the "midnight espresso" direction: dark warm espresso
wall, near-black floor, warm practical lighting, everything composed so the
elevator is the single focal point. The direction was chosen from five rendered
candidates and validated against Ed's reference images (wood-and-travertine
elevator banks, a copper door under warm grazing light, plants in bronze pots).
All references share one move: dark warm surfaces shaped by visible practical
lighting.

Phase one ships only the color foundation and its tuning controls. Lighting,
fixtures, and props follow in later phases.

## Constraint recorded for later phases

Light pools must never float. Every pool of light in the scene needs a visible
fixture that plausibly produces it (sconce, cove, recessed uplight). This is
Ed's explicit requirement and it matches how the reference interiors work.
Fixture strategy is blocked on the lighting research currently in flight.

## Phase one scope

### Material split

`elevator.glb` uses one `Wall` material for both the hall wall mesh and the
floor mesh, which is why the floor reads as part of the wall today. The scene
already clones materials per mesh at load; during that clone, meshes carrying
the `Wall` material get tagged by shape (bounding-box height under 0.5 units
means floor, otherwise wall). The GLB itself is not modified.

### Tuning values

Two new tuning keys, following the existing pattern in `elevatorSetup.js`:

- `wallColor`, default `#2e261d`
- `floorColor`, default `#191410`

A null or absent value means no override, so the shipped GLB gray remains
reachable. `ORIGINAL_TUNING` sets both to null; the "Original" button restores
the pre-redesign look exactly.

Defaults are starting points. Final values get dialed in live in the Lighting
Lab and exported back into `elevatorSetup.js` before merge.

### Lighting Lab

New "Hall" section in the panel with two color pickers, wall and floor, wired
through the existing `updateTuning` flow. Both keys join `getExportableSetup`
so Copy Full Setup round-trips them.

### Out of scope

Practical lights and their fixtures, plants and pots, backlit portal slots,
floor-number plate, wall paneling, rug. Each lands as its own branch once the
color foundation is merged and the lighting research is in.

## Verification

- `npm run lint && npm run build`
- Browser pass per the verify skill: full ride, colors hold through door open,
  entry, turn, and mirror reveal; modal unaffected
- Lighting Lab round trip: change both colors, Copy Full Setup, confirm the
  snippet carries them; "Original" restores shipped gray
- Stale tuning check: Ed's Chrome localStorage may hold pre-phase tuning that
  hides the new defaults; verify with storage cleared and with stored values

## Risks

- Tone mapping interaction: exposure 1.79 with the night HDRI warms and lifts
  dark colors, so hex values on screen differ from the picker value. Accepted;
  tuning happens against the rendered result, not the swatch.
- The contact shadow under the elevator was tuned against a light floor and may
  need an opacity pass once the floor darkens. In scope for tuning, not code.
