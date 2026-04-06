import {
  createHebrewStructuralPoints,
  createHebrewStructuralSpans,
} from '../src/timeline/hebrew'
import { getDayViewIntradaySpans, getHebrewIntradayDayPoints } from '../src/timeline/hebrewIntraday'
import type { TimelineEnvironment } from '../src/timeline/layers'
import { proportionalHoursLayer } from '../src/timeline/proportionalHours'
import { getHebrewDayInfo, getHebrewWeekdayName } from '../src/timeline/hebrewTime'

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
  it('renders current intraday markers and spans at minute and hour scales without extra subdivision', () => {
    const intradayPoints = getHebrewIntradayDayPoints(
      new Date('2026-04-01T12:00:00-04:00').getTime(),
      25 * 60 * 60 * 1000,
      TEST_ENVIRONMENT,
    )
    const netzTimeMs = intradayPoints.find((point) => (point.label ?? '').startsWith('Netz,'))?.timeMs
    const chatzotTimeMs = intradayPoints.find((point) => (point.label ?? '').startsWith('Chatzot,'))?.timeMs

    expect(netzTimeMs).toBeDefined()
    expect(chatzotTimeMs).toBeDefined()

    const minutePoints = createHebrewStructuralPoints({
      leadingCalendarSystemId: 'hebrew',
      activeScaleLevel: -1,
      focusTimeMs: netzTimeMs!,
      visibleDurationMs: 61 * 1000,
      environment: TEST_ENVIRONMENT,
    })
    const minuteSpans = createHebrewStructuralSpans({
      leadingCalendarSystemId: 'hebrew',
      activeScaleLevel: -1,
      focusTimeMs: netzTimeMs!,
      visibleDurationMs: 61 * 1000,
      environment: TEST_ENVIRONMENT,
    })
    const hourPoints = createHebrewStructuralPoints({
      leadingCalendarSystemId: 'hebrew',
      activeScaleLevel: 0,
      focusTimeMs: chatzotTimeMs!,
      visibleDurationMs: 61 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })
    const hourSpans = createHebrewStructuralSpans({
      leadingCalendarSystemId: 'hebrew',
      activeScaleLevel: 0,
      focusTimeMs: chatzotTimeMs!,
      visibleDurationMs: 61 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })

    expect(minutePoints.some((point) => (point.label ?? '').startsWith('Netz,'))).toBe(true)
    expect(minuteSpans.length).toBeGreaterThan(0)
    expect(hourPoints.some((point) => (point.label ?? '').includes(','))).toBe(true)
    expect(hourPoints.length).toBeGreaterThan(0)
    expect(hourSpans.length).toBeGreaterThan(0)
  })

  it('renders the same intraday markers and spans when hebrew is supporting at minute/hour scales', () => {
    const intradayPoints = getHebrewIntradayDayPoints(
      new Date('2026-04-01T12:00:00-04:00').getTime(),
      25 * 60 * 60 * 1000,
      TEST_ENVIRONMENT,
    )
    const netzTimeMs = intradayPoints.find((point) => (point.label ?? '').startsWith('Netz,'))?.timeMs
    const chatzotTimeMs = intradayPoints.find((point) => (point.label ?? '').startsWith('Chatzot,'))?.timeMs

    expect(netzTimeMs).toBeDefined()
    expect(chatzotTimeMs).toBeDefined()

    const minutePoints = createHebrewStructuralPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: -1,
      focusTimeMs: netzTimeMs!,
      visibleDurationMs: 61 * 1000,
      environment: TEST_ENVIRONMENT,
    })
    const minuteSpans = createHebrewStructuralSpans({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: -1,
      focusTimeMs: netzTimeMs!,
      visibleDurationMs: 61 * 1000,
      environment: TEST_ENVIRONMENT,
    })
    const hourPoints = createHebrewStructuralPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: 0,
      focusTimeMs: chatzotTimeMs!,
      visibleDurationMs: 61 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })
    const hourSpans = createHebrewStructuralSpans({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: 0,
      focusTimeMs: chatzotTimeMs!,
      visibleDurationMs: 61 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })

    expect(minutePoints.some((point) => point.labelClassName?.includes('structural-label-supporting'))).toBe(true)
    expect(minuteSpans.every((span) => span.className?.includes('structural-span-supporting'))).toBe(true)
    expect(hourPoints.some((point) => (point.label ?? '').includes(','))).toBe(true)
    expect(hourSpans.length).toBeGreaterThan(0)

    const sourcePoints = getHebrewIntradayDayPoints(
      new Date('2026-04-01T12:00:00-04:00').getTime(),
      25 * 60 * 60 * 1000,
      TEST_ENVIRONMENT,
    )
    const shkiahSource = sourcePoints.find((point) => point.source === 'shkiah')
    expect(shkiahSource).toBeDefined()
    const shkiahDayInfo = getHebrewDayInfo(new Date(shkiahSource!.timeMs), TEST_ENVIRONMENT)
    const shkiahWeekday = getHebrewWeekdayName(shkiahDayInfo.hdate.getDay())
    const shkiahTime = shkiahSource!.label.split(', ').slice(1).join(', ')
    const supportingDayPoints = createHebrewStructuralPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: 1,
      focusTimeMs: new Date('2026-04-01T12:00:00-04:00').getTime(),
      visibleDurationMs: 25 * 60 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })
    expect(
      supportingDayPoints.some((point) =>
        point.label === `Shkiah, ${shkiahTime} - ${shkiahDayInfo.hebrewDate.day}, ${shkiahWeekday}`,
      ),
    ).toBe(true)
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
    const sourcePoints = getHebrewIntradayDayPoints(
      new Date('2026-04-01T12:00:00-04:00').getTime(),
      25 * 60 * 60 * 1000,
      TEST_ENVIRONMENT,
    )
    const shkiahSource = sourcePoints.find((point) => point.source === 'shkiah')
    expect(shkiahSource).toBeDefined()
    const shkiahDayInfo = getHebrewDayInfo(new Date(shkiahSource!.timeMs), TEST_ENVIRONMENT)
    const shkiahWeekday = getHebrewWeekdayName(shkiahDayInfo.hdate.getDay())
    const shkiahTime = shkiahSource!.label.split(', ').slice(1).join(', ')
    expect(
      points.some((point) =>
        point.label === `${shkiahWeekday} ${shkiahDayInfo.hebrewDate.day} - Shkiah, ${shkiahTime}`
        && point.className?.includes('tick-rank-secondary'),
      ),
    ).toBe(true)
    expect(points.some((point) => (point.label ?? '').startsWith('Tzeit 8.5°,' ) && point.className?.includes('tick-rank-ordinary'))).toBe(true)
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

  it('renders proportional-hour markers only on the dedicated day-scale layer', () => {
    const dayPoints = proportionalHoursLayer.getPoints({
      leadingCalendarSystemId: 'hebrew',
      activeScaleLevel: 1,
      focusTimeMs: new Date('2026-04-01T12:00:00-04:00').getTime(),
      visibleDurationMs: 25 * 60 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })
    const hourPoints = proportionalHoursLayer.getPoints({
      leadingCalendarSystemId: 'hebrew',
      activeScaleLevel: 0,
      focusTimeMs: new Date('2026-04-01T12:00:00-04:00').getTime(),
      visibleDurationMs: 61 * 60 * 1000,
      environment: TEST_ENVIRONMENT,
    })

    expect(dayPoints.length).toBeGreaterThan(0)
    expect(dayPoints.every((point) => point.kind === 'marker')).toBe(true)
    expect(dayPoints.every((point) => point.label === '')).toBe(true)
    expect(dayPoints.every((point) => point.className?.includes('proportional-hours-marker'))).toBe(true)
    expect(dayPoints.every((point) => point.labelClassName?.includes('proportional-hours-marker-label'))).toBe(true)
    expect(proportionalHoursLayer.getSpans()).toEqual([])
    expect(hourPoints).toEqual([])
  })

  it('keeps intraday spans available when the viewport is fully inside a named interval', () => {
    const focusTimeMs = new Date('2026-04-01T12:30:00-04:00').getTime()
    const visibleDurationMs = 61 * 1000
    const spans = getDayViewIntradaySpans(
      focusTimeMs,
      visibleDurationMs,
      TEST_ENVIRONMENT,
    )
    const visibleRange = {
      startTimeMs: focusTimeMs - visibleDurationMs / 2,
      endTimeMs: focusTimeMs + visibleDurationMs / 2,
    }

    expect(spans.length).toBeGreaterThan(0)
    const coveringSpan = spans.find(({ span }) =>
      span.startTimeMs < visibleRange.startTimeMs
      && span.endTimeMs > visibleRange.endTimeMs,
    )

    expect(coveringSpan).toBeDefined()
    expect(coveringSpan?.span.label).toBeTruthy()

    const positionedSpans = createHebrewStructuralSpans({
      leadingCalendarSystemId: 'hebrew',
      activeScaleLevel: 0,
      focusTimeMs,
      visibleDurationMs,
      environment: TEST_ENVIRONMENT,
    })

    expect(
      positionedSpans.some((span) =>
        span.startTimeMs < visibleRange.startTimeMs
        && span.endTimeMs > visibleRange.endTimeMs
        && span.label === coveringSpan?.span.label,
      ),
    ).toBe(true)
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
