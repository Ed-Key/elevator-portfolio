import { useState } from 'react'
import { BENCHMARK, DEMO } from '../config/cuaCaseStudy'
import LEDGER from '../config/cuaLedger.json'
import { useReducedMotion } from '../hooks/useMediaQuery'
import './CuaCaseStudy.css'

// The cua-driver case study at /cua: hero with the demo, the benchmark against
// native Computer Use, measured fixes, one incident told in full, then every
// fix in a filterable ledger and how the measuring works.

const RESULTS = [
  {
    label: 'Far click',
    before: '2.9 s',
    after: '0.94 s',
    note: 'Median of 6 clicks 1,000 pt away. The cursor glide no longer blocks input.',
  },
  {
    label: 'Long typing',
    before: 'timed out',
    after: '62 s',
    note: '1,344 characters typed exactly once. The daemon had been throttled by launchd.',
  },
  {
    label: 'Wrong app in front',
    before: '96.9 s',
    after: '0 s',
    note: 'Summed over the errand suite: 60 runs before, 22 after matching native focus handling.',
  },
  {
    label: 'Double actions',
    before: '2×',
    after: '1×',
    note: 'Menu commands that arrived late ran twice. Now once, 15 of 15 trials.',
  },
]

const TAP_ROWS = [
  { group: 'My real click · chat opened' },
  { type: 'down', at: '337, 726', no: '15744', stamp: '410 519 273 941 375', ok: true },
  { type: 'up', at: '337, 726', no: '15744', stamp: '410 519 381 973 208', ok: true },
  { group: 'Agent click · hover only' },
  { type: 'down', at: '-1, -1', dimAt: true, no: '1', stamp: '738 005 000' },
  { type: 'up', at: '-1, -1', dimAt: true, no: '2', stamp: '738 005 000' },
  { type: 'down', at: '318, 688', no: '3', stamp: '738 005 000' },
  { type: 'up', at: '318, 688', no: '3', stamp: '738 005 000' },
]

const THEMES = ['Reliability', 'Speed and cost', 'Safety', 'Native parity', 'Picture-in-picture and cursor', 'Observation quality']
const SHORT = { 'Picture-in-picture and cursor': 'PiP and cursor' }
const isMeasured = (fix) => Boolean(fix.before && fix.after)
// The dot says whether the record names how many runs a number rests on.
const hasRunCount = (fix) => fix.sample.trim() !== ''

function Eyebrow({ lead, children }) {
  return (
    <div className="cua-eyebrow">
      <b>{lead}</b>
      <i aria-hidden="true" />
      {children}
    </div>
  )
}

// Under reduced motion the hero shows a still, and the video only plays if
// the visitor asks for it (then with controls and no autoplay).
function DemoWindow() {
  const reducedMotion = useReducedMotion()
  const [requested, setRequested] = useState(false)
  const showVideo = !reducedMotion || requested

  return (
    <figure className="cua-window" id="demo">
      <div aria-hidden="true" className="cua-window__chrome">
        <i /><i /><i />
        <span>agent working behind your apps</span>
      </div>
      <div className="cua-window__stage">
        {showVideo ? (
          <video
            aria-describedby="demo-caption"
            autoPlay={!reducedMotion}
            controls
            loop={!reducedMotion}
            muted
            playsInline
            poster={DEMO.poster}
            preload="metadata"
          >
            <source src={DEMO.webm} type="video/webm" />
            <source src={DEMO.mp4} type="video/mp4" />
            <track kind="captions" label="English" src={DEMO.captions} srcLang="en" />
          </video>
        ) : (
          <>
            <img alt={DEMO.stillAlt} src={DEMO.still} />
            <button className="cua-window__play" onClick={() => setRequested(true)} type="button">
              Play the 45 s demo
            </button>
          </>
        )}
      </div>
      <figcaption className="cua-window__caption" id="demo-caption">
        <span>
          Real recordings in macOS VMs, each screen recorded separately. Claude Code and Codex finish tasks behind TextEdit while someone keeps typing in it. Speed changes are shown on screen. Silent, with captions.
        </span>
      </figcaption>
    </figure>
  )
}

