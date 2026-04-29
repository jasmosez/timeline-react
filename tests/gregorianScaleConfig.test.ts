import { getGregorianStickyContextLabel, GREGORIAN_SCALE_LEVEL_CONFIG } from '../src/timeline/gregorianScaleConfig'
import { getGregorianStructuralTickLabelFromPolicy } from '../src/timeline/gregorian'
import {
  getGregorianQuarterBoundaryLabel,
  getSundayStartWeekInfo,
} from '../src/timeline/gregorianLabels'

const TEST_ENVIRONMENT = {
  now: new Date('2026-04-01T12:00:00-04:00'),
  birthDate: new Date('1982-04-19T02:25:00-05:00'),
  timezone: 'America/New_York',
  location: {
    city: 'Northampton',
    region: 'MA',
    postalCode: '01060',
    latitude: 42.3251,
    longitude: -72.6412,
  },
} as const

const getPolicyDrivenGregorianLabel = (
  activeScaleLevel: -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6,
  tickTime: number,
  leadingCalendarSystemId: 'gregorian' | 'hebrew' = 'gregorian',
) => getGregorianStructuralTickLabelFromPolicy({
  activeScaleLevel,
  tickTime,
  leadingCalendarSystemId,
  visibleDurationMs: GREGORIAN_SCALE_LEVEL_CONFIG[activeScaleLevel].screenSpan,
  environment: TEST_ENVIRONMENT,
})

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

  it('updates sticky context cleanly across week and quarter boundaries', () => {
    expect(getGregorianStickyContextLabel(2, new Date('2026-03-28T12:00:00-04:00').getTime())).toBe('W13, Mar 2026')
    expect(getGregorianStickyContextLabel(2, new Date('2026-03-29T12:00:00-04:00').getTime())).toBe('W14, Mar 2026')
    expect(getGregorianStickyContextLabel(4, new Date('2026-03-31T12:00:00-04:00').getTime())).toBe('Q1, 2026')
    expect(getGregorianStickyContextLabel(4, new Date('2026-04-01T12:00:00-04:00').getTime())).toBe('Q2, 2026')
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

  it('keeps january month-view year boundaries local while still noting quarter starts', () => {
    const leadingLabel = GREGORIAN_SCALE_LEVEL_CONFIG[3].getTickLabel(
      new Date('2027-01-01T00:00:00-05:00').getTime(),
      false,
    )
    const supportingLabel = getPolicyDrivenGregorianLabel(
      3,
      new Date('2027-01-01T00:00:00-05:00').getTime(),
      'hebrew',
    )

    expect(leadingLabel).toBe('Q1, Jan 1')
    expect(supportingLabel).toBe('1 Jan, Q1')
  })

  it('adds quarter context to month-view quarter boundaries', () => {
    const leadingLabel = GREGORIAN_SCALE_LEVEL_CONFIG[3].getTickLabel(
      new Date('2026-04-01T00:00:00-04:00').getTime(),
      false,
    )
    const supportingLabel = getPolicyDrivenGregorianLabel(
      3,
      new Date('2026-04-01T00:00:00-04:00').getTime(),
      'hebrew',
    )

    expect(leadingLabel).toBe('Q2, Apr 1')
    expect(supportingLabel).toBe('1 Apr, Q2')
  })

  it('keeps quarter outermost when month and week begin on the same month-view tick', () => {
    const leadingLabel = GREGORIAN_SCALE_LEVEL_CONFIG[3].getTickLabel(
      new Date('2028-10-01T00:00:00-04:00').getTime(),
      false,
    )
    const supportingLabel = getPolicyDrivenGregorianLabel(
      3,
      new Date('2028-10-01T00:00:00-04:00').getTime(),
      'hebrew',
    )

    expect(leadingLabel).toBe('Q4, W40, Oct 1')
    expect(supportingLabel).toBe('Oct 1, W40, Q4')
  })

  it('does not add month context just because a day is the first visible tick in month view', () => {
    const label = GREGORIAN_SCALE_LEVEL_CONFIG[3].getTickLabel(
      new Date('2026-03-17T00:00:00-04:00').getTime(),
      true,
    )

    expect(label).toBe('17')
  })

  it('does not add month context just because a day is the first visible supporting tick in month view', () => {
    const label = getPolicyDrivenGregorianLabel(
      3,
      new Date('2026-03-17T00:00:00-04:00').getTime(),
      'hebrew',
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
    const label = getPolicyDrivenGregorianLabel(
      2,
      new Date('2026-03-29T00:00:00-04:00').getTime(),
      'hebrew',
    )

    expect(label).toBe('29 Sun, W14')
  })

  it('puts day before weekday for ordinary gregorian supporting week labels', () => {
    const label = getPolicyDrivenGregorianLabel(
      2,
      new Date('2026-04-01T00:00:00-04:00').getTime(),
      'hebrew',
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
    const label = getPolicyDrivenGregorianLabel(
      1,
      new Date('2026-04-01T00:00:00-04:00').getTime(),
      'hebrew',
    )

    expect(label).toBe('12 AM, 1 Wed')
  })

  it('uses week-boundary composition for sunday midnight labels in day view', () => {
    const leadingLabel = getPolicyDrivenGregorianLabel(
      1,
      new Date('2026-03-29T00:00:00-04:00').getTime(),
      'gregorian',
    )
    const supportingLabel = getPolicyDrivenGregorianLabel(
      1,
      new Date('2026-03-29T00:00:00-04:00').getTime(),
      'hebrew',
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
    const hourLabel = getPolicyDrivenGregorianLabel(
      0,
      new Date('2026-04-01T00:00:00-04:00').getTime(),
      'hebrew',
    )
    const minuteLabel = getPolicyDrivenGregorianLabel(
      -1,
      new Date('2026-04-01T00:00:00-04:00').getTime(),
      'hebrew',
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

  it('does not give first-visible minute ticks extra precision anymore', () => {
    const label = GREGORIAN_SCALE_LEVEL_CONFIG[-1].getTickLabel(
      new Date('2026-03-17T12:34:03-04:00').getTime(),
      true,
    )

    expect(label).toBeUndefined()
  })

  it('shows week numbers on quarter internal ticks', () => {
    const label = GREGORIAN_SCALE_LEVEL_CONFIG[4].getTickLabel(
      new Date('2026-04-05T00:00:00-04:00').getTime(),
      false,
    )

    expect(label).toBe('W15')
  })

  it('reorders month-view sunday labels when gregorian is secondary', () => {
    const ordinarySunday = getPolicyDrivenGregorianLabel(
      3,
      new Date('2026-03-22T00:00:00-04:00').getTime(),
      'hebrew',
    )
    const monthBoundarySunday = getPolicyDrivenGregorianLabel(
      3,
      new Date('2027-08-01T00:00:00-04:00').getTime(),
      'hebrew',
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
    const primaryLabel = getPolicyDrivenGregorianLabel(
      5,
      new Date('2026-01-01T00:00:00-05:00').getTime(),
      'gregorian',
    )
    const secondaryLabel = getPolicyDrivenGregorianLabel(
      5,
      new Date('2026-01-01T00:00:00-05:00').getTime(),
      'hebrew',
    )
    const primaryAprilLabel = getPolicyDrivenGregorianLabel(
      5,
      new Date('2026-04-01T00:00:00-04:00').getTime(),
      'gregorian',
    )
    const secondaryAprilLabel = getPolicyDrivenGregorianLabel(
      5,
      new Date('2026-04-01T00:00:00-04:00').getTime(),
      'hebrew',
    )

    expect(primaryLabel).toBe('2026, Jan')
    expect(secondaryLabel).toBe('Jan 2026')
    expect(primaryAprilLabel).toBe('Q2, Apr')
    expect(secondaryAprilLabel).toBe('Apr, Q2')
  })

  it('computes custom sunday-start week numbers by shifting iso week boundaries one day earlier', () => {
    expect(getSundayStartWeekInfo(new Date('2026-03-29T00:00:00-04:00')).weekNumber).toBe(14)
    expect(getSundayStartWeekInfo(new Date('2026-12-27T00:00:00-05:00')).weekNumber).toBe(53)
  })
})
