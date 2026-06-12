# Projects Button-Panel Floor + Site Snap Scroll — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Projects directory list with an elevator button-panel ring (8 engraved cells around a living center stage) and move the whole site from click-only floor swaps to continuous snap scrolling.

**Architecture:** A new self-contained `ProjectsPanel` component (+ its own CSS file) renders the ring, cells, and stage from a richer `PROJECTS` data shape (tech glyphs, media ladder, status). `PortfolioModal` stops swapping one floor at a time and renders all four floors as stacked scroll-snap sections, with IntersectionObservers driving the active-floor lamp and the per-floor reveal stagger. Tech logos are vendored simple-icons SVGs tinted via CSS `mask`, gold at rest → brand color on hover.

**Tech Stack:** React 19, Vite, GSAP (existing reveal tweens), CSS scroll-snap, IntersectionObserver, simple-icons (build-time only), Playwright (verification scripts, existing repo convention).

**Spec:** `docs/superpowers/specs/2026-06-11-projects-floor-button-panel-design.md`

**Verification convention (no unit-test framework in this repo):** every UI task is verified with `npm run lint` plus a Playwright screenshot script (`scripts/shoot-projects.mjs`, created in Task 3), following the repo's established workflow: dev server running, open `/?tools=1`, click the Lighting Lab **Open** button, wait for `[data-phase="open"]`. Start the dev server once at the beginning (`npm run dev`, note the printed port — usually 5173, sometimes 5174 if occupied) and export `BASE_URL` accordingly for the scripts.

---

## File structure

| File | Status | Responsibility |
| --- | --- | --- |
| `src/config/portfolioContent.js` | modify | `PROJECTS` gains `tech[]`, `media{}`, `status`; drops `stack` |
| `public/images/tech/<slug>.svg` | create ×17 | vendored monochrome tech logos (CC0, simple-icons) |
| `scripts/vendor-tech-icons.mjs` | create | one-shot copier from node_modules/simple-icons → public |
| `src/components/ProjectsPanel.jsx` | create | ring + cells + stage + accordion; the whole Projects floor |
| `src/components/ProjectsPanel.css` | create | all styles for the above |
| `src/components/PortfolioFloors.jsx` | modify | delete old `ProjectsFloor` + directory markup |
| `src/components/PortfolioModal.jsx` | modify | snap-scroll sections, IO lamp + reveal, panel scrollIntoView |
| `src/components/PortfolioModal.css` | modify | scroller snap CSS, `.floor-section`; delete `.directory` styles |
| `scripts/shoot-projects.mjs` | create | screenshot helper (desktop/mobile) for task-by-task eyeballing |
| `scripts/verify-projects-floor.mjs` | create | final assertion script (8 checks, PASS/FAIL output) |
| `CREDITS.md` | modify | credit Simple Icons |

---

### Task 0: Branch

- [ ] **Step 0.1:** `git checkout -b projects-button-panel` (skip if the executing skill already created an isolated worktree).

---

### Task 1: New `PROJECTS` data shape

**Files:**
- Modify: `src/config/portfolioContent.js:17-82`
- Modify: `src/components/PortfolioFloors.jsx:143` (keep old floor rendering until Task 3)

- [ ] **Step 1.1: Replace the `PROJECTS` array** in `src/config/portfolioContent.js` (lines 17–82) with:

```js
// Tech glyph colors are brand colors curated for the dark void background
// (pure-black brands like Three.js/Next.js/Unity become white, dark brands
// get their community light variant). Slugs match public/images/tech/*.svg.
const TECH = {
  claude: { name: 'Claude API', slug: 'claude', color: '#d97757' },
  csharp: { name: 'C#', slug: 'csharp', color: '#a179dc' },
  figma: { name: 'Figma', slug: 'figma', color: '#f24e1e' },
  firebase: { name: 'Firebase', slug: 'firebase', color: '#ffca28' },
  gcp: { name: 'GCP', slug: 'googlecloud', color: '#4285f4' },
  glsl: { name: 'GLSL', slug: 'opengl', color: '#5586a4' },
  gsap: { name: 'GSAP', slug: 'greensock', color: '#88ce02' },
  langchain: { name: 'LangChain', slug: 'langchain', color: '#5ac8a8' },
  nextjs: { name: 'Next.js', slug: 'nextdotjs', color: '#ffffff' },
  python: { name: 'Python', slug: 'python', color: '#4b8bbe' },
  r3f: { name: 'React Three Fiber', slug: 'react', color: '#61dafb' },
  react: { name: 'React', slug: 'react', color: '#61dafb' },
  rust: { name: 'Rust', slug: 'rust', color: '#ce6d35' },
  stripe: { name: 'Stripe Connect', slug: 'stripe', color: '#635bff' },
  supabase: { name: 'Supabase', slug: 'supabase', color: '#3fcf8e' },
  threejs: { name: 'Three.js', slug: 'threedotjs', color: '#ffffff' },
  typescript: { name: 'TypeScript', slug: 'typescript', color: '#3178c6' },
  unity: { name: 'Unity', slug: 'unity', color: '#ffffff' },
}

// media: best available asset per project — the stage renders
// video → poster → monogram (nothing blocks on recordings existing).
export const PROJECTS = [
  {
    id: 'pageaura',
    name: 'PageAura',
    blurb: 'A reading app that lights the room to match the book — mood-reactive ambient shaders wrap your library in cinematic color.',
    year: '2026',
    url: 'https://github.com/Ed-Key',
    status: 'live',
    tech: [TECH.react, TECH.threejs, TECH.supabase, TECH.claude],
    media: { video: null, poster: null },
  },
  {
    id: 'showdown-copilot',
    name: 'Showdown Copilot',
    blurb: 'Human-in-the-loop battle copilot for Pokemon Showdown — a Rust MCTS engine with Bayesian belief tracking over hidden opponent state.',
    year: '2026',
    url: null,
    status: 'private',
    tech: [TECH.rust, TECH.python, TECH.typescript],
    media: { video: null, poster: null },
  },
  {
    id: 'daily-bread',
    name: 'Daily Bread',
    blurb: 'Chrome extension pairing daily scripture with AI-synthesized study notes from three commentary sources.',
    year: '2026',
    url: 'https://daily-bread-landing.web.app',
    status: 'live',
    tech: [TECH.typescript, TECH.react, TECH.firebase, TECH.claude],
    media: { video: null, poster: null },
  },
  {
    id: 'avirem',
    name: 'Avirem',
    blurb: 'HIPAA-aware marketplace connecting clients with licensed aesthetic-medicine practitioners — onboarding, booking, and Stripe Connect payouts.',
    year: '2026',
    url: null,
    status: 'private',
    tech: [TECH.nextjs, TECH.supabase, TECH.stripe],
    media: { video: null, poster: null },
  },
  {
    id: 'elevator',
    name: 'This Elevator',
    blurb: 'The site you are standing in — a 3D elevator ride that opens into a living golden void.',
    year: '2026',
    url: 'https://github.com/Ed-Key',
    status: 'live',
    tech: [TECH.r3f, TECH.gsap, TECH.glsl],
    media: { video: null, poster: null },
  },
  {
    id: 'potencia',
    name: 'Potencia Tutor Chatbot',
    blurb: 'RAG-grounded WhatsApp assistant that answers volunteer tutors straight from program documentation.',
    year: '2025',
    url: null,
    status: 'private',
    tech: [TECH.python, TECH.langchain, TECH.gcp],
    media: { video: null, poster: null },
  },
  {
    id: 'water-sim',
    name: 'Water Purification Sim',
    blurb: 'Unity 3D simulator teaching water treatment to 200+ environmental-engineering students at Tufts.',
    year: '2025',
    url: null,
    status: 'private',
    tech: [TECH.unity, TECH.csharp],
    media: { video: null, poster: null },
  },
  {
    id: 'ace',
    name: 'ACE++ Website',
    blurb: 'Where it started — my first website, built for the Tufts program that brought me into CS. Reached 500+ students at launch.',
    year: '2023',
    url: 'https://ed-key.github.io/ACE/',
    status: 'live',
    tech: [TECH.react, TECH.figma],
    media: { video: null, poster: null },
  },
]
```

