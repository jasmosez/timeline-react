import { expect, test } from '@playwright/test'

test.describe('HQ controls', () => {
  test('buttons remain clickable above the timeline', async ({ page }) => {
    await page.goto('/')

    const scaleTitle = page.getByTestId('scale-title')
    await expect(scaleTitle).toHaveText(/Week View|Day View|Month View|Hour View|Minute View|Quarter View|Year View|Decade View/)

    const initialTitle = await scaleTitle.textContent()
    await page.getByLabel('Zoom in').click()
    await expect(scaleTitle).not.toHaveText(initialTitle ?? '')
  })

  test('reset restores the original start tick after panning', async ({ page }) => {
    await page.goto('/')

    const startTick = page.getByTestId('start-tick-value')
    const initialStartTick = await startTick.textContent()

    await page.getByLabel('Pan forward').click()
    await expect(startTick).not.toHaveText(initialStartTick ?? '')

    await page.getByLabel('Reset timeline').click()
    await expect(startTick).toHaveText(initialStartTick ?? '')
  })

  test('manual pan disables lock now mode immediately', async ({ page }) => {
    await page.goto('/')

    const lockNowToggle = page.getByTestId('lock-now-toggle')
    await lockNowToggle.check()
    await expect(lockNowToggle).toBeChecked()

    await page.getByLabel('Pan forward').click()
    await expect(lockNowToggle).not.toBeChecked()
  })

  test('primary calendar system stays selected even if its structure is hidden', async ({ page }) => {
    await page.goto('/')

    const primaryGregorian = page.getByTestId('primary-structure-gregorian')
    await expect(primaryGregorian).toBeChecked()

    const gregorianLayerToggle = page.getByRole('checkbox', { name: 'Gregorian' })
    await gregorianLayerToggle.uncheck()
    await expect(gregorianLayerToggle).not.toBeChecked()
    await expect(primaryGregorian).toBeChecked()
  })
})
