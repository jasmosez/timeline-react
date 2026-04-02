import { getGregorianStickyContextLabel, GREGORIAN_SCALE_LEVEL_CONFIG } from '../src/timeline/gregorianScaleConfig'
import {
  getGregorianQuarterBoundaryLabel,
  getGregorianStructuralTickLabel,
  getSundayStartWeekInfo,
} from '../src/timeline/gregorianLabels'

describe('gregorian scale label helpers', () => {
  it('provides sticky context labels for non-decade scales', () => {
    expect(getGregorianStickyContextLabel(-1, new Date('2026-03-17T12:34:56-04:00').getTime())).toBe('Tue, Mar 17, 12:34 PM')
    expect(getGregorianStickyContextLabel(0, new Date('2026-03-17T12:34:56-04:00').getTime())).toBe('Tue, Mar 17, 12 PM')
    expect(getGregorianStickyContextLabel(1, new Date('2026-03-17T12:34:56-04:00').getTime())).toBe('Tue, Mar 17, 2026')
    expect(getGregorianStickyContextLabel(2, new Date('2026-03-17T12:00:00-04:00').getTime())).toBe('W12, Mar 2026')
    expect(getGregorianStickyContextLabel(3, new Date('2026-03-17T12:00:00-04:00').getTime())).toBe('Mar 2026')
    expect(getGregorianStickyContextLabel(4, new Date('2026-04-02T12:00:00-04:00').getTime())).toBe('Q2, 2026')
    expect(getGregorianStickyContextLabel(3, new Date('2026-04-02T12:00:00-04:00').getTime())).toBe('Apr 2026')
    expect(getGregorianStickyContextLabel(6, new Date('2026-03-17T12:00:00-04:00').getTime())).toBeUndefined()
  })

  it('shows Sundays explicitly in month view labels', () => {
    const label = GREGORIAN_SCALE_LEVEL_CONFIG[3].getTickLabel(
      new Date('2026-03-22T00:00:00-04:00').getTime(),
      false,
    )

    expect(label).toBe('W13, 22')
  })

  it('shows both Sunday and month context when a month boundary lands on Sunday', () => {
    const label = GREGORIAN_SCALE_LEVEL_CONFIG[3].getTickLabel(
      new Date('2027-08-01T00:00:00-04:00').getTime(),
      false,
    )

    expect(label).toBe('W31, Aug 1')
  })

  it('does not add month context just because a day is the first visible tick in month view', () => {
    const label = GREGORIAN_SCALE_LEVEL_CONFIG[3].getTickLabel(
      new Date('2026-03-17T00:00:00-04:00').getTime(),
      true,
    )

    expect(label).toBe('17')
  })

  it('keeps week view labels local even at month boundaries', () => {
    const label = GREGORIAN_SCALE_LEVEL_CONFIG[2].getTickLabel(
      new Date('2026-04-01T00:00:00-04:00').getTime(),
      false,
    )

    expect(label).toBe('Wed 1')
  })

  it('shows sunday-start week numbers on Sundays in week view', () => {
    const label = GREGORIAN_SCALE_LEVEL_CONFIG[2].getTickLabel(
      new Date('2026-03-29T00:00:00-04:00').getTime(),
      false,
    )

    expect(label).toBe('W14, Sun 29')
  })

  it('reorders week-view sunday labels when gregorian is secondary', () => {
    const label = getGregorianStructuralTickLabel(
      2,
      new Date('2026-03-29T00:00:00-04:00').getTime(),
      false,
      false,
    )

    expect(label).toBe('29 Sun, W14')
  })

  it('puts day before weekday for ordinary gregorian supporting week labels', () => {
    const label = getGregorianStructuralTickLabel(
      2,
      new Date('2026-04-01T00:00:00-04:00').getTime(),
      false,
      false,
    )

    expect(label).toBe('1 Wed')
  })

  it('labels every midnight boundary locally in day view', () => {
    const label = GREGORIAN_SCALE_LEVEL_CONFIG[1].getTickLabel(
      new Date('2026-04-01T00:00:00-04:00').getTime(),
      false,
    )

    expect(label).toBe('Wed 1, 12 AM')
  })

  it('reorders day boundaries when gregorian is secondary', () => {
    const label = getGregorianStructuralTickLabel(
      1,
      new Date('2026-04-01T00:00:00-04:00').getTime(),
      false,
      false,
    )

    expect(label).toBe('12 AM, 1 Wed')
  })

  it('uses week-boundary composition for sunday midnight labels in day view', () => {
    const leadingLabel = getGregorianStructuralTickLabel(
      1,
      new Date('2026-03-29T00:00:00-04:00').getTime(),
      false,
      true,
    )
    const supportingLabel = getGregorianStructuralTickLabel(
      1,
      new Date('2026-03-29T00:00:00-04:00').getTime(),
      false,
      false,
    )

    expect(leadingLabel).toBe('W14, Sun 29, 12 AM')
    expect(supportingLabel).toBe('12 AM, 29 Sun, W14')
  })

  it('labels midnight boundaries explicitly in hour view', () => {
    const label = GREGORIAN_SCALE_LEVEL_CONFIG[0].getTickLabel(
      new Date('2026-04-01T00:00:00-04:00').getTime(),
      false,
    )

    expect(label).toBe('Wed 1, 12:00 AM')
  })

  it('reorders hour and minute day boundaries when gregorian is secondary', () => {
    const hourLabel = getGregorianStructuralTickLabel(
      0,
      new Date('2026-04-01T00:00:00-04:00').getTime(),
      false,
      false,
    )
    const minuteLabel = getGregorianStructuralTickLabel(
      -1,
      new Date('2026-04-01T00:00:00-04:00').getTime(),
      false,
      false,
    )

    expect(hourLabel).toBe('12:00 AM, 1 Wed')
    expect(minuteLabel).toBe('12:00 AM, 1 Wed')
  })

  it('steps month-view days by local calendar day across DST fall-back', () => {
    const start = new Date('2026-11-01T00:00:00-04:00')
    const next = new Date(GREGORIAN_SCALE_LEVEL_CONFIG[3].calculateTickTimeFunc(start, 1))

    expect(next.toISOString()).toBe(new Date('2026-11-02T00:00:00-05:00').toISOString())
    expect(next.getHours()).toBe(0)
  })

  it('disambiguates repeated local hours across DST fall-back', () => {
    const firstOneAm = GREGORIAN_SCALE_LEVEL_CONFIG[0].getTickLabel(
      new Date('2026-11-01T01:00:00-04:00').getTime(),
      false,
    )
    const secondOneAm = GREGORIAN_SCALE_LEVEL_CONFIG[0].getTickLabel(
      new Date('2026-11-01T01:00:00-05:00').getTime(),
      false,
    )

    expect(firstOneAm).toBe('1:00 AM')
    expect(secondOneAm).toContain('1:00 AM')
    expect(secondOneAm).not.toBe('1:00 AM')
  })

  it('labels the hour where the timezone offset changes in spring forward', () => {
    const label = GREGORIAN_SCALE_LEVEL_CONFIG[0].getTickLabel(
      new Date('2026-03-08T03:00:00-04:00').getTime(),
      false,
    )

    expect(label).toContain('3:00 AM')
    expect(label).not.toBe('3:00 AM')
  })

  it('labels every 5 seconds within minute view', () => {
    const label = GREGORIAN_SCALE_LEVEL_CONFIG[-1].getTickLabel(
      new Date('2026-03-17T12:34:05-04:00').getTime(),
      false,
    )

    expect(label).toBe(':05')
  })

  it('shows week numbers on quarter internal ticks', () => {
    const label = GREGORIAN_SCALE_LEVEL_CONFIG[4].getTickLabel(
      new Date('2026-04-05T00:00:00-04:00').getTime(),
      false,
    )

    expect(label).toBe('W15')
  })

  it('reorders month-view sunday labels when gregorian is secondary', () => {
    const ordinarySunday = getGregorianStructuralTickLabel(
      3,
      new Date('2026-03-22T00:00:00-04:00').getTime(),
      false,
      false,
    )
    const monthBoundarySunday = getGregorianStructuralTickLabel(
      3,
      new Date('2027-08-01T00:00:00-04:00').getTime(),
      false,
      false,
    )

    expect(ordinarySunday).toBe('22, W13')
    expect(monthBoundarySunday).toBe('Aug 1, W31')
  })

  it('reorders quarter boundaries when gregorian is secondary', () => {
    const label = getGregorianQuarterBoundaryLabel(
      new Date('2026-04-01T00:00:00-04:00').getTime(),
      false,
    )

    expect(label).toBe('Apr, Q2')
  })

  it('combines month and week number when a week and month begin on the same quarter tick', () => {
    const leadingLabel = getGregorianQuarterBoundaryLabel(
      new Date('2026-02-01T00:00:00-05:00').getTime(),
      true,
    )
    const supportingLabel = getGregorianQuarterBoundaryLabel(
      new Date('2026-02-01T00:00:00-05:00').getTime(),
      false,
    )

    expect(leadingLabel).toBe('Feb, W6')
    expect(supportingLabel).toBe('W6, Feb')
  })

  it('only includes the year on january labels in year view', () => {
    const primaryLabel = getGregorianStructuralTickLabel(
      5,
      new Date('2026-01-01T00:00:00-05:00').getTime(),
      false,
      true,
    )
    const secondaryLabel = getGregorianStructuralTickLabel(
      5,
      new Date('2026-01-01T00:00:00-05:00').getTime(),
      false,
      false,
    )
    const primaryAprilLabel = getGregorianStructuralTickLabel(
      5,
      new Date('2026-04-01T00:00:00-04:00').getTime(),
      false,
      true,
    )
    const secondaryAprilLabel = getGregorianStructuralTickLabel(
      5,
      new Date('2026-04-01T00:00:00-04:00').getTime(),
      false,
      false,
    )

    expect(primaryLabel).toBe('2026, Jan')
    expect(secondaryLabel).toBe('Jan 2026')
    expect(primaryAprilLabel).toBe('Apr')
    expect(secondaryAprilLabel).toBe('Apr')
  })

  it('computes custom sunday-start week numbers by shifting iso week boundaries one day earlier', () => {
    expect(getSundayStartWeekInfo(new Date('2026-03-29T00:00:00-04:00')).weekNumber).toBe(14)
    expect(getSundayStartWeekInfo(new Date('2026-12-27T00:00:00-05:00')).weekNumber).toBe(53)
  })
})
