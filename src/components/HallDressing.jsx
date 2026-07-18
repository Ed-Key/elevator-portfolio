import { Suspense, useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'

// Set dressing loads after the elevator is interactive: Suspense with a
// null fallback keeps the props off the critical path, and the draco
// decoder comes from /draco (already shipped for the repo).

const DRACO_PATH = '/draco/'

// Positions keep the camera path clear (it enters at z 0) and seat the
// plants inside the sconce light pools, mirrored across the portal for
// formal symmetry. The scanned terracotta pots stay in the files; each
// plant drops into a code-built cachepot that fully encloses them, the
// same move real lobbies use to dress a nursery pot.
const PLANTER_FINISHES = {
  bronze: { color: '#4a3a2a', metalness: 0.85, roughness: 0.35 },
  white: { color: '#e6e0d6', metalness: 0.05, roughness: 0.42 },
}

const SET_DRESSING = [
  {
    url: '/models/props/potted_plant_01.glb',
    position: [0.55, 0, 2.55],
    rotation: [0, -0.6, 0],
    scale: 1.15,
    planter: { finish: 'white', radiusTop: 0.25, radiusBottom: 0.19, height: 0.66 },
  },
  {
    url: '/models/props/potted_plant_01.glb',
    position: [0.55, 0, -2.55],
    rotation: [0, 2.4, 0],
    scale: 1.15,
    planter: { finish: 'white', radiusTop: 0.25, radiusBottom: 0.19, height: 0.66 },
  },
  {
    url: '/models/props/potted_plant_02.glb',
    position: [0.92, 0, 2.05],
    rotation: [0, 0.9, 0],
    scale: 1,
    planter: { finish: 'white', radiusTop: 0.28, radiusBottom: 0.24, height: 0.48 },
  },
]

function CachePot({ finish, height, radiusBottom, radiusTop }) {
  const material = PLANTER_FINISHES[finish]

  return (
    <group>
      <mesh castShadow position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radiusTop, radiusBottom, height, 32, 1, true]} />
        <meshStandardMaterial {...material} side={2} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radiusBottom, 32]} />
        <meshStandardMaterial {...material} />
      </mesh>
      {/* dark soil cap hides the terracotta rim inside the shell */}
      <mesh position={[0, height - 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radiusTop - 0.008, 32]} />
        <meshStandardMaterial color="#17100a" roughness={1} />
      </mesh>
    </group>
  )
}

function Prop({ planter, position, rotation, scale, url }) {
  const { scene } = useGLTF(url, DRACO_PATH)
  // The same GLB appears on both sides of the portal; useGLTF caches one
  // scene object, so each Prop renders its own clone.
  const instance = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    instance.traverse((object) => {
      object.castShadow = true
      object.receiveShadow = true
    })
  }, [instance])

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={instance} />
      {planter && <CachePot {...planter} />}
    </group>
  )
}

export default function HallDressing({ visible }) {
  if (!visible) return null

  return (
    <Suspense fallback={null}>
      <group>
        {SET_DRESSING.map((prop) => (
          <Prop key={`${prop.url}@${prop.position.join(',')}`} {...prop} />
        ))}
      </group>
    </Suspense>
  )
}
