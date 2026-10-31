// Media for the cua case study (/cua) and its project card.
//
// DEMO is the one place the hero recording is named. To swap in a new cut,
// drop its files into public/media/cua/ and change the paths here; the page
// and the card both read from this object. The captions file describes what
// is on screen at each moment, so it has to be rewritten for every new cut.
export const DEMO = {
  mp4: '/media/cua/demo-v5.mp4',
  webm: '/media/cua/demo-v5.webm',
  poster: '/media/cua/poster-v5.jpg', // first frame shown before playback
  still: '/media/cua/still-v5.jpg', // shown instead of the video under reduced motion
  captions: '/media/cua/demo-v5.vtt',
  stillAlt:
    'The whole Mac screen after the run. TextEdit is still in front with the launch notes draft, the agent card in the corner shows Reminders and Calendar both checked, and the caption reads TextEdit stayed in front, with 0 front-app changes, 0 window raises and 0 pointer moves.',
}

// Benchmark charts. Each slot loads CHART_DIR + file; until that SVG exists
// the slot shows a placeholder, so publishing a chart means adding the file.
export const CHART_DIR = '/media/cua/charts/'

export const CHARTS = [
  {
    file: 'success.svg',
    title: 'Trials finished',
    caption: 'Out of 100 trials across 20 tasks. The latest figure comes after reruns; the note below explains them.',
  },
  {
    file: 'time.svg',
    title: 'Time per trial',
    caption: 'Median agent time. The fixes took cua from almost twice native’s time to within a few seconds of it.',
  },
  {
    file: 'tokens.svg',
    title: 'Tokens per trial',
    caption: 'Median input tokens. Native still uses about half as many as cua.',
  },
  {
    file: 'disruption.svg',
    title: 'Disruption to the person at the Mac',
    caption: 'Share of trials that disturbed the app the person was using. Native’s score comes mostly from raising windows.',
  },
]
