import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls, PerspectiveCamera, useAnimations, useGLTF } from '@react-three/drei'
import { Bloom, EffectComposer, N8AO, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { Box3, Color, MathUtils, Vector3 } from 'three'
import { useCallback, useEffect, useRef, useState } from 'react'
import ElevatorCallButton from './ElevatorCallButton'
import HallDressing from './HallDressing'
import HallPracticals from './HallPracticals'
import MirrorShimmerPlane from './MirrorShimmerPlane'

// The modal loads through a plain dynamic import so gsap and the portfolio
// content ride in their own chunk: the fetch starts at mount but stays off
// the critical path, and the elevator sequence gives it seconds of cover
// before the modal can open. Deliberately not React.lazy: a rejected lazy
// chunk throws through Suspense and takes the Canvas down with it, while a
// promise handler keeps the failure out of React entirely.
function PortfolioModalLoader({ phase, ...modalProps }) {
  const [Modal, setModal] = useState(null)
  const [failed, setFailed] = useState(false)
  const autoRetriedRef = useRef(false)

  const load = useCallback(function request() {
    import('./PortfolioModal').then(
      (module) => {
        setModal(() => module.default)
        setFailed(false)
      },
      () => {
        // One delayed silent retry covers transient flakes; a second
        // failure surfaces the retry card once the modal is due on screen.
        if (autoRetriedRef.current) {
          setFailed(true)
        } else {
          autoRetriedRef.current = true
          setTimeout(request, 4000)
        }
      },
    )
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (Modal) return <Modal phase={phase} {...modalProps} />

  if (failed && phase !== 'closed') {
    // Chromium caches a rejected dynamic import for the life of the
    // document, so in-page retries cannot succeed there; a reload is the
    // one recovery that always works, and it also picks up fresh chunk
    // URLs after a stale deploy.
    return (
      <div className="portfolio-modal-fallback" role="alert">
        <p>This floor didn't load.</p>
        <button onClick={() => window.location.reload()} type="button">
          Reload
        </button>
      </div>
    )
  }

  return null
}
import { CAMERA_SHOTS, DEFAULT_CAMERA_SHOTS, DEFAULT_TUNING, ENVIRONMENT_PRESETS, MODAL_EASE_OPTIONS, ORIGINAL_TUNING, PRACTICAL_STYLE_OPTIONS, TONE_MAPPING_OPTIONS } from '../config/elevatorSetup'
import './ElevatorExperience.css'

const DOOR_OPEN_CLIP_TIME = 3
const DOOR_CLOSED_CLIP_TIME = 6.25
const TUNING_STORAGE_KEY = 'elevator-experience-tuning'
const CAMERA_SAMPLE_INTERVAL = 0.12

const outsideShot = DEFAULT_CAMERA_SHOTS.outsideShot

const METAL_MATERIALS = new Set(['Metal', 'DarkerMetal', 'Mirror'])

const LAB_TABS = ['scene', 'render', 'hall', 'motion', 'fx', 'camera']

const TONE_MAPPING_MODES = {
  aces: ToneMappingMode.ACES_FILMIC,
  agx: ToneMappingMode.AGX,
  neutral: ToneMappingMode.NEUTRAL,
}

// A purpose-built reflection environment: the metal cab reflects whatever
// surrounds it, and the stock outdoor HDRIs put a bright ground under a dark
// room. Dark lower hemisphere, warm ceiling panels roughly where the hall
// practicals will hang, and a faint cool strip behind the camera for door
// rim glints.
function HallEnvironment({ intensity, preset }) {
  if (preset !== 'custom') {
    return <Environment environmentIntensity={intensity} preset={preset} />
  }

  return (
    <Environment environmentIntensity={intensity} frames={1} resolution={256}>
      <color attach="background" args={['#050302']} />
      {/* soft warm ceiling panels flanking the hall, sized large so their
          mirror reflections blur into sheen instead of hard slashes */}
      <Lightformer color="#ffa957" form="rect" intensity={2.6} position={[1.1, 5.2, 2.7]} rotation-x={Math.PI / 2} scale={[4.5, 3, 1]} />
      <Lightformer color="#ffa957" form="rect" intensity={2.6} position={[1.1, 5.2, -2.7]} rotation-x={Math.PI / 2} scale={[4.5, 3, 1]} />
      {/* tall warm wash behind the camera: this is what puts the bronze
          gradient back on the door faces */}
      <Lightformer color="#ffa14f" form="rect" intensity={4.2} position={[9, 4.5, 0]} rotation-y={-Math.PI / 2} scale={[9, 5, 1]} />
      <Lightformer color="#bcd3ff" form="rect" intensity={0.8} position={[8, 1.4, 0]} rotation-y={-Math.PI / 2} scale={[6, 0.7, 1]} />
    </Environment>
  )
}

function easeBetween(time, start, end) {
  const raw = MathUtils.clamp((time - start) / (end - start), 0, 1)

  return MathUtils.smoothstep(raw, 0, 1)
}

function lerpArray(from, to, alpha) {
  return from.map((value, index) => MathUtils.lerp(value, to[index], alpha))
}

function cloneCameraShot(shot) {
  return {
    fov: shot.fov,
    lookAt: [...shot.lookAt],
    position: [...shot.position],
  }
}

function getCameraShots(tuning) {
  const storedShots = tuning.cameraShots ?? {}

  return Object.fromEntries(
    Object.entries(DEFAULT_CAMERA_SHOTS).map(([name, defaultShot]) => [name, cloneCameraShot(storedShots[name] ?? defaultShot)]),
  )
}

function getSequenceTiming(tuning) {
  const openStart = tuning.openDelay
  const openEnd = openStart + tuning.openSeconds
  const enterStart = openEnd + tuning.enterDelay
  const enterEnd = enterStart + tuning.enterSeconds
  const turnStart = enterEnd
  const turnEnd = turnStart + tuning.turnSeconds
  const closeStart = turnEnd + tuning.closeDelay
  const closeEnd = closeStart + tuning.closeSeconds

  return {
    closeEnd,
    closeStart,
    enterEnd,
    enterStart,
    openEnd,
    openStart,
    turnEnd,
    turnStart,
  }
}

function getSequenceState(time, tuning) {
  const cameraShots = getCameraShots(tuning)
  const timing = getSequenceTiming(tuning)
  const openProgress = easeBetween(time, timing.openStart, timing.openEnd)
  const enterProgress = easeBetween(time, timing.enterStart, timing.enterEnd)
  const turnProgress = easeBetween(time, timing.turnStart, timing.turnEnd)
  const closeProgress = easeBetween(time, timing.closeStart, timing.closeEnd)

  let camera = cameraShots.outsideShot

  if (time >= timing.openStart && time < timing.enterStart) {
    camera = {
      position: lerpArray(cameraShots.outsideShot.position, cameraShots.pushShot.position, openProgress),
      lookAt: lerpArray(cameraShots.outsideShot.lookAt, cameraShots.pushShot.lookAt, openProgress),
      fov: MathUtils.lerp(cameraShots.outsideShot.fov, cameraShots.pushShot.fov, openProgress),
    }
  }

  if (time >= timing.enterStart && time < timing.turnStart) {
    camera = {
      position: lerpArray(cameraShots.pushShot.position, cameraShots.enteringShot.position, enterProgress),
      lookAt: lerpArray(cameraShots.pushShot.lookAt, cameraShots.enteringShot.lookAt, enterProgress),
      fov: MathUtils.lerp(cameraShots.pushShot.fov, cameraShots.enteringShot.fov, enterProgress),
    }
  }

  if (time >= timing.turnStart) {
    camera = {
      position: lerpArray(cameraShots.enteringShot.position, cameraShots.insideShot.position, turnProgress),
      lookAt: lerpArray(cameraShots.enteringShot.lookAt, cameraShots.insideShot.lookAt, turnProgress),
      fov: MathUtils.lerp(cameraShots.enteringShot.fov, cameraShots.insideShot.fov, turnProgress),
    }
  }

  const openingClipTime = MathUtils.lerp(0, DOOR_OPEN_CLIP_TIME, openProgress)
  const closingClipTime = MathUtils.lerp(DOOR_OPEN_CLIP_TIME, DOOR_CLOSED_CLIP_TIME, closeProgress)
  const clipTime = time >= timing.closeStart ? closingClipTime : openingClipTime

  return {
    camera,
    clipTime,
  }
}

function roundValue(value, precision = 3) {
  return Number(value.toFixed(precision))
}

function vectorToArray(vector) {
  return [roundValue(vector.x), roundValue(vector.y), roundValue(vector.z)]
}

function formatNumber(value) {
  return String(roundValue(value)).replace(/\.0+$/, '')
}

function formatArray(values) {
  return `[${values.map((value) => formatNumber(value)).join(', ')}]`
}

function formatCameraSnippet(name, camera) {
  return `const ${name} = {\n  position: ${formatArray(camera.position)},\n  lookAt: ${formatArray(camera.lookAt)},\n  fov: ${formatNumber(camera.fov)},\n}`
}

function formatCameraShotsSnippet(cameraShots) {
  return CAMERA_SHOTS.map((shot) => formatCameraSnippet(shot.value, cameraShots[shot.value])).join('\n\n')
}

function getExportableSetup(tuning) {
  const currentTuning = mergeTuning(tuning)

  return {
    cameraShots: getCameraShots(currentTuning),
    tuning: {
      ambient: currentTuning.ambient,
      aoIntensity: currentTuning.aoIntensity,
      background: currentTuning.background,
      bloomIntensity: currentTuning.bloomIntensity,
      cabin: currentTuning.cabin,
      cameraFov: currentTuning.cameraFov,
      cameraSmooth: currentTuning.cameraSmooth,
      closeDelay: currentTuning.closeDelay,
      closeSeconds: currentTuning.closeSeconds,
      contactShadow: currentTuning.contactShadow,
      cyan: currentTuning.cyan,
      doorOpen: currentTuning.doorOpen,
      enterDelay: currentTuning.enterDelay,
      enterSeconds: currentTuning.enterSeconds,
      environment: currentTuning.environment,
      environmentIntensity: currentTuning.environmentIntensity,
      exposure: currentTuning.exposure,
      floorColor: currentTuning.floorColor,
      key: currentTuning.key,
      materialLift: currentTuning.materialLift,
      metalPolish: currentTuning.metalPolish,
      metalRoughness: currentTuning.metalRoughness,
      mirrorFxAngle: currentTuning.mirrorFxAngle,
      mirrorFxColor: currentTuning.mirrorFxColor,
      mirrorFxDelay: currentTuning.mirrorFxDelay,
      mirrorFxGuide: currentTuning.mirrorFxGuide,
      mirrorFxOpacity: currentTuning.mirrorFxOpacity,
      mirrorFxPlaneHeight: currentTuning.mirrorFxPlaneHeight,
      mirrorFxPlaneWidth: currentTuning.mirrorFxPlaneWidth,
      mirrorFxProgress: currentTuning.mirrorFxProgress,
      mirrorFxRotationX: currentTuning.mirrorFxRotationX,
      mirrorFxRotationY: currentTuning.mirrorFxRotationY,
      mirrorFxRotationZ: currentTuning.mirrorFxRotationZ,
      mirrorFxSeconds: currentTuning.mirrorFxSeconds,
      mirrorFxSoftness: currentTuning.mirrorFxSoftness,
      mirrorFxWidth: currentTuning.mirrorFxWidth,
      mirrorFxX: currentTuning.mirrorFxX,
      mirrorFxY: currentTuning.mirrorFxY,
      mirrorFxZ: currentTuning.mirrorFxZ,
      modalBandAngle: currentTuning.modalBandAngle,
      modalBandColor: currentTuning.modalBandColor,
      modalBandOpacity: currentTuning.modalBandOpacity,
      modalBandSoftness: currentTuning.modalBandSoftness,
      modalBandWidth: currentTuning.modalBandWidth,
      modalCloseSeconds: currentTuning.modalCloseSeconds,
      modalEase: currentTuning.modalEase,
      modalRevealDelay: currentTuning.modalRevealDelay,
      modalRevealSeconds: currentTuning.modalRevealSeconds,
      openDelay: currentTuning.openDelay,
      openSeconds: currentTuning.openSeconds,
      practicalAngle: currentTuning.practicalAngle,
      practicalColor: currentTuning.practicalColor,
      practicalHeight: currentTuning.practicalHeight,
      practicalIntensity: currentTuning.practicalIntensity,
      practicalStyle: currentTuning.practicalStyle,
      previewMode: currentTuning.previewMode,
      sequenceSpeed: currentTuning.sequenceSpeed,
      toneMapping: currentTuning.toneMapping,
      turnSeconds: currentTuning.turnSeconds,
      vignetteDarkness: currentTuning.vignetteDarkness,
      wallColor: currentTuning.wallColor,
    },
  }
}

function formatFullSetupSnippet(tuning) {
  return `const elevatorSetup = ${JSON.stringify(getExportableSetup(tuning), null, 2)}`
}

function mergeTuning(tuning = {}) {
  return {
    ...DEFAULT_TUNING,
    ...tuning,
    cameraShots: getCameraShots(tuning),
  }
}

function readStoredTuning() {
  try {
    const stored = window.localStorage.getItem(TUNING_STORAGE_KEY)

    if (!stored) return mergeTuning()

    return {
      ...mergeTuning(JSON.parse(stored)),
      mirrorFxPreviewRunId: 0,
      sequenceRunId: 0,
    }
  } catch {
    return mergeTuning()
  }
}

function RendererTuning({ exposure }) {
  const { gl } = useThree()

  useEffect(() => {
    // R3F exposes Three's mutable renderer object here; exposure is a renderer setting.
    // eslint-disable-next-line react-hooks/immutability
    gl.toneMappingExposure = exposure
  }, [exposure, gl])

  return null
}

function getMaterials(material) {
  if (!material) return []

  return Array.isArray(material) ? material : [material]
}

function ElevatorAssetSequence({ cameraJumpRequest, onRequestModalOpen, setCameraDraft, showTools, tuning }) {
  const autoRevealFiredRef = useRef(false)
  const cameraRef = useRef()
  const currentLookAtRef = useRef(new Vector3(...outsideShot.lookAt))
  const elapsedRef = useRef(0)
  const groupRef = useRef()
  const materialBaselinesRef = useRef(new Map())
  const orbitRef = useRef()
  const sampleElapsedRef = useRef(0)
  const targetLookAtRef = useRef(new Vector3())
  const targetPositionRef = useRef(new Vector3())
  const { animations, scene } = useGLTF('/models/elevator.glb')
  const { actions, mixer, names } = useAnimations(animations, groupRef)
  const [started, setStarted] = useState(false)
  const startedRef = useRef(false)

  const startSequence = useCallback(() => {
    if (startedRef.current) return

    startedRef.current = true
    autoRevealFiredRef.current = false
    elapsedRef.current = 0
    setStarted(true)
  }, [])

  useEffect(() => {
    if (tuning.previewMode !== 'sequence' || tuning.sequenceRunId === 0) return

    startedRef.current = true
    autoRevealFiredRef.current = false
    elapsedRef.current = 0

    const frameId = window.requestAnimationFrame(() => {
      setStarted(true)
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [tuning.previewMode, tuning.sequenceRunId])

  useEffect(() => {
    const action = actions[names[0]]

    if (!action) return

    action.reset()
    action.play()
    mixer.setTime(0)

    return () => {
      action.stop()
    }
  }, [actions, mixer, names])

  useEffect(() => {
    const baselines = new Map()
    const originalMaterials = new Map()
    const clonedMaterials = []

    scene.traverse((object) => {
      object.castShadow = true
      object.receiveShadow = true

      if (!object.isMesh || !object.material) return

      originalMaterials.set(object, object.material)

      const cloneMaterial = (material) => {
        const cloned = material.clone()

        clonedMaterials.push(cloned)

        // The GLB uses one 'Wall' material for both the hall wall and the
        // floor; tell them apart by shape so each can take its own tint.
        if (cloned.name === 'Wall') {
          const bounds = new Box3().setFromObject(object)

          cloned.userData.hallRole = bounds.max.y - bounds.min.y < 0.5 ? 'floor' : 'wall'
        }

        baselines.set(cloned.uuid, {
          color: cloned.color?.clone(),
          envMapIntensity: cloned.envMapIntensity,
          metalness: cloned.metalness,
          roughness: cloned.roughness,
        })

        return cloned
      }

      object.material = Array.isArray(object.material) ? object.material.map(cloneMaterial) : cloneMaterial(object.material)
    })

    materialBaselinesRef.current = baselines

    // useGLTF caches the scene, so a remount (Strict Mode's double-invoke,
    // HMR) traverses the same objects again. Without restoring the pristine
    // materials here, the second pass would clone the tinted clones and
    // record the tint as "baseline", breaking the null-means-shipped-gray
    // contract.
    return () => {
      originalMaterials.forEach((material, object) => {
        object.material = material
      })
      clonedMaterials.forEach((material) => material.dispose())
    }
  }, [scene])

  useEffect(() => {
    if (tuning.previewMode !== 'camera' || !orbitRef.current) return

    orbitRef.current.target.copy(currentLookAtRef.current)
    orbitRef.current.update()
  }, [tuning.previewMode])

  useEffect(() => {
    const camera = cameraRef.current
    const controls = orbitRef.current
    const shot = cameraJumpRequest?.shot

    if (!camera || !controls || !shot) return

    camera.position.set(...shot.position)
    camera.fov = shot.fov
    camera.updateProjectionMatrix()
    currentLookAtRef.current.set(...shot.lookAt)
    controls.target.set(...shot.lookAt)
    controls.update()
  }, [cameraJumpRequest])

  useEffect(() => {
    const liftTarget = new Color('#7f8992')

    scene.traverse((object) => {
      if (!object.isMesh) return

      getMaterials(object.material).forEach((material) => {
        const baseline = materialBaselinesRef.current.get(material.uuid)

        if (!baseline) return

        if (baseline.color && material.color) {
          material.color.copy(baseline.color)
        }

        if (material.userData.hallRole === 'wall' && tuning.wallColor) {
          material.color.set(tuning.wallColor)
        }

        if (material.userData.hallRole === 'floor' && tuning.floorColor) {
          material.color.set(tuning.floorColor)
        }

        if ('envMapIntensity' in material) {
          material.envMapIntensity = (baseline.envMapIntensity ?? 1) * tuning.environmentIntensity
        }

        if (METAL_MATERIALS.has(material.name)) {
          if (material.color) {
            material.color.lerp(liftTarget, tuning.materialLift)
          }

          if ('roughness' in material) {
            // Polish is deliberately decoupled from materialLift: lift drags
            // the metal color toward neutral gray, so riding roughness on it
            // meant sharp reflections were only reachable by killing the
            // bronze. Polish blends roughness toward the Metal rough target
            // on its own axis.
            material.roughness = MathUtils.lerp(baseline.roughness ?? 0.5, tuning.metalRoughness, tuning.metalPolish ?? tuning.materialLift)
          }

          if ('metalness' in material && typeof baseline.metalness === 'number') {
            material.metalness = MathUtils.lerp(baseline.metalness, 0.65, tuning.materialLift)
          }
        }

        // The mirror near roughness 0 reflects the environment panels as
        // hard slashes; a floor blurs them into a sheen that matches the
        // shimmer motif instead of reading as a glitch.
        if (material.name === 'Mirror' && 'roughness' in material) {
          material.roughness = Math.max(material.roughness, 0.42)
        }

        material.needsUpdate = true
      })
    })
  }, [scene, tuning.environmentIntensity, tuning.floorColor, tuning.materialLift, tuning.metalPolish, tuning.metalRoughness, tuning.wallColor])

  useFrame((_, delta) => {
    const camera = cameraRef.current
    if (!camera) return

    if (tuning.previewMode === 'camera') {
      const clipTime = MathUtils.lerp(0, DOOR_OPEN_CLIP_TIME, tuning.doorOpen)
      const target = orbitRef.current?.target ?? currentLookAtRef.current

      camera.fov = tuning.cameraFov
      camera.updateProjectionMatrix()
      mixer.setTime(clipTime)

      sampleElapsedRef.current += delta

      if (sampleElapsedRef.current >= CAMERA_SAMPLE_INTERVAL) {
        sampleElapsedRef.current = 0
        setCameraDraft({
          fov: roundValue(camera.fov, 2),
          lookAt: vectorToArray(target),
          position: vectorToArray(camera.position),
        })
      }

      return
    }

    if (started && tuning.previewMode === 'sequence') {
      const timing = getSequenceTiming(tuning)

      elapsedRef.current = Math.min(elapsedRef.current + delta * tuning.sequenceSpeed, timing.closeEnd)

      if (!autoRevealFiredRef.current) {
        // Clamp to the sequence end: elapsed stops accruing at closeEnd, so an
        // unclamped threshold beyond it would leave the portfolio unreachable.
        const revealAt = Math.min(
          timing.turnStart + tuning.mirrorFxDelay + tuning.mirrorFxSeconds + tuning.modalRevealDelay,
          timing.closeEnd,
        )

        if (elapsedRef.current >= revealAt) {
          autoRevealFiredRef.current = true
          onRequestModalOpen()
        }
      }
    }

    const cameraShots = getCameraShots(tuning)
    const sequenceState = getSequenceState(elapsedRef.current, tuning)
    const manualCameraProgress = MathUtils.smoothstep(tuning.doorOpen, 0, 1)
    const manualState = {
      camera: {
        position: lerpArray(cameraShots.outsideShot.position, cameraShots.pushShot.position, manualCameraProgress),
        lookAt: lerpArray(cameraShots.outsideShot.lookAt, cameraShots.pushShot.lookAt, manualCameraProgress),
        fov: MathUtils.lerp(cameraShots.outsideShot.fov, cameraShots.pushShot.fov, manualCameraProgress),
      },
      clipTime: MathUtils.lerp(0, DOOR_OPEN_CLIP_TIME, tuning.doorOpen),
    }
    const { camera: shot, clipTime } = tuning.previewMode === 'manual' ? manualState : sequenceState

    targetPositionRef.current.set(...shot.position)
    targetLookAtRef.current.set(...shot.lookAt)

    camera.position.lerp(targetPositionRef.current, 1 - Math.exp(-delta * tuning.cameraSmooth))
    currentLookAtRef.current.lerp(targetLookAtRef.current, 1 - Math.exp(-delta * tuning.cameraSmooth))
    camera.fov = MathUtils.damp(camera.fov, shot.fov, tuning.cameraSmooth, delta)
    camera.lookAt(currentLookAtRef.current)
    camera.updateProjectionMatrix()

    mixer.setTime(clipTime)
  })

  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={getCameraShots(tuning).outsideShot.position} fov={getCameraShots(tuning).outsideShot.fov} />
      <OrbitControls
        ref={orbitRef}
        dampingFactor={0.08}
        enabled={tuning.previewMode === 'camera'}
        enableDamping
        makeDefault={false}
        target={outsideShot.lookAt}
      />
      <group ref={groupRef}>
        <primitive object={scene} />
        <ElevatorCallButton active={tuning.previewMode === 'sequence' && !started} onPress={startSequence} scene={scene} />
        <MirrorShimmerPlane
          elapsedRef={elapsedRef}
          showGuide={showTools && tuning.mirrorFxGuide}
          started={started}
          timing={getSequenceTiming(tuning)}
          tuning={tuning}
        />
      </group>
    </>
  )
}

function TuningSlider({ label, max, min, onChange, step = 0.01, value }) {
  return (
    <label className="tuning-field tuning-field--range">
      <span>
        {label}
        <strong>{Number(value).toFixed(step >= 0.1 ? 1 : 2)}</strong>
      </span>
      <input
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="range"
        value={value}
      />
    </label>
  )
}

function ShotNumberInput({ axis, label, onChange, value }) {
  return (
    <label>
      <span>{axis}</span>
      <input
        aria-label={label}
        onChange={(event) => {
          const nextValue = event.target.valueAsNumber

          if (!Number.isFinite(nextValue)) return

          onChange(nextValue)
        }}
        step={0.05}
        type="number"
        value={value}
      />
    </label>
  )
}

function ShotOffsetInput({ axis, label, onChange }) {
  const [value, setValue] = useState(0)

  return (
    <label>
      <span>{axis}</span>
      <input
        aria-label={label}
        onChange={(event) => {
          const nextValue = event.target.valueAsNumber

          if (!Number.isFinite(nextValue)) return

          setValue(nextValue)
          onChange(nextValue - value)
        }}
        onFocus={(event) => event.target.select()}
        step={0.05}
        type="number"
        value={value}
      />
    </label>
  )
}

function LightingLab({ cameraDraft, onModalClose, onModalOpen, setCameraDraft, setCameraJumpRequest, setTuning, tuning }) {
  const [collapsed, setCollapsed] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')
  const [labTab, setLabTab] = useState('scene')
  const [jumpStatus, setJumpStatus] = useState('')
  const [saveStatus, setSaveStatus] = useState('')
  const [shotName, setShotName] = useState('outsideShot')
  const savedCameraShots = getCameraShots(tuning)
  const selectedSavedShot = savedCameraShots[shotName]
  const cameraSnippet = formatCameraSnippet(shotName, cameraDraft)
  const fullSetupSnippet = formatFullSetupSnippet(tuning)
  const savedShotsSnippet = formatCameraShotsSnippet(savedCameraShots)

  const updateTuning = (key, value) => {
    setTuning((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const previewSequence = () => {
    setTuning((current) => ({
      ...current,
      previewMode: 'sequence',
      sequenceRunId: (current.sequenceRunId ?? 0) + 1,
    }))
  }

  const previewShimmer = () => {
    setTuning((current) => ({
      ...current,
      mirrorFxPreviewRunId: (current.mirrorFxPreviewRunId ?? 0) + 1,
    }))
  }

  const saveCameraShot = () => {
    setTuning((current) => ({
      ...current,
      cameraFov: cameraDraft.fov,
      cameraShots: {
        ...getCameraShots(current),
        [shotName]: cloneCameraShot(cameraDraft),
      },
    }))
    setSaveStatus('Saved')
    window.setTimeout(() => setSaveStatus(''), 1500)
  }

  const updateSavedShot = (nextShot) => {
    const shot = cloneCameraShot(nextShot)

    setCameraDraft(shot)
    setCameraJumpRequest({
      id: window.performance.now(),
      shot,
    })
    setTuning((current) => ({
      ...current,
      cameraFov: shot.fov,
      previewMode: 'camera',
      cameraShots: {
        ...getCameraShots(current),
        [shotName]: shot,
      },
    }))
  }

  const updateShotVector = (key, index, value) => {
    const nextShot = cloneCameraShot(selectedSavedShot)

    nextShot[key][index] = roundValue(value)
    updateSavedShot(nextShot)
  }

  const updateShotFov = (value) => {
    const nextShot = cloneCameraShot(selectedSavedShot)

    nextShot.fov = roundValue(value, 2)
    updateSavedShot(nextShot)
  }

  const offsetWholeShot = (index, delta) => {
    const nextShot = cloneCameraShot(selectedSavedShot)

    nextShot.position[index] = roundValue(nextShot.position[index] + delta)
    nextShot.lookAt[index] = roundValue(nextShot.lookAt[index] + delta)
    updateSavedShot(nextShot)
  }

  const goToSavedShot = () => {
    const shot = cloneCameraShot(savedCameraShots[shotName])

    setCameraDraft(shot)
    setCameraJumpRequest({
      id: window.performance.now(),
      shot,
    })
    setTuning((current) => ({
      ...current,
      cameraFov: shot.fov,
      previewMode: 'camera',
    }))
    setJumpStatus('Loaded')
    window.setTimeout(() => setJumpStatus(''), 1500)
  }

  const copyCameraSnippet = async () => {
    try {
      await navigator.clipboard.writeText(cameraSnippet)
      setCopyStatus('Copied')
    } catch {
      setCopyStatus('Select the snippet')
    }

    window.setTimeout(() => setCopyStatus(''), 1800)
  }

  const copySavedShots = async () => {
    try {
      await navigator.clipboard.writeText(savedShotsSnippet)
      setCopyStatus('Copied all')
    } catch {
      setCopyStatus('Select snippets')
    }

    window.setTimeout(() => setCopyStatus(''), 1800)
  }

  const copyFullSetup = async () => {
    try {
      await navigator.clipboard.writeText(fullSetupSnippet)
      setCopyStatus('Copied setup')
    } catch {
      setCopyStatus('Select setup')
    }

    window.setTimeout(() => setCopyStatus(''), 1800)
  }

  return (
    <aside className={collapsed ? 'lighting-lab lighting-lab--collapsed' : 'lighting-lab'} data-preview-ui>
      <div className="lighting-lab__header">
        <div>
          <p>Lighting Lab</p>
          <span>Elevator scene tools</span>
        </div>
        <button
          aria-expanded={!collapsed}
          className="lighting-lab__toggle"
          onClick={() => setCollapsed((current) => !current)}
          type="button"
        >
          {collapsed ? 'Expand' : 'Minimize'}
        </button>
      </div>

      {!collapsed && (
      <>
      <div className="lighting-lab__modes" aria-label="Preview mode">
        <button
          className={tuning.previewMode === 'sequence' ? 'is-active' : ''}
          onClick={previewSequence}
          type="button"
        >
          Sequence
        </button>
        <button
          className={tuning.previewMode === 'manual' ? 'is-active' : ''}
          onClick={() => updateTuning('previewMode', 'manual')}
          type="button"
        >
          Manual
        </button>
        <button
          className={tuning.previewMode === 'camera' ? 'is-active' : ''}
          onClick={() => updateTuning('previewMode', 'camera')}
          type="button"
        >
          Camera
        </button>
      </div>

      <div className="lighting-lab__tabs" role="tablist">
        {LAB_TABS.map((tab) => (
          <button
            key={tab}
            className={labTab === tab ? 'is-active' : ''}
            onClick={() => setLabTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="tuning-grid" hidden={labTab !== 'scene'}>
        <label className="tuning-field">
          <span>HDRI preset</span>
          <select value={tuning.environment} onChange={(event) => updateTuning('environment', event.target.value)}>
            {ENVIRONMENT_PRESETS.map((preset) => (
              <option key={preset} value={preset}>
                {preset}
              </option>
            ))}
          </select>
        </label>

        <label className="tuning-field">
          <span>Background</span>
          <input type="color" value={tuning.background} onChange={(event) => updateTuning('background', event.target.value)} />
        </label>

        <TuningSlider label="Exposure" max={2.5} min={0.45} onChange={(value) => updateTuning('exposure', value)} value={tuning.exposure} />
        <TuningSlider
          label="Reflections"
          max={3}
          min={0}
          onChange={(value) => updateTuning('environmentIntensity', value)}
          value={tuning.environmentIntensity}
        />
        <TuningSlider label="Ambient" max={2} min={0} onChange={(value) => updateTuning('ambient', value)} value={tuning.ambient} />
        <TuningSlider label="Key light" max={5} min={0} onChange={(value) => updateTuning('key', value)} value={tuning.key} />
        <TuningSlider label="Blue fill" max={3} min={0} onChange={(value) => updateTuning('cyan', value)} value={tuning.cyan} />
        <TuningSlider label="Cabin fill" max={3} min={0} onChange={(value) => updateTuning('cabin', value)} value={tuning.cabin} />
        <TuningSlider
          label="Metal lift"
          max={1}
          min={0}
          onChange={(value) => updateTuning('materialLift', value)}
          value={tuning.materialLift}
        />
        <TuningSlider
          label="Metal polish"
          max={1}
          min={0}
          onChange={(value) => updateTuning('metalPolish', value)}
          value={tuning.metalPolish}
        />
        <TuningSlider
          label="Metal rough"
          max={1}
          min={0}
          onChange={(value) => updateTuning('metalRoughness', value)}
          value={tuning.metalRoughness}
        />
      </div>

      <div className="tuning-grid" hidden={labTab !== 'motion'}>
        <TuningSlider
          label="Camera smooth"
          max={8}
          min={1}
          onChange={(value) => updateTuning('cameraSmooth', value)}
          step={0.1}
          value={tuning.cameraSmooth}
        />
        <TuningSlider
          label="Camera FOV"
          max={75}
          min={28}
          onChange={(value) => updateTuning('cameraFov', value)}
          step={1}
          value={tuning.cameraFov}
        />
        <TuningSlider
          label="Sequence speed"
          max={2}
          min={0.25}
          onChange={(value) => updateTuning('sequenceSpeed', value)}
          step={0.05}
          value={tuning.sequenceSpeed}
        />
        <TuningSlider
          label="Open delay"
          max={1.5}
          min={0}
          onChange={(value) => updateTuning('openDelay', value)}
          step={0.05}
          value={tuning.openDelay}
        />
        <TuningSlider
          label="Open seconds"
          max={6}
          min={0.5}
          onChange={(value) => updateTuning('openSeconds', value)}
          step={0.05}
          value={tuning.openSeconds}
        />
        <TuningSlider
          label="Enter delay"
          max={2}
          min={0}
          onChange={(value) => updateTuning('enterDelay', value)}
          step={0.05}
          value={tuning.enterDelay}
        />
        <TuningSlider
          label="Enter seconds"
          max={5}
          min={0.5}
          onChange={(value) => updateTuning('enterSeconds', value)}
          step={0.05}
          value={tuning.enterSeconds}
        />
        <TuningSlider
          label="Turn seconds"
          max={5}
          min={0.5}
          onChange={(value) => updateTuning('turnSeconds', value)}
          step={0.05}
          value={tuning.turnSeconds}
        />
        <TuningSlider
          label="Close delay"
          max={3}
          min={0}
          onChange={(value) => updateTuning('closeDelay', value)}
          step={0.05}
          value={tuning.closeDelay}
        />
        <TuningSlider
          label="Close seconds"
          max={4}
          min={0.5}
          onChange={(value) => updateTuning('closeSeconds', value)}
          step={0.05}
          value={tuning.closeSeconds}
        />
        <TuningSlider
          label="Door open"
          max={1}
          min={0}
          onChange={(value) => updateTuning('doorOpen', value)}
          value={tuning.doorOpen}
        />
      </div>

      <div className="tuning-grid" hidden={labTab !== 'render'}>
        <div className="tuning-section">
          <div className="tuning-section__header">
            <span>Render</span>
          </div>

          <label className="tuning-field">
            <span>Tone mapping</span>
            <select value={tuning.toneMapping} onChange={(event) => updateTuning('toneMapping', event.target.value)}>
              {TONE_MAPPING_OPTIONS.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </label>

          <TuningSlider
            label="AO intensity"
            max={6}
            min={0}
            onChange={(value) => updateTuning('aoIntensity', value)}
            step={0.1}
            value={tuning.aoIntensity}
          />
          <TuningSlider
            label="Bloom"
            max={2}
            min={0}
            onChange={(value) => updateTuning('bloomIntensity', value)}
            step={0.05}
            value={tuning.bloomIntensity}
          />
          <TuningSlider
            label="Vignette"
            max={1}
            min={0}
            onChange={(value) => updateTuning('vignetteDarkness', value)}
            step={0.05}
            value={tuning.vignetteDarkness}
          />
        </div>
      </div>

      <div className="tuning-grid" hidden={labTab !== 'hall'}>
        <div className="tuning-section">
          <div className="tuning-section__header">
            <span>Practicals</span>
          </div>

          <label className="tuning-field">
            <span>Fixture style</span>
            <select value={tuning.practicalStyle} onChange={(event) => updateTuning('practicalStyle', event.target.value)}>
              {PRACTICAL_STYLE_OPTIONS.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </label>
          <label className="tuning-field">
            <span>Fixture color</span>
            <input
              type="color"
              value={tuning.practicalColor}
              onChange={(event) => updateTuning('practicalColor', event.target.value)}
            />
          </label>

          <TuningSlider
            label="Fixture power"
            max={120}
            min={0}
            onChange={(value) => updateTuning('practicalIntensity', value)}
            step={1}
            value={tuning.practicalIntensity}
          />
          <TuningSlider
            label="Beam angle"
            max={1.1}
            min={0.2}
            onChange={(value) => updateTuning('practicalAngle', value)}
            value={tuning.practicalAngle}
          />
          <TuningSlider
            label="Mount height"
            max={2.2}
            min={1.2}
            onChange={(value) => updateTuning('practicalHeight', value)}
            step={0.01}
            value={tuning.practicalHeight}
          />
        </div>

        <div className="tuning-section">
          <div className="tuning-section__header">
            <span>Hall</span>
          </div>

          <label className="tuning-field">
            <span>Wall color</span>
            <input
              type="color"
              value={tuning.wallColor ?? '#e6e6e6'}
              onChange={(event) => updateTuning('wallColor', event.target.value)}
            />
          </label>
          <label className="tuning-field">
            <span>Floor color</span>
            <input
              type="color"
              value={tuning.floorColor ?? '#e6e6e6'}
              onChange={(event) => updateTuning('floorColor', event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="tuning-grid" hidden={labTab !== 'fx'}>
        <div className="tuning-section">
          <div className="tuning-section__header">
            <span>Mirror FX</span>
            <button onClick={previewShimmer} type="button">
              Preview Shimmer
            </button>
          </div>

          <label className="tuning-field">
            <span>Shimmer color</span>
            <input type="color" value={tuning.mirrorFxColor} onChange={(event) => updateTuning('mirrorFxColor', event.target.value)} />
          </label>
          <label className="tuning-field tuning-field--checkbox">
            <span>
              Show plane guide
              <strong>{tuning.mirrorFxGuide ? 'On' : 'Off'}</strong>
            </span>
            <input
              checked={tuning.mirrorFxGuide}
              onChange={(event) => updateTuning('mirrorFxGuide', event.target.checked)}
              type="checkbox"
            />
          </label>

          <TuningSlider
            label="Shimmer position"
            max={1}
            min={0}
            onChange={(value) => updateTuning('mirrorFxProgress', value)}
            value={tuning.mirrorFxProgress}
          />
          <TuningSlider
            label="FX opacity"
            max={1.5}
            min={0}
            onChange={(value) => updateTuning('mirrorFxOpacity', value)}
            value={tuning.mirrorFxOpacity}
          />
          <TuningSlider
            label="FX angle"
            max={360}
            min={0}
            onChange={(value) => updateTuning('mirrorFxAngle', value)}
            step={1}
            value={tuning.mirrorFxAngle}
          />
          <TuningSlider
            label="FX band"
            max={0.5}
            min={0.01}
            onChange={(value) => updateTuning('mirrorFxWidth', value)}
            value={tuning.mirrorFxWidth}
          />
          <TuningSlider
            label="FX feather"
            max={0.5}
            min={0.01}
            onChange={(value) => updateTuning('mirrorFxSoftness', value)}
            value={tuning.mirrorFxSoftness}
          />
          <TuningSlider
            label="FX delay"
            max={2}
            min={0}
            onChange={(value) => updateTuning('mirrorFxDelay', value)}
            step={0.05}
            value={tuning.mirrorFxDelay}
          />
          <TuningSlider
            label="FX seconds"
            max={3}
            min={0.25}
            onChange={(value) => updateTuning('mirrorFxSeconds', value)}
            step={0.05}
            value={tuning.mirrorFxSeconds}
          />
          <TuningSlider
            label="Plane X"
            max={-2.05}
            min={-2.65}
            onChange={(value) => updateTuning('mirrorFxX', value)}
            step={0.005}
            value={tuning.mirrorFxX}
          />
          <TuningSlider
            label="Plane Y"
            max={3.6}
            min={0.4}
            onChange={(value) => updateTuning('mirrorFxY', value)}
            step={0.01}
            value={tuning.mirrorFxY}
          />
          <TuningSlider
            label="Plane Z"
            max={2}
            min={-2}
            onChange={(value) => updateTuning('mirrorFxZ', value)}
            step={0.01}
            value={tuning.mirrorFxZ}
          />
          <TuningSlider
            label="Plane width"
            max={5}
            min={0.4}
            onChange={(value) => updateTuning('mirrorFxPlaneWidth', value)}
            step={0.01}
            value={tuning.mirrorFxPlaneWidth}
          />
          <TuningSlider
            label="Plane height"
            max={5}
            min={0.4}
            onChange={(value) => updateTuning('mirrorFxPlaneHeight', value)}
            step={0.01}
            value={tuning.mirrorFxPlaneHeight}
          />
          <TuningSlider
            label="Plane pitch"
            max={180}
            min={-180}
            onChange={(value) => updateTuning('mirrorFxRotationX', value)}
            step={1}
            value={tuning.mirrorFxRotationX}
          />
          <TuningSlider
            label="Plane turn"
            max={180}
            min={-180}
            onChange={(value) => updateTuning('mirrorFxRotationY', value)}
            step={1}
            value={tuning.mirrorFxRotationY}
          />
          <TuningSlider
            label="Plane roll"
            max={180}
            min={-180}
            onChange={(value) => updateTuning('mirrorFxRotationZ', value)}
            step={1}
            value={tuning.mirrorFxRotationZ}
          />
        </div>

        <div className="tuning-section">
          <div className="tuning-section__header">
            <span>Modal Reveal</span>
            <div className="tuning-section__header-actions">
              <button onClick={onModalOpen} type="button">
                Open
              </button>
              <button onClick={onModalClose} type="button">
                Close
              </button>
            </div>
          </div>

          <label className="tuning-field">
            <span>Ease</span>
            <select value={tuning.modalEase} onChange={(event) => updateTuning('modalEase', event.target.value)}>
              {MODAL_EASE_OPTIONS.map((ease) => (
                <option key={ease} value={ease}>
                  {ease}
                </option>
              ))}
            </select>
          </label>
          <label className="tuning-field">
            <span>Band color</span>
            <input type="color" value={tuning.modalBandColor} onChange={(event) => updateTuning('modalBandColor', event.target.value)} />
          </label>

          <TuningSlider
            label="Reveal delay"
            max={3}
            min={0}
            onChange={(value) => updateTuning('modalRevealDelay', value)}
            step={0.05}
            value={tuning.modalRevealDelay}
          />
          <TuningSlider
            label="Reveal seconds"
            max={4}
            min={0.2}
            onChange={(value) => updateTuning('modalRevealSeconds', value)}
            step={0.05}
            value={tuning.modalRevealSeconds}
          />
          <TuningSlider
            label="Close seconds"
            max={4}
            min={0.2}
            onChange={(value) => updateTuning('modalCloseSeconds', value)}
            step={0.05}
            value={tuning.modalCloseSeconds}
          />
          <TuningSlider
            label="Band angle"
            max={360}
            min={0}
            onChange={(value) => updateTuning('modalBandAngle', value)}
            step={1}
            value={tuning.modalBandAngle}
          />
          <TuningSlider
            label="Band width"
            max={40}
            min={0}
            onChange={(value) => updateTuning('modalBandWidth', value)}
            step={0.5}
            value={tuning.modalBandWidth}
          />
          <TuningSlider
            label="Band feather"
            max={40}
            min={0.5}
            onChange={(value) => updateTuning('modalBandSoftness', value)}
            step={0.5}
            value={tuning.modalBandSoftness}
          />
          <TuningSlider
            label="Band opacity"
            max={1}
            min={0}
            onChange={(value) => updateTuning('modalBandOpacity', value)}
            value={tuning.modalBandOpacity}
          />
        </div>
      </div>

      <div className="camera-tools" hidden={labTab !== 'camera'}>
        <label className="tuning-field">
          <span>Selected shot</span>
          <select value={shotName} onChange={(event) => setShotName(event.target.value)}>
            {CAMERA_SHOTS.map((shot) => (
              <option key={shot.value} value={shot.value}>
                {shot.label}
              </option>
            ))}
          </select>
        </label>
        <div className="shot-editor">
          <div className="shot-editor__group">
            <span>Move Whole Shot</span>
            <div className="shot-editor__row">
              {['X', 'Y', 'Z'].map((axis, index) => (
                <ShotOffsetInput
                  axis={axis}
                  key={`${shotName}-offset-${axis}`}
                  label={`${shotName} move whole shot ${axis}`}
                  onChange={(delta) => offsetWholeShot(index, delta)}
                />
              ))}
            </div>
          </div>
          <div className="shot-editor__group">
            <span>Position</span>
            <div className="shot-editor__row">
              {['X', 'Y', 'Z'].map((axis, index) => (
                <ShotNumberInput
                  axis={axis}
                  key={`position-${axis}`}
                  label={`${shotName} position ${axis}`}
                  onChange={(value) => updateShotVector('position', index, value)}
                  value={selectedSavedShot.position[index]}
                />
              ))}
            </div>
          </div>
          <div className="shot-editor__group">
            <span>Look At</span>
            <div className="shot-editor__row">
              {['X', 'Y', 'Z'].map((axis, index) => (
                <ShotNumberInput
                  axis={axis}
                  key={`look-at-${axis}`}
                  label={`${shotName} look at ${axis}`}
                  onChange={(value) => updateShotVector('lookAt', index, value)}
                  value={selectedSavedShot.lookAt[index]}
                />
              ))}
            </div>
          </div>
          <div className="shot-editor__group">
            <span>FOV</span>
            <div className="shot-editor__row shot-editor__row--single">
              <ShotNumberInput axis="FOV" label={`${shotName} fov`} onChange={updateShotFov} value={selectedSavedShot.fov} />
            </div>
          </div>
        </div>
        <textarea aria-label="Camera shot snippet" readOnly value={cameraSnippet} />
        <div className="camera-tools__actions">
          <button onClick={goToSavedShot} type="button">
            {jumpStatus || 'Go To Shot'}
          </button>
          <button onClick={saveCameraShot} type="button">
            {saveStatus || 'Save Shot'}
          </button>
          <button onClick={previewSequence} type="button">
            Preview Sequence
          </button>
          <button onClick={copyCameraSnippet} type="button">
            {copyStatus === 'Copied' ? copyStatus : 'Copy Current'}
          </button>
          <button onClick={copySavedShots} type="button">
            {copyStatus === 'Copied all' ? copyStatus : 'Copy Saved'}
          </button>
          <button onClick={copyFullSetup} type="button">
            {copyStatus === 'Copied setup' ? copyStatus : 'Copy Full Setup'}
          </button>
        </div>
      </div>

      <div className="lighting-lab__actions">
        <button onClick={() => setTuning(mergeTuning())} type="button">
          Default Look
        </button>
        <button onClick={() => setTuning(mergeTuning(ORIGINAL_TUNING))} type="button">
          Original
        </button>
      </div>
      </>
      )}
    </aside>
  )
}

export default function ElevatorExperience({ showTools = false }) {
  const [cameraDraft, setCameraDraft] = useState(() => ({
    fov: outsideShot.fov,
    lookAt: outsideShot.lookAt,
    position: outsideShot.position,
  }))
  const [cameraJumpRequest, setCameraJumpRequest] = useState(null)
  const [modalPhase, setModalPhase] = useState('closed')
  // Tuning storage is a Lab-only concern: without it gated on showTools,
  // every visitor pins the deploy-time defaults forever, and Lab preview
  // state (manual door-open, camera mode) leaks into the real experience.
  const [tuning, setTuning] = useState(() => (showTools ? readStoredTuning() : mergeTuning()))

  const openModal = useCallback(() => {
    setModalPhase((current) => (current === 'open' || current === 'opening' ? current : 'opening'))
  }, [])

  const closeModal = useCallback(() => {
    setModalPhase((current) => (current === 'closed' || current === 'closing' ? current : 'closing'))
  }, [])

  const handleModalOpened = useCallback(() => setModalPhase('open'), [])
  const handleModalClosed = useCallback(() => setModalPhase('closed'), [])

  useEffect(() => {
    if (!showTools) return

    window.localStorage.setItem(
      TUNING_STORAGE_KEY,
      JSON.stringify({
        ...tuning,
        mirrorFxPreviewRunId: 0,
        sequenceRunId: 0,
      }),
    )
  }, [showTools, tuning])

  return (
    <div className="elevator-experience-shell">
      <Canvas frameloop={modalPhase === 'open' ? 'never' : 'always'} shadows gl={{ preserveDrawingBuffer: true }}>
        <RendererTuning exposure={tuning.exposure} />
        <color attach="background" args={[tuning.background]} />
        <ambientLight intensity={tuning.ambient} />
        <directionalLight
          position={[6, 7, 5]}
          intensity={tuning.key}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-normalBias={0.02}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-2}
          shadow-camera-near={1}
          shadow-camera-far={25}
        />
        <pointLight position={[3, 2.7, -2.6]} intensity={tuning.cyan} color="#7dd3fc" />
        <pointLight position={[-1.6, 2.2, -1.1]} intensity={tuning.cabin} color="#f8fafc" />
        <ElevatorAssetSequence
          cameraJumpRequest={cameraJumpRequest}
          onRequestModalOpen={openModal}
          setCameraDraft={setCameraDraft}
          showTools={showTools}
          tuning={tuning}
        />
        <HallPracticals tuning={tuning} />
        <HallDressing visible={tuning.hallDressing !== false} />
        <ContactShadows position={[0, 0.02, 0]} opacity={tuning.contactShadow} scale={12} blur={2.6} far={5} />
        <HallEnvironment intensity={tuning.environmentIntensity} preset={tuning.environment} />
        <EffectComposer multisampling={4}>
          <N8AO aoRadius={0.4} distanceFalloff={0.75} halfRes intensity={tuning.aoIntensity} />
          <Bloom intensity={tuning.bloomIntensity} luminanceThreshold={1} mipmapBlur radius={0.7} />
          <Vignette darkness={tuning.vignetteDarkness} eskil={false} offset={0.15} />
          <ToneMapping mode={TONE_MAPPING_MODES[tuning.toneMapping] ?? ToneMappingMode.AGX} />
        </EffectComposer>
      </Canvas>
      <PortfolioModalLoader
        onClosed={handleModalClosed}
        onOpened={handleModalOpened}
        phase={modalPhase}
        tuning={tuning}
      />
      {showTools && (
        <LightingLab
          cameraDraft={cameraDraft}
          onModalClose={closeModal}
          onModalOpen={openModal}
          setCameraDraft={setCameraDraft}
          setCameraJumpRequest={setCameraJumpRequest}
          setTuning={setTuning}
          tuning={tuning}
        />
      )}
    </div>
  )
}

useGLTF.preload('/models/elevator.glb')
