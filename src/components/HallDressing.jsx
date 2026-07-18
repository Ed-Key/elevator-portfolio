import { Suspense, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'

// Set dressing loads after the elevator is interactive: Suspense with a
// null fallback keeps the props off the critical path, and the draco
// decoder comes from /draco (already shipped for the repo).

const DRACO_PATH = '/draco/'

// Positions keep the camera path clear (it enters at z 0) and sit the
// cluster inside the left sconce's light pool; the call plate balances
// the right side. Odd-count cluster, varied heights, per the reference.
const SET_DRESSING = [
  { url: '/models/props/potted_plant_01.glb', position: [0.55, 0, 2.55], rotation: [0, -0.6, 0], scale: 1.15 },
  { url: '/models/props/potted_plant_02.glb', position: [0.9, 0, 2.1], rotation: [0, 0.9, 0], scale: 1 },
]

function Prop({ position, rotation, scale, url }) {
  const { scene } = useGLTF(url, DRACO_PATH)

  useEffect(() => {
    scene.traverse((object) => {
      object.castShadow = true
      object.receiveShadow = true
    })
  }, [scene])

  return <primitive object={scene} position={position} rotation={rotation} scale={scale} />
}

export default function HallDressing({ visible }) {
  if (!visible) return null

  return (
    <Suspense fallback={null}>
      <group>
        {SET_DRESSING.map((prop) => (
          <Prop key={prop.url} {...prop} />
        ))}
      </group>
    </Suspense>
  )
}
