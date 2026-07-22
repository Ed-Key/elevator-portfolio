// Sound cues for the elevator ride. All sources are licensed for commercial
// use without attribution:
//   call-tap.mp3     Mixkit "Light switch tap" (Mixkit Free License), trimmed
//   door-slide.mp3   ryanharding95 freesound.org/s/272435 (CC0), the second
//                    slide into the thud, cut for the door close
//   door-open.mp3    ryanharding95 freesound.org/s/272435 (CC0), the full
//                    slide-pause-slide-thud event, sized to the door travel
//   arrival-ding.mp3 collierhs_colinlib freesound.org/s/588718 (CC0)
//   cabin-hum.mp3    Pixabay "Elevator ambience" 30947 (Pixabay License)
// Cues are loudness-matched at the file level; per-cue gains set the mix and
// a master volume (tunable from the Lighting Lab) scales everything. The
// first cue always follows the call-button click, so playback never fights
// the browser's autoplay policy. The hum loops: it enters with the cab and
// stays under the portfolio at a lower level as building tone.

const MUTE_STORAGE_KEY = 'elevator-sound-muted'
export const DEFAULT_MASTER_VOLUME = 0.65
export const HUM_CAB_VOLUME = 0.22
export const HUM_PORTFOLIO_VOLUME = 0.13

const CUES = {
  ding: { gain: 0.8, src: '/media/sfx/arrival-ding.mp3' },
  open: { gain: 0.75, src: '/media/sfx/door-open.mp3' },
  slide: { gain: 0.75, src: '/media/sfx/door-slide.mp3' },
  tap: { gain: 0.9, src: '/media/sfx/call-tap.mp3' },
}

const elements = new Map()
let humElement = null
let humFadeFrame = null
// The level the hum should sit at right now, before master scaling; 0 means
// off. Tracked independently of playback so unmuting can restore the hum
// that a muted ride never started (or that muting paused).
let humTarget = 0
let master = DEFAULT_MASTER_VOLUME
let muted = null

function readMuted() {
  if (muted === null) {
    try {
      muted = window.localStorage.getItem(MUTE_STORAGE_KEY) === 'true'
    } catch {
      muted = false
    }
  }

  return muted
}

function getCueElement(name) {
  if (!elements.has(name)) {
    const audio = new Audio(CUES[name].src)

    audio.preload = 'auto'
    elements.set(name, audio)
  }

  return elements.get(name)
}

export function primeSounds() {
  Object.keys(CUES).forEach(getCueElement)

  if (!humElement) {
    humElement = new Audio('/media/sfx/cabin-hum.mp3')
    humElement.preload = 'auto'
    humElement.loop = true
  }
}

export function setMasterVolume(value) {
  master = Math.min(Math.max(value, 0), 1)

  // Retarget a playing hum immediately so the Lab slider audibly tunes it.
  if (humElement && !humElement.paused) fadeHum(humTarget * master, 0.15)
}

export function playCue(name, gain, matchSeconds) {
  if (readMuted()) return

  const audio = getCueElement(name)

  // matchSeconds pins the cue's length to an animation (the door travel):
  // pitch-preserving rate change, so retuning door timings in the Lab keeps
  // sound and motion in lockstep without re-cutting files. The 0.5-4x clamp
  // is a deliberate guardrail: absurd Lab extremes get a sane cue instead
  // of chipmunk or tape-crawl audio.
  const applyRate = () => {
    audio.playbackRate = Math.min(Math.max(audio.duration / matchSeconds, 0.5), 4)
    audio.preservesPitch = true
  }

  if (matchSeconds > 0 && Number.isFinite(audio.duration) && audio.duration > 0) {
    applyRate()
  } else {
    audio.playbackRate = 1

    // Cold cache: metadata may not have arrived by the first cue. Correct
    // the rate as soon as the duration is known instead of never.
    if (matchSeconds > 0) {
      audio.addEventListener('loadedmetadata', applyRate, { once: true })
    }
  }

  audio.volume = (gain ?? CUES[name].gain) * master
  audio.currentTime = 0
  // NotAllowedError only occurs before any user gesture (lab previews on a
  // fresh page); the ride itself always starts from a click.
  audio.play().catch(() => {})
}

function fadeHum(target, seconds, onDone) {
  if (!humElement) return

  window.cancelAnimationFrame(humFadeFrame)
  const from = humElement.volume
  const startedAt = performance.now()

  const step = (now) => {
    const alpha = Math.min((now - startedAt) / (seconds * 1000), 1)

    humElement.volume = from + (target - from) * alpha

    if (alpha < 1) humFadeFrame = window.requestAnimationFrame(step)
    else onDone?.()
  }

  humFadeFrame = window.requestAnimationFrame(step)
}

function resumeHum(fadeSeconds = 0.9) {
  primeSounds()
  humElement.volume = 0

  if (humElement.paused) {
    humElement.currentTime = 0
    humElement.play().catch(() => {})
  }

  fadeHum(humTarget * master, fadeSeconds)
}

export function startHum(target = HUM_CAB_VOLUME) {
  humTarget = target

  if (readMuted()) return

  resumeHum()
}

export function setHumLevel(target, seconds = 1.2) {
  humTarget = target

  if (readMuted() || !humElement || humElement.paused) return

  fadeHum(target * master, seconds)
}

export function stopHum(seconds = 1.4) {
  humTarget = 0

  if (!humElement || humElement.paused) return

  fadeHum(0, seconds, () => {
    humElement.pause()
  })
}

export function getSoundMuted() {
  return readMuted()
}

export function setSoundMuted(next) {
  muted = next

  if (next) {
    // Silence everything in flight, not just the hum: a door slide runs
    // almost two seconds and must not outlive the mute press.
    elements.forEach((audio) => {
      audio.pause()
      audio.currentTime = 0
    })

    if (humElement && !humElement.paused) {
      fadeHum(0, 0.2, () => humElement.pause())
    }
  } else if (humTarget > 0) {
    // A ride that crossed its hum mark while muted never started the hum;
    // bring it back at whatever level the sequence last asked for.
    resumeHum()
  }

  try {
    window.localStorage.setItem(MUTE_STORAGE_KEY, String(next))
  } catch {
    /* private browsing: preference just lives for the session */
  }
}
