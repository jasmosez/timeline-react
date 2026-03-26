import { ZOOM, type ZoomLevel } from './scales'
import { createStructuralSpans, positionTimelinePoint, positionTimelineSpan } from './layout'
import type {
  PositionedTimelinePoint,
  PositionedTimelineSpan,
  TimelinePoint,
} from './types'

type TickCollectionParams = {
  zoom: ZoomLevel
  firstTickDate: Date
  timelineZoom: ZoomLevel
  timelineFirstTickDate: Date
  prevZoom?: ZoomLevel
  prevFirstTickDate?: Date
}

const createTickPoint = (tickTime: number): TimelinePoint => ({
  id: `tick-${tickTime}`,
  kind: 'tick',
  timeMs: tickTime,
})

const addPositionedTicksForZoom = (
  points: Map<number, PositionedTimelinePoint>,
  zoomLevel: ZoomLevel,
  baseDate: Date,
  timelineZoom: ZoomLevel,
  timelineFirstTickDate: Date,
  fadeOut: boolean,
) => {
  const { calculateTickTimeFunc, visibleTicks } = ZOOM[zoomLevel]

  for (let i = 0; i < visibleTicks; i++) {
    const tickTime = calculateTickTimeFunc(baseDate, i)
    const point = createTickPoint(tickTime)

    points.set(
      tickTime,
      positionTimelinePoint(point, timelineZoom, timelineFirstTickDate, {
        opacity: fadeOut ? 0 : 1,
      }),
    )
  }
}

export const createGregorianTickPoints = ({
  zoom,
  firstTickDate,
  timelineZoom,
  timelineFirstTickDate,
  prevZoom,
  prevFirstTickDate,
}: TickCollectionParams): PositionedTimelinePoint[] => {
  const points = new Map<number, PositionedTimelinePoint>()

  if (prevZoom !== undefined && prevFirstTickDate !== undefined && timelineZoom === zoom) {
    addPositionedTicksForZoom(points, prevZoom, prevFirstTickDate, timelineZoom, timelineFirstTickDate, true)
  } else if (timelineZoom !== zoom) {
    addPositionedTicksForZoom(points, timelineZoom, timelineFirstTickDate, timelineZoom, timelineFirstTickDate, false)
  }

  addPositionedTicksForZoom(points, zoom, firstTickDate, timelineZoom, timelineFirstTickDate, false)

  return Array.from(points.values())
}

export const createGregorianStructuralSpans = (
  zoom: ZoomLevel,
  firstTickDate: Date,
): PositionedTimelineSpan[] =>
  createStructuralSpans(zoom, firstTickDate).map((span) =>
    positionTimelineSpan(span, zoom, firstTickDate, { className: 'structural-span' }),
  )
