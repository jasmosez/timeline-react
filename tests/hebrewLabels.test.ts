import { getHebrewContextLabel, getHebrewTickLabel, getHebrewWeekdayName } from '../src/timeline/hebrewLabels'
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
    ).toBe('Revi\'i, 14 Nisan 5786')
  })

  it('includes weekday in minute/hour-scale Hebrew context', () => {
    expect(
      getHebrewContextLabel(0, new Date('2026-04-01T12:00:00-04:00').getTime(), TEST_ENVIRONMENT),
    ).toBe('Revi\'i, 14 Nisan, 12 PM')
    expect(
      getHebrewContextLabel(-1, new Date('2026-04-01T12:00:00-04:00').getTime(), TEST_ENVIRONMENT),
    ).toBe('Revi\'i, 14 Nisan, 12:00 PM')
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

  it('marks shmita years in decade-scale Hebrew tick labels while keeping the next year plain', () => {
    const shmitaYearLabel = getHebrewTickLabel(
      6,
      getHebrewDayInfo(new Date('2021-09-15T12:00:00-04:00'), TEST_ENVIRONMENT),
      new Date('2021-09-15T12:00:00-04:00').getTime(),
      false,
    )
    const nextYearLabel = getHebrewTickLabel(
      6,
      getHebrewDayInfo(new Date('2022-09-27T12:00:00-04:00'), TEST_ENVIRONMENT),
      new Date('2022-09-27T12:00:00-04:00').getTime(),
      false,
    )

    expect(shmitaYearLabel).toBe('5782, Shmita')
    expect(nextYearLabel).toBe('5783')
  })

  it('includes civil sunset time on Hebrew hour and minute boundary labels', () => {
    const dayInfo = getHebrewDayInfo(new Date('2026-04-01T12:00:00-04:00'), TEST_ENVIRONMENT)
    const boundaryTimeMs = dayInfo.startsAtSunset.getTime()

    expect(getHebrewTickLabel(0, dayInfo, boundaryTimeMs)).toContain('PM')
    expect(getHebrewTickLabel(-1, dayInfo, boundaryTimeMs)).toContain('PM')
    expect(getHebrewTickLabel(-1, dayInfo, boundaryTimeMs)).toMatch(/^\d{1,2}:\d{2}:\d{2}\s(?:AM|PM),\s/)
    expect(getHebrewTickLabel(0, dayInfo, boundaryTimeMs)).toMatch(/^\d{1,2}:\d{2}\s(?:AM|PM),\s/)
    expect(getHebrewTickLabel(1, dayInfo, boundaryTimeMs)).toMatch(/^\d{1,2}:\d{2}\s(?:AM|PM),\sRevi'i 14$/)
  })

  it('stacks Shabbat rhythm with month-boundary labeling in month view', () => {
    const dayInfo = getHebrewDayInfo(new Date('2026-04-18T12:00:00-04:00'), TEST_ENVIRONMENT)

    expect(dayInfo.hebrewDate.day).toBe(1)
    expect(dayInfo.hebrewDate.monthName).toBe('Iyyar')
    expect(getHebrewTickLabel(3, dayInfo, new Date('2026-04-18T12:00:00-04:00').getTime())).toBe(
      'Iyyar, Shabbat 1',
    )
  })

  it('reorders week and month hebrew labels when hebrew is secondary', () => {
    const ordinaryWeekdayInfo = getHebrewDayInfo(new Date('2026-04-13T12:00:00-04:00'), TEST_ENVIRONMENT)
    const monthBoundaryInfo = getHebrewDayInfo(new Date('2026-04-18T12:00:00-04:00'), TEST_ENVIRONMENT)

    expect(getHebrewTickLabel(2, ordinaryWeekdayInfo, ordinaryWeekdayInfo.startsAtSunset.getTime(), false)).toBe(
      `${ordinaryWeekdayInfo.hebrewDate.day}, ${getHebrewWeekdayName(ordinaryWeekdayInfo)}`,
    )
    expect(getHebrewTickLabel(2, monthBoundaryInfo, monthBoundaryInfo.startsAtSunset.getTime(), false)).toBe('1 Iyyar, Shabbat')
    expect(getHebrewTickLabel(3, ordinaryWeekdayInfo, ordinaryWeekdayInfo.startsAtSunset.getTime(), false)).toBe(
      String(ordinaryWeekdayInfo.hebrewDate.day),
    )
    expect(getHebrewTickLabel(3, monthBoundaryInfo, monthBoundaryInfo.startsAtSunset.getTime(), false)).toBe('1 Iyyar, Shabbat')
  })

  it('reorders hebrew quarter, year, and decade labels when secondary', () => {
    const quarterInfo = getHebrewDayInfo(new Date('2026-04-18T12:00:00-04:00'), TEST_ENVIRONMENT)
    const yearInfo = getHebrewDayInfo(new Date('2025-09-23T12:00:00-04:00'), TEST_ENVIRONMENT)
    const shmitaInfo = getHebrewDayInfo(new Date('2021-09-15T12:00:00-04:00'), TEST_ENVIRONMENT)

    expect(getHebrewTickLabel(4, quarterInfo, quarterInfo.startsAtSunset.getTime(), false)).toBe('Iyyar')
    expect(getHebrewTickLabel(5, yearInfo, yearInfo.startsAtSunset.getTime(), true)).toBe('5786, Tishrei')
    expect(getHebrewTickLabel(5, yearInfo, yearInfo.startsAtSunset.getTime(), false)).toBe('Tishrei 5786')
    expect(getHebrewTickLabel(6, shmitaInfo, shmitaInfo.startsAtSunset.getTime(), true)).toBe('Shmita 5782')
    expect(getHebrewTickLabel(6, shmitaInfo, shmitaInfo.startsAtSunset.getTime(), false)).toBe('5782, Shmita')
  })
})
