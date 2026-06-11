import { useEffect, useRef } from 'react'
import { Color, Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, SRGBColorSpace, WebGLRenderer } from 'three'

// Void + golden ambient, ported from PageAura's mood renderer: a fullscreen
// quad where two soft golden blobs drift over a near-black background. The
// blob centers move on stacked sine waves at irrational frequency ratios so
// the motion never visibly repeats; film grain hides gradient banding.
const VOID_BACKGROUND = '#1a1820'
const GOLDEN_BLOB_1 = '#f0c870'
const GOLDEN_BLOB_2 = '#d8a860'
const BLOB_STRENGTH = 0.55
const BLOB_RADIUS = 0.65
const SECONDARY_RADIUS_RATIO = 0.78

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragmentShader = `
  varying vec2 vUv;

  uniform vec3 uBackgroundColor;
  uniform vec3 uBlob1Color;
  uniform vec3 uBlob2Color;
  uniform float uBlobRadius;
  uniform float uBlobRadiusSecondary;
  uniform float uBlobStrength;
  uniform float uNoiseStrength;
  uniform float uTime;

  float random(vec2 coord) {
    return fract(sin(dot(coord, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    vec3 color = uBackgroundColor;

    float animTime = uTime * 0.00028;
    vec2 blob1Center = vec2(
      0.50 + sin(animTime * 1.000) * 0.13 + sin(animTime * 1.618) * 0.05,
      0.48 + cos(animTime * 0.794) * 0.09 + cos(animTime * 1.272) * 0.03
    );
    vec2 blob2Center = vec2(
      0.35 + cos(animTime * 0.927) * 0.11 + cos(animTime * 1.414) * 0.04,
      0.55 + sin(animTime * 1.175) * 0.07 + sin(animTime * 0.618) * 0.03
    );

    float blob1 = smoothstep(uBlobRadius, 0.0, distance(vUv, blob1Center));
    float blob2 = smoothstep(uBlobRadiusSecondary, 0.0, distance(vUv, blob2Center));

    vec3 blob1SoftColor = mix(uBlob1Color, uBackgroundColor, 0.35);
    vec3 blob2SoftColor = mix(uBlob2Color, uBackgroundColor, 0.35);
    color = mix(color, blob1SoftColor, blob1 * uBlobStrength);
    color = mix(color, blob2SoftColor, blob2 * uBlobStrength);

    float grain = random(vUv * vec2(1387.13, 947.91)) - 0.5;
    color += grain * uNoiseStrength;
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
  }
`

export default function PortfolioBackdrop({ reducedMotion }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const renderer = new WebGLRenderer({ antialias: true, canvas })

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = SRGBColorSpace

    const scene = new Scene()
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const material = new ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      fragmentShader,
      uniforms: {
        uBackgroundColor: { value: new Color(VOID_BACKGROUND) },
        uBlob1Color: { value: new Color(GOLDEN_BLOB_1) },
        uBlob2Color: { value: new Color(GOLDEN_BLOB_2) },
        uBlobRadius: { value: BLOB_RADIUS },
        uBlobRadiusSecondary: { value: BLOB_RADIUS * SECONDARY_RADIUS_RATIO },
        uBlobStrength: { value: BLOB_STRENGTH },
        uNoiseStrength: { value: 0.04 },
        uTime: { value: 0 },
      },
      vertexShader,
    })
    const mesh = new Mesh(new PlaneGeometry(2, 2), material)

    scene.add(mesh)

    const renderFrame = (time) => {
      material.uniforms.uTime.value = time
      renderer.render(scene, camera)
    }

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight, false)
      if (reducedMotion) renderFrame(0)
    }

    resize()
    window.addEventListener('resize', resize)

    let frameId

    if (reducedMotion) {
      renderFrame(0)
    } else {
      const loop = (time) => {
        renderFrame(time)
        frameId = window.requestAnimationFrame(loop)
      }

      frameId = window.requestAnimationFrame(loop)
    }

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      mesh.geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [reducedMotion])

  return <canvas aria-hidden="true" className="portfolio-modal__backdrop" ref={canvasRef} />
}