- [ ] **Step 1.2: Keep the old directory rendering alive** (it is deleted in Task 3). In `src/components/PortfolioFloors.jsx` line 143, replace:

```jsx
                <span className="directory__stack">{project.stack}</span>
```

with:

```jsx
                <span className="directory__stack">{project.tech.map((t) => t.name).join(' · ')}</span>
```

- [ ] **Step 1.3: Verify**

Run: `npm run lint`
Expected: no errors. Then load the dev site, open the modal (Lab → Open), click Projects: directory rows still render with stack lines.

- [ ] **Step 1.4: Commit**

```bash
git add src/config/portfolioContent.js src/components/PortfolioFloors.jsx
git commit -m "Restructure PROJECTS data: tech glyphs, media ladder, status"
```

---

### Task 2: Vendor the 17 tech SVGs

**Files:**
- Create: `scripts/vendor-tech-icons.mjs`
- Create: `public/images/tech/*.svg` (17 files, generated)
- Modify: `CREDITS.md`, `package.json`

- [ ] **Step 2.1:** `npm install --save-dev simple-icons`

- [ ] **Step 2.2: Create `scripts/vendor-tech-icons.mjs`:**

```js
// Copies the tech-stack SVGs used by ProjectsPanel from the simple-icons
// package (CC0) into public/images/tech/. Re-run after adding a tech.
import { copyFile, mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'

const SLUGS = [
  'claude', 'csharp', 'figma', 'firebase', 'googlecloud', 'greensock',
  'langchain', 'nextdotjs', 'opengl', 'python', 'react', 'rust', 'stripe',
  'supabase', 'threedotjs', 'typescript', 'unity',
]
// If upstream renamed a slug, try these before failing.
const FALLBACKS = {
  claude: ['anthropic'],
  csharp: ['dotnet'],
  greensock: ['gsap'],
  opengl: ['webgl'],
}

const ICONS_DIR = path.resolve('node_modules/simple-icons/icons')
const OUT_DIR = path.resolve('public/images/tech')
await mkdir(OUT_DIR, { recursive: true })
const available = new Set(await readdir(ICONS_DIR))

let failed = false
for (const slug of SLUGS) {
  const candidates = [slug, ...(FALLBACKS[slug] ?? [])]
  const found = candidates.find((c) => available.has(`${c}.svg`))
  if (!found) {
    const near = [...available].filter((f) => f.includes(slug.slice(0, 4))).slice(0, 8)
    console.error(`MISSING ${slug} — near matches: ${near.join(', ') || 'none'}`)
    failed = true
    continue
  }
  await copyFile(path.join(ICONS_DIR, `${found}.svg`), path.join(OUT_DIR, `${slug}.svg`))
  console.log(`ok ${slug}${found === slug ? '' : ` (from ${found})`}`)
}
process.exit(failed ? 1 : 0)
```

- [ ] **Step 2.3: Run it**

Run: `node scripts/vendor-tech-icons.mjs && ls public/images/tech | wc -l`
Expected: 17 `ok …` lines, count `17`. If a slug prints `MISSING`, pick the right name from the near-matches, add it to `FALLBACKS`, and re-run. (Note: files are saved under the *requested* slug, so `TECH` in portfolioContent.js never changes.)

- [ ] **Step 2.4: Credit.** Append to `CREDITS.md`:

```markdown
- Tech logos in `public/images/tech/` from [Simple Icons](https://simpleicons.org) (CC0).
```

- [ ] **Step 2.5: Commit**

```bash
git add scripts/vendor-tech-icons.mjs public/images/tech CREDITS.md package.json package-lock.json
git commit -m "Vendor tech-stack SVGs from simple-icons"
```

---

### Task 3: ProjectsPanel — ring, engraved cells, idle stage (desktop)

