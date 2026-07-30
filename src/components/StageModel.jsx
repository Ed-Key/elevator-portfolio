import { Center, Environment, Lightformer, useGLTF } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'

// Tiny R3F stage mark for a project's 3D logo. Draco decoders are vendored
// at public/draco/ — nothing loads from a CDN. The static `poster` node shows
// until the model's first frame is ready.

const DEFAULT_VIEW = {
  camera: [0, 0, 5.6],
  rotation: [0.02, -0.55, 0],
  scale: 1,
}

function FloatingModel({ onReady, src, view = DEFAULT_VIEW }) {
  const { scene } = useGLTF(src, '/draco/')
  const group = useRef()
  const [baseX, baseY, baseZ] = view.rotation ?? DEFAULT_VIEW.rotation

  useEffect(() => {
    onReady()
  }, [onReady])

  useFrame(({ clock }) => {
    if (!group.current) return
    const t = clock.getElapsedTime()
    group.current.rotation.set(
      baseX + Math.sin(t * 0.8) * 0.035,
      baseY + Math.sin(t * 0.55) * 0.09,
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
