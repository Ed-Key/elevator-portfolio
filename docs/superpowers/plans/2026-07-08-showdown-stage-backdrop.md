# Showdown Stage Backdrop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When Showdown Copilot is staged on the Projects floor, a dimmed demo teaser fills the center stage as ambient background, the framed window plays the full product demo, and the text tier sits on a frosted blur shield.

**Architecture:** The media ladder in `portfolioContent.js` gains a `backdrop` field. A new `StageBackdrop` component mounts inside `.panel-stage` at `z-index: 0` when the staged project defines one and motion is allowed. CSS dims the footage (filter + gold scrim + radial mask) and adds a `backdrop-filter` shield to the text tier via a `stage-show--backdropped` modifier.

**Tech Stack:** React (Vite), plain CSS, Playwright verification scripts, ffmpeg for asset prep.

**Spec:** `docs/superpowers/specs/2026-07-08-showdown-stage-backdrop-design.md`

## Global Constraints

- No test framework in this repo; verification is Playwright scripts run from the repo root (playwright is a devDependency; scripts must live in the project dir to resolve it).
- Dev server: 127.0.0.1:5174 is often occupied by the showdown-stack app. Always verify with curl what is serving, and run the portfolio on its own port: `npx vite --port 5199 --strictPort`.
- Throwaway probes are named `scripts/tmp-*.mjs` (gitignored). The committed suite is `scripts/verify-projects-floor.mjs`.
- Prose rules for any copy/comments/docs: no em dashes, no emojis (Eddie's writing voice). Code comments follow the file's existing density and tone.
- Reduced-motion visitors must never see the backdrop or the frosted shield; the window shows the poster (existing video-tier policy).
- Source media lives in `~/Projects/pokemon-ai/showdown-stack/docs/media/`. Outputs go to `public/media/projects/`.

---

### Task 1: Prepare the three Showdown assets

**Files:**
- Create: `public/media/projects/showdown-teaser.mp4`
- Create: `public/media/projects/showdown-demo.mp4`
- Create: `public/media/projects/showdown-dashboard.png`

**Interfaces:**
- Produces: the three public paths above, referenced verbatim by Task 2's config.

- [ ] **Step 1: Convert the teaser gif to a small h264 loop**

The source is 950x617; h264 requires even dimensions, so the scale filter rounds down to even.

```bash
ffmpeg -y -i ~/Projects/pokemon-ai/showdown-stack/docs/media/demo-teaser.gif \
  -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
  -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -an -movflags +faststart \
  public/media/projects/showdown-teaser.mp4
```

- [ ] **Step 2: Copy the full demo with audio stripped**

```bash
ffmpeg -y -i ~/Projects/pokemon-ai/showdown-stack/docs/media/demo.mp4 \
  -c:v copy -an -movflags +faststart \
  public/media/projects/showdown-demo.mp4
```

- [ ] **Step 3: Copy the dashboard poster**

581K as delivered, in line with existing posters (avirem-preview.png is 845K). No re-encode.

```bash
cp ~/Projects/pokemon-ai/showdown-stack/docs/media/dashboard.png \
  public/media/projects/showdown-dashboard.png
```

- [ ] **Step 4: Verify the outputs**

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,codec_name -of csv=p=0 public/media/projects/showdown-teaser.mp4
ffprobe -v error -select_streams a -show_entries stream=codec_name -of csv=p=0 public/media/projects/showdown-demo.mp4
ls -lh public/media/projects/showdown-*
```

Expected: teaser reports `h264,950,616`; the audio probe on showdown-demo.mp4 prints nothing (no audio stream); teaser well under 1MB, demo at or under ~6MB, dashboard ~581K.

- [ ] **Step 5: Commit**

```bash
git add public/media/projects/showdown-teaser.mp4 public/media/projects/showdown-demo.mp4 public/media/projects/showdown-dashboard.png
git commit -m "Add Showdown Copilot demo, teaser loop, and dashboard poster assets"
```

---

### Task 2: Backdrop tier: config field, StageBackdrop component, mount

**Files:**
- Modify: `src/config/portfolioContent.js:41-44` (media comment) and `:70` (showdown media)
- Modify: `src/components/ProjectsPanel.jsx:45-75` (add StageBackdrop near StageMedia), `:131-137` (ProjectStage signature/classes), `:355-357` (mount in panel-stage)
- Modify: `src/components/ProjectsPanel.css` (base backdrop rules; must be appended AFTER the `.panel-stage > *` rule at line 215 so the `z-index: 0` declaration wins the equal-specificity fight)
- Create: `scripts/tmp-verify-showdown-backdrop.mjs` (gitignored probe)

**Interfaces:**
- Consumes: `/media/projects/showdown-*.{mp4,png}` from Task 1; existing `useReducedMotion()`, `activeProject`, `.panel-stage > * { z-index: 1 }` CSS.
- Produces: `media.backdrop` config field (string path or absent); `StageBackdrop({ src })` component rendering `.stage-backdrop > video` with `is-ready` class once playing; `ProjectStage({ backdropped, project, reducedMotion })` emitting `stage-show--backdropped`; CSS class names `.stage-backdrop`, `.stage-backdrop.is-ready`. Task 3 styles these; Task 4 asserts them.

- [ ] **Step 1: Write the failing probe**

Create `scripts/tmp-verify-showdown-backdrop.mjs`:

```js
// Throwaway probe: Showdown backdrop tier mounts, plays, and unmounts.
// Usage: BASE_URL=http://127.0.0.1:5199 node scripts/tmp-verify-showdown-backdrop.mjs
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:5199'
let failures = 0
const check = (name, ok) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
  if (!ok) failures += 1
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(`${BASE}/?tools=1`)
await page.waitForTimeout(1500)
await page.getByRole('button', { name: 'Open', exact: true }).click()
await page.waitForSelector('[data-phase="open"]', { timeout: 15000 })
await page.addStyleTag({ content: '[data-preview-ui]{display:none !important}' })
await page.waitForTimeout(600)

await page.locator('.floor-panel__button', { hasText: 'Projects' }).click()
await page.waitForTimeout(1200)

await page.locator('.panel-cell', { hasText: 'Showdown Copilot' }).hover()
await page.waitForTimeout(800)
check('backdrop mounts for Showdown', (await page.locator('.stage-backdrop video').count()) === 1)
check('backdrop reaches is-ready', (await page.locator('.stage-backdrop.is-ready').count()) === 1)

const t1 = await page.locator('.stage-backdrop video').evaluate((v) => v.currentTime)
await page.waitForTimeout(900)
const t2 = await page.locator('.stage-backdrop video').evaluate((v) => v.currentTime)
check('backdrop video advances', t2 > t1)
check(
  'backdrop is slowed to 0.75',
  (await page.locator('.stage-backdrop video').evaluate((v) => v.playbackRate)) === 0.75,
)
check('shield modifier applied', (await page.locator('.stage-show--backdropped').count()) === 1)
check('window plays the demo', await page.locator('.stage-show__window video').isVisible())

await page.locator('.panel-cell', { hasText: 'PageAura' }).hover()
await page.waitForTimeout(600)
check('backdrop unmounts off Showdown', (await page.locator('.stage-backdrop').count()) === 0)
check('shield modifier gone off Showdown', (await page.locator('.stage-show--backdropped').count()) === 0)

await page.screenshot({ path: 'shots/showdown-backdrop-full.png' })
await browser.close()
console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)
```

- [ ] **Step 2: Run the probe to verify it fails**

Start the dev server if not already up (check first: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5199/`):

