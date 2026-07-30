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
import { writeFileSync } from 'node:fs'

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`)
  if (i === -1) return fallback
  const value = process.argv[i + 1]
  // Without this, `--src --out x.glb` would silently take "--out" as the
  // source, 404, and write an empty model over the target.
  if (value === undefined || value.startsWith('--')) {
    console.error(`--${name} needs a value`)
    process.exit(1)
  }
  return value
}

const BASE = arg('base', process.env.BASE_URL ?? 'http://localhost:5173')
const SRC = arg('src', '/media/projects/daily-bread-logo.svg')
const OUT = arg('out', 'public/media/projects/daily-bread-logo.glb')

const browser = await chromium.launch()
const page = await browser.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })

await page.goto(`${BASE}/scripts/build-logo-model.html?src=${encodeURIComponent(SRC)}`, { waitUntil: 'networkidle' })
await page.waitForFunction(() => {
  const text = document.getElementById('out').textContent
  return text.includes('DONE') || text.includes('FAILED')
}, null, { timeout: 120000 })

const report = await page.evaluate(() => document.getElementById('out').textContent.trim())
console.log(report)
if (errors.length) console.log('page errors:', errors)

const b64 = await page.evaluate(() => window.__GLB__ ?? null)
await browser.close()

// Never overwrite the target on a partial run: this tool exists to regenerate
// a committed binary, so a bad write is worse than no write.
if (report.includes('FAILED') || !b64) {
  console.error('no GLB produced, leaving', OUT, 'untouched')
  process.exit(1)
}
writeFileSync(OUT, Buffer.from(b64, 'base64'))
console.log(`wrote ${OUT}`)
