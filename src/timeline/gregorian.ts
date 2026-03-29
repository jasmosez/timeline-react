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
  timelineActiveScaleLevel: ScaleLevel
  timelineFocusTimeMs: number
  timelineVisibleDurationMs: number
  prevActiveScaleLevel?: ScaleLevel
  prevFocusTimeMs?: number
  prevVisibleDurationMs?: number
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
  baseVisibleDurationMs: number,
  timelineActiveScaleLevel: ScaleLevel,
  timelineFocusTimeMs: number,
  timelineVisibleDurationMs: number,
  fadeOut: boolean,
) => {
  const { calculateTickTimeFunc } = SCALE_LEVEL_CONFIG[scaleLevel]
  const bufferedRange = getVisibleTimeRange(baseFocusTimeMs, baseVisibleDurationMs)
  const bufferedStartMs = bufferedRange.startTimeMs - baseVisibleDurationMs * 0.5
  const bufferedEndMs = bufferedRange.endTimeMs + baseVisibleDurationMs * 0.5
  let tickTime = SCALE_LEVEL_CONFIG[scaleLevel].startTickDateFunc(new Date(bufferedStartMs)).getTime()

  while (tickTime <= bufferedEndMs) {
    const point = createTickPoint(tickTime)

    points.set(
      tickTime,
      positionTimelinePoint(
        point,
        timelineActiveScaleLevel,
        timelineFocusTimeMs,
        timelineVisibleDurationMs,
        getVisibleRangeStartTickDate(timelineActiveScaleLevel, timelineFocusTimeMs, timelineVisibleDurationMs),
        {
        opacity: fadeOut ? 0 : 1,
        },
      ),
    )

    tickTime = calculateTickTimeFunc(new Date(tickTime), 1)
  }
}

export const createGregorianTickPoints = ({
  activeScaleLevel,
  focusTimeMs,
  visibleDurationMs,
  timelineActiveScaleLevel,
  timelineFocusTimeMs,
  timelineVisibleDurationMs,
  prevActiveScaleLevel,
  prevFocusTimeMs,
  prevVisibleDurationMs,
}: TickCollectionParams): PositionedTimelinePoint[] => {
  const points = new Map<number, PositionedTimelinePoint>()

  if (
    prevActiveScaleLevel !== undefined &&
    prevFocusTimeMs !== undefined &&
    prevVisibleDurationMs !== undefined &&
    timelineActiveScaleLevel === activeScaleLevel
  ) {
    addPositionedTicksForScaleLevel(
      points,
      prevActiveScaleLevel,
      prevFocusTimeMs,
      prevVisibleDurationMs,
      timelineActiveScaleLevel,
      timelineFocusTimeMs,
      timelineVisibleDurationMs,
      true,
    )
  } else if (timelineActiveScaleLevel !== activeScaleLevel) {
    addPositionedTicksForScaleLevel(
      points,
      timelineActiveScaleLevel,
      timelineFocusTimeMs,
      timelineVisibleDurationMs,
      timelineActiveScaleLevel,
      timelineFocusTimeMs,
      timelineVisibleDurationMs,
      false,
    )
  }

  addPositionedTicksForScaleLevel(
    points,
    activeScaleLevel,
    focusTimeMs,
    visibleDurationMs,
    timelineActiveScaleLevel,
    timelineFocusTimeMs,
    timelineVisibleDurationMs,
    false,
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
  getPoints: createGregorianTickPoints,
  getSpans: ({ activeScaleLevel, focusTimeMs, visibleDurationMs }) =>
    createGregorianStructuralSpans(activeScaleLevel, focusTimeMs, visibleDurationMs),
}
