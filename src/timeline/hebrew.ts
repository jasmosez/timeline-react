import type { PrimaryCalendarSystemId, TimelineLayer } from './layers'
import { createStructuralSpansForRange, positionTimelinePoint, positionTimelineSpan } from './layout'
import { getVisibleRangeStartTickDate, getVisibleTimeRange, SCALE_LEVEL_CONFIG, type ScaleLevel } from './scales'
import type { PositionedTimelinePoint, PositionedTimelineSpan, TimelinePoint, TimelineSpan } from './types'
import { getHebrewDayInfo } from './hebrewTime'

type HebrewLayerParams = {
  primaryCalendarSystemId: PrimaryCalendarSystemId
  activeScaleLevel: ScaleLevel
  focusTimeMs: number
  visibleDurationMs: number
  environment: Parameters<TimelineLayer['getPoints']>[0]['environment']
}

const HEBREW_ENABLED_SCALES: ScaleLevel[] = [1, 2, 3, 5]

const getCivilDateAtNoonUtc = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12))

const getHebrewLabel = (activeScaleLevel: ScaleLevel, dayInfo: ReturnType<typeof getHebrewDayInfo>) => {
  if (activeScaleLevel === 1 || activeScaleLevel === 2) {
    return dayInfo.hebrewDate.label
  }

  if (activeScaleLevel === 3) {
    if (dayInfo.hebrewDate.day === 1) {
      return `${dayInfo.hebrewDate.monthName} ${dayInfo.hebrewDate.year}`
    }

    return String(dayInfo.hebrewDate.day)
  }

  return dayInfo.hebrewDate.day === 1 ? dayInfo.hebrewDate.monthName : undefined
}

const shouldEmitHebrewBoundary = (
  activeScaleLevel: ScaleLevel,
  dayInfo: ReturnType<typeof getHebrewDayInfo>,
) => {
  if (activeScaleLevel === 5) {
    return dayInfo.hebrewDate.day === 1
  }

  return true
}

type HebrewBoundary = {
  timeMs: number
  label: string
}

const collectHebrewBoundaries = (
  activeScaleLevel: ScaleLevel,
  focusTimeMs: number,
  visibleDurationMs: number,
  environment: HebrewLayerParams['environment'],
): HebrewBoundary[] => {
  if (!HEBREW_ENABLED_SCALES.includes(activeScaleLevel)) {
    return []
  }

  const { startTimeMs, endTimeMs } = getVisibleTimeRange(focusTimeMs, visibleDurationMs)
  const bufferedStart = startTimeMs - visibleDurationMs * 0.5
  const bufferedEnd = endTimeMs + visibleDurationMs * 0.5
  const boundaries: HebrewBoundary[] = []

  let civilDate = getCivilDateAtNoonUtc(new Date(bufferedStart))
  civilDate.setUTCDate(civilDate.getUTCDate() - 1)

  while (civilDate.getTime() <= bufferedEnd + 24 * 60 * 60 * 1000) {
    const noonTimestamp = new Date(civilDate)
    const hebrewDayInfo = getHebrewDayInfo(noonTimestamp, environment)
    const boundaryTimeMs = hebrewDayInfo.startsAtSunset.getTime()

    if (
      boundaryTimeMs >= bufferedStart &&
      boundaryTimeMs <= bufferedEnd &&
      shouldEmitHebrewBoundary(activeScaleLevel, hebrewDayInfo)
    ) {
      boundaries.push({
        timeMs: boundaryTimeMs,
        label: getHebrewLabel(activeScaleLevel, hebrewDayInfo) ?? '',
      })
    }

    civilDate.setUTCDate(civilDate.getUTCDate() + 1)
  }

  return boundaries
}

