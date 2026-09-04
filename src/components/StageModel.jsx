import { Center, Environment, Lightformer, useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'

// Tiny R3F stage mark for a project's 3D logo. Draco decoders are vendored
// at public/draco/ — nothing loads from a CDN. The static `poster` node shows
// until the model's first frame is ready.

const DEFAULT_VIEW = {
  camera: [0, 0, 5.6],
  rotation: [0.02, -0.55, 0],
  scale: 1,
}

// The mark answers to the whole panel, not just to a cursor parked on its own
// ~150px canvas, so the cursor offset is measured against half the viewport
// rather than against the canvas. The stage holds the last armed project after
// pointer-leave, which is what gives the cursor room to roam.
const pointerReach = () => Math.min(window.innerWidth, window.innerHeight) / 2
const TILT_YAW = 0.4
const TILT_PITCH = 0.24

const clamp = (value) => Math.min(Math.max(value, -1), 1)

function FloatingModel({ onReady, src, view = DEFAULT_VIEW }) {
  const { scene } = useGLTF(src, '/draco/')
  const canvas = useThree((state) => state.gl.domElement)
  const group = useRef()
  const target = useRef({ x: 0, y: 0 })
  const eased = useRef({ x: 0, y: 0 })
  const [baseX, baseY, baseZ] = view.rotation ?? DEFAULT_VIEW.rotation

  useEffect(() => {
    onReady()
  }, [onReady])

  useEffect(() => {
    // Same guards as the hall's cursor parallax: no lean where there is no
    // cursor, or where the visitor asked for less motion.
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const onMove = (event) => {
      // Measured from the mark rather than from the viewport centre, unlike
      // the hall camera: this mark sits off to one side of the panel, and it
      // should lean toward the cursor from where it actually is.
      const rect = canvas.getBoundingClientRect()
      const reach = pointerReach()
      target.current.x = clamp((event.clientX - (rect.left + rect.width / 2)) / reach)
      target.current.y = clamp((event.clientY - (rect.top + rect.height / 2)) / reach)
    }

    const recenter = () => {
      target.current = { x: 0, y: 0 }
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('blur', recenter)
    document.addEventListener('mouseleave', recenter)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('blur', recenter)
      document.removeEventListener('mouseleave', recenter)
    }
  }, [canvas])

  useFrame(({ clock }, delta) => {
    if (!group.current) return
    const t = clock.getElapsedTime()
    // Framerate-independent damping, so the follow feels the same at 60 and 120.
    const k = 1 - Math.exp(-delta * 6)

    eased.current.x += (target.current.x - eased.current.x) * k
    eased.current.y += (target.current.y - eased.current.y) * k

    group.current.rotation.set(
      baseX + Math.sin(t * 0.8) * 0.035 + eased.current.y * TILT_PITCH,
      baseY + Math.sin(t * 0.55) * 0.09 + eased.current.x * TILT_YAW,
      baseZ + Math.sin(t * 0.7) * 0.025,
    )
    group.current.position.y = Math.sin(t * 0.9) * 0.045
  })

  return (
    <group ref={group} rotation={[baseX, baseY, baseZ]} scale={view.scale ?? DEFAULT_VIEW.scale}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  )
}

export default function StageModel({ poster, src, view = DEFAULT_VIEW }) {
  const [ready, setReady] = useState(false)
  const camera = view.camera ?? DEFAULT_VIEW.camera

  return (
    <span aria-hidden="true" className={ready ? 'stage-model is-ready' : 'stage-model'}>
      {!ready && poster}
      <Canvas
        camera={{ fov: view.fov ?? 40, position: camera }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight color="#fff3dc" intensity={0.9} />
        <directionalLight color="#f0c870" intensity={1.7} position={[2.5, 3, 4]} />
        <directionalLight color="#8fa1ff" intensity={0.45} position={[-3, -1.5, 2]} />
        {/* Project logos are glTF PBR: with no environment their indirect
            diffuse and specular are both zero, so the art reads several stops
            darker here than it does on the project's own site. Baked once from
            lightformers for the same reason as the hall, no CDN HDRI. */}
        <Environment environmentIntensity={0.25} frames={1} resolution={128}>
          <color args={['#120a04']} attach="background" />
          <Lightformer color="#ffd9a0" form="rect" intensity={3.2} position={[3, 3, 4]} scale={[6, 6, 1]} />
          <Lightformer color="#ffb066" form="rect" intensity={1.6} position={[-4, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} />
        </Environment>
        <Suspense fallback={null}>
          <FloatingModel onReady={() => setReady(true)} src={src} view={view} />
        </Suspense>
      </Canvas>
    </span>
  )
}