**Files:**
- Create: `src/components/ProjectsPanel.jsx`
- Create: `src/components/ProjectsPanel.css`
- Modify: `src/components/PortfolioModal.jsx:4-13`
- Modify: `src/components/PortfolioFloors.jsx` (delete `ProjectsFloor`)
- Create: `scripts/shoot-projects.mjs`
- Modify: `.gitignore` (ignore `shots/`)

- [ ] **Step 3.1: Create `src/components/ProjectsPanel.jsx`** (stage interactivity arrives in Task 4 — this version renders the ring with a static idle plate):

```jsx
import { useState } from 'react'
import { PROJECTS } from '../config/portfolioContent'
import './ProjectsPanel.css'

// Floor 02 — the elevator button panel. Eight engraved cells ring an open
// center stage; hovering a cell "presses" it and the stage plays that
// project (video → poster → monogram ladder).

export function TechGlyph({ tech }) {
  return (
    <span
      aria-label={tech.name}
      className="tech-glyph"
      role="img"
      style={{ '--brand': tech.color, '--glyph': `url(/images/tech/${tech.slug}.svg)` }}
      title={tech.name}
    />
  )
}

function CellInner({ index, project }) {
  return (
    <>
      <span aria-hidden="true" className="panel-cell__num">
        {String(index + 1).padStart(2, '0')}
      </span>
      {project.status === 'private' && <span className="panel-cell__tag">Private build</span>}
      <span className="panel-cell__base">
        <span className="panel-cell__name">{project.name}</span>
        <span className="panel-cell__glyphs">
          {project.tech.map((tech) => (
            <TechGlyph key={tech.slug} tech={tech} />
          ))}
        </span>
      </span>
    </>
  )
}

function ProjectCell({ denied, index, onDeniedPress, project }) {
  const className = `panel-cell panel-cell--slot${index + 1}`

  if (project.url) {
    return (
      <a className={className} data-reveal href={project.url} rel="noreferrer" target="_blank">
        <CellInner index={index} project={project} />
      </a>
    )
  }

  return (
    <button
      className={className}
      data-denied={denied ? 'true' : undefined}
      data-reveal
      onClick={() => onDeniedPress(project.id)}
      type="button"
    >
      <CellInner index={index} project={project} />
    </button>
  )
}

function IdlePlate() {
  return (
    <div className="stage-idle">
      <span className="stage-idle__count">{String(PROJECTS.length).padStart(2, '0')}</span>
      <span className="stage-idle__hint">projects — hover a cell</span>
    </div>
  )
}

export default function ProjectsPanel() {
  const [deniedId, setDeniedId] = useState(null)

  // Locked floor: the button blinks but won't ride.
  const pressDenied = (id) => {
    setDeniedId(null)
    requestAnimationFrame(() => setDeniedId(id))
    setTimeout(() => setDeniedId((current) => (current === id ? null : current)), 600)
  }

  return (
    <article aria-label="Selected projects" className="floor floor--projects">
      <div className="projects-ring">
        {PROJECTS.map((project, index) => (
          <ProjectCell
            denied={deniedId === project.id}
            index={index}
            key={project.id}
            onDeniedPress={pressDenied}
            project={project}
          />
        ))}
        <div className="panel-stage" data-reveal>
          <IdlePlate />
        </div>
      </div>
    </article>
  )
}
```

- [ ] **Step 3.2: Create `src/components/ProjectsPanel.css`:**

```css
/* Floor 02 — button panel. Inherits the modal's custom properties. */

.projects-ring {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: 1fr 1.5fr 1fr;
  gap: clamp(8px, 1vw, 14px);
  height: min(72vh, 760px);
}

/* ring placement — reading order: top 01-03, left 04, right 05, bottom 06-08 */
.panel-cell--slot1 { grid-area: 1 / 1 / 2 / 5; }
.panel-cell--slot2 { grid-area: 1 / 5 / 2 / 9; }
.panel-cell--slot3 { grid-area: 1 / 9 / 2 / 13; }
.panel-cell--slot4 { grid-area: 2 / 1 / 3 / 4; }
.panel-cell--slot5 { grid-area: 2 / 10 / 3 / 13; }
.panel-cell--slot6 { grid-area: 3 / 1 / 4 / 5; }
.panel-cell--slot7 { grid-area: 3 / 5 / 4 / 9; }
.panel-cell--slot8 { grid-area: 3 / 9 / 4 / 13; }
.panel-stage { grid-area: 2 / 4 / 3 / 10; }

/* ---------- engraved cell ---------- */

.panel-cell {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-width: 0;
  padding: clamp(12px, 1.6vh, 18px) clamp(14px, 1.4vw, 20px);
  border: 1px solid var(--gold-hair);
  border-radius: 10px;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 2.5%), rgb(255 255 255 / 0%) 45%),
    rgb(240 200 112 / 2%);
  color: inherit;
  font: inherit;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: border-color 220ms ease, background-color 220ms ease;
}

.panel-cell:hover,
.panel-cell:focus-visible {
  border-color: rgb(240 200 112 / 55%);
  background-color: rgb(240 200 112 / 5%);
}

.panel-cell__num {
  position: absolute;
  top: 6px;
  right: 14px;
  color: rgb(240 200 112 / 11%);
  font-family: var(--font-display);
  font-size: clamp(2rem, 3.4vw, 3rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  transition: color 250ms ease, text-shadow 250ms ease;
}

/* the number IS the lamp */
.panel-cell:hover .panel-cell__num,
.panel-cell:focus-visible .panel-cell__num {
  color: rgb(240 200 112 / 92%);
  text-shadow: 0 0 18px rgb(240 200 112 / 45%);
}

.panel-cell__tag {
  position: absolute;
  top: 12px;
  left: 14px;
  padding: 4px 9px;
  border: 1px solid rgb(240 200 112 / 35%);
  border-radius: 999px;
  color: rgb(240 200 112 / 75%);
  font-family: var(--font-display);
  font-size: 0.56rem;
  font-weight: 640;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.panel-cell__base {
  display: grid;
  gap: 8px;
}

.panel-cell__name {
  overflow: hidden;
  font-family: var(--font-display);
  font-size: clamp(0.98rem, 1.3vw, 1.22rem);
  font-weight: 640;
  line-height: 1.12;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.panel-cell__glyphs {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* ---------- tech glyphs: etched gold → brand color on press ---------- */

.tech-glyph {
  width: 15px;
  height: 15px;
  flex: none;
  background-color: rgb(240 200 112 / 45%);
  transition: background-color 280ms ease;
  -webkit-mask: var(--glyph) center / contain no-repeat;
  mask: var(--glyph) center / contain no-repeat;
}

.panel-cell:hover .tech-glyph,
.panel-cell:focus-visible .tech-glyph {
  background-color: var(--brand);
}

/* ---------- locked floor: denied blink ---------- */

@keyframes cell-denied {
  0%, 100% { color: rgb(240 200 112 / 11%); }
  20%, 60% { color: rgb(240 200 112 / 92%); }
  40%, 80% { color: rgb(240 200 112 / 20%); }
}

@keyframes tag-pulse {
  30%, 70% { border-color: var(--gold); color: var(--gold); }
}

.panel-cell[data-denied='true'] .panel-cell__num { animation: cell-denied 550ms ease; }
.panel-cell[data-denied='true'] .panel-cell__tag { animation: tag-pulse 550ms ease; }

/* ---------- the stage ---------- */

.panel-stage {
  position: relative;
  overflow: hidden;
  border: 1px dashed rgb(240 200 112 / 25%);
  border-radius: 12px;
  background:
    radial-gradient(ellipse at 50% 62%, rgb(240 200 112 / 7%), transparent 70%),
    rgb(10 8 16 / 45%);
}

.stage-idle {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.stage-idle__count {
  color: rgb(240 200 112 / 35%);
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 3.6vw, 3.2rem);
  font-weight: 700;
  line-height: 1;
}

.stage-idle__hint {
  color: var(--ink-low);
  font-family: var(--font-display);
  font-size: 0.62rem;
  font-weight: 560;
  letter-spacing: 0.24em;
  text-transform: uppercase;
}
```

