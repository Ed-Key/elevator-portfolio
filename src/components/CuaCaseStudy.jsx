import { useState } from 'react'
import { CHART_DIR, CHARTS, DEMO } from '../config/cuaCaseStudy'
import LEDGER from '../config/cuaLedger.json'
import { useReducedMotion } from '../hooks/useMediaQuery'
import './CuaCaseStudy.css'

// The cua-driver case study at /cua: hero with the demo, measured results,
// one incident told in full, then every fix in a filterable ledger and the
// benchmark that will measure the fork against native Computer Use.

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
              Play the 25 s demo
            </button>
          </>
        )}
      </div>
      <figcaption className="cua-window__caption" id="demo-caption">
        <span>
          Real recording in a macOS VM. The agent books a meeting in Calendar and adds a reminder while TextEdit stays in front. Waits are cut and the speed is shown on screen. Silent, with captions.
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
                  aria-label={fix.confidence === 'high' ? 'run count recorded' : 'run count not recorded'}
                  className={fix.confidence === 'high' ? 'cua-conf cua-conf--high' : 'cua-conf'}
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
        <span><i aria-hidden="true" className="cua-conf cua-conf--high" />run count recorded</span>
        <span><i aria-hidden="true" className="cua-conf" />run count not recorded</span>
        <span><b className="cua-before">before</b> → <b className="cua-after">after</b></span>
      </div>
    </section>
  )
}

// Loads CHART_DIR + file. A missing file fails to decode as an image (the
// host answers with the HTML page), so the slot falls back to a placeholder.
function ChartSlot({ chart }) {
  const [status, setStatus] = useState('loading')

  return (
    <figure className="cua-chart">
      <div className="cua-chart__frame" data-status={status}>
        {status !== 'missing' ? (
          <img
            alt={chart.title}
            onError={() => setStatus('missing')}
            onLoad={() => setStatus('ready')}
            src={CHART_DIR + chart.file}
          />
        ) : null}
        {status !== 'ready' ? (
          <span aria-hidden="true" className="cua-chart__placeholder">Chart pending</span>
        ) : null}
      </div>
      <figcaption>
        <b>{chart.title}</b>
        {chart.caption}
        {status !== 'ready' ? ' Data is coming from the benchmark pilot.' : null}
      </figcaption>
    </figure>
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
          A frozen benchmark of everyday tasks in native Mac apps and web apps. The first pilot is running now, and these charts fill in as its results land.
        </p>
        <div className="cua-charts">
          {CHARTS.map((chart) => (
            <ChartSlot chart={chart} key={chart.file} />
          ))}
        </div>
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
          <a className="cua-bar__back" href="/">Back to projects</a>
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
                <a className="cua-pill cua-pill--ghost" href="https://github.com/Ed-Key/cua" rel="noreferrer" target="_blank">Code</a>
              </div>
            </div>
            <DemoWindow />
          </section>

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
          <a href="/">Back to projects</a>
          <a href="https://github.com/Ed-Key/cua" rel="noreferrer" target="_blank">Code on GitHub</a>
        </footer>
      </div>
    </div>
  )
}
