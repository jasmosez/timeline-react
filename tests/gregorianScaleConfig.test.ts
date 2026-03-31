import { getGregorianStickyContextLabel, GREGORIAN_SCALE_LEVEL_CONFIG } from '../src/timeline/gregorianScaleConfig'

describe('gregorian scale label helpers', () => {
  it('provides sticky context labels for non-decade scales', () => {
    expect(getGregorianStickyContextLabel(3, new Date('2026-03-17T12:00:00-04:00').getTime())).toBe('Mar 2026')
    expect(getGregorianStickyContextLabel(3, new Date('2026-04-02T12:00:00-04:00').getTime())).toBe('Apr 2026')
    expect(getGregorianStickyContextLabel(6, new Date('2026-03-17T12:00:00-04:00').getTime())).toBeUndefined()
  })

  it('shows Sundays explicitly in month view labels', () => {
    const label = GREGORIAN_SCALE_LEVEL_CONFIG[3].renderTickLabel(
      new Date('2026-03-22T00:00:00-04:00').getTime(),
      false,
    )

    expect(label).toBe('Sun 22')
  })

  it('keeps week view labels local even at month boundaries', () => {
    const label = GREGORIAN_SCALE_LEVEL_CONFIG[2].renderTickLabel(
      new Date('2026-04-01T00:00:00-04:00').getTime(),
      false,
    )

    expect(label).toBe('Wed 1')
  })

  it('steps month-view days by local calendar day across DST fall-back', () => {
    const start = new Date('2026-11-01T00:00:00-04:00')
    const next = new Date(GREGORIAN_SCALE_LEVEL_CONFIG[3].calculateTickTimeFunc(start, 1))

    expect(next.toISOString()).toBe(new Date('2026-11-02T00:00:00-05:00').toISOString())
    expect(next.getHours()).toBe(0)
  })

  it('disambiguates repeated local hours across DST fall-back', () => {
    const firstOneAm = GREGORIAN_SCALE_LEVEL_CONFIG[0].renderTickLabel(
      new Date('2026-11-01T01:00:00-04:00').getTime(),
      false,
    )
    const secondOneAm = GREGORIAN_SCALE_LEVEL_CONFIG[0].renderTickLabel(
      new Date('2026-11-01T01:00:00-05:00').getTime(),
      false,
    )

    expect(firstOneAm).toBe('1 AM')
    expect(secondOneAm).toContain('1 AM')
    expect(secondOneAm).not.toBe('1 AM')
  })

  it('labels the hour where the timezone offset changes in spring forward', () => {
    const label = GREGORIAN_SCALE_LEVEL_CONFIG[0].renderTickLabel(
      new Date('2026-03-08T03:00:00-04:00').getTime(),
      false,
    )

    expect(label).toContain('3 AM')
    expect(label).not.toBe('3 AM')
  })
})
