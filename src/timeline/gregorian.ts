import { SCALE_LEVEL_CONFIG, getVisibleRangeStartTickDate, getVisibleTimeRange, type ScaleLevel } from './scales'
import { createStructuralSpansForRange, positionTimelinePoint, positionTimelineSpan } from './layout'
import type { TimelineLayer } from './layers'
import type {
  PositionedTimelinePoint,
  PositionedTimelineSpan,
  TimelinePoint,
} from './types'

type TickCollectionParams = {
  activeScaleLevel: ScaleLevel
  focusTimeMs: number
  visibleDurationMs: number
}

const createTickPoint = (tickTime: number): TimelinePoint => ({
  id: `tick-${tickTime}`,
  kind: 'tick',
  timeMs: tickTime,
})

const addPositionedTicksForScaleLevel = (
  points: Map<number, PositionedTimelinePoint>,
  scaleLevel: ScaleLevel,
  focusTimeMs: number,
  visibleDurationMs: number,
) => {
  const { calculateTickTimeFunc } = SCALE_LEVEL_CONFIG[scaleLevel]
  const bufferedRange = getVisibleTimeRange(focusTimeMs, visibleDurationMs)
  const bufferedStartMs = bufferedRange.startTimeMs - visibleDurationMs * 0.5
  const bufferedEndMs = bufferedRange.endTimeMs + visibleDurationMs * 0.5
  let tickTime = SCALE_LEVEL_CONFIG[scaleLevel].startTickDateFunc(new Date(bufferedStartMs)).getTime()

  while (tickTime <= bufferedEndMs) {
    const point = createTickPoint(tickTime)

    points.set(
      tickTime,
      positionTimelinePoint(
        point,
        scaleLevel,
        focusTimeMs,
        visibleDurationMs,
        getVisibleRangeStartTickDate(scaleLevel, focusTimeMs, visibleDurationMs),
      ),
    )

    tickTime = calculateTickTimeFunc(new Date(tickTime), 1)
  }
}

export const createGregorianTickPoints = ({
  activeScaleLevel,
  focusTimeMs,
  visibleDurationMs,
}: TickCollectionParams): PositionedTimelinePoint[] => {
  const points = new Map<number, PositionedTimelinePoint>()

  addPositionedTicksForScaleLevel(
    points,
    activeScaleLevel,
    focusTimeMs,
    visibleDurationMs,
  )

  return Array.from(points.values())
}

export const createGregorianStructuralSpans = (
  activeScaleLevel: ScaleLevel,
  focusTimeMs: number,
  visibleDurationMs: number,
): PositionedTimelineSpan[] => {
  const bufferedRange = getVisibleTimeRange(focusTimeMs, visibleDurationMs)
  const bufferedStartMs = bufferedRange.startTimeMs - visibleDurationMs * 0.5
  const bufferedEndMs = bufferedRange.endTimeMs + visibleDurationMs * 0.5

  return createStructuralSpansForRange(activeScaleLevel, bufferedStartMs, bufferedEndMs).map((span) =>
    positionTimelineSpan(span, focusTimeMs, visibleDurationMs, { className: 'structural-span' }),
  )
}

export const gregorianLayer: TimelineLayer = {
  id: 'gregorian',
  label: 'Gregorian',
  role: 'structural',
  getPoints: createGregorianTickPoints,
  getSpans: ({ activeScaleLevel, focusTimeMs, visibleDurationMs }) =>
    createGregorianStructuralSpans(activeScaleLevel, focusTimeMs, visibleDurationMs),
}
