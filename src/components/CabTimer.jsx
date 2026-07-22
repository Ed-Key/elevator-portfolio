import { useEffect, useState } from 'react'
import './CabTimer.css'

const COUNTDOWN_SECONDS = 30
const HOLD_MS = 1000
const FADE_MS = 1500

// Classic seven segment layout in a 22x40 box: a=top, g=middle, d=bottom,
// f/b upper left/right, e/c lower left/right. Hexagonal segment bodies.
const SEGMENT_POINTS = {
  a: '3,3 5,1 17,1 19,3 17,5 5,5',
  b: '19,3 21,5 21,18 19,20 17,18 17,5',
  c: '19,20 21,22 21,35 19,37 17,35 17,22',
  d: '3,37 5,35 17,35 19,37 17,39 5,39',
  e: '3,20 5,22 5,35 3,37 1,35 1,22',
  f: '3,3 5,5 5,18 3,20 1,18 1,5',
  g: '3,20 5,18 17,18 19,20 17,22 5,22',
}

const DIGIT_SEGMENTS = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg']

function Digit({ value }) {
  const lit = DIGIT_SEGMENTS[value]

  return (
    <svg className="cab-timer__digit" viewBox="0 0 22 40">
      {Object.entries(SEGMENT_POINTS).map(([name, points]) => (
        <polygon className={lit.includes(name) ? 'is-lit' : undefined} key={name} points={points} />
      ))}
    </svg>
  )
}

export default function CabTimer() {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS)
  const [fade, setFade] = useState(null)

  useEffect(() => {
    const startedAt = performance.now()
    let frame
    let holdTimeout

    // Timestamp math (not interval accumulation) keeps the display honest:
    // a backgrounded tab skips ahead on return, because real seconds passed.
    // The hold and fade anchor to the same timestamp, so a tab that comes
    // back after the whole timeline snaps to hidden instead of replaying it.
    const tick = (now) => {
      const elapsedMs = now - startedAt
      const left = Math.max(0, COUNTDOWN_SECONDS - Math.floor(elapsedMs / 1000))

      setSecondsLeft(left)

      if (left > 0) {
        frame = requestAnimationFrame(tick)

        return
      }

      const overshootMs = elapsedMs - COUNTDOWN_SECONDS * 1000

      if (overshootMs >= HOLD_MS + FADE_MS) {
        setFade({ mode: 'snap' })

        return
      }

      // The callback rechecks the clock: a tab suspended during the hold can
      // fire this long past the deadline, and then it must snap, not fade.
      // An ease fade gets only the timeline's remaining duration.
      holdTimeout = setTimeout(() => {
        const lateMs = performance.now() - startedAt - COUNTDOWN_SECONDS * 1000

        if (lateMs >= HOLD_MS + FADE_MS) {
          setFade({ mode: 'snap' })
        } else {
          setFade({ mode: 'ease', ms: Math.min(FADE_MS, HOLD_MS + FADE_MS - lateMs) })
        }
      }, Math.max(0, HOLD_MS - overshootMs))
    }

    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(holdTimeout)
    }
  }, [])

  const minutes = Math.floor(secondsLeft / 60)
  const tens = Math.floor((secondsLeft % 60) / 10)
  const ones = secondsLeft % 10

  // Absolutely positioned (see CSS), so it never affects the header's size;
  // it stays mounted after fading to keep the lifecycle a single effect.
  return (
    <span
      aria-hidden="true"
      className={fade ? `cab-timer is-faded${fade.mode === 'snap' ? ' is-snapped' : ''}` : 'cab-timer'}
      style={fade?.mode === 'ease' ? { transitionDuration: `${fade.ms}ms` } : undefined}
    >
      <Digit value={minutes} />
      <svg className="cab-timer__colon" viewBox="0 0 8 40">
        <circle cx="4" cy="13" r="2.4" />
        <circle cx="4" cy="27" r="2.4" />
      </svg>
      <Digit value={tens} />
      <Digit value={ones} />
    </span>
  )
}