```bash
npx vite --port 5199 --strictPort &
BASE_URL=http://127.0.0.1:5199 node scripts/tmp-verify-showdown-backdrop.mjs
```

Expected: FAIL on "backdrop mounts for Showdown" (count 0) and subsequent checks (the currentTime evaluate will throw or time out; that counts as the failing state).

- [ ] **Step 3: Add the backdrop field to Showdown's config**

In `src/config/portfolioContent.js`, replace the showdown-copilot media line:

```js
    media: { video: null, poster: '/media/projects/showdown-copilot-poster.svg', logo: null, model: null },
```

with:

```js
    media: {
      video: '/media/projects/showdown-demo.mp4',
      poster: '/media/projects/showdown-dashboard.png',
      logo: null,
      model: null,
      backdrop: '/media/projects/showdown-teaser.mp4',
    },
```

And extend the media comment block above `PROJECTS` (lines 41-44). Replace:

```js
// media: best available asset per project — the stage renders
// video → poster → monogram (nothing blocks on recordings existing).
// logo, when present, replaces the monogram mark beside the text;
// model (draco glb) outranks logo as a spinning 3D mark on the stage.
```

with:

```js
// media: best available asset per project — the stage renders
// video → poster → monogram (nothing blocks on recordings existing).
// logo, when present, replaces the monogram mark beside the text;
// model (draco glb) outranks logo as a spinning 3D mark on the stage.
// backdrop, when present, plays dimmed behind the whole stage while the
// project is staged (skipped under reduced motion).
```

