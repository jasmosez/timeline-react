import { createGregorianTickPoints, createGregorianStructuralSpans } from '../src/timeline/gregorian'
import { GREGORIAN_PERIOD_FAMILY_IDS } from '../src/timeline/structuralPeriodFamilies'

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

describe('gregorian structural layer', () => {
  it('renders quarter view with weekly internals plus stronger month boundaries', () => {
    const focusTimeMs = new Date('2026-04-20T12:00:00-04:00').getTime()
    const visibleDurationMs = 18 * 7 * 24 * 60 * 60 * 1000
    const points = createGregorianTickPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: 4,
      focusTimeMs,
      visibleDurationMs,
    })

    expect(points.some((point) => point.label === 'W15')).toBe(true)
    expect(points.some((point) => ['Apr', 'May', 'Jun'].includes(point.label ?? ''))).toBe(true)
    expect(points.some((point) => point.label === 'Q2, Apr')).toBe(true)
  })

  it('uses weekly spans in quarter view', () => {
    const focusTimeMs = new Date('2026-04-20T12:00:00-04:00').getTime()
    const visibleDurationMs = 18 * 7 * 24 * 60 * 60 * 1000
    const spans = createGregorianStructuralSpans(
      'gregorian',
      4,
      focusTimeMs,
      visibleDurationMs,
      TEST_ENVIRONMENT,
    )

    expect(spans.length).toBeGreaterThan(8)
  })

  it('preserves week-view labels for ordinary days and Sunday boundaries under policy-driven label intent', () => {
    const focusTimeMs = new Date('2026-04-01T12:00:00-04:00').getTime()
    const visibleDurationMs = 8 * 24 * 60 * 60 * 1000
    const points = createGregorianTickPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: 2,
      focusTimeMs,
      visibleDurationMs,
    })

    expect(points.some((point) => point.label === 'Thu 2')).toBe(true)
    expect(points.some((point) => point.label === 'W14, Sun 29')).toBe(true)
    expect(
      points.some((point) =>
        point.label === 'Thu 2'
        && point.className?.includes('tick-rank-ordinary'),
      ),
    ).toBe(true)
    expect(
      points.some((point) =>
        point.label === 'W14, Sun 29'
        && point.className?.includes('tick-rank-secondary'),
      ),
    ).toBe(true)
  })

  it('preserves month-view contextual labels for ordinary, Sunday, and quarter-start ticks', () => {
    const focusTimeMs = new Date('2026-04-20T12:00:00-04:00').getTime()
    const visibleDurationMs = 45 * 24 * 60 * 60 * 1000
    const points = createGregorianTickPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: 3,
      focusTimeMs,
      visibleDurationMs,
    })

    expect(points.some((point) => point.label === '2')).toBe(true)
    expect(points.some((point) => point.label === 'W17, 19')).toBe(true)
    expect(points.some((point) => point.label === 'Q2, Apr 1')).toBe(true)
    expect(
      points.some((point) =>
        point.label === '2'
        && point.className?.includes('tick-rank-ordinary'),
      ),
    ).toBe(true)
    expect(
      points.some((point) =>
        point.label === 'W17, 19'
        && point.className?.includes('tick-rank-secondary'),
      ),
    ).toBe(true)
    expect(
      points.some((point) =>
        point.label === 'Q2, Apr 1'
        && point.className?.includes('tick-rank-primary'),
      ),
    ).toBe(true)
  })

  it('preserves month-view month-start labels for non-quarter boundaries', () => {
    const focusTimeMs = new Date('2026-05-01T12:00:00-04:00').getTime()
    const visibleDurationMs = 20 * 24 * 60 * 60 * 1000
    const points = createGregorianTickPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: 3,
      focusTimeMs,
      visibleDurationMs,
    })

    expect(points.some((point) => point.label === 'May 1')).toBe(true)
    expect(
      points.some((point) =>
        point.label === 'May 1'
        && point.className?.includes('tick-rank-primary'),
      ),
    ).toBe(true)
  })

  it('uses instance variance to label only selected second-family ticks in minute view', () => {
    const focusTimeMs = new Date('2026-04-20T12:00:07-04:00').getTime()
    const visibleDurationMs = 20 * 1000
    const points = createGregorianTickPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: -1,
      focusTimeMs,
      visibleDurationMs,
    })

    expect(points.some((point) => point.label === ':05')).toBe(true)
    expect(points.some((point) => point.label === ':06')).toBe(false)
    expect(
      points.some((point) =>
        point.label === ':05'
        && point.className?.includes('tick-rank-ordinary'),
      ),
    ).toBe(true)
  })

  it('uses policy-driven label intent for ordinary top-of-minute ticks in minute view', () => {
    const focusTimeMs = new Date('2026-04-20T12:01:05-04:00').getTime()
    const visibleDurationMs = 20 * 1000
    const points = createGregorianTickPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: -1,
      focusTimeMs,
      visibleDurationMs,
    })

    expect(points.some((point) => point.label === '12:01 PM')).toBe(true)
    expect(
      points.some((point) =>
        point.label === '12:01 PM'
        && point.className?.includes('tick-rank-secondary'),
      ),
    ).toBe(true)
  })

  it('uses instance variance to promote the minute-family top-of-hour tick in minute view', () => {
    const focusTimeMs = new Date('2026-04-20T13:00:05-04:00').getTime()
    const visibleDurationMs = 20 * 1000
    const points = createGregorianTickPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: -1,
      focusTimeMs,
      visibleDurationMs,
    })

    expect(
      points.some((point) =>
        point.label === '1 PM'
        && point.className?.includes('tick-rank-secondary'),
      ),
    ).toBe(true)
  })

  it('uses day-family minute-view policy for midnight boundary ticks', () => {
    const focusTimeMs = new Date('2026-04-20T00:00:05-04:00').getTime()
    const visibleDurationMs = 20 * 1000
    const points = createGregorianTickPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: -1,
      focusTimeMs,
      visibleDurationMs,
    })

    expect(
      points.some((point) =>
        typeof point.label === 'string'
        && point.label.includes('12 AM')
        && point.className?.includes('tick-rank-primary'),
      ),
    ).toBe(true)
  })

  it('uses instance variance to label only selected minute-family ticks in hour view', () => {
    const focusTimeMs = new Date('2026-04-20T12:07:00-04:00').getTime()
    const visibleDurationMs = 20 * 60 * 1000
    const points = createGregorianTickPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: 0,
      focusTimeMs,
      visibleDurationMs,
    })

    expect(points.some((point) => point.label === ':05')).toBe(true)
    expect(points.some((point) => point.label === ':06')).toBe(false)
    expect(
      points.some((point) =>
        point.label === ':05'
        && point.className?.includes('tick-rank-ordinary'),
      ),
    ).toBe(true)
  })

  it('uses hour-family policy for top-of-hour ticks in hour view', () => {
    const focusTimeMs = new Date('2026-04-20T13:02:00-04:00').getTime()
    const visibleDurationMs = 20 * 60 * 1000
    const points = createGregorianTickPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: 0,
      focusTimeMs,
      visibleDurationMs,
    })

    expect(points.some((point) => point.label === '1:00 PM')).toBe(true)
    expect(
      points.some((point) =>
        point.label === '1:00 PM'
        && point.className?.includes('tick-rank-secondary'),
      ),
    ).toBe(true)
  })

  it('uses day-family hour-view policy for midnight boundary ticks', () => {
    const focusTimeMs = new Date('2026-04-20T00:02:00-04:00').getTime()
    const visibleDurationMs = 20 * 60 * 1000
    const points = createGregorianTickPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: 0,
      focusTimeMs,
      visibleDurationMs,
    })

    expect(
      points.some((point) =>
        typeof point.label === 'string'
        && point.label.includes('12:00 AM')
        && point.className?.includes('tick-rank-primary'),
      ),
    ).toBe(true)
  })

  it('uses instance variance to label only selected hour-family ticks in day view', () => {
    const focusTimeMs = new Date('2026-04-20T08:00:00-04:00').getTime()
    const visibleDurationMs = 12 * 60 * 60 * 1000
    const points = createGregorianTickPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: 1,
      focusTimeMs,
      visibleDurationMs,
    })

    expect(points.some((point) => point.label === '6 AM')).toBe(true)
    expect(points.some((point) => point.label === '4 AM')).toBe(false)
    expect(
      points.some((point) =>
        point.label === '6 AM'
        && point.className?.includes('tick-rank-ordinary'),
      ),
    ).toBe(true)
  })

  it('uses day-family policy for midnight ticks in day view', () => {
    const focusTimeMs = new Date('2026-04-20T02:00:00-04:00').getTime()
    const visibleDurationMs = 12 * 60 * 60 * 1000
    const points = createGregorianTickPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: 1,
      focusTimeMs,
      visibleDurationMs,
    })

    expect(
      points.some((point) =>
        typeof point.label === 'string'
        && point.label.includes('12 AM')
        && point.className?.includes('tick-rank-secondary'),
      ),
    ).toBe(true)
  })

  it('uses week-family policy for Sunday midnight ticks in day view', () => {
    const focusTimeMs = new Date('2026-03-29T02:00:00-04:00').getTime()
    const visibleDurationMs = 12 * 60 * 60 * 1000
    const points = createGregorianTickPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: 1,
      focusTimeMs,
      visibleDurationMs,
    })

    expect(
      points.some((point) =>
        typeof point.label === 'string'
        && point.label.includes('W14')
        && point.className?.includes('tick-rank-primary'),
      ),
    ).toBe(true)
  })

  it('adds quarter-owned labels in year view', () => {
    const focusTimeMs = new Date('2026-04-20T12:00:00-04:00').getTime()
    const visibleDurationMs = 400 * 24 * 60 * 60 * 1000
    const points = createGregorianTickPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: 5,
      focusTimeMs,
      visibleDurationMs,
    })

    expect(
      points.some((point) =>
        point.label === 'Q2, Apr'
        && point.className?.includes('tick-rank-secondary')
        && point.structuralMetadata?.structuralPeriodFamilyId === GREGORIAN_PERIOD_FAMILY_IDS.quarter,
      ),
    ).toBe(true)
    expect(points.some((point) => point.label === '2026, Jan')).toBe(true)
  })

  it('preserves quarter-view and year-view calm-scale labels under policy-driven intent', () => {
    const quarterPoints = createGregorianTickPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: 4,
      focusTimeMs: new Date('2026-04-20T12:00:00-04:00').getTime(),
      visibleDurationMs: 18 * 7 * 24 * 60 * 60 * 1000,
    })
    const yearPoints = createGregorianTickPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: 5,
      focusTimeMs: new Date('2026-04-20T12:00:00-04:00').getTime(),
      visibleDurationMs: 400 * 24 * 60 * 60 * 1000,
    })

    expect(quarterPoints.some((point) => point.label === 'W15')).toBe(true)
    expect(quarterPoints.some((point) => point.label === 'Q2, Apr')).toBe(true)
    expect(yearPoints.some((point) => point.label === 'Apr')).toBe(false)
    expect(yearPoints.some((point) => point.label === 'Q2, Apr')).toBe(true)
    expect(yearPoints.some((point) => point.label === '2026, Jan')).toBe(true)
    expect(
      yearPoints.some((point) =>
        point.label === 'Q2, Apr'
        && point.className?.includes('tick-rank-secondary')
        && point.structuralMetadata?.structuralPeriodFamilyId === GREGORIAN_PERIOD_FAMILY_IDS.quarter,
      ),
    ).toBe(true)
    expect(
      quarterPoints.some((point) =>
        point.label === 'W15'
        && point.className?.includes('tick-rank-ordinary'),
      ),
    ).toBe(true)
    expect(
      quarterPoints.some((point) =>
        point.label === 'Q2, Apr'
        && point.className?.includes('tick-rank-primary'),
      ),
    ).toBe(true)
    expect(
      yearPoints.some((point) =>
        point.label === 'Q2, Apr'
        && point.className?.includes('tick-rank-secondary'),
      ),
    ).toBe(true)
    expect(
      yearPoints.some((point) =>
        point.label === 'Apr'
        && point.className?.includes('tick-rank-ordinary'),
      ),
    ).toBe(false)
    expect(
      yearPoints.some((point) =>
        point.label === '2026, Jan'
        && point.className?.includes('tick-rank-primary'),
      ),
    ).toBe(true)
  })

  it('attaches structural period family metadata to gregorian ticks', () => {
    const focusTimeMs = new Date('2026-03-29T12:00:00-04:00').getTime()
    const visibleDurationMs = 8 * 24 * 60 * 60 * 1000
    const points = createGregorianTickPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: 2,
      focusTimeMs,
      visibleDurationMs,
    })

    const weekBoundary = points.find((point) => point.label === 'W14, Sun 29')
    const ordinaryDay = points.find((point) => point.label === 'Thu 2')

    expect(weekBoundary?.structuralMetadata).toMatchObject({
      structuralCalendarSystemId: 'gregorian',
      structuralPeriodFamilyId: GREGORIAN_PERIOD_FAMILY_IDS.week,
      structuralSignificance: 'major',
    })
    expect(ordinaryDay?.structuralMetadata).toMatchObject({
      structuralCalendarSystemId: 'gregorian',
      structuralPeriodFamilyId: GREGORIAN_PERIOD_FAMILY_IDS.day,
      structuralSignificance: 'intermediate',
    })
  })

  it('attaches structural period family metadata to gregorian spans', () => {
    const focusTimeMs = new Date('2026-04-20T12:00:00-04:00').getTime()
    const visibleDurationMs = 18 * 7 * 24 * 60 * 60 * 1000
    const spans = createGregorianStructuralSpans(
      'gregorian',
      4,
      focusTimeMs,
      visibleDurationMs,
      TEST_ENVIRONMENT,
    )

    expect(spans[0]?.structuralMetadata).toMatchObject({
      structuralCalendarSystemId: 'gregorian',
      structuralPeriodFamilyId: GREGORIAN_PERIOD_FAMILY_IDS.week,
      structuralSignificance: 'major',
    })
  })

  it('adds personal day and week counters when the personal layer is active', () => {
    const focusTimeMs = new Date('2026-03-29T12:00:00-04:00').getTime()
    const visibleDurationMs = 8 * 24 * 60 * 60 * 1000
    const points = createGregorianTickPoints({
      activeLayerIds: ['birthday'],
      environment: {
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
      },
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: 2,
      focusTimeMs,
      visibleDurationMs,
    })

    expect(points.some((point) => point.label === 'Week 2293, Day 16051 - W14, Sun 29')).toBe(true)
  })
})
