# Portfolio modal copy and consistency polish

Date: 2026-07-22
Branch: `style/portfolio-polish` (off `origin/dev`)

## Goal

Remove machine-written tells from the portfolio modal: redraft the prose in
Ed's voice, unify the two competing link treatments, and drop the ornamental
floor numbers from section headers. No layout redesign, no new features.

## Scope

In scope: main prose (home lede, bio, contact line), all eight project
blurbs, link treatment on Home and Contact floors, floor-section headers.

Out of scope (explicitly deferred by Ed): themed microcopy ("Ground floor —
doors open", "Rated for", "projects — hover a cell"), a blanket purge of
`<em>` italics, and anything on the Projects stage visuals.

## Copy changes

All copy lives in `src/config/portfolioContent.js` and
`src/components/PortfolioFloors.jsx`.

### Home lede (`PortfolioFloors.jsx`, HomeFloor)

Before:
> Based in *New York / New Jersey*, I build products end to end — React
> frontends, cloud backends, and AI features that hold up in production. It
> started with ed-tech at Tufts, and the goal hasn't changed: building
> products that bring *real value* to the people using them.

After (italics kept on the location only):
> I build web products end to end from the *New York / New Jersey* area. I
> started in ed-tech at Tufts, and shipping things people actually use is
> still the whole point.

### Bio paragraph 1 (`portfolioContent.js`, BIO[0])

Before:
> Computer science at Tufts School of Engineering, class of '25. Since then
> I've shipped agent-evaluation infrastructure at Matrices.ai, built
> social-platform integrations at GoDaddy, and put a 3D simulator in front
> of two hundred engineering students.

After:
> Computer science at Tufts School of Engineering, class of '25. I've built
> agent-evaluation infrastructure at Matrices.ai and interned at GoDaddy on
> social-platform integrations. Along the way I put a 3D simulator in front
> of two hundred engineering students.

### Bio paragraph 2 (`portfolioContent.js`, BIO[1])

Before:
> I like software that feels considered — interfaces with motion and
> weight, tools that respect the person using them.

After:
> I care a lot about how interfaces feel. Most of my side projects start
> there.

### Contact line (`PortfolioFloors.jsx`, ContactFloor)

Before:
> Open to full-time roles and *interesting collaborations*.

After (no italics):
> Looking for a full-time role. If you're building something good, email me.

### Project blurbs (`portfolioContent.js`, PROJECTS)

| Project | New blurb |
|---|---|
| PageAura | My public bookshelf and the EPUB reader behind it. Upload books to build your own shelf, or just listen. |
| Showdown Copilot | An advisor that suggests moves during live Pokémon Showdown battles, built on Monte Carlo tree search in Rust. |
| Daily Bread | A YouVersion companion that puts the verse of the day in every new tab. Study notes and prayer are one click away. |
| Avirem | A marketplace where patients find and book aesthetic-medicine providers. Payments run on Stripe Connect. |
| This Elevator | This site. A 3D elevator ride built with React Three Fiber, with a shader-driven reveal into the portfolio. |
| Potencia Tutor Chatbot | A WhatsApp assistant that answers volunteer tutors' questions from program documents during live sessions. |
| Water Purification Sim | A Unity simulator that teaches water-treatment systems, used by two hundred engineering students at Tufts. |
| ACE++ Website | The first website I shipped: a CS access program site at Tufts that reached 500+ students at launch. |

## Link treatment unification

The Home floor treatment wins: brand icon + normal-case name (GitHub,
LinkedIn, Resume). ContactFloor drops the letterspaced-caps "GITHUB ↗"
list and adopts the same icon + name markup, and gains the Resume link so
both floors offer the same set. The icon components already live in
`PortfolioFloors.jsx`; ContactFloor reuses them. The `.contact-links`
markup switches to the `.home-links` class so one CSS block styles both
floors, and the now-unused `.contact-links` rules are deleted.

## Floor headers

The per-section indicator currently renders `02 —— PROJECTS` (number, rule,
label) via `.floor-indicator` in `PortfolioModal.jsx`. The number and rule
are removed; only the letterspaced label remains. The elevator-panel nav on
the left keeps its numbers, where they read as elevator buttons. Dead CSS
for `.floor-indicator__num` / `__rule` is deleted with the markup.

## Error handling

Not applicable: static copy and markup changes only. The reveal animations
target `[data-reveal]` elements, which all survive; removing the number and
rule spans inside the indicator does not change its `data-reveal` behavior.

## Verification

- `npm run lint && npm run build`
- Browser pass over all four floors at desktop and narrow widths, checking
  the new contact links and header treatment.
- Before/after screenshots for the PR under `docs/pr-media/portfolio-copy/`.

## Non-goals

No changes to the 3D hall, the modal reveal shader, floor-panel nav
behavior, or the Projects stage media system.
