import type { TimelineEnvironment } from '../src/timeline/layers'
import {
  augmentLabelWithPersonalTime,
  formatDateTimeInputValueForTimezone,
  getDerivedHebrewBirthDateLabel,
  getPersonalDayOfLife,
  getPersonalWeekOfLife,
  parseDateTimeInputValueInTimezone,
} from '../src/timeline/personalTime'

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

describe('personal time helpers', () => {
  it('treats the birth date as day 1 and week 1', () => {
    const birthMoment = new Date('1982-04-19T12:00:00-05:00')

    expect(getPersonalDayOfLife(birthMoment, TEST_ENVIRONMENT)).toBe(1)
    expect(getPersonalWeekOfLife(birthMoment, TEST_ENVIRONMENT)).toBe(1)
  })

  it('counts civil-date life days and weeks in the configured timeline timezone', () => {
    const timestamp = new Date('2026-04-01T12:00:00-04:00')

    expect(getPersonalDayOfLife(timestamp, TEST_ENVIRONMENT)).toBe(16054)
    expect(getPersonalWeekOfLife(timestamp, TEST_ENVIRONMENT)).toBe(2294)
  })

  it('places personal counters at the outer edge of leading and supporting labels', () => {
    const timeMs = new Date('2026-03-29T00:00:00-04:00').getTime()

    expect(
      augmentLabelWithPersonalTime({
        label: 'W14, Sun 29',
        timeMs,
        environment: TEST_ENVIRONMENT,
        isLeading: true,
        includeDayOfLife: true,
        includeWeekOfLife: true,
      }),
    ).toBe('Week 2293, Day 16051 - W14, Sun 29')

    expect(
      augmentLabelWithPersonalTime({
        label: '29 Sun, W14',
        timeMs,
        environment: TEST_ENVIRONMENT,
        isLeading: false,
        includeDayOfLife: true,
        includeWeekOfLife: true,
      }),
    ).toBe('29 Sun, W14 - Day 16051, Week 2293')
  })

  it('derives the sunset-aware Hebrew birth date label', () => {
    expect(getDerivedHebrewBirthDateLabel(TEST_ENVIRONMENT)).toBe('26 Nisan 5742')
  })

  it('formats and parses birth input values in the configured timezone', () => {
    const birthDate = new Date('1982-04-19T02:25:00-05:00')
    const formatted = formatDateTimeInputValueForTimezone(birthDate, 'America/New_York')
    const reparsed = parseDateTimeInputValueInTimezone(formatted, 'America/New_York')

    expect(formatted).toBe('1982-04-19T02:25')
    expect(reparsed?.toISOString()).toBe(birthDate.toISOString())
  })
})
