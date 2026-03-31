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

  test('hebrew structure can be enabled and made primary', async ({ page }) => {
    await page.goto('/')

    const hebrewLayerToggle = page.getByRole('checkbox', { name: 'Hebrew' })
    await hebrewLayerToggle.check()
    await expect(hebrewLayerToggle).toBeChecked()

    const primaryHebrew = page.getByTestId('primary-structure-hebrew')
    await primaryHebrew.check()
    await expect(primaryHebrew).toBeChecked()
  })

  test('selecting a primary structure turns that layer on if needed', async ({ page }) => {
    await page.goto('/')

    const hebrewLayerToggle = page.getByRole('checkbox', { name: 'Hebrew' })
    await expect(hebrewLayerToggle).not.toBeChecked()

    const primaryHebrew = page.getByTestId('primary-structure-hebrew')
    await primaryHebrew.check()

    await expect(primaryHebrew).toBeChecked()
    await expect(hebrewLayerToggle).toBeChecked()
  })

  test('initial anchored week view starts at the containing-period boundary', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('scale-title')).toHaveText('Week View')
    await expect(page.getByTestId('start-tick-value')).toHaveText('Sun, Mar 29, 2026, 12:00 AM')
  })

  test('HQ button zoom keeps anchored current-period framing', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('navigation-mode-value')).toHaveText('currentContainingPeriod')
    await page.getByLabel('Zoom out').click()

    await expect(page.getByTestId('scale-title')).toHaveText('Month View')
    await expect(page.getByTestId('navigation-mode-value')).toHaveText('currentContainingPeriod')
    await expect(page.getByTestId('start-tick-value')).toHaveText('Sun, Mar 1, 2026, 12:00 AM')
  })

  test('HQ button zoom preserves exploratory mode after manual pan', async ({ page }) => {
    await page.goto('/')

    await page.getByLabel('Pan forward').click()
    await expect(page.getByTestId('navigation-mode-value')).toHaveText('centered')

    await page.getByLabel('Zoom out').click()

    await expect(page.getByTestId('navigation-mode-value')).toHaveText('centered')
  })

  test('HQ button pan enters exploratory mode', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('navigation-mode-value')).toHaveText('currentContainingPeriod')

    await page.getByLabel('Pan forward').click()

    await expect(page.getByTestId('navigation-mode-value')).toHaveText('centered')
  })

  test('gesture pan enters exploratory mode', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('navigation-mode-value')).toHaveText('currentContainingPeriod')

    await page.evaluate(() => {
      window.dispatchEvent(
        new WheelEvent('wheel', {
          deltaY: 120,
          bubbles: true,
          cancelable: true,
        }),
      )
    })

    await expect(page.getByTestId('navigation-mode-value')).toHaveText('centered')
  })

  test('gesture zoom enters exploratory mode even from anchored view', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('navigation-mode-value')).toHaveText('currentContainingPeriod')

    await page.evaluate(() => {
      window.dispatchEvent(
        new WheelEvent('wheel', {
          deltaY: 120,
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        }),
      )
    })

    await expect(page.getByTestId('navigation-mode-value')).toHaveText('centered')
  })

  test('gesture zoom stays exploratory when already exploring', async ({ page }) => {
    await page.goto('/')

    await page.getByLabel('Pan forward').click()
    await expect(page.getByTestId('navigation-mode-value')).toHaveText('centered')

    await page.evaluate(() => {
      window.dispatchEvent(
        new WheelEvent('wheel', {
          deltaY: 120,
          ctrlKey: true,
          bubbles: true,
          cancelable: true,
        }),
      )
    })

    await expect(page.getByTestId('navigation-mode-value')).toHaveText('centered')
  })

  test('reset returns exploratory navigation to anchored current-period mode', async ({ page }) => {
    await page.goto('/')

    await page.getByLabel('Pan forward').click()
    await expect(page.getByTestId('navigation-mode-value')).toHaveText('centered')

    await page.getByLabel('Reset timeline').click()

    await expect(page.getByTestId('navigation-mode-value')).toHaveText('currentContainingPeriod')
  })

  test('timeline surface stays clipped to the viewport height', async ({ page }) => {
    await page.goto('/')

    const metrics = await page.evaluate(() => {
      const line = document.querySelector('.line') as HTMLElement | null
      const root = document.querySelector('.timeline-root') as HTMLElement | null

      return {
        lineHeight: line?.getBoundingClientRect().height ?? 0,
        windowHeight: window.innerHeight,
        documentHeight: document.documentElement.scrollHeight,
        rootHeight: root?.getBoundingClientRect().height ?? 0,
      }
    })

    expect(metrics.rootHeight).toBe(metrics.windowHeight)
    expect(metrics.lineHeight).toBe(metrics.windowHeight)
    expect(metrics.documentHeight).toBe(metrics.windowHeight)
  })
})
