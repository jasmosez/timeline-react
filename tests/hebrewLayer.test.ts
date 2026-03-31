import { createHebrewStructuralPoints, createHebrewStructuralSpans } from '../src/timeline/hebrew'
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

describe('hebrew structural layer', () => {
  it('creates sunset-based structural points at day scale', () => {
    const points = createHebrewStructuralPoints({
      primaryCalendarSystemId: 'hebrew',
      activeScaleLevel: 1,
      focusTimeMs: new Date('2026-04-01T12:00:00-04:00').getTime(),
      visibleDurationMs: 25 * 60 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })

    expect(points.length).toBeGreaterThan(0)
    expect(points.some((point) => point.labelClassName?.includes('structural-label-primary'))).toBe(true)
    expect(points.some((point) => point.className?.includes('hebrew-subtick'))).toBe(true)

    const spans = createHebrewStructuralSpans({
      primaryCalendarSystemId: 'hebrew',
      activeScaleLevel: 1,
      focusTimeMs: new Date('2026-04-01T12:00:00-04:00').getTime(),
      visibleDurationMs: 25 * 60 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })

    expect(spans.length).toBeGreaterThan(0)
    expect(spans.length).toBeGreaterThan(20)
    expect(spans.every((span) => span.id.startsWith('hebrew-'))).toBe(true)
  })

  it('uses the same civil-hour span subdivision when hebrew is secondary at day scale', () => {
    const spans = createHebrewStructuralSpans({
      primaryCalendarSystemId: 'gregorian',
      activeScaleLevel: 1,
      focusTimeMs: new Date('2026-04-01T12:00:00-04:00').getTime(),
      visibleDurationMs: 25 * 60 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })

    expect(spans.length).toBeGreaterThan(0)
    expect(spans.length).toBeGreaterThan(20)
  })

  it('limits year-scale hebrew points to month boundaries', () => {
    const points = createHebrewStructuralPoints({
      primaryCalendarSystemId: 'hebrew',
      activeScaleLevel: 5,
      focusTimeMs: new Date('2026-04-01T12:00:00-04:00').getTime(),
      visibleDurationMs: 366 * 24 * 60 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })

    expect(points.length).toBeLessThan(30)
    expect(points.every((point) => point.label === '' || /[A-Za-z]/.test(point.label ?? ''))).toBe(true)
  })
})
