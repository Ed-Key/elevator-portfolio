# Render foundation: phase two

Date: 2026-07-18
Status: approved direction (Ed: "phase 2"), implementation on feat/render-foundation

## Goal

Make the scene's reflections, grading, and contrast read as designed, and
eliminate the cab lightbox artifact at its root. This is the layer every later
phase (practical fixtures, props) is judged against, which is why it lands
before them.

## Scope

### 1. Custom reflection environment

Replace the production dependence on the stock `night` HDRI preset (an outdoor
panorama fetched from a CDN at runtime) with a declarative environment built
for this room: drei `<Environment resolution={256} frames={1}>` containing
Lightformer quads. Design intent, tuned visually during implementation:

- dark warm ground and lower hemisphere (research rule: light rarely comes
  from the ground; this is what kills the cab's bright lower-wall reflection)
- warm overhead panels near where phase three's practicals will sit
  (about x 1.1, y 4, z ±2.7), color in the 2700K family (#FFA957 range)
- a faint cool strip behind the camera (+x) so door edges keep a rim glint

The Lighting Lab's HDRI preset selector gains a `custom` entry as the new
default; the stock presets remain selectable for A/B comparison.

### 2. Postprocessing stack

`@react-three/postprocessing` EffectComposer with, in order: N8AO (halfRes,
aoRadius ~0.4 for this scene scale), Bloom (mipmapBlur, luminanceThreshold 1
so nothing blooms until phase three's emissive fixtures opt in), Vignette,
and the ToneMapping effect. The composer must respect the existing
`frameloop` pause when the modal is open.

### 3. Tone mapping selector

Lab control choosing ACES Filmic, AgX, or Neutral. ACES at high exposure
skews warm hues toward yellow, which fights the espresso-and-brass palette;
AgX is the expected winner but the choice is made by A/B against rendered
frames, not by doctrine. Exposure default gets re-tuned for the chosen
operator.

### 4. Shadow tightening

The one shadow-casting directional gets `shadow-mapSize` 2048, shadow camera
bounds fitted to the elevator's extent instead of defaults, and
`shadow-normalBias` 0.02 against acne on the cab walls.

### 5. Tuning and export

New tuning keys, Lab controls, and Copy Full Setup round-trip for:
`toneMapping`, `aoIntensity`, `bloomIntensity`, `vignetteDarkness`. Defaults
committed after visual tuning.

## Non-goals

- Emissive fixtures and practical lights: phase three, blocked on this layer.
- Props and set dressing: phase four.
- Adaptive performance degradation (PerformanceMonitor tiers): revisit in a
  dedicated perf pass once the full stack exists.
- Removing `preserveDrawingBuffer`: the browser verification workflow samples
  canvas pixels and Ed screenshots the scene; keep it until a perf pass says
  otherwise.

## Verification

- `npm run lint && npm run build`
- Bundle check: postprocessing lands in a cacheable vendor chunk consistent
  with the existing bundle-splitting scheme (see vite config), not in the
  entry chunk
- Full ride in the browser; frames viewed for taste at outside, door-open,
  entering, and mirror moments
- Pixel check: the cab's lower back wall must sample dark warm (no cream
  lightbox) with the custom environment active
- Tone mapping A/B screenshots compared side by side before choosing the
  default
- Lab round trip: new keys appear in Copy Full Setup; Original still restores
  the pre-redesign look (stock studio preset, ACES, no postprocessing bias)

## Risks

- @react-three/postprocessing version compatibility with three r184 and r3f
  v9; resolve at install time, pin what works.
- Changing tone mapping invalidates the phase-one espresso hexes' rendered
  appearance; expect a small re-tune of exposure and possibly both colors.
- EffectComposer replaces the renderer's output pass; double tone mapping or
  missing sRGB conversion are the classic mistakes (research digest, hygiene
  section). Verify against a no-composer control frame.
