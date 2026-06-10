import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { MathUtils } from 'three'
import './MirrorPortfolioPanel.css'

const MIRROR_PANEL_ROTATION = [0, Math.PI / 2, 0]

const PORTFOLIO_SECTIONS = [
  {
    id: 'home',
    label: 'Home',
    kicker: 'Creative Developer',
    title: 'Eddie Kiboma',
    body: 'Interactive web work shaped around motion, systems, and clean product interfaces.',
    stats: ['Three.js', 'React', 'UI'],
  },
  {
    id: 'about',
    label: 'About',
    kicker: 'Profile',
    title: 'Builder With Range',
    body: 'I like turning early ideas into prototypes that feel real enough to test, tune, and ship.',
    stats: ['Frontend', 'Design', '3D'],
  },
  {
    id: 'projects',
    label: 'Projects',
    kicker: 'Selected Work',
    title: 'Project Floors',
    body: 'Each floor can become a focused project reveal with its own scene, writeup, and live demo.',
    stats: ['Floor 01', 'Floor 02', 'Floor 03'],
  },
  {
    id: 'contact',
    label: 'Contact',
    kicker: 'Next Stop',
    title: 'Let’s Build',
    body: 'A contact floor can hold links, socials, resume, and a direct way to reach out.',
    stats: ['Email', 'GitHub', 'LinkedIn'],
  },
]

function getMirrorOpacity({ elapsed, started, timing, tuning }) {
  if (tuning.previewMode === 'camera') return 1
  if (tuning.previewMode === 'manual') return MathUtils.smoothstep(tuning.doorOpen, 0.62, 1)
  if (!started) return 0

  return MathUtils.smoothstep(elapsed, timing.enterStart + 0.2, timing.turnStart + 0.8)
}

function getMirrorInteractivity({ elapsed, started, timing, tuning }) {
  if (tuning.previewMode === 'camera') return true
  if (tuning.previewMode === 'manual') return tuning.doorOpen > 0.92

  return started && elapsed >= timing.turnStart + 0.35
}

export default function MirrorPortfolioPanel({ elapsedRef, showGuide = false, started, timing, tuning }) {
  const interactiveRef = useRef(false)
  const panelRef = useRef(null)
  const [activeSectionId, setActiveSectionId] = useState('home')
  const [interactive, setInteractive] = useState(false)
  const activeSection = PORTFOLIO_SECTIONS.find((section) => section.id === activeSectionId) ?? PORTFOLIO_SECTIONS[0]

  useFrame(() => {
    const elapsed = elapsedRef.current
    const opacity = getMirrorOpacity({ elapsed, started, timing, tuning })
    const isInteractive = getMirrorInteractivity({ elapsed, started, timing, tuning })

    if (panelRef.current) {
      panelRef.current.style.opacity = opacity.toFixed(3)
      panelRef.current.style.pointerEvents = isInteractive ? 'auto' : 'none'
      panelRef.current.dataset.ready = isInteractive ? 'true' : 'false'
    }

    if (interactiveRef.current !== isInteractive) {
      interactiveRef.current = isInteractive
      setInteractive(isInteractive)
    }
  })

  return (
    <Html
      center
      position={[tuning.portfolioScreenX, tuning.portfolioScreenY, tuning.portfolioScreenZ]}
      rotation={MIRROR_PANEL_ROTATION}
      scale={tuning.portfolioScreenScale}
      transform
      zIndexRange={[12, 0]}
    >
      <section
        ref={panelRef}
        aria-hidden={!interactive}
        className="mirror-panel"
        data-screen-guide={showGuide ? 'true' : 'false'}
        onPointerDown={(event) => event.stopPropagation()}
        style={{
          '--portfolio-screen-height': `${tuning.portfolioScreenHeight}px`,
          '--portfolio-screen-width': `${tuning.portfolioScreenWidth}px`,
        }}
      >
        {showGuide && (
          <div className="mirror-panel__screen-guide" aria-hidden="true">
            <span />
            <span />
          </div>
        )}
        <div className="mirror-panel__status">
          <span>PORTFOLIO</span>
          <strong>{interactive ? 'READY' : 'LOADING'}</strong>
        </div>

        <nav aria-label="Portfolio sections" className="mirror-panel__nav">
          {PORTFOLIO_SECTIONS.map((section) => (
            <button
              className={section.id === activeSectionId ? 'is-active' : ''}
              key={section.id}
              onClick={() => setActiveSectionId(section.id)}
              type="button"
            >
              {section.label}
            </button>
          ))}
        </nav>

        <div className="mirror-panel__content">
          <p>{activeSection.kicker}</p>
          <h1>{activeSection.title}</h1>
          <span>{activeSection.body}</span>
        </div>

        <div className="mirror-panel__stats" aria-label={`${activeSection.label} highlights`}>
          {activeSection.stats.map((stat) => (
            <span key={stat}>{stat}</span>
          ))}
        </div>
      </section>
    </Html>
  )
}