export const createHebrewStructuralPoints = ({
  primaryCalendarSystemId,
  activeScaleLevel,
  focusTimeMs,
  visibleDurationMs,
  environment,
}: HebrewLayerParams): PositionedTimelinePoint[] => {
  const { startTimeMs, endTimeMs } = getVisibleTimeRange(focusTimeMs, visibleDurationMs)
  const bufferedStart = startTimeMs - visibleDurationMs * 0.5
  const bufferedEnd = endTimeMs + visibleDurationMs * 0.5
  const points: PositionedTimelinePoint[] = []
  const boundaries = collectHebrewBoundaries(activeScaleLevel, focusTimeMs, visibleDurationMs, environment)

  boundaries.forEach(({ timeMs, label }) => {
    const point: TimelinePoint = {
      id: `hebrew-${timeMs}`,
      kind: 'tick',
      timeMs,
      label,
    }

    points.push(
      positionTimelinePoint(
        point,
        activeScaleLevel,
        focusTimeMs,
        visibleDurationMs,
        new Date(timeMs),
        {
          className: 'hebrew-tick',
          labelClassName: primaryCalendarSystemId === 'hebrew'
            ? 'hebrew-label structural-label-primary'
            : 'hebrew-label structural-label-secondary',
        },
      ),
    )
  })

  if (activeScaleLevel === 1 && primaryCalendarSystemId === 'hebrew') {
    const { calculateTickTimeFunc } = SCALE_LEVEL_CONFIG[activeScaleLevel]
    let tickTime = getVisibleRangeStartTickDate(activeScaleLevel, focusTimeMs, visibleDurationMs).getTime()

    while (tickTime <= bufferedEnd) {
      if (tickTime >= bufferedStart) {
        const tickDate = new Date(tickTime)
        const hourLabel = tickDate.getMinutes() === 0
          ? tickDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
          : ''

        points.push(
          positionTimelinePoint(
            {
              id: `hebrew-hour-${tickTime}`,
              kind: 'tick',
              timeMs: tickTime,
              label: hourLabel,
            },
            activeScaleLevel,
            focusTimeMs,
            visibleDurationMs,
            new Date(tickTime),
            {
              className: 'hebrew-subtick',
              labelClassName: 'hebrew-label structural-label-primary',
            },
          ),
        )
      }

      tickTime = calculateTickTimeFunc(new Date(tickTime), 1)
    }
  }

  return points
}

export const createHebrewStructuralSpans = ({
  primaryCalendarSystemId,
  activeScaleLevel,
  focusTimeMs,
  visibleDurationMs,
  environment,
}: HebrewLayerParams): PositionedTimelineSpan[] => {
  if (!HEBREW_ENABLED_SCALES.includes(activeScaleLevel)) {
    return []
  }

  if (activeScaleLevel === 1) {
    const { startTimeMs, endTimeMs } = getVisibleTimeRange(focusTimeMs, visibleDurationMs)
    const bufferedStart = startTimeMs - visibleDurationMs * 0.5
    const bufferedEnd = endTimeMs + visibleDurationMs * 0.5

    return createStructuralSpansForRange(activeScaleLevel, bufferedStart, bufferedEnd).map((span) =>
      positionTimelineSpan({
        ...span,
        id: `hebrew-${span.id}`,
      }, focusTimeMs, visibleDurationMs, {
        className: primaryCalendarSystemId === 'hebrew'
          ? 'hebrew-structural-span structural-span structural-span-primary'
          : 'hebrew-structural-span structural-span structural-span-secondary',
      }),
    )
  }

  const boundaries = collectHebrewBoundaries(activeScaleLevel, focusTimeMs, visibleDurationMs, environment)
  const spans: TimelineSpan[] = []

  for (let i = 0; i < boundaries.length - 1; i++) {
    const start = boundaries[i]
    const end = boundaries[i + 1]

    if (end.timeMs <= start.timeMs) {
      continue
    }

    spans.push({
      id: `hebrew-span-${start.timeMs}`,
      kind: 'structural-period',
      startTimeMs: start.timeMs,
      endTimeMs: end.timeMs,
      label: start.label,
    })
  }

  return spans.map((span) =>
    positionTimelineSpan(span, focusTimeMs, visibleDurationMs, {
      className: primaryCalendarSystemId === 'hebrew'
        ? 'hebrew-structural-span structural-span structural-span-primary'
        : 'hebrew-structural-span structural-span structural-span-secondary',
    }),
  )
}

export const hebrewLayer: TimelineLayer = {
  id: 'hebrew',
  label: 'Hebrew',
  role: 'structural',
  getPoints: ({
    primaryCalendarSystemId,
    activeScaleLevel,
    focusTimeMs,
    visibleDurationMs,
    environment,
  }) =>
    createHebrewStructuralPoints({
      primaryCalendarSystemId,
      activeScaleLevel,
      focusTimeMs,
      visibleDurationMs,
      environment,
    }),
  getSpans: ({
    primaryCalendarSystemId,
    activeScaleLevel,
    focusTimeMs,
    visibleDurationMs,
    environment,
  }) =>
    createHebrewStructuralSpans({
      primaryCalendarSystemId,
      activeScaleLevel,
      focusTimeMs,
      visibleDurationMs,
      environment,
    }),
}
