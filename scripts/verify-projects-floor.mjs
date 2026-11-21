// Asserts the Projects floor end to end: the list, the screen, when footage
// loads and plays, keyboard reach, phone layout, and no zero-padded numbers.
// Usage: BASE_URL=http://127.0.0.1:5173 node scripts/verify-projects-floor.mjs
import { chromium } from 'playwright'

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
let failures = 0
const check = (name, ok) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
  if (!ok) failures += 1
}
// Installed Chrome: the bundled headless shell renders the 3D lobby in
// software and stalls before the tools panel answers clicks.
const browser = await chromium.launch({ channel: 'chrome' })

// 1. Lobby: the opening film must not download before Projects is on screen.
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const fetched = []
  page.on('request', (r) => fetched.push(r.url()))
  await page.goto(`${BASE}/?tools=1`)
  await page.waitForTimeout(1500)
  await page.getByRole('button', { name: 'fx', exact: true }).click() // the tools tab holding Open
  await page.getByRole('button', { name: 'Open', exact: true }).click()
  await page.waitForSelector('[data-phase="open"]', { state: 'attached', timeout: 15000 })
  await page.waitForTimeout(2500)
  check('lobby fetches no project footage', !fetched.some((u) => u.includes('/media/projects/') && u.endsWith('.mp4')))
  check(
    'floor numbers have no leading zero',
    (await page.locator('.floor-panel__num').allTextContents()).every((n) => /^[1-9]\d*$/.test(n)),
  )
  await page.close()
}

// 2. Desktop floor.
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const clips = new Set()
  page.on('request', (r) => {
    if (r.url().endsWith('.mp4')) clips.add(r.url().split('/').pop())
  })
  await page.goto(`${BASE}/#projects`)
  await page.waitForSelector('.projects-row', { timeout: 20000 })
  await page.waitForTimeout(2500)
  const rows = page.locator('.projects-row')
  check('list shows 11 projects', (await rows.count()) === 11)
  check('rows carry no numbers', (await rows.allTextContents()).every((t) => !/^\s*\d/.test(t)))
  const videoState = () =>
    page.evaluate(() =>
      [...document.querySelectorAll('.projects-screen video')].map((v) => ({
        src: v.getAttribute('src'),
        paused: v.paused,
        time: v.currentTime,
        preload: v.preload,
      })),
    )
  let videos = await videoState()
  check('opening film plays', !videos[0].paused && videos[0].time > 0.5)
  check('other clips stay unloaded', videos.slice(1).every((v) => v.paused && v.preload === 'none'))
  check('Space Apps logo shows for Trailblazer', await page.locator('.projects-caption__event').isVisible())

  await rows.filter({ hasText: 'Keep My SNAP' }).hover()
  await page.waitForTimeout(1500)
  videos = await videoState()
  const snap = videos.find((v) => v.src.includes('snap'))
  check('hover switches the screen and plays that clip', !snap.paused && videos[0].paused)
  check('caption follows hover', (await page.locator('.projects-caption').textContent()).includes('2nd place'))

  check(
    'only clips that were shown were fetched',
    [...clips].every((c) => ['trailblazer-intro.mp4', 'snap-stage.mp4'].includes(c)),
  )

  await rows.filter({ hasText: 'Hone' }).hover()
  await page.waitForTimeout(500)
  check('project without media shows its name tile', await page.locator('.projects-screen__blank.is-on').isVisible())
  check('no clip plays on a media-less project', (await videoState()).every((v) => v.paused))

  // keyboard: one tab stop, arrows move, Tab reaches the chosen project's links
  await page.mouse.move(5, 895)
  await rows.filter({ hasText: 'Trailblazer' }).click()
  check('only the selected row is a tab stop', (await page.locator('.projects-row[tabindex="0"]').count()) === 1)
  await page.keyboard.press('ArrowDown')
  check('ArrowDown selects the next project', (await page.locator('.projects-row[aria-current="true"]').textContent()).includes('PageAura'))
  await page.keyboard.press('Tab') // the screen's pause button
  check('Tab reaches the pause button first', await page.evaluate(() => document.activeElement?.classList.contains('projects-screen__toggle')))
  await page.keyboard.press('Tab')
  check(
    'next Tab reaches the project link',
    await page.evaluate(() => document.activeElement?.closest('.projects-caption__links')?.textContent.includes('Visit')),
  )

  // the pause button holds across projects until pressed again
  await page.getByRole('button', { name: 'Pause video' }).click()
  await page.waitForTimeout(400)
  await rows.filter({ hasText: 'PageAura' }).hover()
  await page.waitForTimeout(800)
  check('pause holds when switching projects', (await videoState()).every((v) => v.paused))
  await page.getByRole('button', { name: 'Play video' }).click()
  await page.waitForTimeout(800)
  check('play resumes the shown clip', (await videoState()).some((v) => !v.paused))

  // leaving the floor pauses the clip
  await rows.filter({ hasText: 'Trailblazer' }).click()
  await page.waitForTimeout(800)
  await page.locator('.floor-panel__button', { hasText: 'Contact' }).click()
  await page.waitForTimeout(2000)
  check('scrolling away pauses the clip', (await videoState()).every((v) => v.paused))
  await page.close()
}

// 2b. Reduced motion: posters only, nothing plays.
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  await page.goto(`${BASE}/#projects`)
  await page.waitForSelector('.projects-row', { timeout: 20000 })
  await page.waitForTimeout(2000)
  await page.locator('.projects-row', { hasText: 'PageAura' }).hover()
  await page.waitForTimeout(1000)
  const states = await page.evaluate(() =>
    [...document.querySelectorAll('.projects-screen video')].map((v) => v.paused && v.preload === 'none'),
  )
  check('reduced motion plays and preloads nothing', states.every(Boolean))
  await page.close()
}