- [ ] **Step 3.3: Wire it in.** In `src/components/PortfolioModal.jsx`, replace lines 4–13:

```jsx
import { AboutFloor, ContactFloor, HomeFloor, ProjectsFloor } from './PortfolioFloors'
```
→
```jsx
import { AboutFloor, ContactFloor, HomeFloor } from './PortfolioFloors'
import ProjectsPanel from './ProjectsPanel'
```
and in `FLOOR_COMPONENTS`: `projects: ProjectsFloor,` → `projects: ProjectsPanel,`.

- [ ] **Step 3.4: Delete the old floor.** In `src/components/PortfolioFloors.jsx`: remove the whole `export function ProjectsFloor() { … }` block (lines 121–164) and remove `PROJECTS` from the import on line 1.

- [ ] **Step 3.5: Create `scripts/shoot-projects.mjs`** (the reusable eyeball tool):

```js
// Screenshot the Projects floor. Usage:
//   BASE_URL=http://127.0.0.1:5173 node scripts/shoot-projects.mjs
//   MOBILE=1 node scripts/shoot-projects.mjs   (390x844, taps first cell)
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const MOBILE = process.env.MOBILE === '1'
const browser = await chromium.launch()
const page = await browser.newPage({
  hasTouch: MOBILE, // page.tap() throws without this
  viewport: MOBILE ? { width: 390, height: 844 } : { width: 1440, height: 900 },
})

await page.goto(`${BASE}/?tools=1`)
await page.waitForTimeout(1500) // settle before Lab interactions or the open stalls
await page.getByRole('button', { name: 'Open', exact: true }).click()
await page.waitForSelector('[data-phase="open"]', { timeout: 15000 })
await page.waitForTimeout(600)

await page.locator('.floor-panel__button', { hasText: 'Projects' }).click()
await page.waitForTimeout(1000)
await page.screenshot({ path: 'shots/projects-idle.png' })
console.log('wrote shots/projects-idle.png')

if (MOBILE) {
  await page.locator('.panel-cell').first().tap()
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'shots/projects-mobile-open.png' })
  console.log('wrote shots/projects-mobile-open.png')
} else {
  await page.locator('.panel-cell').first().hover()
  await page.waitForTimeout(400)
  await page.screenshot({ path: 'shots/projects-hover.png' })
  console.log('wrote shots/projects-hover.png')
}

await browser.close()
```

- [ ] **Step 3.6:** Add `shots/` on its own line to `.gitignore` (after the `dist` line).

- [ ] **Step 3.7: Verify**

Run: `npm run lint` → no errors.
Run: `node scripts/shoot-projects.mjs` (dev server running; set `BASE_URL` if not :5173)
Read both PNGs. Expected: `projects-idle.png` shows 8 engraved cells ringing a dashed center plate reading "08 / projects — hover a cell"; `projects-hover.png` shows cell 01's big number lit gold and its glyphs in brand colors (cyan React atom). MOBILE mode is not expected to look right yet (Task 6).

- [ ] **Step 3.8: Commit**

```bash
git add src/components/ProjectsPanel.jsx src/components/ProjectsPanel.css \
  src/components/PortfolioModal.jsx src/components/PortfolioFloors.jsx \
  scripts/shoot-projects.mjs .gitignore
git commit -m "Build Projects button-panel ring with engraved cells and idle stage"
```

---

### Task 4: Stage reactions — hover intent, hold, text tier

**Files:**
- Modify: `src/components/ProjectsPanel.jsx`
- Modify: `src/components/ProjectsPanel.css` (append)

- [ ] **Step 4.1: Add interaction state.** In `ProjectsPanel.jsx`, replace the imports line and `ProjectsPanel` component with:

```jsx
import { useEffect, useRef, useState } from 'react'
```

