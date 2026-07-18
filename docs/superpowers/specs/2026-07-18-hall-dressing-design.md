# Hall set dressing: phase four

Date: 2026-07-18
Status: in design; placements to be chosen by Ed from rendered candidates

## Goal

Furnish the hall so it reads as a lived-in lobby while every piece
reinforces the elevator as the single focal point. Ed's original wishlist:
plants, a Tufts piece, furniture. The research digest's per-prop routing
and the reference images (plant clusters in bronze pots, sparse hotel
lobbies) drive the choices.

## Composition rules

- Nothing overlaps the door portal or the camera path (camera enters at
  z 0; props live beyond the pillars, z beyond about 2.2, or against the
  side walls).
- Props sit inside or at the edge of the sconce light pools, so the
  practicals justify their visibility.
- Odd-numbered plant clusters with varied heights (the reference photo
  recipe); bronze and ceramic pots matched to the fixture family.
- The elevator stays the brightest and most contrasted element; props are
  midtone furniture for the eye, never destinations.

## Props and sourcing

1. Potted plants: Poly Haven `potted_plant_01` and `potted_plant_02`
   (CC0, PBR, real-world scale), a cluster on one side of the hall inside
   the sconce pool, single counterweight on the other side if needed.
2. The Tufts piece: never AI-generated, never a downloaded logo mesh. A
   framed print built from code geometry (thin bronze frame box, canvas
   plane) with an image texture. Texture asset needs Ed's input: the
   wordmark from the site's press row, a pennant, or a photo.
3. Optional counterweight furniture (bench or console) only if the frame
   feels empty after plants; Poly Haven `ClassicConsole_01` or
   `painted_wooden_bench` are the vetted candidates.

## Pipeline

- Download 1k glTF from Poly Haven, assemble, then compress:
  `npx @gltf-transform/cli optimize <in> <out> --compress draco
  --texture-compress webp --texture-size 1024`.
  Draco over meshopt because the repo already ships the draco decoder and
  drei's useGLTF wires it automatically; webp over KTX2 to keep tooling
  simple at this asset scale.
- Budgets from the research: 100 to 300 KB per background prop, and props
  lazy-load after the elevator GLB so the critical path stays untouched.
- Props mount in a new `HallDressing` component with per-prop position,
  rotation, and scale in a `setDressing` config block, tunable placement
  via the existing Lab patterns only if needed (props are static; a
  config-file iteration loop with screenshots may be enough).

## Verification

- npm run lint && npm run build; bundle check that props are not in the
  entry or r3f chunks
- Full ride with props: no clipping in any shot, no focal competition
  (pixel check that door region stays brightest)
- Prop payloads within budget; network check that props load after the
  elevator model
- Original look: dressing hidden (ORIGINAL_TUNING gains a kill switch)
  so the pre-redesign look stays exact

## Open questions for Ed

- Tufts texture: wordmark print, pennant shape, or a photo of campus?
- Plant cluster side: sconce pools are symmetric; the call plate sits on
  the right of the doors, so the cluster likely balances on the left.
