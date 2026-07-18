# Hall practicals: phase three

Date: 2026-07-18
Status: in design; fixture style to be chosen by Ed from rendered candidates

## Goal

Give the hall its practical lighting: visible bronze fixtures whose light
pools frame the elevator, per the anchoring rules in the research digest.
Ed's standing constraint: no pool of light without a visible fixture that
plausibly produces it, and everything composed to keep the elevator the
single focal point.

## Constraints from the research (all mandatory)

- Every pool traces to a fixture body; the emissive aperture is the
  brightest pixel of its own pool (enforced by bloom threshold 1: apertures
  cross it, wall pools never do).
- The pool's hot spot sits where the fixture's beam axis meets the wall.
- Focal contrast target roughly 10:1, elevator versus surrounding wall.
- Warm practicals in the 2200K to 2700K range (#FF932C to #FFA957) against
  the existing dim base.
- Sconce mounting height 1.6 to 1.7 m to center, flanking the portal
  symmetrically, clear of the door pillars (beyond z of about 2.2).

## Site note

The hall has no ceiling geometry, so recessed ceiling downlights cannot be
anchored honestly. Phase three therefore uses wall-mounted fixtures only.
A ceiling soffit with downlights remains possible later as set dressing.

## Candidate fixtures (rendered for Ed to choose)

All bronze to match the call plate, all built as code primitives (lathe,
cylinder, box), zero GLB payload, each with its own up/down spotlights:

- A. Cylinder sconce: vertical bronze tube, emissive discs top and bottom,
  classic hotel up/down wash.
- B. Band sconce: rectangular bronze backplate with a frosted emissive band
  across the middle, the "glowing band, dark body" hospitality standard.
- C. Portal slots: tall thin emissive slots in bronze channels hugging the
  door frame verticals, the backlit-portal move from Ed's marble-lobby
  reference.

## Implementation shape

- New component `src/components/HallPracticals.jsx`: fixture geometry plus
  an `AnchoredSpot` helper that manages spotlight targets in the scene
  graph.
- Tuning keys: `practicalStyle` ('cylinder' | 'band' | 'slots' | 'off'),
  `practicalIntensity`, `practicalColor`, `practicalHeight`, exported
  through Copy Full Setup; Lighting Lab gains a Practicals section.
- ORIGINAL_TUNING carries `practicalStyle: 'off'` so the pre-redesign look
  stays exact.
- Emissive apertures: emissiveIntensity around 3, toneMapped false, so they
  glow and bloom like the call plate does today.

## Verification

- npm run lint && npm run build
- Full ride: fixtures never clip the camera path (they sit outside the
  pillars; the camera enters at z 0), pools land on the wall correctly in
  every shot, modal unaffected
- Focal check: doors sample brighter than the wall pools; wall pools sample
  brighter than un-poolied wall
- Lab round trip for the new keys; Original restores a fixture-free hall
