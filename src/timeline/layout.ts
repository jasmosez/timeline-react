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
  side?: PositionedTimelineSpan['side']
  labelTheme?: PositionedTimelineSpan['labelTheme']
}

export const positionTimelinePoint = (
  point: TimelinePoint,
  scaleLevel: ScaleLevel,
  focusTimeMs: number,
  visibleDurationMs: number,
  startTickDate: Date,
  presentation: PointPresentation = {},
): PositionedTimelinePoint => ({
  ...point,
  top: getPointPercent(point.timeMs, focusTimeMs, visibleDurationMs),
  label: point.label ?? (point.kind === 'tick' ? getTickLabel(point.timeMs, scaleLevel, startTickDate) : point.label),
  opacity: presentation.opacity,
  className: presentation.className,
  labelClassName: presentation.labelClassName,
})

export const positionTimelineSpan = (
  span: TimelineSpan,
  focusTimeMs: number,
  visibleDurationMs: number,
  presentation: SpanPresentation = {},
): PositionedTimelineSpan => {
  const startTop = Number.parseFloat(getPointPercent(span.startTimeMs, focusTimeMs, visibleDurationMs))
  const endTop = Number.parseFloat(getPointPercent(span.endTimeMs, focusTimeMs, visibleDurationMs))

  return {
    ...span,
    top: `calc(${startTop}% + 1px)`,
    height: `calc(${Math.max(endTop - startTop, 0)}% - 2px)`,
    opacity: presentation.opacity,
    className: presentation.className,
    side: presentation.side,
    labelTheme: presentation.labelTheme,
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