```jsx
export default function ProjectsPanel() {
  const [deniedId, setDeniedId] = useState(null)
  const [activeId, setActiveId] = useState(null) // stage holds the last armed project
  const intentRef = useRef(null)

  useEffect(() => () => clearTimeout(intentRef.current), [])

  // ~100ms hover intent: sweeping across the ring doesn't thrash the stage.
  const armStage = (id) => {
    clearTimeout(intentRef.current)
    intentRef.current = setTimeout(() => setActiveId(id), 100)
  }
  const armStageNow = (id) => {
    clearTimeout(intentRef.current)
    setActiveId(id)
  }
  const disarmStage = () => clearTimeout(intentRef.current)

  const pressDenied = (id) => {
    setDeniedId(null)
    requestAnimationFrame(() => setDeniedId(id))
    setTimeout(() => setDeniedId((current) => (current === id ? null : current)), 600)
  }

  const activeProject = PROJECTS.find((project) => project.id === activeId) ?? null

  return (
    <article aria-label="Selected projects" className="floor floor--projects">
      <div className="projects-ring">
        {PROJECTS.map((project, index) => (
          <ProjectCell
            denied={deniedId === project.id}
            index={index}
            key={project.id}
            onArm={() => armStage(project.id)}
            onArmNow={() => armStageNow(project.id)}
            onDeniedPress={pressDenied}
            onDisarm={disarmStage}
            project={project}
          />
        ))}
        <div className="panel-stage" data-reveal>
          {activeProject ? <ProjectStage project={activeProject} /> : <IdlePlate />}
        </div>
      </div>
    </article>
  )
}
```

- [ ] **Step 4.2: Wire cells to the stage.** Replace `ProjectCell` with:

```jsx
function ProjectCell({ denied, index, onArm, onArmNow, onDeniedPress, onDisarm, project }) {
  const shared = {
    className: `panel-cell panel-cell--slot${index + 1}`,
    onFocus: onArmNow, // keyboard drives the stage exactly like hover
    onPointerEnter: (event) => {
      if (event.pointerType === 'mouse') onArm()
    },
    onPointerLeave: onDisarm, // cancels pending intent; stage HOLDS current project
    'data-reveal': true,
  }

  if (project.url) {
    return (
      <a {...shared} href={project.url} rel="noreferrer" target="_blank">
        <CellInner index={index} project={project} />
      </a>
    )
  }

  return (
    <button
      {...shared}
      data-denied={denied ? 'true' : undefined}
      onClick={() => onDeniedPress(project.id)}
      type="button"
    >
      <CellInner index={index} project={project} />
    </button>
  )
}
```

- [ ] **Step 4.3: Add the stage (text tier — media ladder lands in Task 5).** Add above `IdlePlate`:

```jsx
function ProjectStage({ project }) {
  const capsLine = `${project.tech.map((tech) => tech.name).join(' · ')} — ${project.year}`

  return (
    <div className="stage-show" key={project.id}>
      <div className="stage-show__text">
        <span aria-hidden="true" className="stage-show__mark">
          {project.name[0]}
        </span>
        <h3 className="stage-show__name">{project.name}</h3>
        <p className="stage-show__blurb">{project.blurb}</p>
        <span className="stage-show__glyphs">
          {project.tech.map((tech) => (
            <TechGlyph key={tech.slug} tech={tech} />
          ))}
        </span>
        <span className="stage-show__caps">{capsLine}</span>
        {project.url ? (
          <a className="stage-show__visit" href={project.url} rel="noreferrer" target="_blank">
            Visit ↗
          </a>
        ) : (
          <span className="panel-cell__tag stage-show__lock">Private build</span>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4.4: Append stage CSS** to `ProjectsPanel.css`:

```css
/* ---------- stage: active project ---------- */

.stage-show {
  position: absolute;
  inset: 0;
  display: flex;
  gap: clamp(16px, 2vw, 34px);
  align-items: center;
  justify-content: center;
  padding: clamp(14px, 2vh, 26px) clamp(16px, 2vw, 30px);
  animation: stage-in 320ms ease both;
}

@keyframes stage-in {
  from { opacity: 0; transform: translateY(8px); }
}

.stage-show__text {
  display: flex;
  flex-direction: column;
  gap: 9px;
  align-items: center;
  min-width: 0;
  max-width: 44ch;
  text-align: center;
}

.stage-show__mark {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid rgb(240 200 112 / 50%);
  border-radius: 50%;
  color: var(--gold);
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 640;
}

.stage-show__name {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.3rem, 2vw, 1.8rem);
  font-weight: 700;
  line-height: 1.08;
}

.stage-show__blurb {
  margin: 0;
  color: var(--ink-mid);
  font-family: var(--font-serif);
  font-size: clamp(0.92rem, 1.15vw, 1.05rem);
  font-weight: 420;
  line-height: 1.5;
}

.stage-show__glyphs {
  display: flex;
  gap: 11px;
  align-items: center;
}

/* stage glyphs are always awake (brand color) */
.stage-show .tech-glyph {
  width: 16px;
  height: 16px;
  background-color: var(--brand);
}

