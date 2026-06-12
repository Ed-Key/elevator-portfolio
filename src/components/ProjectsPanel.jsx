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
            <TechGlyph key={tech.name} tech={tech} />
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
