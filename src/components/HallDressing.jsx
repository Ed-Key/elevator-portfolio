import { Component, Suspense, useEffect, useMemo } from 'react'
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

// The terracotta-tinted angular vase is Ed's pick; plant_01's pot is
// wider than the vase mouth, so each vase carries potted_plant_02's
// foliage only (its canopy droops below its origin and spills over the
// rim, hiding the mouth without soil or trunk geometry).
const TERRACOTTA = { color: '#8a4d33', metalness: 0.05, roughness: 0.7 }

const SET_DRESSING = [
  { url: '/models/props/ceramic_vase_03.glb', position: [0.55, 0, 2.55], rotation: [0, 0, 0], scale: 2.4, tint: TERRACOTTA, soilCap: { radius: 0.046, y: 0.402 } },
  {
    url: '/models/props/potted_plant_02.glb',
    position: [0.6, 0, 2.52],
    rotation: [0, 0.9, 0],
    scale: 1,
    hideMaterials: ['potted_plant_02_pot'],
    kind: 'foliage',
  },
  { url: '/models/props/ceramic_vase_03.glb', position: [0.55, 0, -2.55], rotation: [0, 0, 0], scale: 2.4, tint: TERRACOTTA, soilCap: { radius: 0.046, y: 0.402 } },
  {
    url: '/models/props/potted_plant_02.glb',
    position: [0.6, 0, -2.52],
    rotation: [0, 2.24, 0],
    scale: 1,
    hideMaterials: ['potted_plant_02_pot'],
    kind: 'foliage',
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

function Prop({ hideMaterials, planter, position, rotation, scale, soilCap, tint, url }) {
  const { scene } = useGLTF(url, DRACO_PATH)
  // The same GLB appears on both sides of the portal; useGLTF caches one
  // scene object, so each Prop renders its own clone.
  const instance = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    instance.traverse((object) => {
      object.castShadow = true
      object.receiveShadow = true

      if (hideMaterials && object.isMesh && hideMaterials.includes(object.material?.name)) {
        object.visible = false
      }

      if (tint && object.isMesh && object.material) {
        object.material = object.material.clone()
        object.material.color.set(tint.color)
        if ('metalness' in object.material) object.material.metalness = tint.metalness ?? object.material.metalness
        if ('roughness' in object.material) object.material.roughness = tint.roughness ?? object.material.roughness
      }
    })
  }, [hideMaterials, instance, tint])

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={instance} />
      {planter && <CachePot {...planter} />}
      {soilCap && (
        <mesh position={[0, soilCap.y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[soilCap.radius, 24]} />
          <meshStandardMaterial color="#17100a" roughness={1} />
        </mesh>
      )}
    </group>
  )
}

// useGLTF rejections (a 404'd model or decoder) throw past Suspense, and
// an unhandled throw inside the Canvas takes the whole elevator down, the
// same failure shape the modal loader guards against. Decorative props
// must never cost the core experience: each prop gets its own boundary so
// one bad file silently disappears instead.
class PropBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

export default function HallDressing({ tuning, visible }) {
  if (!visible) return null

  return (
    <group>
      {SET_DRESSING.map((prop) => {
        const resolved = prop.kind === 'foliage'
          ? {
              ...prop,
              position: [prop.position[0], tuning.dressingFoliageHeight ?? 0.62, prop.position[2]],
              rotation: [0, prop.rotation[1] + (tuning.dressingFoliageTurn ?? 0), 0],
              scale: tuning.dressingFoliageScale ?? 1.45,
            }
          : prop

        return (
          <PropBoundary key={`${prop.url}@${prop.position.join(',')}`}>
            <Suspense fallback={null}>
              <Prop {...resolved} />
            </Suspense>
          </PropBoundary>
        )
      })}
    </group>
  )
}
