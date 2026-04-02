import { SCALE_LEVEL_CONFIG, getVisibleRangeStartTickDate, getVisibleTimeRange, type ScaleLevel } from './scales'
import { createStructuralSpansForRange, positionTimelinePoint, positionTimelineSpan } from './layout'
import type { LeadingCalendarSystemId, TimelineLayer } from './layers'
import { getGregorianQuarterBoundaryLabel, getGregorianStructuralTickLabel } from './gregorianLabels'
import type {
  PositionedTimelinePoint,
  PositionedTimelineSpan,
  TimelinePoint,
} from './types'

type TickCollectionParams = {
  leadingCalendarSystemId: LeadingCalendarSystemId
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
      stripeIndex = Math.floor(startTimeMs / (60 * 60 * 1000))
      break
    case 2:
    case 3:
      stripeIndex = Math.floor(Date.UTC(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
      ) / DAY_IN_MS)
      break
    case 4:
      stripeIndex = Math.floor(Date.UTC(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
      ) / (7 * DAY_IN_MS))
      break
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
      return 'tick-rank-ordinary'
    case 5:
      return tickDate.getMonth() === 0 ? 'tick-rank-primary' : 'tick-rank-ordinary'
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

const addMonths = (date: Date, months: number) => {
  const nextDate = new Date(date)
  nextDate.setMonth(nextDate.getMonth() + months)
  return nextDate.getTime()
}

const startOfMonth = (date: Date) => {
  const nextDate = new Date(date)
  nextDate.setHours(0, 0, 0, 0)
  nextDate.setDate(1)
  return nextDate
}

const addPositionedTicksForScaleLevel = (
  points: Map<number, PositionedTimelinePoint>,
  leadingCalendarSystemId: LeadingCalendarSystemId,
  scaleLevel: ScaleLevel,
  focusTimeMs: number,
  visibleDurationMs: number,
) => {
  const { calculateTickTimeFunc } = SCALE_LEVEL_CONFIG[scaleLevel]
  const bufferedRange = getVisibleTimeRange(focusTimeMs, visibleDurationMs)
  const bufferedStartMs = bufferedRange.startTimeMs - visibleDurationMs * 0.5
  const bufferedEndMs = bufferedRange.endTimeMs + visibleDurationMs * 0.5
  const visibleRangeStartTickDate = getVisibleRangeStartTickDate(scaleLevel, focusTimeMs, visibleDurationMs)
  let tickTime = SCALE_LEVEL_CONFIG[scaleLevel].startTickDateFunc(new Date(bufferedStartMs)).getTime()

  while (tickTime <= bufferedEndMs) {
    const point = {
      ...createTickPoint(tickTime),
      label: getGregorianStructuralTickLabel(
        scaleLevel,
        tickTime,
        tickTime === visibleRangeStartTickDate.getTime(),
        leadingCalendarSystemId === 'gregorian',
      ),
    }

    points.set(
      tickTime,
      positionTimelinePoint(
        point,
        scaleLevel,
        focusTimeMs,
        visibleDurationMs,
        visibleRangeStartTickDate,
        {
          className: [
            leadingCalendarSystemId === 'gregorian'
              ? 'structural-tick-leading'
              : 'structural-tick-supporting',
            getGregorianTickRankClass(scaleLevel, tickTime),
          ].join(' '),
          labelClassName: leadingCalendarSystemId === 'gregorian'
            ? 'structural-label-leading'
            : 'structural-label-supporting',
        },
      ),
    )

    tickTime = calculateTickTimeFunc(new Date(tickTime), 1)
  }
}

const addQuarterBoundaryTicks = (
  points: Map<number, PositionedTimelinePoint>,
  leadingCalendarSystemId: LeadingCalendarSystemId,
  focusTimeMs: number,
  visibleDurationMs: number,
) => {
  const bufferedRange = getVisibleTimeRange(focusTimeMs, visibleDurationMs)
  const bufferedStartMs = bufferedRange.startTimeMs - visibleDurationMs * 0.5
  const bufferedEndMs = bufferedRange.endTimeMs + visibleDurationMs * 0.5
  let tickTime = startOfMonth(new Date(bufferedStartMs)).getTime()

  while (tickTime <= bufferedEndMs) {
    const tickDate = new Date(tickTime)
    const isQuarterStart = tickDate.getMonth() % 3 === 0
    const point: TimelinePoint = {
      id: `quarter-boundary-${tickTime}`,
      kind: 'tick',
      timeMs: tickTime,
      label: getGregorianQuarterBoundaryLabel(tickTime, leadingCalendarSystemId === 'gregorian'),
    }

    points.set(
      tickTime,
      positionTimelinePoint(
        point,
        4,
        focusTimeMs,
        visibleDurationMs,
        getVisibleRangeStartTickDate(4, focusTimeMs, visibleDurationMs),
        {
          className: [
            leadingCalendarSystemId === 'gregorian'
              ? 'structural-tick-leading'
              : 'structural-tick-supporting',
            isQuarterStart ? 'tick-rank-primary' : 'tick-rank-secondary',
          ].join(' '),
          labelClassName: leadingCalendarSystemId === 'gregorian'
            ? 'structural-label-leading'
            : 'structural-label-supporting',
        },
      ),
    )

    tickTime = addMonths(tickDate, 1)
  }
}

const addYearQuarterBoundaryTicks = (
  points: Map<number, PositionedTimelinePoint>,
  leadingCalendarSystemId: LeadingCalendarSystemId,
  focusTimeMs: number,
  visibleDurationMs: number,
) => {
  const bufferedRange = getVisibleTimeRange(focusTimeMs, visibleDurationMs)
  const bufferedStartMs = bufferedRange.startTimeMs - visibleDurationMs * 0.5
  const bufferedEndMs = bufferedRange.endTimeMs + visibleDurationMs * 0.5
  let tickTime = startOfMonth(new Date(bufferedStartMs)).getTime()

  while (tickTime <= bufferedEndMs) {
    const tickDate = new Date(tickTime)
    const isQuarterStart = tickDate.getMonth() % 3 === 0
    const isYearStart = tickDate.getMonth() === 0

    if (isQuarterStart && !isYearStart) {
      const point: TimelinePoint = {
        id: `year-quarter-boundary-${tickTime}`,
        kind: 'tick',
        timeMs: tickTime,
        label: '',
      }

      points.set(
        tickTime + 1,
        positionTimelinePoint(
          point,
          5,
          focusTimeMs,
          visibleDurationMs,
          getVisibleRangeStartTickDate(5, focusTimeMs, visibleDurationMs),
          {
            className: [
              leadingCalendarSystemId === 'gregorian'
                ? 'structural-tick-leading'
                : 'structural-tick-supporting',
              'tick-rank-secondary',
            ].join(' '),
            labelClassName: leadingCalendarSystemId === 'gregorian'
              ? 'structural-label-leading'
              : 'structural-label-supporting',
          },
        ),
      )
    }

    tickTime = addMonths(tickDate, 1)
  }
}

export const createGregorianTickPoints = ({
  leadingCalendarSystemId,
  activeScaleLevel,
  focusTimeMs,
  visibleDurationMs,
}: TickCollectionParams): PositionedTimelinePoint[] => {
  const points = new Map<number, PositionedTimelinePoint>()

  addPositionedTicksForScaleLevel(
    points,
    leadingCalendarSystemId,
    activeScaleLevel,
    focusTimeMs,
    visibleDurationMs,
  )

  if (activeScaleLevel === 4) {
    addQuarterBoundaryTicks(points, leadingCalendarSystemId, focusTimeMs, visibleDurationMs)
  }

  if (activeScaleLevel === 5) {
    addYearQuarterBoundaryTicks(points, leadingCalendarSystemId, focusTimeMs, visibleDurationMs)
  }

  return Array.from(points.values())
}

export const createGregorianStructuralSpans = (
  leadingCalendarSystemId: LeadingCalendarSystemId,
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
        leadingCalendarSystemId === 'gregorian'
          ? 'structural-span structural-span-leading'
          : 'structural-span structural-span-supporting',
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
  getSpans: ({ leadingCalendarSystemId, activeScaleLevel, focusTimeMs, visibleDurationMs }) =>
    createGregorianStructuralSpans(leadingCalendarSystemId, activeScaleLevel, focusTimeMs, visibleDurationMs),
}
