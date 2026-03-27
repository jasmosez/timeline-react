import { SCALE_LEVEL_CONFIG, getCenteredStartTickDate, getVisibleTimeRange, type ScaleLevel } from './scales'
import { createStructuralSpansForRange, positionTimelinePoint, positionTimelineSpan } from './layout'
import type { TimelineLayer } from './layers'
import type {
  PositionedTimelinePoint,
  PositionedTimelineSpan,
  TimelinePoint,
} from './types'

type TickCollectionParams = {
  scaleLevel: ScaleLevel
  focusTimeMs: number
  timelineScaleLevel: ScaleLevel
  timelineFocusTimeMs: number
  prevScaleLevel?: ScaleLevel
  prevFocusTimeMs?: number
}

const createTickPoint = (tickTime: number): TimelinePoint => ({
  id: `tick-${tickTime}`,
  kind: 'tick',
  timeMs: tickTime,
})

const addPositionedTicksForScaleLevel = (
  points: Map<number, PositionedTimelinePoint>,
  scaleLevel: ScaleLevel,
  baseFocusTimeMs: number,
  timelineScaleLevel: ScaleLevel,
  timelineFocusTimeMs: number,
  fadeOut: boolean,
) => {
  const { calculateTickTimeFunc, startTickDateFunc, screenSpan } = SCALE_LEVEL_CONFIG[scaleLevel]
  const bufferedRange = getVisibleTimeRange(scaleLevel, baseFocusTimeMs)
  const bufferedStartMs = bufferedRange.startTimeMs - screenSpan * 0.5
  const bufferedEndMs = bufferedRange.endTimeMs + screenSpan * 0.5
  let tickTime = startTickDateFunc(new Date(bufferedStartMs)).getTime()

  while (tickTime <= bufferedEndMs) {
    const point = createTickPoint(tickTime)

    points.set(
      tickTime,
      positionTimelinePoint(
        point,
        timelineScaleLevel,
        timelineFocusTimeMs,
        getCenteredStartTickDate(timelineScaleLevel, timelineFocusTimeMs),
        {
        opacity: fadeOut ? 0 : 1,
        },
      ),
    )

    tickTime = calculateTickTimeFunc(new Date(tickTime), 1)
  }
}

export const createGregorianTickPoints = ({
  scaleLevel,
  focusTimeMs,
  timelineScaleLevel,
  timelineFocusTimeMs,
  prevScaleLevel,
  prevFocusTimeMs,
}: TickCollectionParams): PositionedTimelinePoint[] => {
  const points = new Map<number, PositionedTimelinePoint>()

  if (prevScaleLevel !== undefined && prevFocusTimeMs !== undefined && timelineScaleLevel === scaleLevel) {
    addPositionedTicksForScaleLevel(points, prevScaleLevel, prevFocusTimeMs, timelineScaleLevel, timelineFocusTimeMs, true)
  } else if (timelineScaleLevel !== scaleLevel) {
    addPositionedTicksForScaleLevel(points, timelineScaleLevel, timelineFocusTimeMs, timelineScaleLevel, timelineFocusTimeMs, false)
  }

  addPositionedTicksForScaleLevel(points, scaleLevel, focusTimeMs, timelineScaleLevel, timelineFocusTimeMs, false)

  return Array.from(points.values())
}

export const createGregorianStructuralSpans = (
  scaleLevel: ScaleLevel,
  focusTimeMs: number,
): PositionedTimelineSpan[] => {
  const { screenSpan } = SCALE_LEVEL_CONFIG[scaleLevel]
  const bufferedRange = getVisibleTimeRange(scaleLevel, focusTimeMs)
  const bufferedStartMs = bufferedRange.startTimeMs - screenSpan * 0.5
  const bufferedEndMs = bufferedRange.endTimeMs + screenSpan * 0.5

  return createStructuralSpansForRange(scaleLevel, bufferedStartMs, bufferedEndMs).map((span) =>
    positionTimelineSpan(span, scaleLevel, focusTimeMs, { className: 'structural-span' }),
  )
}

export const gregorianLayer: TimelineLayer = {
  id: 'gregorian',
  label: 'Gregorian',
  getPoints: createGregorianTickPoints,
  getSpans: ({ scaleLevel, focusTimeMs }) => createGregorianStructuralSpans(scaleLevel, focusTimeMs),
}
