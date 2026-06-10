import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { BufferGeometry, Color, DoubleSide, Float32BufferAttribute, MathUtils, Vector3 } from 'three'

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  varying vec2 vUv;

  uniform float uAngle;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uProgress;
  uniform float uSoftness;
  uniform float uWidth;

  void main() {
    vec2 direction = normalize(vec2(cos(uAngle), sin(uAngle)));
    vec2 centeredUv = vUv - 0.5;
    float travel = dot(centeredUv, direction);
    float bandCenter = mix(-0.86, 0.86, uProgress);
    float bandDistance = abs(travel - bandCenter);
    float band = 1.0 - smoothstep(uWidth, uWidth + uSoftness, bandDistance);

    float edgeFade =
      smoothstep(0.0, 0.05, vUv.x) *
      smoothstep(0.0, 0.05, vUv.y) *
      smoothstep(0.0, 0.05, 1.0 - vUv.x) *
      smoothstep(0.0, 0.05, 1.0 - vUv.y);

    float haze = band * 0.18 + pow(band, 3.0) * 0.62;
    gl_FragColor = vec4(uColor, haze * uOpacity * edgeFade);
  }
`

function getSequenceProgress({ elapsed, started, timing, tuning }) {
  if (!started) return -1

  const start = timing.turnStart + tuning.mirrorFxDelay
  const duration = Math.max(tuning.mirrorFxSeconds, 0.01)

  return MathUtils.clamp((elapsed - start) / duration, 0, 1)
}

function createGuideGeometry(width, height) {
  const halfWidth = width / 2
  const halfHeight = height / 2
  const zOffset = 0.006
  const vertices = new Float32Array([
    -halfWidth,
    -halfHeight,
    zOffset,
    halfWidth,
    -halfHeight,
    zOffset,
    halfWidth,
    -halfHeight,
    zOffset,
    halfWidth,
    halfHeight,
    zOffset,
    halfWidth,
    halfHeight,
    zOffset,
    -halfWidth,
    halfHeight,
    zOffset,
    -halfWidth,
    halfHeight,
    zOffset,
    -halfWidth,
    -halfHeight,
    zOffset,
    -halfWidth,
    0,
    zOffset,
    halfWidth,
    0,
    zOffset,
    0,
    -halfHeight,
    zOffset,
    0,
    halfHeight,
    zOffset,
  ])
  const geometry = new BufferGeometry()

  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))

  return geometry
}

export default function MirrorShimmerPlane({ elapsedRef, showGuide = false, started, timing, tuning }) {
  const { camera, size } = useThree()
  const groupRef = useRef(null)
  const guideHorizontalRef = useRef(null)
  const guidePolygonRef = useRef(null)
  const guideVerticalRef = useRef(null)
  const materialRef = useRef(null)
  const previewCompleteRunIdRef = useRef(0)
  const previewStartRef = useRef(null)
  const previewRunIdRef = useRef(tuning.mirrorFxPreviewRunId)
  const projectedPointsRef = useRef({
    bottom: new Vector3(),
    bottomLeft: new Vector3(),
    bottomRight: new Vector3(),
    left: new Vector3(),
    right: new Vector3(),
    top: new Vector3(),
    topLeft: new Vector3(),
    topRight: new Vector3(),
  })
  const uniforms = useMemo(
    () => ({
      uAngle: { value: 0 },
      uColor: { value: new Color('#dff7ff') },
      uOpacity: { value: 0 },
      uProgress: { value: 0 },
      uSoftness: { value: 0.12 },
      uWidth: { value: 0.12 },
    }),
    [],
  )
  const guideGeometry = useMemo(
    () => createGuideGeometry(tuning.mirrorFxPlaneWidth, tuning.mirrorFxPlaneHeight),
    [tuning.mirrorFxPlaneHeight, tuning.mirrorFxPlaneWidth],
  )

  useEffect(() => {
    return () => {
      guideGeometry.dispose()
    }
  }, [guideGeometry])

  useEffect(() => {
    if (previewRunIdRef.current === tuning.mirrorFxPreviewRunId) return

    previewRunIdRef.current = tuning.mirrorFxPreviewRunId
    previewStartRef.current = null
  }, [tuning.mirrorFxPreviewRunId])

  useFrame(({ clock }) => {
    const material = materialRef.current

    if (!material) return

    let progress = tuning.mirrorFxProgress
    let opacity = tuning.mirrorFxOpacity

    if (tuning.mirrorFxPreviewRunId > 0 && previewCompleteRunIdRef.current !== tuning.mirrorFxPreviewRunId) {
      previewStartRef.current ??= clock.elapsedTime

      const previewElapsed = clock.elapsedTime - previewStartRef.current
      const previewDuration = Math.max(tuning.mirrorFxSeconds, 0.01)

      if (previewElapsed <= previewDuration) {
        progress = MathUtils.clamp(previewElapsed / previewDuration, 0, 1)
      } else {
        previewCompleteRunIdRef.current = tuning.mirrorFxPreviewRunId
        previewStartRef.current = null
      }
    } else if (!showGuide && tuning.previewMode === 'sequence') {
      progress = getSequenceProgress({
        elapsed: elapsedRef.current,
        started,
        timing,
        tuning,
      })
      opacity = progress < 0 ? 0 : tuning.mirrorFxOpacity
      progress = Math.max(progress, 0)
    }

    material.uniforms.uAngle.value = MathUtils.degToRad(tuning.mirrorFxAngle)
    material.uniforms.uColor.value.set(tuning.mirrorFxColor)
    material.uniforms.uOpacity.value = opacity
    material.uniforms.uProgress.value = progress
    material.uniforms.uSoftness.value = tuning.mirrorFxSoftness
    material.uniforms.uWidth.value = tuning.mirrorFxWidth

    if (showGuide && groupRef.current && guidePolygonRef.current && guideHorizontalRef.current && guideVerticalRef.current) {
      groupRef.current.updateWorldMatrix(true, false)

      const halfWidth = tuning.mirrorFxPlaneWidth / 2
      const halfHeight = tuning.mirrorFxPlaneHeight / 2
      const points = projectedPointsRef.current
      const projectPoint = (vector, x, y) => {
        vector.set(x, y, 0).applyMatrix4(groupRef.current.matrixWorld)
        vector.project(camera)

        return {
          x: (vector.x * 0.5 + 0.5) * size.width,
          y: (-vector.y * 0.5 + 0.5) * size.height,
        }
      }

      const topLeft = projectPoint(points.topLeft, -halfWidth, halfHeight)
      const topRight = projectPoint(points.topRight, halfWidth, halfHeight)
      const bottomRight = projectPoint(points.bottomRight, halfWidth, -halfHeight)
      const bottomLeft = projectPoint(points.bottomLeft, -halfWidth, -halfHeight)
      const left = projectPoint(points.left, -halfWidth, 0)
      const right = projectPoint(points.right, halfWidth, 0)
      const top = projectPoint(points.top, 0, halfHeight)
      const bottom = projectPoint(points.bottom, 0, -halfHeight)

      guidePolygonRef.current.setAttribute(
        'points',
        `${topLeft.x},${topLeft.y} ${topRight.x},${topRight.y} ${bottomRight.x},${bottomRight.y} ${bottomLeft.x},${bottomLeft.y}`,
      )
      guideHorizontalRef.current.setAttribute('x1', left.x)
      guideHorizontalRef.current.setAttribute('y1', left.y)
      guideHorizontalRef.current.setAttribute('x2', right.x)
      guideHorizontalRef.current.setAttribute('y2', right.y)
      guideVerticalRef.current.setAttribute('x1', top.x)
      guideVerticalRef.current.setAttribute('y1', top.y)
      guideVerticalRef.current.setAttribute('x2', bottom.x)
      guideVerticalRef.current.setAttribute('y2', bottom.y)
    }
  })

  return (
    <>
      <group
        ref={groupRef}
        position={[tuning.mirrorFxX, tuning.mirrorFxY, tuning.mirrorFxZ]}
        rotation={[
          MathUtils.degToRad(tuning.mirrorFxRotationX),
          MathUtils.degToRad(tuning.mirrorFxRotationY),
          MathUtils.degToRad(tuning.mirrorFxRotationZ),
        ]}
      >
        <mesh renderOrder={18}>
          <planeGeometry args={[tuning.mirrorFxPlaneWidth, tuning.mirrorFxPlaneHeight]} />
          <shaderMaterial
            ref={materialRef}
            depthTest={false}
            depthWrite={false}
            fragmentShader={fragmentShader}
            side={DoubleSide}
            toneMapped={false}
            transparent
            uniforms={uniforms}
            vertexShader={vertexShader}
          />
        </mesh>
        {showGuide && (
          <>
            <mesh position={[0, 0, 0.004]} renderOrder={19}>
              <planeGeometry args={[tuning.mirrorFxPlaneWidth, tuning.mirrorFxPlaneHeight]} />
              <meshBasicMaterial color="#67e8f9" depthTest={false} opacity={0.08} toneMapped={false} transparent />
            </mesh>
            <lineSegments geometry={guideGeometry} renderOrder={20}>
              <lineBasicMaterial color="#67e8f9" depthTest={false} opacity={0.9} toneMapped={false} transparent />
            </lineSegments>
          </>
        )}
      </group>
      {showGuide && (
        <Html fullscreen style={{ pointerEvents: 'none' }} zIndexRange={[80, 0]}>
          <svg
            aria-hidden="true"
            style={{
              inset: 0,
              pointerEvents: 'none',
              position: 'fixed',
            }}
          >
            <polygon
              ref={guidePolygonRef}
              fill="rgba(103, 232, 249, 0.07)"
              points=""
              stroke="#67e8f9"
              strokeDasharray="8 6"
              strokeWidth="2"
            />
            <line ref={guideHorizontalRef} stroke="rgba(103, 232, 249, 0.72)" strokeWidth="1.5" />
            <line ref={guideVerticalRef} stroke="rgba(103, 232, 249, 0.72)" strokeWidth="1.5" />
          </svg>
        </Html>
      )}
    </>
  )
}
