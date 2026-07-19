import { Component, Suspense, useEffect, useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { Plane, Vector3 } from 'three'

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

// Ed's chosen composition: the terracotta-tinted angular vases carrying
// the scanned plants' own foliage. The plant's pot and trunk share one
// mesh, so a clipping plane slices away everything below the trunk base;
// the cut hides inside the vase under the soil cap.
const TERRACOTTA = { color: '#8a4d33', metalness: 0.05, roughness: 0.7 }

const SET_DRESSING = [
  { url: '/models/props/ceramic_vase_03.glb', position: [0.55, 0, 2.55], rotation: [0, 0, 0], scale: 2.4, tint: TERRACOTTA, soilCap: { radius: 0.046, y: 0.402 } },
  {
    url: '/models/props/potted_plant_01.glb',
    position: [0.55, 0.31, 2.55],
    seatY: 0.9655,
    rotation: [0, -0.6, 0],
    scale: 1.15,
    clipBelow: 0.57,
    kind: 'foliage',
  },
  { url: '/models/props/ceramic_vase_03.glb', position: [0.55, 0, -2.55], rotation: [0, 0, 0], scale: 2.4, tint: TERRACOTTA, soilCap: { radius: 0.046, y: 0.402 } },
  {
    url: '/models/props/potted_plant_01.glb',
    position: [0.55, 0.31, -2.55],
    seatY: 0.9655,
    rotation: [0, 2.4, 0],
    scale: 1.15,
    clipBelow: 0.57,
    kind: 'foliage',
  },
  {
    url: '/models/props/potted_plant_02.glb',
    position: [0.92, 0, 2.05],
    rotation: [0, 0.9, 0],
    scale: 1,
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

function Prop({ clipBelow, hideMaterials, planter, position, rotation, scale, soilCap, tint, url }) {
  const { scene } = useGLTF(url, DRACO_PATH)
  // The same GLB appears on both sides of the portal; useGLTF caches one
  // scene object, so each Prop renders its own clone.
  const instance = useMemo(() => scene.clone(true), [scene])
  const scaleY = Array.isArray(scale) ? scale[1] : scale
  const positionY = position[1]
  // One stable clipping plane per prop: the materials hold a reference to
  // it and the height effect mutates its constant, so slider ticks never
  // re-clone materials (which leaked clones and program state).
  const clipPlaneRef = useRef(clipBelow === undefined ? null : new Plane(new Vector3(0, 1, 0), 0))

  // Clone each source material once, tint and wire the shared clip plane,
  // then dispose the clones on unmount.
  useEffect(() => {
    const clipPlane = clipPlaneRef.current
    const ownedMaterials = []

    instance.traverse((object) => {
      object.castShadow = true
      object.receiveShadow = true

      if (hideMaterials && object.isMesh && hideMaterials.includes(object.material?.name)) {
        object.visible = false
      }

      if ((tint || clipPlane) && object.isMesh && object.material) {
        object.material = object.material.clone()
        ownedMaterials.push(object.material)

        if (tint) {
          object.material.color.set(tint.color)
          if ('metalness' in object.material) object.material.metalness = tint.metalness ?? object.material.metalness
          if ('roughness' in object.material) object.material.roughness = tint.roughness ?? object.material.roughness
        }

        if (clipPlane) {
          object.material.clippingPlanes = [clipPlane]
        }
      }
    })

    return () => {
      ownedMaterials.forEach((material) => material.dispose())
    }
  }, [hideMaterials, instance, tint])

  // Clipping planes are world-space; keep the cut riding the prop's own
  // transform (scalar deps so it only fires when the height truly moves).
  useEffect(() => {
    const clipPlane = clipPlaneRef.current

    if (!clipPlane || clipBelow === undefined) return

    clipPlane.constant = -(positionY + clipBelow * scaleY)
  }, [clipBelow, positionY, scaleY])

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
        let resolved = prop

        if (prop.kind === 'foliage') {
          const foliageScale = prop.scale * (tuning.dressingFoliageScale ?? 1)
          const foliageScaleY = foliageScale * (tuning.dressingFoliageStretch ?? 1)
          const heightOffset = tuning.dressingFoliageHeight ?? 0

          // A clipped plant is pinned by its trunk base to a fixed vase-rim
          // seat: growing it drops the group origin so the base stays in the
          // vase and only the canopy rises. Unclipped foliage just offsets.
          const posY = prop.clipBelow === undefined
            ? prop.position[1] + heightOffset
            : (prop.seatY ?? prop.position[1]) + heightOffset - prop.clipBelow * foliageScaleY

          resolved = {
            ...prop,
            position: [prop.position[0], posY, prop.position[2]],
            rotation: [0, prop.rotation[1] + (tuning.dressingFoliageTurn ?? 0), 0],
            scale: [foliageScale, foliageScaleY, foliageScale],
          }
        }

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
