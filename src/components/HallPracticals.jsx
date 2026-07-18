import { useEffect, useRef } from 'react'

// Fixture recipe from the lighting research: a practical is emissive
// aperture geometry that looks bright plus hidden spotlights that do the
// lighting, and every pool's hot spot sits on its fixture's beam axis.
// Bodies are bronze primitives matched to the call plate; apertures sit
// above the bloom threshold so they glow the way the plate does.

const WALL_FACE_X = 0.18

function AnchoredSpot({ angle = 0.62, color, decay = 2, distance = 7, intensity, penumbra = 0.85, position, target }) {
  const lightRef = useRef()

  useEffect(() => {
    const light = lightRef.current

    if (!light) return

    light.target.position.set(...target)
    light.parent?.add(light.target)
    light.target.updateMatrixWorld()

    return () => {
      light.target.parent?.remove(light.target)
    }
  }, [target])

  return (
    <spotLight
      ref={lightRef}
      angle={angle}
      color={color}
      decay={decay}
      distance={distance}
      intensity={intensity}
      penumbra={penumbra}
      position={position}
    />
  )
}

function Aperture({ color }) {
  return <meshStandardMaterial color="#000000" emissive={color} emissiveIntensity={3.2} toneMapped={false} />
}

function CylinderSconce({ angle, color, height, intensity, z }) {
  const x = WALL_FACE_X + 0.08

  return (
    <group position={[x, height, z]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.052, 0.052, 0.32, 24]} />
        <meshStandardMaterial color="#4a3a2a" metalness={0.85} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.165, 0]}>
        <cylinderGeometry args={[0.044, 0.044, 0.012, 24]} />
        <Aperture color={color} />
      </mesh>
      <mesh position={[0, -0.165, 0]}>
        <cylinderGeometry args={[0.044, 0.044, 0.012, 24]} />
        <Aperture color={color} />
      </mesh>
      <mesh position={[-0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.06, 12]} />
        <meshStandardMaterial color="#4a3a2a" metalness={0.85} roughness={0.35} />
      </mesh>
      {/* Beams originate at the emissive caps and hug the wall, so each
          pool's apex touches the aperture that claims to produce it. */}
      <AnchoredSpot angle={angle} color={color} intensity={intensity} position={[0.015, 0.17, 0]} target={[WALL_FACE_X, height + 1.7, z]} />
      <AnchoredSpot angle={angle} color={color} intensity={intensity * 0.8} position={[0.015, -0.17, 0]} target={[WALL_FACE_X, 0.05, z]} />
    </group>
  )
}

function BandSconce({ angle, color, height, intensity, z }) {
  const x = WALL_FACE_X + 0.035

  return (
    <group position={[x, height, z]}>
      <mesh castShadow>
        <boxGeometry args={[0.05, 0.42, 0.16]} />
        <meshStandardMaterial color="#4a3a2a" metalness={0.85} roughness={0.35} />
      </mesh>
      <mesh position={[0.004, 0, 0]}>
        <boxGeometry args={[0.05, 0.1, 0.14]} />
        <Aperture color={color} />
      </mesh>
      <AnchoredSpot angle={angle} color={color} intensity={intensity} position={[0.03, 0.22, 0]} target={[WALL_FACE_X, height + 1.7, z]} />
      <AnchoredSpot angle={angle} color={color} intensity={intensity * 0.8} position={[0.03, -0.22, 0]} target={[WALL_FACE_X, 0.05, z]} />
    </group>
  )
}

function PortalSlot({ color, intensity, z }) {
  const x = WALL_FACE_X + 0.02
  const centerY = 2.05

  return (
    <group position={[x, centerY, z]}>
      <mesh castShadow>
        <boxGeometry args={[0.045, 2.3, 0.07]} />
        <meshStandardMaterial color="#4a3a2a" metalness={0.85} roughness={0.35} />
      </mesh>
      <mesh position={[0.004, 0, z > 0 ? -0.018 : 0.018]}>
        <boxGeometry args={[0.045, 2.2, 0.024]} />
        <Aperture color={color} />
      </mesh>
      <AnchoredSpot
        angle={0.5}
        color={color}
        intensity={intensity * 0.7}
        position={[0.1, 0.9, 0]}
        target={[WALL_FACE_X, centerY + 2.2, z]}
      />
      <AnchoredSpot
        angle={0.5}
        color={color}
        intensity={intensity * 0.55}
        position={[0.1, -0.9, 0]}
        target={[WALL_FACE_X, 0, z]}
      />
    </group>
  )
}

export default function HallPracticals({ tuning }) {
  const angle = tuning.practicalAngle
  const color = tuning.practicalColor
  const height = tuning.practicalHeight
  const intensity = tuning.practicalIntensity
  const style = tuning.practicalStyle

  if (!style || style === 'off' || intensity <= 0) return null

  if (style === 'slots') {
    return (
      <group>
        <PortalSlot color={color} intensity={intensity} z={1.95} />
        <PortalSlot color={color} intensity={intensity} z={-1.95} />
      </group>
    )
  }

  const Sconce = style === 'band' ? BandSconce : CylinderSconce

  return (
    <group>
      <Sconce angle={angle} color={color} height={height} intensity={intensity} z={2.45} />
      <Sconce angle={angle} color={color} height={height} intensity={intensity} z={-2.45} />
    </group>
  )
}
