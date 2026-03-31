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

const DAY_IN_MS = 24 * 60 * 60 * 1000

const getGregorianSpanStripeClass = (scaleLevel: ScaleLevel, startTimeMs: number) => {
  const startDate = new Date(startTimeMs)
  let stripeIndex = 0

  switch (scaleLevel) {
    case -1:
      stripeIndex = Math.floor(startTimeMs / 1000)
      break
    case 0:
      stripeIndex = Math.floor(startTimeMs / (60 * 1000))
      break
    case 1:
    case 2:
      stripeIndex = Math.floor(startTimeMs / (60 * 60 * 1000))
      break
    case 3:
      stripeIndex = Math.floor(Date.UTC(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
      ) / DAY_IN_MS)
      break
    case 4:
    case 5:
      stripeIndex = startDate.getFullYear() * 12 + startDate.getMonth()
      break
    case 6:
      stripeIndex = startDate.getFullYear()
      break
    default:
      stripeIndex = Math.floor(startTimeMs / DAY_IN_MS)
  }

  return stripeIndex % 2 === 0 ? 'structural-span-stripe-a' : 'structural-span-stripe-b'
}

const getGregorianTickRankClass = (scaleLevel: ScaleLevel, tickTime: number) => {
  const tickDate = new Date(tickTime)

  switch (scaleLevel) {
    case -1:
      if (tickDate.getHours() === 0 && tickDate.getMinutes() === 0 && tickDate.getSeconds() === 0) {
        return 'tick-rank-primary'
      }
      if (tickDate.getSeconds() === 0) {
        return 'tick-rank-secondary'
      }
      return 'tick-rank-ordinary'
    case 0:
      if (tickDate.getHours() === 0 && tickDate.getMinutes() === 0) {
        return 'tick-rank-primary'
      }
      if (tickDate.getMinutes() === 0) {
        return 'tick-rank-secondary'
      }
      return 'tick-rank-ordinary'
    case 1:
      if (tickDate.getHours() === 0) {
        return 'tick-rank-primary'
      }
      if (tickDate.getHours() % 6 === 0) {
        return 'tick-rank-secondary'
      }
      return 'tick-rank-ordinary'
    case 2:
    case 3:
      if (tickDate.getDate() === 1) {
        return 'tick-rank-primary'
      }
      if (tickDate.getDay() === 0) {
        return 'tick-rank-secondary'
      }
      return 'tick-rank-ordinary'
    case 4:
      return tickDate.getMonth() % 3 === 0 ? 'tick-rank-primary' : 'tick-rank-ordinary'
    case 5:
      return tickDate.getMonth() % 3 === 0 ? 'tick-rank-primary' : 'tick-rank-ordinary'
    case 6:
      if (tickDate.getFullYear() % 10 === 0) {
        return 'tick-rank-primary'
      }
      if (tickDate.getFullYear() % 5 === 0) {
        return 'tick-rank-secondary'
      }
      return 'tick-rank-ordinary'
    default:
      return 'tick-rank-ordinary'
  }
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
          className: [
            primaryCalendarSystemId === 'gregorian'
              ? 'structural-tick-primary'
              : 'structural-tick-secondary',
            getGregorianTickRankClass(scaleLevel, tickTime),
          ].join(' '),
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
      className: [
        primaryCalendarSystemId === 'gregorian'
          ? 'structural-span structural-span-primary'
          : 'structural-span structural-span-secondary',
        getGregorianSpanStripeClass(activeScaleLevel, span.startTimeMs),
      ].join(' '),
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