.stage-show__caps {
  color: rgb(240 200 112 / 70%);
  font-family: var(--font-display);
  font-size: 0.58rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.stage-show__visit {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  margin-top: 2px;
  padding: 8px 16px;
  border-radius: 999px;
  color: var(--void-deep);
  background: var(--gold);
  font-family: var(--font-display);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-decoration: none;
  text-transform: uppercase;
  transition: background-color 200ms ease;
}

.stage-show__visit:hover,
.stage-show__visit:focus-visible {
  background: #ffe7c2;
}

.stage-show__lock {
  position: static;
  margin-top: 2px;
}
```

- [ ] **Step 4.5: Verify**

Run: `npm run lint` → clean.
Run: `node scripts/shoot-projects.mjs`, Read `shots/projects-hover.png`.
Expected: center shows PageAura — monogram circle "P", name, serif blurb, brand-color glyphs, caps line ending "— 2026", gold "Visit ↗" pill. Manually confirm in the browser: hovering Showdown Copilot then moving the cursor into the center gap keeps Showdown Copilot on stage (hold behavior); clicking Showdown Copilot blinks its number (denied) and navigates nowhere; Tab-focusing cells drives the stage.

- [ ] **Step 4.6: Commit**

```bash
git add src/components/ProjectsPanel.jsx src/components/ProjectsPanel.css
git commit -m "Stage reacts to cells: hover intent, hold, text tier"
```

---

### Task 5: Media ladder — video → poster → monogram

**Files:**
- Modify: `src/components/ProjectsPanel.jsx`
- Modify: `src/components/ProjectsPanel.css` (append)
- Create: `public/media/projects/.gitkeep` (empty)

- [ ] **Step 5.1: Reduced-motion hook + media component.** In `ProjectsPanel.jsx`, add below `TechGlyph`:

```jsx
function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
  )

  useEffect(() => {
    const mql = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mql) return undefined
    const onChange = (event) => setReduced(event.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return reduced
}

// Ladder: video → poster → null (text tier's monogram carries the stage).
// Only the active project's <video> is ever mounted, and only when motion
// is allowed; reduced-motion visitors get the poster tier.
function StageMedia({ project, reducedMotion }) {
  const { poster, video } = project.media
  const showVideo = Boolean(video) && !reducedMotion

  if (!showVideo && !poster) return null

  return (
    <div className="stage-show__window">
      {showVideo && <span className="stage-show__live">Live</span>}
      <span aria-hidden="true" className="stage-show__windowbar">
        <i /><i /><i />
      </span>
      {showVideo ? (
        <video
          autoPlay
          key={project.id}
          loop
          muted
          playsInline
          poster={poster ?? undefined}
          src={video}
        />
      ) : (
        <img alt={`${project.name} screenshot`} src={poster} />
      )}
    </div>
  )
}
```

- [ ] **Step 5.2: Mount it in the stage.** In `ProjectStage`, accept and render media — replace the component's signature and opening with:

```jsx
function ProjectStage({ project, reducedMotion }) {
  const capsLine = `${project.tech.map((tech) => tech.name).join(' · ')} — ${project.year}`
  const hasWindow = Boolean(project.media.video || project.media.poster)

  return (
    <div className={hasWindow ? 'stage-show stage-show--windowed' : 'stage-show'} key={project.id}>
      <StageMedia project={project} reducedMotion={reducedMotion} />
      <div className="stage-show__text">
```

(rest of the text column unchanged), and in `ProjectsPanel` add `const reducedMotion = useReducedMotion()` next to the other hooks and pass it: `<ProjectStage project={activeProject} reducedMotion={reducedMotion} />`.

- [ ] **Step 5.3: Append window CSS:**

```css
/* ---------- stage media window ---------- */

.stage-show--windowed .stage-show__text {
  align-items: flex-start;
  max-width: 38%;
  text-align: left;
}

.stage-show__window {
  position: relative;
  flex: none;
  width: min(46%, 380px);
  overflow: hidden;
  border: 1px solid rgb(240 200 112 / 30%);
  border-radius: 10px;
  background: var(--void-deep);
  box-shadow: 0 18px 50px rgb(0 0 0 / 55%), 0 0 40px rgb(240 200 112 / 7%);
  transform: rotate(-1.6deg);
}

.stage-show__windowbar {
  display: flex;
  gap: 4px;
  align-items: center;
  height: 20px;
  padding: 0 9px;
  border-bottom: 1px solid rgb(240 200 112 / 12%);
  background: rgb(255 255 255 / 4%);
}

.stage-show__windowbar i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgb(240 200 112 / 30%);
}

.stage-show__window video,
.stage-show__window img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}

.stage-show__live {
  position: absolute;
  top: 26px;
  right: 10px;
  z-index: 1;
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 8px;
  border-radius: 999px;
  color: var(--void-deep);
  background: var(--gold);
  font-family: var(--font-display);
  font-size: 0.5rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.stage-show__live::before {
  content: '';
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--void-deep);
  animation: live-blink 1.2s steps(2) infinite;
}

@keyframes live-blink {
  50% { opacity: 0.25; }
}

@media (prefers-reduced-motion: reduce) {
  .stage-show { animation: none; }
  .stage-show__live::before { animation: none; }
}
```

- [ ] **Step 5.4:** `mkdir -p public/media/projects && touch public/media/projects/.gitkeep`

- [ ] **Step 5.5: Verify the ladder.** All media is `null`, so the floor must look identical to Task 4 (`node scripts/shoot-projects.mjs`, compare). Then prove the poster tier: temporarily set pageaura's media to `{ video: null, poster: '/images/eddie.jpg' }`, re-shoot, Read the PNG — expect the tilted gold-framed window beside a left-aligned text column. **Revert the temporary poster change.** The video tier can't be exercised without a real mp4 — that smoke test is Task 8 Step 8.4.

- [ ] **Step 5.6: Commit**

```bash
git add src/components/ProjectsPanel.jsx src/components/ProjectsPanel.css public/media/projects/.gitkeep
git commit -m "Stage media ladder: video/poster window with monogram fallback"
```

---

### Task 6: Mobile / touch accordion

**Files:**
- Modify: `src/components/ProjectsPanel.jsx`
- Modify: `src/components/ProjectsPanel.css` (append)

- [ ] **Step 6.1: Compact-mode hook.** Add next to `useReducedMotion` (generalize the existing pattern):

```jsx
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia?.(query).matches ?? false)

  useEffect(() => {
    const mql = window.matchMedia?.(query)
    if (!mql) return undefined
    const onChange = (event) => setMatches(event.matches)
    mql.addEventListener('change', onChange)
    setMatches(mql.matches)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}
```

and refactor `useReducedMotion` to `return useMediaQuery('(prefers-reduced-motion: reduce)')` (single line, delete its old body).

- [ ] **Step 6.2: Accordion rendering.** In `ProjectsPanel`, add:

```jsx
  const compact = useMediaQuery('(max-width: 900px), (pointer: coarse)')
  const [expandedId, setExpandedId] = useState(null)
```

and before the desktop `return`, add the compact branch:

```jsx
  if (compact) {
    return (
      <article aria-label="Selected projects" className="floor floor--projects">
        <div className="projects-stack">
          {PROJECTS.map((project, index) => {
            const expanded = expandedId === project.id
            return (
              <div className={expanded ? 'panel-cell panel-cell--open' : 'panel-cell'} data-reveal key={project.id}>
                <button
                  aria-expanded={expanded}
                  className="panel-cell__toggle"
                  onClick={() => setExpandedId(expanded ? null : project.id)}
                  type="button"
                >
                  <CellInner index={index} project={project} />
                </button>
                <div aria-hidden={!expanded} className="panel-cell__drawer">
                  <div className="panel-cell__drawer-inner">
                    <StageMedia project={project} reducedMotion={reducedMotion || !expanded} />
                    <p className="stage-show__blurb">{project.blurb}</p>
                    {project.url ? (
                      <a className="stage-show__visit" href={project.url} rel="noreferrer" target="_blank" tabIndex={expanded ? 0 : -1}>
                        Visit ↗
                      </a>
                    ) : (
                      <span className="panel-cell__tag stage-show__lock">Private build</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </article>
    )
  }
```

(`reducedMotion || !expanded` keeps collapsed drawers from mounting `<video>` elements — only the open drawer plays.)

- [ ] **Step 6.3: Append compact CSS:**

```css
/* ---------- compact: stacked accordion (touch / narrow) ---------- */

.projects-stack {
  display: grid;
  gap: 10px;
}

.projects-stack .panel-cell {
  display: grid;
  padding: 0;
  cursor: default;
}

.panel-cell__toggle {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 92px;
  padding: 14px 16px;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.projects-stack .panel-cell__num { font-size: 1.9rem; }

/* expanding drawer — 0fr → 1fr grid-rows trick */
.panel-cell__drawer {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 360ms ease;
}

.panel-cell--open .panel-cell__drawer { grid-template-rows: 1fr; }

.panel-cell__drawer-inner {
  display: grid;
  gap: 12px;
  justify-items: start;
  min-height: 0;
  overflow: hidden;
  padding: 0 16px;
}

.panel-cell--open .panel-cell__drawer-inner { padding: 4px 16px 16px; }

.panel-cell--open {
  border-color: rgb(240 200 112 / 55%);
}

.panel-cell--open .panel-cell__num {
  color: rgb(240 200 112 / 92%);
  text-shadow: 0 0 18px rgb(240 200 112 / 45%);
}

.panel-cell--open .tech-glyph { background-color: var(--brand); }

.projects-stack .stage-show__window {
  width: min(100%, 420px);
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .panel-cell__drawer { transition: none; }
}
```

- [ ] **Step 6.4: Verify**

Run: `npm run lint` → clean.
Run: `MOBILE=1 node scripts/shoot-projects.mjs`, Read `shots/projects-mobile-open.png`.
Expected: stacked full-width cells; the first cell expanded with lit number, brand glyphs, blurb, and Visit pill below it. Desktop re-shoot unchanged.

- [ ] **Step 6.5: Commit**

```bash
git add src/components/ProjectsPanel.jsx src/components/ProjectsPanel.css
git commit -m "Compact accordion for touch and narrow viewports"
```

---

### Task 7: Site-wide snap scroll

**Files:**
- Modify: `src/components/PortfolioModal.jsx`
- Modify: `src/components/PortfolioModal.css`

- [ ] **Step 7.1: Render all floors as sections.** In `PortfolioModal.jsx`:

Replace the floor-state block (lines 16–22 area):

```jsx
  const containerRef = useRef(null)
  const scrollerRef = useRef(null)
  const progressRef = useRef({ value: 0 })
  const [activeFloorId, setActiveFloorId] = useState('home')
  const reducedMotion = useMemo(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false, [])
  const activeFloor = PORTFOLIO_FLOORS.find((floor) => floor.id === activeFloorId) ?? PORTFOLIO_FLOORS[0]
```

(`contentRef` and `ActiveFloorBody` are gone.)

Replace `<main className="site-content">…</main>` (lines 155–164) with:

```jsx
        <main className="site-content" ref={scrollerRef}>
          {PORTFOLIO_FLOORS.map((floor) => {
            const FloorBody = FLOOR_COMPONENTS[floor.id]

            return (
              <section className="floor-section" data-floor={floor.id} key={floor.id}>
                <div className="site-content__inner">
                  <p className="floor-indicator" data-reveal>
                    <span className="floor-indicator__num">{floor.number}</span>
                    <span aria-hidden="true" className="floor-indicator__rule" />
                    <span className="floor-indicator__label">{floor.label}</span>
                  </p>
                  <FloorBody />
                </div>
              </section>
            )
          })}
        </main>
```

- [ ] **Step 7.2: Replace the floor-change effects.** Delete BOTH the "Arriving at a floor" `useLayoutEffect` (lines 71–91) and the whole `goToFloor` tween callback (lines 93–115). Add in their place:

```jsx
  // Scroll position drives the panel lamp: a section is "current" while it
  // crosses the middle band of the scroller (robust for tall floors).
  useEffect(() => {
    if (phase === 'closed') return undefined

    const scroller = scrollerRef.current

    if (!scroller) return undefined

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveFloorId(entry.target.dataset.floor)
        })
      },
      { root: scroller, rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )

    scroller.querySelectorAll('.floor-section').forEach((section) => io.observe(section))

    return () => io.disconnect()
  }, [phase])

  // Each floor staggers its content in as it enters, and resets once it has
  // fully left so re-entry replays the arrival — the elevator settling.
  useEffect(() => {
    if (phase === 'closed') return undefined

    const scroller = scrollerRef.current

    if (!scroller) return undefined

    const sections = Array.from(scroller.querySelectorAll('.floor-section'))

    if (reducedMotion) {
      sections.forEach((section) => gsap.set(section.querySelectorAll('[data-reveal]'), { autoAlpha: 1, y: 0 }))

      return undefined
    }

    sections.forEach((section) => gsap.set(section.querySelectorAll('[data-reveal]'), { autoAlpha: 0, y: 18 }))
    const revealed = new Set()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.dataset.floor
          const targets = entry.target.querySelectorAll('[data-reveal]')

          if (entry.intersectionRatio >= 0.25 && !revealed.has(id)) {
            revealed.add(id)
            gsap.to(targets, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.06, overwrite: 'auto' })
          } else if (!entry.isIntersecting && revealed.has(id)) {
            revealed.delete(id)
            gsap.set(targets, { autoAlpha: 0, y: 18 })
          }
        })
      },
      { root: scroller, threshold: [0, 0.25] },
    )

    sections.forEach((section) => io.observe(section))

    return () => {
      io.disconnect()
      gsap.killTweensOf(scroller.querySelectorAll('[data-reveal]'))
    }
  }, [phase, reducedMotion])

  const goToFloor = useCallback(
    (floorId) => {
      const section = scrollerRef.current?.querySelector(`[data-floor="${floorId}"]`)

      section?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
    },
    [reducedMotion],
  )
