// The cheap architectural details that make the hall read as a built room:
// a baseboard seam where wall meets floor and a bronze threshold under the
// doors. All code geometry. (A framed Tufts print lived here briefly; Ed
// deferred it for a later polish round.)

const WALL_FACE_X = 0.18
const BRONZE = { color: '#4a3a2a', metalness: 0.85, roughness: 0.35 }
const BASEBOARD = { color: '#241b12', metalness: 0.1, roughness: 0.6 }

function Baseboard() {
  // Two runs flanking the door pillars (pillars end near z ±1.72).
  return (
    <group>
      <mesh castShadow position={[WALL_FACE_X + 0.015, 0.06, 4.62]}>
        <boxGeometry args={[0.03, 0.12, 5.76]} />
        <meshStandardMaterial {...BASEBOARD} />
      </mesh>
      <mesh castShadow position={[WALL_FACE_X + 0.015, 0.06, -4.62]}>
        <boxGeometry args={[0.03, 0.12, 5.76]} />
        <meshStandardMaterial {...BASEBOARD} />
      </mesh>
    </group>
  )
}

function Threshold() {
  return (
    <mesh position={[0.22, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.28, 3.44]} />
      <meshStandardMaterial {...BRONZE} roughness={0.45} />
    </mesh>
  )
}

export default function HallArchitecture({ visible }) {
  if (!visible) return null

  return (
    <group>
      <Baseboard />
      <Threshold />
    </group>
  )
}
