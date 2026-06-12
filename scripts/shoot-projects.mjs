// Screenshot the Projects floor. Usage:
//   BASE_URL=http://127.0.0.1:5173 node scripts/shoot-projects.mjs
//   MOBILE=1 node scripts/shoot-projects.mjs   (390x844, taps first cell)
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const MOBILE = process.env.MOBILE === '1'
const browser = await chromium.launch()
const page = await browser.newPage({
  hasTouch: MOBILE, // page.tap() throws without this
  viewport: MOBILE ? { width: 390, height: 844 } : { width: 1440, height: 900 },
})

await page.goto(`${BASE}/?tools=1`)
await page.waitForTimeout(1500) // settle before Lab interactions or the open stalls
await page.getByRole('button', { name: 'Open', exact: true }).click()
await page.waitForSelector('[data-phase="open"]', { timeout: 15000 })
await page.waitForTimeout(600)

// Collapse the Lighting Lab — expanded it overlays the floor panel and
// intercepts the Projects button click.
await page.getByRole('button', { name: 'Minimize', exact: true }).click()
await page.waitForTimeout(200)

await page.locator('.floor-panel__button', { hasText: 'Projects' }).click()
await page.waitForTimeout(1000)
await page.screenshot({ path: 'shots/projects-idle.png' })
console.log('wrote shots/projects-idle.png')

if (MOBILE) {
  await page.locator('.panel-cell').first().tap()
  await page.waitForTimeout(500)
  await page.screenshot({ path: 'shots/projects-mobile-open.png' })
  console.log('wrote shots/projects-mobile-open.png')
} else {
  await page.locator('.panel-cell').first().hover()
  await page.waitForTimeout(400)
  await page.screenshot({ path: 'shots/projects-hover.png' })
  console.log('wrote shots/projects-hover.png')
}

await browser.close()