```

Note: `useLayoutEffect` stays imported (the `applyProgress` layout effect at line 39 still uses it). The new `goToFloor` replaces the old one wholesale — no `activeFloorId` guard, it scrolls unconditionally.

- [ ] **Step 7.3: Snap CSS.** In `PortfolioModal.css`, update `.site-content` (line 209) by adding two declarations, and add `.floor-section`:

```css
.site-content {
  position: relative;
  z-index: 1;
  grid-area: content;
  min-height: 0;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scrollbar-width: thin;
  scrollbar-color: rgb(240 200 112 / 30%) transparent;
}

.floor-section {
  display: grid;
  min-height: 100%;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
```

(`.site-content__inner` keeps `min-height: 100%` — it now fills its section instead of the scroller; no change needed.)

- [ ] **Step 7.4: Verify**

Run: `npm run lint` → clean.
Manual drive (this is the feel task): open the modal, scroll — floors snap one at a time, content staggers in per arrival, panel lamp follows; scroll back up — floors re-stagger; click panel "Contact" — smooth ride down, lamp lands on 04; on the Projects floor, hovering cells still works mid-scroll-idle.
Run: `node scripts/shoot-projects.mjs` — still passes (panel click now scrolls).

- [ ] **Step 7.5: Commit**

```bash
git add src/components/PortfolioModal.jsx src/components/PortfolioModal.css
git commit -m "Snap-scroll floors: continuous travel with IO lamp and reveal"
```

---

### Task 8: Cleanup, assertion script, final verification

**Files:**
- Modify: `src/components/PortfolioModal.css` (delete dead styles)
- Create: `scripts/verify-projects-floor.mjs`

- [ ] **Step 8.1: Purge the directory styles.** In `PortfolioModal.css` delete the whole `/* ---------- floor 02 · projects directory ---------- */` block (lines 532–638) and the three `.directory…` rules inside the `@media (max-width: 880px)` block (lines 909–922). Then:

Run: `grep -rn "directory" src/`
Expected: no matches.

- [ ] **Step 8.2: Create `scripts/verify-projects-floor.mjs`:**

```js
// Asserts the Projects button-panel floor + snap scroll end-to-end.
// Usage: BASE_URL=http://127.0.0.1:5173 node scripts/verify-projects-floor.mjs
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
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
await page.waitForTimeout(600)
check('modal reaches open phase', true)

await page.locator('.floor-panel__button', { hasText: 'Projects' }).click()
await page.waitForTimeout(1200)
check('ring renders 8 cells', (await page.locator('.panel-cell').count()) === 8)
check('idle plate shows count', await page.locator('.stage-idle__count').isVisible())

await page.locator('.panel-cell').first().hover()
await page.waitForTimeout(400)
check('hover puts PageAura on stage', await page.locator('.stage-show__name', { hasText: 'PageAura' }).isVisible())

await page.locator('.panel-stage').hover() // move off the cells onto the stage itself
await page.waitForTimeout(300)
check('stage holds after pointer leaves', await page.locator('.stage-show__name', { hasText: 'PageAura' }).isVisible())

const before = page.context().pages().length
await page.locator('button.panel-cell', { hasText: 'Showdown Copilot' }).click()
await page.waitForTimeout(150)
check('private press blinks (data-denied)', (await page.locator('[data-denied="true"]').count()) === 1)
await page.waitForTimeout(600)
check('private press opens no page', page.context().pages().length === before)

await page.locator('.floor-panel__button', { hasText: 'Contact' }).click()
await page.waitForTimeout(1400)
check(
  'panel lamp follows scroll to Contact',
  (await page.locator('.floor-panel__button', { hasText: 'Contact' }).getAttribute('aria-current')) === 'true',
)

await page.locator('.floor-panel__button', { hasText: 'Lobby' }).click()
await page.waitForTimeout(1400)
check(
  'riding back re-lights Lobby',
  (await page.locator('.floor-panel__button', { hasText: 'Lobby' }).getAttribute('aria-current')) === 'true',
)

await browser.close()
console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)
```

- [ ] **Step 8.3: Run it**

Run: `node scripts/verify-projects-floor.mjs`
Expected: 9 PASS lines, `ALL CHECKS PASSED`, exit 0.

- [ ] **Step 8.4: Optional video-tier smoke test** (only if any small mp4 is on hand): drop it at `public/media/projects/pageaura.mp4`, set pageaura `media.video: '/media/projects/pageaura.mp4'`, re-shoot, confirm the window plays with the LIVE badge, then revert both.

- [ ] **Step 8.5: Build + lint gate**

Run: `npm run lint && npm run build`
Expected: both clean.

- [ ] **Step 8.6: Commit**

```bash
git add src/components/PortfolioModal.css scripts/verify-projects-floor.mjs
git commit -m "Retire directory styles; add Projects floor verification script"
```

---

## Non-blocking follow-ups (content, not code)

- Record the 8 demo loops (8–12s, muted, 16:10-ish) → `public/media/projects/<id>.mp4` + a poster jpg each; fill `media` in `portfolioContent.js`. The ladder upgrades per-project with zero code changes.
- PageAura and This Elevator currently link to the GitHub profile; point at real repos/sites when ready. Showdown Copilot + Avirem flip `status`/`url` when their repos publish.
