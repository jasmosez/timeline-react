import {
  createHebrewStructuralPoints,
  createHebrewStructuralSpans,
} from '../src/timeline/hebrew'
import { getHebrewIntradayDayPoints } from '../src/timeline/hebrewIntraday'
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
  it('does not render placeholder intraday structure at minute and hour scales', () => {
    const minutePoints = createHebrewStructuralPoints({
      leadingCalendarSystemId: 'hebrew',
      activeScaleLevel: -1,
      focusTimeMs: new Date('2026-04-01T12:00:30-04:00').getTime(),
      visibleDurationMs: 61 * 1000,
      environment: TEST_ENVIRONMENT,
    })
    const minuteSpans = createHebrewStructuralSpans({
      leadingCalendarSystemId: 'hebrew',
      activeScaleLevel: -1,
      focusTimeMs: new Date('2026-04-01T12:00:30-04:00').getTime(),
      visibleDurationMs: 61 * 1000,
      environment: TEST_ENVIRONMENT,
    })
    const hourPoints = createHebrewStructuralPoints({
      leadingCalendarSystemId: 'hebrew',
      activeScaleLevel: 0,
      focusTimeMs: new Date('2026-04-01T12:30:00-04:00').getTime(),
      visibleDurationMs: 61 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })
    const hourSpans = createHebrewStructuralSpans({
      leadingCalendarSystemId: 'hebrew',
      activeScaleLevel: 0,
      focusTimeMs: new Date('2026-04-01T12:30:00-04:00').getTime(),
      visibleDurationMs: 61 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })

    expect(minutePoints).toHaveLength(0)
    expect(minuteSpans).toHaveLength(0)
    expect(hourPoints).toHaveLength(0)
    expect(hourSpans).toHaveLength(0)
  })

  it('does not render placeholder intraday structure for hebrew when secondary at minute/hour scales', () => {
    const minutePoints = createHebrewStructuralPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: -1,
      focusTimeMs: new Date('2026-04-01T12:00:30-04:00').getTime(),
      visibleDurationMs: 61 * 1000,
      environment: TEST_ENVIRONMENT,
    })
    const hourPoints = createHebrewStructuralPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: 0,
      focusTimeMs: new Date('2026-04-01T12:30:00-04:00').getTime(),
      visibleDurationMs: 61 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })

    expect(minutePoints).toHaveLength(0)
    expect(hourPoints).toHaveLength(0)
  })

  it('creates named intraday structural points at day scale without proportional-hour markers', () => {
    const points = createHebrewStructuralPoints({
      leadingCalendarSystemId: 'hebrew',
      activeScaleLevel: 1,
      focusTimeMs: new Date('2026-04-01T12:00:00-04:00').getTime(),
      visibleDurationMs: 25 * 60 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })

    expect(points.length).toBeGreaterThan(0)
    expect(points.some((point) => point.labelClassName?.includes('structural-label-leading'))).toBe(true)
    expect(points.some((point) => (point.label ?? '').startsWith('Netz,'))).toBe(true)
    expect(points.some((point) => (point.label ?? '').startsWith('Shma,'))).toBe(true)
    expect(points.some((point) => (point.label ?? '').startsWith('Tfila,'))).toBe(true)
    expect(points.some((point) => (point.label ?? '').startsWith('Chatzot,'))).toBe(true)
    expect(points.some((point) => (point.label ?? '').startsWith('Chatzot Night,'))).toBe(true)
    expect(points.some((point) => (point.label ?? '').startsWith('Mincha G.,'))).toBe(true)
    expect(points.some((point) => (point.label ?? '').startsWith('Mincha K.,'))).toBe(true)
    expect(points.some((point) => (point.label ?? '').startsWith('Plag,'))).toBe(true)
    expect(points.some((point) => (point.label ?? '').startsWith('Tzeit 8.5°,' ) && point.className?.includes('tick-rank-secondary'))).toBe(true)
    expect(points.some((point) => point.label === '')).toBe(false)
    expect(points.some((point) => (point.label ?? '').includes('PM'))).toBe(true)

    const spans = createHebrewStructuralSpans({
      leadingCalendarSystemId: 'hebrew',
      activeScaleLevel: 1,
      focusTimeMs: new Date('2026-04-01T12:00:00-04:00').getTime(),
      visibleDurationMs: 25 * 60 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })

    expect(spans.length).toBeGreaterThan(0)
    expect(spans.every((span) => span.className?.includes('hebrew-structural-span'))).toBe(true)
    expect(spans.some((span) => span.className?.includes('structural-span-stripe-a'))).toBe(true)
    expect(spans.some((span) => span.className?.includes('structural-span-stripe-b'))).toBe(true)
    expect(spans.some((span) => (span.label ?? '').startsWith('Chatzot Night,'))).toBe(true)
  })

  it('renders hebrew day spans when the layer is supporting too', () => {
    const spans = createHebrewStructuralSpans({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: 1,
      focusTimeMs: new Date('2026-04-01T12:00:00-04:00').getTime(),
      visibleDurationMs: 25 * 60 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })

    expect(spans.length).toBeGreaterThan(0)
    expect(spans.every((span) => span.className?.includes('structural-span-supporting'))).toBe(true)
  })

  it('marks the end of shabbat as a primary day-view tick', () => {
    const points = createHebrewStructuralPoints({
      leadingCalendarSystemId: 'hebrew',
      activeScaleLevel: 1,
      focusTimeMs: new Date('2026-04-04T12:00:00-04:00').getTime(),
      visibleDurationMs: 25 * 60 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })

    expect(points.some((point) => (point.label ?? '').startsWith('Shabbat Ends / Tzeit 8.5°') && point.className?.includes('tick-rank-primary'))).toBe(true)
  })

  it('exposes proportional-hour markers separately for a dedicated layer', () => {
    const points = getHebrewIntradayDayPoints(
      new Date('2026-04-01T12:00:00-04:00').getTime(),
      25 * 60 * 60 * 1000,
      TEST_ENVIRONMENT,
    )

    expect(points.some((point) => point.kind === 'proportional-hour-marker' && point.rankClass === 'tick-rank-ordinary' && point.label === '')).toBe(true)
    expect(points.some((point) => point.kind === 'named-intraday-marker' && (point.label ?? '').startsWith('Netz,'))).toBe(true)
  })

  it('uses Hebrew weekday labels at week scale', () => {
    const points = createHebrewStructuralPoints({
      leadingCalendarSystemId: 'hebrew',
      activeScaleLevel: 2,
      focusTimeMs: new Date('2026-04-01T12:00:00-04:00').getTime(),
      visibleDurationMs: 8 * 24 * 60 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })

    expect(points.some((point) => /Sheni|Shlishi|Shabbat/.test(point.label ?? ''))).toBe(true)
  })

  it('marks shabbat within month view labels', () => {
    const points = createHebrewStructuralPoints({
      leadingCalendarSystemId: 'hebrew',
      activeScaleLevel: 3,
      focusTimeMs: new Date('2026-04-04T12:00:00-04:00').getTime(),
      visibleDurationMs: 32 * 24 * 60 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })

    expect(points.some((point) => (point.label ?? '').includes('Shabbat'))).toBe(true)
  })

  it('limits year-scale hebrew points to month boundaries', () => {
    const points = createHebrewStructuralPoints({
      leadingCalendarSystemId: 'hebrew',
      activeScaleLevel: 5,
      focusTimeMs: new Date('2026-04-01T12:00:00-04:00').getTime(),
      visibleDurationMs: 366 * 24 * 60 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })

    expect(points.length).toBeLessThan(30)
    expect(points.every((point) => point.label === '' || /[A-Za-z]/.test(point.label ?? ''))).toBe(true)
  })

  it('renders quarter-scale hebrew month and quarter boundaries and shmita-scale hebrew year boundaries', () => {
    const quarterPoints = createHebrewStructuralPoints({
      leadingCalendarSystemId: 'hebrew',
      activeScaleLevel: 4,
      focusTimeMs: new Date('2026-04-01T12:00:00-04:00').getTime(),
      visibleDurationMs: 120 * 24 * 60 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })

    expect(quarterPoints.length).toBeGreaterThan(0)
    expect(quarterPoints.length).toBeGreaterThan(2)
    expect(quarterPoints.some((point) => point.label.includes('Nisan'))).toBe(true)
    expect(quarterPoints.some((point) => point.label.includes('Iyyar'))).toBe(true)
    expect(quarterPoints.some((point) => point.label.includes('Sivan'))).toBe(true)
    expect(quarterPoints.some((point) => point.label.includes('Q'))).toBe(true)
    expect(quarterPoints.some((point) => point.label === 'Rishon')).toBe(false)

    const decadePoints = createHebrewStructuralPoints({
      leadingCalendarSystemId: 'hebrew',
      activeScaleLevel: 6,
      focusTimeMs: new Date('2026-04-01T12:00:00-04:00').getTime(),
      visibleDurationMs: 4015 * 24 * 60 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })

    expect(decadePoints.length).toBeGreaterThan(0)
    expect(decadePoints.some((point) => point.label === 'Shmita 5782')).toBe(true)
    expect(decadePoints.some((point) => point.label === '5786')).toBe(true)
    expect(decadePoints.some((point) => point.label === '5783' && point.className?.includes('tick-rank-primary'))).toBe(true)
  })

  it('adds unlabeled hebrew quarter ticks in year view', () => {
    const points = createHebrewStructuralPoints({
      leadingCalendarSystemId: 'hebrew',
      activeScaleLevel: 5,
      focusTimeMs: new Date('2026-04-01T12:00:00-04:00').getTime(),
      visibleDurationMs: 366 * 24 * 60 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })

    expect(points.some((point) => point.label === '' && point.className?.includes('tick-rank-secondary'))).toBe(true)
  })
})
