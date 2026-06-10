import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Html, PerspectiveCamera } from '@react-three/drei'
import { MathUtils, Vector3 } from 'three'
import { useCallback, useEffect, useRef, useState } from 'react'
import './ElevatorScene.css'

const PHASES = {
  idle: 'idle',
  called: 'called',
  opening: 'opening',
  entering: 'entering',
  turning: 'turning',
  inside: 'inside',
  floorOpening: 'floorOpening',
  viewingFloor: 'viewingFloor',
  floorClosing: 'floorClosing',
}

const SECTIONS = [
  {
    id: 'home',
    floor: '01',
    label: 'Home',
    title: 'Ed Kiboma',
    kicker: 'Home floor',
    body: 'Software projects, experiments, and the story behind the work.',
    accent: '#7dd3fc',
  },
  {
    id: 'about',
    floor: '02',
    label: 'About',
    title: 'About Me',
    kicker: 'Background',
    body: 'A focused look at who I am, what I build, and how I think through problems.',
    accent: '#a7f3d0',
  },
  {
    id: 'projects',
    floor: '03',
    label: 'Projects',
    title: 'Featured Work',
    kicker: 'Builds',
    body: 'A gallery for shipped apps, experiments, case studies, and technical writeups.',
    accent: '#fde68a',
  },
  {
    id: 'contact',
    floor: '04',
    label: 'Contact',
    title: "Let's Talk",
    kicker: 'Reach out',
    body: 'Links for email, GitHub, LinkedIn, and whatever else belongs in the final version.',
    accent: '#f0abfc',
  },
]

function Box({
  position,
  rotation,
  scale,
  color,
  metalness = 0,
  roughness = 0.55,
  opacity = 1,
  ...props
}) {
  return (
    <mesh position={position} rotation={rotation} scale={scale} {...props}>
      <boxGeometry />
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        opacity={opacity}
        roughness={roughness}
        transparent={opacity < 1}
      />
    </mesh>
  )
}

function Door({ side, isOpen }) {
  const doorRef = useRef()
  const closedX = side === 'left' ? -0.72 : 0.72
  const openX = side === 'left' ? -1.72 : 1.72

  useFrame((_, delta) => {
    if (!doorRef.current) return

    const targetX = isOpen ? openX : closedX
    doorRef.current.position.x = MathUtils.damp(
      doorRef.current.position.x,
      targetX,
      4.2,
      delta,
    )
  })

  return (
    <group ref={doorRef} position={[closedX, 0.15, 0.08]}>
      <Box scale={[1.35, 3.4, 0.12]} color="#9da4af" metalness={0.45} roughness={0.28} />
      <Box position={[side === 'left' ? 0.62 : -0.62, 0, 0.08]} scale={[0.04, 3.25, 0.04]} color="#cbd2db" />
      <Box position={[0, 1.48, 0.08]} scale={[1.12, 0.06, 0.04]} color="#c9d0da" />
    </group>
  )
}

