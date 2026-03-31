import {
  getFirstVisibleTickDate,
  getScaleLevelVisibleDurationMs,
  getVisibleTimeRange,
} from '../src/timeline/scales'
import {
  createInitialViewport,
  getViewportActiveScaleLevel,
  getViewportStartTickDate,
  type Viewport,
} from '../src/viewport'

describe('viewport', () => {
  it('initializes with the starting scale duration', () => {
    const now = new Date('2026-03-30T12:34:56.000Z')
    const viewport = createInitialViewport(now)

    expect(viewport.visibleDurationMs).toBe(getScaleLevelVisibleDurationMs(2))
  })

  it('initializes the starting view at the containing-period boundary', () => {
    const now = new Date('2026-03-30T12:34:56.000Z')
    const viewport = createInitialViewport(now)
    const { startTimeMs } = getVisibleTimeRange(viewport.focusTimeMs, viewport.visibleDurationMs)

    expect(startTimeMs).toBe(new Date('2026-03-28T12:00:00.000-04:00').getTime())
  })

  it('derives the active scale level from visible duration', () => {
    const viewport: Viewport = {
      focusTimeMs: new Date('2026-03-30T12:34:56.000Z').getTime(),
      visibleDurationMs: getScaleLevelVisibleDurationMs(0),
      rangeStrategy: 'centered',
    }

    expect(getViewportActiveScaleLevel(viewport)).toBe(0)
  })

  it('derives the containing-period start tick for the active scale level', () => {
    const viewport: Viewport = {
      focusTimeMs: new Date('2026-03-25T15:30:00.000Z').getTime(),
      visibleDurationMs: getScaleLevelVisibleDurationMs(2),
      rangeStrategy: 'currentContainingPeriod',
    }

    const startTickDate = getViewportStartTickDate(viewport)

    expect(startTickDate.getDay()).toBe(0)
    expect(startTickDate.getHours()).toBe(0)
    expect(startTickDate.getMinutes()).toBe(0)
    expect(startTickDate.getSeconds()).toBe(0)
  })

  it('derives the first visible tick after the visible range start', () => {
    const focusTimeMs = new Date('2026-03-30T12:00:30.000Z').getTime()
    const visibleDurationMs = getScaleLevelVisibleDurationMs(-1)
    const firstVisibleTickDate = getFirstVisibleTickDate(-1, focusTimeMs, visibleDurationMs)

    expect(firstVisibleTickDate.getTime()).toBeGreaterThanOrEqual(focusTimeMs - visibleDurationMs / 2)
    expect(firstVisibleTickDate.getSeconds()).toBe(0)
  })
})
