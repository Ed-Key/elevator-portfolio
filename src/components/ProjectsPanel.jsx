import { useEffect, useRef, useState } from 'react'
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

function CellInner({ index, project }) {
  return (
    <>
      <span aria-hidden="true" className="panel-cell__num">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span aria-hidden="true" className="panel-cell__year">
        {project.year}
      </span>
      {project.status === 'private' && <span className="panel-cell__tag">Private build</span>}
      <span className="panel-cell__base">
        <span className="panel-cell__name">{project.name}</span>
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

function ProjectStage({ project, reducedMotion }) {
  const capsLine = `${project.tech.map((tech) => tech.name).join(' · ')} — ${project.year}`
  const hasWindow = Boolean(project.media.video || project.media.poster)

  return (
    <div className={hasWindow ? 'stage-show stage-show--windowed' : 'stage-show'} key={project.id}>
      <StageMedia project={project} reducedMotion={reducedMotion} />
      <div className="stage-show__text">
        {project.media.logo ? (
          <img alt="" aria-hidden="true" className="stage-show__logo" src={project.media.logo} />
        ) : (
          <span aria-hidden="true" className="stage-show__mark">
            {project.name[0]}
          </span>
        )}
        <h3 className="stage-show__name">{project.name}</h3>
        <p className="stage-show__blurb">{project.blurb}</p>
        <span className="stage-show__glyphs">
          {project.tech.map((tech) => (
            <TechGlyph key={tech.name} tech={tech} />
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
                    {project.media.logo && (
                      <img alt="" aria-hidden="true" className="stage-show__logo stage-show__logo--drawer" src={project.media.logo} />
                    )}
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
          {activeProject ? <ProjectStage project={activeProject} reducedMotion={reducedMotion} /> : <IdlePlate />}
        </div>
      </div>
    </article>
  )
}
