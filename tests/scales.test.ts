import {
  getNearestScaleLevel,
  getScaleLevelVisibleDurationMs,
  getVisibleTimeRange,
} from '../src/timeline/scales'

describe('timeline scales', () => {
  it('returns the exact scale level for a preset duration', () => {
    expect(getNearestScaleLevel(getScaleLevelVisibleDurationMs(2))).toBe(2)
    expect(getNearestScaleLevel(getScaleLevelVisibleDurationMs(0))).toBe(0)
  })

  it('calculates the visible time range from focus and duration', () => {
    expect(getVisibleTimeRange(1_000, 200)).toEqual({
      startTimeMs: 900,
      endTimeMs: 1_100,
    })
  })
})