- [ ] **Step 4: Add the StageBackdrop component**

In `src/components/ProjectsPanel.jsx`, insert directly after the `StageMedia` function (after line 75):

```jsx
// Ambient backdrop tier: the staged project's footage fills the stage
// behind the window and text, dimmed to texture by the CSS layers. Only
// mounted when the project defines media.backdrop and motion is allowed.
function StageBackdrop({ src }) {
  const [ready, setReady] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = 0.75
  }, [src])

  return (
    <div aria-hidden="true" className={ready ? 'stage-backdrop is-ready' : 'stage-backdrop'}>
      <video
        autoPlay
        loop
        muted
        onPlaying={() => setReady(true)}
        playsInline
        ref={videoRef}
        src={src}
      />
    </div>
  )
}
```

(`useEffect`, `useRef`, `useState` are already imported at line 1.)

- [ ] **Step 5: Thread the backdropped modifier through ProjectStage**

Replace the `ProjectStage` opening (lines 131-137):

```jsx
function ProjectStage({ project, reducedMotion }) {
  const capsLine = `${project.tech.map((tech) => tech.name).join(' · ')} — ${project.year}`
  const hasWindow = Boolean(project.media.video || project.media.poster)
  const links = getProjectLinks(project)

  return (
    <div className={hasWindow ? 'stage-show stage-show--windowed' : 'stage-show'} key={project.id}>
```

with:

```jsx
function ProjectStage({ backdropped, project, reducedMotion }) {
  const capsLine = `${project.tech.map((tech) => tech.name).join(' · ')} — ${project.year}`
  const hasWindow = Boolean(project.media.video || project.media.poster)
  const links = getProjectLinks(project)
  const classes = [
    'stage-show',
    hasWindow && 'stage-show--windowed',
    backdropped && 'stage-show--backdropped',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} key={project.id}>
```

- [ ] **Step 6: Mount the backdrop in the stage**

Replace the panel-stage block (line 355-357):

```jsx
        <div className="panel-stage" data-reveal>
          {activeProject ? <ProjectStage project={activeProject} reducedMotion={reducedMotion} /> : <IdlePlate />}
        </div>
```

with:

```jsx
        <div className="panel-stage" data-reveal>
          {activeProject?.media.backdrop && !reducedMotion ? (
            <StageBackdrop key={activeProject.id} src={activeProject.media.backdrop} />
          ) : null}
          {activeProject ? (
            <ProjectStage
              backdropped={Boolean(activeProject.media.backdrop) && !reducedMotion}
              project={activeProject}
              reducedMotion={reducedMotion}
            />
          ) : (
            <IdlePlate />
          )}
        </div>
```

