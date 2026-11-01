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

// Benchmark results, from cua-bench report/pilot/summary.json and
// report/final/pilot/summary.json. Native is the pilot; cua's latest build is
// b29cb9fd9. Cost is API-equivalent per success (report/rerun2/FINDINGS.md).
export const BENCHMARK = {
  stats: [
    { label: 'Disturbed the person', cua: '25%', native: '79%', lead: true },
    { label: 'Trials finished', cua: '100 of 100', native: '96 of 100' },
    { label: 'Median time', cua: '40.7 s', native: '37.4 s' },
    { label: 'Cost per success', cua: '$0.113', native: '$0.077' },
  ],
  arms: ['Native', 'First build', 'After fixes', 'Latest'],
  disruption: [
    { label: 'Any disruption', values: [79, 46, 27, 25] },
    { label: 'Window raised', values: [79, 40, 22, 19] },
    { label: 'Front app taken', values: [21, 46, 22, 23] },
    { label: 'Pointer moved', values: [0, 25, 12, 14] },
  ],
  columns: ['Finished', 'Disturbed', 'Median time', 'Input tokens', 'Cost per success'],
  rows: [
    { tool: 'Native Computer Use', values: ['96 of 100', '79%', '37.4 s', '131k', '$0.077'] },
    { tool: 'cua, first build', values: ['97 of 100', '46%', '67.8 s', '297k', '$0.140'] },
    { tool: 'cua, after fixes', values: ['99 of 100', '27%', '42.6 s', '265k', '$0.111'] },
    { tool: 'cua, latest', values: ['100 of 100', '25%', '40.7 s', '246k', '$0.113'], latest: true },
  ],
}
