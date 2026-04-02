import { createGregorianTickPoints, createGregorianStructuralSpans } from '../src/timeline/gregorian'

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
    )

    expect(spans.length).toBeGreaterThan(8)
  })

  it('adds unlabeled quarter ticks in year view', () => {
    const focusTimeMs = new Date('2026-04-20T12:00:00-04:00').getTime()
    const visibleDurationMs = 400 * 24 * 60 * 60 * 1000
    const points = createGregorianTickPoints({
      leadingCalendarSystemId: 'gregorian',
      activeScaleLevel: 5,
      focusTimeMs,
      visibleDurationMs,
    })

    expect(points.some((point) => point.label === '' && point.className?.includes('tick-rank-secondary'))).toBe(true)
    expect(points.some((point) => point.label === '2026, Jan')).toBe(true)
  })
})
