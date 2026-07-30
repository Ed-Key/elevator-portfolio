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
  return i === -1 ? fallback : process.argv[i + 1]
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
await page.waitForFunction(() => document.getElementById('out').textContent.includes('DONE'), null, { timeout: 120000 })

console.log(await page.evaluate(() => document.getElementById('out').textContent.trim()))
if (errors.length) console.log('page errors:', errors)

const b64 = await page.evaluate(() => window.__GLB__ ?? null)
await browser.close()

if (!b64) {
  console.error('no GLB produced')
  process.exit(1)
}
writeFileSync(OUT, Buffer.from(b64, 'base64'))
console.log(`wrote ${OUT}`)
