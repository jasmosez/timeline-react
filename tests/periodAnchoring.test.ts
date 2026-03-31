import { getContainingPeriodFocusTimeMs } from '../src/timeline/periodAnchoring'
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

describe('period anchoring', () => {
  it('centers hebrew current minute around the containing civil minute', () => {
    const focusTimeMs = getContainingPeriodFocusTimeMs(
      'hebrew',
      -1,
      new Date('2026-04-01T12:00:30-04:00'),
      TEST_ENVIRONMENT,
    )

    expect(focusTimeMs).toBe(new Date('2026-04-01T12:00:30-04:00').getTime())
  })

  it('centers hebrew current hour around the containing civil hour', () => {
    const focusTimeMs = getContainingPeriodFocusTimeMs(
      'hebrew',
      0,
      new Date('2026-04-01T12:30:00-04:00'),
      TEST_ENVIRONMENT,
    )

    expect(focusTimeMs).toBe(new Date('2026-04-01T12:30:00-04:00').getTime())
  })

  it('centers gregorian current week around its containing period', () => {
    const focusTimeMs = getContainingPeriodFocusTimeMs(
      'gregorian',
      2,
      new Date('2026-04-01T12:00:00-04:00'),
      TEST_ENVIRONMENT,
    )

    expect(focusTimeMs).toBe(new Date('2026-04-01T12:00:00-04:00').getTime())
  })

  it('centers hebrew current day around its sunset-based containing period', () => {
    const focusTimeMs = getContainingPeriodFocusTimeMs(
      'hebrew',
      1,
      new Date('2026-04-01T12:00:00-04:00'),
      TEST_ENVIRONMENT,
    )

    expect(focusTimeMs).toBeGreaterThan(new Date('2026-03-31T18:00:00-04:00').getTime())
    expect(focusTimeMs).toBeLessThan(new Date('2026-04-01T18:00:00-04:00').getTime())
  })
})
