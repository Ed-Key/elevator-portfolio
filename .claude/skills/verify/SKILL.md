---
name: verify
description: Build, serve, and drive the elevator portfolio to verify changes at the browser surface
---

# Verifying the elevator portfolio

## Build and serve

```
npm run build          # production build to dist/
npm run preview        # serves dist/ at http://localhost:4173/
```

For dev-server checks use `npm run dev` (port 5173/5174).

## Driving the flow

The landing page is a WebGL canvas. The elevator call button is a 3D
hitbox inside the scene, so synthetic DOM events (dispatchEvent) never
reach the r3f raycaster. Use trusted input: Playwright `page.mouse`.

Recipe that works:

1. Load the page, wait ~2.5s for the GLB model.
2. The down-call button sits at canvas ratio (0.639, 0.588). Hover
   there first; `document.body.style.cursor` becoming `pointer`
   confirms the ray hits before you click.
3. `page.mouse.click()` at that point starts the ride (~10 to 15s).
4. The portfolio modal is the element with a `data-phase` attribute.
   Wait for `dataset.phase === 'open'`. Floor nav buttons are
   `button:has-text("PROJECTS")` etc. (getByRole lookups have been
   flaky here; :has-text works).

## Other surfaces

- `/?tools` mounts the Lighting Lab tuning panel (body text starts
  with "Lighting Lab").
- Expected console noise: THREE.Clock and PCFSoftShadowMap
  deprecation warnings from three. Not a regression.
