// Sound cues for the elevator ride. All sources are licensed for commercial
// use without attribution:
//   call-tap.mp3     Mixkit "Light switch tap" (Mixkit Free License), trimmed
//   door-slide.mp3   AlexanderChe freesound.org/s/363242 (CC0), trimmed slide
//   arrival-ding.mp3 collierhs_colinlib freesound.org/s/588718 (CC0)
//   cabin-hum.mp3    Pixabay "Elevator ambience" 30947 (Pixabay License)
// Cues are loudness-matched at the file level; per-cue gains below only set
// the mix. The first cue always follows the call-button click, so playback
// never fights the browser's autoplay policy.

const MUTE_STORAGE_KEY = 'elevator-sound-muted'
const HUM_VOLUME = 0.22

const CUES = {
  ding: { gain: 0.8, src: '/media/sfx/arrival-ding.mp3' },
  slide: { gain: 0.75, src: '/media/sfx/door-slide.mp3' },
  tap: { gain: 0.9, src: '/media/sfx/call-tap.mp3' },
}

const elements = new Map()
let humElement = null
let humFadeFrame = null
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
  }
}

export function playCue(name) {
  if (readMuted()) return

  const audio = getCueElement(name)

  audio.volume = CUES[name].gain
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

export function startHum() {
  if (readMuted()) return

  primeSounds()
  humElement.volume = 0
  humElement.currentTime = 0
  humElement.play().catch(() => {})
  fadeHum(HUM_VOLUME, 0.9)
}

export function stopHum(seconds = 1.4) {
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

  if (next) stopHum(0.2)

  try {
    window.localStorage.setItem(MUTE_STORAGE_KEY, String(next))
  } catch {
    /* private browsing: preference just lives for the session */
  }
}
