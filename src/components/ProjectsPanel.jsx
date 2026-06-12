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
