import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Color, MathUtils } from 'three'

const CALL_BUTTON_HITBOX_POSITION = [0.22, 1.463, -1.335]
const CALL_BUTTON_HITBOX_ROTATION = [0, Math.PI / 2, 0]
const CALL_BUTTON_GROUP_NAME = 'ElevatorCallingButtons_12_33'
const CALL_BUTTON_TARGET_NAMES = new Set(['Object_58'])
const IDLE_COLOR = new Color('#c8fbff')
const PRESSED_COLOR = new Color('#7dd3fc')
const PANEL_PULSE_SCALE = 0.045

function getMaterials(material) {
  if (!material) return []

  return Array.isArray(material) ? material : [material]
}

function resetCursor() {
  document.body.style.cursor = ''
}

export default function ElevatorCallButton({ active, onPress, scene }) {
  const baselineRef = useRef([])
  const pressedRef = useRef(false)
  const rootRef = useRef(null)
  const rootScaleRef = useRef(null)

  const buttonRoot = useMemo(() => {
    return scene?.getObjectByName(CALL_BUTTON_GROUP_NAME) ?? null
  }, [scene])

  const targets = useMemo(() => {
    if (!buttonRoot) return []

    const meshes = []

    buttonRoot.traverse((child) => {
      if (!child.isMesh) return

      const materials = getMaterials(child.material)

      if (CALL_BUTTON_TARGET_NAMES.has(child.name) || materials.some((material) => material.name === 'Emission')) {
        meshes.push(child)
      }
    })

    return meshes
  }, [buttonRoot])

  useEffect(() => {
    rootRef.current = buttonRoot
    rootScaleRef.current = buttonRoot?.scale.clone() ?? null
    baselineRef.current = targets.flatMap((mesh) =>
      getMaterials(mesh.material).map((material) => ({
        color: material.color?.clone(),
        emissive: material.emissive?.clone(),
        emissiveIntensity: material.emissiveIntensity,
        material,
        mesh,
        scale: mesh.scale.clone(),
      })),
    )
  }, [buttonRoot, targets])

  useEffect(() => {
    resetCursor()
  }, [active])

  useEffect(() => {
    return () => {
      resetCursor()

      if (rootRef.current && rootScaleRef.current) {
        rootRef.current.scale.copy(rootScaleRef.current)
      }

      baselineRef.current.forEach((baseline) => {
        baseline.mesh.scale.copy(baseline.scale)

        if (baseline.color && baseline.material.color) {
          baseline.material.color.copy(baseline.color)
        }

        if (baseline.emissive && baseline.material.emissive) {
          baseline.material.emissive.copy(baseline.emissive)
        }

        if ('emissiveIntensity' in baseline.material) {
          baseline.material.emissiveIntensity = baseline.emissiveIntensity ?? 1
        }
      })
    }
  }, [])

  useFrame(({ clock }) => {
    const pulse = active ? (Math.sin(clock.elapsedTime * 4.6) + 1) / 2 : 0

    if (rootRef.current && rootScaleRef.current) {
      const scale = active ? 1 + pulse * PANEL_PULSE_SCALE : pressedRef.current ? 0.97 : 1

      rootRef.current.scale.copy(rootScaleRef.current).multiplyScalar(scale)
    }

    baselineRef.current.forEach((baseline) => {
      const targetColor = pressedRef.current ? PRESSED_COLOR : IDLE_COLOR

      if (baseline.material.color) {
        const amount = active ? MathUtils.lerp(0.65, 1, pulse) : pressedRef.current ? 0.78 : 0.28

        baseline.material.color.copy(baseline.color ?? targetColor).lerp(targetColor, amount)
      }

      if (baseline.material.emissive) {
        baseline.material.emissive.copy(targetColor)
      }

      if ('emissiveIntensity' in baseline.material) {
        baseline.material.emissiveIntensity = active
          ? MathUtils.lerp(1.6, 5.2, pulse)
          : pressedRef.current
            ? 2.2
            : (baseline.emissiveIntensity ?? 1)
      }

      if ('toneMapped' in baseline.material) {
        baseline.material.toneMapped = false
      }

      baseline.material.needsUpdate = true
    })
  })

  if (!active) return null

  return (
    <mesh
      position={CALL_BUTTON_HITBOX_POSITION}
      rotation={CALL_BUTTON_HITBOX_ROTATION}
      onPointerDown={(event) => {
        event.stopPropagation()
        pressedRef.current = true
        resetCursor()
        onPress()
      }}
      onPointerOut={resetCursor}
      onPointerOver={(event) => {
        event.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
    >
      <planeGeometry args={[0.48, 0.62]} />
      <meshBasicMaterial depthWrite={false} opacity={0} transparent />
    </mesh>
  )
}
