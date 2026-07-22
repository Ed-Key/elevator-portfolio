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
  const scrollerRef = useRef(null)
  const progressRef = useRef({ value: 0 })
  const [activeFloorId, setActiveFloorId] = useState('home')
  const reducedMotion = useMemo(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false, [])
  const activeFloor = PORTFOLIO_FLOORS.find((floor) => floor.id === activeFloorId) ?? PORTFOLIO_FLOORS[0]
  // Observers must survive phase churn (opening → open → closing) — keying
  // their effects on `phase` would tear down and replay the reveal mid-open.
  const mounted = phase !== 'closed'

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

  // Scroll position drives the panel lamp: a section is "current" while it
  // crosses the middle band of the scroller (robust for tall floors).
  useEffect(() => {
    if (!mounted) return undefined

    const scroller = scrollerRef.current

    if (!scroller) return undefined

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveFloorId(entry.target.dataset.floor)
        })
      },
      { root: scroller, rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )

    scroller.querySelectorAll('.floor-section').forEach((section) => io.observe(section))

    return () => io.disconnect()
  }, [mounted])

  // Each floor staggers its content in as it enters, and resets once it has
  // fully left so re-entry replays the arrival — the elevator settling.
  useEffect(() => {
    if (!mounted) return undefined

    const scroller = scrollerRef.current

    if (!scroller) return undefined

    const sections = Array.from(scroller.querySelectorAll('.floor-section'))

    if (reducedMotion) {
      sections.forEach((section) => gsap.set(section.querySelectorAll('[data-reveal]'), { clearProps: 'all' }))

      return undefined
    }

    sections.forEach((section) => gsap.set(section.querySelectorAll('[data-reveal]'), { autoAlpha: 0, y: 18 }))
    const revealed = new Set()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.dataset.floor
          const targets = entry.target.querySelectorAll('[data-reveal]')

          if (entry.intersectionRatio >= 0.25 && !revealed.has(id)) {
            revealed.add(id)
            gsap.to(targets, {
              autoAlpha: 1,
              y: 0,
              duration: 0.5,
              ease: 'power3.out',
              stagger: 0.06,
              overwrite: 'auto',
              // hand styling back to CSS so :hover transforms (portrait tilt) work
              clearProps: 'all',
            })
          } else if (!entry.isIntersecting && revealed.has(id)) {
            revealed.delete(id)
            // overwrite kills a still-running reveal tween from a fast pass-through,
            // so the floor reliably re-staggers on its next entry.
            gsap.set(targets, { autoAlpha: 0, y: 18, overwrite: 'auto' })
          }
        })
      },
      { root: scroller, threshold: [0, 0.25] },
    )

    sections.forEach((section) => io.observe(section))

    return () => {
      io.disconnect()
      gsap.killTweensOf(scroller.querySelectorAll('[data-reveal]'))
    }
  }, [mounted, reducedMotion])

  const goToFloor = useCallback(
    (floorId) => {
      const section = scrollerRef.current?.querySelector(`[data-floor="${floorId}"]`)

      section?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
    },
    [reducedMotion],
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
        <main className="site-content" ref={scrollerRef}>
          {PORTFOLIO_FLOORS.map((floor) => {
            const FloorBody = FLOOR_COMPONENTS[floor.id]

            return (
              <section className="floor-section" data-floor={floor.id} key={floor.id}>
                <div className="site-content__inner">
                  <p className="floor-indicator" data-reveal>
                    <span className="floor-indicator__label">{floor.label}</span>
                  </p>
                  <FloorBody />
                </div>
              </section>
            )
          })}
        </main>
      </div>
      <div aria-hidden="true" className="portfolio-modal__band" />
    </div>
  )
}
