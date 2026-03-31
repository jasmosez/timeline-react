import { getHebrewContextLabel, getHebrewTickLabel } from '../src/timeline/hebrewLabels'
import type { TimelineEnvironment } from '../src/timeline/layers'
import { getHebrewDayInfo } from '../src/timeline/hebrewTime'

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

describe('hebrew label helpers', () => {
  it('uses Hebrew date context at day scale', () => {
    expect(
      getHebrewContextLabel(1, new Date('2026-04-01T12:00:00-04:00').getTime(), TEST_ENVIRONMENT),
    ).toBe('Nisan 5786')
  })

  it('includes weekday in minute/hour-scale Hebrew context', () => {
    expect(
      getHebrewContextLabel(0, new Date('2026-04-01T12:00:00-04:00').getTime(), TEST_ENVIRONMENT),
    ).toBe('Revi\'i 14 Nisan 5786, 12 PM')
    expect(
      getHebrewContextLabel(-1, new Date('2026-04-01T12:00:00-04:00').getTime(), TEST_ENVIRONMENT),
    ).toBe('Revi\'i 14 Nisan 5786, 12:00 PM')
  })

  it('uses Hebrew year context at quarter scale', () => {
    expect(
      getHebrewContextLabel(4, new Date('2026-04-01T12:00:00-04:00').getTime(), TEST_ENVIRONMENT),
    ).toBe('5786')
  })

  it('omits sticky context at decade scale', () => {
    expect(
      getHebrewContextLabel(6, new Date('2026-04-01T12:00:00-04:00').getTime(), TEST_ENVIRONMENT),
    ).toBeUndefined()
  })

  it('marks shmita years in decade-scale Hebrew tick labels', () => {
    const shmitaYearLabel = getHebrewTickLabel(
      6,
      getHebrewDayInfo(new Date('2021-09-15T12:00:00-04:00'), TEST_ENVIRONMENT),
      new Date('2021-09-15T12:00:00-04:00').getTime(),
    )

    expect(shmitaYearLabel).toBe('5782, Shmita')
  })

  it('includes civil sunset time on Hebrew hour and minute boundary labels', () => {
    const dayInfo = getHebrewDayInfo(new Date('2026-04-01T12:00:00-04:00'), TEST_ENVIRONMENT)
    const boundaryTimeMs = dayInfo.startsAtSunset.getTime()

    expect(getHebrewTickLabel(0, dayInfo, boundaryTimeMs)).toContain('PM')
    expect(getHebrewTickLabel(-1, dayInfo, boundaryTimeMs)).toContain('PM')
    expect(getHebrewTickLabel(-1, dayInfo, boundaryTimeMs)).toMatch(/:\d{2}\s(?:AM|PM)$/)
  })
})
