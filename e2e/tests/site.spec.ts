import { expect, test } from './fixtures.ts'

test('home page renders', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Marathons')

  // Proves the freshly deployed build is being served, not a cached one.
  const expectedSha = process.env.EXPECTED_SHA
  if (expectedSha) {
    await expect(page.locator('meta[name="git-sha"]')).toHaveAttribute('content', expectedSha)
  }
})

test('deep routes fall back to index.html', { tag: '@desktop-only' }, async ({ page }) => {
  const response = await page.goto('/some/deep/route')
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Marathons')
})

test('missing assets are not masked', { tag: '@desktop-only' }, async ({ request }) => {
  const response = await request.get('/nope.js')
  expect(response.status()).not.toBe(200)
})

test('ler.dev redirects to ty.ler.dev', { tag: '@desktop-only' }, async ({ request }) => {
  const response = await request.get('https://ler.dev/foo?x=1', { maxRedirects: 0 })
  expect(response.status()).toBe(301)
  expect(response.headers()['location']).toBe('https://ty.ler.dev/foo?x=1')
})

test('CloudWatch RUM ingests events', { tag: '@desktop-only' }, async ({ page }) => {
  const rumResponse = page.waitForResponse(
    (r) => r.url().startsWith('https://dataplane.rum.us-east-1.amazonaws.com/') && r.request().method() === 'POST',
    { timeout: 15_000 },
  )
  await page.goto('/')
  await expect.poll(() => page.evaluate(() => typeof (window as { cwr?: unknown }).cwr)).toBe('function')
  const response = await rumResponse
  expect(response.status()).toBeGreaterThanOrEqual(200)
  expect(response.status()).toBeLessThan(300)
})
