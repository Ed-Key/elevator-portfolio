# PageAura stage media design

2026-07-18. Approved by Ed in conversation; media-only approach chosen over
full Showdown parity and over a bespoke animation layer.

## Goal

Give PageAura's hover panel in the projects section the same living
treatment Showdown Copilot has: demo footage in the browser frame, a dimmed
teaser looping behind the stage, and stills peeking out from behind the
window. PageAura keeps its book logo and `pageauraSparkles` stage mark.

## Source material

Ed's screen recording of the polished pageaura.app
(2m17s, 3024x1898, working copy at `/tmp/pageaura-ui-bugs/recording.mov`).
The final ~30s of the recording demonstrates two UI bugs (transparent
settings modal and contents drawer) captured separately for a PageAura
ticket. That section must not appear in any produced asset.

## Assets to produce (all in `public/media/projects/`)

- `pageaura-demo.mp4`: the demo flow trimmed from the recording, bug
  section cut. 1080p h264, target well under 10 MB.
- `pageaura-shelf.png`: replaced in place with a fresh frame from the
  recording (same filename, so the poster slot needs no config change).
- `pageaura-teaser.mp4`: short loopable calm stretch from the same
  recording, small like showdown-teaser.mp4 (~320 KB class).
- `pageaura-cover-*.png`: 3 or 4 book covers from the public shelf,
  used as cycling props.

## Code change

`src/config/portfolioContent.js` only: PageAura's `media` block gains
`video`, `backdrop`, and `prop`. `logo`, `poster` path, and `stageMark`
stay as they are. No component or CSS changes; `ProjectsPanel.jsx`
already renders all three slots generically.

## Verification

`npm run lint && npm run build`, then drive the projects panel in the
browser per the project verify skill: video plays in the frame, backdrop
dims behind the stage, props cycle, reduced motion falls back to the
poster. PR into dev; the Vercel preview is the review surface before
anything reaches production.
