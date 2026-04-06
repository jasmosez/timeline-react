import { getPromotedSpanLabels } from '../src/components/Timeline'
import type { PositionedTimelineSpan } from '../src/timeline/types'

describe('timeline promoted span labels', () => {
  const visibleTimeRange = {
    startTimeMs: 1_000,
    endTimeMs: 2_000,
  }

  it('promotes one viewport-covering structural span label per side', () => {
    const spans: PositionedTimelineSpan[] = [
      {
        id: 'leading-span',
        kind: 'structural-period',
        startTimeMs: 500,
        endTimeMs: 2_500,
        label: 'Shkiah, 7:20 PM',
        top: '0%',
        height: '100%',
        className: 'timeline structural-span structural-span-leading hebrew-structural-span',
        side: 'leading',
        labelTheme: 'hebrew',
      },
      {
        id: 'supporting-span',
        kind: 'structural-period',
        startTimeMs: 0,
        endTimeMs: 3_000,
        label: 'Tue 3',
        top: '0%',
        height: '100%',
        className: 'timeline structural-span structural-span-supporting',
        side: 'supporting',
        labelTheme: 'default',
      },
      {
        id: 'extra-leading-span',
        kind: 'structural-period',
        startTimeMs: 250,
        endTimeMs: 2_750,
        label: 'Should not appear',
        top: '0%',
        height: '100%',
        className: 'timeline structural-span structural-span-leading',
        side: 'leading',
        labelTheme: 'default',
      },
    ]

    expect(getPromotedSpanLabels(spans, visibleTimeRange)).toEqual([
      {
        id: 'promoted-span-label-leading-span',
        label: '... Shkiah, 7:20 PM',
        className: 'timeline tick-label promoted-span-label structural-label-leading hebrew-label',
      },
      {
        id: 'promoted-span-label-supporting-span',
        label: '... Tue 3',
        className: 'timeline tick-label promoted-span-label structural-label-supporting',
      },
    ])
  })

  it('ignores partial, unlabeled, and non-structural spans', () => {
    const spans: PositionedTimelineSpan[] = [
      {
        id: 'partial-span',
        kind: 'structural-period',
        startTimeMs: 500,
        endTimeMs: 1_500,
        label: 'Partial',
        top: '0%',
        height: '100%',
        className: 'timeline structural-span structural-span-leading',
        side: 'leading',
      },
      {
        id: 'unlabeled-full-span',
        kind: 'structural-period',
        startTimeMs: 0,
        endTimeMs: 3_000,
        top: '0%',
        height: '100%',
        className: 'timeline structural-span structural-span-leading',
        side: 'leading',
      },
      {
        id: 'event-full-span',
        kind: 'event',
        startTimeMs: 0,
        endTimeMs: 3_000,
        label: 'Birthday',
        top: '0%',
        height: '100%',
        className: 'timeline structural-span structural-span-supporting',
        side: 'supporting',
      },
    ]

    expect(getPromotedSpanLabels(spans, visibleTimeRange)).toEqual([])
  })
})
