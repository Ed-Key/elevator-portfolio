# Hall Colors Phase One Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the midnight espresso wall/floor color foundation with Lighting Lab controls, per `docs/superpowers/specs/2026-07-18-hall-colors-design.md`.

**Architecture:** The GLB's shared `Wall` material is split by mesh shape at load time (bounding-box height under 0.5 units = floor). Two nullable tuning keys (`wallColor`, `floorColor`) override the baseline color in the existing material-tuning effect; null means no override. The Lighting Lab gains a Hall section with two color pickers, and both keys ride the existing copy-setup export.

**Tech Stack:** React 19, @react-three/fiber, @react-three/drei, three r184, Vite 8. No test suite; verification is `npm run lint && npm run build` plus a browser pass.

## Global Constraints

- Never commit to `main`; work stays on this worktree branch.
- Conventional commits, lowercase after colon, subject states the decision; body for judgment calls.
- `elevator.glb` must not be modified.
- Defaults: `wallColor: '#2e261d'`, `floorColor: '#191410'`; `ORIGINAL_TUNING` carries `null` for both so the Original button restores the shipped gray exactly.
- The working tree already contains prototype edits in `src/components/ElevatorExperience.jsx` (the `Box3` import, the `hallRole` tagging block, the two color-override blocks, the effect dependency additions, and a `hallPracticals` lights block). Tasks below state exactly what to keep and what to remove.

---

### Task 1: Scene foundation (material split, overrides, defaults)

**Files:**
- Modify: `src/components/ElevatorExperience.jsx`
- Modify: `src/config/elevatorSetup.js`

**Interfaces:**
- Produces: tuning keys `wallColor` and `floorColor` (hex string or null), read by the material effect and by Task 2's UI and export.

- [ ] **Step 1: Remove the out-of-scope prototype lights block**

In `src/components/ElevatorExperience.jsx`, delete this entire block (it currently sits after the cabin `pointLight` inside the Canvas):

```jsx
        {tuning.hallPracticals > 0 && (
          <>
            <pointLight position={[1.1, 3.5, 2.7]} intensity={tuning.hallPracticals} color="#ffc98a" distance={7} decay={1.7} />
            <pointLight position={[1.1, 3.5, -2.7]} intensity={tuning.hallPracticals} color="#ffc98a" distance={7} decay={1.7} />
            <pointLight position={[1.3, 0.6, 0]} intensity={tuning.hallPracticals * 0.5} color="#ffb877" distance={5} decay={1.9} />
          </>
        )}
```

- [ ] **Step 2: Confirm the material split and overrides are present**

The following pieces must exist in `src/components/ElevatorExperience.jsx` (they are already in the working tree from prototyping; re-create them if starting from a clean checkout):

The `three` import includes `Box3`:

```jsx
import { Box3, Color, MathUtils, Vector3 } from 'three'
```

Inside the baseline-clone effect's `cloneMaterial`, before the `baselines.set` call:

```jsx
        // The GLB uses one 'Wall' material for both the hall wall and the
        // floor; tell them apart by shape so each can take its own tint.
        if (cloned.name === 'Wall') {
          const bounds = new Box3().setFromObject(object)

          cloned.userData.hallRole = bounds.max.y - bounds.min.y < 0.5 ? 'floor' : 'wall'
        }
```

In the material-tuning effect, immediately after the baseline color restore:

```jsx
        if (material.userData.hallRole === 'wall' && tuning.wallColor) {
          material.color.set(tuning.wallColor)
        }

        if (material.userData.hallRole === 'floor' && tuning.floorColor) {
          material.color.set(tuning.floorColor)
        }
```

And that effect's dependency array reads:

```jsx
  }, [scene, tuning.environmentIntensity, tuning.floorColor, tuning.materialLift, tuning.metalRoughness, tuning.wallColor])
```

- [ ] **Step 3: Add the defaults**

In `src/config/elevatorSetup.js`, in `DEFAULT_TUNING`, immediately after the `background: '#000000',` line, add:

```js
  wallColor: '#2e261d',
  floorColor: '#191410',
```

In `ORIGINAL_TUNING`, immediately after its `background: '#11141b',` line, add:

```js
  wallColor: null,
  floorColor: null,
```

- [ ] **Step 4: Verify lint and build**

Run: `npm run lint && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/ElevatorExperience.jsx src/config/elevatorSetup.js
git commit -m "style(scene): give the hall its midnight espresso foundation

The GLB shares one Wall material between the hall wall and the floor,
which is why the floor never read as a surface. Split the two by mesh
shape at load and tint each from tuning, with null meaning the shipped
gray so the Original look stays reachable."
```

### Task 2: Lighting Lab Hall section and export round-trip

**Files:**
- Modify: `src/components/ElevatorExperience.jsx`

**Interfaces:**
- Consumes: tuning keys `wallColor` and `floorColor` from Task 1.
- Produces: Hall section in the Lighting Lab; both keys included in Copy Full Setup output.

- [ ] **Step 1: Add both keys to the export**

In `getExportableSetup`'s `tuning:` object literal (alphabetical order), add after the `exposure` line:

```js
      floorColor: currentTuning.floorColor,
```

and after the `turnSeconds` line:

```js
      wallColor: currentTuning.wallColor,
```

- [ ] **Step 2: Add the Hall section to the Lighting Lab**

In the `LightingLab` component's `tuning-grid` div, insert this section immediately before the existing `Mirror FX` `tuning-section` div:

```jsx
        <div className="tuning-section">
          <div className="tuning-section__header">
            <span>Hall</span>
          </div>

          <label className="tuning-field">
            <span>Wall color</span>
            <input
              type="color"
              value={tuning.wallColor ?? '#e6e6e6'}
              onChange={(event) => updateTuning('wallColor', event.target.value)}
            />
          </label>
          <label className="tuning-field">
            <span>Floor color</span>
            <input
              type="color"
              value={tuning.floorColor ?? '#e6e6e6'}
              onChange={(event) => updateTuning('floorColor', event.target.value)}
            />
          </label>
        </div>
```

The `?? '#e6e6e6'` fallback matters: after the Original button sets both keys to null, a bare null would make the color input invalid.

- [ ] **Step 3: Verify lint and build**

Run: `npm run lint && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ElevatorExperience.jsx
git commit -m "feat(tools): tune hall wall and floor colors from the lighting lab

Two pickers in a new Hall section, exported through Copy Full Setup so
tuned values round-trip into elevatorSetup.js like every other control."
```

### Task 3: Browser verification

**Files:**
- None modified. Uses the recipe in `.claude/skills/verify/SKILL.md`.

- [ ] **Step 1: Full ride with new defaults**

With the dev server running (`npm run dev`), open the site in a fresh browser context (empty localStorage). Confirm the hall renders espresso wall and near-black floor. Click the down call button (hover until the cursor turns pointer, near canvas ratio x 0.67, y 0.59 at 1440x900). Ride through doors, entry, turn, mirror shimmer, and modal reveal. Colors must hold throughout and the modal must be unaffected.

- [ ] **Step 2: Lighting Lab round trip**

Open `/?tools`. In the Hall section change both colors, click Copy Full Setup, and confirm the copied snippet includes `wallColor` and `floorColor` with the picked values. Click Original and confirm the hall returns to the shipped gray. Click Default Look and confirm espresso returns.

- [ ] **Step 3: Stale storage check**

Reload with the localStorage key `elevator-experience-tuning` already present from step 2's tuning. Confirm stored values win (expected persistence behavior). Clear storage, reload, confirm the new defaults appear.
