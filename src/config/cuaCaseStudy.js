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
    title: 'Tasks finished on the first try',
    caption: 'Share of pilot tasks each tool completed on its first attempt.',
  },
  {
    file: 'time.svg',
    title: 'Success against time',
    caption: 'Each tool’s success rate plotted against its median time per task.',
  },
  {
    file: 'tokens.svg',
    title: 'Tokens per task',
    caption: 'Model tokens each run used. Where a tool does not report them, the chart says unknown.',
  },
  {
    file: 'disruption.svg',
    title: 'Disruption to the person at the Mac',
    caption: 'Front-app changes, focus changes, pointer moves and window raises per run.',
  },
]
