// Rebuilds a project's 3D stage mark from its flat SVG.
//
// Usage (dev server must be running):
//   npm run dev
//   node scripts/build-logo-model.mjs
//   node scripts/build-logo-model.mjs --src /media/projects/pageaura-book.svg \
//                                     --out public/media/projects/pageaura-book.glb
//
// The actual geometry work happens in scripts/build-logo-model.html, driven
// here in a headless browser because SVGLoader and GLTFExporter both need a DOM.
import { chromium } from 'playwright'
import { renameSync, unlinkSync, writeFileSync } from 'node:fs'
import { parseArgs } from 'node:util'

// strict parsing on purpose: a typo like `--scr foo.svg --out pageaura.glb`
// would otherwise fall back to the default source and cheerfully overwrite
// another project's mark with the wrong model.
let values
try {
  ;({ values } = parseArgs({
    options: { base: { type: 'string' }, src: { type: 'string' }, out: { type: 'string' } },
    strict: true,
    allowPositionals: false,
  }))
} catch (error) {
  console.error(error.message)
  process.exit(1)
}

for (const [name, value] of Object.entries(values)) {
  if (value.startsWith('--') || value === '') {
    console.error(`--${name} needs a value`)
    process.exit(1)
  }
}

const BASE = values.base ?? process.env.BASE_URL ?? 'http://localhost:5173'
const SRC = values.src ?? '/media/projects/daily-bread-logo.svg'
const OUT = values.out ?? 'public/media/projects/daily-bread-logo.glb'

const browser = await chromium.launch()
let status = null
let b64 = null
const errors = []

try {
  const page = await browser.newPage()
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

  await page.goto(`${BASE}/scripts/build-logo-model.html?src=${encodeURIComponent(SRC)}`, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => window.__STATUS__ === 'done' || window.__STATUS__ === 'failed',
    null, { timeout: 120000 })

  console.log(await page.evaluate(() => document.getElementById('out').textContent.trim()))
  status = await page.evaluate(() => window.__STATUS__)
  b64 = await page.evaluate(() => window.__GLB__ ?? null)
} catch (error) {
  console.error(error.message)
} finally {
  await browser.close()
}

if (errors.length) console.log('page errors:', errors)

// Never overwrite the target on a partial run: this tool exists to regenerate
// a committed binary, so a bad write is worse than no write.
if (status !== 'done' || !b64) {
  console.error('no GLB produced, leaving', OUT, 'untouched')
  process.exit(1)
}

// Write beside the target and rename, so an interrupted write cannot leave a
// truncated model where a good one was.
const tmp = `${OUT}.tmp`
try {
  writeFileSync(tmp, Buffer.from(b64, 'base64'))
  renameSync(tmp, OUT)
} catch (error) {
  try { unlinkSync(tmp) } catch { /* nothing to clean up */ }
  console.error(`could not write ${OUT}: ${error.message}`)
  process.exit(1)
}
console.log(`wrote ${OUT}`)