function Ledger() {
  const [theme, setTheme] = useState('All')
  const [measuredOnly, setMeasuredOnly] = useState(true)

  const pool = measuredOnly ? LEDGER.filter(isMeasured) : LEDGER
  const rows = pool
    .filter((fix) => theme === 'All' || fix.theme === theme)
    .sort((a, b) => b.headline_score - a.headline_score || b.date.localeCompare(a.date))
  const tally = [
    [LEDGER.length, 'fixes merged'],
    [LEDGER.filter(isMeasured).length, 'with before and after'],
    [THEMES.length, 'themes'],
  ]

  return (
    <section aria-labelledby="ledger-title" className="cua-ledger">
      <div className="cua-ledger__head">
        <div>
          <Eyebrow lead="Ledger">Every fix, with its evidence</Eyebrow>
          <h2 id="ledger-title">Eighty-six fixes from a month of daily use</h2>
        </div>
        <p>
          Each change started as something that broke while I used the fork. Where a number is shown, it comes from runs in throwaway macOS VMs, using real Mac apps and test apps with files I set up, old build against new. A filled dot means the record says how many runs the number rests on. A hollow dot means it does not, so treat that number as weaker.
        </p>
      </div>

      <dl className="cua-tally">
        {tally.map(([value, label]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <div className="cua-filters">
        <div aria-label="Filter by theme" className="cua-filters__chips" role="group">
          {['All', ...THEMES].map((name) => {
            const count = name === 'All' ? pool.length : pool.filter((fix) => fix.theme === name).length
            return (
              <button
                aria-pressed={theme === name}
                className="cua-chip"
                key={name}
                onClick={() => setTheme(name)}
                type="button"
              >
                {SHORT[name] ?? name}
                <span className="cua-chip__count">{count}</span>
              </button>
            )
          })}
        </div>
        <label className="cua-toggle">
          <input checked={measuredOnly} onChange={(event) => setMeasuredOnly(event.target.checked)} type="checkbox" />
          Measured only
        </label>
      </div>

      <p aria-live="polite" className="cua-visually-hidden">
        Showing {rows.length} fixes
      </p>

      <ul className="cua-rows">
        {rows.map((fix) => (
          <li key={fix.id}>
            <details className="cua-row">
              <summary>
                <span className="cua-row__date">{fix.date}</span>
                <span className="cua-row__title">
                  {fix.title}
                  <span className="cua-row__theme">{SHORT[fix.theme] ?? fix.theme}</span>
                </span>
                <span className="cua-row__ba">
                  {isMeasured(fix) ? (
                    <>
                      <span className="cua-before">{fix.before}</span>
                      <span aria-hidden="true" className="cua-row__arrow">→</span>
                      <span className="cua-visually-hidden"> to </span>
                      <span className="cua-after">{fix.after}</span>
                    </>
                  ) : (
                    <span className="cua-row__none">not measured</span>
                  )}
                </span>
                <i
                  aria-label={hasRunCount(fix) ? 'run count recorded' : 'run count not recorded'}
                  className={hasRunCount(fix) ? 'cua-dot cua-dot--recorded' : 'cua-dot'}
                  role="img"
                />
              </summary>
              <div className="cua-row__more">
                <p><b>Problem</b>{fix.problem}</p>
                <p><b>Change</b>{fix.change}</p>
                {fix.sample ? <p className="cua-row__sample">Sample: {fix.sample}</p> : null}
              </div>
            </details>
          </li>
        ))}
      </ul>

      <div className="cua-legend">
        <span><i aria-hidden="true" className="cua-dot cua-dot--recorded" />run count recorded</span>
        <span><i aria-hidden="true" className="cua-dot" />run count not recorded</span>
        <span><b className="cua-before">before</b> → <b className="cua-after">after</b></span>
      </div>
    </section>
  )
}

// Disruption against time, with lower left better: native's point, then cua's
// builds joined in order. Whiskers are the 95% ranges.
const PLOT = { left: 62, right: 622, top: 22, bottom: 372, minTime: 20, maxTime: 90 }
const plotX = (time) => PLOT.left + ((time - PLOT.minTime) / (PLOT.maxTime - PLOT.minTime)) * (PLOT.right - PLOT.left)
const plotY = (percent) => PLOT.bottom - (percent / 100) * (PLOT.bottom - PLOT.top)
const LABELS = {
  'Native Computer Use': { dx: 14, dy: -10, anchor: 'start' },
  'First build': { dx: 14, dy: -10, anchor: 'start' },
  'After fixes': { dx: 16, dy: 6, anchor: 'start' },
  Latest: { dx: -14, dy: 6, anchor: 'end' },
}

function TradeOffChart() {
  const cua = BENCHMARK.points.filter((point) => !point.native)
  const summary = BENCHMARK.points.map((p) => `${p.name}: ${p.disruption}% disruption, ${p.time} seconds`).join('; ')
  return (
    <svg aria-label={`Disruption against median time, lower left is better. ${summary}.`} className="cua-plot" role="img" viewBox="0 0 640 430">
      {[0, 25, 50, 75, 100].map((percent) => (
        <g key={percent}>
          <line className="cua-plot__grid" x1={PLOT.left} x2={PLOT.right} y1={plotY(percent)} y2={plotY(percent)} />
          <text className="cua-plot__tick" textAnchor="end" x={PLOT.left - 10} y={plotY(percent) + 5}>{percent}%</text>
        </g>
      ))}
      {[20, 40, 60, 80].map((time) => (
        <text className="cua-plot__tick" key={time} textAnchor="middle" x={plotX(time)} y={PLOT.bottom + 26}>{time} s</text>
      ))}
      <text className="cua-plot__axis" textAnchor="middle" x={(PLOT.left + PLOT.right) / 2} y={PLOT.bottom + 54}>Median time per trial</text>
      <text className="cua-plot__axis" textAnchor="middle" transform={`rotate(-90 15 ${(PLOT.top + PLOT.bottom) / 2})`} x="15" y={(PLOT.top + PLOT.bottom) / 2}>Trials that disturbed the person</text>
      <text className="cua-plot__better" x={PLOT.left + 14} y={PLOT.bottom - 14}>← Better: faster, less disruption</text>
      <polyline className="cua-plot__path" points={cua.map((p) => `${plotX(p.time)},${plotY(p.disruption)}`).join(' ')} />
      {BENCHMARK.points.map((p) => {
        const x = plotX(p.time)
        const y = plotY(p.disruption)
        const label = LABELS[p.name]
        return (
          <g className={p.native ? 'cua-plot__point cua-plot__point--native' : 'cua-plot__point'} data-latest={p.name === 'Latest' || undefined} key={p.name}>
            <line x1={plotX(p.timeRange[0])} x2={plotX(p.timeRange[1])} y1={y} y2={y} />
            <line x1={x} x2={x} y1={plotY(p.disruptionRange[0])} y2={plotY(p.disruptionRange[1])} />
            <circle cx={x} cy={y} r="7" />
            <text textAnchor={label.anchor} x={x + label.dx} y={y + label.dy}>{p.name}</text>
          </g>
        )
      })}
    </svg>
  )
}

function Benchmark() {
  return (
    <section aria-labelledby="benchmark-title" className="cua-bench">
      <Eyebrow lead="Benchmark">Against OpenAI’s Computer Use</Eyebrow>
      <h2 id="benchmark-title">The same agent disturbs you a third as often</h2>

      <div className="cua-bench__lead">
        <TradeOffChart />
        <div className="cua-bench__read">
          <p>
            <b>25%</b> of cua’s trials disturbed the person at the Mac, against <b>79%</b> for OpenAI’s native tool, at nearly the same speed.
          </p>
          <p>
            20 everyday tasks, ten in Mac apps and ten in web apps, five seeds each. Every trial ran the same Codex agent in a fresh VM, and only the computer-use tool changed.
          </p>
          <p>
            Native still wins on speed, tokens and cost. Whiskers show 95% ranges, and with 20 tasks they are wide. These runs are mine, on a frozen VM, and nobody has reproduced them yet.
          </p>
        </div>
      </div>

      <div aria-label="Benchmark results by tool" className="cua-table" role="region" tabIndex={0}>
        <table>
          <thead>
            <tr>
              <td />
              {BENCHMARK.columns.map((column, i) => <th data-latest={i === 3 || undefined} key={column} scope="col">{column}</th>)}
            </tr>
          </thead>
          <tbody>
            {BENCHMARK.rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}{row.note && <sup>{row.note}</sup>}</th>
                {row.values.map((value, i) => (
                  <td data-best={row.best.includes(i) || undefined} data-latest={i === 3 || undefined} key={BENCHMARK.columns[i]}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ol className="cua-bench__notes">
        <li>
          The latest 100 needed reruns. The first pass ran on a badly overloaded Mac, and 25 trials failed before the agent started. Retrying those gave 95 of 100, 34% disruption and a 58 s median. The 46 trials that had started under heavy load were then rerun on a quiet machine. I chose that cutoff after seeing the results, and one real timeout and one wrong result fell above it. Native’s figures are from the pilot, also on a quiet machine.
        </li>
        <li>
          A later controlled test with looping builds on the host slowed both tools and broke VM startup in 5 of 24 trials, but it did not make cua more disruptive, so the first pass’s jump in disruption remains unexplained.
        </li>
        <li>What the same tokens would cost at OpenAI’s API rates, divided by trials finished.</li>
      </ol>
    </section>
  )
}

function Measure() {
  return (
    <section aria-labelledby="measure-title" className="cua-measure">
      <div className="cua-measure__head">
        <div>
          <Eyebrow lead="Method">How I measure it</Eyebrow>
          <h2 id="measure-title">Same model, same tasks, only the tool changes</h2>
        </div>
        <p>
          Every comparison is a pair of runs on the same model, prompt and task, once with my fork and once with OpenAI’s bundled Computer Use. The fork’s build is frozen before the first scored run, so a result describes one exact build. The checkers that grade each run sit outside the VM, out of the agent’s reach. Disruption is measured against the user’s app: a passive recorder logs every time the agent changes the front app, takes focus, moves the real pointer or raises a window.
        </p>
      </div>

      <div className="cua-measure__part">
        <h3>Everyday work</h3>
        <p>
          The frozen benchmark at the top of this page. Each build is installed into the same frozen VM image, so the numbers compare like with like.
        </p>
      </div>

      <div className="cua-measure__part">
        <h3>Under temptation</h3>
        <p>
          A safety track is planned: tasks that tempt an agent toward a harmful action, scored on whether it stops and asks first. Results will appear here once it runs.
        </p>
      </div>
    </section>
  )
}

export default function CuaCaseStudy() {
  return (
    <div className="cua-page">
      <div className="cua-wrap">
        <nav aria-label="Site" className="cua-bar">
          <a className="cua-bar__name" href="/">Edward Kiboma</a>
          <a className="cua-bar__back" href="/#projects">Back to projects</a>
        </nav>

        <main>
          <section className="cua-hero">
            <div>
              <Eyebrow lead="05">Case study</Eyebrow>
              <h1>
                Teaching an AI agent to use a Mac <em>without taking it over</em>
              </h1>
              <p className="cua-lede">
                A personal fork of cua-driver, the open-source tool that lets AI agents click, type and read real Mac apps. I made it work in the background while you keep using your computer, measured it against <i>OpenAI’s Codex Computer Use</i>, and fixed what broke in daily use.
              </p>
              <dl className="cua-meta">
                <div><dt>Role</dt><dd>Solo, fork owner</dd></div>
                <div><dt>Stack</dt><dd>Rust · AppKit · MCP</dd></div>
                <div><dt>When</dt><dd>Sep to Oct 2026</dd></div>
              </dl>
              <div className="cua-actions">
                <a className="cua-pill cua-pill--solid" href="#demo">Watch the demo</a>
                <a className="cua-pill cua-pill--ghost" href="https://github.com/Ed-Key/cua/tree/ed/main" rel="noreferrer" target="_blank">Code</a>
              </div>
            </div>
            <DemoWindow />
          </section>

          <Benchmark />

          <section aria-labelledby="results-title" className="cua-results">
            <h2 className="cua-visually-hidden" id="results-title">Measured results</h2>
            {RESULTS.map((result) => (
              <div className="cua-result" key={result.label}>
                <h3 className="cua-result__label">{result.label}</h3>
                <p className="cua-result__value">
                  <s><span className="cua-visually-hidden">from </span>{result.before}</s>
                  <span className="cua-visually-hidden"> to </span>
                  {result.after}
                </p>
                <p className="cua-result__note">{result.note}</p>
              </div>
            ))}
          </section>

          <section aria-labelledby="incident-title" className="cua-chapter">
            <div>
              <Eyebrow lead="Incident">Clicks that looked days old</Eyebrow>
              <h2 id="incident-title">Hover worked, but clicks vanished. The events were stamped from the past.</h2>
              <p>
                On my Mac, the agent could hover over a ChatGPT sidebar row but never open it. The same click worked in a fresh VM. I put a listen-only event tap on the app and compared my own click with the agent’s, field by field.
              </p>
              <p>
                <strong>Every agent event carried a timestamp of 0.738 s after boot.</strong> My Mac had been up for 4.75 days, so to Chromium the clicks looked days old and were discarded. A freshly booted VM hid the bug.
              </p>
              <ol className="cua-steps">
                <li><b>Found</b>Real use: a chat would not open from the sidebar.</li>
                <li><b>Cause</b>A field meant for click grouping was written into the event’s timestamp.</li>
                <li><b>Fix</b>Stamp every injected event with the current uptime at post time.</li>
                <li><b>Guard</b>A test that fails if any posted event is more than 1 s old.</li>
              </ol>
            </div>

            <div className="cua-evidence">
              <header>
                <b>Event tap on ChatGPT</b>
                <span>listen-only · one click each</span>
              </header>
              <div className="cua-evidence__scroll" role="region" aria-label="Event tap table" tabIndex={0}>
                <table>
                  <caption className="cua-visually-hidden">
                    Mouse events seen by a listen-only tap on ChatGPT, for one real click and one agent click
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Type</th>
                      <th scope="col">Location</th>
                      <th scope="col">Event no.</th>
                      <th scope="col">Timestamp (ns since boot)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TAP_ROWS.map((row, index) =>
                      row.group ? (
                        <tr className="cua-evidence__group" key={row.group}>
                          <th colSpan={4} scope="colgroup">{row.group}</th>
                        </tr>
                      ) : (
                        <tr key={index}>
                          <td>{row.type}</td>
                          <td className={row.dimAt ? 'cua-dim' : undefined}>{row.at}</td>
                          <td>{row.no}</td>
                          <td className={row.ok ? 'cua-after' : 'cua-before'}>{row.stamp}</td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
              <p className="cua-evidence__verdict">
                <strong>After the fix:</strong> agent events land 1 to 5 ms old, and the same sidebar click opens the chat from the background.
              </p>
            </div>
          </section>

          <Ledger />
          <Measure />
        </main>

        <footer className="cua-footer">
          <a href="/#projects">Back to projects</a>
          <a href="https://github.com/Ed-Key/cua/tree/ed/main" rel="noreferrer" target="_blank">Code on GitHub</a>
        </footer>
      </div>
    </div>
  )
}
