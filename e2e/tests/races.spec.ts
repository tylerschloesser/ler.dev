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
