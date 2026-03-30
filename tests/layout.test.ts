import { createStructuralSpansForRange } from '../src/timeline/layout'

describe('structural spans', () => {
  it('creates contiguous spans across a buffered range', () => {
    const spans = createStructuralSpansForRange(
      0,
      new Date('2026-03-30T12:00:00.000Z').getTime(),
      new Date('2026-03-30T12:03:00.000Z').getTime(),
    )

    expect(spans.length).toBeGreaterThanOrEqual(4)
    expect(spans[0].startTimeMs).toBe(new Date('2026-03-30T12:00:00.000Z').getTime())
    expect(spans[0].endTimeMs).toBe(spans[1].startTimeMs)
    expect(spans[1].endTimeMs).toBe(spans[2].startTimeMs)
  })
})
