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

const before = page.context().pages().length
await page.locator('button.panel-cell', { hasText: 'Showdown Copilot' }).click()
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

await browser.close()
console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)
