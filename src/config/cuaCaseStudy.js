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

// Benchmark results, from cua-bench report/pilot/summary.json,
// report/final/pilot/summary.json and report/rerun2/compare-*.md. Native is the
// pilot; cua's latest build is b29cb9fd9. Ranges are 95% bootstrap intervals over
// whole tasks. Cost is API-equivalent per success (report/rerun2/FINDINGS.md).
export const BENCHMARK = {
  points: [
    { name: 'Native Computer Use', time: 37.4, timeRange: [30.4, 47.5], disruption: 79, disruptionRange: [60, 93], native: true },
    { name: 'First build', time: 67.8, timeRange: [52.0, 86.7], disruption: 46, disruptionRange: [28, 65] },
    { name: 'After fixes', time: 42.6, timeRange: [39.1, 48.9], disruption: 27, disruptionRange: [11, 44] },
    { name: 'Latest', time: 40.7, timeRange: [35.9, 47.0], disruption: 25, disruptionRange: [11, 41] },
  ],
  columns: ['Native', 'cua, first build', 'cua, after fixes', 'cua, latest'],
  // best is the column index of the best value in the row, or several on a tie
  rows: [
    { label: 'Trials finished', note: 1, values: ['96 of 100', '97 of 100', '99 of 100', '100 of 100'], best: [3] },
    { label: 'Any disruption', note: 2, values: ['79%', '46%', '27%', '25%'], best: [3] },
    { label: 'Window raised', values: ['79%', '40%', '22%', '19%'], best: [3] },
    { label: 'Front app taken', values: ['21%', '46%', '22%', '23%'], best: [0] },
    { label: 'Pointer moved', values: ['0%', '25%', '12%', '14%'], best: [0] },
    { label: 'Median time', values: ['37.4 s', '67.8 s', '42.6 s', '40.7 s'], best: [0] },
    { label: 'Median input tokens', values: ['131k', '297k', '265k', '246k'], best: [0] },
    { label: 'Cost per success', note: 3, values: ['$0.077', '$0.140', '$0.111', '$0.113'], best: [0] },
  ],
}
