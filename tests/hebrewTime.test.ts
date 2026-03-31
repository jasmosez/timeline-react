import { HDate } from '@hebcal/core'

import {
  formatHebrewPrimaryNowLabel,
  getHebrewContainingPeriodEndTimeMs,
  getHebrewContainingPeriodStartTimeMs,
  getHebrewQuarterLabel,
  getHebrewDayInfo,
  getSunsetForCivilDate,
} from '../src/timeline/hebrewTime'
import type { TimelineEnvironment } from '../src/timeline/layers'

const TEST_ENVIRONMENT: TimelineEnvironment = {
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
}

describe('hebrew time adapter', () => {
  it('uses the civil day hebrew date before sunset and the next hebrew date after sunset', () => {
    const civilDate = new Date(Date.UTC(2026, 3, 1, 12))
    const sunset = getSunsetForCivilDate(civilDate, TEST_ENVIRONMENT)
    const beforeSunset = new Date(sunset.getTime() - 60_000)
    const afterSunset = new Date(sunset.getTime() + 60_000)

    const beforeInfo = getHebrewDayInfo(beforeSunset, TEST_ENVIRONMENT)
    const afterInfo = getHebrewDayInfo(afterSunset, TEST_ENVIRONMENT)

    expect(beforeInfo.hebrewDate.label).toBe(new HDate(civilDate).render('en'))

    const nextCivilDate = new Date(civilDate)
    nextCivilDate.setUTCDate(nextCivilDate.getUTCDate() + 1)
    expect(afterInfo.hebrewDate.label).toBe(new HDate(nextCivilDate).render('en'))
  })

  it('returns sunset boundaries that bracket the timestamp', () => {
    const timestamp = new Date('2026-04-01T15:00:00-04:00')
    const info = getHebrewDayInfo(timestamp, TEST_ENVIRONMENT)

    expect(info.startsAtSunset.getTime()).toBeLessThanOrEqual(timestamp.getTime())
    expect(info.endsAtSunset.getTime()).toBeGreaterThan(timestamp.getTime())
  })

  it('formats a compact hebrew-primary now label with civil time', () => {
    const label = formatHebrewPrimaryNowLabel(
      new Date('2026-04-01T12:00:00-04:00'),
      TEST_ENVIRONMENT,
    )

    expect(label).toContain("Revi'i")
    expect(label).toContain('14 Nisan 5786')
    expect(label).toContain('12:00 PM')
  })

  it('advances hebrew weekday naming after sundown', () => {
    const label = formatHebrewPrimaryNowLabel(
      new Date('2026-03-30T20:00:00-04:00'),
      TEST_ENVIRONMENT,
    )

    expect(label).toContain('Shlishi')
  })

  it('derives the expected hebrew quarter label in a leap year', () => {
    expect(getHebrewQuarterLabel(5787, 10)).toBe('Tevet–Adar II 5787')
  })

  it('anchors hebrew quarter and decade containing periods', () => {
    const timestamp = new Date('2026-04-01T12:00:00-04:00')

    const quarterStart = getHebrewContainingPeriodStartTimeMs(4, timestamp, TEST_ENVIRONMENT)
    const quarterEnd = getHebrewContainingPeriodEndTimeMs(4, timestamp, TEST_ENVIRONMENT)
    const decadeStart = getHebrewContainingPeriodStartTimeMs(6, timestamp, TEST_ENVIRONMENT)
    const decadeEnd = getHebrewContainingPeriodEndTimeMs(6, timestamp, TEST_ENVIRONMENT)

    expect(quarterStart).toBeLessThan(timestamp.getTime())
    expect(quarterEnd).toBeGreaterThan(timestamp.getTime())
    expect(decadeStart).toBeLessThan(timestamp.getTime())
    expect(decadeEnd).toBeGreaterThan(timestamp.getTime())
  })

  it('starts the hebrew decade on the year ending in zero', () => {
    const decadeStart = getHebrewContainingPeriodStartTimeMs(
      6,
      new Date('2026-04-01T12:00:00-04:00'),
      TEST_ENVIRONMENT,
    )

    const firstVisibleHebrewYear = new HDate(new Date(decadeStart + 12 * 60 * 60 * 1000))
    expect(firstVisibleHebrewYear.getFullYear()).toBe(5780)
    expect(firstVisibleHebrewYear.getMonth()).toBe(7)
    expect(firstVisibleHebrewYear.getDate()).toBe(1)
  })
})
