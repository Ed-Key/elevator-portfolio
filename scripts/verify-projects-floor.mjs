// Asserts the Projects button-panel floor + snap scroll end-to-end.
// Usage: BASE_URL=http://127.0.0.1:5173 node scripts/verify-projects-floor.mjs
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
let failures = 0
const check = (name, ok) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
  if (!ok) failures += 1
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(`${BASE}/?tools=1`)
await page.waitForTimeout(1500)
await page.getByRole('button', { name: 'Open', exact: true }).click()
await page.waitForSelector('[data-phase="open"]', { timeout: 15000 })
// The Lighting Lab aside overlays the floor panel in ?tools=1 mode and
// would intercept panel clicks — hide it for the assertions.
await page.addStyleTag({ content: '[data-preview-ui]{display:none !important}' })
await page.waitForTimeout(600)
check('modal reaches open phase', true)

await page.locator('.floor-panel__button', { hasText: 'Projects' }).click()
await page.waitForTimeout(1200)
check('ring renders 8 cells', (await page.locator('.panel-cell').count()) === 8)
check('idle plate shows count', await page.locator('.stage-idle__count').isVisible())

await page.locator('.panel-cell').first().hover()
await page.waitForTimeout(400)
check('hover puts PageAura on stage', await page.locator('.stage-show__name', { hasText: 'PageAura' }).isVisible())

await page.locator('.panel-stage').hover() // move off the cells onto the stage itself
await page.waitForTimeout(300)
check('stage holds after pointer leaves', await page.locator('.stage-show__name', { hasText: 'PageAura' }).isVisible())

await page.locator('.panel-cell', { hasText: 'Showdown Copilot' }).hover()
await page.waitForTimeout(800)
check('showdown mounts stage backdrop', (await page.locator('.stage-backdrop video').count()) === 1)
check('showdown text sits on shield', (await page.locator('.stage-show--backdropped').count()) === 1)
// backdrop only flags is-ready once the video autoplays, so a codec/autoplay
// regression trips this rather than only the gitignored probe
check('backdrop reaches is-ready', (await page.locator('.stage-backdrop.is-ready').count()) === 1)
await page.locator('.panel-cell', { hasText: 'PageAura' }).hover()
await page.waitForTimeout(600)
check('backdrop unmounts off showdown', (await page.locator('.stage-backdrop').count()) === 0)

const before = page.context().pages().length
await page.locator('button.panel-cell', { hasText: 'Potencia' }).click()
await page.waitForTimeout(150)
check('private press blinks (data-denied)', (await page.locator('[data-denied="true"]').count()) === 1)
await page.waitForTimeout(600)
check('private press opens no page', page.context().pages().length === before)

await page.locator('.floor-panel__button', { hasText: 'Contact' }).click()
await page.waitForTimeout(1400)
check(
  'panel lamp follows scroll to Contact',
  (await page.locator('.floor-panel__button', { hasText: 'Contact' }).getAttribute('aria-current')) === 'true',
)

await page.locator('.floor-panel__button', { hasText: 'Lobby' }).click()
await page.waitForTimeout(1400)
check(
  'riding back re-lights Lobby',
  (await page.locator('.floor-panel__button', { hasText: 'Lobby' }).getAttribute('aria-current')) === 'true',
)

// reduced-motion policy: a second context asks for reduced motion, rides to the
// projects floor, hovers showdown, and asserts no backdrop, no shield, no window
// video, and the dashboard poster in the window instead
const rmContext = await browser.newContext({
  reducedMotion: 'reduce',
  viewport: { width: 1440, height: 900 },
})
const rmPage = await rmContext.newPage()
await rmPage.goto(`${BASE}/?tools=1`)
await rmPage.waitForTimeout(1500)
await rmPage.getByRole('button', { name: 'Open', exact: true }).click()
await rmPage.waitForSelector('[data-phase="open"]', { timeout: 15000 })
await rmPage.addStyleTag({ content: '[data-preview-ui]{display:none !important}' })
await rmPage.waitForTimeout(600)
await rmPage.locator('.floor-panel__button', { hasText: 'Projects' }).click()
await rmPage.waitForTimeout(1200)
await rmPage.locator('.panel-cell', { hasText: 'Showdown Copilot' }).hover()
await rmPage.waitForTimeout(800)
check('reduced motion mounts no backdrop', (await rmPage.locator('.stage-backdrop').count()) === 0)
check('reduced motion drops the shield', (await rmPage.locator('.stage-show--backdropped').count()) === 0)
check('reduced motion plays no window video', (await rmPage.locator('.stage-show__window video').count()) === 0)
check(
  'reduced motion shows dashboard poster',
  (await rmPage.locator('.stage-show__window img').getAttribute('src')) === '/media/projects/showdown-dashboard.png',
)
await rmContext.close()

await browser.close()
console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)