function ExteriorButton({ isActive, onPress }) {
  const [hovered, setHovered] = useState(false)

  return (
    <group
      position={[2.18, 0.08, 0.14]}
      onPointerDown={(event) => {
        event.stopPropagation()
        onPress()
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Box position={[0, 0, 0.16]} scale={[1.35, 2.2, 0.18]} color="#ffffff" opacity={0.001} />
      <Box scale={[0.42, 1.1, 0.1]} color="#20242c" metalness={0.2} roughness={0.36} />
      <mesh
        position={[0, 0.22, isActive ? 0.055 : 0.09]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={hovered && !isActive ? 1.08 : 1}
      >
        <cylinderGeometry args={[0.13, 0.13, 0.08, 32]} />
        <meshStandardMaterial
          color={isActive ? '#6ee7b7' : '#f8fafc'}
          emissive={isActive || hovered ? '#34d399' : '#111827'}
          emissiveIntensity={isActive ? 1.5 : hovered ? 0.65 : 0.15}
          metalness={0.25}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[0, -0.18, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.13, 32]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#0284c7" emissiveIntensity={0.45} />
      </mesh>
    </group>
  )
}

function ExteriorFacade() {
  return (
    <>
      <Box position={[-2.75, 0.18, -0.8]} scale={[1.9, 4.4, 0.22]} color="#2b3039" />
      <Box position={[2.75, 0.18, -0.8]} scale={[1.9, 4.4, 0.22]} color="#2b3039" />
      <Box position={[0, 2.23, -0.8]} scale={[6.4, 0.3, 0.22]} color="#2b3039" />
      <Box position={[0, -1.65, -0.8]} scale={[6.4, 0.24, 0.22]} color="#2b3039" />
    </>
  )
}

function ElevatorCabin() {
  return (
    <>
      <Box position={[0, -1.75, -1.05]} scale={[3.05, 0.15, 2.35]} color="#343946" />
      <Box position={[0, 1.88, -1.05]} scale={[3.05, 0.14, 2.35]} color="#242934" />
      <Box position={[0, 0.08, -2.24]} scale={[3.05, 3.5, 0.16]} color="#1a1f27" />
      <Box position={[-1.46, 0.08, -1.05]} scale={[0.14, 3.5, 2.35]} color="#232936" />
      <Box position={[1.46, 0.08, -1.05]} scale={[0.14, 3.5, 2.35]} color="#232936" />
      <Box position={[0, 1.78, -1.05]} scale={[2.3, 0.04, 0.18]} color="#cbd5e1" opacity={0.82} />
      <Box position={[-0.5, 0.08, -2.14]} scale={[0.04, 3.1, 0.04]} color="#2f3744" />
      <Box position={[0.5, 0.08, -2.14]} scale={[0.04, 3.1, 0.04]} color="#2f3744" />
    </>
  )
}

function InteriorPanel({ isVisible, onSelect, pendingSectionId, selectedSectionId }) {
  const width = useThree((state) => state.size.width)
  const isPhone = width < 640
  const distanceFactor = isPhone ? 1.1 : 1.18
  const position = isPhone ? [-0.62, 0.02, -0.68] : [-0.92, 0.02, -0.55]
  const rotation = isPhone ? [0, 2.02, 0] : [0, 2.22, 0]

  return (
    <group position={position} rotation={rotation}>
      <Box scale={[0.76, 1.88, 0.08]} color="#0b1220" metalness={0.18} roughness={0.32} />
      <Box position={[0, 0.78, 0.055]} scale={[0.48, 0.05, 0.05]} color="#7dd3fc" opacity={0.88} />
      <Html transform center position={[0, -0.02, 0.085]} distanceFactor={distanceFactor}>
        <nav className={`elevator-panel ${isVisible ? 'is-visible' : ''}`} aria-label="Portfolio navigation">
          {SECTIONS.map((section) => {
            const isActive = selectedSectionId === section.id
            const isPending = pendingSectionId === section.id

            return (
              <button
                className={isActive || isPending ? 'is-active' : ''}
                key={section.id}
                onClick={() => onSelect(section.id)}
                style={{ '--section-accent': section.accent }}
                type="button"
              >
                <span>{section.floor}</span>
                {section.label}
              </button>
            )
          })}
        </nav>
      </Html>
    </group>
  )
}

function FloorContent({ sectionId }) {
  const section = SECTIONS.find((item) => item.id === sectionId)
  const width = useThree((state) => state.size.width)
  const isPhone = width < 640
  const distanceFactor = isPhone ? 1 : 1.35
  const position = isPhone ? [-0.42, 0.08, 0.82] : [0, 0.08, 0.82]

  if (!section) return null

  return (
    <group position={position} rotation={[0, Math.PI, 0]}>
      <Box position={[0, 0, 0.03]} scale={[2.5, 2.7, 0.08]} color="#080d17" metalness={0.08} roughness={0.42} />
      <Box position={[-1.18, 0, 0.09]} scale={[0.06, 2.46, 0.04]} color={section.accent} opacity={0.78} />
      <Box position={[0, 1.16, 0.09]} scale={[2.18, 0.05, 0.04]} color={section.accent} opacity={0.7} />
      <Html transform center position={[0, -0.02, 0.13]} distanceFactor={distanceFactor}>
        <section className="floor-card" style={{ '--section-accent': section.accent }}>
          <p>{section.kicker}</p>
          <h1>{section.title}</h1>
          <span>{section.body}</span>
        </section>
      </Html>
    </group>
  )
}

function ElevatorModel({
  activeSectionId,
  onCall,
  onSelectSection,
  pendingSectionId,
  phase,
  sceneScale,
}) {
  const isCalled = phase !== PHASES.idle
  const doorsOpen =
    phase === PHASES.opening ||
    phase === PHASES.entering ||
    phase === PHASES.floorOpening ||
    phase === PHASES.viewingFloor
  const panelVisible =
    phase === PHASES.inside ||
    phase === PHASES.floorOpening ||
    phase === PHASES.viewingFloor ||
    phase === PHASES.floorClosing

  return (
    <group scale={sceneScale}>
      {phase === PHASES.idle && (
        <Box
          position={[0, 0.12, 0.44]}
          scale={[6.2, 4.4, 0.08]}
          color="#ffffff"
          opacity={0.001}
          onPointerDown={(event) => {
            event.stopPropagation()
            onCall()
          }}
        />
      )}
      <Box position={[0, -1.75, -0.65]} scale={[7, 0.15, 4.8]} color="#30343d" />
      <ElevatorCabin />
      <FloorContent sectionId={activeSectionId} />
      <InteriorPanel
        isVisible={panelVisible}
        onSelect={onSelectSection}
        pendingSectionId={pendingSectionId}
        selectedSectionId={activeSectionId}
      />
      <ExteriorFacade />

      <Box position={[0, 2.12, 0]} scale={[3.35, 0.28, 0.36]} color="#161a22" />
      <Box position={[-1.7, 0.18, 0]} scale={[0.25, 3.7, 0.36]} color="#161a22" />
      <Box position={[1.7, 0.18, 0]} scale={[0.25, 3.7, 0.36]} color="#161a22" />
      <Box position={[0, -1.68, 0]} scale={[3.35, 0.22, 0.36]} color="#161a22" />

      <Door side="left" isOpen={doorsOpen} />
      <Door side="right" isOpen={doorsOpen} />
      <ExteriorButton isActive={isCalled} onPress={onCall} />
    </group>
  )
}

function getCameraShot(phase, width, sceneScale) {
  const isPhone = width < 640
  const outside = {
    position: [0, isPhone ? 0.15 : 0.35, isPhone ? 8.8 : 6.4],
    lookAt: [0, 0.12 * sceneScale, -0.4 * sceneScale],
    fov: isPhone ? 46 : 42,
  }

  if (phase === PHASES.entering) {
    return {
      position: [0, 0.26 * sceneScale, -1.1 * sceneScale],
      lookAt: [0, 0.15 * sceneScale, -2.2 * sceneScale],
      fov: isPhone ? 48 : 44,
    }
  }

  if (
    phase === PHASES.turning ||
    phase === PHASES.inside ||
    phase === PHASES.floorOpening ||
    phase === PHASES.viewingFloor ||
    phase === PHASES.floorClosing
  ) {
    if (isPhone) {
      return {
        position: [0.02 * sceneScale, 0.28 * sceneScale, -2.08 * sceneScale],
        lookAt: [-0.42 * sceneScale, 0.12 * sceneScale, -0.05 * sceneScale],
        fov: 78,
      }
    }

    return {
      position: [0.22 * sceneScale, 0.28 * sceneScale, -1.9 * sceneScale],
      lookAt: [-0.4 * sceneScale, 0.12 * sceneScale, 0.22 * sceneScale],
      fov: 60,
    }
  }

  return outside
}

function CameraRig({ phase, sceneScale }) {
  const width = useThree((state) => state.size.width)
  const cameraRef = useRef()
  const targetPosition = useRef(new Vector3())
  const targetLookAt = useRef(new Vector3())
  const currentLookAt = useRef(new Vector3(0, 0.12, -0.4))

  useEffect(() => {
    const camera = cameraRef.current
    if (!camera) return

    const shot = getCameraShot(PHASES.idle, width, sceneScale)

    camera.position.set(...shot.position)
    currentLookAt.current.set(...shot.lookAt)
    camera.fov = shot.fov
    camera.lookAt(currentLookAt.current)
    camera.updateProjectionMatrix()
  }, [sceneScale, width])

  useFrame((_, delta) => {
    const camera = cameraRef.current
    if (!camera) return

    const shot = getCameraShot(phase, width, sceneScale)
    const ease = 1 - Math.exp(-delta * (phase === PHASES.turning ? 1.4 : 1.9))

    targetPosition.current.set(...shot.position)
    targetLookAt.current.set(...shot.lookAt)
    camera.position.lerp(targetPosition.current, ease)
    currentLookAt.current.lerp(targetLookAt.current, ease)
    camera.fov = MathUtils.lerp(camera.fov, shot.fov, ease)
    camera.lookAt(currentLookAt.current)
    camera.updateProjectionMatrix()
  })

  return <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0.35, 6.4]} fov={42} />
}

function ElevatorExperience() {
  const [phase, setPhase] = useState(PHASES.idle)
  const [activeSectionId, setActiveSectionId] = useState(null)
  const [pendingSectionId, setPendingSectionId] = useState(null)
  const activeSectionRef = useRef(null)
  const timersRef = useRef([])
  const phaseRef = useRef(PHASES.idle)
  const width = useThree((state) => state.size.width)
  const sceneScale = width < 640 ? 0.6 : width < 900 ? 0.82 : 1

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    activeSectionRef.current = activeSectionId
  }, [activeSectionId])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  const setExperiencePhase = useCallback((nextPhase) => {
    phaseRef.current = nextPhase
    setPhase(nextPhase)
  }, [])

  const startSequence = useCallback(() => {
    if (phaseRef.current !== PHASES.idle) return

    clearTimers()
    setExperiencePhase(PHASES.called)
    timersRef.current = [
      setTimeout(() => setExperiencePhase(PHASES.opening), 300),
      setTimeout(() => setExperiencePhase(PHASES.entering), 1700),
      setTimeout(() => setExperiencePhase(PHASES.turning), 3600),
      setTimeout(() => setExperiencePhase(PHASES.inside), 5200),
    ]
  }, [clearTimers, setExperiencePhase])

  const selectSection = useCallback(
    (sectionId) => {
      const sectionExists = SECTIONS.some((section) => section.id === sectionId)
      const currentPhase = phaseRef.current

      if (!sectionExists) return
      if (
        currentPhase !== PHASES.inside &&
        currentPhase !== PHASES.floorOpening &&
        currentPhase !== PHASES.viewingFloor
      ) {
        return
      }
      if (
        (currentPhase === PHASES.floorOpening || currentPhase === PHASES.viewingFloor) &&
        activeSectionRef.current === sectionId
      ) {
        return
      }

      clearTimers()
      setPendingSectionId(sectionId)

      if (currentPhase === PHASES.floorOpening || currentPhase === PHASES.viewingFloor) {
        setExperiencePhase(PHASES.floorClosing)
        timersRef.current = [
          setTimeout(() => {
            activeSectionRef.current = sectionId
            setActiveSectionId(sectionId)
            setPendingSectionId(null)
            setExperiencePhase(PHASES.floorOpening)
          }, 950),
          setTimeout(() => setExperiencePhase(PHASES.viewingFloor), 2200),
        ]
        return
      }

      activeSectionRef.current = sectionId
      setActiveSectionId(sectionId)
      setPendingSectionId(null)
      setExperiencePhase(PHASES.floorOpening)
      timersRef.current = [setTimeout(() => setExperiencePhase(PHASES.viewingFloor), 1250)]
    },
    [clearTimers, setExperiencePhase],
  )

  useEffect(() => {
    window.addEventListener('pointerdown', startSequence)

    return () => {
      window.removeEventListener('pointerdown', startSequence)
      clearTimers()
    }
  }, [clearTimers, startSequence])

  return (
    <>
      {phase === PHASES.idle && (
        <Html fullscreen>
          <button
            aria-label="Start elevator sequence"
            className="start-catcher"
            onPointerDown={(event) => {
              event.preventDefault()
              startSequence()
            }}
            type="button"
          />
        </Html>
      )}
      <CameraRig phase={phase} sceneScale={sceneScale} />
      <ElevatorModel
        activeSectionId={activeSectionId}
        onCall={startSequence}
        onSelectSection={selectSection}
        pendingSectionId={pendingSectionId}
        phase={phase}
        sceneScale={sceneScale}
      />
    </>
  )
}

export default function ElevatorScene() {
  return (
    <main className="scene-shell">
      <Canvas shadows gl={{ preserveDrawingBuffer: true }}>
        <color attach="background" args={['#11141b']} />
        <ambientLight intensity={0.46} />
        <directionalLight position={[2.5, 4, 5]} intensity={2.2} castShadow />
        <pointLight position={[0, 2.1, 1.2]} intensity={1.7} color="#e0f2fe" />
        <pointLight position={[0.8, 0.4, -1.8]} intensity={0.75} color="#94a3b8" />
        <ElevatorExperience />
        <ContactShadows position={[0, -1.66, 0]} opacity={0.38} scale={7} blur={2.4} far={3.2} />
        <Environment preset="city" />
      </Canvas>
    </main>
  )
}
