import { useEffect, useRef, useState } from 'react'
import { PROJECTS } from '../config/portfolioContent'
import { useReducedMotion } from '../hooks/useMediaQuery'
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
        <div className="projects-caption">
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
              {meta}
            </span>
          </p>
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
    </article>
  )
}
