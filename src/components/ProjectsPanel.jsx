import { useEffect, useRef, useState } from 'react'
import { LANGUAGES, PROJECTS } from '../config/portfolioContent'
import PageAuraMark from './PageAuraMark'
import StageModel from './StageModel'
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

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia?.(query).matches ?? false)

  useEffect(() => {
    const mql = window.matchMedia?.(query)
    if (!mql) return undefined
    const onChange = (event) => setMatches(event.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

function getProjectLinks(project) {
  return project.links ?? (project.url ? [{ label: 'Visit', url: project.url }] : [])
}

// Prop art behind the window. With several faces it cycles like the
// engine re-reading the board; reduced motion pins the first face.
function StageProp({ reducedMotion, srcs }) {
  const faces = Array.isArray(srcs) ? srcs : [srcs]
  const [face, setFace] = useState(0)

  useEffect(() => {
    if (reducedMotion || faces.length < 2) return undefined
    const id = setInterval(() => setFace((n) => (n + 1) % faces.length), 7000)
    return () => clearInterval(id)
  }, [reducedMotion, faces.length])

  return (
    <img
      alt=""
      aria-hidden="true"
      className="stage-show__prop"
      key={face}
      src={faces[face]}
    />
  )
}

// Ladder: video → poster → null (text tier's monogram carries the stage).
// Only the active project's <video> is ever mounted, and only when motion
// is allowed; reduced-motion visitors get the poster tier.
function StageMedia({ project, reducedMotion }) {
  const { poster, video } = project.media
  const showVideo = Boolean(video) && !reducedMotion

  if (!showVideo && !poster) return null

  return (
    <div className="stage-show__media">
      {/* a prop tucked behind the window, corner peeking out */}
      {project.media.prop && <StageProp reducedMotion={reducedMotion} srcs={project.media.prop} />}
      <div className="stage-show__window">
        {showVideo && <span className="stage-show__live">Live</span>}
        {/* real demo footage carries its own chrome; the fake bar only frames stills */}
        {!showVideo && (
          <span aria-hidden="true" className="stage-show__windowbar">
            <i /><i /><i />
          </span>
        )}
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
    </div>
  )
}

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

function CellInner({ index, project }) {
  return (
    <>
      <span aria-hidden="true" className="panel-cell__num">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span aria-hidden="true" className="panel-cell__year">
        {project.year}
      </span>
      <span className="panel-cell__base">
        <span className="panel-cell__name">{project.name}</span>
        <span className="panel-cell__blurb">{project.blurb}</span>
        <span className="panel-cell__glyphs">
          {project.tech.map((tech) => (
            <TechGlyph key={tech.name} tech={tech} />
          ))}
        </span>
      </span>
    </>
  )
}

function ProjectCell({ denied, index, onArm, onArmNow, onDeniedPress, onDisarm, project }) {
  const primaryLink = getProjectLinks(project)[0]
  const shared = {
    className: `panel-cell panel-cell--slot${index + 1}`,
    onFocus: onArmNow, // keyboard drives the stage exactly like hover
    onPointerEnter: (event) => {
      if (event.pointerType === 'mouse') onArm()
    },
    onPointerLeave: onDisarm, // cancels pending intent; stage HOLDS current project
    'data-reveal': true,
  }

  if (primaryLink) {
    return (
      <a {...shared} href={primaryLink.url} rel="noreferrer" target="_blank">
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
      <StageMedia project={project} reducedMotion={reducedMotion} />
      <div className="stage-show__text">
        {project.media.stageMark === 'pageauraSparkles' ? (
          <PageAuraMark />
        ) : project.media.model && !reducedMotion ? (
          <StageModel
            poster={
              project.media.logo ? (
                <img alt="" className="stage-show__logo" src={project.media.logo} />
              ) : null
            }
            src={project.media.model}
            view={project.media.modelView}
          />
        ) : project.media.logo ? (
          <img alt="" aria-hidden="true" className="stage-show__logo" src={project.media.logo} />
        ) : !hasWindow ? (
          <span aria-hidden="true" className="stage-show__mark">
            {project.name[0]}
          </span>
        ) : null}
        <h3 className="stage-show__name">{project.name}</h3>
        <span className="stage-show__glyphs">
          {project.tech.map((tech) => (
            <TechGlyph key={tech.name} tech={tech} />
          ))}
        </span>
        <span className="stage-show__caps">{capsLine}</span>
        {links.length > 0 ? (
          <span className="stage-show__actions">
            {links.map((link) => (
              <a className="stage-show__visit" href={link.url} key={link.url} rel="noreferrer" target="_blank">
                {link.label}
              </a>
            ))}
          </span>
        ) : project.status === 'private' ? (
          <span className="stage-show__private">Private build</span>
        ) : null}
      </div>
    </div>
  )
}

// The rated-capacity plate: every elevator carries one. Languages sit
// etched at rest; the staged project lights the ones it's built in.
function CapacityPlate({ litId }) {
  return (
    <div className="capacity-plate" data-reveal>
      <span className="capacity-plate__label">Rated for</span>
      <ul className="capacity-plate__list">
        {LANGUAGES.map((lang) => {
          const lit = litId !== null && lang.projects.includes(litId)
          return (
            <li className={lit ? 'plate-lang is-lit' : 'plate-lang'} key={lang.name}>
              {lang.slug ? (
                <TechGlyph tech={lang} />
              ) : (
                <span className="plate-lang__chip" style={{ '--brand': lang.color }} title={lang.name}>
                  {lang.name}
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// Idle constellation scatter — hand-placed (no Math.random, screenshots
// stay stable), ringing the count without entering the center ~30% where
// it sits. Durations/delays stagger the drift so motes never beat in sync.
const MOTE_FIELD = [
  { left: 10, top: 16, dx: 9, dy: -8, dur: 7.5, delay: -1.2 },
  { left: 28, top: 8, dx: -8, dy: 10, dur: 9, delay: -3.5 },
  { left: 50, top: 12, dx: 10, dy: 8, dur: 6.5, delay: -2 },
  { left: 72, top: 8, dx: -9, dy: -9, dur: 10.5, delay: -5 },
  { left: 88, top: 20, dx: 8, dy: 11, dur: 8, delay: -0.5 },
  { left: 92, top: 48, dx: -10, dy: -8, dur: 6, delay: -4.2 },
  { left: 86, top: 76, dx: 11, dy: 8, dur: 9.5, delay: -6.3 },
  { left: 66, top: 88, dx: -8, dy: -10, dur: 7, delay: -2.8 },
  { left: 42, top: 90, dx: 9, dy: 9, dur: 10, delay: -1.8 },
  { left: 20, top: 84, dx: -11, dy: 8, dur: 8.5, delay: -4.8 },
  { left: 7, top: 62, dx: 8, dy: -11, dur: 6.8, delay: -3.1 },
  { left: 16, top: 38, dx: -9, dy: 8, dur: 11, delay: -0.9 },
]

function IdlePlate() {
  const motes = LANGUAGES.filter((lang) => lang.slug)

  return (
    <div className="stage-idle">
      <span aria-hidden="true" className="stage-idle__field">
        {motes.map((lang, index) => {
          const spot = MOTE_FIELD[index % MOTE_FIELD.length]
          return (
            <i
              className="stage-idle__mote"
              key={lang.name}
              style={{
                '--glyph': `url(/images/tech/${lang.slug}.svg)`,
                '--mote-x': `${spot.dx}px`,
                '--mote-y': `${spot.dy}px`,
                '--mote-dur': `${spot.dur}s`,
                '--mote-delay': `${spot.delay}s`,
                left: `${spot.left}%`,
                top: `${spot.top}%`,
              }}
            />
          )
        })}
      </span>
      <span className="stage-idle__count">{String(PROJECTS.length).padStart(2, '0')}</span>
      <span className="stage-idle__hint">projects — hover a cell</span>
    </div>
  )
}

export default function ProjectsPanel() {
  const [deniedId, setDeniedId] = useState(null)
  const [activeId, setActiveId] = useState(null) // stage holds the last armed project
  const intentRef = useRef(null)
  const reducedMotion = useReducedMotion()
  const compact = useMediaQuery('(max-width: 900px), (pointer: coarse)')
  const [expandedId, setExpandedId] = useState(null)

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

  if (compact) {
    return (
      <article aria-label="Selected projects" className="floor floor--projects">
        <div className="projects-stack">
          {PROJECTS.map((project, index) => {
            const expanded = expandedId === project.id
            const links = getProjectLinks(project)
            const className = [
              'panel-cell',
              expanded ? 'panel-cell--open' : '',
            ].filter(Boolean).join(' ')
            return (
              <div className={className} data-reveal key={project.id}>
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
                    {project.media.stageMark === 'pageauraSparkles' ? (
                      <PageAuraMark />
                    ) : project.media.logo ? (
                      <img alt="" aria-hidden="true" className="stage-show__logo stage-show__logo--drawer" src={project.media.logo} />
                    ) : null}
                    <StageMedia project={project} reducedMotion={reducedMotion || !expanded} />
                    {links.length > 0 ? (
                      <span className="stage-show__actions">
                        {links.map((link) => (
                          <a
                            className="stage-show__visit"
                            href={link.url}
                            key={link.url}
                            rel="noreferrer"
                            target="_blank"
                            tabIndex={expanded ? 0 : -1}
                          >
                            {link.label}
                          </a>
                        ))}
                      </span>
                    ) : project.status === 'private' ? (
                      <span className="stage-show__private">Private build</span>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <CapacityPlate litId={expandedId} />
      </article>
    )
  }

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
      </div>
      <CapacityPlate litId={activeId} />
    </article>
  )
}
