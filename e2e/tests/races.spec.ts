import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from './fixtures.ts'

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
  const before = await svg.getAttribute('data-rotation')
  const box = (await svg.boundingBox())!
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Input.synthesizeScrollGesture', {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
    yDistance: -300,
    gestureSourceType: 'touch',
  })
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100)
  await expect(svg).toHaveAttribute('data-rotation', before!)
})
