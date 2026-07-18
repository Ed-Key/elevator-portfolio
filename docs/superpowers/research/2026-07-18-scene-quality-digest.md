# Scene quality research digest

Date: 2026-07-18. Four parallel research passes: r3f scene quality, AI asset
generation and sourcing, MCP/agent 3D workflows, architectural lobby lighting.
This digest keeps every load-bearing number and link; the conclusions below
drive the phase plan for the hall redesign.

## Where the reports converge

Four independent passes landed on the same recipe for a scene like ours (dark
warm interior, one focal object, web budget):

1. A practical fixture is two decoupled things: emissive aperture geometry
   that looks bright, and a hidden analytic light that does the lighting.
   Selective bloom is what makes the aperture read as "a light."
2. Reflections are the look. Metal and mirror surfaces should reflect a
   purpose-built environment, not a stock HDRI of an unrelated outdoor scene.
3. Source realistic props from Poly Haven first (CC0, PBR, real-world scale);
   write parametric props as code geometry; AI-generate only what neither
   covers. One art direction, one lane, no low-poly/photoreal mixing.
4. The eye goes to the brightest thing. Keep a strong contrast ratio between
   the elevator and everything else, and never fix darkness by raising ambient.

## The "light from nowhere" rules (Ed's fixture concern, solved)

From archviz and game-lighting practice:

1. Every pool gets a parent: each scallop, graze, or glow must trace to
   visible geometry, a sconce body, a recessed can with a dark trim ring, or a
   cove lip. The viewer never needs to see the LED, only a plausible housing
   with a bright emissive aperture.
2. The emissive aperture must be the brightest pixel of its own pool. If the
   wall pool outshines the fixture, the brain rejects the source. Enforce it
   mechanically: bloom `luminanceThreshold` set so apertures bloom and wall
   pools never do.
3. Match geometry to falloff: the pool's hot spot sits where the fixture's
   beam axis meets the wall. A pool centered a meter from its sconce reads
   fake even if the sconce glows.
4. One dim un-anchored ambient fill is acceptable as "bounce"; multiple strong
   un-anchored lights create the uncanny feel.
5. Light rarely comes from the ground; keep the environment's lower half dark.

## Fixture strategy for the hall (from the lighting report)

Layered per Richard Kelly (ambient luminescence, focal glow, play of
brilliants), everything anchored:

- Pair of bronze sconces flanking the elevator. Center 1.6 to 1.7 m high,
  0.3 to 0.5 m off each side of the opening, symmetric. Emissive band, one
  spot up and one down (angle ~0.5 to 0.7 rad, penumbra 0.7 to 1.0, decay 2).
- One or two ceiling downlights in front of the doors, centerline 600 to
  750 mm off the door plane, 25 to 40 degree cone, so the bronze doors carry
  the brightest pool in the scene. Modeled can holes with dark trim rings
  anchor the ceiling scallops. Sharper edge = lower penumbra.
