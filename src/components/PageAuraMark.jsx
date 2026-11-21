const SPARKLES = [
  { id: 'p1', x: 415, y: 650, size: 44, rot: -10, drift: 0, dur: 6.6, delay: -0.8, twinkle: 3.8 },
  { id: 'p2', x: 720, y: 735, size: 36, rot: 8, drift: 0, dur: 8.4, delay: -2.6, twinkle: 4.2 },
  { id: 'p3', x: 835, y: 520, size: 58, rot: 14, drift: 18, dur: 7.8, delay: -1.4, twinkle: 3.7 },
  { id: 'f1', x: 460, y: 380, size: 34, rot: 12, drift: 46, dur: 6.8, delay: -3.2, twinkle: 3.9 },
  { id: 'f2', x: 635, y: 300, size: 46, rot: -14, drift: 54, dur: 8.6, delay: -1.9, twinkle: 4.1 },
  { id: 'f3', x: 850, y: 410, size: 28, rot: 4, drift: 38, dur: 7.4, delay: -4.2, twinkle: 3.6 },
]

function sparklePath(radius) {
  const waist = radius * 0.08
  return `M 0 ${-radius} L ${waist} ${-waist} L ${radius} 0 L ${waist} ${waist} L 0 ${radius} L ${-waist} ${waist} L ${-radius} 0 L ${-waist} ${-waist} Z`
}

export default function PageAuraMark() {
  return (
    <span aria-hidden="true" className="pageaura-stage-logo">
      <img alt="" className="pageaura-stage-logo__book" src="/media/projects/pageaura-book.svg" />
      <svg className="pageaura-stage-logo__sparkles" viewBox="188 200 875 946" xmlns="http://www.w3.org/2000/svg">
        <g className="pageaura-stage-logo__layer">
          {SPARKLES.map((sparkle) => (
            <g
              className="pageaura-stage-logo__sparkle"
              key={sparkle.id}
              transform={`translate(${sparkle.x} ${sparkle.y})`}
            >
              <g
                className="pageaura-stage-logo__drift"
                style={{
                  '--sparkle-delay': `${sparkle.delay}s`,
                  '--sparkle-distance': `${sparkle.drift}px`,
                  '--sparkle-duration': `${sparkle.dur}s`,
                }}
              >
                <path
                  className="pageaura-stage-logo__twinkle"
                  d={sparklePath(sparkle.size)}
                  style={{
                    '--twinkle-duration': `${sparkle.twinkle}s`,
                  }}
                  transform={`rotate(${sparkle.rot})`}
                />
              </g>
            </g>
          ))}
        </g>
      </svg>
    </span>
  )
}
