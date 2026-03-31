import { SCALE_LEVEL_CONFIG, getVisibleRangeStartTickDate, getVisibleTimeRange, type ScaleLevel } from './scales'
import { createStructuralSpansForRange, positionTimelinePoint, positionTimelineSpan } from './layout'
import type { PrimaryCalendarSystemId, TimelineLayer } from './layers'
import type {
  PositionedTimelinePoint,
  PositionedTimelineSpan,
  TimelinePoint,
} from './types'

type TickCollectionParams = {
  primaryCalendarSystemId: PrimaryCalendarSystemId
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
  primaryCalendarSystemId: PrimaryCalendarSystemId,
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
        {
          labelClassName: primaryCalendarSystemId === 'gregorian'
            ? 'structural-label-primary'
            : 'structural-label-secondary',
        },
      ),
    )

    tickTime = calculateTickTimeFunc(new Date(tickTime), 1)
  }
}

export const createGregorianTickPoints = ({
  primaryCalendarSystemId,
  activeScaleLevel,
  focusTimeMs,
  visibleDurationMs,
}: TickCollectionParams): PositionedTimelinePoint[] => {
  const points = new Map<number, PositionedTimelinePoint>()

  addPositionedTicksForScaleLevel(
    points,
    primaryCalendarSystemId,
    activeScaleLevel,
    focusTimeMs,
    visibleDurationMs,
  )

  return Array.from(points.values())
}

export const createGregorianStructuralSpans = (
  primaryCalendarSystemId: PrimaryCalendarSystemId,
  activeScaleLevel: ScaleLevel,
  focusTimeMs: number,
  visibleDurationMs: number,
): PositionedTimelineSpan[] => {
  const bufferedRange = getVisibleTimeRange(focusTimeMs, visibleDurationMs)
  const bufferedStartMs = bufferedRange.startTimeMs - visibleDurationMs * 0.5
  const bufferedEndMs = bufferedRange.endTimeMs + visibleDurationMs * 0.5

  return createStructuralSpansForRange(activeScaleLevel, bufferedStartMs, bufferedEndMs).map((span) =>
    positionTimelineSpan(span, focusTimeMs, visibleDurationMs, {
      className: primaryCalendarSystemId === 'gregorian'
        ? 'structural-span structural-span-primary'
        : 'structural-span structural-span-secondary',
    }),
  )
}

export const gregorianLayer: TimelineLayer = {
  id: 'gregorian',
  label: 'Gregorian',
  role: 'structural',
  getPoints: createGregorianTickPoints,
  getSpans: ({ primaryCalendarSystemId, activeScaleLevel, focusTimeMs, visibleDurationMs }) =>
    createGregorianStructuralSpans(primaryCalendarSystemId, activeScaleLevel, focusTimeMs, visibleDurationMs),
}
