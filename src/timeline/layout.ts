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
  focusTimeMs: number,
  startTickDate: Date,
  presentation: PointPresentation = {},
): PositionedTimelinePoint => ({
  ...point,
  top: getPointPercent(point.timeMs, zoom, focusTimeMs),
  label: point.label ?? (point.kind === 'tick' ? getTickLabel(point.timeMs, zoom, startTickDate) : point.label),
  opacity: presentation.opacity,
  className: presentation.className,
  labelClassName: presentation.labelClassName,
})

export const positionTimelineSpan = (
  span: TimelineSpan,
  zoom: ZoomLevel,
  focusTimeMs: number,
  presentation: SpanPresentation = {},
): PositionedTimelineSpan => {
  const startTop = Number.parseFloat(getPointPercent(span.startTimeMs, zoom, focusTimeMs))
  const endTop = Number.parseFloat(getPointPercent(span.endTimeMs, zoom, focusTimeMs))

  return {
    ...span,
    top: `calc(${startTop}% + 2px)`,
    height: `calc(${Math.max(endTop - startTop, 0)}% - 4px)`,
    opacity: presentation.opacity,
    className: presentation.className,
  }
}

export const createStructuralSpansForRange = (
  zoom: ZoomLevel,
  startTimeMs: number,
  endTimeMs: number,
): TimelineSpan[] => {
  const spans: TimelineSpan[] = []
  const { calculateTickTimeFunc, firstTickDateFunc } = SCALE_CONFIG[zoom]
  let spanStartTimeMs = firstTickDateFunc(new Date(startTimeMs)).getTime()

  while (spanStartTimeMs <= endTimeMs) {
    const spanEndTimeMs = calculateTickTimeFunc(new Date(spanStartTimeMs), 1)

    spans.push({
      id: `structural-span-${spanStartTimeMs}`,
      kind: 'structural-period',
      startTimeMs: spanStartTimeMs,
      endTimeMs: spanEndTimeMs,
    })

    spanStartTimeMs = spanEndTimeMs
  }

  return spans
}