- [ ] **Step 7: Add the base backdrop CSS**

In `src/components/ProjectsPanel.css`, insert after the `.panel-stage > *` rule (line 215-217) so these later equal-specificity rules win:

```css
/* ---------- stage backdrop: ambient footage behind the show ---------- */

.stage-backdrop {
  position: absolute;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  border-radius: 2px;
  opacity: 0;
  transition: opacity 600ms ease;
  pointer-events: none;
}

.stage-backdrop.is-ready { opacity: 1; }

.stage-backdrop video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

(Dimming, scrim, and mask land in Task 3; this task only proves the plumbing.)

- [ ] **Step 8: Run the probe to verify it passes**

```bash
BASE_URL=http://127.0.0.1:5199 node scripts/tmp-verify-showdown-backdrop.mjs
```

Expected: ALL CHECKS PASSED. Read `shots/showdown-backdrop-full.png` to eyeball: undimmed teaser footage visible behind the window and text (bright at this stage is correct).

- [ ] **Step 9: Commit**

```bash
git add src/config/portfolioContent.js src/components/ProjectsPanel.jsx src/components/ProjectsPanel.css
git commit -m "Add backdrop media tier; Showdown stages demo video over teaser footage"
```

---

### Task 3: Dim the backdrop and shield the text

**Files:**
- Modify: `src/components/ProjectsPanel.css` (the `.stage-backdrop` block from Task 2, plus a new `.stage-show--backdropped` rule)

**Interfaces:**
- Consumes: `.stage-backdrop`, `.stage-backdrop video`, `.stage-show--backdropped` from Task 2.
- Produces: final visual treatment; no new names.

- [ ] **Step 1: Add dimming, scrim, and mask to the backdrop**

Replace the Task 2 `.stage-backdrop` block with:

```css
/* ---------- stage backdrop: ambient footage behind the show ---------- */

.stage-backdrop {
  position: absolute;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  border-radius: 2px;
  opacity: 0;
  transition: opacity 600ms ease;
  pointer-events: none;
  -webkit-mask: radial-gradient(ellipse at 50% 50%, #000 55%, transparent 80%);
  mask: radial-gradient(ellipse at 50% 50%, #000 55%, transparent 80%);
}

.stage-backdrop.is-ready { opacity: 1; }

.stage-backdrop video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.32) saturate(0.65);
}

