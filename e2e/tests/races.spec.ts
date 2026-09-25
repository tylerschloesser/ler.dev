import { AxeBuilder } from '@axe-core/playwright'
import type { Locator } from '@playwright/test'
import { expect, test } from './fixtures.ts'

const CHICAGO_2023 = '[data-race-id="2023-10-08-chicago"]'

// Puts the card's top edge just above the scroll spy's reading band.
async function scrollToBand(card: Locator, isMobile: boolean) {
  const band = isMobile ? 0.6 : 0.45
  await card.evaluate((el, band) => {
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight * band + 24)
  }, band)
}

function expectRotationNear(rotation: string | null, [λ, φ]: [number, number]) {
  const [actualλ, actualφ] = rotation!.split(',').map(Number)
  expect(Math.abs(actualλ - λ)).toBeLessThanOrEqual(1)
  expect(Math.abs(actualφ - φ)).toBeLessThanOrEqual(1)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('lists every race, with DNFs marked', async ({ page }) => {
  const articles = page.getByRole('list', { name: 'Races' }).locator('article')
  await expect(articles).toHaveCount(18)
  await expect(articles.filter({ hasText: 'DNF' })).toHaveCount(4)
})

test('dark mode changes the background', async ({ page }) => {
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  await page.emulateMedia({ colorScheme: 'light' })
  const light = await bg()
  await page.emulateMedia({ colorScheme: 'dark' })
  expect(await bg()).not.toBe(light)
})

for (const colorScheme of ['light', 'dark'] as const) {
  test(`has no WCAG A/AA violations (${colorScheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme })
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    expect(results.violations).toEqual([])
  })
}

test('globe has one marker per location', async ({ page }) => {
  await expect(page.locator('figure svg [data-location-id]')).toHaveCount(13)
  await expect(page.locator('figure svg')).toHaveAttribute('data-rotation', /^-?\d+\.\d,-?\d+\.\d$/)
})

test('mouse drag rotates the globe', { tag: '@desktop-only' }, async ({ page }) => {
  const svg = page.locator('figure svg')
  const before = await svg.getAttribute('data-rotation')
  const box = (await svg.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 100, y, { steps: 10 })
  await page.mouse.up()
  await expect(svg).not.toHaveAttribute('data-rotation', before!)
})

test('vertical swipe on the mobile globe scrolls the page', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'touch only')
  const svg = page.locator('figure svg')
  await svg.evaluate((el) => {
    const w = window as { sawDrag?: boolean }
    w.sawDrag = false
    new MutationObserver(() => {
      if (el.hasAttribute('data-dragging')) w.sawDrag = true
    }).observe(el, { attributes: true })
  })
  const box = (await svg.boundingBox())!
  const x = box.x + box.width / 2
  const y = box.y + box.height * 0.8
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
  for (let i = 1; i <= 10; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - i * 25 }] })
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100)
  expect(await page.evaluate(() => (window as { sawDrag?: boolean }).sawDrag)).toBe(false)
})

test('scrolling to a race flies the globe to it', async ({ page, isMobile }) => {
  const card = page.locator(CHICAGO_2023)
  const svg = page.locator('figure svg')
  await scrollToBand(card, isMobile)
  await expect(card).toHaveAttribute('aria-current', 'true')
  const marker = svg.locator('[data-location-id="chicago"]')
  await expect(marker).toHaveAttribute('data-active', 'true')
  await expect(svg).toHaveAttribute('data-animating', 'false')
  await expect(marker).toHaveAttribute('data-visible', 'true')
  expectRotationNear(await svg.getAttribute('data-rotation'), [87.6, -41.9])
})

test('reduced motion jumps straight to the race', async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.evaluate(() => {
    const svg = document.querySelector('figure svg')!
    const w = window as { sawAnimating?: boolean }
    w.sawAnimating = false
    new MutationObserver(() => {
      if (svg.getAttribute('data-animating') === 'true') w.sawAnimating = true
    }).observe(svg, { attributes: true })
  })
  const card = page.locator(CHICAGO_2023)
  await scrollToBand(card, isMobile)
  await expect(card).toHaveAttribute('aria-current', 'true')
  expectRotationNear(await page.locator('figure svg').getAttribute('data-rotation'), [87.6, -41.9])
  expect(await page.evaluate(() => (window as { sawAnimating?: boolean }).sawAnimating)).toBe(false)
})

test('hover links markers and cards', { tag: '@desktop-only' }, async ({ page }) => {
  const marker = page.locator('figure svg [data-location-id="boston"]')
  const card = page.locator('[data-race-id="2023-04-17-boston"]')
  await marker.hover({ force: true })
  await expect(card).toHaveAttribute('data-highlighted', 'true')

  await page.mouse.move(0, 0)
  await expect(card).toHaveAttribute('data-highlighted', 'false')

  const austinCard = page.locator('[data-race-id="2024-02-18-austin"]')
  await austinCard.hover()
  await expect(page.locator('figure svg [data-location-id="austin"]')).toHaveAttribute('data-highlighted', 'true')
})

test('clicking a marker scrolls to its race', async ({ page }) => {
  const marker = page.locator('figure svg [data-location-id="boston"]')
  await marker.locator('circle').first().dispatchEvent('click')
  const card = page.locator('[data-race-id="2023-04-17-boston"]')
  await expect(card).toHaveAttribute('aria-current', 'true')
  await expect(card).toBeInViewport()
  await expect(card.getByRole('heading', { level: 2 })).toBeFocused()
})
