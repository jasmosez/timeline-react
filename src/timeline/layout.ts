import { SCALE_LEVEL_CONFIG, getPointPercent, getTickLabel, type ScaleLevel } from './scales'
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
  scaleLevel: ScaleLevel,
  focusTimeMs: number,
  startTickDate: Date,
  presentation: PointPresentation = {},
): PositionedTimelinePoint => ({
  ...point,
  top: getPointPercent(point.timeMs, scaleLevel, focusTimeMs),
  label: point.label ?? (point.kind === 'tick' ? getTickLabel(point.timeMs, scaleLevel, startTickDate) : point.label),
  opacity: presentation.opacity,
  className: presentation.className,
  labelClassName: presentation.labelClassName,
})

export const positionTimelineSpan = (
  span: TimelineSpan,
  scaleLevel: ScaleLevel,
  focusTimeMs: number,
  presentation: SpanPresentation = {},
): PositionedTimelineSpan => {
  const startTop = Number.parseFloat(getPointPercent(span.startTimeMs, scaleLevel, focusTimeMs))
  const endTop = Number.parseFloat(getPointPercent(span.endTimeMs, scaleLevel, focusTimeMs))

  return {
    ...span,
    top: `calc(${startTop}% + 2px)`,
    height: `calc(${Math.max(endTop - startTop, 0)}% - 4px)`,
    opacity: presentation.opacity,
    className: presentation.className,
  }
}

export const createStructuralSpansForRange = (
  scaleLevel: ScaleLevel,
  startTimeMs: number,
  endTimeMs: number,
): TimelineSpan[] => {
  const spans: TimelineSpan[] = []
  const { calculateTickTimeFunc, startTickDateFunc } = SCALE_LEVEL_CONFIG[scaleLevel]
  let spanStartTimeMs = startTickDateFunc(new Date(startTimeMs)).getTime()

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
