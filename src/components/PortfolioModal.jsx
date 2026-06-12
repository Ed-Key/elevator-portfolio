import gsap from 'gsap'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import PortfolioBackdrop from './PortfolioBackdrop'
import { AboutFloor, ContactFloor, HomeFloor } from './PortfolioFloors'
import ProjectsPanel from './ProjectsPanel'
import { PORTFOLIO_FLOORS } from '../config/portfolioContent'
import './PortfolioModal.css'

const FLOOR_COMPONENTS = {
  about: AboutFloor,
  contact: ContactFloor,
  home: HomeFloor,
  projects: ProjectsPanel,
}

export default function PortfolioModal({ onClosed, onOpened, phase, tuning }) {
  const containerRef = useRef(null)
  const contentRef = useRef(null)
  const progressRef = useRef({ value: 0 })
  const [activeFloorId, setActiveFloorId] = useState('home')
  const reducedMotion = useMemo(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false, [])
  const activeFloor = PORTFOLIO_FLOORS.find((floor) => floor.id === activeFloorId) ?? PORTFOLIO_FLOORS[0]
  const ActiveFloorBody = FLOOR_COMPONENTS[activeFloor.id]

  const applyProgress = useCallback(() => {
    const container = containerRef.current

    if (!container) return

    const value = progressRef.current.value
    // The band must start and end fully off the sweep line, so the travel
    // range overshoots [0%, 100%] by half the band plus its feather.
    const overshoot = tuning.modalBandWidth / 2 + tuning.modalBandSoftness
    const position = -overshoot + value * (100 + overshoot * 2)

    container.style.setProperty('--reveal-pos', `${position}%`)
    container.style.setProperty('--reveal-fade', value.toFixed(3))
  }, [tuning.modalBandSoftness, tuning.modalBandWidth])

  useLayoutEffect(() => {
    applyProgress()
  }, [applyProgress])

  useEffect(() => {
    if (phase !== 'opening' && phase !== 'closing') {
      progressRef.current.value = phase === 'open' ? 1 : 0
      applyProgress()

      return
    }

    const opening = phase === 'opening'
    const seconds = opening ? tuning.modalRevealSeconds : tuning.modalCloseSeconds
    const tween = gsap.to(progressRef.current, {
      value: opening ? 1 : 0,
      duration: Math.max(seconds, 0.01),
      ease: tuning.modalEase,
      onUpdate: applyProgress,
      onComplete: opening ? onOpened : onClosed,
    })

    return () => {
      tween.kill()
    }
  }, [applyProgress, onClosed, onOpened, phase, tuning.modalCloseSeconds, tuning.modalEase, tuning.modalRevealSeconds])

  useEffect(() => {
    if (phase === 'open') containerRef.current?.focus()
  }, [phase])

  // Arriving at a floor: stagger its content in like an elevator settling.
  useLayoutEffect(() => {
    if (phase === 'closed' || reducedMotion) return

    const content = contentRef.current

    if (!content) return

    gsap.set(content, { autoAlpha: 1, y: 0 })

    const targets = content.querySelectorAll('[data-reveal]')
    const tween = gsap.fromTo(
      targets,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.06, overwrite: 'auto', clearProps: 'all' },
    )

    return () => {
      tween.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFloorId, reducedMotion])

  const goToFloor = useCallback(
    (floorId) => {
      if (floorId === activeFloorId) return

      const content = contentRef.current

      if (reducedMotion || !content) {
        setActiveFloorId(floorId)

        return
      }

      gsap.killTweensOf(content)
      gsap.to(content, {
        autoAlpha: 0,
        y: -12,
        duration: 0.18,
        ease: 'power1.in',
        onComplete: () => setActiveFloorId(floorId),
      })
    },
    [activeFloorId, reducedMotion],
  )

  if (phase === 'closed') return null

  return (
    <div
      className="portfolio-modal"
      data-phase={phase}
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
      ref={containerRef}
      style={{
        '--band-angle': `${tuning.modalBandAngle}deg`,
        '--band-color': tuning.modalBandColor,
        '--band-feather': `${tuning.modalBandSoftness}%`,
        '--band-half-width': `${tuning.modalBandWidth / 2}%`,
        '--band-opacity': tuning.modalBandOpacity,
      }}
      tabIndex={-1}
    >
      <div className="portfolio-modal__site">
        <PortfolioBackdrop reducedMotion={reducedMotion} />
        <div aria-hidden="true" className="portfolio-modal__vignette" />
        <header className="site-header">
          <span className="site-brand">Edward Kiboma</span>
        </header>
        <nav aria-label="Floors" className="floor-panel">
          {PORTFOLIO_FLOORS.map((floor) => (
            <button
              aria-current={floor.id === activeFloor.id ? 'true' : undefined}
              className={floor.id === activeFloor.id ? 'floor-panel__button is-active' : 'floor-panel__button'}
              key={floor.id}
              onClick={() => goToFloor(floor.id)}
              type="button"
            >
              <span aria-hidden="true" className="floor-panel__lamp" />
              <span className="floor-panel__num">{floor.number}</span>
              <span className="floor-panel__label">{floor.label}</span>
            </button>
          ))}
        </nav>
        <main className="site-content">
          <div className="site-content__inner" ref={contentRef}>
            <p className="floor-indicator" data-reveal>
              <span className="floor-indicator__num">{activeFloor.number}</span>
              <span aria-hidden="true" className="floor-indicator__rule" />
              <span className="floor-indicator__label">{activeFloor.label}</span>
            </p>
            <ActiveFloorBody />
          </div>
        </main>
      </div>
      <div aria-hidden="true" className="portfolio-modal__band" />
    </div>
  )
}
