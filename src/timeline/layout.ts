import { SCALE_CONFIG, getPointPercent, getTickLabel, type ZoomLevel } from './scales'
import type {
  PositionedTimelinePoint,
  PositionedTimelineSpan,
  TimelinePoint,
  TimelineSpan,
} from './types'

type PointPresentation = {
  opacity?: number
  className?: string
  labelClassName?: string
}

type SpanPresentation = {
  opacity?: number
  className?: string
}

export const positionTimelinePoint = (
  point: TimelinePoint,
  zoom: ZoomLevel,
  firstTickDate: Date,
  presentation: PointPresentation = {},
): PositionedTimelinePoint => ({
  ...point,
  top: getPointPercent(point.timeMs, zoom, firstTickDate),
  label: point.label ?? (point.kind === 'tick' ? getTickLabel(point.timeMs, zoom, firstTickDate) : point.label),
  opacity: presentation.opacity,
  className: presentation.className,
  labelClassName: presentation.labelClassName,
})

export const positionTimelineSpan = (
  span: TimelineSpan,
  zoom: ZoomLevel,
  firstTickDate: Date,
  presentation: SpanPresentation = {},
): PositionedTimelineSpan => {
  const startTop = Number.parseFloat(getPointPercent(span.startTimeMs, zoom, firstTickDate))
  const endTop = Number.parseFloat(getPointPercent(span.endTimeMs, zoom, firstTickDate))

  return {
    ...span,
    top: `calc(${startTop}% + 2px)`,
    height: `calc(${Math.max(endTop - startTop, 0)}% - 4px)`,
    opacity: presentation.opacity,
    className: presentation.className,
  }
}

export const createStructuralSpans = (zoom: ZoomLevel, firstTickDate: Date): TimelineSpan[] => {
  const spans: TimelineSpan[] = []
  const { calculateTickTimeFunc, visibleTicks } = SCALE_CONFIG[zoom]

  for (let i = 0; i < visibleTicks - 1; i++) {
    const startTimeMs = calculateTickTimeFunc(firstTickDate, i)
    const endTimeMs = calculateTickTimeFunc(firstTickDate, i + 1)

    spans.push({
      id: `structural-span-${startTimeMs}`,
      kind: 'structural-period',
      startTimeMs,
      endTimeMs,
    })
  }

  return spans
}