/* gold-tinted scrim: keeps the footage in the floor's atmosphere */
.stage-backdrop::after {
  position: absolute;
  inset: 0;
  content: '';
  background:
    radial-gradient(ellipse at 50% 58%, rgb(240 200 112 / 7%), transparent 70%),
    rgb(10 8 16 / 35%);
}
```

- [ ] **Step 2: Add the frosted text shield**

Insert after the `.stage-show--windowed .stage-show__text` rule (line 482-487 pre-edit; find it by the selector):

```css
/* readable things sit on frosted glass whenever footage plays behind them */
.stage-show--backdropped .stage-show__text {
  padding: clamp(14px, 2vh, 22px) clamp(16px, 1.8vw, 26px);
  background: rgb(12 10 18 / 45%);
  border: 1px solid rgb(240 200 112 / 10%);
  border-radius: 14px;
  -webkit-backdrop-filter: blur(32px);
  backdrop-filter: blur(32px);
}
```

- [ ] **Step 3: Screenshot and tune against the live stage**

```bash
BASE_URL=http://127.0.0.1:5199 node scripts/tmp-verify-showdown-backdrop.mjs
```

Read `shots/showdown-backdrop-full.png`. Judge against the spec's bar:
the footage reads as texture (no glowing light-UI rectangle), it dissolves
before touching any cell, and every word in the text tier is effortlessly
legible. Tune `brightness()`, the scrim alpha, the mask stops, and the
blur radius as needed; re-run and re-read the screenshot after each
adjustment. Also hover PageAura and screenshot once to confirm
backdrop-less projects are pixel-identical to before.

- [ ] **Step 4: Commit**

```bash
git add src/components/ProjectsPanel.css
git commit -m "Dim the stage backdrop to texture and shield staged text with frosted glass"
```

---

### Task 4: Regression coverage and reduced-motion pass

**Files:**
- Modify: `scripts/verify-projects-floor.mjs` (add backdrop checks to the committed suite)
- Create: `scripts/tmp-verify-backdrop-reduced-motion.mjs` (gitignored probe)

**Interfaces:**
- Consumes: `.stage-backdrop`, `.stage-show--backdropped`, `.stage-show__window` from Tasks 2-3.
- Produces: permanent suite coverage for the backdrop tier.

- [ ] **Step 1: Extend the committed verification suite**

In `scripts/verify-projects-floor.mjs`, insert after the "stage holds after pointer leaves" check (line 33-35) and before the private-press block (line 37):

```js
await page.locator('.panel-cell', { hasText: 'Showdown Copilot' }).hover()
await page.waitForTimeout(800)
check('showdown mounts stage backdrop', (await page.locator('.stage-backdrop video').count()) === 1)
check('showdown text sits on shield', (await page.locator('.stage-show--backdropped').count()) === 1)
await page.locator('.panel-cell', { hasText: 'PageAura' }).hover()
await page.waitForTimeout(600)
check('backdrop unmounts off showdown', (await page.locator('.stage-backdrop').count()) === 0)
```

- [ ] **Step 2: Write the reduced-motion probe**

Create `scripts/tmp-verify-backdrop-reduced-motion.mjs`:

```js
// Throwaway probe: reduced motion gets no backdrop, no shield, poster in window.
// Usage: BASE_URL=http://127.0.0.1:5199 node scripts/tmp-verify-backdrop-reduced-motion.mjs
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:5199'
let failures = 0
const check = (name, ok) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
  if (!ok) failures += 1
}

const browser = await chromium.launch()
const context = await browser.newContext({
  reducedMotion: 'reduce',
  viewport: { width: 1440, height: 900 },
})
const page = await context.newPage()
await page.goto(`${BASE}/?tools=1`)
await page.waitForTimeout(1500)
await page.getByRole('button', { name: 'Open', exact: true }).click()
await page.waitForSelector('[data-phase="open"]', { timeout: 15000 })
await page.addStyleTag({ content: '[data-preview-ui]{display:none !important}' })
await page.waitForTimeout(600)

await page.locator('.floor-panel__button', { hasText: 'Projects' }).click()
await page.waitForTimeout(1200)
await page.locator('.panel-cell', { hasText: 'Showdown Copilot' }).hover()
await page.waitForTimeout(800)

check('no backdrop under reduced motion', (await page.locator('.stage-backdrop').count()) === 0)
check('no shield under reduced motion', (await page.locator('.stage-show--backdropped').count()) === 0)
check('no window video under reduced motion', (await page.locator('.stage-show__window video').count()) === 0)
check(
  'window shows dashboard poster',
  (await page.locator('.stage-show__window img').getAttribute('src')) === '/media/projects/showdown-dashboard.png',
)

await browser.close()
console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)
```

- [ ] **Step 3: Run both suites**

```bash
BASE_URL=http://127.0.0.1:5199 node scripts/verify-projects-floor.mjs
BASE_URL=http://127.0.0.1:5199 node scripts/tmp-verify-backdrop-reduced-motion.mjs
```

Expected: ALL CHECKS PASSED on both (the committed suite now runs 12 checks).

- [ ] **Step 4: Commit**

```bash
git add scripts/verify-projects-floor.mjs
git commit -m "Cover the Showdown backdrop tier in the Projects floor suite"
```
