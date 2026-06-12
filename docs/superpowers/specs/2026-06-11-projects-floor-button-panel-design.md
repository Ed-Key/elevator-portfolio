# Projects Floor — Button Panel Design (+ Site-Wide Snap Scroll)

**Date:** 2026-06-11
**Status:** Approved by Eddie (brainstormed via visual companion; all five
core decisions picked from live mockups)

## Concept

The Projects floor stops being a directory list and becomes the elevator's
**button panel**: eight project cells ring the page like floor buttons around
an open center stage. Hovering a cell "presses" it — the engraved number
lights up, the cell's tech logos wake from etched gold into their real brand
colors, and the center stage plays that project's demo loop. Pressing a cell
with a public URL rides you there (new tab); pressing a private one blinks
the button and refuses, like a locked floor.

Alongside the floor rebuild, the whole site moves from click-only floor
swaps to **continuous snap scrolling** — floors stack into one scrollable
line with magnetic snap points, so visitors who instinctively scroll travel
the building.

Decisions made in brainstorm (each picked from 2–3 live alternatives):

| Decision      | Chosen                                          |
| ------------- | ----------------------------------------------- |
| Floor plan    | A — Button Panel (perimeter ring, center stage) |
| Cell anatomy  | 3 — Engraved Button                             |
| Tech logos    | 3 — Wake-Up Color (gold at rest → brand on hover) |
| Stage content | C — Living Demo (with fallback ladder)          |
| Floor nav     | B — Snap Scroll (continuous, magnetic floors)   |

## Floor plan

- Desktop (≥ ~900px): CSS grid ring sized to exactly one viewport —
  3 cells across the top, 1 on each side flanking the stage, 3 across the
  bottom. Stage occupies the center (~half the panel width, middle row).
- Cell order follows `PROJECTS` order, numbered `01`–`08` in reading
  order: top row 01–03, left 04, right 05, bottom row 06–08.
- The floor indicator ("02 — Projects") stays at the top; the ring fills
  the remaining height.
- Below ~900px or on coarse pointers: ring collapses to the mobile
  accordion (see Mobile).

## The cell — engraved elevator button

Anatomy (bottom-aligned content, number engraved top-right):

- **Engraved number** — large (~42px+) Bricolage Grotesque, gold at ~11%
  opacity at rest. On hover/focus it lights to ~92% gold with a soft glow:
  the number IS the lamp (no separate lamp dot).
- **Project name** — Bricolage 600.
- **Tech glyphs** — small SVG logos of the stack, tinted `--gold` at ~45%
  opacity at rest. On cell hover/focus they crossfade to full brand colors
  (React cyan, Rust orange, Firebase amber…). This is the only non-gold
  color on the site and only appears under the cursor. Tooltips
  (`title` + `aria-label`) name each glyph.
- **`PRIVATE BUILD` tag** — small gold-hairline pill, top-left, only on
  projects with `status: 'private'`.
- No blurbs or years in cells — the stage carries those.

States: rest → hover/focus-visible (border brightens, number + glyphs wake,
stage follows) → pressed.

## Click = ride

- Cell with `url`: plain `<a target="_blank">` — pressing the button rides
  to the project.
- Private cell (`url: null`): `<button>` whose press plays a short "denied"
  blink — the engraved number flickers and the `PRIVATE BUILD` tag pulses.
  No navigation, no modal, no pinning.

## The stage — living demos, fallback ladder

Layout (inside the ring's center): text column (name, italic Newsreader
blurb, brand-color glyphs, `STACK — YEAR` caps line, `Visit ↗` pill when
public) beside a slightly tilted, gold-framed browser window where the
demo plays. A small `LIVE` badge sits on the window when a video is
playing. If the center is too narrow for side-by-side, window stacks
above text.

**Fallback ladder per project** — the stage renders the best asset
available, so the floor ships before any recordings exist:

1. `media.video` — muted 8–12s loop (`muted loop playsinline
   preload="none"`, poster shown while loading)
2. `media.poster` — static screenshot in the same framed window
3. neither — monogram plate (circled initial + type), no window

Mechanics:

- **Hover intent:** ~100ms delay before the stage switches projects, so
  sweeping the cursor across the ring doesn't thrash video elements.
- **One `<video>` mounted at a time** — only the active project's.
- Videos lazy-load on first arrival at the Projects floor, never before.
- **Stage holds** the last hovered project when the cursor leaves the
  ring; the idle plate ("08 projects — hover a cell" + drifting glow)
  appears only before first interaction.
- Keyboard: focusing a cell drives the stage exactly like hover.
- `prefers-reduced-motion`: videos don't autoplay; the poster/monogram
  tier renders instead, and stage crossfades become instant swaps.

## Site-wide: snap scroll

- All four floors render at once, stacked in one scroll container
  (`.site-content` becomes the scroller): `scroll-snap-type: y mandatory`,
  each floor `min-height: 100%`, `scroll-snap-align: start`.
- An IntersectionObserver (threshold ~0.6) sets the active floor: panel
  lamp follows scroll, and each floor's `data-reveal` stagger fires as it
  enters (re-firing on re-entry, matching today's feel).
- Floor panel buttons smooth-scroll to their floor
  (`scrollIntoView({ behavior: 'smooth' })`).
- Floors taller than the viewport (About on laptops) still scroll freely —
  CSS snap releases inside sections taller than the snapport.
- `prefers-reduced-motion`: instant jumps (`behavior: 'auto'`), no stagger.
- The GSAP fade-out/in floor swap (`goToFloor` content tween) retires; the
  modal's shimmer reveal and backdrop are untouched.

## Mobile / touch (coarse pointer or < ~900px)

- Cells stack as full-width engraved buttons in `PROJECTS` order.
- Tapping a cell expands it inline (accordion): demo loop (same ladder),
  blurb, brand-color glyphs, `Visit ↗` or `PRIVATE BUILD` behavior.
  One cell open at a time; tapping again collapses.
- No center stage on mobile — the expansion IS the stage.

## Data model & assets

`PROJECTS` entries change shape:

```js
{
  id: 'pageaura',
  name: 'PageAura',
  blurb: '…',
  year: '2026',
  url: 'https://…' | null,
  status: 'live' | 'private',
  tech: [{ name: 'React', slug: 'react', color: '#61DAFB' }, …],
  media: { video: '/media/projects/pageaura.mp4' | null,
           poster: '/media/projects/pageaura.jpg' | null },
}
```

- The legacy `stack` string retires; the caps line derives from
  `tech[].name`.
- ~16 tech SVGs vendored from simple-icons (CC0) into
  `public/images/tech/<slug>.svg`, inlined/masked so CSS controls tint
  (gold rest state → brand `color` on hover). No runtime CDN.
- Demo media lives in `public/media/projects/`. Eddie records the 8 loops
  over time; nothing blocks on them (ladder).
- Old `.directory` markup and CSS are removed.

## Out of scope

- Recording the 8 demo loops (content task, trickles in later).
- Auto-cycling the stage while idle (revisit after launch if the floor
  feels static).
- URL hash routing per floor.
- Any change to the elevator ride, lobby, about, or contact content.