// 2c. Extras: props hug the screen, the plate names lit languages, and a
// 3D logo that fails to load falls back to its flat logo without a crash.
{
  const page = await browser.newPage({ viewport: { width: 1920, height: 600 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.route('**/daily-bread-logo.glb', (route) => route.abort())
  await page.goto(`${BASE}/#projects`)
  await page.waitForSelector('.projects-row', { timeout: 20000 })
  await page.waitForTimeout(1500)
  await page.locator('.projects-row', { hasText: 'Showdown' }).hover()
  await page.waitForTimeout(1200)
  const prop = await page.locator('.projects-prop').boundingBox()
  const screen = await page.locator('.projects-screen').boundingBox()
  check('prop overlaps the screen corner', prop && prop.x < screen.x + screen.width && prop.x + prop.width > screen.x + screen.width)
  check(
    'plate names the lit languages',
    (await page.locator('.plate-lang.is-lit .projects-visually-hidden').count()) ===
      (await page.locator('.plate-lang.is-lit').count()),
  )
  await page.locator('.projects-row', { hasText: 'Daily Bread' }).hover()
  await page.waitForTimeout(2500)
  check('failed 3D logo falls back to the flat logo', await page.locator('.projects-mark .projects-mark__logo').isVisible())
  // the loader still reports the failed fetch; what matters is the page lives on
  await page.locator('.projects-row', { hasText: 'Hone' }).hover()
  await page.waitForTimeout(500)
  check(
    'failed 3D logo leaves the floor working',
    errors.every((e) => e.includes('daily-bread-logo.glb')) &&
      (await page.locator('.projects-caption').textContent()).includes('interview practice'),
  )
  await page.close()
}

// 3. Desktop windows: the wheel scrolls the list itself, not the whole floor.
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  await page.goto(`${BASE}/#projects`)
  await page.waitForSelector('.projects-row', { timeout: 20000 })
  await page.waitForTimeout(2000)
  const floorTop = () => page.evaluate(() => document.querySelector('.site-content').scrollTop)
  const before = await floorTop()
  const box = await page.locator('.projects-list').boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + 60)
  for (let i = 0; i < 6; i += 1) {
    await page.mouse.wheel(0, 200)
    await page.waitForTimeout(120)
  }
  await page.waitForTimeout(900)
  const listTop = await page.locator('.projects-list').evaluate((el) => el.scrollTop)
  check(`${w}x${h} wheel scrolls the list`, listTop > 100)
  check(`${w}x${h} floor stays on Projects`, (await floorTop()) === before)
  const last = await page.locator('.projects-row').last().boundingBox()
  check(`${w}x${h} last project reachable`, last.y + last.height <= h)
  const screen = await page.locator('.projects-screen').boundingBox()
  const caption = await page.locator('.projects-caption').boundingBox()
  const plate = await page.locator('.projects-plate').boundingBox()
  check(`${w}x${h} screen and caption fit the window`, screen.y >= 0 && caption.y + caption.height <= h)
  check(`${w}x${h} Rated-for plate sits below the caption`, plate.y >= caption.y + caption.height && plate.y + plate.height <= h)
  await page.close()
}

// 4. Phone portrait pins the screen; phone landscape does not.
for (const [w, h, sticky] of [[390, 844, true], [768, 1024, true], [880, 601, false], [844, 390, false]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, hasTouch: true })
  await page.goto(`${BASE}/#projects`)
  await page.waitForSelector('.projects-row', { timeout: 20000 })
  await page.waitForTimeout(1200)
  const position = await page.locator('.projects-stage').evaluate((el) => getComputedStyle(el).position)
  check(`${w}x${h} screen ${sticky ? 'pinned' : 'scrolls with the page'}`, (position === 'sticky') === sticky)
  if (sticky) {
    // keyboard jump to the top must not leave the focused row under the screen
    await page.locator('.projects-row[tabindex="0"]').focus()
    await page.keyboard.press('End')
    await page.waitForTimeout(500)
    await page.keyboard.press('Home')
    await page.waitForTimeout(700)
    const stageBottom = (await page.locator('.projects-stage').boundingBox()).y + (await page.locator('.projects-stage').boundingBox()).height
    const rowTop = (await page.locator('.projects-row').first().boundingBox()).y
    check(`${w}x${h} focused row clears the pinned screen`, rowTop >= stageBottom - 1)
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  check(`${w}x${h} no sideways scroll`, !overflow)
  // scroll by hand: Playwright's own scroll-into-view fights the floor's snap
  const row = page.locator('.projects-row', { hasText: 'Daily Bread' })
  await row.evaluate((el) => el.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(600)
  await row.tap()
  await page.waitForTimeout(500)
  check(`${w}x${h} tap selects a project`, (await page.locator('.projects-caption').textContent()).includes('YouVersion'))
  if (w < 881) {
    const cards = []
    page.on('request', (r) => r.url().includes('showdown-card') && cards.push(r.url()))
    const showdown = page.locator('.projects-row', { hasText: 'Showdown' })
    await showdown.evaluate((el) => el.scrollIntoView({ block: 'center' }))
    await showdown.dispatchEvent('click')
    await page.waitForTimeout(1500)
    check(`${w}x${h} no hidden props downloaded`, cards.length === 0 && (await page.locator('.projects-prop').count()) === 0)
  }
  await page.close()
}

await browser.close()
console.log(failures ? `\n${failures} FAILED` : '\nALL PASS')
process.exit(failures ? 1 : 0)
