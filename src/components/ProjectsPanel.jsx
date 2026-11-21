import { useEffect, useRef, useState } from 'react'
import { LANGUAGES, PROJECTS } from '../config/portfolioContent'
import { useMediaQuery, useReducedMotion } from '../hooks/useMediaQuery'
import PageAuraMark from './PageAuraMark'
import StageModel from './StageModel'
import './ProjectsPanel.css'

// Floor 2: a plain list of projects (name, one-line tag, tech glyphs) beside
// one large screen. Hovering, focusing or tapping a row puts that project on
// the screen; its footage plays while the screen is in view.

function TechGlyph({ tech }) {
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

// Stills tucked behind the screen with a corner peeking out. With several
// faces it cycles; reduced motion pins the first face. Keyed by project, so
// each project's stack starts fresh.
function StageProps({ reducedMotion, srcs }) {
  const [face, setFace] = useState(0)

  useEffect(() => {
    if (reducedMotion || srcs.length < 2) return undefined
    const id = setInterval(() => setFace((n) => (n + 1) % srcs.length), 7000)
    return () => clearInterval(id)
  }, [reducedMotion, srcs.length])

  return <img alt="" aria-hidden="true" className="projects-prop" key={face} src={srcs[face]} />
}

// The project's own mark beside its caption: PageAura's sparkling book, or a
// 3D logo turntable (its flat logo under reduced motion).
function CaptionMark({ paused, project, reducedMotion }) {
  const { logo, mark, model } = project.media
  if (mark === 'pageaura') return <PageAuraMark />
  if (model && !reducedMotion) {
    return (
      <StageModel
        paused={paused}
        poster={logo ? <img alt="" className="projects-mark__logo" src={logo} /> : null}
        src={model}
      />
    )
  }
  if (logo) return <img alt="" aria-hidden="true" className="projects-mark__logo" src={logo} />
  return null
}

// The "Rated for" plate: every language, etched; the staged project lights
// the ones it is built in.
function RatedFor({ projectId }) {
  return (
    <div className="projects-plate" data-reveal>
      <span className="projects-plate__label">Rated for</span>
      <ul className="projects-plate__list">
        {LANGUAGES.map((lang) => (
          <li className={lang.projects.includes(projectId) ? 'plate-lang is-lit' : 'plate-lang'} key={lang.name}>
            {lang.projects.includes(projectId) && (
              <span className="projects-visually-hidden">Used in this project: </span>
            )}
            {lang.slug ? (
              <TechGlyph tech={lang} />
            ) : (
              <span className="plate-lang__chip" style={{ '--brand': lang.color }} title={lang.name}>
                {lang.name}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Pages on this site (paths like /cua) open in place; everything else opens
// in a new tab so the elevator stays where the visitor left it.
function isInternal(url) {
  return url.startsWith('/')
}

// Every project's media is mounted once and stacked; switching only changes
// which layer is visible. A video stays at preload="none" (poster only) until
// it is on screen and allowed to play, so the floor costs one download per
// project a visitor actually watches.
function ScreenLayer({ active, live, project, videoRef }) {
  const { contain, image, poster, video } = project.media
  const className = ['projects-screen__layer', active && 'is-on', contain && 'is-contain']
    .filter(Boolean)
    .join(' ')

  if (video) {
    return (
      <video
        aria-hidden="true"
        className={className}
        loop
        muted
        playsInline
        poster={poster}
        preload={live ? 'auto' : 'none'}
        ref={videoRef}
        src={video}
      />
    )
  }
  if (image) return <img alt="" aria-hidden="true" className={className} src={image} />
  return (
    <div aria-hidden="true" className={`${className} projects-screen__blank`}>
      {project.name}
    </div>
  )
}

export default function ProjectsPanel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [inView, setInView] = useState(false)
  const reducedMotion = useReducedMotion()
  // props peek out beside the screen only where there is room for them
  const wide = useMediaQuery('(min-width: 881px)')
  const screenRef = useRef(null)
  const videoRefs = useRef([])
  const rowRefs = useRef([])
  // null until the visitor presses pause or play; then their choice holds
  // across projects. Reduced motion starts paused.
  const [playChoice, setPlayChoice] = useState(null)
  const playing = playChoice ?? !reducedMotion
  const live = inView && playing

  // All floors are mounted at once inside one scroller, so "in view" is what
  // keeps a visitor on the lobby from downloading the opening film.
  useEffect(() => {
    const node = screenRef.current
    if (!node) return undefined
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.25,
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return
      if (index === activeIndex && live) {
        // A blocked autoplay (iOS Low Power Mode) flips the button to Play, so
        // the visitor's tap starts it; a play cut short by pause is ignored.
        video.play().catch((error) => {
          if (error.name === 'NotAllowedError') setPlayChoice(false)
        })
      } else {
        video.pause()
      }
    })
  }, [activeIndex, live])


  // The list is one tab stop (the selected row); arrow keys move between
  // projects, so Tab goes straight from the chosen project to its links.
  const onRowKeyDown = (event, index) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key]
    const next =
      event.key === 'Home' ? 0
      : event.key === 'End' ? PROJECTS.length - 1
      : step ? (index + step + PROJECTS.length) % PROJECTS.length
      : null
    if (next === null) return
    event.preventDefault()
    setActiveIndex(next)
    rowRefs.current[next]?.focus()
  }

  const project = PROJECTS[activeIndex]
  const meta = [project.year, project.meta].filter(Boolean).join(' · ')

  return (
    <article aria-label="Selected projects" className="floor floor--projects">
      <ul aria-label="Projects, arrow keys to browse" className="projects-list" data-reveal>
        {PROJECTS.map((item, index) => (
          <li key={item.id}>
            <button
              aria-current={index === activeIndex ? 'true' : undefined}
              className="projects-row"
              onClick={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onKeyDown={(event) => onRowKeyDown(event, index)}
              onMouseEnter={() => setActiveIndex(index)}
              ref={(node) => {
                rowRefs.current[index] = node
              }}
              tabIndex={index === activeIndex ? 0 : -1}
              type="button"
            >
              <span className="projects-row__name">{item.name}</span>
              <span className="projects-row__tech">
                {item.tech.map((tech) => (
                  <TechGlyph key={tech.name} tech={tech} />
                ))}
              </span>
              <span className="projects-row__tag">{item.tag}</span>
            </button>
          </li>
        ))}
      </ul>

      <section aria-label={project.name} className="projects-stage" data-reveal>
        <div className="projects-screen-wrap">
          {project.media.props && wide && inView && (
            <StageProps key={project.id} reducedMotion={reducedMotion} srcs={project.media.props} />
          )}
          <div className="projects-screen" ref={screenRef}>
            {PROJECTS.map((item, index) => (
              <ScreenLayer
                active={index === activeIndex}
                key={item.id}
                live={live && index === activeIndex}
                project={item}
                videoRef={(node) => {
                  videoRefs.current[index] = node
                }}
              />
            ))}
            {project.media.video && (
              <button
                aria-label={playing ? 'Pause video' : 'Play video'}
                className="projects-screen__toggle"
                onClick={() => setPlayChoice(!playing)}
                type="button"
              >
                <svg aria-hidden="true" viewBox="0 0 12 12">
                  {playing ? (
                    <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" />
                  ) : (
                    <path d="M3 1.5l7 4.5-7 4.5z" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>
        <div className="projects-caption">
          <div className="projects-caption__lead">
            <span className="projects-mark" key={project.id}>
              <CaptionMark paused={!inView} project={project} reducedMotion={reducedMotion} />
            </span>
            <p className="projects-caption__blurb">
              {project.blurb}
              <span className="projects-caption__meta">
                {project.eventLogo && (
                  <img
                    alt={project.eventLogo.alt}
                    className="projects-caption__event"
                    src={project.eventLogo.src}
                  />
                )}
                {project.award && (
                  <span className="projects-award">
                    <b>{project.award.place}</b>
                    <i aria-hidden="true" />
                    {project.award.name}
                  </span>
                )}
                {meta}
              </span>
            </p>
          </div>
          {project.links.length > 0 && (
            <span className="projects-caption__links">
              {project.links.map((link) =>
                isInternal(link.url) ? (
                  <a href={link.url} key={link.url}>
                    {link.label}
                  </a>
                ) : (
                  <a href={link.url} key={link.url} rel="noreferrer" target="_blank">
                    {link.label}
                    <span aria-hidden="true"> ↗</span>
                  </a>
                ),
              )}
            </span>
          )}
        </div>
      </section>
      <RatedFor projectId={project.id} />
    </article>
  )
}
