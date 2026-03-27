import { SCALE_CONFIG, getCenteredFirstTickDate, getVisibleTimeRange, type ZoomLevel } from './scales'
import { createStructuralSpansForRange, positionTimelinePoint, positionTimelineSpan } from './layout'
import type { TimelineLayer } from './layers'
import type {
  PositionedTimelinePoint,
  PositionedTimelineSpan,
  TimelinePoint,
} from './types'

type TickCollectionParams = {
  zoom: ZoomLevel
  focusTimeMs: number
  timelineZoom: ZoomLevel
  timelineFocusTimeMs: number
  prevZoom?: ZoomLevel
  prevFocusTimeMs?: number
}

const createTickPoint = (tickTime: number): TimelinePoint => ({
  id: `tick-${tickTime}`,
  kind: 'tick',
  timeMs: tickTime,
})

const addPositionedTicksForZoom = (
  points: Map<number, PositionedTimelinePoint>,
  zoomLevel: ZoomLevel,
  baseFocusTimeMs: number,
  timelineZoom: ZoomLevel,
  timelineFocusTimeMs: number,
  fadeOut: boolean,
) => {
  const { calculateTickTimeFunc, firstTickDateFunc, screenSpan } = SCALE_CONFIG[zoomLevel]
  const bufferedRange = getVisibleTimeRange(zoomLevel, baseFocusTimeMs)
  const bufferedStartMs = bufferedRange.startTimeMs - screenSpan * 0.5
  const bufferedEndMs = bufferedRange.endTimeMs + screenSpan * 0.5
  let tickTime = firstTickDateFunc(new Date(bufferedStartMs)).getTime()

  while (tickTime <= bufferedEndMs) {
    const point = createTickPoint(tickTime)

    points.set(
      tickTime,
      positionTimelinePoint(
        point,
        timelineZoom,
        timelineFocusTimeMs,
        getCenteredFirstTickDate(timelineZoom, timelineFocusTimeMs),
        {
        opacity: fadeOut ? 0 : 1,
        },
      ),
    )

    tickTime = calculateTickTimeFunc(new Date(tickTime), 1)
  }
}

export const createGregorianTickPoints = ({
  zoom,
  focusTimeMs,
  timelineZoom,
  timelineFocusTimeMs,
  prevZoom,
  prevFocusTimeMs,
}: TickCollectionParams): PositionedTimelinePoint[] => {
  const points = new Map<number, PositionedTimelinePoint>()

  if (prevZoom !== undefined && prevFocusTimeMs !== undefined && timelineZoom === zoom) {
    addPositionedTicksForZoom(points, prevZoom, prevFocusTimeMs, timelineZoom, timelineFocusTimeMs, true)
  } else if (timelineZoom !== zoom) {
    addPositionedTicksForZoom(points, timelineZoom, timelineFocusTimeMs, timelineZoom, timelineFocusTimeMs, false)
  }

  addPositionedTicksForZoom(points, zoom, focusTimeMs, timelineZoom, timelineFocusTimeMs, false)

  return Array.from(points.values())
}

export const createGregorianStructuralSpans = (
  zoom: ZoomLevel,
  focusTimeMs: number,
): PositionedTimelineSpan[] => {
  const { screenSpan } = SCALE_CONFIG[zoom]
  const bufferedRange = getVisibleTimeRange(zoom, focusTimeMs)
  const bufferedStartMs = bufferedRange.startTimeMs - screenSpan * 0.5
  const bufferedEndMs = bufferedRange.endTimeMs + screenSpan * 0.5

  return createStructuralSpansForRange(zoom, bufferedStartMs, bufferedEndMs).map((span) =>
    positionTimelineSpan(span, zoom, focusTimeMs, { className: 'structural-span' }),
  )
}

export const gregorianLayer: TimelineLayer = {
  id: 'gregorian',
  label: 'Gregorian',
  getPoints: createGregorianTickPoints,
  getSpans: ({ zoom, focusTimeMs }) => createGregorianStructuralSpans(zoom, focusTimeMs),
}