- Optional but proven (an elevator-lobby lighting study's winning scheme):
  vertical cove lights flanking the doors; model only the lip, light with a
  RectAreaLight matched to the strip.
- Dim, slightly cool, desaturated ambient fill at roughly 1/10 the portal
  intensity. Focal contrast targets: 5:1 subtle, 10:1 strong accent (our
  target), 15:1+ theatrical.
- Warm color hexes from blackbody tables: 2200K #FF932C (accents), 2400K
  #FF9D3F, 2700K #FFA957 (main warm layer), 3000K #FFB46B. Warm practicals
  against the cool-ish dim fill is the standard hospitality/film pairing.

## Render foundation upgrades (from the r3f report)

Top changes by impact:

1. Replace `Environment preset="night"` with a declarative custom environment
   (drei `<Environment resolution={256} frames={1}>` + `Lightformer` quads):
   warm panels above the practicals, a faint cool strip behind camera for rim
   highlights on the metal. Also removes the preset's runtime CDN fetch,
   which drei docs say is not for production.
2. Postprocessing stack via `@react-three/postprocessing`:
   `N8AO` (aoRadius ~0.3-0.5 for our scale, halfRes), `Bloom`
   (mipmapBlur, luminanceThreshold 1, intensity ~0.6), `Vignette`. MSAA 4 on
   desktop; SMAA fallback on weak devices.
3. Emissive fixtures: `material.emissiveIntensity` 2 to 4 with
   `toneMapped: false` so only fixtures cross the bloom threshold.
4. Tone mapping A/B: ACESFilmic (current, skews warm hues toward yellow at
   high exposure) vs AgX (holds warm hues, Blender's default) vs Khronos
   Neutral. Add a selector to the Lighting Lab; retune exposure after
   switching since curves differ.
5. Shadows: one shadow-casting directional only; `shadow-mapSize` 2048,
   tight shadow camera bounds, `shadow-normalBias` 0.02; consider drei
   `SoftShadows` or `BakeShadows` (scene is static except doors).
6. Ceiling of quality if all else falls short: Blender-baked lightmaps
   (bake everything except door faces). Big lift; hold in reserve.
7. Hygiene: manually loaded color textures need `SRGBColorSpace`; data
   textures stay linear; no extra gamma pass on top of the composer.
   `preserveDrawingBuffer: true` on the Canvas costs performance; check
   what uses it before removing.
8. Budget: under 100 draw calls, 3 or fewer active analytic lights with one
   shadow caster, textures max 2048 desktop / 1024 mobile, `dpr={[1, 2]}`,
   drei `PerformanceMonitor` to degrade gracefully.

## Prop pipeline (from the assets report)

- Primary source: Poly Haven models (CC0, PBR, glTF, real-world scale).
  Exact matches already in catalog: `potted_plant_01/02/04`,
  `industrial_wall_sconce`, `industrial_caged_sconce`, `painted_wooden_bench`,
  `ClassicConsole_01`, `side_table_01`, `ornate_mirror_01`, 11-asset Vases
  category. URL pattern `https://polyhaven.com/a/<slug>`.
- Parametric props (frames, simple pots, sconce housings if we prefer bespoke)
  are code geometry: lathe/extrude/bevel shapes written directly in R3F.
  Research consensus: this is the most reliable agent workflow that exists.
- AI generation is the fallback for pieces neither covers. 2026 ranking for
  props: Tripo (cleanest topology, fastest), Meshy 6 (best all-rounder),
  Rodin Gen-2.5 (most photoreal). Licensing: pay one month of Pro (~$20) for
  full ownership before shipping anything generated; Meshy free tier is
  CC BY (attribution), Tripo free tier is non-commercial. Luma Genie is
  dormant; TRELLIS is the clean MIT open-source option but needs a big GPU.
- Framed wall art (the Tufts piece): never generate; a frame is a few hundred
  triangles of code geometry with an image texture on the canvas plane.
- Compression, every prop before it enters the repo:
  `npx @gltf-transform/cli optimize prop.glb prop.web.glb --compress meshopt
  --texture-compress ktx2 --texture-size 1024`
  (ETC1S for albedo/ORM, UASTC for normals if they shimmer; webp fallback if
  KTX2 tooling fights us). Meshopt needs `MeshoptDecoder` wired to the loader.
- Size targets: 100 to 300 KB per background prop, under 1 MB hero,
  ~1.5 MB total initial 3D payload.

## Agent tooling (from the MCP report)

- Stay code-first; the browser verify loop judges work under the real
  renderer, which a Blender viewport does not.
- Blender MCP (community ahujasid version, not the official inspection-first
  one) is worth installing later as a secondary tool for GLB surgery on
  downloaded assets: delete hidden geometry, decimate, rebake, re-export.
  Known gotchas: manual server start per Blender launch, Sketchfab needs API
  key plus enable checkbox, expect 2 to 3 error-fix iterations per nontrivial
  operation, arbitrary Python execution so save first.
- gltf-transform CLI covers inspection/optimization from the shell, no MCP.
- threejs-devtools-mcp (young project) can live-tune a running r3f scene;
  optional, revisit if the edit-reload loop feels slow during fixture tuning.

## Phase plan implied by the research

1. Phase one (specced, in progress): wall and floor colors plus Lighting Lab
   controls.
2. Phase two, render foundation: custom Lightformer environment,
   postprocessing stack, tone mapping selector, shadow tightening. Comes
   before fixtures because it changes how everything downstream looks.
3. Phase three, practical fixtures: sconce pair plus door downlights per the
   fixture strategy above, every pool anchored, tuned live.
4. Phase four, set dressing: Poly Haven plants and furniture, the framed
   Tufts piece as code geometry, each prop compressed and placed to reinforce
   the elevator focus.

## Key sources

- https://drei.docs.pmnd.rs/staging/lightformer and /staging/environment
- https://github.com/N8python/n8ao
- https://react-postprocessing.docs.pmnd.rs/effects/bloom
- https://www.donmccurdy.com/2024/04/27/emission-and-bloom/
- https://discourse.threejs.org/t/tone-mapping-overview/75204
- https://www.blog.poliigon.com/blog/7-mistakes-in-lighting-archviz
- https://www.erco.com/en_us/designing-with-light/lighting-knowledge/lighting-design/ambient-luminescence-focal-glow-and-play-of-brilliants-7501/
- https://www.lightingdesignlab.com/resources/articles/articles-lighting-productivity/accent-lighting-and-contrast-ratios
- https://www.smilelighting.com/2026/06/26/scallop-lighting-how-distance-from-a-wall-turns-beams-into-decorative-crescents/
- https://andi-siess.de/rgb-to-color-temperature/
- https://polyhaven.com/models and https://polyhaven.com/license
- https://gltf-transform.dev/cli
- https://github.com/ahujasid/blender-mcp
- https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/
- https://www.utsubo.com/blog/threejs-best-practices-100-tips
